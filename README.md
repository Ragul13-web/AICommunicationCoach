# 🎓 AI Communication Coach

> A full-stack AI multi-agent application that delivers real-time, multi-dimensional feedback on spoken and written English. Built with **.NET 8 ASP.NET Core** backend and **React 18** frontend, powered by **Groq's `llama-3.3-70b-versatile`** model running four parallel specialist AI agents.

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-llama--3.3--70b-F55036)
![License](https://img.shields.io/badge/license-MIT-22c55e)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Multi-Agent Design](#-multi-agent-design)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup (.NET)](#backend-setup-net)
  - [Frontend Setup (React)](#frontend-setup-react)
- [API Reference](#-api-reference)
- [Configuration](#-configuration)
- [How It Works](#-how-it-works)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🧭 Overview

AI Communication Coach is a portfolio-grade, full-stack AI application that helps users improve their spoken and written English. A user speaks into the microphone (or types text), and the system runs it through **four specialist AI sub-agents simultaneously** — each analysing a different dimension of English communication — then synthesizes their results into a single scored, actionable coaching response.

The project demonstrates practical patterns in:
- **Multi-agent orchestration** with concurrent execution (`Task.WhenAll`)
- **Structured LLM outputs** using Groq's native `json_object` response format
- **Clean architecture** with interface-driven services and dependency injection
- **Real-time browser APIs** — Web Speech API for STT and TTS, no third-party service needed

---

## ✨ Features

| Feature | Detail |
|---|---|
| 🎙 **Speech-to-Speech** | Speak → live transcript via Web Speech API → AI analysis → corrected text spoken back automatically |
| ⌨ **Text-to-Text** | Type or paste → same multi-agent analysis pipeline |
| ⚡ **Parallel agents** | All four sub-agents fire concurrently via `Task.WhenAll` — not sequentially |
| 📊 **Collapsible breakdown** | Overall score + summary up front; per-agent detail cards on demand |
| 🎨 **Score gradient** | Red → Amber → Green continuous colour interpolation on all score badges |
| 🔊 **Auto-speak** | In speech mode, corrected text is read aloud automatically after each analysis |
| 💡 **Next exercise** | Every response ends with one personalised practice suggestion |
| 🛡 **Forced JSON mode** | Groq `json_object` response format guarantees structured, parseable LLM output |
| 😕 **Friendly errors** | API failures surface as a dismissible toast popup, never raw status codes |
| 🏷 **Predictive label** | Pronunciation card labelled "Predictive" in Text mode (no audio = no real data) |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│              React 18 Frontend                  │
│  (Vite · Tailwind CSS · Web Speech API)         │
│                                                 │
│  ModeToggle → InputPanel → ResultsPanel         │
│  AgentCard  · ScoreBadge · ErrorToast           │
└────────────────┬────────────────────────────────┘
                 │  POST /api/coach/analyze
                 │  { text, mode, sessionId }
                 ▼
┌─────────────────────────────────────────────────┐
│         ASP.NET Core 8 Web API                  │
│                                                 │
│         CoachController                         │
│              │                                  │
│         OrchestratorService                     │
│              │                                  │
│    Task.WhenAll (4 parallel async calls)        │
│      ├── GrammarAgent                           │
│      ├── PronunciationAgent                     │
│      ├── VocabularyAgent          ───────────► Groq API
│      └── FluencyAgent                           │
│              │                                  │
│    ResponseSynthesizerService                   │
│    (merge · score · corrected text · exercise)  │
│              │                                  │
│    CoachResponse ──────────────────────────────►│
└─────────────────────────────────────────────────┘
                 │
         llama-3.3-70b-versatile
         (Groq Cloud · forced JSON mode)
```

---

## 🤖 Multi-Agent Design

Each of the four sub-agents is a standalone C# service with its own focused system prompt. They run **concurrently** for low latency — a round trip is roughly the time of one Groq call, not four.

| Agent | Interface | What it analyses |
|---|---|---|
| 📝 **GrammarAgent** | `IGrammarAgent` | Tense errors, subject-verb agreement, articles, prepositions, word order |
| 🗣 **PronunciationAgent** | `IPronunciationAgent` | Phoneme risk, word stress, IPA hints, commonly mispronounced words |
| 📚 **VocabularyAgent** | `IVocabularyAgent` | Word choice, register, collocations, richer alternatives that preserve meaning |
| 💬 **FluencyAgent** | `IFluencyAgent` | Filler words (`um`, `like`, `you know`), flow, coherence, pacing tips |

**Scoring weights** differ by mode — speech mode weights pronunciation and fluency higher; text mode weights grammar and vocabulary higher, and marks pronunciation as "Predictive" since there is no audio to analyse.

| Mode | Grammar | Pronunciation | Vocabulary | Fluency |
|---|---|---|---|---|
| Speech | 25% | 30% | 15% | 30% |
| Text | 40% | 5% | 30% | 25% |

After the four agents return, a fifth **synthesis call** to Groq merges their feedback into:
- An overall score (0–100, weighted by mode)
- An encouraging 2–3 sentence summary
- A fully corrected version of the original text
- One personalised next exercise

---

## 🧰 Tech Stack

### Backend — `AICommunicationCoach_Backend/`

| Layer | Technology |
|---|---|
| Runtime | .NET 8 |
| Framework | ASP.NET Core Web API |
| AI provider | Groq Cloud REST API (OpenAI-compatible) |
| Model | `llama-3.3-70b-versatile` |
| HTTP client | `IHttpClientFactory` + typed `GroqApiClient` |
| DI | Built-in `Microsoft.Extensions.DependencyInjection` |
| Config | `IOptions<GroqSettings>` bound from `appsettings.json` |
| JSON | `System.Text.Json` with `json_object` forced mode |
| CORS | Configured for `localhost:5173` (Vite dev server) |

### Frontend — `AICommunicationCoach_Frontend/`

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Speech input | Web Speech API — `SpeechRecognition` |
| Speech output | Web Speech API — `SpeechSynthesis` |
| State | React `useState` / `useEffect` / `useRef` |
| HTTP | Native `fetch` API |
| Hooks | `useSpeechRecognition`, `useSpeechSynthesis` |

---

## 📁 Project Structure

```
AICommunicationCoach/
│
├── AICommunicationCoach_Backend/
│   └── AICommunicationCoach.Api/
│       ├── Configuration/
│       │   └── GroqSettings.cs           # Strongly-typed config binding
│       │
│       ├── Controller/
│       │   └── CoachController.cs        # POST /api/coach/analyze
│       │
│       ├── Models/
│       │   ├── AgentModel.cs             # All request/response/agent DTOs
│       │   ├── GroqRequest.cs            # Groq API request shape
│       │   └── GroqResponse.cs           # Groq API response shape
│       │
│       ├── Services/
│       │   ├── Interfaces/
│       │   │   ├── IAgent.cs             # IGrammarAgent, IPronunciationAgent,
│       │   │   │                         # IVocabularyAgent, IFluencyAgent,
│       │   │   │                         # IOrchestratorService
│       │   │   └── IGroqApiClient.cs
│       │   │
│       │   └── Implementations/
│       │       ├── GroqApiClient.cs      # Typed HttpClient wrapper
│       │       ├── GrammarAgent.cs
│       │       ├── PronunciationAgent.cs
│       │       ├── VocabularyAgent.cs
│       │       ├── FluencyAgent.cs
│       │       └── OrchestratorService.cs # Task.WhenAll + synthesis
│       │
│       ├── Utility/
│       │   └── LlmJson.cs               # Strips markdown fences, robust JSON parse
│       │
│       ├── Program.cs                   # DI registration + CORS + middleware
│       └── appsettings.json             # Config template (no real keys)
│
├── AICommunicationCoach_Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentCard.jsx            # Per-agent breakdown card + IssueRow
│   │   │   ├── ErrorToast.jsx           # Dismissible error popup
│   │   │   ├── InputPanel.jsx           # Mic button (speech) or textarea (text)
│   │   │   ├── ModeToggle.jsx           # Speech ↔ Text switcher
│   │   │   ├── ResultsPanel.jsx         # Full results layout
│   │   │   └── ScoreBadge.jsx           # Red→Amber→Green score pill
│   │   │
│   │   ├── hooks/
│   │   │   ├── useSpeechRecognition.js  # Web Speech API STT wrapper
│   │   │   └── useSpeechSynthesis.js    # Web Speech API TTS wrapper
│   │   │
│   │   ├── api.js                       # fetch wrapper with friendly errors
│   │   ├── App.jsx                      # Root component + state
│   │   └── main.jsx                     # ReactDOM entry point
│   │
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js                   # Proxy /api → .NET backend
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download) or later
- [Node.js 18+](https://nodejs.org) and npm
- A free [Groq API key](https://console.groq.com/keys)
- Chrome or Edge browser (required for Web Speech API in speech mode)

---

### Backend Setup (.NET)

**1. Navigate to the API project**
```bash
cd AICommunicationCoach_Backend/AICommunicationCoach.Api
```

**2. Add your Groq API key**

Open `appsettings.Development.json` (create it if it doesn't exist) and add:
```json
{
  "Groq": {
    "ApiKey": "YOUR_REAL_GROQ_API_KEY"
  }
}
```

> ⚠️ Never put your real key in `appsettings.json` — that file is committed to git. Use `appsettings.Development.json` (already in `.gitignore`) or an environment variable instead.

**3. Restore and run**
```bash
dotnet restore
dotnet run
```

The API starts on `https://localhost:5001` (check `Properties/launchSettings.json` for the exact port).

**4. Verify it's running**
```bash
curl https://localhost:5001/api/coach/health
# Expected: {"status":"ok"}
```

---

### Frontend Setup (React)

**1. Navigate to the frontend**
```bash
cd AICommunicationCoach_Frontend
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure the API URL (optional)**

By default, Vite proxies `/api/*` to `https://localhost:5001` — no `.env` file needed if your backend runs on that port.

If your backend runs on a different port, copy `.env.example` to `.env` and update:
```bash
cp .env.example .env
# Edit .env:
# VITE_API_BASE_URL=https://localhost:YOUR_PORT/api
```

Alternatively, update the `target` in `vite.config.js`:
```js
proxy: {
  '/api': {
    target: 'https://localhost:YOUR_PORT',
    changeOrigin: true,
    secure: false
  }
}
```

**4. Start the dev server**
```bash
npm run dev
```

Open **http://localhost:5173** in Chrome or Edge.

---

### Using the App

1. **Speech mode** — click the microphone, speak naturally, click stop. The transcript appears in the text box. Click **Analyze & Get Feedback**. The corrected version is read back to you automatically.
2. **Text mode** — type or paste your text, click **Analyze & Get Feedback**.
3. Review the **Overall Score**, **Improved Version**, and **Next Exercise**.
4. Click **Detailed Breakdown** to expand the four agent cards (Grammar, Pronunciation, Vocabulary, Fluency) with per-issue explanations.

---

## 📡 API Reference

### `POST /api/coach/analyze`

Analyze a piece of text and return multi-agent coaching feedback.

**Request body**
```json
{
  "text": "I has went to meeting my new boss yesterday.",
  "mode": "speech",
  "sessionId": null,
  "context": null
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `text` | string | ✅ | The transcript or typed text to analyse |
| `mode` | `"speech"` \| `"text"` | ✅ | Affects agent weighting and pronunciation labelling |
| `sessionId` | string \| null | ❌ | Reuse across turns to maintain session identity |
| `context` | string \| null | ❌ | Optional topic hint e.g. `"job interview practice"` |

**Response — `CoachResponse`**
```json
{
  "sessionId": "9dbad22d-17c4-4984-8247-3573ae79cf48",
  "overallScore": 65,
  "overallSummary": "Your enthusiasm comes through clearly...",
  "grammar": {
    "score": 40,
    "issues": [
      {
        "original": "I has went",
        "corrected": "I went",
        "rule": "Subject-verb agreement + past simple",
        "severity": "High"
      }
    ],
    "summary": "Several tense and agreement issues to work on."
  },
  "pronunciation": { "score": 80, "issues": [...], "summary": "..." },
  "vocabulary": { "score": 75, "issues": [...], "summary": "..." },
  "fluency": { "score": 85, "fillerWordsFound": [], "tips": [...], "summary": "..." },
  "correctedText": "Yesterday, I went to meet my new boss...",
  "nextExercise": "Practice using past simple vs present perfect in 5 sentences..."
}
```

### `GET /api/coach/health`
Returns `{"status":"ok"}` — use this to verify the backend is running.

---

## ⚙️ Configuration

All Groq settings live in `appsettings.json` under the `"Groq"` key:

```json
{
  "Groq": {
    "ApiKey": "YOUR_GROQ_API_KEY_HERE",
    "BaseUrl": "https://api.groq.com/openai/v1",
    "ModelId": "llama-3.3-70b-versatile",
    "MaxTokens": 1024,
    "Temperature": 0.15
  }
}
```

| Setting | Description |
|---|---|
| `ApiKey` | Your Groq API key. Use `appsettings.Development.json` for real values |
| `ModelId` | The Groq model to use. `llama-3.3-70b-versatile` is the default |
| `Temperature` | Set low (0.1–0.2) for consistent, repeatable scores across identical inputs |
| `MaxTokens` | Max response tokens per agent call |

---

## 🔍 How It Works

### Why parallel agents instead of one big prompt?

Giving a single prompt the job of evaluating grammar, pronunciation, vocabulary, and fluency simultaneously leads to shallow, averaged-out feedback. Separate agents with dedicated system prompts produce much more focused, expert-level analysis per dimension — and running them in parallel via `Task.WhenAll` means the extra agents cost latency only once (not four times serially).

### Why Groq's `json_object` mode?

LLMs without output constraints sometimes wrap JSON in markdown fences (` ```json ... ``` `), add preamble text, or deviate from the schema under load. Groq's native `json_object` mode guarantees the response is valid JSON, removing the need for fragile regex-based extraction. The `LlmJson` utility class provides a secondary cleanup layer as a fallback.

### Why `Temperature: 0.15`?

Higher temperatures introduce score variance — the same input can score 76 one run and 88 the next, which undermines user trust in the scoring system. At 0.15 the model stays deterministic enough for consistent scores while still producing natural, varied language in summaries and exercise suggestions.

---

## 🗺 Roadmap

- [ ] Multi-turn session history with conversation memory
- [ ] User accounts and progress tracking over time
- [ ] SSE streaming for faster perceived feedback latency
- [ ] Deployed live demo (Render / Azure / Vercel)
- [ ] Mobile-responsive layout refinements
- [ ] Scenario-based practice modes (job interview, presentation, casual conversation)

---

## 📜 License

MIT — feel free to use this project as a reference or starting point.

---

## 🙏 Acknowledgements

- [Groq](https://groq.com) for ultra-low-latency LLM inference
- [Meta Llama 3.3](https://ai.meta.com/blog/meta-llama-3/) for the underlying model
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for browser-native STT and TTS
