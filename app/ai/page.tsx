'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/ui/Sidebar';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Bot, Send, Sparkles, RefreshCw, User, Lightbulb } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я BYTEAM AI 🤖 Готов помочь твоей команде. Задай мне любой вопрос о стратегии, тренировках или турнирах!'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/login');
          return;
        }
        setIsAuth(true);
      } catch (error) {
        console.log('Auth check error, redirecting to login');
        router.push('/login');
      }
      setLoading(false);
    };
    checkAuth();
  }, [supabase, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading || !isAuth) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    setTimeout(() => {
      const responses = [
        'Анализирую ваше расписание... 📊 За неделю до турнира рекомендую провести 3 интенсивные тренировки по 2 часа. У вас есть свободные слоты: завтра 19:00, среда 20:00 и пятница 18:00.',
        'По данным статистики, вашей команде нужно улучшить игру на Mirage. Предлагаю выделить 2 тренировки на разбор стратегий на этой карте. Игрок 1 (IGL) уже подготовил материалы.',
        'Отличная новость! 🎉 На основе вашего текущего Elo (2384) и прогресса (82%), вы можете достичь цели 2500 уже через 2 недели, если проведете 4 дополнительные тренировки.',
        'Рекомендую зарегистрироваться на BYTEAM Open Cup 5 сентября. Ваш состав полностью соответствует требованиям турнира (max 2500 Elo). Уровень команды позволяет бороться за призовые места!'
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setLoading(false);
    }, 1500);
  };

  const quickQuestions = [
    'У нас турнир через неделю. Что делать?',
    'Как улучшить игру на Mirage?',
    'Проанализируй мою команду',
    'Составь план тренировок'
  ];

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Привет! Я BYTEAM AI 🤖 Готов помочь твоей команде. Задай мне любой вопрос о стратегии, тренировках или турнирах!'
      }
    ]);
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-[#0a0e17] flex">
        <Sidebar />
        <main className="flex-1 ml-56 p-8 flex items-center justify-center">
          <div className="text-white text-xl">Проверка авторизации...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] flex">
      <Sidebar />
      
      <main className="flex-1 ml-56 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <Bot className="w-8 h-8 text-blue-400" />
                BYTEAM AI
              </h1>
              <p className="text-gray-400">Твой личный помощник для управления командой</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={clearChat}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Очистить чат
            </Button>
          </div>

          <GlassCard className="p-0 overflow-hidden flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-600/30 border border-blue-500/30 text-white'
                        : 'bg-[#1a2332] border border-[#1a2332] text-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-[#1a2332] rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-100"></span>
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-200"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="border-t border-[#1a2332] p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Задай вопрос BYTEAM AI..."
                  className="flex-1 bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 transition-all"
                  disabled={loading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className="gap-2 h-12 px-6"
                >
                  <Send className="w-4 h-4" />
                  Отправить
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                💡 BYTEAM AI анализирует календарь, задачи, игроков и статистику команды
              </p>
            </div>
          </GlassCard>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickQuestions.map((question) => (
              <button
                key={question}
                onClick={() => {
                  setInput(question);
                }}
                className="bg-[#0f1622] border border-[#1a2332] rounded-xl px-4 py-2 text-sm text-gray-400 hover:border-blue-500/30 hover:text-white transition-all text-left flex items-center gap-2"
              >
                <Lightbulb className="w-3 h-3 text-blue-400" />
                {question}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}