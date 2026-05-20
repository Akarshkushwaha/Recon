"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Settings, Github, Zap, Shield, Loader2, Check, ExternalLink } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function Section({ icon: Icon, title, description, children }: any) {
  return (
    <div className="bento-card">
      <div className="flex items-start gap-4 pb-5 mb-5 border-b">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-bold text-base">{title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const settings = useQuery(api.settings.getSettings, {});
  const updateSettings = useMutation(api.settings.updateSettings);

  const [staleThreshold, setStaleThreshold] = useState<number | null>(null);
  const [activeWindow, setActiveWindow] = useState<number | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setStaleThreshold(settings.staleThresholdDays);
      setActiveWindow(settings.activeWindowHours);
    }
  }, [settings]);

  const handleSave = async (key: string, value: number) => {
    if (!settings) return;

    let newStale = staleThreshold;
    let newWindow = activeWindow;

    if (key === "stale") {
      newStale = value;
      setStaleThreshold(value);
    } else {
      newWindow = value;
      setActiveWindow(value);
    }

    try {
      await updateSettings({
        installationId: settings.installationId,
        staleThresholdDays: newStale as number,
        activeWindowHours: newWindow as number,
      });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">System Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your GitHub integration, AI behavior, and team permissions.</p>
      </div>

      <div className="max-w-2xl grid gap-5">
        {/* GitHub Integration */}
        <Section
          icon={Github}
          title="GitHub Integration"
          description="Your connected GitHub App and repository access."
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                Installation ID
              </label>
              <div className="relative">
                <input
                  readOnly
                  value={settings ? String(settings.installationId) : ""}
                  placeholder="Loading..."
                  className="input font-mono bg-muted/30 pr-10"
                />
                {!settings && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2.5">
                <span className="pulse-dot" />
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  GitHub App connected and active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const installId = settings?.installationId;
                    const url = installId 
                      ? `https://github.com/settings/installations/${installId}`
                      : "https://github.com/apps/recon1912";
                    window.open(url, "_blank");
                  }}
                  className="btn-ghost text-xs flex items-center gap-1.5"
                >
                  Manage Repos
                  <ExternalLink size={11} />
                </button>
                <button
                  onClick={() => window.open("https://github.com/apps/recon1912", "_blank")}
                  className="btn-ghost text-xs flex items-center gap-1.5"
                >
                  Reinstall
                  <ExternalLink size={11} />
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* AI Configuration */}
        <Section
          icon={Zap}
          title="AI Configuration"
          description="Fine-tune automation thresholds for stale detection and conflict scanning."
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Stale threshold */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                Stale Branch Threshold
              </label>
              <div className="relative">
                <select
                  disabled={staleThreshold === null}
                  value={staleThreshold ?? 7}
                  onChange={(e) => handleSave("stale", parseInt(e.target.value))}
                  className="input appearance-none cursor-pointer"
                >
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days (Default)</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
                {savedKey === "stale" && (
                  <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                Branches inactive longer than this will be flagged.
              </p>
            </div>

            {/* Active window */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                Conflict Scan Window
              </label>
              <div className="relative">
                <select
                  disabled={activeWindow === null}
                  value={activeWindow ?? 48}
                  onChange={(e) => handleSave("window", parseInt(e.target.value))}
                  className="input appearance-none cursor-pointer"
                >
                  <option value={24}>24 Hours</option>
                  <option value={48}>48 Hours (Default)</option>
                  <option value={72}>72 Hours</option>
                  <option value={168}>7 Days</option>
                </select>
                {savedKey === "window" && (
                  <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">
                How far back to scan for overlapping file changes.
              </p>
            </div>
          </div>

          {/* Auto-save notice */}
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Check size={12} className="text-green-500" />
            Changes are saved automatically to the database.
          </div>
        </Section>

        {/* Security */}
        <Section
          icon={Shield}
          title="Security & Permissions"
          description="Manage team access and authentication settings."
        >
          <div className="flex items-center justify-between p-4 border border-dashed rounded-xl">
            <div className="flex items-center gap-2.5">
              <span className="pulse-dot" />
              <span className="text-sm font-medium">Organization Sync Active</span>
            </div>
            <button className="btn-ghost text-xs">
              Manage in Clerk
              <ExternalLink size={11} />
            </button>
          </div>
        </Section>
      </div>
    </DashboardLayout>
  );
}
