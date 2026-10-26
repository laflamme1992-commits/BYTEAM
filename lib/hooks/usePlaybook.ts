"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  localSnapshot,
  serverSnapshot,
  subscribeLocal,
  persistLocal,
} from "@/lib/playbook/storage";
import {
  parseEntry,
  MAX_ENTRIES,
  type PlaybookEntry,
} from "@/lib/playbook/model";
type Row = {
  id: string;
  data: unknown;
  created_at: string;
  updated_at: string;
};
function fromRow(row: Row) {
  const data = row.data && typeof row.data === "object" ? row.data : {};
  return parseEntry({
    ...data,
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}
export function usePlaybook() {
  const local = useSyncExternalStore(
    subscribeLocal,
    localSnapshot,
    serverSnapshot,
  );
  const [source, setSource] = useState<"local" | "team">("local");
  const [remote, setRemote] = useState<PlaybookEntry[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [remoteReady, setRemoteReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    async function load() {
      try {
        const client = createClient();
        const {
          data: { user },
          error: authError,
        } = await client.auth.getUser();
        if (authError) throw authError;
        if (!user) return;
        const { data: team, error: teamError } = await client
          .from("teams")
          .select("id")
          .eq("captain_id", user.id)
          .maybeSingle();
        if (teamError) throw teamError;
        if (!team) return;
        const { data, error: queryError } = await client
          .from("playbook_entries")
          .select("id,data,created_at,updated_at")
          .eq("team_id", team.id)
          .order("updated_at", { ascending: false })
          .limit(MAX_ENTRIES);
        if (queryError) throw queryError;
        if (!active) return;
        const entries = (data as Row[]).map(fromRow);
        if (entries.some((e) => !e)) throw new Error();
        setRemote(entries as PlaybookEntry[]);
        setTeamId(team.id);
        setRemoteReady(true);
        setError("");
      } catch {
        if (active)
          setError(
            "Командное хранилище пока недоступно. Локальный плейбук продолжает работать.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [revision]);
  const entries = source === "local" ? local : remote;
  async function save(entry: PlaybookEntry, original?: string) {
    const validated = parseEntry({
      ...entry,
      updatedAt: new Date().toISOString(),
    });
    if (!validated)
      throw new Error("Проверьте название, карту, роли и ссылки записи.");
    if (source === "local") {
      const current = localSnapshot();
      const previous = current.find((e) => e.id === entry.id);
      if (original && (!previous || previous.updatedAt !== original))
        throw new Error(
          "Запись уже изменилась в другой вкладке. Закройте редактор и откройте актуальную версию.",
        );
      persistLocal([validated, ...current.filter((e) => e.id !== entry.id)]);
      return validated;
    }
    if (!teamId || !remoteReady)
      throw new Error("Командное хранилище не подключено.");
    const client = createClient();
    const query = original
      ? client
          .from("playbook_entries")
          .update({ data: validated })
          .eq("id", entry.id)
          .eq("team_id", teamId)
          .eq("updated_at", original)
      : client
          .from("playbook_entries")
          .insert({ id: entry.id, team_id: teamId, data: validated });
    const { data, error } = await query
      .select("id,data,created_at,updated_at")
      .single();
    if (error)
      throw new Error(
        original
          ? "Не удалось сохранить. Возможно, запись уже изменена — обновите плейбук."
          : "Не удалось сохранить в командный плейбук.",
      );
    const result = fromRow(data);
    if (!result) throw new Error("Сервер вернул некорректную запись.");
    setRemote((prev) => [result, ...prev.filter((e) => e.id !== entry.id)]);
    return result;
  }
  async function remove(entry: PlaybookEntry) {
    if (source === "local") {
      const current = localSnapshot();
      const latest = current.find((e) => e.id === entry.id);
      if (latest && latest.updatedAt !== entry.updatedAt)
        throw new Error(
          "Запись уже изменена. Откройте актуальную версию перед удалением.",
        );
      persistLocal(current.filter((e) => e.id !== entry.id));
      return;
    }
    if (!teamId) throw new Error("Команда недоступна.");
    const { data, error } = await createClient()
      .from("playbook_entries")
      .delete()
      .eq("id", entry.id)
      .eq("team_id", teamId)
      .eq("updated_at", entry.updatedAt)
      .select("id");
    if (error || !data?.length)
      throw new Error(
        "Не удалось удалить. Обновите плейбук и попробуйте снова.",
      );
    setRemote((prev) => prev.filter((e) => e.id !== entry.id));
  }
  function importLocal(imported: PlaybookEntry[]) {
    if (source !== "local")
      throw new Error(
        "Импорт доступен в локальный плейбук. Записи можно затем копировать в командный.",
      );
    persistLocal([...imported, ...localSnapshot()]);
  }
  async function copyToTeam(entry: PlaybookEntry) {
    if (!teamId || !remoteReady)
      throw new Error("Командное хранилище недоступно.");
    const now = new Date().toISOString();
    const copy = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    const { data, error } = await createClient()
      .from("playbook_entries")
      .insert({ id: copy.id, team_id: teamId, data: copy })
      .select("id,data,created_at,updated_at")
      .single();
    if (error) throw new Error("Не удалось скопировать запись в команду.");
    const result = fromRow(data);
    if (!result) throw new Error("Некорректный ответ сервера.");
    setRemote((prev) => [result, ...prev]);
  }
  return {
    entries,
    source,
    setSource,
    save,
    remove,
    importLocal,
    copyToTeam,
    remoteReady,
    loading,
    error,
    reload: () => {
      setLoading(true);
      setRevision((v) => v + 1);
    },
  };
}
