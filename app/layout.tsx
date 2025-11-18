import type { Metadata } from "next";
import { Geist, Geist_Mono } from 'next/font/google';
import "./globals.css";
import { AuthGuard } from "@/components/auth-guard";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && window.btoa) {
                const _btoa = window.btoa;
                window.btoa = function(str) {
                  try {
                    return _btoa.call(this, str);
                  } catch (e) {
                    const encoder = new TextEncoder();
                    const data = encoder.encode(str);
                    let binary = '';
                    for (let i = 0; i < data.length; i++) {
                      binary += String.fromCharCode(data[i]);
                    }
                    return _btoa.call(this, binary);
                  }
                };
              }
            `,
          }}
        />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <AuthGuard>{children}</AuthGuard>
      </body>
    </html>
  );
}
