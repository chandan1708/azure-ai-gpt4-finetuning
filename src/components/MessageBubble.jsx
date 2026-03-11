import { useState, memo } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ErrorBoundary from "./ErrorBoundary";
import "./MessageBubble.css";

function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const BotIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" width="16" height="16">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
    </svg>
);

function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* clipboard unavailable */ }
    };
    return (
        <button className={`copy-btn ${copied ? "copied" : ""}`} onClick={handleCopy} title="Copy response">
            {copied ? (
                <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><polyline points="20 6 9 17 4 12" /></svg>
                    Copied
                </>
            ) : (
                <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="12" height="12">
                        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    Copy
                </>
            )}
        </button>
    );
}

// Memoized markdown renderer — only re-renders when content actually changes
const MarkdownContent = memo(function MarkdownContent({ content }) {
    return (
        <ErrorBoundary>
            <div className="md">
                <Markdown remarkPlugins={[remarkGfm]}>
                    {content}
                </Markdown>
            </div>
        </ErrorBoundary>
    );
});

// Memoize the whole bubble — sibling message updates won't re-render this
const MessageBubble = memo(function MessageBubble({ message }) {
    const isUser = message.role === "user";

    return (
        <div className={`bubble-row ${isUser ? "user" : "bot"}`}>
            {!isUser && (
                <div className="msg-avatar"><BotIcon /></div>
            )}
            <div className="bubble-body">
                <div className={`bubble ${isUser ? "user-bubble" : "bot-bubble"}`}>
                    {isUser ? (
                        <p>{message.content}</p>
                    ) : (
                        <>
                            {message.content ? (
                                <MarkdownContent content={message.content} />
                            ) : null}
                            {message.streaming && <span className="cursor" />}
                        </>
                    )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: isUser ? "flex-end" : "flex-start" }}>
                    <span className="bubble-time">{formatTime(message.timestamp)}</span>
                    {!isUser && !message.streaming && message.content && (
                        <CopyButton text={message.content} />
                    )}
                </div>
            </div>
        </div>
    );
});

export default MessageBubble;
