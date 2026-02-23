"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ToneModule = typeof import("tone");

// Lazy-load Tone.js to avoid SSR issues with Web Audio API
async function getTone(): Promise<ToneModule> {
  return import("tone");
}

const MELODY_NOTES = ["C4", "E4", "G4", "B4", "C5", "B4", "G4", "E4"];
const DRUM_STEPS = 8;

export default function Home() {
  const [toneReady, setToneReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [drumPlaying, setDrumPlaying] = useState(false);
  const [volume, setVolume] = useState(0);
  const [reverbWet, setReverbWet] = useState(0.3);
  const [delayWet, setDelayWet] = useState(0.2);
  const [activeStep, setActiveStep] = useState<number>(-1);

  // Drum grid: [kick, snare, hihat][step]
  const [drumGrid, setDrumGrid] = useState<boolean[][]>([
    [true, false, false, false, true, false, false, false],
    [false, false, true, false, false, false, true, false],
    [true, true, true, true, true, true, true, true],
  ]);

  const toneRef = useRef<ToneModule | null>(null);
  const synthRef = useRef<InstanceType<ToneModule["PolySynth"]> | null>(null);
  const kickRef = useRef<InstanceType<ToneModule["MembraneSynth"]> | null>(null);
  const snareRef = useRef<InstanceType<ToneModule["NoiseSynth"]> | null>(null);
  const hihatRef = useRef<InstanceType<ToneModule["MetalSynth"]> | null>(null);
  const reverbRef = useRef<InstanceType<ToneModule["Reverb"]> | null>(null);
  const delayRef = useRef<InstanceType<ToneModule["FeedbackDelay"]> | null>(null);
  const volRef = useRef<InstanceType<ToneModule["Volume"]> | null>(null);
  const sequenceRef = useRef<{ dispose: () => void } | null>(null);
  const drumGridRef = useRef(drumGrid);
  drumGridRef.current = drumGrid;

  // Capture initial values in refs so the init effect doesn't need them as deps
  const initVolumeRef = useRef(volume);
  const initReverbWetRef = useRef(reverbWet);
  const initDelayWetRef = useRef(delayWet);

  useEffect(() => {
    let cancelled = false;
    getTone().then((Tone) => {
      if (cancelled) return;
      toneRef.current = Tone;

      const vol = new Tone.Volume(initVolumeRef.current).toDestination();
      volRef.current = vol;

      const reverb = new Tone.Reverb({ decay: 2.5, wet: initReverbWetRef.current }).connect(vol);
      reverbRef.current = reverb;

      const delay = new Tone.FeedbackDelay("8n", 0.4).connect(vol);
      delay.wet.value = initDelayWetRef.current;
      delayRef.current = delay;

      const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.8 },
      }).connect(reverb);
      synthRef.current = synth;

      const kick = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 6 }).connect(vol);
      kickRef.current = kick;

      const snare = new Tone.NoiseSynth({
        noise: { type: "white" },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
      }).connect(reverb);
      snareRef.current = snare;

      const hihat = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
      }).connect(vol);
      hihat.volume.value = -10;
      hihatRef.current = hihat;

      setToneReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (volRef.current) volRef.current.volume.value = volume;
  }, [volume]);

  // Sync reverb wet
  useEffect(() => {
    if (reverbRef.current) reverbRef.current.wet.value = reverbWet;
  }, [reverbWet]);

  // Sync delay wet
  useEffect(() => {
    if (delayRef.current) delayRef.current.wet.value = delayWet;
  }, [delayWet]);

  const playMelody = useCallback(async () => {
    const Tone = toneRef.current;
    const synth = synthRef.current;
    if (!Tone || !synth || isPlaying) return;
    await Tone.start();
    setIsPlaying(true);

    const now = Tone.now();
    MELODY_NOTES.forEach((note, i) => {
      synth.triggerAttackRelease(note, "8n", now + i * 0.35);
    });
    setTimeout(() => setIsPlaying(false), MELODY_NOTES.length * 350 + 500);
  }, [isPlaying]);

  const toggleDrumMachine = useCallback(async () => {
    const Tone = toneRef.current;
    if (!Tone) return;
    await Tone.start();

    if (drumPlaying) {
      Tone.getTransport().stop();
      sequenceRef.current?.dispose();
      sequenceRef.current = null;
      setDrumPlaying(false);
      setActiveStep(-1);
      return;
    }

    Tone.getTransport().bpm.value = 120;
    const steps = Array.from({ length: DRUM_STEPS }, (_, i) => i);

    const seq = new Tone.Sequence(
      (time, step) => {
        const grid = drumGridRef.current;
        if (grid[0][step]) kickRef.current?.triggerAttackRelease("C1", "8n", time);
        if (grid[1][step]) snareRef.current?.triggerAttackRelease("8n", time);
        if (grid[2][step]) hihatRef.current?.triggerAttackRelease("C6", "32n", time);
        Tone.getDraw().schedule(() => setActiveStep(step as number), time);
      },
      steps,
      "8n"
    );
    seq.start(0);
    sequenceRef.current = seq;
    Tone.getTransport().start();
    setDrumPlaying(true);
  }, [drumPlaying]);

  const toggleDrumCell = (row: number, col: number) => {
    setDrumGrid((prev) =>
      prev.map((r, ri) => r.map((v, ci) => (ri === row && ci === col ? !v : v)))
    );
  };

  const drumLabels = [
    { en: "Kick", zh: "底鼓" },
    { en: "Snare", zh: "军鼓" },
    { en: "Hi-Hat", zh: "踩镲" },
  ];

  const drumColors = ["bg-purple-500", "bg-pink-500", "bg-cyan-500"];

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white">
          🎵 音频与 ToneJS
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          Audio Demo with Tone.js &amp; Next.js
        </p>
        {!toneReady && (
          <p className="mt-3 text-yellow-400 text-xs animate-pulse">正在加载音频引擎… Loading audio engine…</p>
        )}
      </header>

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Synthesizer */}
        <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800">
          <h2 className="text-xl font-semibold mb-1">🎹 合成器 Synthesizer</h2>
          <p className="text-gray-400 text-sm mb-5">点击播放旋律 / Click to play a melody</p>
          <button
            onClick={playMelody}
            disabled={!toneReady || isPlaying}
            className="px-8 py-3 rounded-xl font-semibold text-sm transition-all
              bg-violet-600 hover:bg-violet-500 active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPlaying ? "▶ 播放中… Playing…" : "▶ 播放旋律 Play Melody"}
          </button>
          <div className="mt-4 flex gap-2 flex-wrap">
            {MELODY_NOTES.map((note, i) => (
              <span
                key={i}
                className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all
                  ${isPlaying ? "border-violet-500 text-violet-300 bg-violet-900/40" : "border-gray-700 text-gray-500"}`}
              >
                {note}
              </span>
            ))}
          </div>
        </section>

        {/* Drum Machine */}
        <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800">
          <h2 className="text-xl font-semibold mb-1">🥁 鼓机 Drum Machine</h2>
          <p className="text-gray-400 text-sm mb-5">点击格子切换节拍 / Toggle beats, then start</p>
          <div className="space-y-3 mb-5">
            {drumLabels.map((label, row) => (
              <div key={row} className="flex items-center gap-3">
                <span className="w-20 text-xs text-gray-400 text-right shrink-0">
                  {label.zh}<br />
                  <span className="text-gray-600">{label.en}</span>
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {drumGrid[row].map((active, col) => (
                    <button
                      key={col}
                      onClick={() => toggleDrumCell(row, col)}
                      className={`w-9 h-9 rounded-lg border transition-all text-xs font-bold
                        ${col === activeStep && drumPlaying ? "scale-110 brightness-150 border-white" : "border-gray-700"}
                        ${active
                          ? `${drumColors[row]} text-white`
                          : "bg-gray-800 text-gray-600 hover:bg-gray-700"
                        }`}
                    >
                      {col + 1}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={toggleDrumMachine}
            disabled={!toneReady}
            className={`px-8 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95
              disabled:opacity-40 disabled:cursor-not-allowed
              ${drumPlaying
                ? "bg-red-600 hover:bg-red-500"
                : "bg-emerald-600 hover:bg-emerald-500"
              }`}
          >
            {drumPlaying ? "⏹ 停止 Stop" : "▶ 开始 Start"}
          </button>
        </section>

        {/* Effects & Volume */}
        <section className="bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-800">
          <h2 className="text-xl font-semibold mb-5">🎛️ 效果器 Effects &amp; Volume</h2>
          <div className="space-y-5">
            <SliderRow
              label="音量 Volume"
              value={volume}
              min={-30}
              max={6}
              step={1}
              unit="dB"
              color="bg-blue-500"
              onChange={setVolume}
            />
            <SliderRow
              label="混响 Reverb"
              value={reverbWet}
              min={0}
              max={1}
              step={0.01}
              unit=""
              color="bg-indigo-500"
              onChange={setReverbWet}
              format={(v) => `${Math.round(v * 100)}%`}
            />
            <SliderRow
              label="延迟 Delay"
              value={delayWet}
              min={0}
              max={1}
              step={0.01}
              unit=""
              color="bg-teal-500"
              onChange={setDelayWet}
              format={(v) => `${Math.round(v * 100)}%`}
            />
          </div>
        </section>
      </div>

      <footer className="mt-12 text-center text-gray-700 text-xs">
        Built with Next.js + Tone.js · 音频演示
      </footer>
    </main>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  color,
  onChange,
  format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const display = format ? format(value) : `${value}${unit}`;
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-4">
      <span className="w-28 text-sm text-gray-300 shrink-0">{label}</span>
      <div className="relative flex-1 h-2 bg-gray-700 rounded-full">
        <div
          className={`absolute left-0 top-0 h-2 rounded-full ${color} transition-all`}
          style={{ width: `${pct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <span className="w-14 text-right text-sm font-mono text-gray-300">{display}</span>
    </div>
  );
}
