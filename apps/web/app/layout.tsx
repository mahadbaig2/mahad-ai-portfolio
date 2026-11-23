import type { Metadata, Viewport } from "next";
import { Newsreader, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AssistantWidgetProvider } from "@/components/assistant/AssistantWidgetContext";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
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
      className={`${newsreader.variable} ${manrope.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-paper font-sans text-on-surface antialiased selection:bg-sage selection:text-primary"
      >
        <AssistantWidgetProvider>
          <Header />
          <main className="min-h-[calc(100vh-160px)] pt-20">{children}</main>
          <Footer />
          <AssistantWidget />
        </AssistantWidgetProvider>
      </body>
    </html>
  );
}
