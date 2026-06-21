import { useState } from 'react'
import ModeToggle from './components/ModeToggle'
import InputPanel from './components/InputPanel'
import ResultsPanel from './components/ResultsPanel'
import ErrorToast from './components/ErrorToast'
import { analyzeText } from './api'

export default function App() {
  const [mode, setMode] = useState('speech') // 'speech' | 'text'
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(null)

  const handleModeChange = (newMode) => {
    setMode(newMode)
    setText('')
    setResult(null)
    setError(null)
  }

  const handleSubmit = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    try {
      const response = await analyzeText({
        text: text.trim(),
        mode,
        sessionId: sessionId ?? undefined
      })
      setResult(response)
      setSessionId(response.sessionId)
    } catch (err) {
      setError(err.message || 'Sorry, something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    /* 🟣 VIBRANT ELECTRIC PURPLE BACKGROUND (Ref: image_49115a.png) */
    <div className="min-h-screen w-full bg-[#911bdf] text-white relative overflow-x-hidden antialiased selection:bg-white/20 flex flex-col justify-between">

      {/* Friendly error popup — replaces the old inline banner */}
      <ErrorToast message={error} onDismiss={() => setError(null)} />

      {/* Main Content Wrapper */}
      <div className="w-full relative z-10 flex-grow">
        
        {/* Subtle brighter top gradient flow */}
        <div className="absolute top-0 inset-x-0 h-[30vh] bg-gradient-to-b from-fuchsia-500/20 to-transparent pointer-events-none z-0" />

        {/* APPLICATION GRAPHIC: Crisp White Audio Soundwaves Layer */}
        <div className="absolute inset-x-0 top-[12%] flex items-center justify-center opacity-[0.15] pointer-events-none select-none z-0">
          <svg className="w-full max-w-7xl h-96 text-white" viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M0 200C120 270 240 90 360 180C480 270 600 370 720 200C840 30 960 130 1080 160C1200 190 1320 310 1440 200" 
              stroke="currentColor" 
              strokeWidth="4" 
              strokeLinecap="round"
            />
            <path 
              d="M0 200C150 130 200 290 350 220C500 150 580 90 730 240C880 390 990 150 1120 200C1250 250 1350 130 1440 200" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round"
              strokeDasharray="6 6" 
              className="opacity-60"
            />
          </svg>
        </div>

        {/* CORE APP CONTENT INTERFACE CONTAINER */}
        <div className="max-w-3xl mx-auto px-4 py-14 md:py-20 relative z-10">
          
          {/* HEADER PANEL */}
          <header className="text-center mb-10 space-y-4">
            {/* 🏷️ OPTION 1: CYBER MINT ACCENT BADGE */}
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-400/20 border border-emerald-400 text-emerald-300 text-xs font-black tracking-wide shadow-lg backdrop-blur-md">
              ✨ Real-Time Language Analytics
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-sm">
              AI Communication Coach
            </h1>
            <p className="text-sm md:text-base text-purple-100 font-medium max-w-lg mx-auto leading-relaxed drop-shadow-sm">
              Refine your spoken or written English with instant, multi-dimensional critique on grammar, delivery, and vocabulary.
            </p>
          </header>

          {/* Mode Selector Panel */}
          <div className="flex justify-center mb-10">
            <ModeToggle mode={mode} onChange={handleModeChange} />
          </div>

          {/* White Semi-Glass Panel Input Frame (Ref: image_4909d4.png) */}
          <div className="rounded-3xl border border-white/20 bg-white/95 backdrop-blur-xl p-6 md:p-8 shadow-2xl text-slate-800 hover:shadow-white/5 transition-all duration-300">
            <InputPanel
              mode={mode}
              text={text}
              onTextChange={setText}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>

          {/* Interactive Evaluation State Block */}
          {loading && (
            <div className="mt-8 p-8 rounded-3xl border border-dashed border-white/30 bg-white/10 text-center text-sm font-medium text-white backdrop-blur-md animate-pulse flex flex-col items-center justify-center gap-2 shadow-xl">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mb-1" />
              <p className="font-bold text-white">Evaluating your submission...</p>
              <p className="text-xs text-purple-100 max-w-sm leading-relaxed">
                Our evaluation engines are fanning out to cross-analyze linguistic syntax, structural layout, phonetic accents, and pacing flows.
              </p>
            </div>
          )}

          {/* Dynamic Evaluation Results Section */}
          {result && (
            <div className={loading ? 'opacity-20 pointer-events-none transition-all duration-300 blur-[2px] mt-8' : 'transition-all duration-300 mt-8'}>
              <ResultsPanel result={result} mode={mode} />
            </div>
          )}

        </div>
      </div>

      {/* 🏁 VISUALLY SEGREGATED HIGHLIGHTED FOOTER CONTAINER */}
      <footer className="w-full bg-black/25 border-t border-white/10 backdrop-blur-md py-6 px-4 mt-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] font-bold tracking-widest text-purple-200/90 uppercase">
            Powered by Groq · llama-3.3-70b-versatile
          </p>
        </div>
      </footer>

    </div>
  )
}