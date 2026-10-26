"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function useTeamData<T>(table: "tasks" | "events") {
  const [items, setItems] = useState<T[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState(
    isSupabaseConfigured
      ? ""
      : "Данные команды недоступны. Подключите Supabase, чтобы сохранять изменения.",
  );
  const [revision, setRevision] = useState(0);
  const router = useRouter();
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    async function fetchData() {
      try {
        const client = createClient();
        const {
          data: { user },
          error: authError,
        } = await client.auth.getUser();
        if (!active) return;
        if (authError) throw authError;
        if (!user) {
          router.replace("/login");
          return;
        }
        const { data: team, error: teamError } = await client
          .from("teams")
          .select("id")
          .eq("captain_id", user.id)
          .maybeSingle();
        if (!active) return;
        if (teamError) throw teamError;
        if (!team) {
          setError("Сначала создайте команду в разделе «Команда».");
          return;
        }
        const { data, error: queryError } = await client
          .from(table)
          .select("*")
          .eq("team_id", team.id)
          .order("created_at", { ascending: false });
        if (!active) return;
        if (queryError) throw queryError;
        setTeamId(team.id);
        setItems((data ?? []) as T[]);
        setError("");
      } catch {
        if (active)
          setError(
            "Не удалось загрузить данные команды. Проверьте подключение и попробуйте снова.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchData();
    return () => {
      active = false;
    };
  }, [router, table, revision]);
  const reload = () => {
    if (isSupabaseConfigured) {
      setLoading(true);
      setRevision((prev) => prev + 1);
    }
  };
  return { items, setItems, teamId, loading, error, setError, reload };
}
