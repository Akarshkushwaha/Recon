"use client";

import Link from "next/link";
import { ArrowRight, Activity, Shield, Zap, Cpu, Code2, Globe } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

const Feature = ({ icon: Icon, title, description }: any) => (
  <div className="flex flex-col gap-4 p-8 rounded-3xl bg-card border hover:border-primary/20 transition-all group">
    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-black text-xl tracking-tighter">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Activity size={18} />
            </div>
            RECON
          </div>
          <div className="flex items-center gap-6">
            <SignedIn>
              <Link href="/dashboard" className="text-sm font-bold hover:text-primary transition-colors">Dashboard</Link>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-bold hover:text-primary transition-colors">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-8 animate-fade-in">
            <Zap size={14} />
            VERSION 1.0 NOW LIVE
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tightest mb-8 max-w-5xl mx-auto leading-[0.9]">
            Real-time <span className="text-primary">Dev Awareness</span> for elite teams.
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Detect merge conflicts before they happen, automate your daily standups, and supercharge your PRs with AI-powered diff analysis.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedIn>
              <Link 
                href="/dashboard" 
                className="flex items-center gap-2 bg-primary text-primary-foreground px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl shadow-primary/20"
              >
                Enter Dashboard
                <ArrowRight size={20} />
              </Link>
            </SignedIn>

            <SignedOut>
              <SignUpButton mode="modal">
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl shadow-primary/20">
                  Start Building for Free
                  <ArrowRight size={20} />
                </button>
              </SignUpButton>
              <button className="px-10 py-5 rounded-full font-bold text-lg border border-border hover:bg-muted transition-colors">
                Book a Demo
              </button>
            </SignedOut>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Feature 
            icon={Shield} 
            title="Conflict Prevention" 
            description="Real-time scanning of active branches to detect overlapping file changes instantly."
          />
          <Feature 
            icon={Cpu} 
            title="AI Automation" 
            description="Groq & Gemini integration for automated PR descriptions and structured issue generation."
          />
          <Feature 
            icon={Globe} 
            title="Global Context" 
            description="Unified view of your team's entire development lifecycle across all repositories."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-black tracking-tighter opacity-50">
            <Activity size={18} />
            RECON
          </div>
          <p className="text-sm text-muted-foreground">© 2024 Recon Technologies Inc. Built for the modern engineer.</p>
        </div>
      </footer>
    </div>
  );
}
