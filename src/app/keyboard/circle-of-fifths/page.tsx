"use client";

import { useState } from "react";
import CircleOfFifths, { PlayMode } from "@/components/CircleOfFifths";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const PLAY_MODE_OPTIONS: { value: PlayMode; label: string }[] = [
  { value: "root", label: "根音" },
  { value: "triad", label: "齐奏三和弦" },
  { value: "triad-arpeggio", label: "分解三和弦" },
  { value: "seventh", label: "齐奏七和弦" },
  { value: "seventh-arpeggio", label: "分解七和弦" },
];

export default function CircleOfFifthsPage() {
  const [playMode, setPlayMode] = useState<PlayMode>("root");

  return (
    <div className="h-full overflow-auto">
      <div className="flex gap-6">
        {/* 左侧播放模式选择 */}
        <div className="bg-zinc-700 rounded-lg p-4 shrink-0">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">弹奏方法</h3>
          <RadioGroup
            value={playMode}
            onValueChange={(value) => setPlayMode(value as PlayMode)}
            className="space-y-2"
          >
            {PLAY_MODE_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value}
                  id={option.value}
                  className="border-zinc-500 text-blue-500"
                />
                <Label
                  htmlFor={option.value}
                  className="text-sm text-zinc-200 cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* 五度圈展示 */}
        <div className="bg-zinc-700 rounded-lg p-4 flex justify-center flex-1">
          <CircleOfFifths playMode={playMode} />
        </div>
      </div>
    </div>
  );
}
