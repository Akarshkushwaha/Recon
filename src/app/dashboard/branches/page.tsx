"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GitBranch, Clock, HardDrive, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export default function BranchesPage() {
  const activity = useQuery(api.activity.getLatestActivity);
  const [search, setSearch] = useState("");

  const filtered = activity?.filter(b =>
    b.branchName.toLowerCase().includes(search.toLowerCase()) ||
    b.authorLogin.toLowerCase().includes(search.toLowerCase())
  );

  const staleCount = activity?.filter(b =>
    Date.now() - b.lastPushTimestamp > 7 * 24 * 60 * 60 * 1000
  ).length ?? 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Active Branches</h1>
          <p className="text-sm text-muted-foreground">Track all branches with recent push activity across your repositories.</p>
        </div>
        <div className="flex items-center gap-2">
          {staleCount > 0 && (
            <span className="status-badge status-warning">{staleCount} stale</span>
          )}
          <span className="status-badge status-info">{activity?.length ?? 0} total</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search branches or authors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {!activity ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 skeleton rounded-2xl" />
          ))
        ) : (filtered ?? []).length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl">
            <GitBranch className="mx-auto text-muted-foreground/30 mb-4" size={40} />
            <h3 className="text-base font-semibold mb-1">No branches found</h3>
            <p className="text-sm text-muted-foreground">Push code to see active branches appear here.</p>
          </div>
        ) : (
          (filtered ?? []).map((branch, i) => {
            const isStale = Date.now() - branch.lastPushTimestamp > 7 * 24 * 60 * 60 * 1000;
            return (
              <div
                key={branch._id}
                className="bento-card group relative overflow-hidden"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {/* Big background icon */}
                <div className="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
                  <GitBranch size={100} />
                </div>

                {/* Author */}
                <div className="flex items-center gap-2.5 mb-4">
                  <img
                    src={branch.authorAvatar}
                    alt={branch.authorLogin}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-semibold">{branch.authorLogin}</span>
                </div>

                {/* Branch name */}
                <div className="flex items-center gap-2 mb-4">
                  <GitBranch size={15} className="text-primary flex-shrink-0" />
                  <span className="font-bold text-sm truncate font-mono">{branch.branchName}</span>
                </div>

                {/* Meta */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={12} />
                    {formatDistanceToNow(branch.lastPushTimestamp, { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <HardDrive size={12} />
                    {branch.filesChanged.length} file{branch.filesChanged.length !== 1 ? "s" : ""} modified
                  </div>
                </div>

                {/* Tags */}
                <div className="flex gap-2 flex-wrap">
                  <span className="status-badge status-live">Active</span>
                  {isStale && (
                    <span className="status-badge status-warning">Stale</span>
                  )}
                  <span className="status-badge status-info">{branch.commitCount} commits</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
