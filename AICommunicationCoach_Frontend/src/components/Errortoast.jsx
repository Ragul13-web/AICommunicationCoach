import { useEffect } from 'react'

/**
 * A friendly, dismissible toast for surfacing errors (API failures, network
 * issues, etc). Auto-dismisses after `duration` ms, but can also be closed
 * manually. Renders fixed at the top of the viewport so it reads as a real
 * notification rather than inline page content.
 *
 * Uses only built-in Tailwind utilities (animate-in/fade-in are part of the
 * tailwindcss-animate-free "animate-in" pattern already used elsewhere in
 * this app's App.jsx, e.g. `animate-in fade-in duration-200`) — no custom
 * CSS keyframes required.
 */
export default function ErrorToast({ message, onDismiss, duration = 6000 }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDismiss, duration)
    return () => clearTimeout(timer)
  }, [message, duration, onDismiss])

  if (!message) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md">
      <div className="flex items-start gap-3 rounded-2xl bg-white border border-rose-200 shadow-2xl shadow-black/30 p-4">
        <span className="text-xl leading-none">😕</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">
            Sorry, something went wrong
          </p>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="text-slate-400 hover:text-slate-600 transition-colors text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
    </div>
  )
}