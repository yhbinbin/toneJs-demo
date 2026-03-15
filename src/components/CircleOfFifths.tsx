"use client";

import { useRef, useEffect, useState } from "react";
import {
  normalizeNoteName,
  getMajorTriad,
  getMinorTriad,
  getMajorSeventhChord,
  getMinorSeventhChord,
} from "@/lib/chordUtils";
import { useAudio } from "@/hooks/useAudio";
import { useKeyboardStore } from "@/store/useKeyboardStore";

export type PlayMode = "root" | "triad" | "triad-arpeggio" | "seventh" | "seventh-arpeggio";

interface KeyInfo {
  name: string;
  description: string;
  x?: number;
  y?: number;
  radius?: number;
  isMinor?: boolean; // 是否为小调（内圈）
}

interface CircleOfFifthsProps {
  playMode?: PlayMode;
}

const outerKeysData: KeyInfo[] = [
  { name: "C", description: "C大调\n无升降号", isMinor: false },
  { name: "G", description: "G大调\n1个升号", isMinor: false },
  { name: "D", description: "D大调\n2个升号", isMinor: false },
  { name: "A", description: "A大调\n3个升号", isMinor: false },
  { name: "E", description: "E大调\n4个升号", isMinor: false },
  { name: "B/Cb", description: "B大调\n5个升号\nCb大调\n7个降号", isMinor: false },
  { name: "F#/Gb", description: "F#大调\n6个升号\nGb大调\n6个降号", isMinor: false },
  { name: "Db/C#", description: "Db大调\n5个降号\nC#大调\n7个升号", isMinor: false },
  { name: "Ab", description: "Ab大调\n4个降号", isMinor: false },
  { name: "Eb", description: "Eb大调\n3个降号", isMinor: false },
  { name: "Bb", description: "Bb大调\n2个降号", isMinor: false },
  { name: "F", description: "F大调\n1个降号", isMinor: false },
];

const innerKeysData: KeyInfo[] = [
  { name: "a", description: "a小调\n无升降号", isMinor: true },
  { name: "e", description: "e小调\n1个升号", isMinor: true },
  { name: "b", description: "b小调\n2个升号", isMinor: true },
  { name: "f#", description: "f#小调\n3个升号", isMinor: true },
  { name: "c#", description: "c#小调\n4个升号", isMinor: true },
  { name: "g#/ab", description: "g#小调\n5个升号\nab小调\n7个降号", isMinor: true },
  { name: "d#/eb", description: "d#小调\n6个升号\neb小调\n6个降号", isMinor: true },
  { name: "bb/a#", description: "bb小调\n5个降号\na#小调\n7个升号", isMinor: true },
  { name: "f", description: "f小调\n4个降号", isMinor: true },
  { name: "c", description: "c小调\n3个降号", isMinor: true },
  { name: "g", description: "g小调\n2个降号", isMinor: true },
  { name: "d", description: "d小调\n1个降号", isMinor: true },
];

export default function CircleOfFifths({ playMode = "root" }: CircleOfFifthsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outerKeysRef = useRef<KeyInfo[]>(outerKeysData.map(k => ({ ...k })));
  const innerKeysRef = useRef<KeyInfo[]>(innerKeysData.map(k => ({ ...k })));
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: "" });

  const { isReady, initAudio, playNote, playChord, playArpeggio } = useAudio();
  const { pressKeys, releaseAllKeys } = useKeyboardStore();

  const outerKeys = outerKeysRef.current;
  const innerKeys = innerKeysRef.current;

  // 深色主题色板
  const outerColors = [
    "#4a5568", "#4a5568", "#4a5568", "#4a5568", "#4a5568", "#4a5568",
    "#4a5568", "#4a5568", "#4a5568", "#4a5568", "#4a5568", "#4a5568",
  ];

  const innerColors = [
    "#2d3748", "#2d3748", "#2d3748", "#2d3748", "#2d3748", "#2d3748",
    "#2d3748", "#2d3748", "#2d3748", "#2d3748", "#2d3748", "#2d3748",
  ];

  // 渐变色版本（可选，更有层次感）
  const outerGradientColors = [
    "#3b82f6", "#2563eb", "#1d4ed8", "#1e40af", "#1e3a8a", "#312e81",
    "#4c1d95", "#581c87", "#701a75", "#831843", "#881337", "#9f1239",
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = 220;
    const innerRadius = 130;

    const drawSector = (
      startAngle: number,
      endAngle: number,
      inner: number,
      outer: number,
      color: string
    ) => {
      ctx.beginPath();
      ctx.moveTo(
        centerX + inner * Math.cos(startAngle),
        centerY + inner * Math.sin(startAngle)
      );
      ctx.arc(centerX, centerY, outer, startAngle, endAngle);
      ctx.lineTo(
        centerX + inner * Math.cos(endAngle),
        centerY + inner * Math.sin(endAngle)
      );
      ctx.arc(centerX, centerY, inner, endAngle, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#52525b";
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawCircle = (radius: number) => {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = "#71717a";
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const drawLines = (radius: number, angleOffset: number) => {
      outerKeys.forEach((_, index) => {
        const angle =
          (Math.PI * 2 / outerKeys.length) * index - Math.PI / 2 + angleOffset;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = "#52525b";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    };

    const drawKeys = (
      keys: KeyInfo[],
      radius: number,
      fontSize: number,
      color: string
    ) => {
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      keys.forEach((key, index) => {
        const angle = (Math.PI * 2 / keys.length) * index - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        key.x = x;
        key.y = y;
        key.radius = fontSize * 1.5;
        ctx.fillStyle = color;
        ctx.fillText(key.name, x, y);
      });
    };

    // 清空画布
    ctx.fillStyle = "#27272a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制外圈扇区
    outerKeys.forEach((_, index) => {
      const startAngle =
        (Math.PI * 2 / outerKeys.length) * index - Math.PI / 2 + Math.PI / 12;
      const endAngle = startAngle + (Math.PI * 2) / outerKeys.length;
      drawSector(startAngle, endAngle, innerRadius, outerRadius, outerGradientColors[index]);
    });

    // 绘制内圈扇区
    innerKeys.forEach((_, index) => {
      const startAngle =
        (Math.PI * 2 / innerKeys.length) * index - Math.PI / 2 + Math.PI / 12;
      const endAngle = startAngle + (Math.PI * 2) / innerKeys.length;
      drawSector(startAngle, endAngle, 0, innerRadius, innerColors[index]);
    });

    // 绘制圆圈和分割线
    drawCircle(outerRadius);
    drawCircle(innerRadius);
    drawLines(outerRadius, Math.PI / 12);

    // 绘制文字
    drawKeys(outerKeys, outerRadius * 0.78, 16, "#ffffff");
    drawKeys(innerKeys, innerRadius * 0.65, 14, "#d4d4d8");

    // 中心圆
    ctx.beginPath();
    ctx.arc(centerX, centerY, 30, 0, Math.PI * 2);
    ctx.fillStyle = "#18181b";
    ctx.fill();
    ctx.strokeStyle = "#52525b";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 中心文字
    ctx.font = "bold 12px Arial";
    ctx.fillStyle = "#a1a1aa";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("五度圈", centerX, centerY);
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const foundKey = [...outerKeys, ...innerKeys].find((key) => {
      if (key.x !== undefined && key.y !== undefined && key.radius !== undefined) {
        const dx = mouseX - key.x;
        const dy = mouseY - key.y;
        return Math.sqrt(dx * dx + dy * dy) < key.radius;
      }
      return false;
    });

    if (foundKey) {
      setTooltip({
        visible: true,
        x: event.clientX,
        y: event.clientY,
        content: foundKey.description,
      });
    } else {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  // 点击弹奏
  const handleClick = async (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const foundKey = [...outerKeys, ...innerKeys].find((key) => {
      if (key.x !== undefined && key.y !== undefined && key.radius !== undefined) {
        const dx = mouseX - key.x;
        const dy = mouseY - key.y;
        return Math.sqrt(dx * dx + dy * dy) < key.radius;
      }
      return false;
    });

    if (!foundKey) return;

    if (!isReady) {
      await initAudio();
    }

    // 标准化音符名称并添加八度（normalizeNoteName 内部处理大小写和等音转换）
    const noteName = normalizeNoteName(foundKey.name);
    const rootNote = `${noteName}3`;
    const isMinor = foundKey.isMinor;

    let notes: string[] = [];

    switch (playMode) {
      case "root":
        notes = [rootNote];
        break;
      case "triad":
        notes = isMinor ? getMinorTriad(rootNote) : getMajorTriad(rootNote);
        break;
      case "triad-arpeggio":
        notes = isMinor ? getMinorTriad(rootNote) : getMajorTriad(rootNote);
        break;
      case "seventh":
        notes = isMinor ? getMinorSeventhChord(rootNote) : getMajorSeventhChord(rootNote);
        break;
      case "seventh-arpeggio":
        notes = isMinor ? getMinorSeventhChord(rootNote) : getMajorSeventhChord(rootNote);
        break;
    }

    // 高亮键盘并播放
    if (playMode === "triad-arpeggio" || playMode === "seventh-arpeggio") {
      const interval = 250;
      notes.forEach((note, index) => {
        setTimeout(() => {
          pressKeys([note]);
        }, index * interval);
      });
      playArpeggio(notes, "8n", interval);
      setTimeout(() => {
        releaseAllKeys();
      }, notes.length * interval + 300);
    } else if (playMode === "root") {
      pressKeys(notes);
      playNote(notes[0], "4n");
      setTimeout(() => {
        releaseAllKeys();
      }, 500);
    } else {
      pressKeys(notes);
      playChord(notes, "2n");
      setTimeout(() => {
        releaseAllKeys();
      }, 1000);
    }
  };

  return (
    <div className="relative flex justify-center items-center">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="cursor-pointer rounded-lg"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />
      {tooltip.visible && (
        <div
          className="fixed bg-zinc-900 text-zinc-100 px-3 py-2 rounded-lg text-sm shadow-lg border border-zinc-700 whitespace-pre-line z-50 pointer-events-none"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y + 15,
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
}
