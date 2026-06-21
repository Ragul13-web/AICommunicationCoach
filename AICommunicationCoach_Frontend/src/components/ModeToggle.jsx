export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="flex p-1.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 w-full max-w-xs shadow-inner">
      <button
        onClick={() => onChange('speech')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-black tracking-wide transition-all duration-300 ${
          mode === 'speech'
            ? 'bg-[#6c10ab] text-white shadow-md border border-purple-400/20 scale-[1.02]'
            : 'text-purple-200/70 hover:text-white hover:bg-white/5'
        }`}
      >
        🎙️ Speech to Speech
      </button>
      <button
        onClick={() => onChange('text')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-black tracking-wide transition-all duration-300 ${
          mode === 'text'
            ? 'bg-[#6c10ab] text-white shadow-md border border-purple-400/20 scale-[1.02]'
            : 'text-purple-200/70 hover:text-white hover:bg-white/5'
        }`}
      >
        ⌨️ Text to Text
      </button>
    </div>
  )
}