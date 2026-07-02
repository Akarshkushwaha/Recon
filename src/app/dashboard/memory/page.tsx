"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { 
  BrainCircuit, Database, Network, GitPullRequest, ShieldAlert, 
  Sparkles, CheckCircle2, ArrowRight, RefreshCw, Zap, Layers, Activity
} from "lucide-react";

export default function CogneeMemoryPage() {
  const [activeStep, setActiveStep] = useState<"week1" | "week2" | "week3" | "live">("week1");
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Cognee Hybrid Graph-Vector Memory Engine Initialized.",
    "[STORAGE] Active stores: Kuzu (Graph), LanceDB (Vector), SQLite (Relational).",
    "[STATUS] Waiting for PR lifecycle webhook events..."
  ]);
  const [authorWeight, setAuthorWeight] = useState(0.41);
  const [authRiskScore, setAuthRiskScore] = useState(0.20);

  const addLog = (msg: string) => {
    setLogs((prev) => [msg, ...prev.slice(0, 15)]);
  };

  const simulateWeek1 = () => {
    setIsSimulating(true);
    addLog("[INGEST] Ingesting PR #101: 'Fix user authentication' via cognee.remember()");
    setTimeout(() => {
      addLog("[SIGNAL] Implicit negative signal detected: Author rewrote 80% of generated PR description.");
      addLog("[IMPROVE] Executing cognee.improve() — Re-weighting style edge for dev_akarsh...");
      setAuthorWeight(0.78);
      addLog("[LEARNED] Edge weight for 'terse-imperative-style/dev_akarsh' increased to 0.78.");
      setActiveStep("week2");
      setIsSimulating(false);
    }, 800);
  };

  const simulateWeek2 = () => {
    setIsSimulating(true);
    addLog("[RECALL] PR #115 opened. Executing cognee.recall() for style preferences...");
    setTimeout(() => {
      addLog("[RECALL] Auto-routed strategy returned: 'Author prefers terse, imperative descriptions.'");
      addLog("[GENERATED] PR #115 description: 'Add GitHub OAuth provider. Implement token exchange endpoint.'");
      addLog("[SIGNAL] Acceptance confirmed (Edit Distance: 0.05). Triggering cognee.improve() positive reward.");
      setAuthorWeight(0.92);
      addLog("[LEARNED] Edge weight for 'terse-imperative-style/dev_akarsh' increased to 0.92.");
      setActiveStep("week3");
      setIsSimulating(false);
    }, 800);
  };

  const simulateWeek3 = () => {
    setIsSimulating(true);
    addLog("[INCIDENT] CI Failure detected post-merge on PR #115. Files touched: ['src/auth.py']");
    setTimeout(() => {
      addLog("[IMPROVE] Executing cognee.improve() with negative risk signal...");
      setAuthRiskScore(0.85);
      addLog("[RISK] File 'src/auth.py' historical risk score strengthened: 0.20 -> 0.85.");
      addLog("[RECALL] PR #142 touches 'src/auth.py'. Surfacing automated historical warning in PR body.");
      setActiveStep("live");
      setIsSimulating(false);
    }, 800);
  };

  const resetDemo = () => {
    setActiveStep("week1");
    setAuthorWeight(0.41);
    setAuthRiskScore(0.20);
    setLogs([
      "[SYSTEM] Cognee Hybrid Graph-Vector Memory Engine Reset.",
      "[STORAGE] Active stores: Kuzu (Graph), LanceDB (Vector), SQLite (Relational).",
      "[STATUS] Ready for interactive walkthrough."
    ]);
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <Sparkles size={12} /> The Hangover: Part AI — Cognee Track
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-green-500/10 text-green-500 border border-green-500/20">
              Self-Improving Agents
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3 text-foreground">
            <BrainCircuit className="text-primary animate-pulse" size={32} />
            Recon Memory Layer
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-medium">
            The PR intelligence layer that gets smarter with every merge. Powered by Cognee's hybrid graph-vector memory engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetDemo}
            className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-secondary/50 text-xs font-bold transition-all flex items-center gap-2"
          >
            <RefreshCw size={14} /> Reset Demo
          </button>
          <a
            href="https://wemakedevs.org/hackathons/cognee"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Zap size={14} /> Cognee Hackathon
          </a>
        </div>
      </div>

      {/* ECL Pipeline & Storage Stats Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="glass-card p-5 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
              <Network size={20} />
            </div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
              Kuzu Engine
            </span>
          </div>
          <h3 className="font-bold text-base">Graph Store</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Stores structured entities (<code className="text-primary font-mono">PR</code>, <code className="text-primary font-mono">Developer</code>, <code className="text-primary font-mono">File</code>) and dynamic relationships (<code className="text-primary font-mono">prefers</code>, <code className="text-primary font-mono">touches</code>).
          </p>
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Active Nodes:</span>
            <span className="font-bold text-foreground">1,429</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <Layers size={20} />
            </div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-500/10 text-purple-500">
              LanceDB Engine
            </span>
          </div>
          <h3 className="font-bold text-base">Vector Store</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Indexes high-dimensional semantic embeddings for code chunks, commit summaries, and historical diffs.
          </p>
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Vector Dimensions:</span>
            <span className="font-bold text-foreground">1,536 (OpenAI)</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-border bg-gradient-to-br from-card to-card/50 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500">
              <Database size={20} />
            </div>
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-green-500/10 text-green-500">
              SQLite Engine
            </span>
          </div>
          <h3 className="font-bold text-base">Relational Store</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Tracks document provenance, dataset lineage (<code className="text-primary font-mono">repo_Recon</code>), and ECL ingestion checkpoints.
          </p>
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">Retrieval Routing:</span>
            <span className="font-bold text-green-500">14 Strategies Active</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Demo Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        {/* Left: Interactive Walkthrough Controller */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-2xl border border-border bg-card p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Activity className="text-primary" size={20} />
              The Self-Improvement Loop Live Demo
            </h2>
            <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
              Experience how Recon uses <code className="font-mono text-foreground">cognee.improve()</code> to transform from a stateless RAG bot into an adaptive intelligence layer that learns from developer edits and CI outcomes.
            </p>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={simulateWeek1}
                disabled={isSimulating}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  activeStep === "week1"
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                    : "border-border bg-secondary/20 hover:border-border/80"
                }`}
              >
                <span className="text-[10px] font-mono uppercase font-bold text-primary block mb-1">Week 1</span>
                <h4 className="font-bold text-xs">Implicit Correction</h4>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                  80% rewrite triggers negative feedback reward.
                </p>
              </button>

              <button
                onClick={simulateWeek2}
                disabled={isSimulating || activeStep === "week1"}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  activeStep === "week2"
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                    : "border-border bg-secondary/20 hover:border-border/80"
                }`}
              >
                <span className="text-[10px] font-mono uppercase font-bold text-green-500 block mb-1">Week 2</span>
                <h4 className="font-bold text-xs">Zero-Edit Acceptance</h4>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                  Learned style applied. 0% rewrite confirmed.
                </p>
              </button>

              <button
                onClick={simulateWeek3}
                disabled={isSimulating || activeStep === "week1" || activeStep === "week2"}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  activeStep === "week3" || activeStep === "live"
                    ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                    : "border-border bg-secondary/20 hover:border-border/80"
                }`}
              >
                <span className="text-[10px] font-mono uppercase font-bold text-yellow-500 block mb-1">Week 3</span>
                <h4 className="font-bold text-xs">Risk Traversal</h4>
                <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                  CI failure strengthens file risk scores.
                </p>
              </button>
            </div>

            {/* Step Content Preview Box */}
            <div className="p-5 rounded-xl bg-secondary/30 border border-border/80 space-y-4">
              {activeStep === "week1" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                      Week 1: Stateless Baseline (High Rewrite Rate)
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">Edit Distance: 0.80</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Recon generated a verbose PR description. The author rewrote 80% of it to make it terse and imperative. In standard tools, this signal is lost forever.
                  </p>
                  <div className="p-3 rounded-lg bg-card border border-border font-mono text-xs space-y-1">
                    <div className="text-red-400 line-through">- This Pull Request introduces significant changes to the authentication flow...</div>
                    <div className="text-green-400">+ Fix auth token expiration. Validate JWT signature.</div>
                  </div>
                </div>
              )}

              {activeStep === "week2" && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-green-500 flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      Week 2: Cognee Memory Recall (Accepted As-Is)
                    </span>
                    <span className="font-mono text-xs text-green-500 font-bold">Edit Distance: 0.05</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    Before generating the description for PR #115, Recon called <code className="text-foreground font-mono">cognee.recall()</code>. It retrieved the author's preferred style and generated a perfect match.
                  </p>
                  <div className="p-3 rounded-lg bg-card border border-green-500/30 font-mono text-xs text-green-400">
                    ✔ Add GitHub OAuth provider. Implement token exchange endpoint.
                  </div>
                </div>
              )}

              {(activeStep === "week3" || activeStep === "live") && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-yellow-500 flex items-center gap-1.5">
                      <ShieldAlert size={14} />
                      Week 3: Graph Traversal Risk Warning
                    </span>
                    <span className="font-mono text-xs text-yellow-500 font-bold">Risk Score: {authRiskScore}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    When PR #142 touched <code className="font-mono text-foreground">src/auth.py</code>, Cognee traversed the relationship graph, identified 2 recent CI failures, and injected an automated safety warning.
                  </p>
                  <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 font-mono text-xs text-yellow-300 space-y-1">
                    <div className="font-bold text-yellow-400">⚠️ HISTORICAL RISK WARNING (Cognee Graph Engine):</div>
                    <div>File 'src/auth.py' flagged with High Risk Score ({authRiskScore}). Associated with 2 recent CI failures. Extra review required.</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Live Knowledge Graph Topology & Edge Weights */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-2xl border border-border bg-card p-6">
            <h3 className="text-base font-bold mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Network className="text-primary" size={18} />
                Learned Graph Weights
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                Live Graph State
              </span>
            </h3>

            <div className="space-y-4">
              {/* Edge 1: Style Preference */}
              <div className="p-4 rounded-xl border border-border bg-secondary/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-foreground">dev_akarsh → prefers</span>
                  <span className="text-primary font-bold">{authorWeight.toFixed(2)} confidence</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${authorWeight * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Target Node: Terse-Imperative Style</span>
                  <span>Updated via <code className="text-primary font-mono">improve()</code></span>
                </div>
              </div>

              {/* Edge 2: File Risk Profile */}
              <div className="p-4 rounded-xl border border-border bg-secondary/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-foreground">src/auth.py → risk_score</span>
                  <span className="text-yellow-500 font-bold">{authRiskScore.toFixed(2)} historical risk</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-500 rounded-full"
                    style={{ width: `${authRiskScore * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Trigger: CI Build Failure Webhook</span>
                  <span>Traversed via <code className="text-yellow-500 font-mono">GRAPH_COMPLETION</code></span>
                </div>
              </div>
            </div>

            {/* Live Event Log Console */}
            <div className="mt-6 pt-5 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                <Activity size={14} /> Live Memory Engine Stream
              </h4>
              <div className="p-3 rounded-xl bg-black/60 border border-border/80 font-mono text-[11px] h-48 overflow-y-auto space-y-1.5 text-muted-foreground">
                {logs.map((log, idx) => (
                  <div key={idx} className={
                    log.includes("[IMPROVE]") || log.includes("[LEARNED]") ? "text-green-400 font-bold" :
                    log.includes("[SIGNAL]") || log.includes("[RISK]") ? "text-yellow-400" :
                    log.includes("[INCIDENT]") ? "text-red-400 font-bold" : "text-gray-300"
                  }>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
