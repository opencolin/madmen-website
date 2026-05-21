import type { Metadata } from "next";
import { Abril_Fatface, DM_Sans } from "next/font/google";
import "./globals.css";

const serif = Abril_Fatface({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Madmen.ai — 1960s ad poster generator",
  description:
    "Eight AI agents modeled on Sterling Cooper generate a Gemini-ready prompt for a Mad Men style advertising poster.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
