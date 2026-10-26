"use client";

import { useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ConnectionRequired } from "@/components/workspace/ConnectionRequired";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return isSupabaseConfigured ? <LoginPageConnected /> : <ConnectionRequired />;
}

function LoginPageConnected() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else router.push("/dashboard");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0c1011] flex items-center justify-center">
      <div className="bg-[#141b19] border border-[#29382f] rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-white text-center mb-6">
          Вход в BYTEAM
        </h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Электронная почта"
            className="w-full bg-[#0c1011] border border-[#29382f] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            className="w-full bg-[#0c1011] border border-[#29382f] rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Загрузка..." : "Войти"}
          </Button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-4">
          Нет аккаунта?{" "}
          <a href="/register" className="text-teal-400 hover:underline">
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  );
}
