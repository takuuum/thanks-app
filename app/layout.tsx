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
              
              var originalBtoa = window.btoa.bind(window);
              var originalAtob = window.atob.bind(window);
              
              window.btoa = function(str) {
                try {
                  return originalBtoa(str);
                } catch (e) {
                  try {
                    var utf8Bytes = new TextEncoder().encode(str);
                    var binaryString = Array.from(utf8Bytes, function(byte) {
                      return String.fromCharCode(byte);
                    }).join('');
                    return originalBtoa(binaryString);
                  } catch (innerError) {
                    console.error('[v0] btoa encoding failed:', innerError);
                    throw innerError;
                  }
                }
              };
              
              window.atob = function(str) {
                var decoded = originalAtob(str);
                
                try {
                  var bytes = new Uint8Array(decoded.split('').map(function(char) {
                    return char.charCodeAt(0);
                  }));
                  return new TextDecoder().decode(bytes);
                } catch (e) {
                  return decoded;
                }
              };
              
              console.log('[v0] btoa/atob polyfill loaded');
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
