import { createBrowserClient } from "@supabase/ssr";

if (typeof window !== 'undefined') {
  const originalBtoa = window.btoa.bind(window);
  const originalAtob = window.atob.bind(window);
  
  window.btoa = function(str: string): string {
    try {
      // まず元のbtoaを試す
      return originalBtoa(str);
    } catch (e) {
      // Latin1範囲外の文字がある場合、UTF-8エンコードしてから再試行
      try {
        const utf8Bytes = new TextEncoder().encode(str);
        const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
        return originalBtoa(binaryString);
      } catch (innerError) {
        console.error('[v0] btoa encoding failed:', innerError, 'for string:', str);
        throw innerError;
      }
    }
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
  
  console.log('[v0] btoa/atob polyfill applied');
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
