"use client";

import { useState, useMemo } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getRootNotes, deriveModes } from "@/lib/modeUtils";
import { useAudio } from "@/hooks/useAudio";
import { useKeyboardStore } from "@/store/useKeyboardStore";

export default function ModePage() {
  const rootNotes = getRootNotes(3);
  const [selectedRoot, setSelectedRoot] = useState(rootNotes[0]);
  const { isReady, initAudio, playArpeggio } = useAudio();
  const { pressKeys, releaseAllKeys } = useKeyboardStore();

  // 根据选中根音推导调式
  const modes = useMemo(() => deriveModes(selectedRoot), [selectedRoot]);

  // 获取带高八度根音的音符数组（用于分解弹奏）
  const getNotesWithHighOctave = (notes: string[]) => {
    if (notes.length === 0) return notes;
    const rootNote = notes[0];
    const noteName = rootNote.replace(/\d+$/, "");
    const octave = parseInt(rootNote.match(/\d+$/)?.[0] || "3");
    const highOctaveRoot = `${noteName}${octave + 1}`;
    return [...notes, highOctaveRoot];
  };

  // 分解弹奏（升序：从低到高）
  const handlePlayAscending = async (notes: string[]) => {
    const playNotes = getNotesWithHighOctave(notes);
    if (!isReady) {
      await initAudio();
    }
    const interval = 250;
    playNotes.forEach((note, index) => {
      setTimeout(() => {
        pressKeys([note]);
      }, index * interval);
    });
    playArpeggio(playNotes, "8n", interval);
    setTimeout(() => {
      releaseAllKeys();
    }, playNotes.length * interval + 300);
  };

  // 分解弹奏（降序：从高到低）
  const handlePlayDescending = async (notes: string[]) => {
    const playNotes = getNotesWithHighOctave(notes).reverse();
    if (!isReady) {
      await initAudio();
    }
    const interval = 250;
    playNotes.forEach((note, index) => {
      setTimeout(() => {
        pressKeys([note]);
      }, index * interval);
    });
    playArpeggio(playNotes, "8n", interval);
    setTimeout(() => {
      releaseAllKeys();
    }, playNotes.length * interval + 300);
  };

  // 西方调式和中国调式分组
  const westernModes = modes.filter((m) => m.category === "western");
  const chineseModes = modes.filter((m) => m.category === "chinese");

  const renderModeTable = (modeList: typeof modes, title: string) => (
    <div className="mb-6">
      <h3 className="text-md font-medium text-zinc-300 mb-2">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-600 hover:bg-zinc-600">
            <TableHead className="text-zinc-300">调式名称</TableHead>
            <TableHead className="text-zinc-300">符号缩写</TableHead>
            <TableHead className="text-zinc-300">组成音</TableHead>
            <TableHead className="text-zinc-300 text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {modeList.map((mode) => (
            <TableRow
              key={mode.symbol}
              className="border-zinc-600 hover:bg-zinc-600"
            >
              <TableCell className="font-medium text-zinc-100">
                {mode.modeName}
              </TableCell>
              <TableCell className="text-zinc-300">{mode.symbol}</TableCell>
              <TableCell className="text-zinc-300">
                <span className="font-mono text-sm">
                  {mode.notes.join(" - ")}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-zinc-600 border-zinc-500 text-zinc-100 hover:bg-zinc-500"
                    onClick={() => handlePlayAscending(mode.notesWithOctave)}
                  >
                    ↑ 升序
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-zinc-600 border-zinc-500 text-zinc-100 hover:bg-zinc-500"
                    onClick={() => handlePlayDescending(mode.notesWithOctave)}
                  >
                    ↓ 降序
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {/* 根音选择器 */}
      <div className="flex-shrink-0 bg-zinc-700 rounded-lg p-4">
        <h2 className="text-sm font-medium text-zinc-400 mb-3">选择根音</h2>
        <Tabs value={selectedRoot} onValueChange={setSelectedRoot}>
          <TabsList className="grid grid-cols-12 w-full bg-zinc-800">
            {rootNotes.map((note) => (
              <TabsTrigger
                key={note}
                value={note}
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-zinc-300 cursor-pointer"
              >
                {note.replace(/\d+$/, "")}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 调式表格 */}
      <div className="flex-1 bg-zinc-700 rounded-lg p-4 overflow-auto">
        <h2 className="text-sm font-medium text-zinc-400 mb-3">
          {selectedRoot.replace(/\d+$/, "")} 为根音的调式
        </h2>
        {renderModeTable(westernModes, "七大中古调式")}
        {renderModeTable(chineseModes, "中国传统五声调式")}
      </div>
    </div>
  );
}
