"use client";

import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ConnectionRequired } from "@/components/workspace/ConnectionRequired";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function CreateTeamPage() {
  return isSupabaseConfigured ? (
    <CreateTeamPageConnected />
  ) : (
    <ConnectionRequired />
  );
}

function CreateTeamPageConnected() {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Россия");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      alert("Вы не авторизованы!");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("teams").insert([
      {
        name,
        game: "CS2",
        region: country,
        captain_id: user.id,
      },
    ]);

    if (error) {
      alert("Ошибка: " + error.message);
    } else {
      alert("Команда создана! 🎉");
      router.push("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0d12] flex items-center justify-center px-4">
      <div className="bg-[#141821] border border-[#2b3140] rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Создать команду
        </h1>
        <p className="text-sm text-gray-400 text-center mb-6">
          Игра: Counter-Strike 2
        </p>

        <form onSubmit={handleCreateTeam} className="space-y-4">
          <input
            type="text"
            placeholder="Название команды"
            className="w-full bg-[#0b0d12] border border-[#2b3140] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <select
            className="w-full bg-[#0b0d12] border border-[#2b3140] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500/50"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          >
            <option value="Россия">🇷🇺 Россия</option>
            <option value="Беларусь">🇧🇾 Беларусь</option>
            <option value="Украина">🇺🇦 Украина</option>
            <option value="Казахстан">🇰🇿 Казахстан</option>
            <option value="Армения">🇦🇲 Армения</option>
            <option value="Азербайджан">🇦🇿 Азербайджан</option>
            <option value="Грузия">🇬🇪 Грузия</option>
            <option value="Молдова">🇲🇩 Молдова</option>
            <option value="Узбекистан">🇺🇿 Узбекистан</option>
            <option value="Кыргызстан">🇰🇬 Кыргызстан</option>
            <option value="Таджикистан">🇹🇯 Таджикистан</option>
            <option value="Туркменистан">🇹🇲 Туркменистан</option>
            <option value="Латвия">🇱🇻 Латвия</option>
            <option value="Литва">🇱🇹 Литва</option>
            <option value="Эстония">🇪🇪 Эстония</option>
            <option value="Германия">🇩🇪 Германия</option>
            <option value="Другая">🌍 Другая</option>
          </select>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Создание..." : "Создать команду"}
          </Button>
        </form>
      </div>
    </div>
  );
}
