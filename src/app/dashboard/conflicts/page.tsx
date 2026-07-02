"use client";

import DashboardLayout from "@/components/dashboard-layout";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CheckCircle, X, AlertTriangle, FileCode, Sparkles } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { RepoSelector } from "@/components/repo-selector";

export default function ConflictsPage() {
  const [selectedRepoId, setSelectedRepoId] = useState<any>(undefined);
  const conflicts = useQuery(api.activity.getActiveConflicts, { repoId: selectedRepoId });
  const dismissConflict = useMutation(api.conflicts.dismissConflict);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Merge Conflicts</h1>
          <p className="text-sm text-muted-foreground">Active file overlaps detected between branches in your repositories.</p>
        </div>
        <div className="flex items-center gap-3">
          <RepoSelector selectedRepoId={selectedRepoId} onSelectRepo={setSelectedRepoId} />
          <span className={`status-badge ${(conflicts?.length ?? 0) > 0 ? "status-danger" : "status-live"}`}>
            {conflicts?.length ?? 0} {(conflicts?.length ?? 0) === 1 ? "conflict" : "conflicts"}
          </span>
        </div>
      </div>

      {/* Content */}
      {!conflicts ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-44 skeleton rounded-2xl" />
          ))}
        </div>
      ) : conflicts.length === 0 ? (
        <div className="space-y-6">
          <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-white/[0.01]">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="text-green-500" size={32} />
            </div>
            <h3 className="text-lg font-bold mb-2">All clear!</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              No overlapping changes detected. Your team is perfectly in sync.
            </p>
          </div>

          {/* Premium Sandbox promo card */}
          <div className="glass-card rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-left">
              <h3 className="text-base font-bold flex items-center gap-2 text-primary">
                <Sparkles size={16} className="animate-pulse" />
                Try Conflict Sandbox Playground
              </h3>
              <p className="text-xs text-muted-foreground max-w-xl">
                Experience Recon's conflict resolution first-hand. Launch the sandbox simulator to review side-by-side branch telemetries, run smart AI code synthesis, and resolve overlaps in real time.
              </p>
            </div>
            <Link
              href="/dashboard/conflicts/playground?conflictId=demo"
              className="btn-primary shrink-0 flex items-center gap-2 py-2.5 shadow-lg shadow-primary/20"
            >
              <Sparkles size={14} />
              Launch Demo Playground
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {conflicts.map((conflict) => (
            <div
              key={conflict._id}
              className="rounded-2xl border border-destructive/20 bg-card overflow-hidden"
            >
              {/* Header bar */}
              <div className="flex items-center justify-between px-6 py-4 bg-destructive/5 border-b border-destructive/10">
                <div className="flex items-center gap-4">
                  {/* Stacked avatars */}
                  <div className="flex -space-x-2">
                    <div className="w-9 h-9 rounded-full bg-primary border-2 border-card flex items-center justify-center text-primary-foreground text-sm font-bold">
                      {conflict.author1?.[0]?.toUpperCase()}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-muted border-2 border-card flex items-center justify-center text-foreground text-sm font-bold">
                      {conflict.author2?.[0]?.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <span className="font-mono text-primary">{conflict.branch1}</span>
                      <AlertTriangle size={13} className="text-destructive" />
                      <span className="font-mono text-primary">{conflict.branch2}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Detected {formatDistanceToNow(conflict.detectedAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => dismissConflict({ conflictId: conflict._id })}
                  className="btn-ghost p-2 rounded-lg text-muted-foreground hover:text-foreground"
                  title="Dismiss conflict"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Files */}
              <div className="px-6 py-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  Conflicting Files ({conflict.conflictingFiles.length})
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {conflict.conflictingFiles.map((file, idx) => (
                    <span
                      key={idx}
                      className="code-tag text-destructive border-destructive/25 bg-destructive/5 flex items-center gap-1.5"
                    >
                      <FileCode size={10} />
                      {file}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2.5">
                  <button
                    onClick={() => dismissConflict({ conflictId: conflict._id })}
                    className="btn-danger"
                  >
                    Dismiss Alert
                  </button>
                  <Link
                    href={`/dashboard/conflicts/playground?conflictId=${conflict._id}`}
                    className="btn-secondary flex items-center justify-center"
                  >
                    View Diff
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
