"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { CheckCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ConflictsPage() {
  const conflicts = useQuery(api.activity.getActiveConflicts);
  const dismissConflict = useMutation(api.conflicts.dismissConflict);

  return (
    <DashboardLayout>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Conflicts</h1>
            <p className="text-muted-foreground">Active overlaps detected between branches.</p>
          </div>
          <span className="bg-destructive/10 text-destructive px-4 py-1 rounded-full text-sm font-bold border border-destructive/20">
            {conflicts?.length || 0} Active
          </span>
        </div>

        <div className="grid gap-4">
          {!conflicts ? (
            <div className="flex flex-col gap-4 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 bg-muted rounded-xl" />
              ))}
            </div>
          ) : conflicts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 border border-dashed rounded-2xl bg-card/50">
              <CheckCircle className="text-primary mb-4" size={48} />
              <h3 className="text-xl font-bold">No Conflicts Found</h3>
              <p className="text-muted-foreground">Your team is perfectly in sync.</p>
            </div>
          ) : (
            conflicts.map((conflict) => (
              <div key={conflict._id} className="p-6 rounded-2xl border border-destructive/30 bg-card hover:border-destructive/50 transition-all group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      <div className="w-12 h-12 rounded-full bg-primary border-4 border-card flex items-center justify-center font-bold">
                        {conflict.author1[0]}
                      </div>
                      <div className="w-12 h-12 rounded-full bg-secondary border-4 border-card flex items-center justify-center font-bold">
                        {conflict.author2[0]}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">
                        {conflict.branch1} <span className="text-muted-foreground mx-2">vs</span> {conflict.branch2}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Detected {formatDistanceToNow(conflict.detectedAt, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => dismissConflict({ conflictId: conflict._id })}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Conflicting Files:</p>
                  <div className="flex flex-wrap gap-2">
                    {conflict.conflictingFiles.map((file, idx) => (
                      <code key={idx} className="bg-destructive/10 text-destructive px-3 py-1 rounded-md text-xs border border-destructive/20">
                        {file}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button 
                    onClick={() => dismissConflict({ conflictId: conflict._id })}
                    className="flex-1 bg-destructive text-destructive-foreground py-2 rounded-xl font-bold hover:opacity-90 transition-opacity"
                  >
                    Dismiss Alert
                  </button>
                  <button className="flex-1 bg-secondary text-secondary-foreground py-2 rounded-xl font-bold hover:bg-muted transition-colors">
                    View Diff
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
