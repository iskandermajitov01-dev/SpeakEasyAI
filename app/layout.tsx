import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./polish.css";
import "./academy.css";
import "./vivid.css";

export const metadata: Metadata = {
  title: "SpeakEasy AI — Find your voice",
  description: "Find your voice in English. A1–C1 conversations, your own topics, vocabulary games and a rewarding learning path.",
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
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
