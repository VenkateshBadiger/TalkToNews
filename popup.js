console.log("TalkToNews popup loaded.");

let headlines = [];
let selectedIndex = -1;

const listView = document.getElementById("listView");
const statusEl = document.getElementById("status");
const summaryBox = document.getElementById("summaryBox");

// ---------------------------
// Render Headlines
// ---------------------------
function renderHeadlines() {
    listView.innerHTML = "";

    if (!headlines || headlines.length === 0) {
        statusEl.textContent = "No headlines found.";
        return;
    }

    statusEl.textContent = `Found ${headlines.length} headlines`;

    headlines.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "headline-item";

        div.textContent = `${item.headline}\n${item.category || "—"}`;

        div.dataset.index = index;

        if (index === selectedIndex) {
            div.classList.add("selected");
        }

        div.addEventListener("click", () => {
            selectedIndex = index;

            chrome.runtime.sendMessage(
                { type: "CLASSIFY_HEADLINE", text: item.headline },
                (response) => {
                    item.category = response?.category || "Other";
                    renderHeadlines();
                }
            );

            renderHeadlines();
        });

        listView.appendChild(div);
    });
}

// ---------------------------
// Receive extracted headlines
// ---------------------------
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "NEWS_EXTRACT") {
        headlines = msg.payload;
        renderHeadlines();
    }
});

// ---------------------------
// Initial extraction request
// ---------------------------
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    if (!tab || tab.url.startsWith("chrome://")) {
        statusEl.textContent = "Cannot extract from this page.";
        return;
    }

    chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_NOW" }, (response) => {
        if (chrome.runtime.lastError) {
            statusEl.textContent = "Waiting for page content...";
            return;
        }

        if (response?.data) {
            headlines = response.data;
            renderHeadlines();
        }
    });
});

// ---------------------------
// Play headline (TTS)
// ---------------------------
document.getElementById("playBtn").addEventListener("click", () => {
    if (selectedIndex === -1) {
        statusEl.textContent = "Select a headline.";
        return;
    }

    const text = headlines[selectedIndex].headline;
    const utter = new SpeechSynthesisUtterance(text);

    speechSynthesis.speak(utter);
});

// Stop all TTS
document.getElementById("stopBtn").addEventListener("click", () => {
    speechSynthesis.cancel();
});

// ---------------------------
// Summarize article
// ---------------------------
document.getElementById("summaryBtn").addEventListener("click", () => {
    if (selectedIndex === -1) {
        summaryBox.textContent = "Select a headline first.";
        return;
    }

    const article = headlines[selectedIndex].body;

    if (!article || article.length < 60) {
        summaryBox.textContent = "Not enough article text to summarize.";
        return;
    }

    summaryBox.textContent = "Summarizing...";

    chrome.runtime.sendMessage(
        { type: "SUMMARIZE_ARTICLE", text: article },
        (response) => {
            if (response?.summary) {
                summaryBox.textContent = response.summary;
            } else {
                summaryBox.textContent = "Failed to summarize.";
            }
        }
    );
});

// ---------------------------
// Read Summary Aloud (NEW)
// ---------------------------
document.getElementById("readSummaryBtn").addEventListener("click", () => {
    const summary = summaryBox.textContent.trim();

    if (!summary || summary === "Summarizing...") {
        statusEl.textContent = "No summary available yet.";
        return;
    }

    const utter = new SpeechSynthesisUtterance(summary);
    speechSynthesis.speak(utter);
});
