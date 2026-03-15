"use client";

import { useEffect } from "react";
import { useAudioSettingsStore, SynthType, OscillatorType } from "@/store/useAudioSettingsStore";
import { useAudio } from "@/hooks/useAudio";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";

const SYNTH_TYPES: { value: SynthType; label: string; description: string }[] = [
  { value: "poly", label: "Poly Synth", description: "多复音合成器，可同时演奏多个音符" },
  { value: "fm", label: "FM Synth", description: "频率调制合成器，富有金属质感" },
  { value: "am", label: "AM Synth", description: "振幅调制合成器，柔和的颤音效果" },
  { value: "mono", label: "Mono Synth", description: "单音合成器，一次只能演奏一个音符" },
];

const OSCILLATOR_TYPES: { value: OscillatorType; label: string; icon: string }[] = [
  { value: "sine", label: "正弦波", icon: "〜" },
  { value: "square", label: "方波", icon: "⊓" },
  { value: "sawtooth", label: "锯齿波", icon: "⋀" },
  { value: "triangle", label: "三角波", icon: "△" },
];

export default function SynthPage() {
  const { synthConfig, setSynthType, setOscillatorType, setEnvelope, setVolume } =
    useAudioSettingsStore();
  const { isReady, initAudio, updateSynth, playNote } = useAudio();

  // 当配置改变时更新 AudioService
  useEffect(() => {
    if (isReady) {
      updateSynth(synthConfig);
    }
  }, [synthConfig, isReady, updateSynth]);

  // 测试音色
  const handleTestSound = async () => {
    if (!isReady) {
      await initAudio();
      updateSynth(synthConfig);
    }
    playNote("C4", "8n");
  };

  // 测试和弦
  const handleTestChord = async () => {
    if (!isReady) {
      await initAudio();
      updateSynth(synthConfig);
    }
    // 播放 C 大三和弦
    const notes = ["C4", "E4", "G4"];
    notes.forEach((note, i) => {
      setTimeout(() => playNote(note, "4n"), i * 100);
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">合成器设置</h1>
        <p className="text-zinc-400 mt-1">选择和配置音频合成器，影响全局键盘发声</p>
      </div>

      {/* 合成器类型选择 */}
      <div className="bg-zinc-700 rounded-lg p-4 space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">合成器类型</h2>
        <RadioGroup
          value={synthConfig.type}
          onValueChange={(value) => setSynthType(value as SynthType)}
          className="grid grid-cols-2 gap-4"
        >
          {SYNTH_TYPES.map((synth) => (
            <div
              key={synth.value}
              className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                synthConfig.type === synth.value
                  ? "border-blue-500 bg-zinc-600"
                  : "border-zinc-600 hover:border-zinc-500"
              }`}
              onClick={() => setSynthType(synth.value)}
            >
              <RadioGroupItem
                value={synth.value}
                id={synth.value}
                className="border-zinc-500 text-blue-500 mt-1"
              />
              <div>
                <Label
                  htmlFor={synth.value}
                  className="text-sm font-medium text-zinc-100 cursor-pointer"
                >
                  {synth.label}
                </Label>
                <p className="text-xs text-zinc-400 mt-1">{synth.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* 振荡器类型 */}
      <div className="bg-zinc-700 rounded-lg p-4 space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">振荡器波形</h2>
        <div className="flex gap-3">
          {OSCILLATOR_TYPES.map((osc) => (
            <button
              key={osc.value}
              onClick={() => setOscillatorType(osc.value)}
              className={`flex-1 p-3 rounded-lg border text-center transition-colors ${
                synthConfig.oscillatorType === osc.value
                  ? "border-blue-500 bg-zinc-600"
                  : "border-zinc-600 hover:border-zinc-500"
              }`}
            >
              <div className="text-2xl mb-1">{osc.icon}</div>
              <div className="text-xs text-zinc-300">{osc.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 包络参数 ADSR */}
      <div className="bg-zinc-700 rounded-lg p-4 space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">包络参数 (ADSR)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-zinc-400">Attack (起音): {synthConfig.envelope.attack.toFixed(2)}s</Label>
            <input
              type="range"
              min="0.001"
              max="2"
              step="0.01"
              value={synthConfig.envelope.attack}
              onChange={(e) => setEnvelope({ attack: parseFloat(e.target.value) })}
              className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400">Decay (衰减): {synthConfig.envelope.decay.toFixed(2)}s</Label>
            <input
              type="range"
              min="0.001"
              max="2"
              step="0.01"
              value={synthConfig.envelope.decay}
              onChange={(e) => setEnvelope({ decay: parseFloat(e.target.value) })}
              className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400">Sustain (延持): {(synthConfig.envelope.sustain * 100).toFixed(0)}%</Label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={synthConfig.envelope.sustain}
              onChange={(e) => setEnvelope({ sustain: parseFloat(e.target.value) })}
              className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <Label className="text-xs text-zinc-400">Release (释放): {synthConfig.envelope.release.toFixed(2)}s</Label>
            <input
              type="range"
              min="0.001"
              max="3"
              step="0.01"
              value={synthConfig.envelope.release}
              onChange={(e) => setEnvelope({ release: parseFloat(e.target.value) })}
              className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* 音量 */}
      <div className="bg-zinc-700 rounded-lg p-4 space-y-4">
        <h2 className="text-sm font-medium text-zinc-300">主音量: {synthConfig.volume} dB</h2>
        <input
          type="range"
          min="-30"
          max="0"
          step="1"
          value={synthConfig.volume}
          onChange={(e) => setVolume(parseInt(e.target.value))}
          className="w-full h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* 测试按钮 */}
      <div className="flex gap-3">
        <Button
          onClick={handleTestSound}
          className="bg-blue-600 hover:bg-blue-500"
        >
          🎵 测试单音
        </Button>
        <Button
          onClick={handleTestChord}
          variant="outline"
          className="bg-zinc-600 border-zinc-500 text-zinc-100 hover:bg-zinc-500"
        >
          🎹 测试和弦
        </Button>
      </div>
    </div>
  );
}
