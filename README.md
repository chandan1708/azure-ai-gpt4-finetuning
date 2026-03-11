# Support AI — Customer Support Chat Interface

A production-ready, browser-based customer support chatbot powered by a **fine-tuned GPT-4o model** hosted on **Azure OpenAI**. Built with React 19 and Vite, it streams responses in real time via Server-Sent Events (SSE) and maintains full multi-turn conversation memory for the duration of the session.

The underlying model was fine-tuned on customer support conversation data and achieved **~99.9% token accuracy** with a final cross-entropy loss of **< 0.002** across 1,501 training steps — delivering highly accurate, domain-specific responses compared to a vanilla GPT-4o baseline.

---

## Table of Contents

- [Overview](#overview)
- [Fine-tuning Details](#fine-tuning-details)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture](#architecture)
- [Security](#security)
- [License](#license)

---

## Overview

This application serves as a thin, zero-backend client that connects directly to an Azure OpenAI deployment from the browser. It was designed as the front-end layer for a fine-tuning pipeline — allowing a custom GPT-4o model (trained on domain-specific support data) to be evaluated and used interactively without any server infrastructure.

---

## Fine-tuning Details

The model powering this application was fine-tuned using Azure OpenAI's supervised fine-tuning (SFT) service. The training metrics below are derived directly from the run log (`file-e4f5c0f0b07149a693b3b689ec5e9a19.csv`).

### Training Run Summary

| Metric | Value |
|---|---|
| **Base Model** | GPT-4o (`gpt-4o-2024-08-06`) |
| **Fine-tuning Method** | Supervised Fine-tuning (SFT) |
| **Total Training Steps** | 1,501 |
| **Training Date** | 2026-03-09 |
| **Training Duration** | ~28 minutes (17:43 – 18:11 UTC) |
| **Initial Loss** | 2.43 |
| **Final Loss** | < 0.002 |
| **Initial Token Accuracy** | ~56.1% |
| **Final Token Accuracy** | ~99.9% |
| **Convergence Point** | ~Step 200 (loss < 0.10, accuracy > 97%) |

### Loss & Accuracy Progression

The training loss and token accuracy followed a healthy convergence curve across all steps:

| Phase | Steps | Avg. Loss | Avg. Token Accuracy |
|---|---|---|---|
| Early (warm-up) | 1 – 50 | ~2.50 | ~53% |
| Mid (rapid learning) | 51 – 130 | ~1.20 | ~72% |
| Late (fine convergence) | 131 – 200 | ~0.35 | ~89% |
| Final (stable) | 201 – 1,501 | ~0.02 | ~99% |

### Key Observations

- **No overfitting indicators**: Loss continued to decrease monotonically throughout training with no significant upward spikes after the initial noisy warm-up phase, indicating the dataset size was well-calibrated to the number of training steps.
- **Rapid initial descent**: The model dropped from a loss of 2.43 to below 1.0 within the first 100 steps (~step 95), demonstrating GPT-4o's strong ability to adapt to domain-specific patterns quickly.
- **Near-perfect convergence**: From step 165 onward, the model consistently achieved > 97% token accuracy, with multiple steps recording a perfect score of 1.0, confirming that the training data was clean and the formatting was consistent.
- **Stable final phase**: Steps 200–1,501 maintained an average loss of ~0.015–0.02, showing the model fully internalised the fine-tuning dataset without degrading general language capabilities.

### Model Deployment

After training, the fine-tuned model was deployed to Azure OpenAI under the deployment name:

```
gpt-4o-2024-08-06-ft-f65380e40ea14e0680018469503775b9
```

This deployment is referenced in `.env` via `VITE_AZURE_DEPLOYMENT` and used by the application for all chat completions.

---


## Features

| Feature | Details |
|---|---|
| **Real-time Streaming** | Responses stream token-by-token via native `fetch` + SSE — no polling, no SDK overhead |
| **Fine-tuned Model Support** | Connects to any Azure OpenAI deployment, including custom fine-tuned variants |
| **Multi-turn Memory** | Full conversation history is sent on every turn, preserving context across the session |
| **Configurable System Prompt** | Define bot persona and behavior at runtime through the setup form |
| **Markdown Rendering** | Bot responses render rich Markdown including tables, code blocks, and lists |
| **Streaming Controls** | Users can interrupt a response mid-stream via an abort controller |
| **Session Persistence** | Credentials are stored in `sessionStorage` — cleared automatically on tab close |
| **Suggestion Chips** | Quick-start prompts guide users on the empty state screen |
| **Copy to Clipboard** | One-click copy on any bot response |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React 19](https://react.dev/) |
| Build Tool | [Vite 7](https://vitejs.dev/) |
| AI Provider | [Azure OpenAI](https://learn.microsoft.com/en-us/azure/ai-services/openai/) |
| Markdown | [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm) |
| Linting | ESLint 9 (flat config) |
| Styling | Vanilla CSS with custom properties |
| Streaming | Native `fetch` Readable Stream + SSE |

---

## Project Structure

```
src/
├── components/
│   ├── ApiKeySetup.jsx       # Connection configuration form
│   ├── ChatHeader.jsx        # Top bar with bot identity and controls
│   ├── ChatInput.jsx         # Auto-resizing textarea + send/stop actions
│   ├── MessageBubble.jsx     # Individual message renderer (user + bot)
│   ├── TypingIndicator.jsx   # Animated dots shown during stream initiation
│   └── ErrorBoundary.jsx     # Catches render errors in markdown content
├── hooks/
│   └── useChat.js            # Core chat state machine (send, stream, abort, clear)
├── services/
│   └── azureOpenAI.js        # API layer — validateApiKey + streamChatCompletion
├── App.jsx                   # Root component and routing between setup/chat views
└── main.jsx                  # React DOM entry point
```

---

## Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- An active **Azure OpenAI** resource with a deployed model (standard or fine-tuned)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your Azure resource details (see [Environment Variables](#environment-variables) below).

### 4. Start the development server

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

### 5. Connect via the setup form

On first load you will be presented with a configuration form. Enter:

- **API Key** — your Azure OpenAI resource key
- **Azure Endpoint** — pre-filled from `.env` if set
- **Deployment Name** — pre-filled from `.env` if set
- **Bot Name** — display name shown in the chat header
- **System Prompt** — instructions that define the bot's persona and behavior

Credentials are validated against the live API before proceeding to the chat view.

---

## Environment Variables

Create a `.env` file at the project root (see `.env.example`):

```env
# Azure OpenAI resource endpoint
VITE_AZURE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/

# The name of your model deployment (standard or fine-tuned)
VITE_AZURE_DEPLOYMENT=your-deployment-name
```

> **Note:** The `VITE_` prefix is required by Vite to expose variables to the browser bundle. The API key is intentionally **not** stored in `.env` — it is entered at runtime and stored only in `sessionStorage`.

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Build the optimised production bundle to `dist/` |
| `npm run preview` | Serve the production build locally for verification |
| `npm run lint` | Run ESLint across the entire source tree |

---

## Architecture

```
Browser
│
└── App.jsx
    ├── [Setup view]  ApiKeySetup → validates credentials → stores config in sessionStorage
    │
    └── [Chat view]
        ├── ChatHeader       — bot identity, reconfigure and clear-chat controls
        ├── messages-list
        │   └── MessageBubble × N   — user bubbles (plain text) + bot bubbles (Markdown)
        │       └── TypingIndicator — shown while the stream is initialising
        └── ChatInput        — textarea with auto-resize, Enter-to-send, Stop button

State & Data Flow
─────────────────
useChat (hook)
  sendMessage(text)
    → appends user message + empty assistant placeholder to state
    → calls streamChatCompletion() → native fetch with stream: true
        → ReadableStream reader → SSE line parser
            → onChunk: appends delta to assistant message in state
            → onDone:  marks message as complete, resets streaming flag
            → onError: removes placeholder, surfaces error banner
  stopStreaming()
    → AbortController.abort() → stops fetch mid-stream
```

---

## Security

- **No backend required** — the app communicates directly with Azure OpenAI from the browser.
- The API key is entered by the user at runtime and stored **only in `sessionStorage`**. It is never written to disk, `.env`, or any persistent store, and is cleared automatically when the browser tab is closed.
- `VITE_AZURE_ENDPOINT` and `VITE_AZURE_DEPLOYMENT` are embedded in the built bundle at compile time; treat them as non-sensitive identifiers. **Do not commit your API key** to version control.
- For production deployments it is strongly recommended to route requests through a server-side proxy that holds the API key, rather than exposing it in the browser.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.
