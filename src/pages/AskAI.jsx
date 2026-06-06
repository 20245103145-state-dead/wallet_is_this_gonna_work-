import { useState, useRef, useEffect } from "react";
import { Sparkles, Bot, Wallet, Target, TrendingDown, Lightbulb, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { C } from "../constants/colors";
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../context/TransactionContext";

export default function AskAI() {
    const { user } = useAuth();
    const { transactions, goals } = useTransactions();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text) => {
        const query = text || input;
        if (!query.trim()) return;
        
        setInput("");
        const newMessages = [...messages, { role: "user", content: query }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const apiBase = import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:3001" : "");
            const response = await fetch(`${apiBase}/api/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, content: m.content })),
                    userTxs: transactions
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server responded with status ${response.status}`);
            }
            const data = await response.json();

            setMessages([...newMessages, { role: "assistant", content: data.text }]);
        } catch (error) {
            console.error(error);
            setMessages([...newMessages, { role: "assistant", content: `❌ **AI Assistant Notice**:\n\n${error.message || "I encountered an error. Please ensure the backend server is running."}` }]);
        } finally {
            setLoading(false);
        }
    };

    const suggestedPrompts = [
        { icon: <Wallet size={18} />, text: "What is my biggest expense category this month?" },
        { icon: <Target size={18} />, text: "Am I on track to meet my savings goals?" },
        { icon: <TrendingDown size={18} />, text: "How does my spending compare to my budget?" },
        { icon: <Lightbulb size={18} />, text: "Give me 3 tips to save more money based on my habits." }
    ];

    return (
        <div style={{ paddingBottom: "1rem", height: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ marginBottom: "1.5rem", flexShrink: 0 }}>
                <h3 style={{ fontSize: "1.2rem", color: C.dark, fontWeight: 700, display: "flex", alignItems: "center", gap: ".5rem" }}>
                    <span style={{ color: C.primary, display: "flex" }}><Sparkles size={20} /></span> Ask AI
                </h3>
                <p style={{ color: C.muted, fontSize: ".85rem" }}>Your intelligent financial assistant</p>
            </div>

            <div className="chat-container" style={{ flex: 1 }}>
                {messages.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                        <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(69,41,141,0.1)", color: C.primary, fontSize: "2rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                            <Bot size={32} />
                        </div>
                        <h2 style={{ fontSize: "1.5rem", color: C.dark, fontWeight: 700, marginBottom: "1rem" }}>How can I help you?</h2>
                        <p style={{ color: C.muted, textAlign: "center", maxWidth: 500, lineHeight: 1.6, marginBottom: "2rem" }}>
                            I have access to all your transaction data, budgets, and goals. Ask me about spending patterns, category breakdowns, or financial advice.
                        </p>
                        
                        <div className="prompt-cards-grid">
                            {suggestedPrompts.map((p, i) => (
                                <div key={i} className="prompt-card" onClick={() => handleSend(p.text)}>
                                    <div className="prompt-card-icon">{p.icon}</div>
                                    <div className="prompt-card-text">{p.text}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="chat-messages">
                        {messages.map((m, i) => (
                            <div key={i} className={`chat-message ${m.role}`}>
                                <div className="chat-avatar">
                                    {m.role === "user" ? user?.name?.[0] || "U" : <Bot size={20} />}
                                </div>
                                <div className="chat-bubble">
                                    {m.role === "user" ? m.content : <div className="markdown-body"><ReactMarkdown>{m.content}</ReactMarkdown></div>}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="chat-message assistant">
                                <div className="chat-avatar"><Bot size={20} /></div>
                                <div className="chat-bubble" style={{ display: "flex", gap: "8px", alignItems: "center", padding: "1rem 1.25rem" }}>
                                    <span className="spinner animate-spin" style={{ width: 14, height: 14, borderWidth: 2 }} />
                                    <span style={{ fontSize: ".85rem", color: C.muted }}>Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                )}

                <div className="chat-input-area" style={{ flexShrink: 0 }}>
                    <input 
                        className="chat-input" 
                        placeholder="Ask about your finances..." 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSend()}
                        disabled={loading}
                    />
                    <button className="chat-send-btn" onClick={() => handleSend()} disabled={!input.trim() || loading}>
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
