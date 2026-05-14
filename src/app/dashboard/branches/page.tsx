"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GitBranch, Clock, User, HardDrive } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function BranchesPage() {
  const activity = useQuery(api.activity.getLatestActivity);

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Branches</h1>
          <p className="text-muted-foreground">Track every branch with recent push activity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!activity ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-2xl animate-pulse" />
            ))
          ) : (
            activity.map((branch) => (
              <div key={branch._id} className="p-5 rounded-2xl border bg-card hover:border-primary/50 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <GitBranch size={80} />
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <img src={branch.authorAvatar} className="w-8 h-8 rounded-full" alt="" />
                  <span className="font-bold text-sm">{branch.authorLogin}</span>
                </div>

                <h3 className="text-lg font-bold mb-2 flex items-center gap-2 truncate">
                  <GitBranch size={18} className="text-primary" />
                  {branch.branchName}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={14} />
                    Pushed {formatDistanceToNow(branch.lastPushTimestamp, { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <HardDrive size={14} />
                    {branch.filesChanged.length} files modified
                  </div>
                </div>

                <div className="flex gap-2">
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md border border-primary/20 font-bold">
                    ACTIVE
                  </span>
                  {Date.now() - branch.lastPushTimestamp > 7 * 24 * 60 * 60 * 1000 && (
                    <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md border border-amber-500/20 font-bold">
                      STALE
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
