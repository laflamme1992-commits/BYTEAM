'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  assignee: string;
  deadline: string;
  status: 'todo' | 'in_progress' | 'done';
  team_id: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newStatus, setNewStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
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
        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('team_id', team.id)
          .order('created_at', { ascending: false });
        if (tasksData) setTasks(tasksData);
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase, router]);

  const addTask = async () => {
    if (!teamId || !newTitle.trim()) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        team_id: teamId,
        title: newTitle,
        assignee: newAssignee || 'Не назначен',
        deadline: newDeadline || 'Без срока',
        status: newStatus
      }])
      .select()
      .single();

    if (error) {
      alert('Ошибка: ' + error.message);
    } else if (data) {
      setTasks([data, ...tasks]);
      setNewTitle('');
      setNewAssignee('');
      setNewDeadline('');
      setNewStatus('todo');
      setShowForm(false);
    }
  };

  const updateTaskStatus = async (id: string, status: 'todo' | 'in_progress' | 'done') => {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', id);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    }
  };

  const deleteTask = async (id: string) => {
    if (!confirm('Удалить задачу?')) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Ошибка: ' + error.message);
    } else {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, { label: string; color: string }> = {
      todo: { label: 'Нужно сделать', color: 'text-gray-400' },
      in_progress: { label: 'В работе', color: 'text-yellow-400' },
      done: { label: 'Готово', color: 'text-green-400' },
    };
    return map[status] || { label: status, color: 'text-gray-400' };
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
              <h1 className="text-3xl font-bold text-white">Задачи</h1>
              <p className="text-gray-400">Управляй задачами команды</p>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Новая задача
            </Button>
          </div>

          {/* Форма добавления */}
          {showForm && (
            <GlassCard className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Создать задачу</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Название задачи"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Исполнитель"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Дедлайн (например, 31 авг)"
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                />
                <select
                  className="bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as 'todo' | 'in_progress' | 'done')}
                >
                  <option value="todo">Нужно сделать</option>
                  <option value="in_progress">В работе</option>
                  <option value="done">Готово</option>
                </select>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={addTask}>Добавить</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Отмена</Button>
              </div>
            </GlassCard>
          )}

          {/* Доска задач */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['todo', 'in_progress', 'done'].map((status) => {
              const statusInfo = getStatusLabel(status);
              const filteredTasks = tasks.filter(t => t.status === status);
              
              return (
                <div key={status}>
                  <h3 className={`text-sm font-semibold ${statusInfo.color} uppercase tracking-wider mb-4`}>
                    {statusInfo.label} ({filteredTasks.length})
                  </h3>
                  <div className="space-y-3">
                    {filteredTasks.length === 0 ? (
                      <p className="text-sm text-gray-500">Нет задач</p>
                    ) : (
                      filteredTasks.map((task) => (
                        <GlassCard key={task.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-white font-medium">{task.title}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                👤 {task.assignee} · 📅 {task.deadline}
                              </p>
                            </div>
                            <div className="flex gap-1">
                              {status !== 'done' && (
                                <button
                                  onClick={() => {
                                    const nextStatus = status === 'todo' ? 'in_progress' : 'done';
                                    updateTaskStatus(task.id, nextStatus);
                                  }}
                                  className="text-xs text-blue-400 hover:text-blue-300 px-2 py-1"
                                >
                                  →
                                </button>
                              )}
                              <button
                                onClick={() => deleteTask(task.id)}
                                className="text-xs text-red-400 hover:text-red-300 px-2 py-1"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        </GlassCard>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}