import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "bg-[#0f1622]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6",
        "transition-all duration-300",
        hover && "hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
}