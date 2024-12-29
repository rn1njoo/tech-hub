import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tech Blog Archive",
  description: "기업 기술 블로그 아카이브 - 최신 기술 트렌드와 인사이트",
  keywords: ["기술 블로그", "개발 블로그", "기술 아카이브", "개발자 블로그"],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "Tech Blog Archive",
    description: "기업 기술 블로그 아카이브 - 최신 기술 트렌드와 인사이트",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
