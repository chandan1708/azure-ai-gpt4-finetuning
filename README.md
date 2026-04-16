<div align="center">
  
# Azure AI GPT-4 Fine-Tuning

[![Node.js Version](https://img.shields.io/badge/Node.js-18.x%2B-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Azure OpenAI](https://img.shields.io/badge/Powered_by-Azure_OpenAI-0089D6?style=flat&logo=microsoft-azure&logoColor=white)](https://learn.microsoft.com/en-us/azure/ai-services/openai/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

*A production-ready, browser-based customer support chatbot powered by a fine-tuned GPT-4o model hosted on Azure OpenAI, streaming responses in real time with multi-turn memory.*

**[Live Deployment](https://react-app-cicd0716.s3.us-east-1.amazonaws.com/index.html)**

---
</div>

## System Overview

**Azure AI GPT-4 Fine-Tuning** serves as a thin, zero-backend client that connects directly to an Azure OpenAI deployment from the browser. It was designed as the front-end layer for a fine-tuning pipeline — allowing a custom GPT-4o model (trained on domain-specific support data) to be evaluated and used interactively without any server infrastructure.

The underlying model was fine-tuned on customer support conversation data and achieved **~99.9% token accuracy** with a final cross-entropy loss of **< 0.002** across 1,501 training steps — delivering highly accurate, domain-specific responses compared to a vanilla GPT-4o baseline.

## Key Features

- **Real-time Streaming:** Responses stream token-by-token via native `fetch` + SSE — no polling, no SDK overhead.
- **Fine-tuned Model Support:** Connects to any Azure OpenAI deployment, including custom fine-tuned variants.
- **Multi-turn Memory:** Full conversation history is sent on every turn, preserving context across the session.
- **Configurable Persona:** Define bot persona and behavior at runtime through the system prompt setup form.
- **Rich Markdown Rendering:** Bot responses render rich Markdown including tables, code blocks, and lists.
- **Secure Session Persistence:** Credentials are stored only in `sessionStorage` (cleared automatically on tab close). No backend is required, and sensitive keys are never written to disk or `.env`.

## Architecture

The system operates securely within the browser as a zero-backend client, with a direct connection to Azure OpenAI APIs:

```text
Browser (Zero-Backend Client)
│
└── App.jsx
    ├── [Setup view]  ApiKeySetup → validates credentials → stores in sessionStorage
    │
    └── [Chat view]
        ├── ChatHeader       — bot identity, reconfigure and clear-chat controls
        ├── messages-list
        │   └── MessageBubble × N   — user bubbles (plain text) + bot bubbles (Markdown)
        │       └── TypingIndicator — shown while the stream is initialising
        └── ChatInput        — textarea with auto-resize, Enter-to-send, Stop button
```

**State & Data Flow (useChat Hook):**
- **sendMessage(text):** Appends user message and an empty assistant placeholder.
- **Stream parsing:** Native `fetch` with `stream: true` → `ReadableStream` reader → SSE line parser → UI updates iteratively.

## Technology Stack

| Category | Tools & Frameworks |
| --- | --- |
| **Frontend Framework** | React 19, Vite 7 |
| **AI Provider**   | Azure OpenAI (`gpt-4o-2024-08-06`) |
| **Markdown Engine** | react-markdown, remark-gfm |
| **Code Quality** | ESLint 9 (flat config) |
| **Streaming Tooling**| Native `fetch` Readable Stream, SSE |

---

## Fine-Tuning Performance & Model Details

The model powering this application was fine-tuned using Azure OpenAI's supervised fine-tuning (SFT) service.

| Metric | Value |
|---|---|
| **Base Model** | GPT-4o (`gpt-4o-2024-08-06`) |
| **Fine-tuning Method** | Supervised Fine-tuning (SFT) |
| **Total Training Steps** | 1,501 |
| **Initial -> Final Loss** | 2.43 -> < 0.002 |
| **Token Accuracy** | ~56.1% -> ~99.9% |

The loss decreased monotonically and convergence occurred rapidly around Step 200 without degrading general language capabilities.

*Deployment referenced in `.env`: `gpt-4o-2024-08-06-ft-f65380e40ea14e0680018469503775b9`*

---

## Getting Started (Local Development)

### 1. Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- An active **Azure OpenAI** resource with a deployed model (standard or fine-tuned)

### 2. Installation
Clone the repository and install the dependencies:

```bash
git clone https://github.com/chandan1708/support-ai.git
cd support-ai

# Install packages
npm install
```

### 3. Environment Configuration
Create the required variables to target your Azure resource:

```bash
cp .env.example .env
```
Edit `.env`:
```env
VITE_AZURE_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
VITE_AZURE_DEPLOYMENT=your-deployment-name
```
*(Note: Your actual API Key is entered through the browser securely, never stored in this file.)*

### 4. Launching the App
Start the Vite development server:

```bash
npm run dev
```
The app will be accessible at `http://localhost:5173`. 

*(Note: On first load, you'll be prompted with a setup form for your API Key, Endpoint, Deployment Name, and Bot Name. Credentials validate against the live API directly before allowing chat functionality).*

---
<div align="center">
  <p>Built by <a href="https://github.com/chandan1708">Chandan R</a></p>
</div>
