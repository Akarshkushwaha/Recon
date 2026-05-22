# 📡 RECON 

**The real-time pulse of your development team.** Recon helps engineering teams maintain absolute awareness of code changes across all branches, detecting conflicts *before* they hit the PR phase and automating the repetitive tasks of daily standups and PR documentation.

🚀 **Live Deployed Application:** [https://recon-henna.vercel.app](https://recon-henna.vercel.app/)

![Recon Dashboard](https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=1200)

## 🚀 Key Features

### 1. Live Awareness Feed
Track every push across every branch in real-time. No more "Who is working on what?" — Recon shows you the active heartbeat of your repositories.

### 2. Early Conflict Detection
Recon scans file paths in every push. If two developers are modifying the same files on different branches, Recon alerts you instantly so you can coordinate early.

### 3. AI-Powered Standups
Stop manually writing "What I did yesterday." Recon analyzes your commit history and generates structured daily digests automatically.

### 4. Smart PR Descriptions
Open a Pull Request and let Gemini AI analyze your code diffs. Recon automatically populates your PR description with a clear summary of changes.

### 5. NL to GitHub Issues
Describe a bug or feature in plain English, and Recon (powered by Groq) will convert it into a structured GitHub Issue with labels and assignees.

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

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.
