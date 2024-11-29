import Script from "next/script";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "RATE MY STEAK",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="size-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased size-full`}
      >
        {children}
        <div id="ganalytics-container">
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-KQZSPEVRE8"
          />
          <Script id="google-analytics">
            {` window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-KQZSPEVRE8');`}
          </Script>
        </div>
      </body>
    </html>
  );
}
