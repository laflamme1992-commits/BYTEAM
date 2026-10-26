"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  Trophy,
  TrendingUp,
  Sparkles,
  LogOut,
  ArrowUpRight,
  Shield,
  BookOpen,
} from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

import { BrandMark } from "@/components/ui/BrandMark";

const navItems = [
  { icon: LayoutDashboard, label: "Обзор", href: "/dashboard" },
  { icon: Users, label: "Команда", href: "/team" },
  { icon: Calendar, label: "Календарь", href: "/calendar" },
  { icon: CheckSquare, label: "Задачи", href: "/tasks" },
  { icon: BookOpen, label: "Плейбук", href: "/playbook" },
  { icon: TrendingUp, label: "Тренировки", href: "/practice" },
  { icon: Trophy, label: "Турниры", href: "/tournaments" },
  { icon: TrendingUp, label: "Прогресс", href: "/progress" },
  { icon: Sparkles, label: "ИИ-штаб", href: "/ai" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = async () => {
    if (isSupabaseConfigured) await createClient().auth.signOut();
    router.push("/login");
  };
  return (
    <aside className="workspace-sidebar">
      <Link href="/" className="brand" aria-label="BYTEAM — главная">
        <BrandMark size={38} />
        <span>
          BYTEAM<small>BUILD YOUR TEAM</small>
        </span>
      </Link>
      <div className="nav-caption">УПРАВЛЕНИЕ</div>
      <nav aria-label="Основное меню">
        {navItems.map(({ icon: Icon, label, href }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={pathname === href ? "page" : undefined}
            className={`nav-link ${pathname === href ? "active" : ""}`}
          >
            <Icon size={19} />
            <span>{label}</span>
            {href === "/ai" && <span className="nav-ai">ИИ</span>}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-promo">
          <Sparkles size={20} />
          <p>Сильнее с каждым матчем</p>
          <small>Планируйте. Тренируйтесь. Побеждайте.</small>
          <Link href="/ai">
            Открыть ИИ-штаб <ArrowUpRight size={14} />
          </Link>
        </div>
        <Link href="/team" className="team-switch">
          <span className="team-emblem">
            <Shield size={22} />
          </span>
          <span>
            Моя команда<small>Командное пространство</small>
          </span>
        </Link>
        <button onClick={handleLogout} className="nav-link logout">
          <LogOut size={18} />
          Выйти из аккаунта
        </button>
      </div>
    </aside>
  );
}
