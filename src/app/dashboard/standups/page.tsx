"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Calendar, CheckCircle2, Circle, AlertCircle, Sparkles, Loader2, Clock } from "lucide-react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import ReactMarkdown from "react-markdown";

function StandupCard({ author, yesterday, today, blockers, date }: any) {
  return (
    <div className="dashboard-card animate-fade-up">
      {/* Author header */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          {author[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{author}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Clock size={10} />
            {date}
          </p>
        </div>
        <span className="status-badge status-info text-[9px]">AI Generated</span>
      </div>

      {/* Yesterday */}
      <div className="mb-4">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <CheckCircle2 size={12} className="text-green-500" />
          Yesterday
        </h4>
        <ul className="space-y-1.5">
          {yesterday.map((item: string, i: number) => (
            <li key={i} className="text-sm text-muted-foreground flex gap-2 leading-relaxed">
              <span className="text-primary mt-1.5 flex-shrink-0">·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Today */}
      <div className="mb-4">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Circle size={12} className="text-primary" />
          Today
        </h4>
        <ul className="space-y-1.5">
          {today.map((item: string, i: number) => (
            <li key={i} className="text-sm text-muted-foreground flex gap-2 leading-relaxed">
              <span className="text-primary mt-1.5 flex-shrink-0">·</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Blockers */}
      {blockers && blockers.length > 0 && (
        <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/15">
          <h4 className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-2 flex items-center gap-1.5">
            <AlertCircle size={12} />
            Blockers
          </h4>
          <ul className="space-y-1">
            {blockers.map((item: string, i: number) => (
              <li key={i} className="text-sm text-destructive/80 flex gap-2">
                <span className="flex-shrink-0">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function StandupsPage() {
  const { user } = useUser();
  const standups = useQuery(api.activity.getStandups);
  const generateStandup = useAction(api.ai.generateStandup);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    const name = user?.username || user?.fullName || user?.firstName;
    if (!name) return;
    setIsGenerating(true);
    try {
      await generateStandup({ author: name });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Team Standups</h1>
          <p className="text-sm text-muted-foreground">AI-generated daily digests summarized from your recent commit activity.</p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !user}
          className="btn-primary"
        >
          {isGenerating
            ? <Loader2 size={15} className="animate-spin" />
            : <Sparkles size={15} />
          }
          {isGenerating ? "Generating..." : "Generate Today's"}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!standups ? (
          [1, 2].map(i => (
            <div key={i} className="h-72 skeleton rounded-2xl" />
          ))
        ) : standups.length === 0 ? (
          <div className="col-span-full py-24 text-center border-2 border-dashed rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
              <Calendar className="text-muted-foreground/40" size={28} />
            </div>
            <h3 className="text-base font-bold mb-2">No standups yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
              Click "Generate Today's" and Recon will analyze your recent commit history to write your standup automatically.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !user}
              className="btn-primary mx-auto"
            >
              {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {isGenerating ? "Generating..." : "Generate First Standup"}
            </button>
          </div>
        ) : (
          standups.map((standup) => (
            <StandupCard
              key={standup._id}
              author={standup.author}
              date={standup.date}
              yesterday={standup.yesterday}
              today={standup.today}
              blockers={standup.blockers}
            />
          ))
        )}
      </div>
    </DashboardLayout>
  );
}
