import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google';
import "@/lib/polyfills";
import "./globals.css";
import Script from 'next/script';

const geistSans = Geist({
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "thanks",
  description: "チームメンバー同士で感謝を送り合うサービス",
    generator: 'v0.app'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <Script id="btoa-polyfill" strategy="beforeInteractive">
          {`
            (function() {
              if (typeof window === 'undefined') return;
              var originalBtoa = window.btoa;
              var originalAtob = window.atob;
              window.btoa = function(str) {
                try {
                  return originalBtoa(str);
                } catch (e) {
                  var utf8Str = unescape(encodeURIComponent(str));
                  return originalBtoa(utf8Str);
                }
              };
              window.atob = function(str) {
                try {
                  var decoded = originalAtob(str);
                  return decodeURIComponent(escape(decoded));
                } catch (e) {
                  return originalAtob(str);
                }
              };
            })();
          `}
        </Script>
      </head>
      <body className={`${geistSans.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
