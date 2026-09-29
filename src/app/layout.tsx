import type { Metadata, Viewport } from "next";
import { Outfit, Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { WebVitalsReporter } from "@/components/telemetry/WebVitalsReporter";

// Variable fonts: OMIT `weight` parameter completely per Next.js requirements
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  preload: true,
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "StreamForge – Cinematic Video Streaming",
  description: "High-performance, dark-first streaming platform with adaptive HLS video, multi-profile watchlist, and parental controls.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#0d0d0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} ${notoDevanagari.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-[var(--font-ui)] selection:bg-[var(--color-accent-soft)] selection:text-[var(--color-accent-300)]">
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}
