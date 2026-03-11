import "./ChatHeader.css";

export default function ChatHeader({ botName, onChangeKey, onClearChat, isStreaming }) {
    return (
        <header className="chat-header">
            <div className="header-left">
                <div className="bot-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" width="20" height="20">
                        <rect x="3" y="11" width="18" height="10" rx="2" />
                        <circle cx="12" cy="5" r="2" />
                        <path d="M12 7v4" />
                        <line x1="8" y1="16" x2="8" y2="16" strokeWidth="2.5" />
                        <line x1="12" y1="16" x2="12" y2="16" strokeWidth="2.5" />
                        <line x1="16" y1="16" x2="16" y2="16" strokeWidth="2.5" />
                    </svg>
                    <span className="avatar-online" />
                </div>
                <div className="header-info">
                    <span className="header-name">{botName || "Support AI"}</span>
                    <span className="header-meta">
                        <span className="meta-dot" />
                        {isStreaming ? "Typing..." : "Online · GPT-4o Fine-tuned"}
                    </span>
                </div>
            </div>

            <div className="header-right">
                <button className="hdr-btn ghost" onClick={onChangeKey} title="Reconfigure">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="14" height="14">
                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                    Reconfigure
                </button>
                <div className="hdr-divider" />
                <button className="hdr-btn danger" onClick={onClearChat} title="Clear Chat">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="14" height="14">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                    Clear
                </button>
            </div>
        </header>
    );
}
