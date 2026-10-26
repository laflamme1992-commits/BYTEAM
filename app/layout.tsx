import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BYTEAM — ваш ИИ-штаб",
  description:
    "Build your team. Менеджер, скаут, тренер, аналитик и помощь с командным взаимодействием для вашей команды CS2.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
