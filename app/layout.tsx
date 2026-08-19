import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { lucidaGrande } from "@/fonts";

export const metadata: Metadata = {
  title: "Watch Together",
  description: "Watch videos in sync with friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lucidaGrande.variable}>
      <body className="h-dvh">
        {process.env.ACTIVATE_ANALYTICS === '1' && (
          <Script
            strategy='afterInteractive'
            src='https://umami.cherfaoui.dev/script.js'
            data-website-id='f0869fc8-4b69-456c-a09e-f685779acb64'
          />
        )}
        {children}
      </body>
    </html>
  );
}
