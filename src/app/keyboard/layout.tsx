import Piano from "@/components/Piano";

export default function KeyboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* 上半部分：固定高度的键盘展示区域 */}
      <div className="flex-shrink-0 p-4 bg-zinc-700 rounded-lg mb-4">
        <h2 className="text-lg font-semibold text-zinc-100 mb-3">键盘</h2>
        <Piano octaves={4} startOctave={2} />
      </div>

      {/* 下半部分：子路由内容 */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
