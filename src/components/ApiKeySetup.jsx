import { useState } from "react";
import { validateApiKey } from "../services/azureOpenAI";
import "./ApiKeySetup.css";

const DEFAULT_SYSTEM_PROMPT =
    "You are a professional and friendly customer support assistant. You are knowledgeable, empathetic, and always aim to resolve customer issues efficiently. Provide clear, concise, and helpful responses.";

const EyeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" width="18" height="18">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

export default function ApiKeySetup({ onConnect }) {
    const [form, setForm] = useState({
        apiKey: "",
        endpoint: import.meta.env.VITE_AZURE_ENDPOINT || "",
        deployment: import.meta.env.VITE_AZURE_DEPLOYMENT || "",
        botName: "",
        systemPrompt: DEFAULT_SYSTEM_PROMPT,
    });
    const [showKey, setShowKey] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const set = (field) => (e) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setError("");
    };

    const handleConnect = async (e) => {
        e.preventDefault();
        const { apiKey, endpoint, deployment, botName, systemPrompt } = form;
        if (!apiKey.trim()) return setError("Please enter your Azure OpenAI API key.");
        if (!endpoint.trim()) return setError("Please enter your Azure Endpoint URL.");
        try { new URL(endpoint.trim()); } catch { return setError("Please enter a valid URL (e.g. https://your-resource.cognitiveservices.azure.com)."); }
        if (!deployment.trim()) return setError("Please enter the Deployment Name.");
        if (!botName.trim()) return setError("Please enter a Bot Name.");
        if (!systemPrompt.trim()) return setError("Please enter a System Prompt.");

        setLoading(true);
        setError("");
        try {
            await validateApiKey({
                apiKey: apiKey.trim(),
                endpoint: endpoint.trim(),
                deployment: deployment.trim(),
            });
            onConnect({
                apiKey: apiKey.trim(),
                endpoint: endpoint.trim(),
                deployment: deployment.trim(),
                botName: botName.trim(),
                systemPrompt: systemPrompt.trim(),
            });
        } catch (err) {
            setError(err?.message || "Connection failed. Please check your credentials and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setup-wrapper">
            <div className="setup-grid" />

            <div className="setup-card">
                <div className="setup-logo">
                    <div className="logo-ring">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" width="34" height="34">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            <line x1="9" y1="10" x2="15" y2="10" />
                            <line x1="12" y1="7" x2="12" y2="13" />
                        </svg>
                    </div>
                </div>

                <div className="setup-header">
                    <h1 className="setup-title">Support AI</h1>
                    <p className="setup-subtitle">Configure your Azure OpenAI connection to get started</p>
                </div>

                <div className="setup-badges">
                    <div className="badge"><span className="badge-dot g" />GPT-4o Fine-tuned</div>
                    <div className="badge"><span className="badge-dot b" />Real-time Streaming</div>
                    <div className="badge"><span className="badge-dot p" />Multi-turn Memory</div>
                </div>

                <form className="setup-form" onSubmit={handleConnect}>

                    {/* API Key */}
                    <div className="form-field">
                        <label className="form-label" htmlFor="api-key-input">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
                            API Key
                        </label>
                        <div className="input-group">
                            <input
                                id="api-key-input"
                                type={showKey ? "text" : "password"}
                                className="api-key-input"
                                placeholder="e.g. abc123..."
                                value={form.apiKey}
                                onChange={set("apiKey")}
                                autoComplete="off"
                                spellCheck={false}
                            />
                            <button type="button" className="toggle-btn" onClick={() => setShowKey((v) => !v)} title={showKey ? "Hide" : "Show"}>
                                {showKey ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                    </div>

                    {/* Azure Endpoint */}
                    <div className="form-field">
                        <label className="form-label" htmlFor="endpoint-input">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                            Azure Endpoint
                        </label>
                        <input
                            id="endpoint-input"
                            type="text"
                            className="api-key-input"
                            placeholder="https://your-resource.cognitiveservices.azure.com"
                            value={form.endpoint}
                            onChange={set("endpoint")}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>

                    {/* Deployment Name */}
                    <div className="form-field">
                        <label className="form-label" htmlFor="deployment-input">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>
                            Deployment Name
                        </label>
                        <input
                            id="deployment-input"
                            type="text"
                            className="api-key-input"
                            placeholder="e.g. gpt-4o-ft-xxxxxxxx"
                            value={form.deployment}
                            onChange={set("deployment")}
                            autoComplete="off"
                            spellCheck={false}
                        />
                    </div>

                    {/* Bot Name */}
                    <div className="form-field">
                        <label className="form-label" htmlFor="bot-name-input">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            Bot Name
                        </label>
                        <input
                            id="bot-name-input"
                            type="text"
                            className="api-key-input"
                            placeholder="e.g. Aria, SupportBot..."
                            value={form.botName}
                            onChange={set("botName")}
                            autoComplete="off"
                        />
                    </div>

                    {/* System Prompt */}
                    <div className="form-field">
                        <label className="form-label" htmlFor="system-prompt-input">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="14" height="14"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                            System Prompt
                        </label>
                        <textarea
                            id="system-prompt-input"
                            className="api-key-input system-prompt-textarea"
                            placeholder="Describe how the bot should behave..."
                            value={form.systemPrompt}
                            onChange={set("systemPrompt")}
                            rows={4}
                            spellCheck={false}
                        />
                    </div>

                    {error && (
                        <div className="setup-error" role="alert">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="connect-btn" disabled={loading}>
                        {loading ? (
                            <><span className="spinner" />Verifying connection...</>
                        ) : (
                            <>
                                Connect &amp; Start Chat
                                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="17" height="17"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                            </>
                        )}
                    </button>
                </form>

                <p className="setup-note">
                    🔒 All credentials are stored in <strong>session memory only</strong> and sent directly to Azure OpenAI.
                </p>
            </div>
        </div>
    );
}
