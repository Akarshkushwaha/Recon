"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard-layout";
import { Settings, Github, Zap, Shield, Loader2, Check, ExternalLink, MessageSquare } from "lucide-react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";

function Section({ icon: Icon, title, description, children }: any) {
  return (
    <div className="dashboard-card">
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

  // Webhooks & notification toggles
  const [slackUrl, setSlackUrl] = useState<string>("");
  const [discordUrl, setDiscordUrl] = useState<string>("");
  const [notifyOnConflicts, setNotifyOnConflicts] = useState<boolean>(true);

  const [notifyStaleBranches, setNotifyStaleBranches] = useState<boolean>(true);

  const [isSavingWebhooks, setIsSavingWebhooks] = useState(false);
  const [webhooksSavedSuccessfully, setWebhooksSavedSuccessfully] = useState(false);
  const linkInstallationId = useAction(api.settings.linkInstallationId);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const installId = params.get("installation_id");
    if (installId) {
      linkInstallationId({ githubInstallId: parseInt(installId) })
        .then(() => {
          // Clean up URL without refreshing
          window.history.replaceState({}, '', window.location.pathname);
        })
        .catch(console.error);
    }
  }, [linkInstallationId]);

  useEffect(() => {
    if (settings) {
      setStaleThreshold(settings.staleThresholdDays);
      setActiveWindow(settings.activeWindowHours);
      setSlackUrl(settings.slackWebhookUrl || "");
      setDiscordUrl(settings.discordWebhookUrl || "");
      setNotifyOnConflicts(settings.notifyOnConflicts ?? true);

      setNotifyStaleBranches(settings.notifyStaleBranches ?? true);
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
        slackWebhookUrl: slackUrl,
        discordWebhookUrl: discordUrl,
        notifyOnConflicts,

        notifyStaleBranches,
      });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveWebhooks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSavingWebhooks(true);
    try {
      await updateSettings({
        installationId: settings.installationId,
        staleThresholdDays: staleThreshold ?? 7,
        activeWindowHours: activeWindow ?? 48,
        slackWebhookUrl: slackUrl,
        discordWebhookUrl: discordUrl,
        notifyOnConflicts,

        notifyStaleBranches,
      });
      setWebhooksSavedSuccessfully(true);
      setTimeout(() => setWebhooksSavedSuccessfully(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingWebhooks(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">System Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your GitHub integration, AI behavior, team webhooks, and permissions.</p>
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
                  placeholder={settings === undefined ? "Loading..." : "No installation connected"}
                  className="input font-mono bg-muted/30 pr-10"
                />
                {settings === undefined && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>

            {settings ? (
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
                      const installId = settings.installationId;
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
            ) : settings === null ? (
              <div className="flex items-center justify-between p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    No GitHub App Connected
                  </span>
                </div>
                <button
                  onClick={() => window.open("https://github.com/apps/recon1912", "_blank")}
                  className="btn-primary text-xs px-3 h-8 flex items-center gap-1.5"
                >
                  Install GitHub App
                  <ExternalLink size={11} />
                </button>
              </div>
            ) : null}

            {/* URL Linking State */}
            {(() => {
              const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
              const installId = params.get("installation_id");
              if (!settings && installId) {
                return (
                  <div className="mt-4 p-4 border border-border/50 rounded-xl bg-muted/10 flex items-center justify-center gap-3">
                    <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    <p className="text-sm font-medium">Verifying GitHub Organization Access...</p>
                  </div>
                );
              }
              return null;
            })()}
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

          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Check size={12} className="text-green-500" />
            Changes are saved automatically to the database.
          </div>
        </Section>

        {/* Webhooks & Integrations */}
        <Section
          icon={MessageSquare}
          title="Team Integrations"
          description="Send conflict alerts directly to Slack or Discord."
        >
          <form onSubmit={handleSaveWebhooks} className="space-y-5">
            {/* Slack URL */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                Slack Incoming Webhook URL
              </label>
              <input
                type="url"
                value={slackUrl}
                onChange={(e) => setSlackUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"
                className="input font-mono text-xs"
              />
            </div>

            {/* Discord URL */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-2">
                Discord Webhook URL
              </label>
              <input
                type="url"
                value={discordUrl}
                onChange={(e) => setDiscordUrl(e.target.value)}
                placeholder="https://discord.com/api/webhooks/000000000000000000/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                className="input font-mono text-xs"
              />
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                Granular Alert Settings
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="notifyOnConflicts"
                  checked={notifyOnConflicts}
                  onChange={(e) => setNotifyOnConflicts(e.target.checked)}
                  className="rounded border-border text-primary bg-muted focus:ring-primary focus:ring-2 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="notifyOnConflicts" className="text-sm font-semibold select-none cursor-pointer">
                  Notify on Overlapping Merge Conflicts
                </label>
              </div>


              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="notifyStaleBranches"
                  checked={notifyStaleBranches}
                  onChange={(e) => setNotifyStaleBranches(e.target.checked)}
                  className="rounded border-border text-primary bg-muted focus:ring-primary focus:ring-2 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="notifyStaleBranches" className="text-sm font-semibold select-none cursor-pointer">
                  Notify on Stale Development Branches
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="submit"
                disabled={isSavingWebhooks || !settings}
                className="btn-primary px-6"
              >
                {isSavingWebhooks ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : webhooksSavedSuccessfully ? (
                  <>
                    <Check size={16} />
                    Integrations Saved!
                  </>
                ) : (
                  "Save Integrations"
                )}
              </button>

              <div className="text-xs text-muted-foreground">
                Set up webhooks to enable proactive workspace channels.
              </div>
            </div>
          </form>
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
