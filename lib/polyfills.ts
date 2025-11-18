// UTF-8対応のbtoa/atobポリフィル
(function() {
  if (typeof window === 'undefined') return;

  const originalBtoa = window.btoa;
  const originalAtob = window.atob;

  window.btoa = function(str: string): string {
    try {
      return originalBtoa(str);
    } catch (e) {
      // Latin1範囲外の文字を含む場合、UTF-8として処理
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
})();
