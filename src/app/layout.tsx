import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Newsletter — Stay Ahead of the AI Curve",
    template: "%s — AI Newsletter",
  },
  description:
    "Get the latest AI news, trends and insights. Handpicked news snippets, tool recommendations and in-depth analysis — every week.",
  keywords: ["AI", "Artificial Intelligence", "Newsletter", "News", "Machine Learning"],
  openGraph: {
    title: "AI Newsletter",
    description: "Stay ahead of the AI curve — weekly AI news, tools and deep dives.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <Header />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
