import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-sm/relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. What We Collect</h2>
            <p>
              When you use Recon, we collect:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Account Information:</strong> Your email address and GitHub username (handled via Clerk).</li>
              <li><strong>GitHub Metadata:</strong> When you install our GitHub App, we store metadata about your connected repositories. This includes branch names, commit messages, commit authors, pull request titles, and issue states.</li>
              <li><strong>File Paths:</strong> We read the names/paths of files changed in a commit to auto-label PRs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. What We Do NOT Collect</h2>
            <p>
              <strong>We do not read or store your source code.</strong> Recon only tracks metadata (who pushed, when they pushed, and commit messages).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Data</h2>
            <p>
              Your data is exclusively used to power your Recon dashboard—displaying activity feeds, flagging stale branches, and providing team insights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Third-Party Services</h2>
            <p>
              We do not sell your data. We share necessary data with trusted infrastructure providers to operate the service:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Clerk:</strong> For secure user authentication.</li>
              <li><strong>Convex:</strong> For database hosting and real-time backend synchronization.</li>
              <li><strong>Vercel:</strong> For application hosting.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Deletion</h2>
            <p>
              You can revoke Recon's access at any time by uninstalling the Recon GitHub App from your GitHub settings. This will instantly stop all incoming webhooks and data syncing.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
