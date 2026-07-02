"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GitBranch, Clock, HardDrive, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { RepoSelector } from "@/components/repo-selector";

export default function BranchesPage() {
  const [selectedRepoId, setSelectedRepoId] = useState<any>(undefined);
  const activity = useQuery(api.activity.getLatestActivity, { repoId: selectedRepoId });
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
        <div className="flex items-center gap-3">
          <RepoSelector selectedRepoId={selectedRepoId} onSelectRepo={setSelectedRepoId} />
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
                className="dashboard-card group flex flex-col justify-between"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div>
                  {/* Header: Author & Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={branch.authorAvatar}
                        alt={branch.authorLogin}
                        className="w-8 h-8 rounded-full border border-gray-100 object-cover"
                      />
                      <div>
                        <span className="text-sm font-semibold text-gray-900 block leading-tight">{branch.authorLogin}</span>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Clock size={10} />
                          {formatDistanceToNow(branch.lastPushTimestamp, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="status-badge status-live text-[10px] px-2 py-0.5">Active</span>
                      {isStale && (
                        <span className="status-badge status-warning text-[10px] px-2 py-0.5">Stale</span>
                      )}
                    </div>
                  </div>

                  {/* Branch name */}
                  <div className="flex items-center gap-2 mb-3 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                    <GitBranch size={14} className="text-primary flex-shrink-0" />
                    <span className="font-bold text-sm truncate font-mono text-gray-800">{branch.branchName}</span>
                  </div>
                </div>

                {/* Footer Meta */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                    <HardDrive size={12} className="text-gray-400" />
                    {branch.filesChanged.length} file{branch.filesChanged.length !== 1 ? "s" : ""} modified
                  </div>
                  <span className="text-[11px] font-bold text-violet-600 bg-violet-50 px-2 py-1 rounded-md border border-violet-100">
                    {branch.commitCount} commits
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
}
