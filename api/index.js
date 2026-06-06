import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Anthropic } from '@anthropic-ai/sdk';

// Load environment variables from .env.local in local development
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: '.env.local' });
}

const app = express();

/**
 * [EDUCATIONAL COMMENT]
 * Cross-Origin Resource Sharing (CORS) is enabled to allow the React frontend (running on a different port/domain)
 * to communicate with this backend API. 
 * Note: In a production environment, `origin: '*'` should be restricted to the specific domain of the frontend app for security.
 */
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/**
 * [EDUCATIONAL COMMENT]
 * We safely initialize the AI SDKs only if the respective environment variables are provided.
 * This prevents the server from crashing on startup if an API key is missing.
 */
let anthropic = null;
if (process.env.VITE_CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY) {
    try {
        anthropic = new Anthropic({
            apiKey: process.env.VITE_CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY,
        });
    } catch (err) {
        console.error('Failed to initialize Anthropic client:', err.message);
    }
}

/**
 * [EDUCATIONAL COMMENT]
 * Helper to call Google Gemini API. Gemini is configured as the primary provider
 * due to its free tier, making it ideal for a university project without incurring costs.
 */
const callGemini = async (messages, systemPrompt, apiKey) => {
    // Map standard roles (user, assistant) to Gemini's expected formats (user, model)
    const contents = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: contents,
            generationConfig: {
                maxOutputTokens: 1200
            }
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error: ${errText}`);
    }

    const data = await response.json();
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
        throw new Error('Invalid response structure received from Gemini API');
    }
    return data.candidates[0].content.parts[0].text;
};

// Root API status endpoint
app.get('/api', (req, res) => {
    const providers = [];
    if (process.env.GEMINI_API_KEY) providers.push('Google Gemini (Free Tier)');
    if (process.env.VITE_CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY) providers.push('Anthropic Claude');
    
    res.json({ 
        status: 'healthy', 
        service: 'My Wallet AI Unified Backend',
        activeProviders: providers 
    });
});

// AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { messages, userTxs, type } = req.body;

        if (!messages && type !== 'summary') {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        let systemPrompt = `You are an expert financial assistant for the "My Wallet" application. 
The user is asking you for financial advice or insights based on their transaction history.
Be helpful, concise, and professional. Output your response in markdown format.
Always be encouraging but practical. Do not hallucinate data.

Here is the user's transaction history context (in JSON format):
${JSON.stringify(userTxs, null, 2)}
`;

        let callMessages = messages || [];

        if (type === 'summary') {
            systemPrompt = `You are an expert financial analyst. Please provide a monthly summary report for the user based on their transaction history.
Output your response in beautiful markdown format. Provide a narrative of their finances, highlighting:
1. Overall financial health
2. Top spending categories
3. Actionable advice to improve savings

Here is the user's transaction history context (in JSON format):
${JSON.stringify(userTxs, null, 2)}`;
            callMessages = [{ role: 'user', content: 'Generate my monthly financial summary.' }];
        }

        /**
         * [EDUCATIONAL COMMENT]
         * AI Failover Architecture:
         * 1. The server attempts to route the request to Google Gemini first (if configured).
         * 2. If Gemini fails or is not configured, it gracefully falls back to Anthropic Claude.
         * 3. This high-availability design ensures the AI feature works even if one provider has an outage or rate limit.
         */
        if (process.env.GEMINI_API_KEY) {
            console.log('Routing request to Google Gemini API (Free Tier)...');
            try {
                const text = await callGemini(callMessages, systemPrompt, process.env.GEMINI_API_KEY);
                return res.json({ text });
            } catch (geminiError) {
                console.error('Gemini API execution failed:', geminiError.message);
                // If Gemini failed, try to fallback to Anthropic if available
                if (!anthropic) {
                    throw geminiError;
                }
            }
        }

        // 2. Fallback to Anthropic Claude if available
        if (anthropic) {
            console.log('Routing request to Anthropic Claude API...');
            try {
                const response = await anthropic.messages.create({
                    model: "claude-3-haiku-20240307",
                    max_tokens: 1000,
                    system: systemPrompt,
                    messages: callMessages,
                });
                return res.json({ text: response.content[0].text });
            } catch (claudeError) {
                // Intercept low credit balance error and return a super clean developer friendly response
                if (claudeError.message?.includes('balance') || claudeError.status === 400) {
                    return res.status(402).json({
                        error: 'Your Anthropic API key has run out of credits. To get a 100% FREE AI service, add a GEMINI_API_KEY from Google AI Studio (https://aistudio.google.com/) to your .env.local file!'
                    });
                }
                throw claudeError;
            }
        }

        // 3. Neither key is configured
        return res.status(401).json({
            error: 'No active AI Provider configured. Please add a GEMINI_API_KEY (for 100% free tier from Google AI Studio) or VITE_CLAUDE_API_KEY to your .env.local file.'
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: error.message || 'Failed to communicate with AI service' });
    }
});

// For local environment running
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
        console.log(`Backend server running locally on http://localhost:${port}`);
    });
}

export default app;
