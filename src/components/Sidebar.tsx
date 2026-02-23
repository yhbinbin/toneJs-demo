"use client";

import { useState } from "react";

interface MenuItem {
  key: string;
  name: string;
  href?: string;
  icon: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { key: "overview", name: "概览", href: "/", icon: "📊" },
  {
    key: "keyboard",
    name: "键盘",
    icon: "🎹",
    children: [
      { key: "chord", name: "和弦", href: "/keyboard/chord", icon: "🎶" },
      { key: "mode", name: "调式", href: "/keyboard/mode", icon: "🎼" },
      { key: "circle-of-fifths", name: "五度圈", href: "/keyboard/circle-of-fifths", icon: "⭕" },
      { key: "midi-player", name: "midi文件播放", href: "/keyboard/midi-player", icon: "📁" },
    ],
  },
  { key: "player", name: "播放器", href: "/player", icon: "🎵" },
  { key: "synth", name: "合成器", href: "/synth", icon: "🎹" },
  { key: "effects", name: "效果器", href: "/effects", icon: "🎛️" },
  { key: "settings", name: "设置", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const [expandedKeys, setExpandedKeys] = useState<string[]>(["keyboard"]);

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedKeys.includes(item.key);
    const paddingLeft = level === 0 ? "pl-6" : "pl-10";

    return (
      <li key={item.key}>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleExpand(item.key)}
              className={`flex items-center justify-between w-full ${paddingLeft} pr-4 py-3 hover:bg-zinc-700 hover:text-white transition-colors`}
            >
              <div className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </div>
              <span
                className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}
              >
                ▶
              </span>
            </button>
            {isExpanded && (
              <ul className="bg-zinc-900">
                {item.children!.map((child) => renderMenuItem(child, level + 1))}
              </ul>
            )}
          </>
        ) : (
          <a
            href={item.href}
            className={`flex items-center gap-3 ${paddingLeft} py-3 hover:bg-zinc-700 hover:text-white transition-colors`}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </a>
        )}
      </li>
    );
  };

  return (
    <aside className="w-60 bg-zinc-800 text-zinc-300 flex flex-col">
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => renderMenuItem(item))}
        </ul>
      </nav>
      <div className="p-4 border-t border-zinc-700 text-sm text-zinc-500">
        © 2026 Tone.js App
      </div>
    </aside>
  );
}
