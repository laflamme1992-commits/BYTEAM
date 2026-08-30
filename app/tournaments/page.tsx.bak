'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Trophy, Plus, Calendar, MapPin, Users, Award, Sparkles } from 'lucide-react';

interface Tournament {
  id: string;
  title: string;
  game: string;
  format: string;
  region: string;
  prize: string;
  date: string;
  teams: number;
  max_elo: number;
  is_recommended: boolean;
  team_id: string;
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGame, setNewGame] = useState('CS2');
  const [newFormat, setNewFormat] = useState('5v5');
  const [newRegion, setNewRegion] = useState('EU');
  const [newPrize, setNewPrize] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTeams, setNewTeams] = useState(8);
  const [newMaxElo, setNewMaxElo] = useState(2500);
  const [newRecommended, setNewRecommended] = useState(false);
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
        const { data: tournamentsData } = await supabase
          .from('tournaments')
          .select('*')
          .eq('team_id', team.id)
          .order('date', { ascending: true });
        if (tournamentsData) setTournaments(tournamentsData);
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  const addTournament = async () => {
    if (!teamId || !newTitle.trim()) return;

    const { data, error } = await supabase
      .from('tournaments')
      .insert([{
        team_id: teamId,
        title: newTitle,
        game: newGame,
        format: newFormat,
        region: newRegion,
        prize: newPrize || '—',
        date: newDate || 'Без даты',
        teams: newTeams,
        max_elo: newMaxElo,
        is_recommended: newRecommended,
      }])
      .select()
      .single();

    if (error) {
      alert('Ошибка: ' + error.message);
    } else if (data) {
      setTournaments([...tournaments, data]);
      setNewTitle('');
      setNewGame('CS2');
      setNewFormat('5v5');
      setNewRegion('EU');
      setNewPrize('');
      setNewDate('');
      setNewTeams(8);
      setNewMaxElo(2500);
      setNewRecommended(false);
      setShowForm(false);
    }
  };

  const deleteTournament = async (id: string) => {
    if (!confirm('Удалить турнир?')) return;

    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      setTournaments(tournaments.filter(t => t.id !== id));
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

  const recommendedTournaments = tournaments.filter(t => t.is_recommended);
  const otherTournaments = tournaments.filter(t => !t.is_recommended);

  return (
    <div className="min-h-screen bg-[#0a0e17] flex">
      <Sidebar />
      
      <main className="flex-1 ml-56 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">Турниры</h1>
              <p className="text-gray-400">Найди и создавай турниры</p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Создать турнир
            </Button>
          </div>

          {showForm && (
            <GlassCard className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Новый турнир</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Название турнира"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <select
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newGame}
                  onChange={(e) => setNewGame(e.target.value)}
                >
                  <option>CS2</option>
                  <option>Valorant</option>
                  <option>Dota 2</option>
                  <option>League of Legends</option>
                </select>
                <select
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newFormat}
                  onChange={(e) => setNewFormat(e.target.value)}
                >
                  <option>5v5</option>
                  <option>10v10</option>
                  <option>2v2</option>
                </select>
                <select
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                >
                  <option>EU</option>
                  <option>NA</option>
                  <option>ASIA</option>
                  <option>SA</option>
                  <option>CIS</option>
                </select>
                <input
                  type="text"
                  placeholder="Призовой фонд (например, $500)"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newPrize}
                  onChange={(e) => setNewPrize(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Дата"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Количество команд"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newTeams}
                  onChange={(e) => setNewTeams(Number(e.target.value))}
                  min={2}
                />
                <input
                  type="number"
                  placeholder="Максимальный Elo"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newMaxElo}
                  onChange={(e) => setNewMaxElo(Number(e.target.value))}
                  min={0}
                />
                <label className="flex items-center gap-2 text-white">
                  <input
                    type="checkbox"
                    checked={newRecommended}
                    onChange={(e) => setNewRecommended(e.target.checked)}
                  />
                  <span className="text-sm text-gray-400">Рекомендованный</span>
                </label>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={addTournament}>Создать</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
              </div>
            </GlassCard>
          )}

          {recommendedTournaments.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Рекомендовано для твоей команды
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendedTournaments.map((t) => (
                  <GlassCard key={t.id} className="p-6 hover:border-purple-500/30">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-white font-medium text-lg">{t.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                          <span>{t.game}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-600" />
                          <span>{t.format}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-600" />
                          <span>{t.region}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Призовой фонд</p>
                        <p className="text-lg font-bold text-purple-400">{t.prize}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {t.teams} команд
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {t.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" />
                        Max {t.max_elo} Elo
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                      <Button size="sm">Участвовать →</Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Все турниры
            </h2>
            <div className="space-y-4">
              {otherTournaments.length === 0 && recommendedTournaments.length === 0 ? (
                <div className="text-center text-gray-400 py-12">
                  <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Нет турниров</p>
                </div>
              ) : (
                otherTournaments.map((t) => (
                  <GlassCard key={t.id} className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-2xl">🏆</div>
                        <div>
                          <h3 className="text-white font-medium">{t.title}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            <span>{t.game}</span>
                            <span>•</span>
                            <span>{t.date}</span>
                            <span>•</span>
                            <span>Приз: {t.prize}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTournament(t.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </GlassCard>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}