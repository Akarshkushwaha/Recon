"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  TrendingUp,
  Award,
  Layers,
  Clock,
  ChevronRight,
  GitPullRequest,
  CheckCircle,
  FolderOpen,
  Filter
} from "lucide-react";
import { useState } from "react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = Array.from({ length: 24 }, (_, i) => `${i}:00`);

export default function AnalyticsPage() {
  // Fetch available repositories
  const repos = useQuery(api.activity.getRepos);
  const [selectedRepoId, setSelectedRepoId] = useState<string>("all");

  // Format repo parameter for Convex
  const repoParam = selectedRepoId === "all" ? undefined : (selectedRepoId as any);

  // Queries with optional repository filter
  const heatmap = useQuery(api.analytics.getContributorHeatmap, { repoId: repoParam });
  const velocity = useQuery(api.analytics.getReviewVelocity, { repoId: repoParam });
  const leaderboard = useQuery(api.analytics.getLeaderboard, { repoId: repoParam });
  const ownership = useQuery(api.analytics.getCodeOwnershipMap, { repoId: repoParam });

  const [activeTab, setActiveTab] = useState<"heatmap" | "leaderboard" | "velocity" | "ownership">("heatmap");
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number; val: number } | null>(null);

  const getHeatmapColor = (commits: number) => {
    if (commits === 0) return "bg-zinc-900 border border-white/5";
    if (commits <= 2) return "bg-primary/20 hover:bg-primary/30 border border-primary/30";
    if (commits <= 5) return "bg-primary/40 hover:bg-primary/50 border border-primary/50";
    if (commits <= 10) return "bg-primary/70 hover:bg-primary/80 border border-primary/70";
    return "bg-primary hover:brightness-110 border border-primary-foreground/20";
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        
        {/* Page header and Repo selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">Engineering Analytics</h1>
            <p className="text-sm text-muted-foreground">Deep behavioral and velocity insights aggregated from commit streams and pull requests.</p>
          </div>
          
          {/* Repository Selector Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground flex items-center">
                <Filter size={13} />
              </span>
              <select
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="bg-card hover:bg-muted border border-border rounded-xl pl-9 pr-8 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer appearance-none"
              >
                <option value="all">All Connected Repositories</option>
                {repos?.map((repo) => (
                  <option key={repo._id} value={repo._id}>
                    {repo.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px]">
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-muted/65 p-1 rounded-xl border w-fit">
          {(["heatmap", "leaderboard", "velocity", "ownership"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? "bg-background shadow-md text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dynamic content area */}
        <div className="grid gap-6">
          
          {/* 1. CONTRIBUTOR HEATMAP */}
          {activeTab === "heatmap" && (
            <div className="bento-card animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <TrendingUp className="text-primary" size={18} />
                    Contributor Push Activity Heatmap
                  </h2>
                  <p className="text-xs text-muted-foreground">Aggregated commit push volume by day of week and hour (UTC) over the past 30 days.</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Less</span>
                  <div className="w-3.5 h-3.5 rounded bg-zinc-900 border border-white/5" />
                  <div className="w-3.5 h-3.5 rounded bg-primary/20 border border-primary/30" />
                  <div className="w-3.5 h-3.5 rounded bg-primary/50 border border-primary/50" />
                  <div className="w-3.5 h-3.5 rounded bg-primary border border-primary-foreground/20" />
                  <span>More</span>
                </div>
              </div>

              {!heatmap ? (
                <div className="h-64 skeleton rounded-xl" />
              ) : (
                <div className="overflow-x-auto select-none">
                  <div className="min-w-[800px] flex flex-col gap-1.5">
                    {/* Hour Labels */}
                    <div className="flex pl-16 pr-2 mb-1.5 text-[10px] font-bold text-muted-foreground/60 tracking-wider">
                      {HOURS.filter((_, i) => i % 2 === 0).map((hour, idx) => (
                        <div key={idx} className="flex-1 text-center">
                          {hour}
                        </div>
                      ))}
                    </div>

                    {/* Grid Days */}
                    {heatmap.grid.map((dayRow, dayIdx) => (
                      <div key={dayIdx} className="flex items-center gap-1.5">
                        <span className="w-14 text-right text-xs font-semibold text-muted-foreground pr-2 shrink-0">
                          {DAYS[dayIdx].substring(0, 3)}
                        </span>
                        <div className="flex-1 flex gap-1.5">
                          {dayRow.map((commitCount, hourIdx) => (
                            <div
                              key={hourIdx}
                              onMouseEnter={() => setHoveredCell({ day: dayIdx, hour: hourIdx, val: commitCount })}
                              onMouseLeave={() => setHoveredCell(null)}
                              className={`flex-1 aspect-square rounded transition-all duration-150 cursor-pointer relative ${getHeatmapColor(commitCount)}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hover Cell Value Panel */}
                  <div className="h-6 mt-4 text-xs font-semibold text-center text-muted-foreground">
                    {hoveredCell ? (
                      <span className="animate-fade-in text-foreground">
                        {DAYS[hoveredCell.day]} at {hoveredCell.hour}:00 UTC:{" "}
                        <span className="text-primary font-bold">{hoveredCell.val} commits</span> pushed
                      </span>
                    ) : (
                      <span>Hover over a cell to see push volume</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. WEEKLY COMMIT LEADERBOARD */}
          {activeTab === "leaderboard" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              {/* Leaderboard panel */}
              <div className="bento-card md:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Award className="text-primary" size={18} />
                      Weekly Contribution Standings
                    </h2>
                    <p className="text-xs text-muted-foreground">Top active team contributors ranked by commit volume over the last 7 days.</p>
                  </div>
                  <span className="status-badge status-live">Active Sprint</span>
                </div>

                {!leaderboard ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-16 skeleton rounded-xl" />
                    ))}
                  </div>
                ) : leaderboard.weekly.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">
                    No commit pushes registered for this repository filter in the last 7 days.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {leaderboard.weekly.map((rank, idx) => (
                      <div
                        key={rank.author}
                        className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                            #{idx + 1}
                          </span>
                          <img src={rank.avatar} alt={rank.author} className="w-10 h-10 rounded-xl" />
                          <div>
                            <p className="text-sm font-bold">{rank.author}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span>{rank.branches} branch{rank.branches !== 1 ? "es" : ""}</span>
                              <span>•</span>
                              <span>{rank.filesChanged} file{rank.filesChanged !== 1 ? "s" : ""} modified</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-extrabold tracking-tight text-primary">{rank.commits}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">commits</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Monthly All-Stars Sidebar */}
              <div className="bento-card">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Monthly All-Stars</h3>
                {!leaderboard ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-10 skeleton rounded-lg" />
                    ))}
                  </div>
                ) : leaderboard.monthly.length === 0 ? (
                  <div className="text-xs text-muted-foreground">No recent push data.</div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.monthly.slice(0, 5).map((rank) => (
                      <div key={rank.author} className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0">
                        <span className="font-semibold">{rank.author}</span>
                        <span className="font-bold text-muted-foreground font-mono">{rank.commits} commits</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. PR REVIEW VELOCITY */}
          {activeTab === "velocity" && (
            <div className="bento-card animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Clock className="text-primary" size={18} />
                    Review & Cycle-Time Analytics
                  </h2>
                  <p className="text-xs text-muted-foreground">Average turnaround time from pull request opening to final review and code merge.</p>
                </div>
                {velocity && velocity.mergedCount > 0 && (
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">{velocity.avgMergeHours}h</span>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Avg Cycle Time</p>
                  </div>
                )}
              </div>

              {!velocity ? (
                <div className="h-48 skeleton rounded-xl" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* PR States Ring Aggregates */}
                  <div className="flex flex-col gap-3 justify-center bg-white/[0.01] border border-white/5 rounded-xl p-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <GitPullRequest size={14} className="text-primary" /> Active Open PRs
                      </span>
                      <span className="font-bold">{velocity.openCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle size={14} className="text-green-500" /> Merged PRs
                      </span>
                      <span className="font-bold">{velocity.mergedCount}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Layers size={14} className="text-muted-foreground" /> Closed Unmerged
                      </span>
                      <span className="font-bold">{velocity.closedCount}</span>
                    </div>
                  </div>

                  {/* Dev Speed ranking */}
                  <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Merge Velocity by Developer</h3>
                    {Object.keys(velocity.authorVelocity).length === 0 ? (
                      <div className="text-sm text-muted-foreground py-6">No pull requests have been merged for this selection.</div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(velocity.authorVelocity).map(([author, stats]) => (
                          <div key={author} className="space-y-1">
                            <div className="flex items-center justify-between text-xs font-semibold">
                              <span>{author}</span>
                              <span className="text-primary font-bold">{stats.avgHours} hrs avg ({stats.count} PRs)</span>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-white/5">
                              <div
                                className="bg-primary h-full rounded-full transition-all"
                                style={{ width: `${Math.min(100, Math.max(10, (stats.avgHours / 72) * 100))}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. CODE OWNERSHIP TREE */}
          {activeTab === "ownership" && (
            <div className="bento-card animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <Layers className="text-primary" size={18} />
                    Repository Ownership Allocation
                  </h2>
                  <p className="text-xs text-muted-foreground">Aggregated code path ownership mapped automatically by developers' push history and volume.</p>
                </div>
              </div>

              {!ownership ? (
                <div className="h-48 skeleton rounded-xl" />
              ) : ownership.ownership.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No directory path mappings recorded yet for this project filter. Push some commits to connect paths!
                </div>
              ) : (
                <div className="space-y-3">
                  {ownership.ownership.map((owner) => (
                    <div
                      key={owner.path}
                      className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <FolderOpen size={16} className="text-primary" />
                          <span className="font-mono text-sm font-semibold">{owner.path}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">Primary Owner:</span>
                          <span className="text-xs font-extrabold text-foreground bg-muted px-2 py-0.5 rounded border">
                            {owner.primaryOwner} ({owner.percentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Percentage Bar */}
                      <div className="w-full bg-zinc-900 rounded-full h-3 overflow-hidden border border-white/5 flex">
                        {owner.contributors.map((contrib, idx) => (
                          <div
                            key={contrib.author}
                            className={`h-full transition-all duration-300 ${
                              idx === 0
                                ? "bg-primary"
                                : idx === 1
                                ? "bg-cyan-500"
                                : idx === 2
                                ? "bg-emerald-500"
                                : "bg-zinc-700"
                            }`}
                            style={{ width: `${contrib.percentage}%` }}
                            title={`${contrib.author}: ${contrib.percentage}%`}
                          />
                        ))}
                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                        {owner.contributors.map((contrib, idx) => (
                          <div key={contrib.author} className="flex items-center gap-1.5">
                            <div
                              className={`w-2.5 h-2.5 rounded-sm ${
                                idx === 0
                                  ? "bg-primary"
                                  : idx === 1
                                  ? "bg-cyan-500"
                                  : idx === 2
                                  ? "bg-emerald-500"
                                  : "bg-zinc-700"
                              }`}
                            />
                            <span>{contrib.author}:</span>
                            <span className="font-bold text-foreground font-mono">{contrib.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
