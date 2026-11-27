import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AssistantWidgetProvider } from "@/components/assistant/AssistantWidgetContext";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";

const chivo = localFont({
  src: "./fonts/chivo-latin.woff2",
  weight: "100 900",
  variable: "--font-chivo",
  display: "swap",
});

const hankenGrotesk = localFont({
  src: "./fonts/hanken-grotesk-latin.woff2",
  weight: "100 900",
  variable: "--font-hanken-grotesk",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "100 800",
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mirza Mahad Baig // AI Product Engineer",
  description:
    "Mirza Mahad Baig is an AI Product Engineer with nearly six years of product design and UI/UX experience, practical AI engineering expertise, and hands-on full-stack experience.",
  keywords: [
    "Mirza Mahad Baig",
    "AI Product Engineer",
    "Product Design",
    "Machine Learning",
    "RAG",
    "LangGraph",
    "Full Stack AI",
    "UI/UX",
  ],
  authors: [{ name: "Mirza Mahad Baig" }],
};

export const viewport: Viewport = {
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
      className={`${chivo.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-background font-sans text-on-surface antialiased selection:bg-tertiary-container selection:text-on-tertiary"
      >
        <AssistantWidgetProvider>
          <AnnouncementBar />
          <Header />
          <main className="min-h-[calc(100vh-160px)]">{children}</main>
          <Footer />
          <AssistantWidget />
        </AssistantWidgetProvider>
      </body>
    </html>
  );
}
