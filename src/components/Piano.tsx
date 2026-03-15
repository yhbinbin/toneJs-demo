"use client";

import { useState, useRef, useEffect } from "react";
import { useKeyboardStore } from "@/store/useKeyboardStore";
import { useAudio } from "@/hooks/useAudio";

const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
const blackKeyPositions = [0, 1, 3, 4, 5]; // 黑键相对白键的位置索引
const blackNotes = ["C#", "D#", "F#", "G#", "A#"];

// 降号到升号的等音转换映射
const flatToSharpMap: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Fb: "E",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
  Cb: "B",
};

/**
 * 检查音符是否在集合中（考虑等音）
 */
function isNoteInSet(noteSet: Set<string>, note: string): boolean {
  if (noteSet.has(note)) return true;

  const match = note.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) return false;

  const [, noteName, octave] = match;

  if (noteName.includes("#")) {
    const sharpToFlat: Record<string, string> = {
      "C#": "Db",
      "D#": "Eb",
      "E": "Fb",
      "F#": "Gb",
      "G#": "Ab",
      "A#": "Bb",
      "B": "Cb",
    };
    const flatName = sharpToFlat[noteName];
    if (flatName && noteSet.has(`${flatName}${octave}`)) return true;
  } else if (noteName.includes("b")) {
    const sharpName = flatToSharpMap[noteName];
    if (sharpName && noteSet.has(`${sharpName}${octave}`)) return true;
  }

  return false;
}

// 单个八度的白键宽度 (7个白键 × 40px)
const OCTAVE_WIDTH = 7 * 40;
const WHITE_KEY_WIDTH = 40;

interface PianoProps {
  defaultOctaves?: number;
  defaultStartOctave?: number;
  enableSound?: boolean;
  centerOctave?: number; // 响应式模式下的中心八度
}

export default function Piano({
  defaultOctaves = 4,
  defaultStartOctave = 2,
  enableSound = true,
  centerOctave = 3,
}: PianoProps) {
  const { pressedKeys, highlightedKeys, pressKey, releaseKey } =
    useKeyboardStore();
  const { isReady, initAudio, attackNote, releaseNote } = useAudio();
  
  const [startOctave, setStartOctave] = useState(defaultStartOctave);
  const [visibleOctaves, setVisibleOctaves] = useState(defaultOctaves);
  const containerRef = useRef<HTMLDivElement>(null);

  // 响应式调整显示的八度数
  useEffect(() => {
    const updateVisibleOctaves = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth - 120; // 减去按钮区域
      const maxOctaves = Math.floor(containerWidth / OCTAVE_WIDTH);
      const octaves = Math.max(1, Math.min(maxOctaves, 7)); // 最少1个，最多7个八度
      
      setVisibleOctaves(octaves);
      
      // 以 centerOctave 为中心计算起始八度
      const halfOctaves = Math.floor(octaves / 2);
      const newStartOctave = Math.max(0, Math.min(centerOctave - halfOctaves, 7 - octaves));
      setStartOctave(newStartOctave);
    };

    updateVisibleOctaves();
    window.addEventListener("resize", updateVisibleOctaves);
    return () => window.removeEventListener("resize", updateVisibleOctaves);
  }, [centerOctave]);

  // 八度整体移动
  const shiftOctave = (delta: number) => {
    const newStartOctave = startOctave + delta;
    if (newStartOctave >= 0 && newStartOctave + visibleOctaves <= 8) {
      setStartOctave(newStartOctave);
    }
  };

  const getWhiteKeyClassName = (note: string) => {
    const isPressed = isNoteInSet(pressedKeys, note);
    const isHighlighted = isNoteInSet(highlightedKeys, note);

    let className =
      "relative w-10 h-32 border border-zinc-300 rounded-b-md transition-colors cursor-pointer flex items-end justify-center pb-1 ";

    if (isPressed) {
      className += "bg-blue-400";
    } else if (isHighlighted) {
      className += "bg-yellow-300";
    } else {
      className += "bg-white hover:bg-zinc-100 active:bg-zinc-200";
    }

    return className;
  };

  const getBlackKeyClassName = (note: string) => {
    const isPressed = isNoteInSet(pressedKeys, note);
    const isHighlighted = isNoteInSet(highlightedKeys, note);

    let className =
      "absolute w-6 h-20 rounded-b-md transition-colors cursor-pointer z-10 ";

    if (isPressed) {
      className += "bg-blue-500";
    } else if (isHighlighted) {
      className += "bg-yellow-500";
    } else {
      className += "bg-zinc-900 hover:bg-zinc-700 active:bg-zinc-600";
    }

    return className;
  };

  const handleKeyDown = async (note: string) => {
    if (enableSound && !isReady) {
      await initAudio();
    }
    pressKey(note);
    if (enableSound) {
      attackNote(note);
    }
  };

  const handleKeyUp = (note: string) => {
    releaseKey(note);
    if (enableSound) {
      releaseNote(note);
    }
  };

  const renderOctave = (octave: number) => {
    return (
      <div key={octave} className="relative flex">
        {/* 白键 */}
        {whiteKeys.map((noteName) => {
          const note = `${noteName}${octave}`;
          const isC = noteName === "C";
          return (
            <button
              key={note}
              className={getWhiteKeyClassName(note)}
              title={note}
              onMouseDown={() => handleKeyDown(note)}
              onMouseUp={() => handleKeyUp(note)}
              onMouseLeave={() => handleKeyUp(note)}
              onTouchStart={() => handleKeyDown(note)}
              onTouchEnd={() => handleKeyUp(note)}
            >
              {/* C 音标记 */}
              {isC && (
                <span className="text-xs text-zinc-400 font-light select-none">
                  C{octave}
                </span>
              )}
            </button>
          );
        })}
        {/* 黑键 */}
        {blackKeyPositions.map((pos, index) => {
          const note = `${blackNotes[index]}${octave}`;
          return (
            <button
              key={note}
              className={getBlackKeyClassName(note)}
              style={{ left: `${pos * WHITE_KEY_WIDTH + 27}px` }}
              title={note}
              onMouseDown={() => handleKeyDown(note)}
              onMouseUp={() => handleKeyUp(note)}
              onMouseLeave={() => handleKeyUp(note)}
              onTouchStart={() => handleKeyDown(note)}
              onTouchEnd={() => handleKeyUp(note)}
            />
          );
        })}
      </div>
    );
  };

  const canShiftDown = startOctave > 0;
  const canShiftUp = startOctave + visibleOctaves < 8;

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center p-4 bg-zinc-800 rounded-lg gap-2"
    >
      {/* 左侧八度减按钮 */}
      <button
        onClick={() => shiftOctave(-1)}
        disabled={!canShiftDown}
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-colors ${
          canShiftDown
            ? "bg-zinc-600 text-zinc-100 hover:bg-zinc-500 cursor-pointer"
            : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
        }`}
        title="降低八度"
      >
        −
      </button>

      {/* 键盘区域 */}
      <div className="flex overflow-hidden">
        {Array.from({ length: visibleOctaves }, (_, i) => startOctave + i).map(
          renderOctave
        )}
      </div>

      {/* 右侧八度加按钮 */}
      <button
        onClick={() => shiftOctave(1)}
        disabled={!canShiftUp}
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold transition-colors ${
          canShiftUp
            ? "bg-zinc-600 text-zinc-100 hover:bg-zinc-500 cursor-pointer"
            : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
        }`}
        title="升高八度"
      >
        +
      </button>
    </div>
  );
}
