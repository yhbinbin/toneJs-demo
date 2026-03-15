"use client";

import * as Tone from "tone";
import type {
  SynthType,
  EffectConfig,
  SynthConfig,
} from "@/store/useAudioSettingsStore";

// 合成器基类型（支持 trigger 方法的合成器）
type BaseSynth = Tone.PolySynth | Tone.MonoSynth;

// 效果器实例映射
type EffectInstance = Tone.Reverb | Tone.FeedbackDelay | Tone.Chorus | Tone.Distortion;

class AudioService {
  private static instance: AudioService;
  private synth: BaseSynth | null = null;
  private effects: Map<string, EffectInstance> = new Map();
  private isInitialized = false;
  
  // 当前配置
  private currentSynthConfig: SynthConfig | null = null;

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  // 初始化音频上下文
  async init(): Promise<void> {
    if (this.isInitialized) return;

    await Tone.start();
    // 默认创建一个 PolySynth
    this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    this.isInitialized = true;
    console.log("AudioService initialized");
  }

  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  // 创建合成器实例
  private createSynth(config: SynthConfig): BaseSynth {
    const { type, oscillatorType, envelope } = config;
    
    const envelopeOptions = {
      attack: envelope.attack,
      decay: envelope.decay,
      sustain: envelope.sustain,
      release: envelope.release,
    };

    let synth: BaseSynth;

    switch (type) {
      case "fm":
        synth = new Tone.PolySynth(Tone.FMSynth, {
          oscillator: { type: oscillatorType },
          envelope: envelopeOptions,
        });
        break;
      case "am":
        synth = new Tone.PolySynth(Tone.AMSynth, {
          oscillator: { type: oscillatorType },
          envelope: envelopeOptions,
        });
        break;
      case "mono":
        synth = new Tone.MonoSynth({
          oscillator: { type: oscillatorType },
          envelope: envelopeOptions,
        });
        break;
      case "poly":
      default:
        synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: oscillatorType },
          envelope: envelopeOptions,
        });
        break;
    }

    synth.volume.value = config.volume;
    return synth;
  }

  // 创建效果器实例
  private createEffect(config: EffectConfig): EffectInstance {
    const { type, params } = config;

    switch (type) {
      case "reverb":
        return new Tone.Reverb({
          decay: params.decay,
          wet: params.wet,
        });
      case "delay":
        return new Tone.FeedbackDelay({
          delayTime: params.delayTime,
          feedback: params.feedback,
          wet: params.wet,
        });
      case "chorus":
        return new Tone.Chorus({
          frequency: params.frequency,
          delayTime: params.delayTime,
          depth: params.depth,
          wet: params.wet,
        }).start();
      case "distortion":
        return new Tone.Distortion({
          distortion: params.distortion,
          wet: params.wet,
        });
      default:
        throw new Error(`Unknown effect type: ${type}`);
    }
  }

  // 更新合成器配置
  updateSynth(config: SynthConfig): void {
    if (!this.isInitialized) {
      console.warn("AudioService not initialized");
      return;
    }

    // 保存旧的合成器
    const oldSynth = this.synth;

    // 创建新的合成器
    this.synth = this.createSynth(config);
    this.currentSynthConfig = config;

    // 重新连接效果器链
    this.rebuildEffectChain();

    // 销毁旧合成器
    if (oldSynth) {
      oldSynth.dispose();
    }

    console.log(`Synth updated to: ${config.type}`);
  }

  // 更新效果器配置
  updateEffects(effectConfigs: EffectConfig[]): void {
    if (!this.isInitialized) {
      console.warn("AudioService not initialized");
      return;
    }

    // 销毁所有现有效果器
    this.effects.forEach((effect) => effect.dispose());
    this.effects.clear();

    // 创建新的效果器
    effectConfigs
      .filter((config) => config.enabled)
      .forEach((config) => {
        const effect = this.createEffect(config);
        this.effects.set(config.type, effect);
      });

    // 重新连接效果器链
    this.rebuildEffectChain();

    console.log(`Effects updated: ${effectConfigs.filter(e => e.enabled).map(e => e.type).join(", ") || "none"}`);
  }

  // 重建效果器链：Synth -> Effects -> Destination
  private rebuildEffectChain(): void {
    if (!this.synth) return;

    // 断开所有连接
    this.synth.disconnect();
    this.effects.forEach((effect) => effect.disconnect());

    // 按顺序连接效果器
    const effectsArray = Array.from(this.effects.values());

    if (effectsArray.length === 0) {
      // 无效果器，直接连接到输出
      this.synth.toDestination();
    } else {
      // 连接效果器链
      let lastNode: Tone.ToneAudioNode = this.synth;
      effectsArray.forEach((effect) => {
        lastNode.connect(effect);
        lastNode = effect;
      });
      lastNode.toDestination();
    }
  }

  // 更新单个效果器参数
  updateEffectParam(type: string, param: string, value: number): void {
    const effect = this.effects.get(type);
    if (!effect) return;

    switch (type) {
      case "reverb":
        if (param === "wet") (effect as Tone.Reverb).wet.value = value;
        break;
      case "delay":
        if (param === "wet") (effect as Tone.FeedbackDelay).wet.value = value;
        if (param === "feedback") (effect as Tone.FeedbackDelay).feedback.value = value;
        if (param === "delayTime") (effect as Tone.FeedbackDelay).delayTime.value = value;
        break;
      case "chorus":
        if (param === "wet") (effect as Tone.Chorus).wet.value = value;
        if (param === "frequency") (effect as Tone.Chorus).frequency.value = value;
        if (param === "depth") (effect as Tone.Chorus).depth = value;
        break;
      case "distortion":
        if (param === "wet") (effect as Tone.Distortion).wet.value = value;
        if (param === "distortion") (effect as Tone.Distortion).distortion = value;
        break;
    }
  }

  // 播放单个音符
  playNote(note: string, duration: string | number = "8n"): void {
    if (!this.synth || !this.isInitialized) {
      console.warn("AudioService not initialized. Call init() first.");
      return;
    }
    this.synth.triggerAttackRelease(note, duration);
  }

  // 按下音符
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
    // MonoSynth 的 triggerRelease 不接受参数
    if (this.synth instanceof Tone.MonoSynth) {
      this.synth.triggerRelease();
    } else {
      (this.synth as Tone.PolySynth).triggerRelease(note);
    }
  }

  // 播放和弦
  playChord(notes: string[], duration: string | number = "4n"): void {
    if (!this.synth || !this.isInitialized) {
      console.warn("AudioService not initialized. Call init() first.");
      return;
    }
    // MonoSynth 只能播放单音，取第一个音
    if (this.synth instanceof Tone.MonoSynth) {
      this.synth.triggerAttackRelease(notes[0], duration);
    } else {
      (this.synth as Tone.PolySynth).triggerAttackRelease(notes, duration);
    }
  }

  // 按下和弦
  attackChord(notes: string[]): void {
    if (!this.synth || !this.isInitialized) {
      console.warn("AudioService not initialized. Call init() first.");
      return;
    }
    // MonoSynth 只能播放单音，取第一个音
    if (this.synth instanceof Tone.MonoSynth) {
      this.synth.triggerAttack(notes[0]);
    } else {
      (this.synth as Tone.PolySynth).triggerAttack(notes);
    }
  }

  // 释放所有音符
  releaseAll(): void {
    if (!this.synth || !this.isInitialized) return;
    // MonoSynth 使用 triggerRelease，PolySynth 使用 releaseAll
    if (this.synth instanceof Tone.MonoSynth) {
      this.synth.triggerRelease();
    } else {
      (this.synth as Tone.PolySynth).releaseAll();
    }
  }

  // 分解弹奏
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

  // 设置音量
  setVolume(volume: number): void {
    if (!this.synth) return;
    this.synth.volume.value = volume;
  }

  // 获取合成器实例
  getSynth(): BaseSynth | null {
    return this.synth;
  }

  // 销毁资源
  dispose(): void {
    if (this.synth) {
      this.synth.dispose();
      this.synth = null;
    }
    this.effects.forEach((effect) => effect.dispose());
    this.effects.clear();
    this.isInitialized = false;
  }
}

export const audioService = AudioService.getInstance();
export default AudioService;
