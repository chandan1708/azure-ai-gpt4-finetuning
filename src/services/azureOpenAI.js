/**
 * Azure OpenAI Service — native fetch, no SDK dependency issues
 * Uses SSE streaming directly for rock-solid browser streaming.
 * All configuration is passed dynamically from the setup form.
 */

const API_VERSION = "2024-12-01-preview";

function getUrl(endpoint, deployment) {
    const base = endpoint.replace(/\/$/, "");
    return `${base}/openai/deployments/${deployment}/chat/completions?api-version=${API_VERSION}`;
}

/**
 * Validate API key + endpoint + deployment with a minimal non-streaming request.
 */
export async function validateApiKey(config) {
    const { apiKey, endpoint, deployment } = config;
    const res = await fetch(getUrl(endpoint, deployment), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": apiKey,
        },
        body: JSON.stringify({
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 5,
        }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = body?.error?.message || `HTTP ${res.status}`;
        throw new Error(msg);
    }
    return true;
}

/**
 * Stream a chat completion via SSE.
 * @param {object} config - { apiKey, endpoint, deployment }
 * @param {Array}  messages   - Full conversation array (includes system message)
 * @param {(chunk:string)=>void} onChunk
 * @param {()=>void} onDone
 * @param {(err:Error)=>void} onError
 * @returns {AbortController} — call .abort() to cancel
 */
export function streamChatCompletion(config, messages, onChunk, onDone, onError) {
    const { apiKey, endpoint, deployment } = config;
    const controller = new AbortController();

    (async () => {
        try {
            const res = await fetch(getUrl(endpoint, deployment), {
                method: "POST",
                signal: controller.signal,
                headers: {
                    "Content-Type": "application/json",
                    "api-key": apiKey,
                },
                body: JSON.stringify({
                    messages,
                    max_tokens: 4096,
                    temperature: 0.7,
                    top_p: 1.0,
                    stream: true,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                const msg = body?.error?.message || `HTTP ${res.status}`;
                throw new Error(msg);
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop(); // keep incomplete last line

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith("data:")) continue;
                    const payload = trimmed.slice(5).trim();
                    if (payload === "[DONE]") {
                        onDone();
                        return;
                    }
                    try {
                        const json = JSON.parse(payload);
                        const delta = json?.choices?.[0]?.delta?.content;
                        if (delta) onChunk(delta);
                    } catch {
                        // malformed chunk — skip
                    }
                }
            }

            onDone();
        } catch (err) {
            if (err.name === "AbortError") return;
            onError(err);
        }
    })();

    return controller;
}
