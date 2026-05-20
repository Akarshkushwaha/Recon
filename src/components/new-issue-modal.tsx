"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader2, X, Sparkles, Check, ChevronDown, AlertTriangle } from "lucide-react";

// Intelligent client-side NLP fallback parser
const localParseFallback = (rawText: string) => {
  const clean = rawText.trim();
  const lines = clean.split("\n");
  const title = lines[0].replace(/^(e\.g\.|issue:|feature:|todo:)/i, "").trim() || "New AI-Generated Issue";
  
  // Extract assignee: search for @name
  const assigneeMatch = clean.match(/@([a-zA-Z0-9_-]+)/);
  const assignee = assigneeMatch ? assigneeMatch[1] : null;

  // Extract estimate: e.g. "3 days", "5 hours"
  const estimateMatch = clean.match(/(\d+)\s*(day|days|hour|hours|week|weeks)/i);
  const estimate = estimateMatch ? `${estimateMatch[1]} ${estimateMatch[2].toLowerCase()}` : "Not set";

  // Extract labels: e.g. "ui", "bug", "feature", "backend"
  const labels: string[] = ["AI-Synthesized"];
  if (clean.toLowerCase().includes("bug") || clean.toLowerCase().includes("fix")) {
    labels.push("bug");
  }
  if (clean.toLowerCase().includes("ui") || clean.toLowerCase().includes("page") || clean.toLowerCase().includes("css")) {
    labels.push("ui-component");
  }
  if (clean.toLowerCase().includes("backend") || clean.toLowerCase().includes("api") || clean.toLowerCase().includes("db")) {
    labels.push("backend");
  }

  const body = lines.slice(1).join("\n").trim() || `Auto-generated from user request: "${clean}"`;

  return {
    title: title.length > 60 ? title.substring(0, 60) + "..." : title,
    body,
    labels,
    assignee,
    estimate,
  };
};

export default function NewIssueModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const parseIssue = useAction(api.ai.parseIssue);
  const createIssue = useAction(api.github.createGitHubIssue);
  const repos = useQuery(api.activity.getRepos);

  const handleParse = async () => {
    if (!text.trim() || !selectedRepoId) return;
    setIsParsing(true);
    setError(null);

    if (selectedRepoId === "mock-sandbox") {
      try {
        // Simulate AI parsing delay
        await new Promise((resolve) => setTimeout(resolve, 800));
        const result = localParseFallback(text);
        setPreview(result);
      } catch (err: any) {
        setError("Failed to parse issue in sandbox mode.");
      } finally {
        setIsParsing(false);
      }
      return;
    }

    try {
      const result = await parseIssue({ text });
      setPreview(result);
    } catch (err: any) {
      console.error("Convex action parseIssue failed, falling back to local client parser:", err);
      // Graceful fallback to client-side parsing with visual warning notice
      const result = localParseFallback(text);
      setPreview(result);
      setError("Notice: Convex AI Action failed (likely missing GROQ_API_KEY). Used smart client-side parser fallback.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreate = async () => {
    if (!preview || !selectedRepoId) return;
    setError(null);

    if (selectedRepoId === "mock-sandbox") {
      setIsCreating(true);
      try {
        // Simulate issue creation delay
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setPreview(null);
          setText("");
          setSelectedRepoId("");
          onClose();
        }, 2000);
      } catch (err: any) {
        setError("Failed to create issue in sandbox mode.");
      } finally {
        setIsCreating(false);
      }
      return;
    }

    const repo = repos?.find((r) => (r._id as string) === selectedRepoId);
    if (!repo) {
      setError("Selected repository not found in database.");
      return;
    }
    if (!repo.githubInstallId) {
      setError("GitHub app connection not found for this repository. Please configure permissions.");
      return;
    }

    setIsCreating(true);
    try {
      await createIssue({
        installId: repo.githubInstallId,
        repoFullName: repo.fullName,
        title: preview.title,
        body: preview.body,
        labels: preview.labels,
        assignee: preview.assignee,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPreview(null);
        setText("");
        setSelectedRepoId("");
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error("GitHub issue creation failed:", err);
      setError(err.message || "Failed to create issue on GitHub. Verify your GitHub App configuration.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setText("");
    setSelectedRepoId("");
    setSuccess(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="font-bold text-base">Create AI Issue</h2>
              <p className="text-xs text-muted-foreground">Describe in plain English, AI does the rest</p>
            </div>
          </div>
          <button onClick={handleClose} className="btn-ghost p-2 rounded-lg">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <Check size={28} className="text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Issue Created!</h3>
                <p className="text-sm text-muted-foreground">Your issue has been posted to GitHub successfully.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Error/Notice Banner */}
              {error && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex gap-2.5 items-start animate-fade-in">
                  <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <p className="font-bold mb-0.5">System Alert</p>
                    <p className="opacity-90">{error}</p>
                  </div>
                </div>
              )}

              {!preview ? (
                <div className="space-y-4">
                  {/* Repo selector */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                      Target Repository
                    </label>
                    <div className="relative">
                      <select
                        value={selectedRepoId}
                        onChange={(e) => {
                          setSelectedRepoId(e.target.value);
                          setError(null);
                        }}
                        className="input appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select a repository...</option>
                        {repos?.map((repo) => (
                          <option key={repo._id} value={repo._id}>
                            {repo.fullName}
                          </option>
                        ))}
                        {(!repos || repos.length === 0) && (
                          <option value="mock-sandbox">sandbox-repository (Mock Sandbox)</option>
                        )}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  {/* Text input */}
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                      Describe the Issue
                    </label>
                    <textarea
                      value={text}
                      onChange={(e) => {
                        setText(e.target.value);
                        setError(null);
                      }}
                      placeholder="e.g. 'Build a PDF export for the reports page. Should handle pagination. Assign to @john and estimate 3 days.'"
                      className="input h-32 resize-none py-3 leading-relaxed"
                    />
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Include assignee, labels, or estimates in your description and AI will extract them.
                    </p>
                  </div>

                  <button
                    onClick={handleParse}
                    disabled={isParsing || !text.trim() || !selectedRepoId}
                    className="btn-primary w-full py-3"
                  >
                    {isParsing ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Sparkles size={15} />
                    )}
                    {isParsing ? "AI is thinking..." : "Generate Preview"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-up">
                  {/* Preview */}
                  <div className="p-4 bg-muted/30 border rounded-xl space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Issue Title</p>
                      <p className="font-bold text-base">{preview.title}</p>
                    </div>
                    <div className="section-divider" />
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Description</p>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{preview.body}</p>
                    </div>
                    <div className="section-divider" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Assignee</p>
                        <p className="font-medium">{preview.assignee || "Unassigned"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Estimate</p>
                        <p className="font-medium">{preview.estimate || "Not set"}</p>
                      </div>
                    </div>
                    {preview.labels?.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Labels</p>
                        <div className="flex flex-wrap gap-1.5">
                          {preview.labels.map((label: string, i: number) => (
                            <span key={i} className="status-badge status-info text-[9px]">{label}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => {
                        setPreview(null);
                        setError(null);
                      }}
                      className="btn-secondary flex-1"
                    >
                      Edit Input
                    </button>
                    <button
                      onClick={handleCreate}
                      disabled={isCreating}
                      className="btn-primary flex-1"
                    >
                      {isCreating ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                      {isCreating ? "Creating..." : "Create on GitHub"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
