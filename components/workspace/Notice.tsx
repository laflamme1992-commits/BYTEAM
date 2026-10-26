import Link from "next/link";
import { AlertCircle } from "lucide-react";
export function Notice({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  if (!message) return null;
  return (
    <div className="workspace-notice" role="alert">
      <AlertCircle size={18} />
      <span>{message}</span>
      <Link href="/team/create">Моя команда</Link>
      {retry && <button onClick={retry}>Повторить</button>}
    </div>
  );
}
