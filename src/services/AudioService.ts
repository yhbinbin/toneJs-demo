"use client";

import * as Tone from "tone";

// 单例模式管理 Tone.js 资源
class AudioService {
  private static instance: AudioService;
  private synth: Tone.PolySynth | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  // 初始化音频上下文（需要用户交互后调用）
  async init(): Promise<void> {
    if (this.isInitialized) return;

    await Tone.start();
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.isInitialized = true;
    console.log("AudioService initialized");
  }

  // 检查是否已初始化
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  // 播放单个音符
  playNote(note: string, duration: string | number = "8n"): void {
    if (!this.synth || !this.isInitialized) {
      console.warn("AudioService not initialized. Call init() first.");
      return;
    }
    this.synth.triggerAttackRelease(note, duration);
  }

  // 按下音符（持续发声）
  attackNote(note: string): void {
    if (!this.synth || !this.isInitialized) {
      console.warn("AudioService not initialized. Call init() first.");
      return;
    }
    this.synth.triggerAttack(note);
  }

  // 释放音符
  releaseNote(note: string): void {
    if (!this.synth || !this.isInitialized) {
      console.warn("AudioService not initialized. Call init() first.");
      return;
    }
    this.synth.triggerRelease(note);
  }

  // 同时播放多个音符（和弦）
  playChord(notes: string[], duration: string | number = "4n"): void {
    if (!this.synth || !this.isInitialized) {
      console.warn("AudioService not initialized. Call init() first.");
      return;
    }
    this.synth.triggerAttackRelease(notes, duration);
  }

  // 按下多个音符
  attackChord(notes: string[]): void {
    if (!this.synth || !this.isInitialized) {
      console.warn("AudioService not initialized. Call init() first.");
      return;
    }
    this.synth.triggerAttack(notes);
  }

  // 释放所有音符
  releaseAll(): void {
    if (!this.synth || !this.isInitialized) return;
    this.synth.releaseAll();
  }

  // 分解弹奏（琶音）- 依次播放每个音符
  playArpeggio(
    notes: string[],
    noteDuration: string | number = "8n",
    interval: number = 200
  ): void {
    if (!this.synth || !this.isInitialized) {
      console.warn("AudioService not initialized. Call init() first.");
      return;
    }
    notes.forEach((note, index) => {
      setTimeout(() => {
        this.synth?.triggerAttackRelease(note, noteDuration);
      }, index * interval);
    });
  }

  // 设置音量 (dB)
  setVolume(volume: number): void {
    if (!this.synth) return;
    this.synth.volume.value = volume;
  }

  // 获取合成器实例（高级用法）
  getSynth(): Tone.PolySynth | null {
    return this.synth;
  }

  // 销毁资源
  dispose(): void {
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    this.isInitialized = false;
  }
}

export const audioService = AudioService.getInstance();
export default AudioService;
