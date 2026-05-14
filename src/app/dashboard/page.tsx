"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { AlertTriangle, Clock, GitBranch, Terminal, Layers } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const activity = useQuery(api.activity.getLatestActivity);
  const conflicts = useQuery(api.activity.getActiveConflicts);

  return (
    <DashboardLayout>
      <div className="space-y-10">
        <div className="flex items-end justify-between">
            <div>
                <h1 className="text-4xl font-black tracking-tightest">Activity <span className="text-primary/50">Feed</span></h1>
                <p className="text-muted-foreground font-medium mt-1">Real-time stream of development activity across your organization.</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full text-xs font-black tracking-tighter">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                LIVE STREAM ACTIVE
            </div>
        </div>

        {/* Conflict Alerts Section */}
        {conflicts && conflicts.length > 0 && (
          <div className="grid gap-4">
            {conflicts.map((conflict) => (
              <div 
                key={conflict._id} 
                className="p-6 rounded-[2rem] border-2 border-destructive/20 bg-destructive/5 flex items-center justify-between group hover:border-destructive/40 transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive shadow-inner">
                    <AlertTriangle size={28} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black tracking-tight mb-1">
                      Critical Conflict Detected
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-bold text-foreground">{conflict.branch1}</span> & <span className="font-bold text-foreground">{conflict.branch2}</span> have overlapping changes in <span className="font-mono text-destructive underline">{conflict.conflictingFiles.length} files</span>.
                    </p>
                  </div>
                </div>
                <button className="bg-destructive text-destructive-foreground px-6 py-3 rounded-xl font-black text-sm hover:scale-105 transition-transform shadow-lg shadow-destructive/20">
                  INITIATE RESOLUTION
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          {!activity ? (
            <div className="grid gap-6 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-muted rounded-[2rem]" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <div className="p-20 text-center border-2 border-dashed rounded-[3rem] bg-card/30">
              <Layers className="mx-auto text-muted-foreground mb-4 opacity-20" size={60} />
              <h3 className="text-xl font-bold mb-2">No Signal Detected</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">Push code to any connected repository to see the pulse of your team here.</p>
            </div>
          ) : (
            <div className="grid gap-6">
                {activity.map((item) => (
                  <div key={item._id} className="bento-card group flex items-start gap-8">
                    <div className="relative">
                        <img 
                          src={item.authorAvatar} 
                          alt={item.authorLogin}
                          className="w-14 h-14 rounded-2xl bg-muted grayscale group-hover:grayscale-0 transition-all duration-500 shadow-xl"
                        />
                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg border-2 border-background">
                            <Terminal size={12} />
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <h4 className="text-lg font-black tracking-tight">
                              {item.authorLogin}
                            </h4>
                            <span className="bg-primary/5 text-primary px-3 py-1 rounded-full font-black text-[10px] tracking-widest border border-primary/10">
                              PUSH EVENT
                            </span>
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase flex items-center gap-2">
                          <Clock size={12} />
                          {formatDistanceToNow(item.lastPushTimestamp, { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground mb-6 text-sm font-medium leading-relaxed">
                        Pushed <span className="text-foreground font-black underline decoration-primary/30">{item.commitCount} commits</span> to the 
                        <span className="mx-2 inline-flex items-center gap-1.5 bg-secondary text-foreground px-3 py-1 rounded-lg font-bold text-xs">
                          <GitBranch size={14} className="text-primary" />
                          {item.branchName}
                        </span>
                        branch.
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {item.filesChanged.slice(0, 6).map((file, idx) => (
                          <span 
                            key={idx} 
                            className="text-[10px] font-black tracking-tight bg-muted/30 text-muted-foreground px-3 py-1.5 rounded-lg border border-border group-hover:border-primary/20 group-hover:text-primary transition-all duration-300"
                          >
                            {file}
                          </span>
                        ))}
                        {item.filesChanged.length > 6 && (
                          <span className="text-[10px] font-black text-muted-foreground/50 py-1.5 px-2">
                            + {item.filesChanged.length - 6} MORE FILES
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
