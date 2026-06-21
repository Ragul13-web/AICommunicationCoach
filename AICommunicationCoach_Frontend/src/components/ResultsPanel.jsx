import AgentCard, { IssueRow } from './AgentCard'
import { scoreToColor } from './ScoreBadge'
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis'
import { useEffect, useRef, useState } from 'react'

export default function ResultsPanel({ result, mode }) {
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis()
  const lastSpokenSessionRef = useRef(null)
  const [showDetails, setShowDetails] = useState(false)

  // Auto-speak the corrected text once per new result, only in speech mode.
  // Keyed on a combination of sessionId + correctedText so it fires exactly
  // once per turn, even if the parent re-renders.
  useEffect(() => {
    if (mode !== 'speech' || !result?.correctedText) return

    const turnKey = `${result.sessionId}:${result.correctedText}`
    if (lastSpokenSessionRef.current === turnKey) return

    lastSpokenSessionRef.current = turnKey
    speak(result.correctedText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result?.sessionId, result?.correctedText, mode])

  // Collapse the detailed scorecard again whenever a new result comes in,
  // so each turn starts collapsed.
  useEffect(() => {
    setShowDetails(false)
  }, [result?.sessionId, result?.correctedText])

  if (!result) return null

  const {
    overallScore,
    overallSummary,
    correctedText,
    nextExercise,
    grammar,
    pronunciation,
    vocabulary,
    fluency
  } = result

  const isTextMode = mode === 'text'

  return (
    <div className="space-y-5">
      {/* Overall score — bold hero card, stays vivid/dark so it reads as the headline */}
      <div className="rounded-2xl bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-700 text-white p-5 shadow-xl shadow-black/20 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Overall Score</h2>
          <span
            className="text-2xl font-black tabular-nums px-3 py-1 rounded-xl bg-white/95"
            style={{ color: scoreToColor(overallScore) }}
          >
            {overallScore}/100
          </span>
        </div>
        <p className="text-sm text-purple-50/95 leading-relaxed">{overallSummary}</p>
      </div>

      {/* Corrected text + TTS — solid white card, deliberately light to contrast the purple page */}
      <div className="rounded-2xl bg-white p-4 space-y-2 shadow-lg border border-white/40">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <span className="text-emerald-500">✅</span> Improved Version
            {mode === 'speech' && isSpeaking && (
              <span className="text-[11px] font-medium text-violet-500 animate-pulse">
                🔊 speaking...
              </span>
            )}
          </h3>
          {isSupported && correctedText && (
            <button
              onClick={() => (isSpeaking ? stop() : speak(correctedText))}
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
            >
              {isSpeaking ? '⏹ Stop' : '🔊 Listen'}
            </button>
          )}
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">
          {correctedText || '—'}
        </p>
      </div>

      {/* Next exercise — distinct accent color (amber) so it doesn't blend with the purple hero/score card */}
      <div className="rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-500/90 to-orange-600/90 p-4 shadow-lg">
        <h3 className="font-bold text-white mb-1 flex items-center gap-1.5 text-sm">
          🎯 Next Exercise
        </h3>
        <p className="text-sm text-amber-50 leading-relaxed">{nextExercise || '—'}</p>
      </div>

      {/* Detailed scorecard — collapsed by default, tap to expand. White surface
          with a clearly clickable header so it doesn't disappear into the page. */}
      <div className="rounded-2xl bg-white shadow-lg border border-white/40 overflow-hidden">
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-slate-50 transition-colors"
        >
          <span className="font-bold text-slate-800 flex items-center gap-2 text-sm">
            <span className="text-violet-500">📊</span> Detailed Breakdown
            <span className="text-xs font-normal text-slate-400 hidden sm:inline">
              (Grammar · Pronunciation · Vocabulary · Fluency)
            </span>
          </span>
          <span
            className={`flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs transition-transform ${
              showDetails ? 'rotate-180' : ''
            }`}
          >
            ▾
          </span>
        </button>

        {showDetails && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pb-4 pt-1 bg-slate-50/60">
            {/* Grammar */}
            <AgentCard
              icon="📝"
              title="Grammar"
              score={grammar?.score ?? 0}
              summary={grammar?.summary}
              agentKey="grammar"
            >
              <div className="space-y-2">
                {grammar?.issues?.map((issue, i) => (
                  <IssueRow
                    key={i}
                    left={issue.original}
                    right={issue.corrected || '(remove)'}
                    note={issue.rule}
                    severity={issue.severity}
                    agentKey="grammar"
                  />
                ))}
                {(!grammar?.issues || grammar.issues.length === 0) && (
                  <p className="text-xs text-slate-400">No issues found 🎉</p>
                )}
              </div>
            </AgentCard>

            {/* Pronunciation */}
            <AgentCard
              icon="🗣"
              title="Pronunciation"
              score={pronunciation?.score ?? 0}
              summary={pronunciation?.summary}
              agentKey="pronunciation"
              badge={isTextMode ? 'Predictive' : undefined}
            >
              <div className="space-y-2">
                {isTextMode && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                    Based on word risk, not your actual voice — switch to Speech mode for real pronunciation feedback.
                  </p>
                )}
                {pronunciation?.issues?.map((issue, i) => (
                  <IssueRow
                    key={i}
                    left={issue.word}
                    right={issue.phoneticHint}
                    note={issue.tip}
                    severity={issue.severity}
                    agentKey="pronunciation"
                  />
                ))}
                {(!pronunciation?.issues || pronunciation.issues.length === 0) && (
                  <p className="text-xs text-slate-400">No issues found 🎉</p>
                )}
              </div>
            </AgentCard>

            {/* Vocabulary */}
            <AgentCard
              icon="📚"
              title="Vocabulary"
              score={vocabulary?.score ?? 0}
              summary={vocabulary?.summary}
              agentKey="vocabulary"
            >
              <div className="space-y-2">
                {vocabulary?.issues?.map((issue, i) => (
                  <IssueRow
                    key={i}
                    left={issue.originalWord}
                    right={issue.betterAlternatives?.join(' / ')}
                    note={issue.reason}
                    severity={issue.severity}
                    agentKey="vocabulary"
                  />
                ))}
                {(!vocabulary?.issues || vocabulary.issues.length === 0) && (
                  <p className="text-xs text-slate-400">No issues found 🎉</p>
                )}
              </div>
            </AgentCard>

            {/* Fluency */}
            <AgentCard
              icon="💬"
              title="Fluency"
              score={fluency?.score ?? 0}
              summary={fluency?.summary}
              agentKey="fluency"
            >
              <div className="space-y-2">
                {fluency?.fillerWordsFound?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {fluency.fillerWordsFound.map((word, i) => (
                      <span
                        key={i}
                        className="text-xs bg-sky-50 text-sky-700 border border-sky-200 rounded-full px-2 py-0.5"
                      >
                        "{word}"
                      </span>
                    ))}
                  </div>
                )}
                {fluency?.tips?.length > 0 && (
                  <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                    {fluency.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                )}
                {(!fluency?.tips || fluency.tips.length === 0) &&
                  (!fluency?.fillerWordsFound || fluency.fillerWordsFound.length === 0) && (
                    <p className="text-xs text-slate-400">No issues found 🎉</p>
                  )}
              </div>
            </AgentCard>
          </div>
        )}
      </div>
    </div>
  )
}