'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Calendar, CheckSquare, 
  Trophy, TrendingUp, Bot, LogOut 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const navItems = [
  { icon: LayoutDashboard, label: 'Панель', href: '/dashboard' },
  { icon: Users, label: 'Команда', href: '/team' },
  { icon: Calendar, label: 'Календарь', href: '/calendar' },
  { icon: CheckSquare, label: 'Задачи', href: '/tasks' },
  { icon: TrendingUp, label: 'Тренировки', href: '/practice' },
  { icon: Trophy, label: 'Турниры', href: '/tournaments' },
  { icon: Bot, label: 'ИИ', href: '/ai' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside className="w-56 bg-[#0f1622]/90 backdrop-blur-md border-r border-white/5 h-screen fixed left-0 top-0 p-4 flex flex-col">
      {/* Логотип */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <img src="/logo.png" alt="BYTEAM" className="h-8 w-auto" />
        <span className="text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full border border-blue-400/20">
          БЕТА
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-all w-full"
      >
        <LogOut className="w-4 h-4" />
        Выйти
      </button>
    </aside>
  );
}