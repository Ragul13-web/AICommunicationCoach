# AI Communication Coach — Frontend

React + Vite + Tailwind UI for the AICommunicationCoach.Api backend.

## Setup

```bash
npm install
npm run dev
```

App runs at http://localhost:5173

## Connecting to the backend

By default, `/api/*` calls are proxied to `https://localhost:5001` (see
`vite.config.js`). Update the `target` to match your backend's launch URL
(check `Properties/launchSettings.json` in your .NET project).

If your backend uses a different CORS origin, make sure
`http://localhost:5173` is in the allowed origins list (Program.cs).

Alternatively, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`
to call the backend directly without the proxy.

## Modes

- **🎙 Speech to Speech** — uses the browser's Web Speech API (SpeechRecognition)
  to transcribe what you say. Edit the transcript if needed, then submit.
  The "Improved Version" card has a 🔊 Listen button (SpeechSynthesis) to
  hear the corrected version read aloud.
- **⌨ Text to Text** — type or paste text directly. Same feedback, same
  optional 🔊 Listen button on the corrected text.

## Browser support

Web Speech API (SpeechRecognition) works best in Chrome / Edge. Firefox and
Safari have limited or no support — the UI will show a warning and you can
still use Text mode.
