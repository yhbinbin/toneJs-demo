import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tone.js Demo",
  description: "Tone.js application demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-900 text-zinc-100`}
      >
        <div className="flex flex-col h-screen">
          {/* 顶部固定高度导航栏 */}
          <Header />
          
          {/* 下方内容区域 */}
          <div className="flex flex-1 overflow-hidden">
            {/* 左侧固定宽度菜单 */}
            <Sidebar />
            
            {/* 右侧主展示内容 */}
            <main className="flex-1 overflow-auto bg-zinc-800 p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
