import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
export function ConnectionRequired() {
  return (
    <main className="connection-required">
      <div className="panel">
        <ShieldAlert size={32} />
        <h1>Подключение команды не настроено</h1>
        <p>
          Вход и данные команды станут доступны после подключения Supabase.
          Обратитесь к администратору пространства.
        </p>
        <Link className="primary-button" href="/tasks">
          Посмотреть интерфейс
        </Link>
        <Link className="panel-link" href="/">
          <ArrowLeft size={15} />
          На главную
        </Link>
      </div>
    </main>
  );
}
