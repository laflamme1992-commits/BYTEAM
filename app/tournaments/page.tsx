'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Trophy, Plus, Calendar, Users } from 'lucide-react';

export default function TournamentsPage() {
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/login');
      setLoading(false);
    };
    checkAuth();
  }, [supabase, router]);

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
              <h1 className="text-3xl font-bold text-white">Турниры</h1>
              <p className="text-gray-400">Найди и создавай турниры</p>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Создать турнир
            </Button>
          </div>

          <GlassCard>
            <div className="text-center py-12 text-gray-400">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium text-white mb-2">Турниры скоро появятся</p>
              <p className="text-sm">Мы работаем над этой функцией</p>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}