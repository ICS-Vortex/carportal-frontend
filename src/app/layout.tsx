import type { Metadata } from "next";
import { Oswald, Rubik } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";

const display = Oswald({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"]
});

const rubik = Rubik({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
  title: "Carmain — сервіс автомобіля",
  description: "Публічний сервіс для власників авто: після входу — гараж, регламент ТО, журнал і нагадування."
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" data-scroll-behavior="smooth">
      <body className={`${display.variable} ${rubik.variable} antialiased`}>
        <div className="app-background" />
        <div className="app-grid" />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
