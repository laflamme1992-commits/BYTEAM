'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else {
      alert('Проверьте почту для подтверждения!');
      router.push('/login');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
      <div className="bg-[#0f1622] border border-[#1a2332] rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Регистрация BYTEAM</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль (минимум 6 символов)"
            className="w-full bg-[#0a0e17] border border-[#1a2332] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Загрузка...' : 'Зарегистрироваться'}
          </Button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-4">
          Уже есть аккаунт? <a href="/login" className="text-blue-400 hover:underline">Войти</a>
        </p>
      </div>
    </div>
  );
}