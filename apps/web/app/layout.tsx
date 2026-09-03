import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mahad | AI Product Engineering",
  description:
    "Intentionally over-engineered portfolio site showcasing deep AI Product Engineering, product design, and strategic decision-making capabilities.",
  keywords: [
    "AI Product Engineer",
    "Machine Learning",
    "RAG",
    "LangGraph",
    "Full Stack AI",
    "Product Design",
    "Mahad",
  ],
  authors: [{ name: "Mahad" }],
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
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="min-h-screen bg-white font-sans text-foreground antialiased selection:bg-foreground selection:text-white">
        <Header />
        <main className="min-h-[calc(100vh-160px)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
