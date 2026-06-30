# Contributing to Recon 📡

Thank you for your interest in contributing to Recon! Recon is a real-time developer awareness platform designed to keep engineering teams connected and eliminate merge conflicts. 

This document outlines the guidelines and procedures to help you contribute effectively.

---

## 🗺️ Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful, welcoming, and inclusive to all contributors.
- Focus on what is best for the community and project.
- Accept constructive criticism gracefully.

---

## 🛠️ Getting Started

### Prerequisites

To run Recon locally, you will need:
- **Node.js**: `v18.x` or higher (we recommend `v20.x` LTS)
- **npm** or **yarn**
- **Convex CLI** (automatically installed as a devDependency, runs via `npx convex`)

### Setting Up Your Environment

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/Recon.git
   cd Recon
   ```
3. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
4. **Initialize Convex**:
   Start the Convex backend server. This will prompt you to log into Convex and create a new project:
   ```bash
   npx convex dev
   ```
   *This command will create a `.env.local` file with the `NEXT_PUBLIC_CONVEX_URL` automatically.*

5. **Configure Auth & AI Keys**:
   Open `.env.local` and add the rest of your local configuration parameters:
   ```env
   # Clerk Auth (Get keys from https://clerk.com)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-issuer-domain.clerk.accounts.dev

   # GitHub Integration (Generate a GitHub App for local testing)
   GITHUB_APP_ID=123456
   GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
   GITHUB_WEBHOOK_SECRET=your_local_webhook_secret

   # AI Integration
   GROQ_API_KEY=gsk_...
   GEMINI_API_KEY=AIzaSy...
   ```

### Running Locally

To start the full stack local development environment:

1. **Convex Dev Server** (keeps schema and functions synchronized in real-time):
   ```bash
   npx convex dev
   ```
2. **Next.js Dev Server** (in a separate terminal):
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to view your local deployment.

---

## 📂 Project Structure

Here is a quick map of the codebase to help you find your way around:

```
Recon/
├── convex/               # Convex backend database schemas, queries, and mutations
│   ├── schema.ts         # Database structure declarations
│   ├── activity.ts       # Main webhook log and active branch functions
│   └── conflicts.ts      # Early conflict detection and resolution engine
├── src/
│   ├── app/              # Next.js App Router routes and pages
│   │   ├── dashboard/    # Real-time dashboard sections
│   │   │   ├── conflicts/ # Merge conflict lists and visual Playground
│   │   │   ├── standups/  # Team daily standups feed
│   │   │   └── changelogs/# Release changelog generators
│   │   └── page.tsx      # Platform landing page
│   ├── components/       # Shared UI components (Layout, Modals, Buttons)
│   └── styles/           # Styling & global configuration
```

---

## 🤝 Contribution Workflow

1. **Check Existing Issues**: Search for open issues or create a new one to discuss the bug fix or feature you'd like to implement.
2. **Create a Feature Branch**:
   We use the `feature/` and `fix/` branching strategy. Please name your branches appropriately:
   ```bash
   git checkout -b feature/your-awesome-feature
   # or
   git checkout -b fix/issue-description
   ```
3. **Commit Your Changes**: 
   We strictly follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) for commit messages. This helps us automate changelogs and versioning.
   Example:
   ```bash
   git commit -m "feat: implement early conflict warning system in playground"
   # or
   git commit -m "fix: resolve rendering issue in conflict viewer"
   ```
4. **Validate Your Code**:
   Before submitting your PR, ensure that the codebase builds correctly and passes the linter:
   ```bash
   npm run lint
   npm run build
   ```
5. **Push and Open a PR**: Push your branch to your fork and submit a Pull Request to our main branch. Provide a comprehensive summary of changes, any visual screenshots for UI changes, and how you verified your changes.

---

## 💬 Questions and Support

If you have any questions, feel free to open a GitHub Discussion or join the conversation in active issues. We look forward to building a smarter developer experience together! 📡
