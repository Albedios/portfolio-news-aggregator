<div align="center">

# 📰 Briefly — AI-Powered News Digest & Tone Spectrum

**Distilled Editorial Intelligence • Multi-Model LLM Synthesis • Tone & Bias Radar**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM_Cloud-76b900?style=flat-square&logo=nvidia)](https://build.nvidia.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini_2.0_Flash-4285f4?style=flat-square&logo=google)](https://aistudio.google.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o_Mini-412991?style=flat-square&logo=openai)](https://platform.openai.com/)
[![Ollama](https://img.shields.io/badge/Ollama-Self--Hosted-black?style=flat-square&logo=ollama)](https://ollama.ai/)

</div>

---

## 📖 Overview

**Briefly** is an AI-powered news intelligence and synthesis platform engineered to cut through media noise, clickbait, and ideological bias. Built with a high-contrast editorial design system, Briefly ingests live RSS/Atom feeds, parses full-text journalistic content, and leverages frontier LLMs to produce structured executive summaries, sentiment audits, and multi-angle perspective comparisons.

---

## ✨ Key Features

### ⚡ 1. Executive AI Intelligence Briefs
- **Structured Synthesis:** 1-sentence TL;DR + 3 key bullet-point takeaways + editorial perspective summary.
- **Configurable Depth:** Choose between **Fast TL;DR** (~15s read), **Balanced Briefing** (~45s read), and **Deep Strategic Analysis** (~2m read).
- **Source Verified Badging:** Highlighted with distinct dashed intelligence containers and model verification indicators.

### 🎭 2. Tone & Bias Spectrum Analysis
- **6-Tier Real-Time Tone Classification:**
  - 🔬 **Analytical:** Data-driven, empirical reporting
  - 🔍 **Critical:** Skeptical, investigative framing
  - 📈 **Optimistic:** Forward-looking, opportunity-focused
  - 🚨 **Alarmist:** Urgency, systemic risk highlighting
  - ⚖️ **Neutral:** Balanced, objective reportage
  - ⚡ **Sensationalist:** High-emotion or speculative narratives
- **Sentiment Polarity Scoring:** Normalized progress scale (-1.0 to +1.0) with granular critical/neutral/optimistic indicators.
- **Clickbait Shield:** Real-time clickbait rating heuristic to filter out sensationalist headlines.

### 🧠 3. Multi-Model AI Studio Matrix
Seamlessly switch between cloud enterprise APIs and 100% private offline engines:
- 🟢 **NVIDIA NIM Cloud:** High-throughput GPU inference with `meta/llama-3.2-90b-vision-instruct`, Nemotron, and DeepSeek.
- 🔵 **Google Gemini:** Low-latency multimodal reasoning via `gemini-2.0-flash`.
- 🟣 **OpenAI:** Cost-efficient classification with `gpt-4o-mini`.
- 🦙 **Local Ollama:** 100% private, on-premise execution with zero external cloud calls.
- 🔒 **Offline Rule-Based NLP:** Zero-key fallback utilizing algorithmic sentiment scoring, lexical heuristics, and extractive summarization.

### 🌐 4. Source & Feed Management
- **Universal RSS / Atom / JSON Parser:** Ingest any RSS or publication stream with auto-metadata discovery.
- **1-Click Curated Global Presets:** Instant subscription to leading outlets across **Tech**, **AI**, **Finance**, **Science**, **World**, and **Culture**.
- **Automated Sync & Deduplication:** Real-time URL and title hashing to eliminate redundant stories.

### ⚖️ 5. Balanced Perspectives Matrix
- Cross-feed coverage detection matching overlapping news events to compare conflicting editorial framings and reporting angles side-by-side.

---

## 🎨 Design System (`DESIGN.md`)

Briefly embraces an **Editorial Minimalism** aesthetic combining the timeless elegance of classic print journalism with cutting-edge UI precision:

- **Typography Hierarchy:**
  - **Headlines:** `Newsreader` (Editorial Serif)
  - **Body & Summaries:** `Inter` (High-legibility geometric sans-serif)
  - **UI & Metadata:** `Hanken Grotesk` (Disciplined, sharp labeling)
- **Palette:**
  - `surface`: `#fcf8fb` (Subtle off-white paper canvas)
  - `surface-container-lowest`: `#ffffff` (Pure white card containers)
  - `primary`: `#005ab3` ("Intelligence Blue" accent)
  - `ai-summary-card`: `#F0F7FF` background with `1px dashed #005ab3` border
- **Tone Badges:** Pastel low-opacity background with high-opacity saturated text.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) with Custom Design Tokens |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database** | Embedded File-Based JSON Database (`data/news_aggregator.json`) |
| **Feed Ingestion** | XML/RSS 2.0 & Atom Feed Parser with HTML Sanitization & Readability extraction |
| **AI Inference** | NVIDIA NIM SDK / REST, Google Gemini API, OpenAI API, Ollama REST |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm** or **yarn** / **pnpm**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Albedios/portfolio-news-aggregator.git
   cd portfolio-news-aggregator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## ⚙️ AI Configuration & Keys

You can configure your AI provider directly inside the **AI Studio** tab in the application UI, or via environment variables:

```env
# NVIDIA NIM (Recommended)
NIM_API_KEY=nvapi-...
NIM_MODEL=meta/llama-3.2-90b-vision-instruct

# Google Gemini
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.0-flash

# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Local Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:latest
```

> **Note:** Even without any API keys, Briefly works out of the box using its built-in **Offline NLP Engine**!

---

## 📂 Project Structure

```
Portfolio/
├── data/
│   └── news_aggregator.json    # Local persisted database (articles, feeds, settings)
├── public/
│   └── briefly-logo.png        # Official brand asset
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── articles/       # Ingest, paginate, bookmark, analyze, perspectives
│   │   │   ├── feeds/          # RSS sync, CRUD operations, polling
│   │   │   ├── settings/       # AI provider config & connectivity testing
│   │   │   └── stats/          # Metric aggregations
│   │   ├── globals.css         # Design system CSS variables & utilities
│   │   ├── layout.tsx          # Root layout & Google typography
│   │   └── page.tsx            # Main application orchestrator
│   ├── components/
│   │   ├── AIStudioView.tsx    # Multi-model LLM control matrix
│   │   ├── ArticleCard.tsx     # Editorial feed article cards with dashed AI Briefs
│   │   ├── ArticleModal.tsx    # Reader deep dive modal & sentiment audit
│   │   ├── BrieflyLogo.tsx     # Scalable SVG brand mark
│   │   ├── Navbar.tsx          # Search bar, batch trigger, and sync status
│   │   ├── PerspectiveMatrix.tsx # Cross-feed event perspective comparison
│   │   ├── RightSidebar.tsx    # Quick AI insights & trending feed
│   │   ├── Sidebar.tsx         # Primary navigation & feed sync action
│   │   ├── SourceManagementView.tsx # RSS registry & curated discovery presets
│   │   └── ToneFilterBar.tsx   # Tone pills, LLM depth, & clickbait slider
│   └── lib/
│       ├── constants.ts        # Presets, tone palettes, & mock catalogs
│       ├── db.ts               # Local file storage engine
│       ├── ingestion/          # RSS parser, deduplicator, & content cleaner
│       └── llm/                # NVIDIA NIM, Gemini, OpenAI, Ollama & Offline providers
├── DESIGN.md                   # Complete brand & UI design system guidelines
├── package.json
└── tailwind.config.mjs         # Theme tokens & typography definitions
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
