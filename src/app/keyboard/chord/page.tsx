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
import { getRootNotes, deriveTriads, deriveSeventhChords } from "@/lib/chordUtils";
import { useAudio } from "@/hooks/useAudio";
import { useKeyboardStore } from "@/store/useKeyboardStore";

export default function ChordPage() {
  const rootNotes = getRootNotes(3);
  const [selectedRoot, setSelectedRoot] = useState(rootNotes[0]);
  const { isReady, initAudio, playChord, playArpeggio } = useAudio();
  const { pressKeys, releaseAllKeys } = useKeyboardStore();

  // 根据选中根音推导和弦
  const triads = useMemo(() => deriveTriads(selectedRoot), [selectedRoot]);
  const seventhChords = useMemo(() => deriveSeventhChords(selectedRoot), [selectedRoot]);

  // 播放和弦（齐奏）
  const handlePlayChord = async (notes: string[]) => {
    if (!isReady) {
      await initAudio();
    }
    pressKeys(notes);
    playChord(notes, "2n");
    setTimeout(() => {
      releaseAllKeys();
    }, 1000);
  };

  // 分解弹奏
  const handlePlayArpeggio = async (notes: string[]) => {
    if (!isReady) {
      await initAudio();
    }
    const interval = 300;
    // 依次高亮每个键
    notes.forEach((note, index) => {
      setTimeout(() => {
        pressKeys([note]);
      }, index * interval);
    });
    // 播放分解和弦
    playArpeggio(notes, "8n", interval);
    // 最后释放所有高亮
    setTimeout(() => {
      releaseAllKeys();
    }, notes.length * interval + 300);
  };

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

      {/* 和弦表格 */}
      <div className="flex-1 bg-zinc-700 rounded-lg p-4 overflow-auto">
        {/* 三和弦表格 */}
        <h2 className="text-sm font-medium text-zinc-400 mb-3">
          {selectedRoot.replace(/\d+$/, "")} 根音的三和弦
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-600 hover:bg-zinc-600">
              <TableHead className="text-zinc-300">和弦名称</TableHead>
              <TableHead className="text-zinc-300">和弦类型</TableHead>
              <TableHead className="text-zinc-300">组成音</TableHead>
              <TableHead className="text-zinc-300 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {triads.map((chord) => (
              <TableRow
                key={chord.name}
                className="border-zinc-600 hover:bg-zinc-600"
              >
                <TableCell className="font-medium text-zinc-100">
                  {chord.symbol}
                </TableCell>
                <TableCell className="text-zinc-300">{chord.typeName}</TableCell>
                <TableCell className="text-zinc-300">
                  <span className="font-mono">
                    {chord.notes.join(" - ")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-zinc-600 border-zinc-500 text-zinc-100 hover:bg-zinc-500"
                      onClick={() => handlePlayChord(chord.notesWithOctave)}
                    >
                      ▶ 齐奏
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-zinc-600 border-zinc-500 text-zinc-100 hover:bg-zinc-500"
                      onClick={() => handlePlayArpeggio(chord.notesWithOctave)}
                    >
                      ♪ 分解
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* 七和弦表格 */}
        <h2 className="text-sm font-medium text-zinc-400 mb-3 mt-6">
          {selectedRoot.replace(/\d+$/, "")} 根音的七和弦
        </h2>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-600 hover:bg-zinc-600">
              <TableHead className="text-zinc-300">和弦名称</TableHead>
              <TableHead className="text-zinc-300">和弦类型</TableHead>
              <TableHead className="text-zinc-300">组成音</TableHead>
              <TableHead className="text-zinc-300 text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seventhChords.map((chord) => (
              <TableRow
                key={chord.name}
                className="border-zinc-600 hover:bg-zinc-600"
              >
                <TableCell className="font-medium text-zinc-100">
                  {chord.symbol}
                </TableCell>
                <TableCell className="text-zinc-300">{chord.typeName}</TableCell>
                <TableCell className="text-zinc-300">
                  <span className="font-mono">
                    {chord.notes.join(" - ")}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-zinc-600 border-zinc-500 text-zinc-100 hover:bg-zinc-500"
                      onClick={() => handlePlayChord(chord.notesWithOctave)}
                    >
                      ▶ 齐奏
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-zinc-600 border-zinc-500 text-zinc-100 hover:bg-zinc-500"
                      onClick={() => handlePlayArpeggio(chord.notesWithOctave)}
                    >
                      ♪ 分解
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

