// UTF-8対応btoaポリフィル
(function() {
  if (typeof window === 'undefined' || !window.btoa) return;
  
  var _btoa = window.btoa;
  var _atob = window.atob;
  
  // グローバルbtoaを完全に置き換え
  window.btoa = function(input) {
    if (!input) return _btoa.call(this, input);
    
    // Latin1範囲チェック（0x00-0xFF）
    var hasNonLatin1 = false;
    for (var i = 0; i < input.length; i++) {
      if (input.charCodeAt(i) > 255) {
        hasNonLatin1 = true;
        break;
      }
    }
    
    // Latin1範囲内ならネイティブbtoaを使用
    if (!hasNonLatin1) {
      return _btoa.call(this, input);
    }
    
    // UTF-8エンコード
    var encoder = new TextEncoder();
    var utf8Bytes = encoder.encode(input);
    var binaryString = '';
    for (var i = 0; i < utf8Bytes.length; i++) {
      binaryString += String.fromCharCode(utf8Bytes[i]);
    }
    return _btoa.call(this, binaryString);
  };
  
  window.atob = function(input) {
    var binaryString = _atob.call(this, input);
    var bytes = new Uint8Array(binaryString.length);
    for (var i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    try {
      var decoder = new TextDecoder('utf-8', { fatal: true });
      return decoder.decode(bytes);
    } catch (e) {
      return binaryString;
    }
  };
  
  console.log('[btoa-polyfill] UTF-8 support enabled');
})();
