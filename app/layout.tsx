import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PosterCraft AI — Intelligent Ad Poster Designer",
  description:
    "Transform raw product shots into polished marketing posters with AI-aided copywriting and layout generation.",
  openGraph: {
    title: "PosterCraft AI",
    description:
      "Upload a product image and instantly produce campaign-ready ad posters.",
    url: "https://agentic-42e42efe.vercel.app",
    siteName: "PosterCraft AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PosterCraft AI — Ad Poster Designer",
    description: "Build launch-ready creative with intelligent layouts & copy.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50`}
      >
        {children}
      </body>
    </html>
  );
}
