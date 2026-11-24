import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AssistantWidgetProvider } from "@/components/assistant/AssistantWidgetContext";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";

const creato = localFont({
  src: [
    { path: "./fonts/CreatoDisplay-Thin.otf", weight: "100", style: "normal" },
    { path: "./fonts/CreatoDisplay-Light.otf", weight: "300", style: "normal" },
    { path: "./fonts/CreatoDisplay-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/CreatoDisplay-Medium.otf", weight: "500", style: "normal" },
    { path: "./fonts/CreatoDisplay-Bold.otf", weight: "700", style: "normal" },
    { path: "./fonts/CreatoDisplay-ExtraBold.otf", weight: "800", style: "normal" },
    { path: "./fonts/CreatoDisplay-Black.otf", weight: "900", style: "normal" },
    { path: "./fonts/CreatoDisplay-ThinItalic.otf", weight: "100", style: "italic" },
    { path: "./fonts/CreatoDisplay-LightItalic.otf", weight: "300", style: "italic" },
    { path: "./fonts/CreatoDisplay-RegularItalic.otf", weight: "400", style: "italic" },
    { path: "./fonts/CreatoDisplay-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "./fonts/CreatoDisplay-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "./fonts/CreatoDisplay-ExtraBoldItalic.otf", weight: "800", style: "italic" },
    { path: "./fonts/CreatoDisplay-BlackItalic.otf", weight: "900", style: "italic" },
  ],
  variable: "--font-creato",
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
      className={`${creato.variable} scroll-smooth`}
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
