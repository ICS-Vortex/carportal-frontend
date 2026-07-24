import type { Metadata } from "next";
import { Manrope, Sora } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "Car Portal",
  description: "Особистий кабінет водія для обліку авто, ТО та нагадувань.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={`${sora.variable} ${manrope.variable} antialiased`}>
        <div className="app-background" />
        <div className="app-grid" />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
