// TalkToNews - Content Script
// This script runs inside every webpage and extracts headlines + article text.

console.log("TalkToNews content script is running...");

// Helper: get visible text safely
function getVisibleText(element) {
    if (!element) return "";
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") return "";
    return element.innerText?.trim() || "";
}

// Main extraction function
function extractNews() {
    const extracted = [];

    // 1️⃣ Try extracting <article> elements
    const articles = document.querySelectorAll("article");

    if (articles.length > 0) {
        articles.forEach((article, index) => {
            const headline =
                getVisibleText(article.querySelector("h1, h2, .title, .headline")) ||
                `Article ${index + 1}`;

            const paragraphs = article.querySelectorAll("p");
            const body = Array.from(paragraphs)
                .map(getVisibleText)
                .filter(Boolean)
                .join("\n\n");

            extracted.push({ id: `article-${index + 1}`, headline, body });
        });
    }

    // 2️⃣ If no <article> elements found → use fallback extraction
    if (extracted.length === 0) {
        const h1 = document.querySelector("h1");
        const h2s = document.querySelectorAll("h2");

        if (h1) {
            extracted.push({
                id: "main-h1",
                headline: getVisibleText(h1),
                body: ""
            });
        }

        let counter = 1;
        h2s.forEach(h2 => {
            extracted.push({
                id: `h2-${counter++}`,
                headline: getVisibleText(h2),
                body: ""
            });
        });
    }

    return extracted;
}

// Send extraction result to popup/background
function sendExtraction() {
    const data = extractNews();

    // Send to popup or background
    chrome.runtime.sendMessage({
        type: "NEWS_EXTRACT",
        payload: data
    });

    console.log("TalkToNews extracted:", data);
}

// Run immediately after page loads
sendExtraction();

// Also run again when page content changes (dynamic sites like CNN)
const observer = new MutationObserver(() => {
    sendExtraction();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "EXTRACT_NOW") {
      sendResponse({ data: extractNews() });
    }
  });
  