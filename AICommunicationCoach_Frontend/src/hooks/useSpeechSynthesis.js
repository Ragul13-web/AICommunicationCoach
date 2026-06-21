import { useState, useCallback, useEffect, useRef } from 'react'

/**
 * Wraps the browser's SpeechSynthesis API for text-to-speech playback.
 * Patched to prevent premature garbage collection bugs in Chromium engines.
 */
export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  
  // 💡 FIX: Keep a mutable reference to the utterance to protect it from garbage collection
  const utteranceRef = useRef(null)

  useEffect(() => {
    if (!window.speechSynthesis) setIsSupported(false)
    
    // Cleanup speech if the component unmounts unexpectedly
    return () => {
      window.speechSynthesis?.cancel()
    }
  }, [])

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return

    // Clear any previous queued utterance threads
    window.speechSynthesis.cancel()

    // Attach the new utterance thread to the persistent ref instance
    utteranceRef.current = new SpeechSynthesisUtterance(text)
    utteranceRef.current.lang = 'en-US'
    utteranceRef.current.rate = 0.95

    utteranceRef.current.onstart = () => setIsSpeaking(true)
    utteranceRef.current.onend = () => setIsSpeaking(false)
    utteranceRef.current.onerror = () => setIsSpeaking(false)

    // Pass the pinned reference to the engine
    window.speechSynthesis.speak(utteranceRef.current)
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
  }, [])

  return { speak, stop, isSpeaking, isSupported }
}