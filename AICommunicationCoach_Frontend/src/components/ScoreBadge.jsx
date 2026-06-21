// Continuous red -> amber -> green interpolation, like a rating gauge,
// instead of 3 fixed buckets. Smoothly reflects exactly how good the score is.
function lerp(a, b, t) {
  return Math.round(a + (b - a) * t)
}

export function scoreToColor(score) {
  const s = Math.max(0, Math.min(100, score))
  const red = { r: 225, g: 29, b: 72 }     // rose-600
  const amber = { r: 217, g: 119, b: 6 }   // amber-600
  const green = { r: 5, g: 150, b: 105 }   // emerald-600

  let from, to, t
  if (s <= 50) {
    from = red
    to = amber
    t = s / 50
  } else {
    from = amber
    to = green
    t = (s - 50) / 50
  }

  const r = lerp(from.r, to.r, t)
  const g = lerp(from.g, to.g, t)
  const b = lerp(from.b, to.b, t)
  return `rgb(${r}, ${g}, ${b})`
}

export function scoreToBgColor(score) {
  const s = Math.max(0, Math.min(100, score))
  if (s <= 50) {
    const t = s / 50
    return `rgba(225, 29, 72, ${0.1 - 0.03 * t})`
  }
  const t = (s - 50) / 50
  return `rgba(5, 150, 105, ${0.07 + 0.05 * t})`
}

export default function ScoreBadge({ score }) {
  const color = scoreToColor(score)
  const bg = scoreToBgColor(score)

  return (
    <span
      className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-md border"
      style={{ color, backgroundColor: bg, borderColor: color }}
    >
      {score}/100
    </span>
  )
}

export const severityLabel = (severity) => {
  if (typeof severity === 'number') {
    return ['Low', 'Medium', 'High'][severity] ?? 'Low'
  }
  return severity
}

export const severityColor = (severity) => {
  const label = severityLabel(severity)
  switch (label) {
    case 'High':
      return 'border-rose-100 bg-rose-50/60 text-rose-800'
    case 'Medium':
      return 'border-amber-100 bg-amber-50/60 text-amber-800'
    default:
      return 'border-slate-100 bg-slate-50/80 text-slate-700'
  }
}