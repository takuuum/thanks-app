import { createBrowserClient } from "@supabase/ssr";

// UTF-8対応btoaポリフィルを確実に適用
if (typeof window !== 'undefined' && window.btoa) {
  const originalBtoa = window.btoa.bind(window);
  const originalAtob = window.atob.bind(window);
  
  window.btoa = function(str: string): string {
    try {
      return originalBtoa(str);
    } catch (e) {
      console.log('[v0] btoa fallback for non-Latin1 string:', str.substring(0, 50));
      const utf8Str = unescape(encodeURIComponent(str));
      return originalBtoa(utf8Str);
    }
  };
  
  window.atob = function(str: string): string {
    try {
      const decoded = originalAtob(str);
      return decodeURIComponent(escape(decoded));
    } catch (e) {
      return originalAtob(str);
    }
  };
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
