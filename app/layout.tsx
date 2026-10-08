import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./polish.css";

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
export const viewport:Viewport={width:'device-width',initialScale:1,themeColor:'#3478bd'};

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
