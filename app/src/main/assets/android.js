(function () {
  if (!window.AndroidBridge) return;

  window.saveBlob = async function (blob, name) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    AndroidBridge.saveBase64(btoa(binary), name, blob.type || 'application/octet-stream');
  };

  window.cargar = async function () {
    data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('mision-matematica-')) continue;
      try {
        const item = JSON.parse(localStorage.getItem(key));
        if (item) data[key.substring('mision-matematica-'.length)] = item;
      } catch (_) {}
    }
    $('estado').textContent = '● Datos guardados en este celular';
    $('estado').className = 'status online';
    const ids = Object.keys(data);
    $('sel').innerHTML = ids.map(id => `<option value="${esc(id)}">${esc(data[id].jugador || id)}</option>`).join('');
    if (!ids.length) { actual = null; render(); return; }
    if (!actual || !data[actual]) actual = ids[0];
    $('sel').value = actual;
    render();
  };

  window.setTimeout(cargar, 50);
})();
