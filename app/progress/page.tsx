'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Target, Trophy, Medal, TrendingUp, Clock, Award, CheckCircle, Lock } from 'lucide-react';

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

export default function ProgressPage() {
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

  const goal = 2500;
  const current = averageElo;
  const progress = goal > 0 ? Math.min(Math.round((current / goal) * 100), 100) : 0;

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

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex">
        <Sidebar />
        <main className="flex-1 ml-56 p-8 flex items-center justify-center">
          <GlassCard className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">Создайте команду</h2>
            <p className="text-gray-400 mb-6">Чтобы видеть прогресс, сначала создайте команду</p>
            <Button onClick={() => router.push('/team/create')}>Создать команду</Button>
          </GlassCard>
        </main>
      </div>
    );
  }

  const achievements = [
    { icon: '🏆', title: 'Первая победа', desc: 'Выиграйте первый матч', unlocked: true },
    { icon: '🎯', title: 'Точный стрелок', desc: '30+ фрагов в матче', unlocked: true },
    { icon: '👑', title: 'Лидер', desc: 'Станьте капитаном команды', unlocked: true },
    { icon: '💪', title: 'Команда мечты', desc: 'Соберите 5 игроков', unlocked: players.length >= 5 },
    { icon: '🏅', title: 'Турнирный боец', desc: 'Участвуйте в 10 турнирах', unlocked: false },
    { icon: '⭐', title: 'Звездный игрок', desc: 'Достигните 2500 Elo', unlocked: current >= 2500 },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e17] flex">
      <Sidebar />
      
      <main className="flex-1 ml-56 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Прогресс</h1>
            <p className="text-gray-400">Отслеживай цели и достижения команды</p>
          </div>

          <GlassCard className="mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm text-gray-400">Главная цель команды</h2>
                <p className="text-2xl font-bold text-white mt-1">{goal} Средний Elo</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Прогресс</p>
                <p className="text-2xl font-bold text-blue-400">{progress}%</p>
              </div>
            </div>
            <div className="mt-4 w-full h-3 bg-[#1a2332] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>Сейчас: {current || 0}</span>
              <span>Цель: {goal}</span>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <GlassCard className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-xs text-gray-500">Побед</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Medal className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-white">8</p>
              <p className="text-xs text-gray-500">Турниров</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-white">+156</p>
              <p className="text-xs text-gray-500">Прирост Elo</p>
            </GlassCard>
            <GlassCard className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-white">23</p>
              <p className="text-xs text-gray-500">Матчей</p>
            </GlassCard>
          </div>

          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Достижения
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((ach, index) => (
              <GlassCard
                key={index}
                className={`p-6 text-center transition-all ${
                  ach.unlocked
                    ? 'border-yellow-500/30 hover:border-yellow-400/50'
                    : 'opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{ach.icon}</div>
                <h3 className="text-white font-medium">{ach.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{ach.desc}</p>
                {ach.unlocked ? (
                  <span className="inline-block mt-3 text-xs text-green-400">✅ Получено</span>
                ) : (
                  <span className="inline-block mt-3 text-xs text-gray-500">🔒 Заблокировано</span>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}