"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, GitBranch, AlertTriangle, Settings, Calendar,
  LayoutDashboard, FileText, Bell, ChevronRight, BarChart2, Sparkles
} from "lucide-react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";

const NAV = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Activity Feed" },
  { href: "/dashboard/branches", icon: GitBranch, label: "Active Branches" },
  { href: "/dashboard/conflicts", icon: AlertTriangle, label: "Merge Conflicts" },
  { href: "/dashboard/standups", icon: Calendar, label: "Team Standups" },
  { href: "/dashboard/changelogs", icon: FileText, label: "Changelogs" },
  { href: "/dashboard/analytics", icon: BarChart2, label: "Analytics" },
  { href: "/dashboard/ai-assistant", icon: Sparkles, label: "AI Copilots" },
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

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card/60 backdrop-blur-xl flex flex-col sticky top-0 h-screen shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b">
          <Link href="/" className="flex items-center gap-2.5 group w-fit">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/30 group-hover:scale-105 transition-transform">
              <Activity size={15} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">Recon</span>
          </Link>
        </div>

        {/* Live indicator */}
        <div className="px-5 py-3 border-b">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/15">
            <span className="pulse-dot" />
            <span className="text-xs font-semibold text-green-600 dark:text-green-400">Live Stream Active</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3 mb-2">
            Workspace
          </p>
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
        <div className="p-3 border-t">
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
          <div className="flex items-center gap-2">
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
