import "./TypingIndicator.css";
const BotIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" width="16" height="16">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
    </svg>
);

export default function TypingIndicator() {
    return (
        <div className="typing-row">
            <div className="typing-avatar"><BotIcon /></div>
            <div className="typing-bubble">
                <span className="t-dot" />
                <span className="t-dot" />
                <span className="t-dot" />
            </div>
        </div>
    );
}
