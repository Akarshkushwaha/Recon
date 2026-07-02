# 📡 Recon — Autonomous AI Developer Memory & Codebase Intelligence

<div align="center">

### **The real-time pulse, institutional memory, and early warning system for engineering teams.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-recon--henna.vercel.app-F97316?style=for-the-badge&logo=vercel&logoColor=white)](https://recon-henna.vercel.app)
[![Powered by Cognee](https://img.shields.io/badge/Powered%20by-Cognee%20AI-8B5CF6?style=for-the-badge&logo=probot&logoColor=white)](https://cognee.ai)
[![Next.js 15](https://img.shields.io/badge/Next.js%2015-Black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Convex](https://img.shields.io/badge/Convex-Realtime%20Backend-FF4500?style=for-the-badge&logo=convex&logoColor=white)](https://convex.dev)

</div>

---

Recon connects to your GitHub repositories to give your team instant, live visibility into active branches, incoming code changes, and potential conflicts **before** they become merge nightmares. 

Unlike traditional AI assistants that treat every pull request like a stateless blank slate, Recon is powered by a **persistent Cognee Hybrid Graph-Vector Memory Engine**. It remembers developer coding styles, tracks historical file risk profiles from past CI failures, adapts to feedback over time, and automates tedious workflows like daily standups and documentation.

---

## 📑 Table of Contents

- [⚡ Why Recon?](#-why-recon)
- [🧠 The Cognee Memory Engine](#-the-cognee-memory-engine)
- [🚀 Key Features](#-key-features)
- [🏆 Hackathon & Judging Criteria Highlights](#-hackathon--judging-criteria-highlights)
- [🛠️ Tech Stack](#️-tech-stack)
- [⚙️ Setup & Installation](#️-setup--installation)
- [🤖 GitHub App Configuration](#-github-app-configuration)
- [🌍 Open Source & Community](#-open-source--community)
- [📄 License](#-license)

---

## ⚡ Why Recon?

In fast-moving software development teams, coordination is a constant bottleneck. Developers touch the same files across isolated git branches, leading to painful merge conflicts at the end of a sprint, broken CI/CD pipelines, and lost context. 

Recon acts as an **autonomous coordination and institutional memory layer**. By intercepting GitHub push events and webhook telemetry in real time, Recon shifts conflict resolution left—flagging code collisions early, learning from past team behaviors, and keeping everyone synchronized without administrative overhead.

---

## 🧠 The Cognee Memory Engine

Recon integrates deeply with **[Cognee](https://cognee.ai)** to provide an adaptive, hybrid graph-vector memory layer. Our dedicated Python cognitive microservice (`memory_service/`) implements the **complete 4-part Cognee Memory Lifecycle API**:

```mermaid
graph TD
    A[GitHub Webhooks / Telemetry] -->|PR Opened / Commits| B(cognee.remember)
    B --> C[(Hybrid Graph-Vector Store<br/>Kuzu + LanceDB + SQLite)]
    D[PR Description / Standup Request] -->|Author & Risk Query| E(cognee.recall)
    C --> E
    E --> F[Tailored AI Output]
    G[PR Merged / CI Failed] -->|Edit Distance & Build Signal| H(cognee.improve)
    H -->|Dynamic Weight Adjustment| C
    I[Module Rewrite / Developer Offboarding] -->|Surgical Pruning| J(cognee.forget)
    J -->|Remove Stale Edges| C
```

1. **`cognee.remember()` (Ingestion & Graph Mapping):** Automatically ingests pull request events, author metadata, touched files, and merge outcomes into structured repository datasets (`repo_{repo}`, `incidents_{repo}`).
2. **`cognee.recall()` (Context & Risk Retrieval):** Before generating PR documentation or team standups, Recon queries Cognee to retrieve the specific developer's preferred communication style (`session_id=author_{author}`) and calculates historical risk scores for touched files.
3. **`cognee.improve()` (Reinforcement Learning):** Uses Python's `difflib.SequenceMatcher` to measure the edit distance between AI-generated PR descriptions and final merged text. If a developer rewrites a description, Recon sends feedback signals (`correct: edit_distance < 0.3`) to dynamically adjust graph edge weights so it learns their exact voice! It also triggers negative risk weightings whenever a CI build fails after a merge.
4. **`cognee.forget()` (Surgical Memory Pruning):** Implements targeted cleanup—when a module is completely rewritten, stale risk history is purged (`on_module_rewrite`). When a team member departs (`on_developer_offboarded`), their style preferences are surgically removed without degrading global team memory.

---

## 🚀 Key Features

### 🧠 Interactive Cognee Memory Playground
Experience the power of persistent AI memory firsthand! Navigate to `/dashboard/memory` in the app to access an interactive simulator. Step through multi-week simulations (**Week 1 → Week 2 → Week 3**) and watch AI style weights, developer preferences, and incident risk scores evolve in real time as simulated feedback signals are processed.

### 🔍 Real-Time Activity Feed & Telemetry Sync
No more asking *"who is working on what?"* Track every push, commit, and pull request across all branches with a high-fidelity live stream. Features seamless **auto-claiming for legacy installations**—ensuring that all repository telemetry and historical webhook activity remain visible and synced even across unclaimed or demo deployments.

### ⚠️ Early Conflict Detection & Visual Playground
Recon automatically analyzes modified file paths on every push. The moment two developers edit the same file on separate branches, Recon alerts you instantly and provides an **interactive visual Playground** to inspect diffs and resolve overlaps side-by-side before attempting a git merge.

### ✍️ Self-Learning Automated PR Descriptions
Open a Pull Request with an empty body and let Recon handle the documentation. Powered by Gemini 2.0 Flash and Cognee memory, Recon analyzes code diffs and writes structured, comprehensive descriptions tailored precisely to the author's historical writing style.

### 🎙️ Adaptive AI-Powered Daily Standups
Stop spending hours compiling daily updates. Recon aggregates cross-branch commit history and queries Cognee memory for merged PRs, active blockers, and team formatting preferences to automatically draft structured, high-value standup reports using Groq (Llama 3.3).

### 🎯 AI Issue Drafter
Describe a bug or feature idea in plain English. Recon structures it into a polished, markdown-formatted GitHub Issue complete with title, label recommendations, complexity estimates, and implementation checklists, ready to copy to your clipboard.

---

## 🏆 Hackathon & Judging Criteria Highlights

| Judging Criterion | How Recon Excels |
| :--- | :--- |
| **01. Potential Impact** | Solves the universal engineering bottleneck of branch conflicts and lost context. Transforms stateless AI into an institutional team memory bank that prevents CI failures and saves hours of documentation time. |
| **02. Creativity & Innovation** | Pioneers an "air traffic control" coordination layer for Git repositories. Innovates with self-learning PR descriptions via edit-distance feedback and post-mortem incident risk scoring for files. |
| **03. Technical Excellence** | Built on a modern, responsive stack (Next.js 15, React 19, Convex real-time DB, Clerk Auth). Decoupled Python FastAPI cognitive microservice with robust fallback modes between cloud and local self-hosted memory. |
| **04. Best Use of Cognee** | Deep integration implementing the complete **4-part Cognee lifecycle API** (`remember`, `recall`, `improve`, `forget`) over a hybrid graph-vector store (Kuzu + LanceDB + SQLite). |
| **05. User Experience** | Premium dark-mode aesthetic with vibrant gradients, micro-animations, real-time activity streams, and an intuitive **Interactive Memory Simulator** that makes AI learning visual and understandable. |
| **06. Presentation Quality** | Thorough documentation, live deployed application on Vercel, automated demo datasets, and interactive simulators designed for instant, zero-friction evaluation. |

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Real-Time Backend:** [Convex](https://convex.dev) (Serverless reactive database, queries, mutations, & cron workflows)
- **AI Memory & Microservice:** [Cognee](https://cognee.ai) Hybrid Graph-Vector Engine, Python 3.10+, FastAPI, Kuzu, LanceDB, SQLite
- **Authentication:** [Clerk](https://clerk.com) (with GitHub OAuth mapping & identity verification)
- **AI Models:** Google Gemini 1.5 Pro / 2.0 Flash, Groq (Llama 3.3 70B)
- **GitHub Integration:** GitHub Apps, Octokit, Webhook Telemetry Ingestion

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 18+ and `npm`
- Python 3.10+ and `pip`
- A GitHub account and access to create a GitHub App

### 1. Clone the Repository
```bash
git clone https://github.com/Akarshkushwaha/Recon.git
cd Recon
```

### 2. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Convex Realtime Backend
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev

# GitHub App Integration
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_secret

# AI APIs
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...

# Cognee Memory Service (Optional: leave blank for self-hosted local SQLite/LanceDB mode)
COGNEE_API_URL=
COGNEE_API_KEY=
```

### 3. Start the Real-Time Convex Backend
In your first terminal window:
```bash
npm install --legacy-peer-deps
npx convex dev
```

### 4. Start the Next.js Frontend Application
In your second terminal window:
```bash
npm run dev
```
The frontend dashboard will be available at [http://localhost:3000](http://localhost:3000).

### 5. Start the Cognee Python Memory Microservice (Optional / AI Cognitive Layer)
In your third terminal window:
```bash
cd memory_service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
The memory microservice API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🤖 GitHub App Configuration

To unlock live branch tracking and automated PR documentation, create a GitHub App in your developer settings with the following permissions:

- **Pull requests:** Read & Write *(For automated descriptions and PR analysis)*
- **Issues:** Read & Write *(For AI issue drafting)*
- **Contents:** Read-only *(For diff inspection and file risk calculation)*
- **Metadata:** Read-only *(For repository structure and branch discovery)*

**Subscribe to Webhook Events:**
- `Push`
- `Pull request`
- `Repository`
- `Installation` / `Installation target`

Point your GitHub App webhook URL to your deployed Vercel endpoint or local tunnel: `https://your-domain.vercel.app/api/github/webhook`.

---

## 🌍 Open Source & Community

Recon is proudly open source! We actively welcome community contributions, bug reports, and feature suggestions.

- **[Contributing Guide](CONTRIBUTING.md):** Learn how to set up the project locally, our branching strategy, and how to submit a PR.
- **[Code of Conduct](CODE_OF_CONDUCT.md):** Review our community guidelines to ensure a welcoming and inclusive environment.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for full details.
