// -----------------------------------------------------------
// TalkToNews - Options Page (OpenRouter API Key Storage)
// -----------------------------------------------------------

console.log("TalkToNews Options Page Loaded");

// Inputs
const orInput = document.getElementById("orKeyInput");
const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");

// Load existing key when options page opens
chrome.storage.local.get(["or_api_key"], (data) => {
    if (data.or_api_key) {
        orInput.value = data.or_api_key;
        console.log("Loaded existing OpenRouter key.");
    } else {
        console.log("No OpenRouter key saved yet.");
    }
});

// Save key to Chrome storage
saveBtn.addEventListener("click", () => {
    const apiKey = orInput.value.trim();

    if (!apiKey) {
        statusEl.textContent = "Please enter a valid API key.";
        return;
    }

    chrome.storage.local.set({ or_api_key: apiKey }, () => {
        statusEl.textContent = "API key saved successfully!";
        console.log("Saved OpenRouter API key:", apiKey);
    });
});
