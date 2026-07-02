"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, GitBranch, AlertTriangle, Settings, Calendar,
  LayoutDashboard, FileText, Bell, ChevronRight, BarChart2, Sparkles, Users, BrainCircuit, RefreshCw
} from "lucide-react";
import { Authenticated, Unauthenticated, AuthLoading, useMutation, useAction } from "convex/react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Activity Feed" },
  { href: "/dashboard/memory", icon: BrainCircuit, label: "Cognee Memory" },
  { href: "/dashboard/team", icon: Users, label: "Team Radar" },
  { href: "/dashboard/branches", icon: GitBranch, label: "Active Branches" },
  { href: "/dashboard/conflicts", icon: AlertTriangle, label: "Merge Conflicts" },
  { href: "/dashboard/standups", icon: Calendar, label: "Team Standups" },
  { href: "/dashboard/changelogs", icon: FileText, label: "Changelogs" },
  { href: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
];

function NavItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`nav-item ${isActive ? "nav-item-active" : ""}`}
    >
      <Icon size={16} />
      <span className="flex-1">{label}</span>
      {isActive && <ChevronRight size={14} className="opacity-60" />}
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const claimInstallation = useMutation(api.settings.claimInstallation);
  const syncAllRepos = useAction(api.githubSync.syncAllRepos);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncAllRepos();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (user) {
      const githubAccounts = (user.externalAccounts || [])
        .filter(a => a?.provider?.includes("github"))
        .map(a => a?.username)
        .filter(Boolean) as string[];
        
      if (githubAccounts.length > 0) {
        claimInstallation({ githubUsernames: githubAccounts }).catch(console.error);
      }
    }
  }, [user, claimInstallation]);

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border flex flex-col bg-card/50">
        {/* Brand */}
        <Link href="/" className="h-14 border-b border-border flex items-center px-6 gap-2.5 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
            R
          </div>
          <span className="font-bold text-lg tracking-tight">Recon</span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            Beta
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <NavItem key={item.href} {...item} />
          ))}

          <div className="section-divider my-4" />
          
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3 mb-2">
            Configuration
          </p>
          <NavItem href="/dashboard/settings" icon={Settings} label="Settings" />
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Authenticated>
            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors cursor-pointer group">
              <UserButton afterSignOutUrl="/" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user?.firstName || "User"}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </Authenticated>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 glass border-b px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary border border-border text-xs font-medium transition-colors disabled:opacity-50"
              title="Sync active GitHub commits, branches, issues, and PRs via Octokit"
            >
              <RefreshCw size={13} className={isSyncing ? "animate-spin text-primary" : "text-muted-foreground"} />
              <span>{isSyncing ? "Syncing Repos..." : "Sync GitHub Data"}</span>
            </button>
            <button className="btn-ghost p-2 rounded-lg">
              <Bell size={16} />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="p-8">
          <AuthLoading>
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Loading session...</p>
              </div>
            </div>
          </AuthLoading>

          <Authenticated>
            <div className="max-w-6xl mx-auto animate-fade-up">
              {children}
            </div>
          </Authenticated>

          <Unauthenticated>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mb-6">
                <AlertTriangle size={28} />
              </div>
              <h2 className="text-xl font-bold mb-2">Authentication required</h2>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                Please sign in to access your team's development dashboard.
              </p>
              <SignInButton mode="modal">
                <button className="btn-primary w-full">
                  Sign in to Dashboard
                </button>
              </SignInButton>
            </div>
          </Unauthenticated>
        </div>
      </main>
    </div>
  );
}
