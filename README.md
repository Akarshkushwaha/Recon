# 📡 Recon

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

### **The real-time pulse and early warning system for engineering teams.**

Recon connects to your GitHub repositories to give your team instant, live visibility into active branches, incoming code changes, and potential conflicts **before** they become merge nightmares. By intercepting push events in real-time, Recon flags code collisions early and automates tedious tasks like daily standups, pull request documentation, and changelog generation using AI.

🔗 **Live Deployed Application:** [recon-henna.vercel.app](https://recon-henna.vercel.app)

---

## 📑 Table of Contents

- [Why Recon?](#-why-recon)
- [Key Features](#-key-features)
- [Tech Stack](#️-tech-stack)
- [Setup & Installation](#️-setup--installation)
- [GitHub App Configuration](#-github-app-configuration)
- [Open Source & Community](#-open-source--community)
- [License](#-license)

---

## ⚡ Why Recon?

In fast-moving development teams, coordination is a constant bottleneck. Developers touch the same files on different branches, leading to painful merge conflicts at the end of a sprint. Recon acts as a live, automated coordination layer, shifting conflict resolution left and keeping everyone in sync without overhead.

## 🚀 Key Features

### 🔍 Real-Time Activity Feed
No more asking *"who is working on what?"* Track every push across every branch with a high-fidelity stream that updates live.

### ⚠️ Early Conflict Detection & Visual Playground
Recon automatically analyzes modified paths on every push. The moment two developers edit the same file on separate branches, Recon alerts you and hosts an **interactive visual Playground** to resolve overlaps side-by-side.

### ✍️ AI-Powered Daily Standups
Stop manually writing daily updates. Recon analyzes your branch commit history and uses Groq (Llama 3.3) to automatically draft structured standups for you.

### 📝 Automated PR Descriptions
Open a Pull Request with an empty body and let Recon handle the docs. Gemini 2.0 Flash analyzes the code diffs and writes a clear, reviewable, structured description of the changes.

### 🎯 AI Issue Drafter
Describe a bug or feature in plain English. Recon structures it into a polished, markdown-formatted GitHub Issue complete with title, label recommendations, and estimates, ready to copy to your clipboard.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, Lucide Icons
- **Backend**: [Convex](https://convex.dev) (Real-time database & serverless functions)
- **Auth**: [Clerk](https://clerk.com)
- **AI Models**: Google Gemini 1.5 Pro & Groq (Llama 3)
- **Integration**: GitHub Apps & Octokit

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/Akarshkushwaha/Recon.git
cd Recon
```

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWT_ISSUER_DOMAIN=https://your-domain.clerk.accounts.dev

# GitHub App
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET=your_secret

# AI
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
```

### 4. Run Locally
Start the Convex backend:
```bash
npx convex dev
```

In a new terminal, start the frontend:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

## 🤖 GitHub App Configuration

To use the full power of Recon, create a GitHub App with these permissions:
- **Pull requests**: Read & Write
- **Issues**: Read & Write
- **Contents**: Read-only
- **Metadata**: Read-only

Subscribe to events: **Push**, **Pull request**, **Repository**, and **Installation target**.

## 🌍 Open Source & Community

Recon is proudly open source and we actively welcome community contributions! Whether you're fixing a bug, adding a new feature, or improving documentation, your help is appreciated.

- **[Contributing Guide](CONTRIBUTING.md)**: Learn how to set up the project locally, our branching strategy, and how to submit a PR.
- **[Code of Conduct](CODE_OF_CONDUCT.md)**: Please review our community guidelines to ensure a welcoming environment for everyone.

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.
