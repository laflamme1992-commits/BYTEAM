import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BYTEAM — управление командой",
  description:
    "Планируйте тренировки, управляйте задачами и развивайте команду.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
