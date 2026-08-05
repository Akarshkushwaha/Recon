# 📡 Recon — Autonomous AI Developer Memory & Codebase Intelligence

<div align="center">

### **The real-time pulse, institutional memory, and early warning system for engineering teams.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-recon--henna.vercel.app-F97316?style=for-the-badge&logo=vercel&logoColor=white)](https://recon-henna.vercel.app)
[![Next.js 15](https://img.shields.io/badge/Next.js%2015-Black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Convex](https://img.shields.io/badge/Convex-Realtime%20Backend-FF4500?style=for-the-badge&logo=convex&logoColor=white)](https://convex.dev)

</div>

---

Recon connects to your GitHub repositories to give your team instant, live visibility into active branches, incoming code changes, and potential conflicts **before** they become merge nightmares. 

Unlike traditional AI assistants that treat every pull request like a stateless blank slate, Recon is powered by a **persistent memory engine**. It remembers developer coding styles, tracks historical file risk profiles from past CI failures, adapts to feedback over time, and automates tedious workflows like daily standups and documentation.

---

## 📑 Table of Contents

- [⚡ Why Recon?](#-why-recon)
- [🚀 Key Features](#-key-features)
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


## 🚀 Key Features

### 🔍 Real-Time Activity Feed & Telemetry Sync
No more asking *"who is working on what?"* Track every push, commit, and pull request across all branches with a high-fidelity live stream. Features seamless **auto-claiming for legacy installations**—ensuring that all repository telemetry and historical webhook activity remain visible and synced even across unclaimed or demo deployments.

### ⚠️ Early Conflict Detection & Visual Playground
Recon automatically analyzes modified file paths on every push. The moment two developers edit the same file on separate branches, Recon alerts you instantly and provides an **interactive visual Playground** to inspect diffs and resolve overlaps side-by-side before attempting a git merge.

### ✍️ Self-Learning Automated PR Descriptions
Open a Pull Request with an empty body and let Recon handle the documentation. Powered by Gemini 2.0 Flash and a persistent memory layer, Recon analyzes code diffs and writes structured, comprehensive descriptions tailored precisely to the author's historical writing style.

### 🎙️ Adaptive AI-Powered Daily Standups
Stop spending hours compiling daily updates. Recon aggregates cross-branch commit history and queries memory for merged PRs, active blockers, and team formatting preferences to automatically draft structured, high-value standup reports using Groq (Llama 3.3).

### 🎯 AI Issue Drafter
Describe a bug or feature idea in plain English. Recon structures it into a polished, markdown-formatted GitHub Issue complete with title, label recommendations, complexity estimates, and implementation checklists, ready to copy to your clipboard.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Real-Time Backend:** [Convex](https://convex.dev) (Serverless reactive database, queries, mutations, & cron workflows)
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
