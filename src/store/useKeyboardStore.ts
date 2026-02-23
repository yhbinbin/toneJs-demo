import { create } from "zustand";

// 音符类型，如 "C4", "D#5" 等
export type Note = string;

interface KeyboardState {
  // 当前按下的键值集合
  pressedKeys: Set<Note>;

  // 高亮显示的键值集合（用于教学展示等）
  highlightedKeys: Set<Note>;

  // 按下一个键
  pressKey: (note: Note) => void;

  // 释放一个键
  releaseKey: (note: Note) => void;

  // 同时按下多个键
  pressKeys: (notes: Note[]) => void;

  // 释放所有键
  releaseAllKeys: () => void;

  // 设置高亮的键
  setHighlightedKeys: (notes: Note[]) => void;

  // 清除所有高亮
  clearHighlightedKeys: () => void;

  // 检查某个键是否被按下
  isKeyPressed: (note: Note) => boolean;

  // 检查某个键是否高亮
  isKeyHighlighted: (note: Note) => boolean;
}

export const useKeyboardStore = create<KeyboardState>((set, get) => ({
  pressedKeys: new Set<Note>(),
  highlightedKeys: new Set<Note>(),

  pressKey: (note) =>
    set((state) => ({
      pressedKeys: new Set(state.pressedKeys).add(note),
    })),

  releaseKey: (note) =>
    set((state) => {
      const newKeys = new Set(state.pressedKeys);
      newKeys.delete(note);
      return { pressedKeys: newKeys };
    }),

  pressKeys: (notes) =>
    set(() => ({
      pressedKeys: new Set(notes),
    })),

  releaseAllKeys: () =>
    set(() => ({
      pressedKeys: new Set<Note>(),
    })),

  setHighlightedKeys: (notes) =>
    set(() => ({
      highlightedKeys: new Set(notes),
    })),

  clearHighlightedKeys: () =>
    set(() => ({
      highlightedKeys: new Set<Note>(),
    })),

  isKeyPressed: (note) => get().pressedKeys.has(note),

  isKeyHighlighted: (note) => get().highlightedKeys.has(note),
}));
