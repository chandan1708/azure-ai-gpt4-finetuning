import { useState, useCallback, useRef, useEffect } from "react";
import { streamChatCompletion } from "../services/azureOpenAI";

export function useChat(config) {
    const [messages, setMessages] = useState([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);
    const abortRef = useRef(null);
    // Keep a ref so sendMessage always reads the latest messages without stale closure
    const messagesRef = useRef(messages);
    const isStreamingRef = useRef(isStreaming);
    const configRef = useRef(config);

    useEffect(() => { messagesRef.current = messages; }, [messages]);
    useEffect(() => { isStreamingRef.current = isStreaming; }, [isStreaming]);
    useEffect(() => { configRef.current = config; }, [config]);

    const sendMessage = useCallback(
        async (userText) => {
            if (!userText.trim() || isStreamingRef.current) return;
            setError(null);

            const currentConfig = configRef.current;
            const currentMessages = messagesRef.current;

            const userMsg = {
                id: crypto.randomUUID(),
                role: "user",
                content: userText.trim(),
                timestamp: new Date(),
            };

            const assistantId = crypto.randomUUID();

            setMessages((prev) => [
                ...prev,
                userMsg,
                { id: assistantId, role: "assistant", content: "", timestamp: new Date(), streaming: true },
            ]);

            setIsStreaming(true);

            // Build API messages using the ref snapshot (latest history before this send)
            const apiMessages = [
                { role: "system", content: currentConfig.systemPrompt },
                ...currentMessages.map(({ role, content }) => ({ role, content })),
                { role: "user", content: userMsg.content },
            ];

            abortRef.current = streamChatCompletion(
                currentConfig,
                apiMessages,
                // onChunk
                (chunk) => {
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantId ? { ...m, content: m.content + chunk } : m
                        )
                    );
                },
                // onDone
                () => {
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === assistantId ? { ...m, streaming: false } : m
                        )
                    );
                    setIsStreaming(false);
                    abortRef.current = null;
                },
                // onError
                (err) => {
                    setMessages((prev) => prev.filter((m) => m.id !== assistantId));
                    setError(err?.message || "Something went wrong. Please try again.");
                    setIsStreaming(false);
                    abortRef.current = null;
                }
            );
        },
        [] // stable — reads live state via refs
    );

    const stopStreaming = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
            setIsStreaming(false);
            // Mark last message as done
            setMessages((prev) =>
                prev.map((m, i) => (i === prev.length - 1 ? { ...m, streaming: false } : m))
            );
        }
    }, []);

    const clearChat = useCallback(() => {
        stopStreaming();
        setMessages([]);
        setError(null);
    }, [stopStreaming]);

    return { messages, isStreaming, error, sendMessage, stopStreaming, clearChat };
}
