import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpeakEasy AI — больше разговоров, меньше сомнений",
  description: "Твоё безопасное место для разговорного английского. Голосовая практика A1–C1, интересные темы и новые слова.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "SpeakEasy", statusBarStyle: "default" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">{children}</body>
    </html>
  );
}
