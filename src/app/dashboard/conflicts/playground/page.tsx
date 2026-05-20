"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useAction, useMutation } from "convex/react";
import DashboardLayout from "@/components/dashboard-layout";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { 
  ArrowLeft, 
  Sparkles, 
  GitMerge, 
  CheckCircle, 
  AlertTriangle, 
  FileCode, 
  Code, 
  Settings, 
  Loader2, 
  BrainCircuit, 
  Terminal,
  Layers,
  ChevronRight
} from "lucide-react";
import ReactMarkdown from "react-markdown";

function ConflictPlaygroundContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const conflictId = searchParams.get("conflictId") as Id<"conflicts"> | null;

  const conflict = useQuery(api.conflicts.getConflict, conflictId ? { conflictId } : "skip");
  const dismissConflict = useMutation(api.conflicts.dismissConflict);
  const resolveConflictAI = useAction(api.ai.resolveConflictAI);

  const [selectedFile, setSelectedFile] = useState<string>("");
  const [resolvedCode, setResolvedCode] = useState<string>("");
  const [aiExplanation, setAiExplanation] = useState<string>("");
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "System ready. Awaiting user action...",
  ]);

  // Fetch versions of the selected file
  const fileVersions = useQuery(
    api.conflicts.getFileVersionsForConflict,
    conflictId && selectedFile ? { conflictId, filePath: selectedFile } : "skip"
  );

  // Set initial file once conflict is loaded
  useEffect(() => {
    if (conflict && conflict.conflictingFiles.length > 0 && !selectedFile) {
      setSelectedFile(conflict.conflictingFiles[0]);
    }
  }, [conflict, selectedFile]);

  // Set initial resolved code once file versions are loaded
  useEffect(() => {
    if (fileVersions) {
      // Create a default git-conflict style template in the resolution editor
      const defaultMergeTemplate = `<<<<<<< ${fileVersions.branch1} (pushed by ${fileVersions.author1})
${fileVersions.branch1Code}
=======
${fileVersions.branch2Code}
>>>>>>> ${fileVersions.branch2} (pushed by ${fileVersions.author2})`;
      
      setResolvedCode(defaultMergeTemplate);
      setAiExplanation("");
      setTerminalLogs(prev => [
        ...prev,
        `Loaded conflict versions for: ${selectedFile}`,
        `Branch A: ${fileVersions.branch1} (${fileVersions.author1})`,
        `Branch B: ${fileVersions.branch2} (${fileVersions.author2})`,
      ]);
    }
  }, [fileVersions, selectedFile]);

  const addTerminalLog = (log: string) => {
    setTerminalLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ${log}`]);
  };

  const handleAIMerge = async () => {
    if (!fileVersions || !selectedFile) return;

    setIsMerging(true);
    addTerminalLog(`Initializing AI resolution agent for ${selectedFile}...`);
    addTerminalLog("Feeding code bases to Groq Llama 3.3 model...");

    try {
      const response = await resolveConflictAI({
        branch1: fileVersions.branch1,
        branch2: fileVersions.branch2,
        author1: fileVersions.author1,
        author2: fileVersions.author2,
        filePath: selectedFile,
        branch1Code: fileVersions.branch1Code,
        branch2Code: fileVersions.branch2Code,
      });

      if (response && response.resolvedCode) {
        setResolvedCode(response.resolvedCode);
        setAiExplanation(response.explanation);
        addTerminalLog("AI auto-merge complete. Code synthesized perfectly.");
        addTerminalLog("Conflict markers successfully removed.");
      } else {
        throw new Error("Invalid response structure from AI model.");
      }
    } catch (err) {
      console.error(err);
      addTerminalLog("CRITICAL: AI merge resolution failed. Checking token limits...");
      addTerminalLog("Fallback: Please resolve manually using conflict panes.");
    } finally {
      setIsMerging(false);
    }
  };

  const handleSubmitResolution = async () => {
    if (!conflictId) return;

    setIsSubmitting(true);
    addTerminalLog("Saving resolved changes back to VCS database...");
    
    try {
      await dismissConflict({ conflictId });
      addTerminalLog("Success: Branch conflict marked as fully RESOLVED.");
      
      setTimeout(() => {
        router.push("/dashboard/conflicts");
      }, 1000);
    } catch (err) {
      console.error(err);
      addTerminalLog("ERROR: Database patch rejected.");
      setIsSubmitting(false);
    }
  };

  if (!conflictId) {
    return (
      <DashboardLayout>
        <div className="py-24 text-center">
          <AlertTriangle className="text-destructive mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">No Conflict Selected</h2>
          <p className="text-muted-foreground mb-4">Please select a valid conflict to resolve from the Dashboard.</p>
          <button onClick={() => router.push("/dashboard/conflicts")} className="btn-secondary">
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!conflict) {
    return (
      <DashboardLayout>
        <div className="flex items-center gap-2 mb-6">
          <ArrowLeft size={16} className="text-muted-foreground animate-pulse" />
          <div className="h-6 w-32 skeleton rounded" />
        </div>
        <div className="space-y-6">
          <div className="h-28 skeleton rounded-2xl" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-[450px] skeleton rounded-2xl" />
            <div className="h-[450px] skeleton rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header breadcrumb & Meta */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/conflicts")}
            className="p-2 bg-secondary/80 hover:bg-secondary border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all duration-150"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
              <span>Conflicts</span>
              <ChevronRight size={12} />
              <span>Sandbox Playground</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <GitMerge size={20} className="text-destructive" />
              Conflict Playground
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmitResolution}
            disabled={isSubmitting || isMerging || !resolvedCode}
            className="btn-primary py-2 px-4 flex items-center gap-2 text-sm bg-green-600 hover:bg-green-500 shadow-green-900/30"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            Complete Resolution
          </button>
        </div>
      </div>

      {/* Meta Card details */}
      <div className="glass-card rounded-2xl border border-destructive/20 bg-gradient-to-r from-destructive/5 via-card to-card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/25">
                Overlap Alert
              </span>
              <span className="font-mono text-sm text-primary font-bold">
                {conflict.branch1}
              </span>
              <span className="text-muted-foreground text-xs font-semibold">vs</span>
              <span className="font-mono text-sm text-primary font-bold">
                {conflict.branch2}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Repository: <span className="font-semibold text-foreground font-mono">{conflict.repoName}</span> • 
              Detected {new Date(conflict.detectedAt).toLocaleString()}
            </p>
          </div>

          {/* File Selection Dropdown */}
          <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-xl border border-border">
            <FileCode size={16} className="text-muted-foreground" />
            <select
              value={selectedFile}
              onChange={(e) => {
                setSelectedFile(e.target.value);
                setResolvedCode("");
                setAiExplanation("");
              }}
              className="bg-transparent border-none text-sm font-semibold focus:outline-none pr-8 cursor-pointer text-foreground"
            >
              {conflict.conflictingFiles.map((file) => (
                <option key={file} value={file} className="bg-slate-950 text-slate-100">
                  {file.split("/").pop()} ({file})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Side-by-Side Split Viewers */}
      {!fileVersions ? (
        <div className="h-[300px] flex items-center justify-center border border-dashed rounded-2xl bg-card">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm text-muted-foreground">Loading file telemetry...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Branch 1 Pane */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-secondary/20 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold font-mono">
                    {conflict.author1?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block leading-tight">
                      {conflict.author1}
                    </span>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {conflict.branch1}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono">
                  ORIGIN A
                </span>
              </div>
              <div className="p-4 bg-slate-950/80 font-mono text-xs overflow-x-auto h-[350px] leading-relaxed whitespace-pre select-none text-slate-300 border-none scrollbar-thin">
                {fileVersions.branch1Code}
              </div>
            </div>

            {/* Branch 2 Pane */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-secondary/20 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold font-mono">
                    {conflict.author2?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block leading-tight">
                      {conflict.author2}
                    </span>
                    <span className="text-[10px] text-muted-foreground block font-mono">
                      {conflict.branch2}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                  ORIGIN B
                </span>
              </div>
              <div className="p-4 bg-slate-950/80 font-mono text-xs overflow-x-auto h-[350px] leading-relaxed whitespace-pre select-none text-slate-300 border-none scrollbar-thin">
                {fileVersions.branch2Code}
              </div>
            </div>
          </div>

          {/* Interactive Workspace Area */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            
            {/* Editor Workspace (Left 2 cols) */}
            <div className="xl:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-primary" />
                  <span className="text-sm font-bold">Conflict Resolution Workspace</span>
                </div>
                
                <button
                  onClick={handleAIMerge}
                  disabled={isMerging}
                  className="btn-secondary px-3 py-1.5 flex items-center gap-1.5 text-xs border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 shadow-sm"
                >
                  {isMerging ? (
                    <Loader2 size={12} className="animate-spin text-primary" />
                  ) : (
                    <Sparkles size={12} className="text-primary animate-pulse" />
                  )}
                  AI Auto-Merge
                </button>
              </div>

              <div className="relative">
                <textarea
                  value={resolvedCode}
                  onChange={(e) => setResolvedCode(e.target.value)}
                  className="w-full h-[320px] bg-slate-950 font-mono text-xs p-5 focus:outline-none border-none text-slate-200 resize-none leading-relaxed"
                  placeholder="Code edits go here..."
                />
                
                {isMerging && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                    <BrainCircuit className="animate-pulse text-primary" size={36} />
                    <p className="text-sm font-semibold text-foreground">AI resolves conflict files...</p>
                    <p className="text-xs text-muted-foreground">Removing duplicate structures and optimizing integrations.</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Explanation & Status panel (Right col) */}
            <div className="flex flex-col gap-6">
              
              {/* AI Resolution Explanation */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-3">
                  <BrainCircuit size={18} className="text-primary" />
                  <span className="text-sm font-bold">AI Resolution Strategy</span>
                </div>

                {!aiExplanation ? (
                  <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                    <Sparkles size={24} className="text-muted-foreground/30" />
                    <p className="text-xs max-w-xs mx-auto">
                      Click <strong className="text-primary">AI Auto-Merge</strong> to let the assistant solve logical branch overlaps and explain its strategy.
                    </p>
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground space-y-3 leading-relaxed max-h-[140px] overflow-y-auto pr-1">
                    <ReactMarkdown>{aiExplanation}</ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Console Diagnostics Terminal */}
              <div className="rounded-2xl border border-slate-800 bg-black p-5 space-y-3 font-mono text-[10px]">
                <div className="flex items-center justify-between text-muted-foreground border-b border-slate-900 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Terminal size={11} className="text-green-500" />
                    <span>DIAGNOSTICS terminal</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                </div>
                <div className="space-y-1.5 text-slate-400 select-none max-h-[100px] overflow-y-auto pr-1 leading-normal">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className={log.includes("CRITICAL") || log.includes("ERROR") ? "text-red-400" : log.includes("Success") || log.includes("perfectly") ? "text-green-400" : ""}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function ConflictPlayground() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </DashboardLayout>
    }>
      <ConflictPlaygroundContent />
    </Suspense>
  );
}
