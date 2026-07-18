import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ServiceWorkerRegistration } from "@/app/register-sw";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { OfflineIndicator } from "@/components/layout/OfflineIndicator";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "AU Track — Smart CGPA Tracker for Anna University Students",
  description:
    "Upload your grade screenshot, get instant CGPA calculation, arrear tracking, semester breakdowns, and personalized academic insights. Built for Anna University students.",
  keywords: [
    "Anna University",
    "CGPA calculator",
    "GPA tracker",
    "grade tracking",
    "arrear tracker",
    "academic planner",
  ],
  authors: [{ name: "Santhosh V" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AU Track",
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", type: "image/svg+xml", sizes: "192x192" },
      { url: "/icon-512.svg", type: "image/svg+xml", sizes: "512x512" },
    ],
    apple: [{ url: "/icon-192.svg", sizes: "192x192" }],
    shortcut: ["/icon-192.svg"],
  },
  applicationName: "AU Track",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-navy-900 font-sans text-gray-100 antialiased">
        <ThemeProvider>
          <QueryProvider>
            <SupabaseProvider>
              <ToastProvider>
                <ServiceWorkerRegistration />
                <InstallPrompt />
                <OfflineIndicator />
                <div className="relative min-h-screen">
                  {/* Ambient gradient background */}
                  <div className="pointer-events-none fixed inset-0 z-0">
                    <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-electric-blue/10 blur-[120px]" />
                    <div className="absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full bg-royal-indigo/10 blur-[100px]" />
                  </div>
                  <div className="relative z-10">{children}</div>
                </div>
              </ToastProvider>
            </SupabaseProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
