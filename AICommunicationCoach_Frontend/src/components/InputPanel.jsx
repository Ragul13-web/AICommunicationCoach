import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useState } from 'react';

export default function InputPanel({ mode, text, onTextChange, onSubmit, loading }) {
  const { isRecording, start, stop, transcript, reset, isSupported } = useSpeechRecognition();
  const [permissionError, setPermissionError] = useState(false);
  // Sync transcript to the text prop automatically when recording
  if (isRecording && transcript !== text) {
    onTextChange(transcript);
  }

 const handleMicClick = async () => {
    if (isRecording) {
      stop();
    } else {
      try {
        // Explicitly check for permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setPermissionError(false);
        reset();
        onTextChange('');
        start();
      } catch (err) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setPermissionError(true);
        }
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 🛑 Permission Error Banner */}
      {permissionError && (
        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-100">
          Microphone access denied. Please allow microphone access in your browser site settings and refresh.
        </div>
      )}
      
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
        disabled={loading || !text.trim() || isRecording}
        className="w-full py-4 px-6 rounded-2xl bg-[#911bdf] hover:bg-[#7a16bd] text-white font-black tracking-wide shadow-lg shadow-purple-900/10 hover:shadow-xl hover:shadow-purple-900/20 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
      >
        {isRecording ? 'Recording in progress...' : (loading ? 'Processing Evaluation...' : 'Analyze & Get Feedback')}
      </button>
    </div>
  );
}