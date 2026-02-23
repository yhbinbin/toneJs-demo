"use client";

import { useKeyboardStore } from "@/store/useKeyboardStore";
import { useAudio } from "@/hooks/useAudio";

const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"];
const blackKeyPositions = [0, 1, 3, 4, 5]; // 黑键相对白键的位置索引
const blackNotes = ["C#", "D#", "F#", "G#", "A#"];

interface PianoProps {
  octaves?: number;
  startOctave?: number;
  enableSound?: boolean;
}

export default function Piano({
  octaves = 2,
  startOctave = 4,
  enableSound = true,
}: PianoProps) {
  const { pressedKeys, highlightedKeys, pressKey, releaseKey } =
    useKeyboardStore();
  const { isReady, initAudio, attackNote, releaseNote } = useAudio();

  const getWhiteKeyClassName = (note: string) => {
    const isPressed = pressedKeys.has(note);
    const isHighlighted = highlightedKeys.has(note);

    let className =
      "w-10 h-32 border border-zinc-300 rounded-b-md transition-colors cursor-pointer ";

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
    const isPressed = pressedKeys.has(note);
    const isHighlighted = highlightedKeys.has(note);

    let className =
      "absolute w-6 h-20 rounded-b-md transition-colors cursor-pointer ";

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
    // 首次交互时初始化音频
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
            />
          );
        })}
        {/* 黑键 */}
        {blackKeyPositions.map((pos, index) => {
          const note = `${blackNotes[index]}${octave}`;
          return (
            <button
              key={note}
              className={getBlackKeyClassName(note)}
              style={{ left: `${pos * 40 + 27}px` }}
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

  return (
    <div className="flex justify-center items-center p-4 bg-zinc-800 rounded-lg">
      <div className="flex">
        {Array.from({ length: octaves }, (_, i) => startOctave + i).map(
          renderOctave
        )}
      </div>
    </div>
  );
}
