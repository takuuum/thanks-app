// UTF-8対応btoaポリフィル - 最優先実行
(function() {
  if (typeof window === 'undefined') return;
  
  // オリジナルのbtoa/atobを保存
  var originalBtoa = window.btoa;
  var originalAtob = window.atob;
  
  // グローバルbtoaをUTF-8対応版に置き換え
  window.btoa = function(str) {
    try {
      // まずオリジナルのbtoaを試す
      return originalBtoa(str);
    } catch (e) {
      // エラーが発生した場合（非Latin1文字を含む場合）、UTF-8エンコード処理
      try {
        // TextEncoderでUTF-8バイト列に変換
        var encoder = new TextEncoder();
        var uint8array = encoder.encode(str);
        
        // バイト列を文字列に変換
        var binaryStr = '';
        for (var i = 0; i < uint8array.length; i++) {
          binaryStr += String.fromCharCode(uint8array[i]);
        }
        
        // 変換した文字列をBase64エンコード
        return originalBtoa(binaryStr);
      } catch (err) {
        console.error('[btoa-polyfill] Encoding failed:', err);
        throw err;
      }
    }
  };
  
  // atobもUTF-8対応版に置き換え
  window.atob = function(str) {
    var binaryStr = originalAtob(str);
    
    try {
      // バイト列に変換
      var bytes = new Uint8Array(binaryStr.length);
      for (var i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      
      // UTF-8デコード
      var decoder = new TextDecoder('utf-8', { fatal: true });
      return decoder.decode(bytes);
    } catch (e) {
      // UTF-8デコードに失敗した場合は元の文字列を返す
      return binaryStr;
    }
  };
  
  console.log('[btoa-polyfill] UTF-8 btoa/atob polyfill loaded');
})();
