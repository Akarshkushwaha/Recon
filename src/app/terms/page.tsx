import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold tracking-tight mb-8">Terms of Service</h1>
        
        <div className="space-y-8 text-sm/relaxed text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">1. Description of Service</h2>
            <p>
              Recon is a developer tool that connects to your GitHub repositories to provide activity feeds, merge conflict detection, and team insights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">2. Acceptable Use</h2>
            <p>
              You must only connect repositories that you own or have explicit authorization to access. You may not use Recon for any malicious activity or to monitor repositories you do not have rights to.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">3. "As Is" Warranty</h2>
            <p>
              Recon is provided "as is" and "as available". We make no warranties, expressed or implied, regarding the reliability, accuracy, or uptime of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">4. Limitation of Liability</h2>
            <p>
              In no event shall Recon be liable for any direct, indirect, incidental, or consequential damages (including, but not limited to, loss of data, loss of business, or workflow interruptions) arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">5. Termination</h2>
            <p>
              We reserve the right to terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
