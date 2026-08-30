import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CheckSquare, 
  Trophy, 
  TrendingUp, 
  BarChart3, 
  Bot,
  Target,
  Award,
  Medal,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Clock
} from 'lucide-react'

export default function ProgressPage() {
  return (
    <div className="flex min-h-screen bg-[#0a0e17]">
      {/* Боковое меню */}
      <aside className="w-56 bg-[#0f1622] border-r border-[#1a2332] p-4 flex flex-col fixed h-full">
        <div className="flex items-center gap-2 mb-8 px-3">
          <span className="text-xl font-bold text-white">BYTEAM</span>
          <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">БЕТА</span>
        </div>
        
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                item.active 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' 
                  : 'text-gray-400 hover:bg-[#1a2332] hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-[#1a2332] pt-4">
          <div className="px-3 py-2.5 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">BYTEAM AI</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Спроси ИИ о стратегии</p>
          </div>
        </div>
      </aside>

      {/* Основной контент */}
      <main className="flex-1 ml-56 p-8">
        {/* Шапка */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Прогресс</h1>
            <p className="text-sm text-gray-400">Отслеживай цели и достижения команды</p>
          </div>
          <Button size="sm" className="gap-2">
            <Target className="w-4 h-4" />
            Установить цель
          </Button>
        </header>

        {/* Основная цель */}
        <div className="bg-[#0f1622] border border-[#1a2332] rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm text-gray-400">Главная цель команды</h2>
              <p className="text-3xl font-bold text-white mt-1">2500 Средний Elo</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Прогресс</p>
              <p className="text-3xl font-bold text-blue-400">82%</p>
            </div>
          </div>
          <div className="mt-4 w-full h-3 bg-[#1a2332] rounded-full overflow-hidden">
            <div className="h-full w-[82%] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"></div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Сейчас: 2384</span>
            <span>Цель: 2500</span>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#0f1622] border border-[#1a2332] rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-2">
              <Trophy className="w-6 h-6 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">12</p>
            <p className="text-xs text-gray-500">Побед</p>
          </div>
          <div className="bg-[#0f1622] border border-[#1a2332] rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mx-auto mb-2">
              <Medal className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-2xl font-bold text-white">8</p>
            <p className="text-xs text-gray-500">Турниров</p>
          </div>
          <div className="bg-[#0f1622] border border-[#1a2332] rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-2">
              <TrendingUpIcon className="w-6 h-6 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-white">+156</p>
            <p className="text-xs text-gray-500">Прирост Elo</p>
          </div>
          <div className="bg-[#0f1622] border border-[#1a2332] rounded-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-yellow-400" />
            </div>
            <p className="text-2xl font-bold text-white">23</p>
            <p className="text-xs text-gray-500">Матчей</p>
          </div>
        </div>

        {/* Достижения */}
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" />
          Достижения
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {achievements.map((achievement, index) => (
            <div key={index} className={`bg-[#0f1622] border rounded-2xl p-6 text-center transition-all ${
              achievement.unlocked 
                ? 'border-yellow-500/30 hover:border-yellow-400/50' 
                : 'border-[#1a2332] opacity-50'
            }`}>
              <div className="text-4xl mb-2">{achievement.icon}</div>
              <h3 className="text-white font-medium">{achievement.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{achievement.description}</p>
              {achievement.unlocked ? (
                <span className="inline-block mt-3 text-xs text-green-400">✅ Получено</span>
              ) : (
                <span className="inline-block mt-3 text-xs text-gray-500">🔒 Заблокировано</span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

// Навигация
const navItems = [
  { icon: LayoutDashboard, label: 'Панель управления', href: '/dashboard', active: false },
  { icon: Users, label: 'Команда', href: '/team', active: false },
  { icon: Calendar, label: 'Календарь', href: '/calendar', active: false },
  { icon: CheckSquare, label: 'Задачи', href: '/tasks', active: false },
  { icon: TrendingUp, label: 'Тренировки', href: '/practice', active: false },
  { icon: Trophy, label: 'Турниры', href: '/tournaments', active: false },
  { icon: BarChart3, label: 'Прогресс', href: '/progress', active: true },
  { icon: Bot, label: 'ИИ', href: '/ai', active: false },
]

// Достижения
const achievements = [
  { icon: '🏆', title: 'Первая победа', description: 'Выиграйте свой первый матч', unlocked: true },
  { icon: '🎯', title: 'Точный стрелок', description: 'Достигните 30+ фрагов в матче', unlocked: true },
  { icon: '👑', title: 'Лидер', description: 'Станьте капитаном команды', unlocked: false },
  { icon: '💪', title: 'Команда мечты', description: 'Соберите полный состав из 5 игроков', unlocked: true },
  { icon: '🏅', title: 'Турнирный боец', description: 'Участвуйте в 10 турнирах', unlocked: false },
  { icon: '⭐', title: 'Звездный игрок', description: 'Достигните 2500 Elo', unlocked: false }
]