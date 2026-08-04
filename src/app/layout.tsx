import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/convex-provider";
import { VendoRoot } from "../vendo/vendo-root";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Recon — Real-time Dev Awareness",
  description: "The real-time pulse of your development team. Detect conflicts, auto-generate standups, and supercharge PRs with AI.",
  keywords: ["developer awareness", "merge conflicts", "AI standups", "GitHub", "engineering"],
  authors: [{ name: "Recon Technologies" }],
  openGraph: {
    title: "Recon — Real-time Dev Awareness",
    description: "The real-time pulse of your development team.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ConvexClientProvider>
          <VendoRoot>
            {children}
          </VendoRoot>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
