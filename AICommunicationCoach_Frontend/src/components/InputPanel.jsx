import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

export default function InputPanel({ mode, text, onTextChange, onSubmit, loading }) {
  const { isRecording, start, stop, transcript, reset, isSupported } = useSpeechRecognition();

  // Sync transcript to the text prop automatically when recording
  if (isRecording && transcript !== text) {
    onTextChange(transcript);
  }

  const handleMicClick = () => {
    if (isRecording) {
      stop();
    } else {
      reset();
      onTextChange('');
      start();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 🎤 SPEECH MODE */}
      {mode === 'speech' && (
        <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center gap-4">
          <button 
            onClick={handleMicClick}
            disabled={!isSupported}
            className={`w-16 h-16 flex items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 ${
              isRecording 
                ? 'bg-rose-500 shadow-rose-500/30 animate-pulse' 
                : 'bg-[#911bdf] hover:bg-[#7a16bd] shadow-purple-900/20'
            }`}
          >
            {isRecording ? '⏹' : '🎙️'}
          </button>
          
          <span className="text-xs font-black text-slate-400 tracking-widest uppercase">
            {isRecording ? 'Listening...' : 'Click Microphone to Speak'}
          </span>
        </div>
      )}

      {/* 📝 TEXT INPUT */}
      <div className="space-y-2">
        <label className="block text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
          {mode === 'speech' ? 'Live Speech Transcript' : 'Type or paste your text'}
        </label>
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={mode === 'speech' ? 'Your vocal audio will stream here...' : 'Type your text...'}
          rows={4}
          className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#911bdf]/20 focus:border-[#911bdf] transition-all text-base resize-none"
        />
      </div>

      {/* 🚀 SUBMIT BUTTON */}
      <button
        onClick={onSubmit}
        disabled={loading || !text.trim()}
        className="w-full py-4 px-6 rounded-2xl bg-[#911bdf] hover:bg-[#7a16bd] text-white font-black tracking-wide shadow-lg shadow-purple-900/10 hover:shadow-xl hover:shadow-purple-900/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
      >
        {loading ? 'Processing Evaluation...' : 'Analyze & Get Feedback'}
      </button>
    </div>
  );
}