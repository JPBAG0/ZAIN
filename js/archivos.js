/* Archivos del pedido: se conservan en este dispositivo y se comparten al pedirlo.
   No se suben a un servidor. El ZIP incluye los originales, sin convertirlos. */
(() => {
  "use strict";
  const memoria = new Map();
  let base;
  const abrir = () => {
    if (!base) base = new Promise((ok, mal) => {
      const req = indexedDB.open("zain-archivos", 1);
      req.onupgradeneeded = () => req.result.createObjectStore("pedidos", { keyPath: "id" });
      req.onsuccess = () => { req.result.onversionchange = () => req.result.close(); ok(req.result); };
      req.onerror = () => mal(req.error);
      req.onblocked = () => mal(new Error("El almacenamiento está ocupado."));
    });
    return base;
  };
  const guardar = async (id, archivos) => {
    const registro = { id, ...archivos };
    memoria.set(id, registro);
    try {
      const db = await abrir();
      await new Promise((ok, mal) => {
        const tx = db.transaction("pedidos", "readwrite");
        tx.objectStore("pedidos").put(registro);
        tx.oncomplete = ok;
        tx.onerror = tx.onabort = () => mal(tx.error);
      });
      return true;
    } catch (_) { return false; }
  };
  const obtener = async (id) => {
    if (memoria.has(id)) return memoria.get(id);
    try {
      const db = await abrir();
      return await new Promise((ok, mal) => {
        const req = db.transaction("pedidos").objectStore("pedidos").get(id);
        req.onsuccess = () => { if (req.result) memoria.set(id, req.result); ok(req.result || null); };
        req.onerror = () => mal(req.error);
      });
    } catch (_) { return null; }
  };
  const eliminar = async (ids) => {
    ids.forEach((id) => memoria.delete(id));
    try {
      const db = await abrir();
      await new Promise((ok, mal) => {
        const tx = db.transaction("pedidos", "readwrite");
        ids.forEach((id) => tx.objectStore("pedidos").delete(id));
        tx.oncomplete = ok;
        tx.onerror = tx.onabort = () => mal(tx.error);
      });
    } catch (_) { /* El pedido se puede quitar aunque no haya almacenamiento. */ }
  };
  const nombreSeguro = (s) => String(s || "archivo").replace(/[\\/\x00-\x1f]/g, "_").replace(/^\.+/, "").slice(0, 140) || "archivo";
  const preparar = async (pedido, texto) => {
    const files = [new File([texto], "pedido-zain.txt", { type: "text/plain" })];
    const faltan = [];
    let logos = 0, renders = 0;
    for (let i = 0; i < pedido.length; i++) {
      const item = pedido[i];
      const row = await obtener(item.id);
      const prefijo = String(i + 1).padStart(2, "0");
      if (row?.logo instanceof Blob) {
        files.push(new File([row.logo], `${prefijo}-logo-${nombreSeguro(row.logoNombre)}`, { type: row.logo.type || "application/octet-stream" }));
        logos++;
      } else if (item.tieneLogo || /archivo «/.test(item.logo || "")) faltan.push(item.nombre + ": logo original");
      for (const e of row?.extras || []) if (e.blob instanceof Blob) { files.push(new File([e.blob], `${prefijo}-${e.kind}-${nombreSeguro(e.nombre)}`, { type: e.blob.type || "application/octet-stream" })); logos++; }
      if (row?.render instanceof Blob) {
        files.push(new File([row.render], `${prefijo}-render.png`, { type: "image/png" }));
        renders++;
      } else if (item.tieneRender) faltan.push(item.nombre + ": render");
      else if (item.tieneRender == null && item.cm > 0 && /^data:image\/(jpeg|png);base64,/.test(item.mini || "")) {
        const response = await fetch(item.mini);
        const preview = await response.blob();
        files.push(new File([preview], `${prefijo}-vista-previa.${preview.type === "image/png" ? "png" : "jpg"}`, { type: preview.type }));
        renders++;
      }
    }
    return { files, texto, logos, renders, faltan };
  };
  // ZIP sin compresión: fotografías ya comprimidas, nombres UTF-8 y CRC-32.
  const tablaCRC = Uint32Array.from({ length: 256 }, (_, i) => {
    for (let k = 0; k < 8; k++) i = (i & 1) ? 0xedb88320 ^ (i >>> 1) : i >>> 1;
    return i >>> 0;
  });
  const crc32 = (bytes) => {
    let crc = 0xffffffff;
    for (const b of bytes) crc = tablaCRC[(crc ^ b) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  };
  const zip = async (files) => {
    const partes = [], centrales = [];
    let offset = 0, centralSize = 0;
    const now = new Date();
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const date = ((Math.max(1980, now.getFullYear()) - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const name = new TextEncoder().encode(nombreSeguro(file.name));
      const crc = crc32(bytes);
      const local = new Uint8Array(30 + name.length), l = new DataView(local.buffer);
      l.setUint32(0, 0x04034b50, true); l.setUint16(4, 20, true); l.setUint16(6, 0x800, true);
      l.setUint16(10, time, true); l.setUint16(12, date, true); l.setUint32(14, crc, true);
      l.setUint32(18, bytes.length, true); l.setUint32(22, bytes.length, true); l.setUint16(26, name.length, true);
      local.set(name, 30);
      partes.push(local, bytes);
      const central = new Uint8Array(46 + name.length), c = new DataView(central.buffer);
      c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x800, true);
      c.setUint16(12, time, true); c.setUint16(14, date, true); c.setUint32(16, crc, true);
      c.setUint32(20, bytes.length, true); c.setUint32(24, bytes.length, true); c.setUint16(28, name.length, true);
      c.setUint32(42, offset, true); central.set(name, 46);
      centrales.push(central); centralSize += central.length; offset += local.length + bytes.length;
    }
    const end = new Uint8Array(22), e = new DataView(end.buffer);
    e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
    e.setUint32(12, centralSize, true); e.setUint32(16, offset, true);
    return new Blob([...partes, ...centrales, end], { type: "application/zip" });
  };
  const puedeCompartir = (files) => {
    try { return !!navigator.share && !!navigator.canShare?.({ files }); } catch (_) { return false; }
  };
  const descargar = (blob, nombre) => {
    const url = URL.createObjectURL(blob), a = document.createElement("a");
    a.href = url; a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  };
  window.ZAINArchivos = { guardar, obtener, eliminar, preparar, zip, puedeCompartir, descargar };
})();
