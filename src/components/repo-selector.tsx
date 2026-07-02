"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Filter } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface RepoSelectorProps {
  selectedRepoId?: Id<"repos">;
  onSelectRepo: (repoId: Id<"repos"> | undefined) => void;
}

export function RepoSelector({ selectedRepoId, onSelectRepo }: RepoSelectorProps) {
  const repos = useQuery(api.activity.getUserRepos);

  if (!repos || repos.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 bg-secondary/30 border border-border px-3 py-1.5 rounded-xl text-xs font-medium">
      <Filter size={13} className="text-muted-foreground" />
      <span className="text-muted-foreground">Filter Repo:</span>
      <select
        value={selectedRepoId || ""}
        onChange={(e) => onSelectRepo(e.target.value ? (e.target.value as Id<"repos">) : undefined)}
        className="bg-transparent border-0 font-semibold text-foreground focus:outline-none cursor-pointer"
      >
        <option value="" className="bg-card text-foreground">All Repositories ({repos.length})</option>
        {repos.map((r) => (
          <option key={r._id} value={r._id} className="bg-card text-foreground">
            {r.fullName}
          </option>
        ))}
      </select>
    </div>
  );
}
