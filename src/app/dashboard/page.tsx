"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AlertTriangle, Clock, GitBranch, Terminal, Layers, FileCode, Filter, Activity, X, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useRouter } from "next/navigation";

function StatCard({ label, value, sub, icon: Icon, colorClass }: { label: string; value: string | number; sub?: string; icon: any; colorClass: string }) {
  return (
    <div className="dashboard-card group hover:scale-[1.02] transition-all duration-300 relative overflow-hidden bg-gradient-to-br from-card to-card/90">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${colorClass} opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-1.5">{label}</p>
          <p className="text-3xl font-black tracking-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground/80 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-border flex items-center justify-center text-muted-foreground group-hover:text-foreground group-hover:border-primary/30 transition-colors shadow-sm`}>
          <Icon size={16} className="transition-transform duration-300 group-hover:scale-110" />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [selectedRepoId, setSelectedRepoId] = useState<string>("all");
  const [filterByMe, setFilterByMe] = useState(false);
  
  const activity = useQuery(api.activity.getLatestActivity, { 
    repoId: selectedRepoId === "all" ? undefined : (selectedRepoId as any),
    filterByMe 
  });
  const conflicts = useQuery(api.activity.getActiveConflicts, selectedRepoId === "all" ? {} : { repoId: selectedRepoId as any });
  const staleAlerts = useQuery(api.activity.getStaleAlerts, selectedRepoId === "all" ? {} : { repoId: selectedRepoId as any });
  const repos = useQuery(api.activity.getRepos);

  const dismissActivity = useMutation(api.activity.dismissActivity);
  const dismissConflict = useMutation(api.activity.dismissConflict);
  const dismissStaleAlert = useMutation(api.activity.dismissStaleAlert);

  const filteredActivity = selectedRepoId === "all"
    ? activity
    : activity?.filter((item) => (item.repoId as string) === selectedRepoId);

  const filteredConflicts = selectedRepoId === "all"
    ? conflicts
    : conflicts?.filter((item) => (item.repoId as string) === selectedRepoId);

  const filteredStaleAlerts = selectedRepoId === "all"
    ? staleAlerts
    : staleAlerts?.filter((item) => (item.repoId as string) === selectedRepoId);

  const activeCount = filteredActivity?.length ?? 0;
  const conflictCount = filteredConflicts?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="relative">
        <div className="absolute -top-10 left-1/4 w-[500px] h-[300px] bg-gradient-to-r from-blue-500/10 to-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse duration-[8000ms]" />
        <div className="absolute top-20 right-1/4 w-[400px] h-[250px] bg-gradient-to-r from-violet-500/10 to-rose-500/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse duration-[12000ms]" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Activity Feed</h1>
            <p className="text-sm text-muted-foreground">Real-time stream of development activity across your connected repositories.</p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => setFilterByMe(!filterByMe)}
              className={`px-3 py-2.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-2 ${
                filterByMe 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-card hover:bg-muted text-foreground border-border"
              }`}
            >
              My Activity Only
            </button>
            
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard label="Active Branches" value={activeCount} sub="across all repos" icon={GitBranch} colorClass="from-blue-500 to-cyan-500" />
          <StatCard label="Conflicts" value={conflictCount} sub={conflictCount > 0 ? "requires attention" : "all clear"} icon={AlertTriangle} colorClass="from-rose-500 to-orange-500" />
          <StatCard label="Stream Status" value="Live" sub="webhooks active" icon={Activity} colorClass="from-emerald-500 to-teal-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
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
              {filteredActivity.map((item, i) => {
                const repo = repos?.find(r => r._id === item.repoId);
                const repoName = repo?.fullName || "repository";
                const githubLink = `https://github.com/${repoName}/tree/${item.branchName}`;

                return (
                  <div
                    key={item._id}
                    className="dashboard-card flex items-start gap-5 p-5 group hover:border-primary/40 hover:shadow-md transition-all"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.authorAvatar}
                        alt={item.authorLogin}
                        className="w-11 h-11 rounded-xl object-cover border border-border"
                      />
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-primary rounded-md flex items-center justify-center border-2 border-background shadow-sm">
                        <Terminal size={10} className="text-primary-foreground" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm">{item.authorLogin}</span>
                          <span className="text-xs text-muted-foreground">pushed to</span>
                          <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md font-mono text-xs font-semibold">
                            <GitBranch size={12} />
                            {item.branchName}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap">
                          <Clock size={12} />
                          {formatDistanceToNow(item.lastPushTimestamp || 0, { addSuffix: true })}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        <span className="font-medium text-foreground">{item.commitCount || 1} commit{(item.commitCount || 1) !== 1 ? "s" : ""}</span> in <span className="font-medium">{repoName}</span>
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(item.filesChanged || []).slice(0, 4).map((file, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 border border-border text-[11px] text-muted-foreground font-mono"
                          >
                            <FileCode size={10} className="text-primary/70" />
                            {file.split('/').pop()}
                          </span>
                        ))}
                        {(item.filesChanged || []).length > 4 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-muted/50 border border-border text-[11px] text-muted-foreground font-mono">
                            +{(item.filesChanged || []).length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={githubLink} target="_blank" className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View on GitHub">
                        <Activity size={16} />
                      </a>
                      <button onClick={() => dismissActivity({ activityId: item._id })} className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors" title="Dismiss">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} />
                Conflicts
              </h2>
              {filteredConflicts && filteredConflicts.length > 0 && (
                <span className="status-badge status-danger">{filteredConflicts.length} active</span>
              )}
            </div>
            
            {(!filteredConflicts || filteredConflicts.length === 0) ? (
              <div className="p-6 rounded-2xl border border-dashed text-center">
                <p className="text-sm text-muted-foreground">No merge conflicts found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConflicts.map((conflict) => (
                  <div
                    key={conflict._id}
                    className="flex flex-col p-4 rounded-xl border border-destructive/25 bg-destructive/5 hover:border-destructive/40 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                        <AlertTriangle size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{conflict.branch1}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 my-0.5"><GitBranch size={10}/> conflicts with</p>
                        <p className="text-sm font-semibold truncate text-foreground">{conflict.branch2}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-destructive/10">
                      <p className="text-[11px] text-destructive font-medium">
                        {(conflict.conflictingFiles || []).length} overlapping files
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/dashboard/conflicts/playground?conflictId=${conflict._id}`)}
                          className="btn-danger text-[11px] px-2.5 py-1"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => dismissConflict({ conflictId: conflict._id })}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                          title="Dismiss"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert size={14} />
                Stale Branches
              </h2>
              {filteredStaleAlerts && filteredStaleAlerts.length > 0 && (
                <span className="status-badge bg-amber-500/10 text-amber-500 border border-amber-500/20">{filteredStaleAlerts.length} stale</span>
              )}
            </div>
            
            {(!filteredStaleAlerts || filteredStaleAlerts.length === 0) ? (
              <div className="p-6 rounded-2xl border border-dashed text-center">
                <p className="text-sm text-muted-foreground">All branches are clean.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredStaleAlerts.map((alert) => (
                  <div
                    key={alert._id}
                    className="flex flex-col p-4 rounded-xl border border-amber-500/25 bg-amber-500/5 hover:border-amber-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground break-all">
                          {alert.branchName}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          By {alert.author}
                        </p>
                      </div>
                      <button
                        onClick={() => dismissStaleAlert({ alertId: alert._id })}
                        className="p-1 text-muted-foreground hover:text-amber-500 transition-colors shrink-0"
                        title="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="mt-3 pt-3 border-t border-amber-500/10 flex items-center text-[11px] text-amber-600 font-medium">
                      <Clock size={12} className="mr-1.5"/> 
                      Inactive for {formatDistanceToNow(alert.lastPushTime || 0)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
