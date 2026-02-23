export default function Home() {
  return (
    <div className="h-full">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">
        欢迎使用 Tone.js Demo
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-zinc-700 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-zinc-200 mb-2">
            播放器
          </h2>
          <p className="text-zinc-400">
            使用 Tone.js 播放音频文件
          </p>
        </div>
        <div className="bg-zinc-700 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-zinc-200 mb-2">
            合成器
          </h2>
          <p className="text-zinc-400">
            创建和控制虚拟合成器
          </p>
        </div>
        <div className="bg-zinc-700 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-zinc-200 mb-2">
            效果器
          </h2>
          <p className="text-zinc-400">
            添加混响、延迟等音效
          </p>
        </div>
      </div>
    </div>
  );
}
