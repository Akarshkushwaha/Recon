"use client";

import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-foreground relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
      </div>

      <div className="z-10 flex flex-col items-center text-center max-w-3xl">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_-5px_rgba(var(--primary),0.5)]">
          <Activity className="text-primary-foreground" size={32} />
        </div>
        <h1 className="text-6xl font-black tracking-tighter sm:text-7xl mb-6 bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
          RECON
        </h1>
        <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
          The real-time pulse of your dev team. Detect conflicts, automate standups, and ship faster with AI-powered awareness.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <SignedIn>
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-primary/20"
            >
              Enter Dashboard
              <ArrowRight size={20} />
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                Get Started
                <ArrowRight size={20} />
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-8 py-4 rounded-full font-bold text-lg border border-border hover:bg-muted transition-colors">
                Create Account
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </main>
  );
}
