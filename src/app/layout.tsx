import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";

// Single typeface across the whole UI, per the Figma spec: Bricolage Grotesque.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "VedaAI — AI Teacher's Toolkit",
  description: "Upload a question paper and an answer sheet to extract, map, and grade student answers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bricolage.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f2f2f2]">{children}</body>
    </html>
  );
}
