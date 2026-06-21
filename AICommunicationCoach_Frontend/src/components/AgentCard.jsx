import ScoreBadge, { severityColor, severityLabel } from './ScoreBadge'

export default function AgentCard({ icon, title, score, summary, agentKey, badge, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300/80">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-sm tracking-tight flex items-center gap-2">
            <span className="text-base leading-none">{icon}</span> {title}
            {badge && (
              <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 rounded-full px-2 py-0.5">
                {badge}
              </span>
            )}
          </h3>
          <ScoreBadge score={score} agentKey={agentKey} />
        </div>
        {summary && (
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            {summary}
          </p>
        )}
      </div>
      <div className="mt-4 pt-2">{children}</div>
    </div>
  )
}

export function IssueRow({ left, right, note, severity, agentKey }) {
  const currentLabel = severityLabel(severity)

  return (
    <div className={`rounded-xl border p-3 text-xs space-y-1.5 transition-colors ${severityColor(severity, agentKey)}`}>
      <div className="flex items-center gap-1.5 flex-wrap font-mono">
        <span className="text-rose-600 line-through font-medium bg-rose-100/40 px-1 rounded">
          {left}
        </span>
        <span className="text-slate-400 font-bold">→</span>
        <span className="text-emerald-700 font-bold bg-emerald-100/40 px-1 rounded">
          {right}
        </span>

        {severity !== undefined && (
          <span className={`ml-auto text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${
            currentLabel === 'High'
              ? 'bg-rose-100 border-rose-200 text-rose-700'
              : currentLabel === 'Medium'
              ? 'bg-amber-100 border-amber-200 text-amber-700'
              : 'bg-slate-200 border-slate-300 text-slate-600'
          }`}>
            {currentLabel}
          </span>
        )}
      </div>
      {note && (
        <p className="text-slate-500 text-[11px] font-medium leading-tight pl-0.5 italic">
          {note}
        </p>
      )}
    </div>
  )
}