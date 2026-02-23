// 音符常量
export const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
export type NoteName = (typeof NOTES)[number];

// 三和弦类型定义
export interface TriadType {
  name: string;           // 和弦类型名称
  symbol: string;         // 和弦符号后缀
  intervals: number[];    // 半音间隔 [根音到三音, 根音到五音]
}

// 七和弦类型定义
export interface SeventhChordType {
  name: string;           // 和弦类型名称
  symbol: string;         // 和弦符号后缀
  intervals: number[];    // 半音间隔 [根音到三音, 根音到五音, 根音到七音]
}

// 所有三和弦类型
export const TRIAD_TYPES: TriadType[] = [
  { name: "大三和弦", symbol: "", intervals: [4, 7] },
  { name: "小三和弦", symbol: "m", intervals: [3, 7] },
  { name: "增三和弦", symbol: "aug", intervals: [4, 8] },
  { name: "减三和弦", symbol: "dim", intervals: [3, 6] },
  { name: "挂四和弦", symbol: "sus4", intervals: [5, 7] },
  { name: "挂二和弦", symbol: "sus2", intervals: [2, 7] },
];

// 所有七和弦类型
export const SEVENTH_CHORD_TYPES: SeventhChordType[] = [
  { name: "大七和弦", symbol: "maj7", intervals: [4, 7, 11] },
  { name: "小七和弦", symbol: "m7", intervals: [3, 7, 10] },
  { name: "属七和弦", symbol: "7", intervals: [4, 7, 10] },
  { name: "半减七和弦", symbol: "m7b5", intervals: [3, 6, 10] },
  { name: "减七和弦", symbol: "dim7", intervals: [3, 6, 9] },
  { name: "小大七和弦", symbol: "mM7", intervals: [3, 7, 11] },
  { name: "增大七和弦", symbol: "aug7", intervals: [4, 8, 11] },
];

// 和弦结果
export interface ChordResult {
  name: string;           // 完整和弦名称，如 "Cmaj"
  typeName: string;       // 和弦类型名称，如 "大三和弦"
  symbol: string;         // 和弦符号，如 "C"
  notes: string[];        // 组成音名，如 ["C", "E", "G"]
  notesWithOctave: string[]; // 带八度的组成音，如 ["C3", "E3", "G3"]
}

/**
 * 获取音符在音阶中的索引
 */
export function getNoteIndex(note: string): number {
  // 提取音名（去除八度数字）
  const noteName = note.replace(/\d+$/, "");
  return NOTES.indexOf(noteName as NoteName);
}

/**
 * 根据根音索引和半音间隔获取目标音符
 */
export function getNoteByInterval(rootIndex: number, interval: number, octave: number): string {
  const targetIndex = (rootIndex + interval) % 12;
  const octaveOffset = Math.floor((rootIndex + interval) / 12);
  return `${NOTES[targetIndex]}${octave + octaveOffset}`;
}

/**
 * 根据根音推导所有三和弦
 * @param rootNote 根音，如 "C3"
 * @returns 所有三和弦结果
 */
export function deriveTriads(rootNote: string): ChordResult[] {
  const noteName = rootNote.replace(/\d+$/, "");
  const octave = parseInt(rootNote.match(/\d+$/)?.[0] || "4");
  const rootIndex = getNoteIndex(rootNote);

  if (rootIndex === -1) {
    throw new Error(`Invalid note: ${rootNote}`);
  }

  return TRIAD_TYPES.map((triad) => {
    const thirdNote = getNoteByInterval(rootIndex, triad.intervals[0], octave);
    const fifthNote = getNoteByInterval(rootIndex, triad.intervals[1], octave);

    return {
      name: `${noteName}${triad.symbol}`,
      typeName: triad.name,
      symbol: `${noteName}${triad.symbol}`,
      notes: [
        noteName,
        thirdNote.replace(/\d+$/, ""),
        fifthNote.replace(/\d+$/, ""),
      ],
      notesWithOctave: [rootNote, thirdNote, fifthNote],
    };
  });
}

/**
 * 获取C3到B3的所有根音
 */
export function getRootNotes(octave: number = 3): string[] {
  return NOTES.map((note) => `${note}${octave}`);
}

/**
 * 根据根音推导所有七和弦
 * @param rootNote 根音，如 "C3"
 * @returns 所有七和弦结果
 */
export function deriveSeventhChords(rootNote: string): ChordResult[] {
  const noteName = rootNote.replace(/\d+$/, "");
  const octave = parseInt(rootNote.match(/\d+$/)?.[0] || "4");
  const rootIndex = getNoteIndex(rootNote);

  if (rootIndex === -1) {
    throw new Error(`Invalid note: ${rootNote}`);
  }

  return SEVENTH_CHORD_TYPES.map((chord) => {
    const thirdNote = getNoteByInterval(rootIndex, chord.intervals[0], octave);
    const fifthNote = getNoteByInterval(rootIndex, chord.intervals[1], octave);
    const seventhNote = getNoteByInterval(rootIndex, chord.intervals[2], octave);

    return {
      name: `${noteName}${chord.symbol}`,
      typeName: chord.name,
      symbol: `${noteName}${chord.symbol}`,
      notes: [
        noteName,
        thirdNote.replace(/\d+$/, ""),
        fifthNote.replace(/\d+$/, ""),
        seventhNote.replace(/\d+$/, ""),
      ],
      notesWithOctave: [rootNote, thirdNote, fifthNote, seventhNote],
    };
  });
}

/**
 * 获取大三和弦（用于五度圈外圈）
 * @param rootNote 根音，如 "C3"
 */
export function getMajorTriad(rootNote: string): string[] {
  const noteName = rootNote.replace(/\d+$/, "");
  const octave = parseInt(rootNote.match(/\d+$/)?.[0] || "3");
  const rootIndex = getNoteIndex(rootNote);
  
  if (rootIndex === -1) return [rootNote];
  
  const intervals = [0, 4, 7]; // 大三和弦
  return intervals.map((interval) => getNoteByInterval(rootIndex, interval, octave));
}

/**
 * 获取小三和弦（用于五度圈内圈）
 * @param rootNote 根音，如 "A3"
 */
export function getMinorTriad(rootNote: string): string[] {
  const noteName = rootNote.replace(/\d+$/, "");
  const octave = parseInt(rootNote.match(/\d+$/)?.[0] || "3");
  const rootIndex = getNoteIndex(rootNote);
  
  if (rootIndex === -1) return [rootNote];
  
  const intervals = [0, 3, 7]; // 小三和弦
  return intervals.map((interval) => getNoteByInterval(rootIndex, interval, octave));
}

/**
 * 获取大七和弦（用于五度圈外圈）
 * @param rootNote 根音，如 "C3"
 */
export function getMajorSeventhChord(rootNote: string): string[] {
  const noteName = rootNote.replace(/\d+$/, "");
  const octave = parseInt(rootNote.match(/\d+$/)?.[0] || "3");
  const rootIndex = getNoteIndex(rootNote);
  
  if (rootIndex === -1) return [rootNote];
  
  const intervals = [0, 4, 7, 11]; // 大七和弦
  return intervals.map((interval) => getNoteByInterval(rootIndex, interval, octave));
}

/**
 * 获取小七和弦（用于五度圈内圈）
 * @param rootNote 根音，如 "A3"
 */
export function getMinorSeventhChord(rootNote: string): string[] {
  const noteName = rootNote.replace(/\d+$/, "");
  const octave = parseInt(rootNote.match(/\d+$/)?.[0] || "3");
  const rootIndex = getNoteIndex(rootNote);
  
  if (rootIndex === -1) return [rootNote];
  
  const intervals = [0, 3, 7, 10]; // 小七和弦
  return intervals.map((interval) => getNoteByInterval(rootIndex, interval, octave));
}

/**
 * 标准化音符名称（处理等音转换，如 Db -> C#）
 */
export function normalizeNoteName(name: string): string {
  const enharmonicMap: Record<string, string> = {
    "Db": "C#",
    "Eb": "D#",
    "Gb": "F#",
    "Ab": "G#",
    "Bb": "A#",
    "Cb": "B",
    "Fb": "E",
  };
  
  // 处理如 "Db/C#" 这样的格式，取第一个
  const firstName = name.split("/")[0].trim();
  return enharmonicMap[firstName] || firstName;
}
