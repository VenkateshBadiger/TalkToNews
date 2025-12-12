// --------------------------------------------------------------
// TalkToNews - Background Service Worker (OpenRouter Classification)
// Using FREE model: openai/gpt-oss-20b
// --------------------------------------------------------------

console.log("TalkToNews service worker starting...");

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("SW received:", msg);

    if (msg.type === "CLASSIFY_HEADLINE") {
        classifyHeadline(msg.text).then(result => sendResponse(result));
        return true; // async
    }

    if (msg.type === "SUMMARIZE_ARTICLE") {
        summarizeArticle(msg.text).then(result => sendResponse(result));
        return true;
    }
});

// --------------------------------------------------------------
// 1) CLASSIFY HEADLINE using OpenRouter FREE model gpt-oss-20b
// --------------------------------------------------------------
async function classifyHeadline(headline) {
    console.log("Classify request:", headline);

    const { or_api_key } = await chrome.storage.local.get("or_api_key");

    if (!or_api_key) {
        return { error: "No OpenRouter API key saved." };
    }

    const payload = {
        model: "openai/gpt-oss-20b",
        messages: [
            {
                role: "system",
                content:
                "You are a strict classifier. ALWAYS answer with ONLY ONE WORD from this list: Politics, Sports, Business, Technology, Entertainment, World, Science, Health, Crime. No sentences. No explanation."
            },
            {
                role: "user",
                content: `Headline: "${headline}"`
            }
        ],
        max_tokens: 20,
    };

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${or_api_key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("Classification Response:", data);

        if (data.error) return { error: data.error };

        const result = data.choices?.[0]?.message?.content?.trim() || "Other";
        return { category: result };

    } catch (err) {
        console.error("Classification Error:", err);
        return { error: "Network/API error" };
    }
}

// --------------------------------------------------------------
// 2) SUMMARIZE ARTICLE using FREE model gpt-oss-20b
// --------------------------------------------------------------
async function summarizeArticle(text) {
    console.log("Summarizing article...");

    const { or_api_key } = await chrome.storage.local.get("or_api_key");

    if (!or_api_key) return { error: "No OpenRouter API key" };

    const payload = {
        model: "openai/gpt-oss-20b",
        messages: [
            {
                role: "system",
                content: "Summarize this news article in 3–4 sentences."
            },
            {
                role: "user",
                content: text
            }
        ],
        max_tokens: 200,
    };

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${or_api_key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("Summary Response:", data);

        if (data.error) return { error: data.error };

        const summary = data.choices?.[0]?.message?.content || "No summary.";
        return { summary };

    } catch (err) {
        console.error("Summary Error:", err);
        return { error: "Network/API error" };
    }
}

console.log("SW READY!");
