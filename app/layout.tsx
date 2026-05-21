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
  title: "Sterling Cooper — 1960s ad campaigns, on demand",
  description:
    "Madison Avenue, 1962. Tell Joan your brand. The creative floor drafts the campaign and she walks the poster to your office by close of business.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
