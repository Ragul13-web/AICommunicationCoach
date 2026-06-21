import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * Wraps the browser's Web Speech API (SpeechRecognition) for live
 * speech-to-text. Falls back gracefully if unsupported.
 */
export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interimText += result[0].transcript
        }
      }
      setTranscript((finalText + ' ' + interimText).trim())
    }

    recognition.onerror = (event) => {
      setError(event.error)
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.stop()
    }
  }, [])

  const start = useCallback(() => {
    if (!recognitionRef.current) return
    setError(null)
    setTranscript('')
    try {
      recognitionRef.current.start()
      setIsRecording(true)
    } catch {
      // already started - ignore
    }
  }, [])

  const stop = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setIsRecording(false)
  }, [])

  const reset = useCallback(() => setTranscript(''), [])

  return { isSupported, isRecording, transcript, error, start, stop, reset, setTranscript }
}
