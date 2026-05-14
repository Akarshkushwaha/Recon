"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AlertTriangle, Clock, GitBranch } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const activity = useQuery(api.activity.getLatestActivity);
  const conflicts = useQuery(api.activity.getActiveConflicts);

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        {/* Conflict Alerts Section */}
        {conflicts && conflicts.length > 0 && (
          <div className="flex flex-col gap-3">
            {conflicts.map((conflict) => (
              <div 
                key={conflict._id} 
                className="p-4 rounded-xl border border-destructive/50 bg-destructive/10 flex items-center justify-between animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground flex items-center gap-2">
                      Conflict Detected: {conflict.branch1} & {conflict.branch2}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Both {conflict.author1} and {conflict.author2} are working on: 
                      <span className="ml-1 text-destructive font-mono text-xs">
                        {conflict.conflictingFiles.join(", ")}
                      </span>
                    </p>
                  </div>
                </div>
                <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
                  Resolve Now
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Activity Feed */}
        <div className="flex flex-col gap-4">
          {!activity ? (
            <div className="flex flex-col gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="p-12 text-center border border-dashed rounded-2xl">
              <p className="text-muted-foreground">No activity detected yet. Push some code!</p>
            </div>
          ) : (
            activity.map((item) => (
              <div key={item._id} className="p-4 rounded-xl border bg-card hover:border-primary/50 transition-colors flex items-start gap-4 group">
                <img 
                  src={item.authorAvatar} 
                  alt={item.authorLogin}
                  className="w-10 h-10 rounded-full bg-muted border border-border"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
                      {item.authorLogin}
                    </h4>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock size={12} />
                      {formatDistanceToNow(item.lastPushTimestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    Pushed {item.commitCount} commits to 
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-mono text-xs flex items-center gap-1">
                      <GitBranch size={12} />
                      {item.branchName}
                    </span>
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.filesChanged.slice(0, 5).map((file, idx) => (
                      <span 
                        key={idx} 
                        className="text-[10px] bg-muted/50 text-muted-foreground px-2 py-0.5 rounded border border-border group-hover:border-primary/20 group-hover:text-primary transition-colors"
                      >
                        {file}
                      </span>
                    ))}
                    {item.filesChanged.length > 5 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{item.filesChanged.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
