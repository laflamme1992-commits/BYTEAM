import Link from "next/link";
import { Button } from '@/components/ui/Button'
import { Trophy, Users, Target, Calendar, TrendingUp, Sparkles, ChevronRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0e17]">
      {/* Навигация */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e17]/80 backdrop-blur-xl border-b border-[#1a2332]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white tracking-tight">BYTEAM</span>
            <span className="text-[10px] font-mono text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">БЕТА</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm">Войти</Button>
            <Button size="sm">Начать</Button>
          </div>
        </div>
      </nav>

      {/* Герой-блок */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1a2332] bg-[#0f1622] text-xs text-gray-400 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Платформа управления командой на базе ИИ
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
              Менеджер
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400">
                твоей команды.
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              Организуй команду. Тренируйся умнее. Соревнуйся вместе.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="px-8 gap-2">
                  Создать команду
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8">
                Искать турниры
              </Button>
            </div>
          </div>

          {/* Возможности */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-20">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-[#0f1622] border border-[#1a2332] rounded-2xl p-6 text-center hover:border-blue-500/40 hover:bg-[#131b2a] transition-all duration-300 cursor-default"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center mx-auto mb-3 transition-all">
                  <feature.icon className="w-6 h-6 text-blue-400 group-hover:text-blue-300 transition-all" />
                </div>
                <h3 className="text-white font-semibold text-sm">{feature.label}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Подвал */}
      <footer className="border-t border-[#1a2332] py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-gray-500">
          <span>© 2026 BYTEAM. Все права защищены.</span>
          <span>Создано для киберспортивных команд</span>
        </div>
      </footer>
    </main>
  )
}

const features = [
  { icon: Users, label: 'Управление командой' },
  { icon: Calendar, label: 'Тренировки' },
  { icon: Target, label: 'Задачи' },
  { icon: Trophy, label: 'Турниры' },
  { icon: TrendingUp, label: 'Прогресс' },
]