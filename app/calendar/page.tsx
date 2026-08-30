'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  type: 'training' | 'match' | 'tournament' | 'meeting';
  date: string;
  time: string;
  location: string;
  participants: string;
  team_id: string;
}

const eventTypeMap = {
  training: { label: 'Тренировка', color: 'bg-blue-500/10 text-blue-400' },
  match: { label: 'Матч', color: 'bg-green-500/10 text-green-400' },
  tournament: { label: 'Турнир', color: 'bg-purple-500/10 text-purple-400' },
  meeting: { label: 'Встреча', color: 'bg-yellow-500/10 text-yellow-400' },
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<Event['type']>('training');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newParticipants, setNewParticipants] = useState('');
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
        const { data: eventsData } = await supabase
          .from('events')
          .select('*')
          .eq('team_id', team.id)
          .order('date', { ascending: true });
        if (eventsData) setEvents(eventsData);
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  const addEvent = async () => {
    if (!teamId || !newTitle.trim()) return;

    const { data, error } = await supabase
      .from('events')
      .insert([{
        team_id: teamId,
        title: newTitle,
        type: newType,
        date: newDate || 'Без даты',
        time: newTime || '—',
        location: newLocation || '—',
        participants: newParticipants || '—',
      }])
      .select()
      .single();

    if (error) {
      alert('Ошибка: ' + error.message);
    } else if (data) {
      setEvents([...events, data]);
      setNewTitle('');
      setNewType('training');
      setNewDate('');
      setNewTime('');
      setNewLocation('');
      setNewParticipants('');
      setShowForm(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Удалить событие?')) return;

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      setEvents(events.filter(e => e.id !== id));
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
              <h1 className="text-3xl font-bold text-white">Календарь</h1>
              <p className="text-gray-400">Расписание команды</p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Добавить событие
            </Button>
          </div>

          {showForm && (
            <GlassCard className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Новое событие</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Название"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <select
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as Event['type'])}
                >
                  <option value="training">Тренировка</option>
                  <option value="match">Матч</option>
                  <option value="tournament">Турнир</option>
                  <option value="meeting">Встреча</option>
                </select>
                <input
                  type="text"
                  placeholder="Дата (например, 31 авг)"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Время (например, 20:00)"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Место"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Участники"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newParticipants}
                  onChange={(e) => setNewParticipants(e.target.value)}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={addEvent}>Добавить</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
              </div>
            </GlassCard>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.length === 0 ? (
              <div className="col-span-2 text-center text-gray-400 py-12">
                <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>В календаре пока нет событий</p>
              </div>
            ) : (
              events.map((event) => {
                const typeInfo = eventTypeMap[event.type] || eventTypeMap.training;
                return (
                  <GlassCard key={event.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeInfo.color}`}>
                          {event.type === 'training' && '🏋️'}
                          {event.type === 'match' && '⚔️'}
                          {event.type === 'tournament' && '🏆'}
                          {event.type === 'meeting' && '🤝'}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{event.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteEvent(event.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{event.participants}</span>
                      </div>
                    </div>
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