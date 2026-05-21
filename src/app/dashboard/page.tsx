"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AlertTriangle, Clock, GitBranch, Terminal, Layers, FileCode, Plus, Filter, Sparkles, GitPullRequest } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AIAssistantDrafter from "@/components/new-issue-modal";

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bento-card">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const activity = useQuery(api.activity.getLatestActivity);
  const conflicts = useQuery(api.activity.getActiveConflicts);
  const repos = useQuery(api.activity.getRepos);
  const recentPRs = useQuery(api.activity.getRecentPRs);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("all");
  const [isIssueOpen, setIsIssueOpen] = useState(false);

  const filteredActivity = selectedRepoId === "all"
    ? activity
    : activity?.filter((item) => (item.repoId as string) === selectedRepoId);

  const filteredConflicts = selectedRepoId === "all"
    ? conflicts
    : conflicts?.filter((item) => (item.repoId as string) === selectedRepoId);

  const activeCount = filteredActivity?.length ?? 0;
  const conflictCount = filteredConflicts?.length ?? 0;

  return (
    <DashboardLayout>
      {/* Page header and Repo selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Activity Feed</h1>
          <p className="text-sm text-muted-foreground">Real-time stream of development activity across your connected repositories.</p>
        </div>
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Repository Selector Dropdown */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center">
              <Filter size={13} />
            </span>
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="bg-card hover:bg-muted border border-border rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer appearance-none text-foreground"
            >
              <option value="all">All Connected Repositories</option>
              {repos?.map((repo) => (
                <option key={repo._id} value={repo._id}>
                  {repo.fullName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">
              ▼
            </div>
          </div>

          <button
            onClick={() => setIsIssueOpen(true)}
            className="btn-primary py-2.5"
          >
            <Sparkles size={15} />
            AI Issue Drafter
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Active Branches" value={activeCount} sub="across all repos" />
        <StatCard label="Conflicts" value={conflictCount} sub={conflictCount > 0 ? "requires attention" : "all clear"} />
        <StatCard label="Stream Status" value="Live" sub="webhooks active" />
      </div>

      {/* Conflict alerts */}
      {filteredConflicts && filteredConflicts.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle size={14} />
              Conflict Alerts
            </h2>
            <span className="status-badge status-danger">{filteredConflicts.length} active</span>
          </div>
          {filteredConflicts.map((conflict) => (
            <div
              key={conflict._id}
              className="flex items-center justify-between p-4 rounded-xl border border-destructive/25 bg-destructive/5 hover:border-destructive/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    <span className="text-foreground">{conflict.branch1}</span>
                    <span className="text-muted-foreground mx-2">↔</span>
                    <span className="text-foreground">{conflict.branch2}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {conflict.conflictingFiles.length} overlapping {conflict.conflictingFiles.length === 1 ? "file" : "files"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push(`/dashboard/conflicts/playground?conflictId=${conflict._id}`)}
                className="btn-danger text-xs px-3 py-1.5"
              >
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Activity feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Recent Pushes
          </h2>
          <div className="status-badge status-live">
            <span className="pulse-dot" />
            Live
          </div>
        </div>

        {!filteredActivity ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-5 rounded-2xl border">
                <div className="w-10 h-10 rounded-xl skeleton flex-shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-48 skeleton rounded mb-2" />
                  <div className="h-3 w-80 skeleton rounded" />
                </div>
                <div className="h-3 w-20 skeleton rounded" />
              </div>
            ))}
          </div>
        ) : filteredActivity.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed rounded-2xl">
            <Layers className="mx-auto text-muted-foreground/30 mb-4" size={44} />
            <h3 className="text-base font-semibold mb-1.5">No signal detected</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Push code to the selected repository to see your team's activity stream here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivity.map((item, i) => (
              <div
                key={item._id}
                className="bento-card flex items-start gap-5 p-5 group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={item.authorAvatar}
                    alt={item.authorLogin}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-md flex items-center justify-center border-2 border-background">
                    <Terminal size={9} className="text-primary-foreground" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-sm">{item.authorLogin}</span>
                      <span className="status-badge status-info text-[9px]">PUSH</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-shrink-0">
                      <Clock size={11} />
                      {formatDistanceToNow(item.lastPushTimestamp, { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    Pushed{" "}
                    <span className="font-semibold text-foreground">{item.commitCount} commit{item.commitCount !== 1 ? "s" : ""}</span>
                    {" "}to{" "}
                    <span className="inline-flex items-center gap-1 bg-muted px-2 py-0.5 rounded-md font-mono text-xs font-medium">
                      <GitBranch size={11} className="text-primary" />
                      {item.branchName}
                    </span>
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {item.filesChanged.slice(0, 5).map((file, idx) => (
                      <span
                        key={idx}
                        className="code-tag group-hover:border-primary/30 group-hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        <FileCode size={10} />
                        {file.split('/').pop()}
                      </span>
                    ))}
                    {item.filesChanged.length > 5 && (
                      <span className="code-tag text-muted-foreground/50">
                        +{item.filesChanged.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent PRs Feed */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <GitPullRequest size={14} />
            Recent Pull Requests (AI Analyzed)
          </h2>
        </div>

        {!recentPRs ? (
           <div className="space-y-3">
             <div className="h-16 skeleton rounded-xl w-full" />
             <div className="h-16 skeleton rounded-xl w-full" />
           </div>
        ) : recentPRs.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed rounded-2xl">
            <GitPullRequest className="mx-auto text-muted-foreground/30 mb-4" size={32} />
            <h3 className="text-sm font-semibold mb-1">No pull requests found</h3>
            <p className="text-xs text-muted-foreground">Open a PR to see Recon automatically analyze it.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPRs.map((pr, i) => (
              <div key={pr._id} className="p-4 rounded-xl border bg-card flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <GitPullRequest size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      {pr.title} <span className="text-muted-foreground font-mono text-xs">#{pr.prNumber}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Opened by <span className="font-medium text-foreground">{pr.author}</span> • {formatDistanceToNow(pr.openedAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div>
                  {pr.descriptionGenerated ? (
                    <span className="status-badge status-info text-[10px] flex items-center gap-1">
                      <Sparkles size={10} />
                      AI Analyzed
                    </span>
                  ) : (
                    <span className="status-badge status-warning text-[10px]">Pending Analysis...</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AIAssistantDrafter isOpen={isIssueOpen} onClose={() => setIsIssueOpen(false)} />
    </DashboardLayout>
  );
}
