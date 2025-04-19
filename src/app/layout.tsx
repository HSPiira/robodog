import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { RootLayoutContent } from "@/components/layout/root-layout";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Robodog",
  description: "A modern web app for Robodog operations",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} font-sans bg-[#F5EBE1]`}>
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
