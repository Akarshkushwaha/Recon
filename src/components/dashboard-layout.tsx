"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Activity, 
  GitBranch, 
  AlertTriangle, 
  Settings, 
  Calendar,
  LayoutDashboard
} from "lucide-react";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, UserButton, OrganizationSwitcher } from "@clerk/nextjs";

const NavItem = ({ href, icon: Icon, label }: any) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
        isActive 
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <aside className="w-72 border-r bg-card/50 backdrop-blur-xl flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-2 font-black text-2xl tracking-tighter hover:scale-105 transition-transform origin-left">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <Activity size={20} />
            </div>
            RECON
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Activity Feed" />
          <NavItem href="/dashboard/branches" icon={GitBranch} label="Active Branches" />
          <NavItem href="/dashboard/conflicts" icon={AlertTriangle} label="Merge Conflicts" />
          <NavItem href="/dashboard/standups" icon={Calendar} label="Team Standups" />
          <div className="pt-4 mt-4 border-t border-dashed px-4">
            <NavItem href="/dashboard/settings" icon={Settings} label="System Settings" />
          </div>
        </nav>

        <div className="p-4 mt-auto">
          <div className="p-4 rounded-2xl bg-muted/50 border border-dashed border-border flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <OrganizationSwitcher 
                  appearance={{
                    elements: {
                      rootBox: "w-full",
                      organizationSwitcherTrigger: "w-full flex justify-between p-2 rounded-xl border bg-card hover:bg-muted"
                    }
                  }}
                />
             </div>
             <div className="flex items-center gap-3 px-2">
                <UserButton afterSignOutUrl="/" />
                <div className="flex flex-col">
                  <span className="text-xs font-black tracking-tight">CONNECTED</span>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Active Session</span>
                </div>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <AuthLoading>
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </AuthLoading>

        <Authenticated>
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </Authenticated>

        <Unauthenticated>
          <div className="flex flex-col items-center justify-center h-full text-center max-w-sm mx-auto">
             <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center text-muted-foreground mb-6">
                <AlertTriangle size={32} />
             </div>
             <h2 className="text-2xl font-bold mb-2">Welcome to Recon</h2>
             <p className="text-muted-foreground mb-8">Please sign in to access your team's development dashboard.</p>
             <SignInButton mode="modal">
               <button className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-xl shadow-primary/20">
                 Sign In to Dashboard
               </button>
             </SignInButton>
          </div>
        </Unauthenticated>
      </main>
    </div>
  );
}
