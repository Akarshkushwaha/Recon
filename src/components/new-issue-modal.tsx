"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader2, X, Sparkles, Check } from "lucide-react";

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-card border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-2">
            <Sparkles className="text-primary" size={24} />
            <h2 className="text-xl font-bold tracking-tight">Create AI Issue</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {success ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
                <Check size={32} />
              </div>
              <h3 className="text-xl font-bold">Issue Created Successfully!</h3>
            </div>
          ) : !preview ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select a repository and type what you're working on in plain English.
              </p>
              
              <select 
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="w-full bg-muted/50 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="" disabled>Select a repository...</option>
                {repos?.map(repo => (
                  <option key={repo._id} value={repo._id}>{repo.fullName}</option>
                ))}
              </select>

              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="I'm building the PDF export feature, it should take about 3 days. Assign it to me."
                className="w-full h-32 bg-muted/50 border rounded-2xl p-4 focus:ring-2 focus:ring-primary focus:outline-none resize-none transition-all"
              />
              <button 
                onClick={handleParse}
                disabled={isParsing || !text || !selectedRepoId}
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:scale-[1.01]"
              >
                {isParsing ? <Loader2 className="animate-spin" /> : <Sparkles size={20} />}
                {isParsing ? "AI is thinking..." : "Generate Preview"}
              </button>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <div className="p-4 bg-muted/30 border rounded-2xl space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Title</label>
                  <p className="font-bold text-lg">{preview.title}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
                  <p className="text-sm text-muted-foreground">{preview.body}</p>
                </div>
                <div className="flex gap-4">
                    <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Assignee</label>
                        <p className="text-sm font-medium">{preview.assignee || "Unassigned"}</p>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Estimate</label>
                        <p className="text-sm font-medium">{preview.estimate || "Not set"}</p>
                    </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setPreview(null)}
                  className="flex-1 border py-3 rounded-xl font-bold hover:bg-muted transition-colors"
                >
                  Edit Input
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  {isCreating ? <Loader2 className="animate-spin" /> : <Check size={20} />}
                  Confirm & Create
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
