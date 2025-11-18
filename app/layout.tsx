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
(function() {
  if (typeof window === 'undefined') return;
  
  var _btoa = window.btoa;
  var _atob = window.atob;
  
  // Base64エンコード用の文字テーブル
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  
  function utf8Btoa(input) {
    var str = String(input);
    var output = '';
    
    // UTF-8エンコード
    var utf8 = unescape(encodeURIComponent(str));
    
    for (var i = 0; i < utf8.length; i += 3) {
      var a = utf8.charCodeAt(i);
      var b = i + 1 < utf8.length ? utf8.charCodeAt(i + 1) : Number.NaN;
      var c = i + 2 < utf8.length ? utf8.charCodeAt(i + 2) : Number.NaN;
      
      var bitmap = (a << 16) | (b << 8) | c;
      
      output += chars.charAt((bitmap >> 18) & 63);
      output += chars.charAt((bitmap >> 12) & 63);
      output += chars.charAt(isNaN(b) ? 64 : (bitmap >> 6) & 63);
      output += chars.charAt(isNaN(c) ? 64 : bitmap & 63);
    }
    
    return output;
  }
  
  window.btoa = function(str) {
    try {
      // まず元のbtoaを試す
      return _btoa(str);
    } catch (e) {
      // 失敗したらUTF-8対応版を使用
      try {
        return utf8Btoa(str);
      } catch (err) {
        console.error('[btoa] Encoding failed:', err);
        return '';
      }
    }
  };
  
  window.atob = function(str) {
    try {
      var decoded = _atob(str);
      // UTF-8デコードを試みる
      try {
        return decodeURIComponent(escape(decoded));
      } catch (e) {
        return decoded;
      }
    } catch (err) {
      console.error('[atob] Decoding failed:', err);
      return '';
    }
  };
})();
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
