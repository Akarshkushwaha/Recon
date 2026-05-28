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
    color: "cyan",
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
    color: "amber",
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
    color: "primary",
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
  primary: "from-primary/20 to-primary/5 border-primary/30 text-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]",
  cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]",
  violet: "from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]",
  emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]",
  amber: "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
  rose: "from-rose-500/20 to-rose-500/5 border-rose-500/30 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased selection:bg-primary/30">
      {/* Background Grid & Ambient Glows */}
      <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden">
        {/* Subtle glowing grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:64px_64px] opacity-[0.15]" />
        
        {/* Giant ambient light orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 pt-6">
        <div className="mx-auto max-w-6xl px-6">
          <nav className="flex items-center justify-between h-14 px-6 rounded-2xl glass-card shadow-2xl shadow-black/20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 p-[1px] shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                <div className="w-full h-full bg-background/80 backdrop-blur-sm rounded-[7px] flex items-center justify-center group-hover:bg-transparent transition-colors duration-300">
                  <Activity size={16} className="text-white" />
                </div>
              </div>
              <span className="font-bold text-lg tracking-tight text-white drop-shadow-md">Recon</span>
            </Link>

            {/* Center links */}
            <div className="hidden md:flex items-center gap-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <SignedIn>
                <Link href="/dashboard" className="btn-primary text-sm px-5 py-2">
                  Dashboard
                  <ChevronRight size={14} />
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-ghost text-sm">Sign in</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-primary text-sm px-5 py-2">
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
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-white text-xs font-semibold mb-8 animate-fade-up shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <Star size={12} className="text-amber-400 fill-amber-400" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-cyan-300">Built for engineering teams who ship fast</span>
            <span className="text-white/40 ml-1">→</span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(3rem,8vw,6rem)] font-black tracking-tighter leading-[1.05] mb-8 animate-fade-up animate-delay-100 drop-shadow-2xl">
            The real-time pulse of your<br />
            <span className="gradient-text drop-shadow-[0_0_30px_rgba(139,92,246,0.4)]">development team.</span>
          </h1>

          {/* Subhead */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12 font-medium animate-fade-up animate-delay-200">
            Recon connects to your GitHub repositories and gives your team instant visibility into conflicts, standups, PR reviews, and code ownership — all powered by AI.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animate-delay-300">
            <SignedIn>
              <Link href="/dashboard" className="btn-primary px-8 py-4 text-base">
                Open Dashboard
                <ArrowRight size={18} />
              </Link>
            </SignedIn>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn-primary px-8 py-4 text-base">
                  Start for free
                  <ArrowRight size={18} />
                </button>
              </SignUpButton>
              <button className="btn-secondary px-8 py-4 text-base">
                View a demo
              </button>
            </SignedOut>
          </div>

          {/* Trust line */}
          <p className="mt-10 text-xs font-medium text-muted-foreground/60 animate-fade-up animate-delay-500 tracking-wider uppercase">
            No credit card required · Connects in 60 seconds · SOC 2 ready
          </p>
        </div>

        {/* Premium Dashboard preview card */}
        <div className="relative max-w-5xl mx-auto mt-24 animate-fade-up animate-delay-500 z-20">
          <div className="absolute -inset-1 bg-gradient-to-br from-violet-600/30 via-transparent to-cyan-500/30 rounded-[2rem] blur-xl opacity-50" />
          <div className="relative rounded-[1.5rem] border border-white/10 bg-black/60 shadow-2xl overflow-hidden backdrop-blur-2xl">
            {/* Fake toolbar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              </div>
              <div className="flex-1 mx-4 flex justify-center">
                <div className="h-7 w-64 bg-black/50 border border-white/5 rounded-lg flex items-center justify-center shadow-inner">
                  <span className="text-[11px] text-white/40 font-mono tracking-wider">recon-henna.vercel.app</span>
                </div>
              </div>
            </div>
            {/* Fake dashboard content */}
            <div className="p-8 bg-gradient-to-b from-transparent to-black/40">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="h-8 w-48 skeleton rounded-lg mb-3" />
                  <div className="h-4 w-72 skeleton rounded-md opacity-50" />
                </div>
                <div className="status-badge status-live">
                  <span className="pulse-dot" />
                  Live Activity
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 mb-8">
                {[1,2,3].map(i => (
                  <div key={i} className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] shadow-lg">
                    <div className="h-3 w-20 skeleton rounded mb-4 opacity-70" />
                    <div className="h-10 w-32 skeleton rounded" />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-5 p-5 rounded-2xl border border-white/5 bg-white/[0.02] shadow-lg hover:bg-white/[0.04] transition-colors">
                    <div className="w-12 h-12 rounded-xl skeleton flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 w-56 skeleton rounded mb-3" />
                      <div className="h-3 w-80 skeleton rounded opacity-50" />
                    </div>
                    <div className="h-6 w-20 skeleton rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-16 border-y border-white/5 bg-black/40 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="text-4xl font-black text-white mb-2 tracking-tight group-hover:scale-105 transition-transform drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-semibold tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="status-badge status-info mb-6 mx-auto w-fit">Platform Features</div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 drop-shadow-xl">
              Everything your team needs,<br />
              <span className="gradient-text">nothing it doesn't.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Six deeply integrated features that replace a dozen separate tools and endless Slack threads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => {
              const colors = colorMap[feature.color];
              return (
                <div
                  key={feature.title}
                  className="bento-card group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon size={26} className={colors.split(' ').pop()} />
                  </div>
                  <div className={`status-badge border ${colors.split(' ')[2]} text-[10px] mb-4 w-fit bg-transparent shadow-none`}>{feature.badge}</div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight text-white">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-32 px-6 border-y border-white/5 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[150px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20">
            <div className="status-badge status-live mb-6 mx-auto w-fit">Setup in minutes</div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 drop-shadow-xl">
              Three steps to full<br />
              <span className="gradient-text">team awareness.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[80%] w-[60%] h-px bg-gradient-to-r from-primary/50 to-transparent z-0" />
                )}
                <div className="relative bento-card p-8 bg-black/40">
                  <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/0 mb-6 leading-none tracking-tighter">{step.step}</div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight text-white">{step.title}</h3>
                  <p className="text-[15px] text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <div className="status-badge status-warning mb-6 mx-auto w-fit">Transparent Pricing</div>
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 drop-shadow-xl">
              Simple pricing for<br />
              <span className="gradient-text">engineering teams.</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
              Start for free, upgrade when you need more power and AI integrations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Free Tier */}
            <div className="bento-card flex flex-col p-8 bg-black/40 border-white/5">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-3 text-white">Hobby</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-5xl font-black text-white">$0</span>
                  <span className="text-muted-foreground font-medium">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground">Perfect for solo developers and side projects.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-[15px] text-muted-foreground">
                  <Check size={18} className="text-primary shrink-0" /> 1 Repository
                </li>
                <li className="flex items-center gap-3 text-[15px] text-muted-foreground">
                  <Check size={18} className="text-primary shrink-0" /> Live Conflict Detection
                </li>
                <li className="flex items-center gap-3 text-[15px] text-muted-foreground">
                  <Check size={18} className="text-primary shrink-0" /> Basic Analytics
                </li>
                <li className="flex items-center gap-3 text-[15px] text-muted-foreground">
                  <Check size={18} className="text-primary shrink-0" /> Community Support
                </li>
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="btn-secondary w-full py-3.5 text-base">Get Started Free</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="btn-secondary w-full py-3.5 text-base text-center">Go to Dashboard</Link>
              </SignedIn>
            </div>

            {/* Pro Tier */}
            <div className="bento-card flex flex-col relative border-primary/40 shadow-[0_0_50px_rgba(139,92,246,0.15)] bg-card scale-105 z-10 p-10">
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 rounded-t-2xl" />
              <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                <span className="status-badge bg-black border border-white/20 text-white shadow-xl shadow-primary/20 text-xs px-4 py-1.5">Most Popular</span>
              </div>
              <div className="mb-8 mt-2">
                <h3 className="text-2xl font-bold mb-3 text-white">Pro</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-5xl font-black text-white">$19</span>
                  <span className="text-muted-foreground font-medium">/user/mo</span>
                </div>
                <p className="text-sm text-muted-foreground">For engineering teams shipping fast.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-[15px] text-white font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                  Unlimited Repositories
                </li>
                <li className="flex items-center gap-3 text-[15px] text-white font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                  AI Standups & PR Drafts
                </li>
                <li className="flex items-center gap-3 text-[15px] text-white font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                  Slack & Discord Webhooks
                </li>
                <li className="flex items-center gap-3 text-[15px] text-white font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                  Stale Branch Alerting
                </li>
                <li className="flex items-center gap-3 text-[15px] text-white font-medium">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <Check size={12} className="text-primary" />
                  </div>
                  Priority Support
                </li>
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="btn-primary w-full py-4 text-base">Start 14-Day Trial</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <button className="btn-primary w-full py-4 text-base">Upgrade to Pro</button>
              </SignedIn>
            </div>

            {/* Enterprise Tier */}
            <div className="bento-card flex flex-col p-8 bg-black/40 border-white/5">
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-3 text-white">Enterprise</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-5xl font-black text-white">Custom</span>
                </div>
                <p className="text-sm text-muted-foreground">For large organizations with strict security needs.</p>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-[15px] text-muted-foreground">
                  <Check size={18} className="text-primary shrink-0" /> Dedicated VPC Deployment
                </li>
                <li className="flex items-center gap-3 text-[15px] text-muted-foreground">
                  <Check size={18} className="text-primary shrink-0" /> Single Sign-On (SAML/SSO)
                </li>
                <li className="flex items-center gap-3 text-[15px] text-muted-foreground">
                  <Check size={18} className="text-primary shrink-0" /> Custom AI Models (Bring Your Own)
                </li>
                <li className="flex items-center gap-3 text-[15px] text-muted-foreground">
                  <Check size={18} className="text-primary shrink-0" /> 24/7 Phone Support & SLA
                </li>
              </ul>
              <button className="btn-secondary w-full py-3.5 text-base">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bento-card p-16 md:p-24 overflow-hidden border-primary/30">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-cyan-500/20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent blur-2xl" />
            
            <div className="relative z-10">
              <div className="status-badge status-info mb-8 mx-auto w-fit px-4 py-1.5 text-sm">Free to start</div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-6 text-white drop-shadow-xl">
                Ready to eliminate<br />merge chaos?
              </h2>
              <p className="text-xl text-white/70 mb-12 max-w-lg mx-auto font-medium">
                Connect your first repository in 60 seconds and watch your team's development activity come alive.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="btn-primary px-10 py-4 text-lg">
                      Start building for free
                      <ArrowRight size={20} />
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="btn-primary px-10 py-4 text-lg">
                    Open your dashboard
                    <ArrowRight size={20} />
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black/40 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 p-[1px]">
              <div className="w-full h-full bg-black rounded-[7px] flex items-center justify-center">
                <Activity size={16} className="text-white" />
              </div>
            </div>
            <span className="font-bold text-base text-white">Recon</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            © 2025 Recon Technologies, Inc. · Real-time developer awareness platform.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="https://github.com/Akarshkushwaha/Recon" target="_blank" className="hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
