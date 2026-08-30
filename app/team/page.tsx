'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Users, UserPlus } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  role: string;
  elo: number;
  status: string;
}

export default function TeamPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchTeam = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('captain_id', user.id)
        .single();

      if (team) {
        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .eq('team_id', team.id);
        if (playersData) setPlayers(playersData);
      }
      setLoading(false);
    };

    fetchTeam();
  }, [supabase, router]);

  const deletePlayer = async (id: string, name: string) => {
    if (confirm(`Удалить игрока ${name}?`)) {
      await supabase.from('players').delete().eq('id', id);
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex">
        <Sidebar />
        <main className="flex-1 ml-56 p-8">
          <div className="text-white">Загрузка...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] flex">
      <Sidebar />
      
      <main className="flex-1 ml-56 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Команда</h1>
              <p className="text-gray-400">Управление составом</p>
            </div>
            <Button 
              onClick={() => router.push('/players/add')}
              className="gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Добавить игрока
            </Button>
          </div>

          <GlassCard>
            {players.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>В команде пока нет игроков</p>
                <Button 
                  variant="outline" 
                  className="mt-3"
                  onClick={() => router.push('/players/add')}
                >
                  Добавить первого игрока
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto -m-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Имя</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Роль</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Elo</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Статус</th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.map((player) => (
                      <tr key={player.id} className="border-b border-white/5 hover:bg-white/5 transition-all">
                        <td className="px-6 py-4 text-white font-medium">{player.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400">
                            {player.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white">{player.elo}</td>
                        <td className="px-6 py-4">
                          <span className={`text-xs ${player.status === 'онлайн' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {player.status === 'онлайн' ? '🟢 Онлайн' : '🟡 Отошел'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => deletePlayer(player.id, player.name)}
                            className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                          >
                            Удалить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>
        </div>
      </main>
    </div>
  );
}