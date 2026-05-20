"use client";

import Link from "next/link";
import { 
  ArrowRight, Activity, Shield, Zap, Cpu, Code2, GitMerge, 
  GitBranch, Sparkles, ChevronRight, Check, Star, Users, 
  Clock, TrendingUp
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
];

const FEATURES = [
  {
    icon: Shield,
    badge: "PREVENTION",
    title: "Early Conflict Detection",
    description: "Recon scans every push event across all active branches in real-time. The moment two developers touch the same file on different branches, you're alerted — before it becomes a merge nightmare.",
    color: "blue",
  },
  {
    icon: Sparkles,
    badge: "AI-POWERED",
    title: "Auto Daily Standups",
    description: "Groq's Llama 3.3 70B analyzes your commit history and writes your standup for you. What you shipped yesterday, what's next, blockers — all inferred automatically from your code.",
    color: "violet",
  },
  {
    icon: Cpu,
    badge: "GEMINI 2.0",
    title: "Smart PR Descriptions",
    description: "Open a PR with an empty body and Recon fills it in. Gemini 2.0 Flash reads the actual diff, understands what changed, and writes a structured, reviewable description.",
    color: "emerald",
  },
  {
    icon: Code2,
    badge: "NL → GITHUB",
    title: "Issue Creation via NL",
    description: "Describe a task or bug in plain English. Recon structures it into a proper GitHub Issue with title, labels, assignee, and estimate — and creates it directly via the GitHub API.",
    color: "orange",
  },
  {
    icon: GitBranch,
    badge: "AUTOMATION",
    title: "Stale Branch Alerting",
    description: "Configure your own threshold. Any branch that goes quiet past that deadline gets flagged automatically so your team can clean up, close, or re-engage on time.",
    color: "rose",
  },
  {
    icon: GitMerge,
    badge: "WEEKLY DIGEST",
    title: "AI Changelog Generator",
    description: "One click. Groq synthesizes an entire week of commits, merges, and file changes into polished customer-facing release notes in Markdown — ready to publish.",
    color: "cyan",
  },
];

const STATS = [
  { value: "< 200ms", label: "Webhook latency" },
  { value: "17+", label: "Repos supported" },
  { value: "100%", label: "Real-time sync" },
  { value: "2 AI", label: "Model providers" },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Install the GitHub App",
    description: "Connect Recon to your GitHub account in under 60 seconds. Select individual repositories or grant access to all.",
  },
  {
    step: "02",
    title: "Webhooks flow to Recon",
    description: "Every push, PR, and installation event is signed, verified, and processed in real-time through our Convex serverless backend.",
  },
  {
    step: "03",
    title: "Intelligence surfaces instantly",
    description: "Your dashboard updates live. Conflicts flagged, standups drafted, PR descriptions written — your team always knows what's happening.",
  },
];

const colorMap: Record<string, string> = {
  blue: "from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-500",
  violet: "from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-500",
  emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-500",
  orange: "from-orange-500/10 to-orange-500/5 border-orange-500/20 text-orange-500",
  rose: "from-rose-500/10 to-rose-500/5 border-rose-500/20 text-rose-500",
  cyan: "from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-500",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Background Grid */}
      <div className="fixed inset-0 -z-10 h-full w-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:80px_80px] opacity-30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50">
        <div className="mx-auto max-w-7xl px-6 pt-4">
          <nav className="flex items-center justify-between h-14 px-5 rounded-2xl glass border shadow-lg shadow-black/5">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
                <Activity size={16} className="text-primary-foreground" />
              </div>
              <span className="font-bold text-base tracking-tight">Recon</span>
            </Link>

            {/* Center links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <SignedIn>
                <Link href="/dashboard" className="btn-primary text-sm px-4 py-2">
                  Dashboard
                  <ChevronRight size={14} />
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-ghost text-sm">Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-primary text-sm px-4 py-2">
                    Get started free
                    <ArrowRight size={14} />
                  </button>
                </SignUpButton>
              </SignedOut>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none">
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-1/4 w-60 h-60 bg-violet-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/8 border border-primary/20 text-primary text-xs font-semibold mb-8 animate-fade-up">
            <Star size={11} className="fill-current" />
            Built for engineering teams who ship fast
            <span className="text-primary/60">→</span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(2.5rem,7vw,5rem)] font-black tracking-tight leading-[1.05] mb-7 animate-fade-up animate-delay-100">
            The real-time pulse of your<br />
            <span className="gradient-text">development team.</span>
          </h1>

          {/* Subhead */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 font-medium animate-fade-up animate-delay-200">
            Recon connects to your GitHub repositories and gives your team instant visibility into conflicts, standups, PR reviews, and code ownership — all powered by AI.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up animate-delay-300">
            <SignedIn>
              <Link href="/dashboard" className="btn-primary px-7 py-3 text-base shadow-xl shadow-primary/25">
                Open Dashboard
                <ArrowRight size={16} />
              </Link>
            </SignedIn>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn-primary px-7 py-3 text-base shadow-xl shadow-primary/25">
                  Start for free
                  <ArrowRight size={16} />
                </button>
              </SignUpButton>
              <button className="btn-secondary px-7 py-3 text-base">
                View a demo
              </button>
            </SignedOut>
          </div>

          {/* Trust line */}
          <p className="mt-8 text-xs text-muted-foreground/60 animate-fade-up animate-delay-300">
            No credit card required · Connects in 60 seconds · SOC 2 ready
          </p>
        </div>

        {/* Dashboard preview card */}
        <div className="relative max-w-4xl mx-auto mt-20 animate-fade-up animate-delay-300">
          <div className="rounded-2xl border border-border/60 bg-card shadow-2xl shadow-black/10 overflow-hidden">
            {/* Fake toolbar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="h-5 max-w-xs mx-auto bg-muted rounded-md flex items-center justify-center">
                  <span className="text-[10px] text-muted-foreground font-mono">recon-henna.vercel.app/dashboard</span>
                </div>
              </div>
            </div>
            {/* Fake dashboard content */}
            <div className="p-6 bg-background">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="h-6 w-36 skeleton rounded-lg mb-2" />
                  <div className="h-4 w-64 skeleton rounded-lg" />
                </div>
                <div className="status-badge status-live">
                  <span className="pulse-dot" />
                  Live
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1,2,3].map(i => (
                  <div key={i} className="p-4 rounded-xl border bg-card">
                    <div className="h-3 w-16 skeleton rounded mb-3" />
                    <div className="h-8 w-24 skeleton rounded" />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border bg-card">
                    <div className="w-10 h-10 rounded-xl skeleton flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3.5 w-48 skeleton rounded mb-2" />
                      <div className="h-3 w-72 skeleton rounded" />
                    </div>
                    <div className="h-5 w-16 skeleton rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Glow under card */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-primary/15 blur-3xl rounded-full" />
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-14 border-y bg-muted/20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="status-badge status-info mb-5 mx-auto w-fit">Platform Features</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">
              Everything your team needs,<br />
              <span className="gradient-text">nothing it doesn't.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Six deeply integrated features that replace a dozen separate tools and Slack messages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => {
              const colors = colorMap[feature.color];
              return (
                <div
                  key={feature.title}
                  className="bento-card group"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors} border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform`}>
                    <feature.icon size={20} className={colors.split(' ').pop()} />
                  </div>
                  <div className="status-badge status-info mb-3 w-fit text-[9px]">{feature.badge}</div>
                  <h3 className="text-lg font-bold mb-2 tracking-tight">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-28 px-6 bg-muted/20 border-y">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="status-badge status-live mb-5 mx-auto w-fit">Setup in minutes</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">
              Three steps to full<br />
              <span className="gradient-text">team awareness.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent -translate-y-px z-0" />
                )}
                <div className="relative bento-card">
                  <div className="text-5xl font-black text-primary/10 mb-4 leading-none">{step.step}</div>
                  <h3 className="text-lg font-bold mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bento-card p-14">
            {/* Background glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5" />
            <div className="relative">
              <div className="status-badge status-info mb-6 mx-auto w-fit">Free to start</div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-5">
                Ready to eliminate<br />merge chaos?
              </h2>
              <p className="text-lg text-muted-foreground mb-10 max-w-md mx-auto">
                Connect your first repository in 60 seconds and watch your team's development activity come alive.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="btn-primary px-8 py-3.5 text-base shadow-xl shadow-primary/25">
                      Start building for free
                      <ArrowRight size={16} />
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="btn-primary px-8 py-3.5 text-base shadow-xl shadow-primary/25">
                    Open your dashboard
                    <ArrowRight size={16} />
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Activity size={14} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-sm">Recon</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Recon Technologies, Inc. · Real-time developer awareness platform.
          </p>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="https://github.com/Akarshkushwaha/Recon" target="_blank" className="hover:text-foreground transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
