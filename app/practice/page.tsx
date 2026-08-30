'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar, Clock, MapPin, Users, Target } from 'lucide-react';

interface Practice {
  id: string;
  title: string;
  opponent: string;
  date: string;
  time: string;
  maps: string;
  server: string;
  format: string;
  status: 'planned' | 'in_progress' | 'completed';
  team_id: string;
}

export default function PracticePage() {
  const [practices, setPractices] = useState<Practice[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newOpponent, setNewOpponent] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newMaps, setNewMaps] = useState('');
  const [newServer, setNewServer] = useState('');
  const [newFormat, setNewFormat] = useState('5v5');
  const [newStatus, setNewStatus] = useState<Practice['status']>('planned');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
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
        setTeamId(team.id);
        const { data: practicesData } = await supabase
          .from('practices')
          .select('*')
          .eq('team_id', team.id)
          .order('date', { ascending: true });
        if (practicesData) setPractices(practicesData);
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  const addPractice = async () => {
    if (!teamId || !newTitle.trim()) return;

    const { data, error } = await supabase
      .from('practices')
      .insert([{
        team_id: teamId,
        title: newTitle,
        opponent: newOpponent || '—',
        date: newDate || 'Без даты',
        time: newTime || '—',
        maps: newMaps || '—',
        server: newServer || '—',
        format: newFormat,
        status: newStatus,
      }])
      .select()
      .single();

    if (error) {
      alert('Ошибка: ' + error.message);
    } else if (data) {
      setPractices([...practices, data]);
      setNewTitle('');
      setNewOpponent('');
      setNewDate('');
      setNewTime('');
      setNewMaps('');
      setNewServer('');
      setNewFormat('5v5');
      setNewStatus('planned');
      setShowForm(false);
    }
  };

  const updateStatus = async (id: string, status: Practice['status']) => {
    const { error } = await supabase
      .from('practices')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      setPractices(practices.map(p => p.id === id ? { ...p, status } : p));
    }
  };

  const deletePractice = async (id: string) => {
    if (!confirm('Удалить тренировку?')) return;

    const { error } = await supabase
      .from('practices')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      setPractices(practices.filter(p => p.id !== id));
    }
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      planned: { label: 'Запланирована', color: 'bg-blue-500/10 text-blue-400' },
      in_progress: { label: 'В процессе', color: 'bg-yellow-500/10 text-yellow-400' },
      completed: { label: 'Завершена', color: 'bg-green-500/10 text-green-400' },
    };
    return map[status] || { label: status, color: 'bg-gray-500/10 text-gray-400' };
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
              <h1 className="text-3xl font-bold text-white">Тренировки</h1>
              <p className="text-gray-400">Планируй и управляй тренировками</p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Создать тренировку
            </Button>
          </div>

          {showForm && (
            <GlassCard className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Новая тренировка</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Название"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Соперник"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newOpponent}
                  onChange={(e) => setNewOpponent(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Дата"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Время"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Карты"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newMaps}
                  onChange={(e) => setNewMaps(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Сервер"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newServer}
                  onChange={(e) => setNewServer(e.target.value)}
                />
                <select
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newFormat}
                  onChange={(e) => setNewFormat(e.target.value)}
                >
                  <option value="5v5">5v5</option>
                  <option value="10v10">10v10</option>
                  <option value="2v2">2v2</option>
                  <option value="Индивидуально">Индивидуально</option>
                </select>
                <select
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Practice['status'])}
                >
                  <option value="planned">Запланирована</option>
                  <option value="in_progress">В процессе</option>
                  <option value="completed">Завершена</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={addPractice}>Создать</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
              </div>
            </GlassCard>
          )}

          <div className="space-y-4">
            {practices.length === 0 ? (
              <div className="text-center text-gray-400 py-12">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>Нет запланированных тренировок</p>
              </div>
            ) : (
              practices.map((practice) => {
                const statusInfo = getStatusInfo(practice.status);
                return (
                  <GlassCard key={practice.id} className="p-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">🏋️</div>
                        <div>
                          <h3 className="text-white font-medium text-lg">{practice.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {practice.opponent}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {practice.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {practice.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`text-xs px-3 py-1 rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <button
                          onClick={() => deletePractice(practice.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        Карты: {practice.maps}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Сервер: {practice.server}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Формат: {practice.format}
                      </span>
                    </div>

                    {practice.status !== 'completed' && (
                      <div className="mt-4 flex gap-2">
                        {practice.status === 'planned' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateStatus(practice.id, 'in_progress')}
                          >
                            Начать
                          </Button>
                        )}
                        {practice.status === 'in_progress' && (
                          <Button 
                            size="sm"
                            onClick={() => updateStatus(practice.id, 'completed')}
                          >
                            Завершить
                          </Button>
                        )}
                      </div>
                    )}
                  </GlassCard>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}