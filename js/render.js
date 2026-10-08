/* ============================================================================
   ZAIN — motor de render (no necesitas editar este archivo)
   ----------------------------------------------------------------------------
   · tenir():    pinta la foto blanca de una prenda del color elegido conservando
                 sus pliegues (luz y sombra salen de la foto original).
   · estampar(): pone el logo sobre la prenda con el acabado de cada técnica:
                 bordado (puntadas y relieve), serigrafía (tinta mate con grano)
                 y DTF (color brillante con un ligero lustre). Las arrugas de la
                 tela también pasan por encima del logo.
   ============================================================================ */
(() => {
  "use strict";

  const imagenes = new Map();
  const cargar = (src) => {
    if (!imagenes.has(src)) {
      imagenes.set(
        src,
        new Promise((ok, mal) => {
          const im = new Image();
          im.decoding = "async";
          im.onload = () => ok(im);
          im.onerror = () => mal(new Error("No se pudo cargar " + src));
          im.src = src;
        }),
      );
    }
    return imagenes.get(src);
  };

  const lienzo = (w, h = w) => {
    const c = document.createElement("canvas");
    c.width = Math.round(w);
    c.height = Math.round(h);
    return c;
  };
  const ctx2 = (c) => c.getContext("2d", { willReadFrequently: true });

  const hexARgb = (hex) => {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  const luz = ([r, g, b]) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  /* --- mapa de sombras de cada foto: 1 = tela con luz normal, <1 = pliegue --- */
  const mapas = new Map();
  function mapaSombras(img, S) {
    const k = img.src + "@" + S;
    if (mapas.has(k)) return mapas.get(k);
    const c = lienzo(S);
    const g = ctx2(c);
    g.drawImage(img, 0, 0, S, S);
    const d = g.getImageData(0, 0, S, S);
    const p = d.data;
    // brillo de referencia: el percentil 80 de la tela (así un pliegue oscurece y un brillo aclara)
    const hist = new Uint32Array(256);
    let n = 0;
    for (let i = 0; i < p.length; i += 16) {
      if (p[i + 3] < 200) continue;
      hist[Math.round(0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2])]++;
      n++;
    }
    let acum = 0;
    let ref = 240;
    for (let v = 0; v < 256; v++) {
      acum += hist[v];
      if (acum >= n * 0.8) {
        ref = Math.max(v, 1);
        break;
      }
    }
    const s = new Float32Array(S * S);
    for (let i = 0, j = 0; i < p.length; i += 4, j++) {
      s[j] = (0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]) / ref;
    }
    const r = { s, alfa: d, ref };
    mapas.set(k, r);
    return r;
  }

  /* --- prenda del color elegido --- */
  const tenidas = new Map();
  function tenir(img, hex, S = 1000) {
    const k = img.src + "|" + hex + "|" + S;
    if (tenidas.has(k)) return tenidas.get(k);
    const c = lienzo(S);
    const g = ctx2(c);
    if (!hex || hex.toLowerCase() === "#ffffff") {
      g.drawImage(img, 0, 0, S, S); // «natural»: la foto tal cual
    } else {
      const { s, alfa } = mapaSombras(img, S);
      const rgb = hexARgb(hex);
      const L = luz(rgb);
      const oscuro = 1 - L; // los colores oscuros necesitan luz añadida para que se vean los pliegues
      const d = g.createImageData(S, S);
      const o = d.data;
      const a = alfa.data;
      for (let i = 0, j = 0; i < o.length; i += 4, j++) {
        const al = a[i + 3];
        if (!al) continue;
        const f = s[j];
        // sombra: multiplica (más marcada en colores oscuros); luz: sube un poco hacia blanco
        const somb = Math.max(0, 1 - (1 - Math.min(f, 1)) * (1 + oscuro * 1.6));
        const brillo = Math.max(0, f - 1) * 0.9;
        const levanta = oscuro * 48 * Math.max(0, f - 0.62);
        for (let c3 = 0; c3 < 3; c3++) {
          const base = rgb[c3] * somb + levanta;
          o[i + c3] = base + (255 - base) * brillo;
        }
        o[i + 3] = al;
      }
      g.putImageData(d, 0, 0);
    }
    tenidas.set(k, c);
    if (tenidas.size > 80) tenidas.delete(tenidas.keys().next().value);
    return c;
  }

  /* --- recorta los bordes transparentes de un logo --- */
  function recortar(c) {
    const g = ctx2(c);
    const { width: w, height: h } = c;
    const p = g.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (p[(y * w + x) * 4 + 3] > 8) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) return null;
    const r = lienzo(x1 - x0 + 1, y1 - y0 + 1);
    r.getContext("2d").drawImage(c, x0, y0, r.width, r.height, 0, 0, r.width, r.height);
    return r;
  }

  /* --- abre la imagen subida en un canvas (máx. 1400 px; los SVG se dibujan grandes) --- */
  async function abrirArchivo(archivo) {
    const url = URL.createObjectURL(archivo);
    try {
      const im = await new Promise((ok, mal) => {
        const i = new Image();
        i.onload = () => ok(i);
        i.onerror = () => mal(new Error("Esa imagen no se pudo abrir. Prueba con PNG o JPG."));
        i.src = url;
      });
      const esSvg = /svg/.test(archivo.type);
      const w0 = im.naturalWidth || 1200;
      const h0 = im.naturalHeight || 600;
      const escala = esSvg ? 1400 / Math.max(w0, h0) : Math.min(1, 1400 / Math.max(w0, h0));
      const c = lienzo(w0 * escala, h0 * escala);
      const g = ctx2(c);
      g.imageSmoothingQuality = "high";
      g.drawImage(im, 0, 0, c.width, c.height);
      return c;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  const aHex = (r, g, b) => "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
  const dist = (p, i, c) => {
    const dr = p[i] - c[0];
    const dg = p[i + 1] - c[1];
    const db = p[i + 2] - c[2];
    return Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11) * 1.7;
  };

  /* --- enfoque suave (para logos chicos que se agrandaron) --- */
  function enfocar(c, fuerza) {
    const g = ctx2(c);
    const { width: w, height: h } = c;
    const d = g.getImageData(0, 0, w, h);
    const p = d.data;
    const o = new Uint8ClampedArray(p);
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = (y * w + x) * 4;
        for (let k = 0; k < 3; k++) {
          const v = 5 * p[i + k] - p[i + k - 4] - p[i + k + 4] - p[i + k - w * 4] - p[i + k + w * 4];
          o[i + k] = p[i + k] + (v - p[i + k]) * fuerza;
        }
      }
    }
    d.data.set(o);
    g.putImageData(d, 0, 0);
  }

  /* =====================================================================
     ANÁLISIS DEL LOGO
     1. Si es chico, lo agranda y lo enfoca.
     2. Detecta el fondo (de cualquier color) mirando las orillas y lo quita
        con un relleno desde los bordes, con orilla suave (sin halo). En logos
        de líneas o letras también quita los huecos interiores (el centro de
        la A o la O); en logos tipo escudo los respeta.
     3. Recorta lo que sobra.
     4. Lee su paleta: cuántos colores tiene y si es una foto/degradado.
     5. En logos de colores planos «limpia» el ruido del JPG llevando cada
        pixel a su color de la paleta.
     ===================================================================== */
  function analizarLogo(original, quitarFondo) {
    const info = { fondo: null, fondoQuitado: false, agrandado: false, limpio: false, colores: [], nColores: 0, esFoto: false, brillo: 0.5, proporcion: 1, yaTransparente: false };
    let c = lienzo(original.width, original.height);
    ctx2(c).drawImage(original, 0, 0);

    // 1. agrandar si es chico
    const lado = Math.max(c.width, c.height);
    if (lado < 700) {
      const k = 900 / lado;
      const g2 = lienzo(c.width * k, c.height * k);
      const gg = ctx2(g2);
      gg.imageSmoothingQuality = "high";
      gg.drawImage(c, 0, 0, g2.width, g2.height);
      enfocar(g2, 0.35);
      c = g2;
      info.agrandado = true;
    }

    const g = ctx2(c);
    const W = c.width;
    const H = c.height;
    const d = g.getImageData(0, 0, W, H);
    const p = d.data;

    // 2. fondo: color de las orillas
    const orilla = [];
    const paso = Math.max(1, Math.floor((W + H) / 400));
    for (let x = 0; x < W; x += paso) orilla.push(x, (H - 1) * W + x);
    for (let y = 0; y < H; y += paso) orilla.push(y * W, y * W + W - 1);
    let transp = 0;
    const rs = [];
    const gs = [];
    const bs = [];
    for (const j of orilla) {
      const i = j * 4;
      if (p[i + 3] < 128) transp++;
      else (rs.push(p[i]), gs.push(p[i + 1]), bs.push(p[i + 2]));
    }
    const mediana = (a) => (a.sort((x, y) => x - y), a[a.length >> 1] || 0);
    if (transp > orilla.length * 0.3) info.yaTransparente = true;
    else {
      const bg = [mediana(rs), mediana(gs), mediana(bs)];
      let iguales = 0;
      for (const j of orilla) if (dist(p, j * 4, bg) < 40) iguales++;
      if (iguales > orilla.length * 0.62) info.fondo = bg;
    }

    if (quitarFondo && info.fondo) {
      const bg = info.fondo;
      const BAJO = 34;
      const ALTO = 92;
      const visto = new Uint8Array(W * H);
      const cola = new Int32Array(W * H);
      let ini = 0;
      let fin = 0;
      const sembrar = (j) => {
        if (visto[j]) return;
        visto[j] = 1;
        cola[fin++] = j;
      };
      for (let x = 0; x < W; x++) (sembrar(x), sembrar((H - 1) * W + x));
      for (let y = 0; y < H; y++) (sembrar(y * W), sembrar(y * W + W - 1));
      const quitar = (j) => {
        const i = j * 4;
        const dd = dist(p, i, bg);
        if (dd < BAJO) {
          p[i + 3] = 0;
          return true;
        }
        if (dd < ALTO) {
          // orilla: transparencia parcial y se le quita el color del fondo (sin halo)
          const a = (dd - BAJO) / (ALTO - BAJO);
          for (let k = 0; k < 3; k++) p[i + k] = Math.max(0, Math.min(255, (p[i + k] - bg[k] * (1 - a)) / a));
          p[i + 3] = Math.round(p[i + 3] * a);
        }
        return false;
      };
      while (ini < fin) {
        const j = cola[ini++];
        if (!quitar(j)) continue;
        const x = j % W;
        const y = (j / W) | 0;
        if (x > 0) sembrar(j - 1);
        if (x < W - 1) sembrar(j + 1);
        if (y > 0) sembrar(j - W);
        if (y < H - 1) sembrar(j + W);
      }
      // huecos interiores del mismo color del fondo (centros de letras) en logos de líneas
      let solido = 0;
      for (let i = 3; i < p.length; i += 4) if (p[i] > 128) solido++;
      if (solido < W * H * 0.45) {
        for (let i = 0; i < p.length; i += 4) {
          if (p[i + 3] < 128) continue;
          if (dist(p, i, bg) < BAJO * 0.8) p[i + 3] = 0;
        }
      }
      info.fondoQuitado = true;
    }

    // limpieza de transparencias: nada de «polvo» casi invisible
    for (let i = 3; i < p.length; i += 4) {
      if (p[i] < 18) p[i] = 0;
      else if (p[i] > 238) p[i] = 255;
    }

    // 4. paleta (cubetas de 5 bits por canal, luego se agrupan las cercanas)
    // solo cuentan los pixeles «de relleno» (iguales a sus vecinos): las orillas suavizadas
    // son mezclas de dos colores y no deben contarse como colores propios del logo
    const cub = new Map();
    let opacos = 0;
    let sumaL = 0;
    for (let i = 0; i < p.length; i += 4) {
      if (p[i + 3] < 200) continue;
      sumaL += 0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2];
      const j = i >> 2;
      const x = j % W;
      const y = (j / W) | 0;
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) continue;
      const rel = (v) => p[v + 3] > 200 && Math.abs(p[v] - p[i]) + Math.abs(p[v + 1] - p[i + 1]) + Math.abs(p[v + 2] - p[i + 2]) < 36;
      if (!(rel(i - 4) && rel(i + 4) && rel(i - W * 4) && rel(i + W * 4))) continue;
      opacos++;
      const k = ((p[i] >> 3) << 10) | ((p[i + 1] >> 3) << 5) | (p[i + 2] >> 3);
      const e = cub.get(k);
      if (e) (e.n++, (e.r += p[i]), (e.g += p[i + 1]), (e.b += p[i + 2]));
      else cub.set(k, { n: 1, r: p[i], g: p[i + 1], b: p[i + 2] });
    }
    let totalOpacos = 0;
    for (let i = 3; i < p.length; i += 4) if (p[i] >= 200) totalOpacos++;
    info.brillo = totalOpacos ? sumaL / totalOpacos / 255 : 0.5;
    // fotos y degradados llenan cientos de cubetas de color; un logo plano, muy pocas
    let cubetas = 0;
    for (const e of cub.values()) if (e.n > opacos * 0.0008) cubetas++;
    const grupos = [];
    [...cub.values()]
      .sort((a, b) => b.n - a.n)
      .forEach((e) => {
        const col = [e.r / e.n, e.g / e.n, e.b / e.n];
        const cerca = grupos.find((gr) => dist(col, 0, gr.c) < 52);
        if (cerca) {
          const t = cerca.n + e.n;
          cerca.c = cerca.c.map((v, k) => (v * cerca.n + col[k] * e.n) / t);
          cerca.n = t;
        } else grupos.push({ c: col, n: e.n });
      });
    grupos.sort((a, b) => b.n - a.n);
    const relevantes = grupos.filter((gr) => gr.n > opacos * 0.03);
    let cubre = 0;
    let necesarios = 0;
    for (const gr of grupos) {
      if (cubre >= opacos * 0.92) break;
      cubre += gr.n;
      necesarios++;
    }
    info.nColores = relevantes.length;
    info.esFoto = cubetas > 140 || necesarios > 8 || relevantes.length > 8 || opacos < totalOpacos * 0.15;
    info.colores = relevantes.slice(0, 6).map((gr) => aHex(...gr.c));

    // 5. limpiar ruido en logos de colores planos
    if (!info.esFoto && relevantes.length && relevantes.length <= 6) {
      const pal = relevantes.map((gr) => gr.c);
      for (let i = 0; i < p.length; i += 4) {
        if (!p[i + 3]) continue;
        let mejor = pal[0];
        let md = 1e9;
        for (const q of pal) {
          const dd = dist(p, i, q);
          if (dd < md) (md = dd), (mejor = q);
        }
        // solo el ruido cercano a un color se corrige; las orillas suavizadas se respetan
        if (md < 34) (p[i] = mejor[0]), (p[i + 1] = mejor[1]), (p[i + 2] = mejor[2]);
      }
      info.limpio = true;
    }
    g.putImageData(d, 0, 0);

    // 3. recortar
    const r = recortar(c);
    if (!r) throw new Error("La imagen quedó vacía. Desactiva «Quitar fondo» e inténtalo de nuevo.");
    info.proporcion = r.width / r.height;

    // fotos sin fondo que quitar: esquinas redondeadas y orilla suave, como un transfer impreso
    if (info.esFoto && !info.fondoQuitado && !info.yaTransparente) {
      const f = lienzo(r.width, r.height);
      const gf = f.getContext("2d");
      const rad = Math.min(r.width, r.height) * 0.06;
      gf.beginPath();
      gf.roundRect ? gf.roundRect(0, 0, r.width, r.height, rad) : gf.rect(0, 0, r.width, r.height);
      gf.clip();
      gf.drawImage(r, 0, 0);
      gf.globalCompositeOperation = "destination-in";
      const borde = Math.max(2, Math.min(r.width, r.height) * 0.012);
      gf.filter = `blur(${borde}px)`;
      gf.fillStyle = "#000";
      gf.beginPath();
      gf.roundRect ? gf.roundRect(borde, borde, r.width - borde * 2, r.height - borde * 2, rad) : gf.rect(borde, borde, r.width - borde * 2, r.height - borde * 2);
      gf.fill();
      return { logo: f, info };
    }
    return { logo: r, info };
  }

  /* --- logo de texto --- */
  const LETRAS = {
    ancha: { f: "900 160px Archivo, 'Arial Black', sans-serif", estira: "expanded", sep: 6, mayus: true },
    clasica: { f: "400 170px 'DM Serif Display', Georgia, serif", sep: 1, mayus: false },
    script: { f: "400 170px Pacifico, 'Brush Script MT', cursive", sep: 0, mayus: false },
  };
  async function logoDeTexto(texto, letra, color) {
    const L = LETRAS[letra] || LETRAS.ancha;
    try {
      await document.fonts.load(L.f, texto);
    } catch (e) {
      /* si la fuente no carga se usa la de respaldo */
    }
    const t = L.mayus ? texto.toUpperCase() : texto;
    const m = lienzo(10);
    const gm = m.getContext("2d");
    gm.font = L.f;
    if ("fontStretch" in gm && L.estira) gm.fontStretch = L.estira;
    if ("letterSpacing" in gm) gm.letterSpacing = L.sep + "px";
    const ancho = Math.ceil(gm.measureText(t).width) + 60;
    const c = lienzo(ancho, 300);
    const g = c.getContext("2d");
    g.font = L.f;
    if ("fontStretch" in g && L.estira) g.fontStretch = L.estira;
    if ("letterSpacing" in g) g.letterSpacing = L.sep + "px";
    g.fillStyle = color;
    g.textBaseline = "middle";
    g.fillText(t, 30, 150);
    return recortar(c);
  }

  /* --- logo ZAIN en vector, para las prendas de la portada --- */
  const RUTA_ZAIN = new Path2D(
    "M0 0H75V12H24.5L85 139V150H0V139H60.5L0 12Z M227 0H253V150H227Z M280 0H304V150H280ZM346 0H370V150H346ZM339.7 0H360L301 150H281Z",
  );
  const RUTA_A = new Path2D("M95 150L136 0H168L208 150H183L173.4 109H129L119.2 150ZM151.5 15L168.7 89H133.8Z");
  function logoZain(color) {
    const c = lienzo(740, 300);
    const g = c.getContext("2d");
    g.scale(2, 2);
    g.fillStyle = color;
    g.fill(RUTA_ZAIN);
    g.fill(RUTA_A, "evenodd");
    return c;
  }

  /* --- texturas --- */
  let _puntadas = null;
  function puntadas() {
    if (_puntadas) return _puntadas;
    const c = lienzo(8);
    const g = c.getContext("2d");
    g.fillStyle = "#808080";
    g.fillRect(0, 0, 8, 8);
    g.strokeStyle = "#ffffff";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(-2, 10);
    g.lineTo(10, -2);
    g.stroke();
    g.strokeStyle = "#2a2a2a";
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(2, 10);
    g.lineTo(10, 2);
    g.stroke();
    return (_puntadas = c);
  }
  let _grano = null;
  function grano() {
    if (_grano) return _grano;
    const c = lienzo(96);
    const g = c.getContext("2d");
    const d = g.createImageData(96, 96);
    for (let i = 0; i < d.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 70;
      d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
      d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    return (_grano = c);
  }

  /* --- logo sobre la prenda ---
     ctx     contexto destino (tamaño S×S, la prenda ya dibujada)
     img     foto original de la prenda (para las arrugas)
     logo    canvas del logo (ya recortado)
     o       { x, y, ancho, tecnica, S }  — x, y, ancho en píxeles de S */
  function estampar(ctx, img, logo, o) {
    const S = o.S || 1000;
    const esc = S / 1000;
    const w = o.ancho;
    const h = (w * logo.height) / logo.width;
    const x = o.x - w / 2;
    const y = o.y - h / 2;
    const capa = lienzo(S);
    const g = capa.getContext("2d");
    g.imageSmoothingQuality = "high";

    if (o.tecnica === "bordado") {
      // el bordado no reproduce detalle microscópico: se suaviza apenas
      g.filter = `blur(${0.5 * esc}px)`;
      g.drawImage(logo, x, y, w, h);
      g.filter = "none";
      // puntadas: textura diagonal recortada a la forma del logo
      const p = lienzo(S);
      const gp = p.getContext("2d");
      gp.fillStyle = gp.createPattern(puntadas(), "repeat");
      gp.save();
      gp.scale(esc * 0.9, esc * 0.9);
      gp.fillRect(0, 0, S / (esc * 0.9), S / (esc * 0.9));
      gp.restore();
      gp.globalCompositeOperation = "destination-in";
      gp.drawImage(capa, 0, 0);
      g.globalCompositeOperation = "overlay";
      g.globalAlpha = 0.55;
      g.drawImage(p, 0, 0);
      g.globalAlpha = 1;
    } else {
      g.drawImage(logo, x, y, w, h);
      if (o.tecnica === "serigrafia") {
        const p = lienzo(S);
        const gp = p.getContext("2d");
        gp.fillStyle = gp.createPattern(grano(), "repeat");
        gp.fillRect(0, 0, S, S);
        gp.globalCompositeOperation = "destination-in";
        gp.drawImage(capa, 0, 0);
        g.globalCompositeOperation = "overlay";
        g.globalAlpha = 0.18;
        g.drawImage(p, 0, 0);
        g.globalAlpha = 1;
      } else {
        // DTF: lustre suave de arriba hacia abajo
        const p = lienzo(S);
        const gp = p.getContext("2d");
        const gr = gp.createLinearGradient(0, y, 0, y + h);
        gr.addColorStop(0, "rgba(255,255,255,.22)");
        gr.addColorStop(0.5, "rgba(255,255,255,0)");
        gp.fillStyle = gr;
        gp.fillRect(x, y, w, h);
        gp.globalCompositeOperation = "destination-in";
        gp.drawImage(capa, 0, 0);
        g.drawImage(p, 0, 0);
      }
    }

    // arrugas de la tela encima del logo
    const { s } = mapaSombras(img, S);
    const x0 = Math.max(0, Math.floor(x) - 2);
    const y0 = Math.max(0, Math.floor(y) - 2);
    const x1 = Math.min(S, Math.ceil(x + w) + 2);
    const y1 = Math.min(S, Math.ceil(y + h) + 2);
    if (x1 > x0 && y1 > y0) {
      const d = g.getImageData(x0, y0, x1 - x0, y1 - y0);
      const p = d.data;
      const fuerza = o.tecnica === "dtf" ? 0.7 : 1;
      for (let yy = y0, i = 0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++, i += 4) {
          if (!p[i + 3]) continue;
          const f = Math.min(1.05, s[yy * S + xx]);
          const k = 1 - (1 - f) * 1.4 * fuerza;
          p[i] *= k;
          p[i + 1] *= k;
          p[i + 2] *= k;
        }
      }
      g.putImageData(d, x0, y0);
    }

    // relieve: sombra corta (más marcada en bordado)
    ctx.save();
    if (o.tecnica === "bordado") {
      ctx.shadowColor = "rgba(0,0,0,.45)";
      ctx.shadowBlur = 2.5 * esc;
      ctx.shadowOffsetY = 1.6 * esc;
    } else if (o.tecnica === "dtf") {
      ctx.shadowColor = "rgba(0,0,0,.18)";
      ctx.shadowBlur = 1 * esc;
      ctx.shadowOffsetY = 0.6 * esc;
    } else {
      ctx.globalAlpha = 0.96; // la tinta de serigrafía deja ver la trama de la tela
    }
    ctx.drawImage(capa, 0, 0);
    ctx.restore();
  }

  window.ZR = { cargar, tenir, estampar, abrirArchivo, analizarLogo, logoDeTexto, logoZain, lienzo, hexARgb, luz };
})();
