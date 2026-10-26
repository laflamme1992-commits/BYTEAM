import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function Header({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <header className="workspace-header">
      <div>
        <div className="eyebrow">BYTEAM / КОМАНДНОЕ ПРОСТРАНСТВО</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="header-actions">
        {children}
        <span className="workspace-avatar" title="Пространство команды">
          <Sparkles size={20} />
        </span>
      </div>
    </header>
  );
}
