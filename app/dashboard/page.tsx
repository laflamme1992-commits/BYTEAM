'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Sidebar } from '@/components/ui/Sidebar';
import { Users, Trophy, Calendar, Target, Plus } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  game: string;
  region: string;
}

interface Player {
  id: string;
  name: string;
  role: string;
  elo: number;
  status: string;
}

export default function DashboardPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: teamData } = await supabase
        .from('teams')
        .select('*')
        .eq('captain_id', user.id)
        .single();

      if (teamData) {
        setTeam(teamData);
        const { data: playersData } = await supabase
          .from('players')
          .select('*')
          .eq('team_id', teamData.id);
        if (playersData) setPlayers(playersData);
      }

      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  const averageElo = players.length > 0
    ? Math.round(players.reduce((sum, p) => sum + p.elo, 0) / players.length)
    : 0;

  const onlinePlayers = players.filter(p => p.status === 'онлайн').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
        <GlassCard className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">У вас пока нет команды</h2>
          <p className="text-gray-400 mb-6">Создайте свою первую команду и начните управлять составом!</p>
          <Button onClick={() => router.push('/team/create')}>Создать команду</Button>
        </GlassCard>
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
              <h1 className="text-3xl font-bold text-white">Панель управления</h1>
              <p className="text-gray-400">Управляй своей командой</p>
            </div>
            <Button 
              onClick={() => router.push('/players/add')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить игрока
            </Button>
          </div>

          <GlassCard className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{team.name}</h2>
                <div className="flex items-center gap-3 mt-1 text-gray-400">
                  <span>{team.game}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span>{team.region}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-600" />
                  <span className="text-green-400">● {onlinePlayers} онлайн</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Средний Elo</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {averageElo || '—'}
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-xs text-gray-500">Игроков</p>
                  <p className="text-2xl font-bold text-white">{players.length}</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-xs text-gray-500">Турниров</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-xs text-gray-500">Тренировок</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-xs text-gray-500">Задач</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
            </GlassCard>
          </div>

          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Состав команды
              </h3>
              <span className="text-xs text-gray-500">{players.length} игроков</span>
            </div>
            
            {players.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
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
                            onClick={async () => {
                              if (confirm(`Удалить игрока ${player.name}?`)) {
                                await supabase.from('players').delete().eq('id', player.id);
                                setPlayers(players.filter(p => p.id !== player.id));
                              }
                            }}
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