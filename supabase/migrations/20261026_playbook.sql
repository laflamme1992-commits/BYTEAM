-- Requires public.teams(id uuid, captain_id uuid). Verify the existing schema
-- before applying. Run through your Supabase migration workflow.
-- Team player records currently have no verified auth membership relation.
-- Therefore shared storage is intentionally restricted to the captain.
begin;
create table public.playbook_entries (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) <= 131072),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index playbook_entries_team_updated_idx on public.playbook_entries(team_id, updated_at desc);
alter table public.playbook_entries enable row level security;
create policy playbook_captain_select on public.playbook_entries for select to authenticated
using (exists (select 1 from public.teams t where t.id = playbook_entries.team_id and t.captain_id = (select auth.uid())));
create policy playbook_captain_insert on public.playbook_entries for insert to authenticated
with check (exists (select 1 from public.teams t where t.id = playbook_entries.team_id and t.captain_id = (select auth.uid())));
create policy playbook_captain_update on public.playbook_entries for update to authenticated
using (exists (select 1 from public.teams t where t.id = playbook_entries.team_id and t.captain_id = (select auth.uid())))
with check (exists (select 1 from public.teams t where t.id = playbook_entries.team_id and t.captain_id = (select auth.uid())));
create policy playbook_captain_delete on public.playbook_entries for delete to authenticated
using (exists (select 1 from public.teams t where t.id = playbook_entries.team_id and t.captain_id = (select auth.uid())));
create function public.set_playbook_updated_at() returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = clock_timestamp();
  new.created_at = old.created_at;
  return new;
end;
$$;
create trigger playbook_updated_at before update on public.playbook_entries for each row execute function public.set_playbook_updated_at();
-- Do not allow a captain to move entries between teams by changing team_id.
revoke all on public.playbook_entries from anon, authenticated;
grant select, insert, delete on public.playbook_entries to authenticated;
grant update (data) on public.playbook_entries to authenticated;
commit;
