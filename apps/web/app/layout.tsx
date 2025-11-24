import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";
import { Providers } from "./providers";

// Dynamically import SwiggyLayout with SSR disabled to avoid useContext errors
const SwiggyLayout = dynamic(
  () => import("./components/swiggy-layout").then((mod) => ({ default: mod.SwiggyLayout })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main>Loading...</main>
      </div>
    )
  }
);

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "TSG Logistics Aggregator",
  description:
    "End-to-end logistics orchestration for shippers, fleets, drivers, and vendors."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-gray-50 dark:bg-gray-900`}>
        <Providers>
          <SwiggyLayout>{children}</SwiggyLayout>
        </Providers>
      </body>
    </html>
  );
}

