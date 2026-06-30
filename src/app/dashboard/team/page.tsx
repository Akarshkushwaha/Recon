"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Users, GitCommit, GitPullRequest, CircleDot, BrainCircuit, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

function DeveloperCard({ dev }: { dev: any }) {
  const inferFeatureWork = useAction(api.team.inferFeatureWork);
  const [focus, setFocus] = useState<string>("Analyzing recent activity...");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (dev.commits && dev.commits.length > 0) {
      inferFeatureWork({ authorLogin: dev.authorLogin, commits: dev.commits })
        .then(setFocus)
        .catch(() => setFocus("Unable to infer current focus at this time."));
    } else {
      setFocus("No recent commit activity detected.");
    }
  }, [dev.authorLogin, dev.commits, inferFeatureWork]);

  return (
    <div className="glass-card rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="p-5 border-b border-border bg-secondary/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-primary/20 bg-primary/10 flex items-center justify-center">
            {dev.authorAvatar ? (
              <img src={dev.authorAvatar} alt={dev.authorLogin} className="w-full h-full object-cover" />
            ) : (
              <Users size={20} className="text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">{dev.authorLogin}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Active Contributor
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black font-mono tracking-tighter text-primary">
            {dev.commits.length}
          </span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground block font-bold">
            Recent Commits
          </span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* AI Current Focus */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BrainCircuit size={14} className="text-primary" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Current Focus</h4>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90 font-medium">
            {focus}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PRs & Issues Column */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <GitPullRequest size={14} /> Active Pull Requests ({dev.pullRequests.length})
              </h4>
              <div className="space-y-2">
                {dev.pullRequests.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No active PRs</p>
                ) : (
                  dev.pullRequests.slice(0, 3).map((pr: any) => (
                    <div key={pr._id} className="text-xs p-2.5 rounded-lg border border-border bg-secondary/30 flex items-center justify-between group">
                      <span className="font-medium truncate pr-2 group-hover:text-primary transition-colors">{pr.title}</span>
                      <span className="font-mono text-muted-foreground shrink-0">#{pr.prNumber}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <CircleDot size={14} /> Assigned Issues ({dev.issues.length})
              </h4>
              <div className="space-y-2">
                {dev.issues.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">No assigned issues</p>
                ) : (
                  dev.issues.slice(0, 3).map((issue: any) => (
                    <div key={issue._id} className="text-xs p-2.5 rounded-lg border border-border bg-secondary/30 flex items-center justify-between group">
                      <span className="font-medium truncate pr-2 group-hover:text-primary transition-colors">{issue.title}</span>
                      <span className="font-mono text-muted-foreground shrink-0">#{issue.issueNumber}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Commits Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
              <GitCommit size={14} /> Latest Commits
            </h4>
            <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-border">
              {dev.commits.length === 0 ? (
                <p className="text-xs text-muted-foreground italic ml-6">No recent commits</p>
              ) : (
                dev.commits.map((commit: any) => (
                  <div key={commit._id} className="relative pl-6">
                    <span className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-card bg-primary/20 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    </span>
                    <p className="text-xs font-medium text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                      {commit.message}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                      <span className="bg-secondary/50 px-1.5 py-0.5 rounded">{commit.branchName}</span>
                      <span suppressHydrationWarning>{isMounted ? new Date(commit.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamRadarPage() {
  const team = useQuery(api.team.getTeamTelemetry);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
          <Users className="text-primary" size={24} />
          Team Radar
        </h1>
        <p className="text-sm text-muted-foreground">
          Real-time telemetry on what everyone is building right now.
        </p>
      </div>

      {!team ? (
        <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-2xl bg-card/30">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-sm font-medium text-muted-foreground tracking-wide">Syncing team telemetry...</p>
          </div>
        </div>
      ) : team.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-2xl bg-card/30 text-center px-4">
          <Users className="text-muted-foreground/30 mb-4" size={48} />
          <h3 className="text-lg font-bold mb-2">No Team Activity Detected</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Push some code or open a pull request to see your team's live telemetry dashboard.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {team.map((dev: any) => (
            <DeveloperCard key={dev.authorLogin} dev={dev} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
