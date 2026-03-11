import { useState, useEffect, useRef, useMemo } from "react";
import ApiKeySetup from "./components/ApiKeySetup";
import ChatHeader from "./components/ChatHeader";
import MessageBubble from "./components/MessageBubble";
import TypingIndicator from "./components/TypingIndicator";
import ChatInput from "./components/ChatInput";
import { useChat } from "./hooks/useChat";
import "./App.css";

const SESSION_KEY = "support_ai_config";

const CHIPS = [
  "How do I track my order?",
  "I'd like to return an item",
  "What is your refund policy?",
  "How do I reset my password?",
  "I haven't received my package",
  "Can I change my delivery address?",
];

const EMPTY_CONFIG = { apiKey: "", endpoint: "", deployment: "", botName: "", systemPrompt: "" };

export default function App() {
  const [config, setConfig] = useState(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const bottomRef = useRef(null);

  // Use stable EMPTY_CONFIG reference when no config is set ─ avoids unnecessary
  // effect re-runs inside useChat caused by a new object on every render.
  const activeConfig = useMemo(() => config ?? EMPTY_CONFIG, [config]);

  const { messages, isStreaming, error, sendMessage, stopStreaming, clearChat } = useChat(activeConfig);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleConnect = (cfg) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(cfg));
    setConfig(cfg);
  };

  const handleChangeKey = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setConfig(null);
    clearChat();
  };

  if (!config) {
    return <ApiKeySetup onConnect={handleConnect} />;
  }

  // Show typing indicator when streaming but last message content is still empty
  const showTyping = isStreaming && messages.length > 0 && messages[messages.length - 1]?.content === "";

  return (
    <div className="app-root">
      <div className="chat-shell">
        <ChatHeader
          botName={config.botName}
          onChangeKey={handleChangeKey}
          onClearChat={clearChat}
          isStreaming={isStreaming}
        />

        <div className="messages-list">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" width="38" height="38">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <line x1="9" y1="10" x2="15" y2="10" />
                  <line x1="12" y1="7" x2="12" y2="13" />
                </svg>
              </div>
              <div>
                <h3>How can I help you?</h3>
                <p>I'm {config.botName || "your AI assistant"} — ask me anything!</p>
              </div>
              <div className="chips">
                {CHIPS.map((chip) => (
                  <button key={chip} className="chip" onClick={() => sendMessage(chip)}>
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {showTyping && <TypingIndicator />}
            </>
          )}

          {error && (
            <div className="err-banner" role="alert">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <ChatInput
          onSend={sendMessage}
          onStop={stopStreaming}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
