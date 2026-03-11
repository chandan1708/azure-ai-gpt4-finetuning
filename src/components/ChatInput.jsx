import { useState, useRef, useEffect } from "react";
import "./ChatInput.css";

const SendIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="18" height="18">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const StopIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
        <rect x="4" y="4" width="16" height="16" rx="2" />
    </svg>
);

export default function ChatInput({ onSend, onStop, isStreaming }) {
    const [text, setText] = useState("");
    const taRef = useRef(null);

    // Auto-resize
    useEffect(() => {
        const ta = taRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = Math.min(ta.scrollHeight, 150) + "px";
    }, [text]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = () => {
        const trimmed = text.trim();
        if (!trimmed || isStreaming) return;
        onSend(trimmed);
        setText("");
        if (taRef.current) taRef.current.style.height = "auto";
    };

    const canSend = text.trim().length > 0;

    return (
        <div className="input-bar">
            <div className={`input-shell ${isStreaming ? "disabled" : ""}`}>
                <textarea
                    ref={taRef}
                    className="msg-textarea"
                    placeholder={isStreaming ? "Support AI is responding…" : "Message Support AI…"}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isStreaming}
                    rows={1}
                />
                <div className="input-actions">
                    {isStreaming ? (
                        <button className="stop-btn" onClick={onStop} title="Stop generating">
                            <StopIcon />
                            Stop
                        </button>
                    ) : (
                        <button
                            className={`send-btn ${canSend ? "ready" : ""}`}
                            onClick={handleSend}
                            disabled={!canSend}
                            title="Send (Enter)"
                        >
                            <SendIcon />
                        </button>
                    )}
                </div>
            </div>
            <p className="input-hint">Enter to send · Shift+Enter for new line</p>
        </div>
    );
}
