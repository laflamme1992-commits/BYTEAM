'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function AddPlayerPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Рифлер');
  const [elo, setElo] = useState(1000);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchTeam = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data } = await supabase
        .from('teams')
        .select('id')
        .eq('captain_id', user.id)
        .single();

      if (data) {
        setTeamId(data.id);
      } else {
        alert('Сначала создайте команду!');
        router.push('/team/create');
      }
    };

    fetchTeam();
  }, [supabase, router]);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) return;

    setLoading(true);
    const { error } = await supabase
      .from('players')
      .insert([{ 
        team_id: teamId, 
        name, 
        role, 
        elo, 
        status: 'онлайн' 
      }]);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      alert('Игрок добавлен! 🎉');
      setName('');
      setElo(1000);
      router.push('/team');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
      <div className="bg-[#0f1622] border border-[#1a2332] rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-2">➕ Добавить игрока</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Заполни информацию о новом игроке</p>
        
        <form onSubmit={handleAddPlayer} className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Имя игрока</label>
            <input
              type="text"
              placeholder="Например: Игрок 1"
              className="w-full bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-400 block mb-1">Роль в команде</label>
            <select
              className="w-full bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="IGL">🎯 IGL (капитан/стратег)</option>
              <option value="Рифлер">🔫 Рифлер (основной боец)</option>
              <option value="AWPer">🎯 AWPer (снайпер)</option>
              <option value="Энтри">💥 Энтри (первый заходит)</option>
              <option value="Саппорт">🛡️ Саппорт (помощник)</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 block mb-1">Elo рейтинг</label>
            <input
              type="number"
              className="w-full bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
              value={elo}
              onChange={(e) => setElo(Number(e.target.value))}
              min={0}
              max={5000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 1000-1500: новичок · 1500-2000: средний · 2000-2500: сильный · 2500+: профи
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Добавление...' : '➕ Добавить игрока'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="w-full"
          >
            ← Вернуться в панель управления
          </Button>
        </div>
      </div>
    </div>
  );
}