"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader2, X, Sparkles, Check, ChevronDown } from "lucide-react";

export default function NewIssueModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState("");

  const parseIssue = useAction(api.ai.parseIssue);
  const createIssue = useAction(api.github.createGitHubIssue);
  const repos = useQuery(api.activity.getRepos);

  const handleParse = async () => {
    if (!text.trim() || !selectedRepoId) return;
    setIsParsing(true);
    try {
      const result = await parseIssue({ text });
      setPreview(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleCreate = async () => {
    if (!preview || !selectedRepoId) return;
    const repo = repos?.find(r => (r._id as string) === selectedRepoId);
    if (!repo || !repo.githubInstallId) return;

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
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setPreview(null);
    setText("");
    setSelectedRepoId("");
    setSuccess(false);
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
          ) : !preview ? (
            <div className="space-y-4">
              {/* Repo selector */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                  Target Repository
                </label>
                <div className="relative">
                  <select
                    value={selectedRepoId}
                    onChange={(e) => setSelectedRepoId(e.target.value)}
                    className="input appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a repository...</option>
                    {repos?.map(repo => (
                      <option key={repo._id} value={repo._id}>{repo.fullName}</option>
                    ))}
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
                  onChange={(e) => setText(e.target.value)}
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
                  onClick={() => setPreview(null)}
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
      </div>
    </div>
  );
}
