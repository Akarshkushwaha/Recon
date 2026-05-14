"use client";

import { useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Send, Loader2, X, Sparkles, Check } from "lucide-react";

export default function NewIssueModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [text, setText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const parseIssue = useAction(api.ai.parseIssue);
  // const createIssue = useAction(api.github.createGitHubIssue);

  const handleParse = async () => {
    if (!text.trim()) return;
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
          {!preview ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Type what you're working on in plain English. AI will do the rest.
              </p>
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="I'm building the PDF export feature, it should take about 3 days. Assign it to me."
                className="w-full h-32 bg-muted/50 border rounded-2xl p-4 focus:ring-2 focus:ring-primary focus:outline-none resize-none transition-all"
              />
              <button 
                onClick={handleParse}
                disabled={isParsing || !text}
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
