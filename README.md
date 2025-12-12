# 🔊 TalkToNews  
### AI-Powered Accessible News Reader Chrome Extension  
*Make news reading easier, smarter, and more accessible using Generative AI.*

---

# 📌 Overview

**TalkToNews** is a Chrome extension designed to make online news consumption accessible, efficient, and AI-powered.  
The extension automatically extracts headlines and article text from any news website, classifies each headline using a **Generative AI zero-shot classifier**, generates short readable summaries using **LLM-based summarization**, and reads the content aloud using the **Web Speech API (TTS)**.

This tool is built especially for:

- Visually impaired users  
- Users who prefer consuming news through audio  
- People who want quick summaries  
- Anyone who wants a clean, distraction-free news experience  

---

# 🖼️ **Working Diagram (Insert Image Here)**  
> 📌 Add your architecture/working diagram here  
> Save your file as: `docs/working-diagram.png`


---

# 🧠 **How TalkToNews Works — Complete Flow**

### **1️⃣ User opens any news website**  
The extension automatically injects a *content script* into the page.

---

### **2️⃣ Content Script Extracts News Data**
The script scans the DOM for:

- `<article>` tags  
- `<h1>` and `<h2>` tags  
- `<p>` tags for article bodies  

It collects:

- Headline  
- Full article text (if available)  
- Fallback headings if article tags are missing  

The extracted data is sent to the popup using **Chrome Messaging API**.

---

### **3️⃣ Popup Displays Headlines**
When the user clicks the extension icon:

- Headlines appear in a clean scrollable list  
- Each headline becomes selectable  
- The user can click on a headline to perform further actions  

---

### **4️⃣ AI Headline Classification**
When a headline is selected:

- Popup sends the headline text → Service Worker  
- Service Worker sends a request to **OpenRouter**  
- Model used: **`openai/gpt-oss-20b`** (free)  
- AI returns one category:
  - Politics  
  - Sports  
  - Business  
  - Technology  
  - Entertainment  
  - World  
  - Crime  
  - Science  
  - Health  
  - Other  

This is done using **Zero-Shot Classification**, meaning the AI classifies the headline without prior training on news datasets.

---

### **5️⃣ AI Summarization of Full Article**
When the user clicks **"Summarize"**:

- Full article text is sent to the Service Worker  
- Service Worker sends summarization request → OpenRouter  
- AI returns a 3–4 sentence concise summary  
- Summary appears in the popup  
- User can click **"Read Summary"** to listen to it via TTS  

---

### **6️⃣ Text-to-Speech (TTS)**
Both **headlines** and **summaries** can be spoken aloud using:

- The browser’s built-in **Web Speech API**  
- No external TTS model required  
- Works instantly and offline  

---

### **7️⃣ User navigates effortlessly**
User can scroll headlines, select another headline, classify, summarize, or listen.

---

# 🖼️ **Final Output (Insert Images Here)**  
> 📌 Add screenshots of your UI here  
> Save as:  
> — `docs/output-1.png`  
> — `docs/output-2.png`  
> — `docs/output-summary.png`


---

# ⚙️ Installation Guide (Step-by-Step)

### **1. Download or Clone the Repository**
```bash
git clone https://github.com/YOUR-USERNAME/TalkToNews.git
