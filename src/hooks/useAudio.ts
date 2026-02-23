"use client";

import { useCallback, useEffect, useState } from "react";
import { audioService } from "@/services/AudioService";

export function useAudio() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 检查是否已初始化
    setIsReady(audioService.getIsInitialized());
  }, []);

  // 初始化音频（需要用户交互触发）
  const initAudio = useCallback(async () => {
    await audioService.init();
    setIsReady(true);
  }, []);

  // 播放音符
  const playNote = useCallback(
    (note: string, duration: string | number = "8n") => {
      audioService.playNote(note, duration);
    },
    []
  );

  // 按下音符（持续发声）
  const attackNote = useCallback((note: string) => {
    audioService.attackNote(note);
  }, []);

  // 释放音符
  const releaseNote = useCallback((note: string) => {
    audioService.releaseNote(note);
  }, []);

  // 播放和弦
  const playChord = useCallback(
    (notes: string[], duration: string | number = "4n") => {
      audioService.playChord(notes, duration);
    },
    []
  );

  // 分解弹奏（琶音）
  const playArpeggio = useCallback(
    (
      notes: string[],
      noteDuration: string | number = "8n",
      interval: number = 200
    ) => {
      audioService.playArpeggio(notes, noteDuration, interval);
    },
    []
  );

  // 按下和弦
  const attackChord = useCallback((notes: string[]) => {
    audioService.attackChord(notes);
  }, []);

  // 释放所有音符
  const releaseAll = useCallback(() => {
    audioService.releaseAll();
  }, []);

  // 设置音量
  const setVolume = useCallback((volume: number) => {
    audioService.setVolume(volume);
  }, []);

  return {
    isReady,
    initAudio,
    playNote,
    attackNote,
    releaseNote,
    playChord,
    playArpeggio,
    attackChord,
    releaseAll,
    setVolume,
  };
}
