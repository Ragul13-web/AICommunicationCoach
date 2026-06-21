const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Send text to the coach backend for multi-agent analysis.
 * @param {{ text: string, mode: 'speech' | 'text', sessionId?: string, context?: string }} payload
 * @returns {Promise<object>} CoachResponse
 */
export async function analyzeText(payload) {
  let res
  try {
    res = await fetch(`${API_BASE}/coach/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch {
    // fetch itself threw — almost always means the backend isn't reachable
    // (not running, wrong port, CORS misconfigured, no network).
    throw new Error(
      "We couldn't reach the coaching service. Please check your connection and try again."
    )
  }

  if (!res.ok) {
    // Always show a friendly, non-technical message to the user — never the
    // raw status code or the backend's raw exception text.
    const message =
      res.status >= 500
        ? 'Our server hit a snag while analyzing your text. Please try again in a moment.'
        : res.status === 429
        ? "You're sending requests a bit fast — please wait a moment and try again."
        : 'Something about that request didn\u2019t go through. Please try again.'

    // Log the backend's real error for debugging, but don't surface it.
    try {
      const data = await res.json()
      if (data?.error) console.error('Coach API error:', data.error)
    } catch {
      // body wasn't JSON — nothing extra to log
    }

    throw new Error(message)
  }

  try {
    return await res.json()
  } catch {
    throw new Error('We got an unexpected response from the coaching service. Please try again.')
  }
}