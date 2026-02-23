"use client";

export default function Header() {
  return (
    <header className="h-16 bg-zinc-900 text-white flex items-center justify-between px-6 shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold">Tone.js Demo</span>
        <span className="text-sm">by 杨宏斌 Hongbin Yang</span>
      </div>
      <nav className="flex items-center gap-4">
        <a href="#" className="hover:text-zinc-300 transition-colors">
          首页
        </a>
        <a href="#" className="hover:text-zinc-300 transition-colors">
          设置
        </a>
      </nav>
    </header>
  );
}
