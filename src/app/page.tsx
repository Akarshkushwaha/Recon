"use client";

import Link from "next/link";
import { 
  ArrowRight, Activity, Shield, Zap, Cpu, Code2, GitMerge, 
  GitBranch, Sparkles, ChevronRight, Check, Star, Users, 
  Clock, TrendingUp, LayoutDashboard, FolderGit2, Github,
  Settings, Search, Bell, AlertCircle, Rocket, Server
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
    color: "blue",
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
    title: "Install the App",
    description: "Connect Recon to your GitHub account in under 60 seconds. Select individual repositories or grant access to all.",
  },
  {
    step: "02",
    title: "Webhooks Flow",
    description: "Every push, PR, and installation event is signed, verified, and processed in real-time through our serverless backend.",
  },
  {
    step: "03",
    title: "Instant Clarity",
    description: "Your dashboard updates live. Conflicts flagged, standups drafted, PR descriptions written — your team always knows what's happening.",
  },
];

const colorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600 border-blue-100",
  cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
  violet: "bg-violet-50 text-violet-600 border-violet-100",
  emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  orange: "bg-orange-50 text-orange-600 border-orange-100",
  rose: "bg-rose-50 text-rose-600 border-rose-100",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-foreground font-sans antialiased selection:bg-violet-200 selection:text-violet-900 relative">
      
      {/* Light Ambient Background Glows */}
      <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        {/* Colorful soft orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-200/50 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-[10%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-200/50 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] bg-blue-100/60 blur-[120px] rounded-full pointer-events-none" />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 pt-4 px-4">
        <div className="mx-auto max-w-6xl">
          <nav className="flex items-center justify-between h-14 px-5 rounded-2xl glass-card">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-md shadow-violet-200 group-hover:scale-105 transition-transform duration-300">
                <Activity size={16} className="text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900">Recon</span>
            </Link>

            {/* Center links */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100/50 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
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
                    Start Free
                    <ArrowRight size={14} />
                  </button>
                </SignUpButton>
              </SignedOut>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="relative max-w-5xl mx-auto text-center z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-medium mb-8 animate-fade-up shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-violet-500"></span>
            <span className="text-gray-600">Introducing Gemini 2.0 PR Drafts</span>
            <span className="text-gray-300">|</span>
            <Link href="#features" className="text-violet-600 font-semibold hover:underline flex items-center gap-1">
              Read more <ArrowRight size={14} />
            </Link>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-black tracking-tight leading-[1.05] mb-8 animate-fade-up animate-delay-100 text-gray-900">
            Ship code faster.<br />
            <span className="gradient-text">Without the chaos.</span>
          </h1>

          {/* Subhead */}
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed mb-10 font-medium animate-fade-up animate-delay-200">
            Recon gives your engineering team instant visibility into merge conflicts, code ownership, and PR reviews. Powered by beautiful AI integrations.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up animate-delay-300">
            <SignedIn>
              <Link href="/dashboard" className="btn-primary px-8 py-3.5 text-base">
                Open Dashboard
                <ArrowRight size={18} />
              </Link>
            </SignedIn>
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn-primary px-8 py-3.5 text-base shadow-xl shadow-gray-900/10">
                  Get Started Free
                  <ArrowRight size={18} />
                </button>
              </SignUpButton>
              <button className="btn-secondary px-8 py-3.5 text-base shadow-sm">
                View Live Demo
              </button>
            </SignedOut>
          </div>

          <p className="mt-8 text-sm font-medium text-gray-400 animate-fade-up animate-delay-500">
            No credit card required. Free forever for individuals.
          </p>
        </div>

        {/* Dashboard preview card - Real Snapshot */}
        <div className="relative max-w-5xl mx-auto mt-20 animate-fade-up animate-delay-500 z-20">
          <div className="absolute -inset-1 bg-gradient-to-br from-violet-200 via-white to-fuchsia-200 rounded-[2rem] blur-xl opacity-70" />
          <div className="relative rounded-[1.5rem] border border-gray-200/60 bg-white/70 shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Toolbar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                <div className="w-3 h-3 rounded-full bg-gray-300" />
              </div>
              <div className="flex-1 mx-4 flex justify-center">
                <div className="h-7 w-64 bg-gray-100/80 rounded-lg flex items-center justify-center">
                  <span className="text-[11px] text-gray-500 font-medium">recon.dev/dashboard</span>
                </div>
              </div>
            </div>
            
            {/* Real Dashboard Image */}
            <div className="bg-white">
              <img 
                src="/images/recon-dashboard.png" 
                alt="Recon Dashboard" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-16 border-y border-gray-100 bg-white/50 backdrop-blur-sm relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="status-badge status-info mb-6 mx-auto w-fit bg-white">Platform Features</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-gray-900">
              Powerful tools, wrapped in a<br />
              <span className="gradient-text">beautiful experience.</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
              We replaced complex integrations with simple, intuitive AI features that "just work".
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, i) => {
              const colors = colorMap[feature.color];
              return (
                <div
                  key={feature.title}
                  className="bento-card group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-14 h-14 rounded-2xl ${colors} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <feature.icon size={26} />
                  </div>
                  <div className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-gray-100 text-gray-600 mb-4">{feature.badge}</div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed font-medium">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-32 px-6 bg-gray-50 border-y border-gray-200 relative z-10">
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-20">
            <div className="status-badge status-live mb-6 mx-auto w-fit bg-white">Integration</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-gray-900">
              Setup is practically<br />
              <span className="gradient-text">effortless.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[80%] w-[60%] h-px bg-gray-200 z-0" />
                )}
                <div className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-6xl font-black text-gray-100 mb-6 leading-none tracking-tighter">{step.step}</div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight text-gray-900">{step.title}</h3>
                  <p className="text-[15px] text-gray-600 leading-relaxed font-medium">{step.description}</p>
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
            <div className="status-badge status-warning mb-6 mx-auto w-fit bg-white">Pricing</div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-gray-900">
              Free and Open Source<br />
              <span className="gradient-text">forever.</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium">
              Recon is proudly built for the community. Access all enterprise-grade features at zero cost.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-3xl bg-white border-2 border-violet-500 shadow-xl shadow-violet-500/10 z-10 p-10 flex flex-col">
              <div className="absolute top-0 inset-x-0 h-2 rounded-t-[1.35rem] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-500" />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md uppercase tracking-wider">Community Edition</span>
              </div>
              <div className="text-center mb-8 mt-4">
                <div className="flex justify-center items-baseline gap-1 mb-3">
                  <span className="text-6xl font-black text-gray-900">$0</span>
                  <span className="text-gray-500 font-medium">/mo</span>
                </div>
                <p className="text-sm text-gray-500 font-medium mb-8">Everything you need to ship faster without conflicts.</p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-[15px] text-gray-900 font-semibold">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-violet-600" />
                    </div>
                    Unlimited Repositories
                  </li>
                  <li className="flex items-center gap-3 text-[15px] text-gray-900 font-semibold">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-violet-600" />
                    </div>
                    Live Conflict Detection
                  </li>
                  <li className="flex items-center gap-3 text-[15px] text-gray-900 font-semibold">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-violet-600" />
                    </div>
                    AI Standups & PR Drafts
                  </li>
                </ul>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-[15px] text-gray-900 font-semibold">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-violet-600" />
                    </div>
                    Interactive Playground
                  </li>
                  <li className="flex items-center gap-3 text-[15px] text-gray-900 font-semibold">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-violet-600" />
                    </div>
                    Slack & Discord Webhooks
                  </li>
                  <li className="flex items-center gap-3 text-[15px] text-gray-900 font-semibold">
                    <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                      <Check size={14} className="text-violet-600" />
                    </div>
                    Self-Hosting Support
                  </li>
                </ul>
              </div>

              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="btn-primary w-full py-4 text-base">Get Started Free</button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="btn-primary w-full py-4 text-base text-center flex items-center justify-center">Open Dashboard</Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative z-10 mb-20">
        <div className="max-w-5xl mx-auto text-center">
          <div className="relative rounded-[2.5rem] bg-gray-900 p-16 md:p-24 overflow-hidden shadow-2xl">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-transparent to-orange-500/30" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 text-white">
                Ready to transform how<br />your team ships?
              </h2>
              <p className="text-lg text-gray-300 mb-10 max-w-lg mx-auto font-medium">
                Connect your first repository in 60 seconds and experience the magic of Recon.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="btn-secondary px-10 py-4 text-lg border-transparent hover:bg-gray-100 text-gray-900">
                      Get Started Free
                      <ArrowRight size={20} />
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard" className="btn-secondary px-10 py-4 text-lg border-transparent hover:bg-gray-100 text-gray-900">
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
      <footer className="border-t border-gray-200 py-12 px-6 bg-white relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-sm">
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-bold text-base text-gray-900">Recon</span>
          </div>
          <p className="text-sm text-gray-500 font-medium">
            © 2026 Recon Technologies, Inc. · Real-time developer awareness.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="https://github.com/Akarshkushwaha/Recon" target="_blank" className="hover:text-gray-900 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
