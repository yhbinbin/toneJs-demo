"use client";

import { useEffect } from "react";
import {
  useAudioSettingsStore,
  EffectType,
  DEFAULT_EFFECT_PARAMS,
} from "@/store/useAudioSettingsStore";
import { useAudio } from "@/hooks/useAudio";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const EFFECT_INFO: Record<EffectType, { label: string; icon: string; description: string }> = {
  reverb: {
    label: "混响 Reverb",
    icon: "🏛️",
    description: "模拟空间反射，增加声音的空间感",
  },
  delay: {
    label: "延迟 Delay",
    icon: "📢",
    description: "创建回声效果，声音会重复播放",
  },
  chorus: {
    label: "合唱 Chorus",
    icon: "👥",
    description: "创建多声部效果，使声音更加丰满",
  },
  distortion: {
    label: "失真 Distortion",
    icon: "⚡",
    description: "增加声音的粗糙感和攻击性",
  },
};

const EFFECT_PARAMS: Record<EffectType, { key: string; label: string; min: number; max: number; step: number }[]> = {
  reverb: [
    { key: "decay", label: "衰减时间", min: 0.1, max: 10, step: 0.1 },
    { key: "wet", label: "干湿比", min: 0, max: 1, step: 0.01 },
  ],
  delay: [
    { key: "delayTime", label: "延迟时间", min: 0.01, max: 1, step: 0.01 },
    { key: "feedback", label: "反馈量", min: 0, max: 0.9, step: 0.01 },
    { key: "wet", label: "干湿比", min: 0, max: 1, step: 0.01 },
  ],
  chorus: [
    { key: "frequency", label: "频率", min: 0.1, max: 10, step: 0.1 },
    { key: "depth", label: "深度", min: 0, max: 1, step: 0.01 },
    { key: "wet", label: "干湿比", min: 0, max: 1, step: 0.01 },
  ],
  distortion: [
    { key: "distortion", label: "失真度", min: 0, max: 1, step: 0.01 },
    { key: "wet", label: "干湿比", min: 0, max: 1, step: 0.01 },
  ],
};

export default function EffectsPage() {
  const { effects, addEffect, removeEffect, toggleEffect, setEffectParam } =
    useAudioSettingsStore();
  const { synthConfig } = useAudioSettingsStore();
  const { isReady, initAudio, updateSynth, updateEffects, updateEffectParam, playNote } = useAudio();

  // 当效果器配置改变时更新 AudioService
  useEffect(() => {
    if (isReady) {
      updateEffects(effects);
    }
  }, [effects, isReady, updateEffects]);

  // 测试音效
  const handleTestSound = async () => {
    if (!isReady) {
      await initAudio();
      updateSynth(synthConfig);
      updateEffects(effects);
    }
    // 播放一个短旋律来展示效果
    const notes = ["C4", "E4", "G4", "C5"];
    notes.forEach((note, i) => {
      setTimeout(() => playNote(note, "8n"), i * 200);
    });
  };

  // 可添加的效果器列表（排除已添加的）
  const availableEffects = (Object.keys(EFFECT_INFO) as EffectType[]).filter(
    (type) => !effects.find((e) => e.type === type)
  );

  // 处理参数变化
  const handleParamChange = (type: EffectType, param: string, value: number) => {
    setEffectParam(type, param, value);
    if (isReady) {
      updateEffectParam(type, param, value);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">效果器设置</h1>
        <p className="text-zinc-400 mt-1">添加和配置音频效果器，改变声音的质感</p>
      </div>

      {/* 添加效果器 */}
      {availableEffects.length > 0 && (
        <div className="bg-zinc-700 rounded-lg p-4 space-y-3">
          <h2 className="text-sm font-medium text-zinc-300">添加效果器</h2>
          <div className="flex flex-wrap gap-2">
            {availableEffects.map((type) => (
              <Button
                key={type}
                variant="outline"
                className="bg-zinc-600 border-zinc-500 text-zinc-100 hover:bg-zinc-500"
                onClick={() => addEffect(type)}
              >
                {EFFECT_INFO[type].icon} {EFFECT_INFO[type].label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 已添加的效果器列表 */}
      {effects.length === 0 ? (
        <div className="bg-zinc-700 rounded-lg p-8 text-center">
          <p className="text-zinc-400">暂无效果器，点击上方按钮添加</p>
        </div>
      ) : (
        <div className="space-y-4">
          {effects.map((effect) => {
            const info = EFFECT_INFO[effect.type];
            const params = EFFECT_PARAMS[effect.type];

            return (
              <div
                key={effect.type}
                className={`bg-zinc-700 rounded-lg p-4 space-y-4 border-l-4 ${
                  effect.enabled ? "border-blue-500" : "border-zinc-600"
                }`}
              >
                {/* 效果器头部 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <h3 className="font-medium text-zinc-100">{info.label}</h3>
                      <p className="text-xs text-zinc-400">{info.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={effect.enabled ? "default" : "outline"}
                      className={
                        effect.enabled
                          ? "bg-blue-600 hover:bg-blue-500"
                          : "bg-zinc-600 border-zinc-500"
                      }
                      onClick={() => toggleEffect(effect.type)}
                    >
                      {effect.enabled ? "已启用" : "已禁用"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-red-900/30 border-red-800 text-red-400 hover:bg-red-800/50"
                      onClick={() => removeEffect(effect.type)}
                    >
                      移除
                    </Button>
                  </div>
                </div>

                {/* 参数调节 */}
                {effect.enabled && (
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-600">
                    {params.map((param) => (
                      <div key={param.key}>
                        <Label className="text-xs text-zinc-400">
                          {param.label}: {effect.params[param.key]?.toFixed(2)}
                        </Label>
                        <input
                          type="range"
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          value={effect.params[param.key] ?? 0}
                          onChange={(e) =>
                            handleParamChange(effect.type, param.key, parseFloat(e.target.value))
                          }
                          className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 测试按钮 */}
      <div className="flex gap-3">
        <Button onClick={handleTestSound} className="bg-blue-600 hover:bg-blue-500">
          🎵 测试效果
        </Button>
        <span className="text-xs text-zinc-500 self-center">
          提示：效果器按添加顺序串联，信号流：合成器 → 效果器链 → 输出
        </span>
      </div>
    </div>
  );
}
