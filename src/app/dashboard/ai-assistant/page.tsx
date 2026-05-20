"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { 
  Sparkles, Brain, ShieldAlert, CheckCircle2, AlertTriangle, 
  RefreshCw, FileText, User, Calendar, GitPullRequest, ArrowRight, X, Clock, HelpCircle
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIAssistantPage() {
  // Convex queries & mutations
  const branches = useQuery(api.ai.getAllBranches) || [];
  const briefings = useQuery(api.ai.getSprintBriefings) || [];
  const burnoutAlerts = useQuery(api.ai.getBurnoutAlerts) || [];

  const dismissBurnout = useMutation(api.ai.dismissBurnoutAlert);

  // Convex actions
  const triggerCodeReview = useAction(api.ai.requestAICodeReview);
  const triggerSprintBriefing = useAction(api.ai.generateSprintBriefing);
  const triggerBurnoutScan = useAction(api.ai.detectBurnout);

  // Local Component States
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedRepoId, setSelectedRepoId] = useState<any>("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<{ feedback: string; status: string } | null>(null);

  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState(false);
  const [activeBriefingIndex, setActiveBriefingIndex] = useState<number>(0);
  
  const [isScanningBurnout, setIsScanningBurnout] = useState(false);
  const [scanMessage, setScanMessage] = useState("");

  // Sync selected repo ID when branch changes
  useEffect(() => {
    if (selectedBranch) {
      const activeBranch = branches.find(b => b.branchName === selectedBranch);
      if (activeBranch) {
        setSelectedRepoId(activeBranch.repoId);
      }
    }
  }, [selectedBranch, branches]);

  // Handlers
  const handleAICodeReview = async () => {
    if (!selectedBranch || !selectedRepoId) return;
    setIsReviewing(true);
    setReviewResult(null);
    try {
      const result = await triggerCodeReview({
        repoId: selectedRepoId,
        branchName: selectedBranch,
      });
      setReviewResult(result);
    } catch (e) {
      console.error("AI review failed:", e);
      setReviewResult({
        feedback: "### ❌ AI Review Offline\nUnable to reach LLM runtime. Please check your `GROQ_API_KEY` environmental variable.",
        status: "critical"
      });
    } finally {
      setIsReviewing(false);
    }
  };

  const handleGenerateBriefing = async () => {
    setIsGeneratingBriefing(true);
    try {
      await triggerSprintBriefing({});
      setActiveBriefingIndex(0);
    } catch (e) {
      console.error("Sprint briefing failed:", e);
    } finally {
      setIsGeneratingBriefing(false);
    }
  };

  const handleBurnoutScan = async () => {
    setIsScanningBurnout(true);
    setScanMessage("");
    try {
      const alerts = await triggerBurnoutScan({});
      if (alerts.length > 0) {
        setScanMessage(`Telemetry scan complete. Found ${alerts.length} developer burnout alerts.`);
      } else {
        setScanMessage("Telemetry scan complete. All developers showing healthy push profiles!");
      }
      setTimeout(() => setScanMessage(""), 5000);
    } catch (e) {
      console.error("Burnout scan failed:", e);
      setScanMessage("Burnout telemetry scan offline.");
    } finally {
      setIsScanningBurnout(false);
    }
  };

  const handleDismissBurnout = async (id: any) => {
    try {
      await dismissBurnout({ id });
    } catch (e) {
      console.error("Dismiss failed:", e);
    }
  };

  const selectedBriefing = briefings[activeBriefingIndex];

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-900/50 via-indigo-950/40 to-slate-900 border border-purple-500/20 p-8 shadow-xl shadow-purple-500/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/20 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles size={12} className="animate-pulse" />
              Recon Intelligence Engine v2.0
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent">
              Advanced AI Copilots
            </h1>
            <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
              Infuse generative AI into branch code audits, sprint planning preparations, and engineering wellness telemetry to build elite developer velocity.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <button
              onClick={handleGenerateBriefing}
              disabled={isGeneratingBriefing}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-2 shadow-lg shadow-purple-600/20 hover:shadow-purple-500/30 transition-all border border-purple-400/20 active:scale-95"
            >
              {isGeneratingBriefing ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Brain size={14} />
              )}
              {isGeneratingBriefing ? "Synthesizing Sprint..." : "Compile Weekly Briefing"}
            </button>
            
            <button
              onClick={handleBurnoutScan}
              disabled={isScanningBurnout}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 disabled:bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white font-medium text-xs flex items-center gap-2 transition-all active:scale-95"
            >
              {isScanningBurnout ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Clock size={14} />
              )}
              Run Wellness Telemetry Check
            </button>
          </div>
        </div>

        {scanMessage && (
          <div className="mt-4 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-xs font-medium animate-fade-in">
            {scanMessage}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: AI Code Review & Sprint Briefings */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card: AI Branch Code Auditor */}
          <div className="bg-card/40 backdrop-blur-xl border border-purple-500/10 rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <GitPullRequest size={20} />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-100">On-Demand AI Branch Auditor</h2>
                <p className="text-muted-foreground text-xs">Run automated security, performance, and type audits for any active branch.</p>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 text-xs focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
              >
                <option value="">Select branch to audit...</option>
                {branches.map((b) => (
                  <option key={b._id} value={b.branchName}>
                    {b.repoName} — {b.branchName}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAICodeReview}
                disabled={isReviewing || !selectedBranch}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/15"
              >
                {isReviewing ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {isReviewing ? "Auditing..." : "Audit Branch"}
              </button>
            </div>

            {/* Review Results */}
            {isReviewing && (
              <div className="rounded-xl border border-indigo-500/10 bg-indigo-950/5 p-8 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <Brain className="absolute inset-0 m-auto text-indigo-400" size={18} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-200">Analyzing Branch Diffs...</p>
                  <p className="text-xs text-muted-foreground max-w-sm">Gemini is running O(N) complexity evaluation, scanning secrets, and verifying TypeScript interfaces.</p>
                </div>
              </div>
            )}

            {!isReviewing && reviewResult && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden animate-fade-in">
                {/* Review Header Banner */}
                <div className={`px-4 py-3 flex items-center justify-between border-b ${
                  reviewResult.status === "clean" ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400" :
                  reviewResult.status === "warnings" ? "bg-amber-500/5 border-amber-500/10 text-amber-400" :
                  "bg-rose-500/5 border-rose-500/10 text-rose-400"
                }`}>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    {reviewResult.status === "clean" && <CheckCircle2 size={14} />}
                    {reviewResult.status === "warnings" && <AlertTriangle size={14} />}
                    {reviewResult.status === "critical" && <ShieldAlert size={14} />}
                    Status: <span className="uppercase">{reviewResult.status}</span>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                    Groq Llama 3.3
                  </span>
                </div>

                {/* Review Markdown Content */}
                <div className="p-5 text-xs text-slate-300 leading-relaxed prose prose-invert max-w-none prose-xs scrollbar-thin max-h-96 overflow-y-auto">
                  <ReactMarkdown>{reviewResult.feedback}</ReactMarkdown>
                </div>
              </div>
            )}

            {!isReviewing && !reviewResult && (
              <div className="rounded-xl border border-dashed border-slate-800/80 p-8 flex flex-col items-center justify-center text-center text-muted-foreground bg-slate-900/10">
                <Brain className="text-muted-foreground/30 mb-3" size={32} />
                <p className="text-xs font-medium">No active audit logs selected.</p>
                <p className="text-[11px] text-muted-foreground/75 mt-0.5">Choose an active feature branch above to perform an AI telemetry code check.</p>
              </div>
            )}
          </div>

          {/* Card: Weekly Sprint Planning Briefing */}
          <div className="bg-card/40 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300">
                  <FileText size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-100 font-sans">Sprint Planning Briefing Hub</h2>
                  <p className="text-muted-foreground text-xs">Print-ready briefings generated from active push history & conflict matrix.</p>
                </div>
              </div>

              {/* Briefing Pagination Tabs */}
              {briefings.length > 0 && (
                <div className="flex gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  {briefings.slice(0, 3).map((item, idx) => (
                    <button
                      key={item._id}
                      onClick={() => setActiveBriefingIndex(idx)}
                      className={`px-3 py-1 rounded-md text-[10px] font-semibold transition-all ${
                        activeBriefingIndex === idx 
                          ? "bg-purple-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {item.title.split("-")[1] || `W${idx + 1}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Briefing Display */}
            {selectedBriefing ? (
              <div className="bg-slate-900/50 rounded-xl border border-slate-800/80 p-6 animate-fade-in relative">
                <div className="absolute top-6 right-6 text-[10px] text-muted-foreground flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  <Calendar size={10} />
                  {new Date(selectedBriefing.createdAt).toLocaleDateString()}
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 text-xs leading-relaxed prose-headings:text-slate-100 prose-strong:text-purple-400 scrollbar-thin max-h-[500px] overflow-y-auto">
                  <ReactMarkdown>{selectedBriefing.content}</ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 p-12 flex flex-col items-center justify-center text-center text-muted-foreground bg-slate-900/10">
                <FileText className="text-muted-foreground/30 mb-3" size={32} />
                <p className="text-xs font-semibold text-slate-300">No sprint briefing created yet</p>
                <p className="text-xs max-w-sm mt-1 leading-relaxed">
                  Click the "Compile Weekly Briefing" button in the top header to synthesize telemetry from the last 7 days and active branch conflicts.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Burnout Radar */}
        <div className="space-y-8">
          
          {/* Burnout Radar Terminal Card */}
          <div className="bg-card/40 backdrop-blur-xl border border-orange-500/15 rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl" />
            
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800/60 pb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 animate-pulse">
                <Clock size={20} />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-100 font-sans">Developer Burnout Radar</h2>
                <p className="text-muted-foreground text-xs">Pushes executed past midnight or during weekend windows.</p>
              </div>
            </div>

            {/* List of active warnings */}
            {burnoutAlerts.length > 0 ? (
              <div className="space-y-4">
                {burnoutAlerts.map((alert) => (
                  <div 
                    key={alert._id} 
                    className="p-4 rounded-xl bg-orange-500/[0.03] border border-orange-500/10 hover:border-orange-500/25 transition-all group shadow-sm flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-400/20 flex items-center justify-center text-orange-400 shrink-0 font-bold text-xs uppercase">
                        {alert.developer.slice(0, 2)}
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-200">
                          @{alert.developer}
                        </p>
                        <p className="text-[11px] text-orange-300/90 leading-relaxed max-w-[180px]">
                          {alert.reason}
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground font-mono">
                          <Clock size={10} />
                          {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDismissBurnout(alert._id)}
                      className="p-1 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-orange-400 hover:border-orange-500/30 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Dismiss health alert"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-800 p-8 flex flex-col items-center justify-center text-center text-muted-foreground bg-slate-900/10">
                <CheckCircle2 className="text-emerald-500/35 mb-2.5" size={28} />
                <p className="text-xs font-semibold text-slate-300">All Developers Healthy</p>
                <p className="text-[11px] text-muted-foreground/75 mt-0.5 leading-relaxed max-w-[200px]">
                  Zero late night push surges detected over the previous 48 hour active telemetry cycle.
                </p>
              </div>
            )}

            {/* Radar diagnostic block */}
            <div className="mt-6 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
              <span className="text-muted-foreground">CRON CHECK:</span>
              <span className="text-orange-400 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-ping" />
                NIGHTLY ACTIVE (03:00 UTC)
              </span>
            </div>
          </div>

          {/* Quick AI Info Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-3 leading-relaxed relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl" />
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-[11px] uppercase tracking-wider">
              <HelpCircle size={14} />
              How the Copilot operates
            </div>
            <p>
              Recon aggregates commits and logs from your GitHub push stream. The AI assistant evaluates:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
              <li><strong className="text-slate-200">Branch diff files</strong> to create detailed inline audits.</li>
              <li><strong className="text-slate-200">Conflict directories</strong> to predict planning risk.</li>
              <li><strong className="text-slate-200">Late push logs</strong> to alert managers about potential dev exhaustion.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
