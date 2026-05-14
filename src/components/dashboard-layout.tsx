import React from "react";
import Link from "next/link";
import { 
  Activity, 
  GitBranch, 
  AlertTriangle, 
  Calendar, 
  Settings,
  PlusCircle,
  Loader2
} from "lucide-react";
import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import NewIssueModal from "@/components/new-issue-modal";

const SidebarItem = ({ icon: Icon, label, href, active }: any) => (
  <Link 
    href={href}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      active 
        ? "bg-primary text-primary-foreground" 
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AuthLoading>
        <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50 p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 tracking-tighter">Welcome to Recon</h2>
            <p className="text-muted-foreground mb-8">Please sign in to access your dashboard.</p>
            <div className="flex gap-4">
              <Link href="/" className="px-8 py-3 rounded-full font-bold border hover:bg-muted transition-colors">
                  Return Home
              </Link>
            </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card flex flex-col p-4">
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="text-primary-foreground" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">Recon</span>
          </div>

          <nav className="flex-1 space-y-1">
            <SidebarItem icon={Activity} label="Feed" href="/dashboard" active />
            <SidebarItem icon={AlertTriangle} label="Conflicts" href="/dashboard/conflicts" />
            <SidebarItem icon={GitBranch} label="Branches" href="/dashboard/branches" />
            <SidebarItem icon={Calendar} label="Standups" href="/dashboard/standups" />
          </nav>

          <div className="mt-auto pt-4 border-t space-y-4">
            <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Organization</span>
                <OrganizationSwitcher 
                  appearance={{
                    elements: {
                      organizationSwitcherTrigger: "text-foreground",
                    }
                  }}
                />
            </div>
            <SidebarItem icon={Settings} label="Settings" href="/dashboard/settings" />
            <div className="px-2 pt-2 flex items-center justify-between border-t border-border/50">
                <span className="text-sm font-medium">Account</span>
                <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <header className="h-16 border-b flex items-center justify-between px-8 bg-card/50 backdrop-blur-md sticky top-0 z-10">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              <PlusCircle size={18} />
              New Issue
            </button>
          </header>
          <div className="p-8 overflow-auto">
            {children}
          </div>
        </main>

        <NewIssueModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </Authenticated>
    </div>
  );
}
