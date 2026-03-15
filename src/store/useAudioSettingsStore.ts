import { create } from "zustand";

// 合成器类型
export type SynthType = "poly" | "fm" | "am" | "mono";

// 振荡器类型
export type OscillatorType = "sine" | "square" | "sawtooth" | "triangle";

// 效果器类型
export type EffectType = "reverb" | "delay" | "chorus" | "distortion";

// 单个效果器配置
export interface EffectConfig {
  type: EffectType;
  enabled: boolean;
  params: Record<string, number>;
}

// 合成器配置
export interface SynthConfig {
  type: SynthType;
  oscillatorType: OscillatorType;
  envelope: {
    attack: number;
    decay: number;
    sustain: number;
    release: number;
  };
  volume: number;
}

// 默认效果器参数
export const DEFAULT_EFFECT_PARAMS: Record<EffectType, Record<string, number>> = {
  reverb: { decay: 1.5, wet: 0.5 },
  delay: { delayTime: 0.25, feedback: 0.3, wet: 0.3 },
  chorus: { frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.5 },
  distortion: { distortion: 0.4, wet: 0.5 },
};

interface AudioSettingsState {
  // 合成器配置
  synthConfig: SynthConfig;
  
  // 效果器配置列表
  effects: EffectConfig[];
  
  // 更新合成器类型
  setSynthType: (type: SynthType) => void;
  
  // 更新振荡器类型
  setOscillatorType: (type: OscillatorType) => void;
  
  // 更新包络参数
  setEnvelope: (envelope: Partial<SynthConfig["envelope"]>) => void;
  
  // 更新音量
  setVolume: (volume: number) => void;
  
  // 切换效果器开关
  toggleEffect: (type: EffectType) => void;
  
  // 更新效果器参数
  setEffectParam: (type: EffectType, param: string, value: number) => void;
  
  // 添加效果器
  addEffect: (type: EffectType) => void;
  
  // 移除效果器
  removeEffect: (type: EffectType) => void;
}

export const useAudioSettingsStore = create<AudioSettingsState>((set) => ({
  synthConfig: {
    type: "poly",
    oscillatorType: "triangle",
    envelope: {
      attack: 0.01,
      decay: 0.1,
      sustain: 0.5,
      release: 0.3,
    },
    volume: -6,
  },
  
  effects: [],
  
  setSynthType: (type) =>
    set((state) => ({
      synthConfig: { ...state.synthConfig, type },
    })),
  
  setOscillatorType: (type) =>
    set((state) => ({
      synthConfig: { ...state.synthConfig, oscillatorType: type },
    })),
  
  setEnvelope: (envelope) =>
    set((state) => ({
      synthConfig: {
        ...state.synthConfig,
        envelope: { ...state.synthConfig.envelope, ...envelope },
      },
    })),
  
  setVolume: (volume) =>
    set((state) => ({
      synthConfig: { ...state.synthConfig, volume },
    })),
  
  toggleEffect: (type) =>
    set((state) => ({
      effects: state.effects.map((e) =>
        e.type === type ? { ...e, enabled: !e.enabled } : e
      ),
    })),
  
  setEffectParam: (type, param, value) =>
    set((state) => ({
      effects: state.effects.map((e) =>
        e.type === type
          ? { ...e, params: { ...e.params, [param]: value } }
          : e
      ),
    })),
  
  addEffect: (type) =>
    set((state) => {
      // 如果已存在该效果器，不重复添加
      if (state.effects.find((e) => e.type === type)) {
        return state;
      }
      return {
        effects: [
          ...state.effects,
          {
            type,
            enabled: true,
            params: { ...DEFAULT_EFFECT_PARAMS[type] },
          },
        ],
      };
    }),
  
  removeEffect: (type) =>
    set((state) => ({
      effects: state.effects.filter((e) => e.type !== type),
    })),
}));
