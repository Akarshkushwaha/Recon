"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { Settings, Shield, Github, Zap } from "lucide-react";

const SettingsSection = ({ icon: Icon, title, description, children }: any) => (
  <div className="p-6 rounded-2xl border bg-card/50">
    <div className="flex items-start gap-4 mb-6">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    {children}
  </div>
);

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl grid gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your repository and AI configurations.</p>
        </div>

        <SettingsSection 
          icon={Github} 
          title="GitHub Integration" 
          description="Configure your GitHub App and repository settings."
        >
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Installation ID</label>
              <input 
                type="text" 
                readOnly 
                value="Auto-detected from webhook"
                className="w-full bg-muted/50 border rounded-xl px-4 py-2 text-sm font-mono"
              />
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
              <span className="text-sm">GitHub App is connected and active.</span>
              <button className="text-primary text-sm font-bold hover:underline">Reinstall</button>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection 
          icon={Zap} 
          title="AI Configuration" 
          description="Fine-tune your AI models and automation thresholds."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stale Branch Threshold</label>
              <select className="w-full bg-muted/50 border rounded-xl px-4 py-2 text-sm">
                <option>7 Days (Default)</option>
                <option>14 Days</option>
                <option>30 Days</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Active Window</label>
              <select className="w-full bg-muted/50 border rounded-xl px-4 py-2 text-sm">
                <option>48 Hours (Default)</option>
                <option>24 Hours</option>
                <option>72 Hours</option>
              </select>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection 
          icon={Shield} 
          title="Security & Permissions" 
          description="Manage who can access and modify Recon settings."
        >
          <div className="flex items-center justify-between p-4 border border-dashed rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium">Organization Sync Active</span>
            </div>
            <button className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
              Manage in Clerk
            </button>
          </div>
        </SettingsSection>
      </div>
    </DashboardLayout>
  );
}
