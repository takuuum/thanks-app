import { createBrowserClient } from "@supabase/ssr";

if (typeof window !== 'undefined') {
  const originalBtoa = window.btoa;
  const originalAtob = window.atob;
  
  window.btoa = function(str: string): string {
    // Latin1範囲外の文字を検出（0-255の範囲外）
    const hasNonLatin1 = /[^\x00-\xFF]/.test(str);
    
    if (hasNonLatin1) {
      // UTF-8エンコードしてからBase64化
      const utf8Bytes = new TextEncoder().encode(str);
      const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
      return originalBtoa(binaryString);
    }
    
    return originalBtoa(str);
  };
  
  window.atob = function(str: string): string {
    const decoded = originalAtob(str);
    
    try {
      // UTF-8デコードを試みる
      const bytes = new Uint8Array(decoded.split('').map(char => char.charCodeAt(0)));
      return new TextDecoder().decode(bytes);
    } catch (e) {
      // デコードに失敗したら元の文字列を返す
      return decoded;
    }
  };
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
