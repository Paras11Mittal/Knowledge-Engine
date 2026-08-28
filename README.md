# HealthyGamerGG Knowledge Base — Nautilus Magazine Web Application

A systematic, authoritative psycho-educational wiki synthesizing Dr. Alok Kanojia's (Dr. K) teachings across 34 master articles organized into 7 core pillars.

## 📁 Directory Structure

```
healthygamer_knowledge_base/
├── index.html            # Primary Nautilus Magazine Web Application UI
├── styles.css            # Custom Nautilus Editorial Design System CSS
├── app.js                # Client-Side Interactive Engine (Search, Filter, Reader, TOC)
├── articles_db.js        # Standalone JavaScript database with all 34 master articles
├── build_db.py           # Python utility script to update articles_db.js from articles/
├── SITEMAP.md            # Complete Master Index & Taxonomy with article links
├── README.md             # Documentation & Usage Guide
└── articles/             # 34 Full Master Articles (Markdown format)
    ├── 1.1-dopamine-detox.md
    ├── 1.2-anatomy-of-procrastination.md
    ├── ...
    └── 7.4-sensory-overload-modern-information-diet.md
```

## 🚀 Quick Start Guide

### Option A: Open directly in your Web Browser (No Installation Required)
Simply double-click `index.html` or open it directly in Chrome, Firefox, Edge, or Safari:
`file:///C:/Users/Asus/.gemini/antigravity/scratch/healthygamer_knowledge_base/index.html`

### Option B: Host locally via Python HTTP Server
Run the following command in terminal:
```bash
cd healthygamer_knowledge_base
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

## 🏛️ Core Pillars Covered

1. **Dopamine, Motivation & Addiction Dynamics** (Articles 1.1–1.5)
2. **Identity, Ego & The Gifted Kid Trap** (Articles 2.1–2.5)
3. **Emotional Processing, Alexithymia & Trauma Digestion** (Articles 3.1–3.5)
4. **Vedic Psychology, Mind Architecture & Meditation Science** (Articles 4.1–4.5)
5. **Dharma, Purpose, Career & Overcoming Stagnation** (Articles 5.1–5.5)
6. **Social Dynamics, Attachment & Relational Healing** (Articles 6.1–6.5)
7. **Executive Function, Sleep & Neurodivergent Health** (Articles 7.1–7.4)

---

## 🛠️ Adding New Articles or Updating

If you add new markdown files to the `articles/` directory, update the database by running:
```bash
python build_db.py
```
This regenerates `articles_db.js` automatically.
