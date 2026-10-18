import type { Metadata, Viewport } from "next";
import { Chivo, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AssistantWidgetProvider } from "@/components/assistant/AssistantWidgetContext";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";

const chivo = Chivo({
  subsets: ["latin"],
  variable: "--font-chivo",
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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


