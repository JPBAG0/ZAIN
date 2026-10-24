/* ============================================================================
   ZAIN — lógica de la página (portada, catálogo, personalizador y pedido)
   Los datos (productos, colores, WhatsApp…) viven en js/config.js.
   ============================================================================ */
(async () => {
  "use strict";
  await window.ZAINCatalogoListo;
  const {normalizarGeometria} = await import("./logo-medidas.js?v=1");
  const C = window.ZAIN;
  const A = window.ZAINArchivos;
  const P = window.ZAINPedidos;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const cm = (n) => (Math.round(n * 10) / 10).toFixed(1) + " cm";
  const compatHash = (s) => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0).toString(16); };
  const prod = (id) => C.productos.find((p) => p.id === id || p.compatHash === compatHash(id)) || C.productosHistoricos?.find((p) => p.id === id || p.compatHash === compatHash(id));
  const familias = C.productos.filter((p, i, all) => !p.familia || all.findIndex(x => x.familia === p.familia) === i);
  const variantes = (p) => p.familia ? C.productos.filter(x => x.familia === p.familia) : [p];
  const nombreColor = (c) => c.nombre;
  const tallasPedido = (p, counts) => Object.fromEntries(p.tallas.filter(t => counts[t] > 0).map(t => [t, Number(counts[t])]));
  const color = (id) => C.colores.find((c) => c.id === id || c.compatHash === compatHash(id));
  const tecnica = (id) => C.tecnicas.find((t) => t.id === id);
  const minimo = (p) => p.minimoPiezas || 0;
  const pasoCantidad = (p) => p.pasoPiezas || 1;
  const cantidadValida = (p, n) => n >= Math.max(1, minimo(p)) && (n - minimo(p)) % pasoCantidad(p) === 0;
  const reglaCantidad = (p) => {
    const min = minimo(p), paso = pasoCantidad(p);
    if (!min) return C.minimoPedido > 1 ? `Mínimo ${C.minimoPedido} piezas por pedido; mezcla modelos, tallas y colores.` : "Cantidad y condiciones a confirmar al cotizar.";
    if (min <= 1 && paso <= 1) return C.minimoPedido > 1 ? `Mínimo ${C.minimoPedido} piezas por pedido; mezcla modelos, tallas y colores.` : "Desde 1 pieza por modelo y color.";
    return `Mínimo ${min} ${min === 1 ? "pieza" : "piezas"} por modelo y color${paso > 1 ? `, en incrementos de ${paso}` : ""}.`;
  };
  // Las combinaciones con foto propia (gorras trucker) se muestran tal cual, sin teñir.
  const fotoDe = (p, idColor) => p.fotosColor?.[idColor] || p.foto;
  // color de la tela bajo el logo: en el lateral de las trucker es la malla, no el frente
  const fondoLogo = (z, idColor) => (z?.superficie === "malla" && color(idColor).hexMalla) || color(idColor).hex;
  const tono = (c) => `--c:${c.hex}${c.hex2 ? `;--c2:${c.hex2}` : ""}`;
  const prendaTenida = (p, img, idColor, S) => ZR.tenir(img, p.fotosColor?.[idColor] ? null : color(idColor).hex, S, p.fotoColor ? color(p.fotoColor).hex : null, p.acabadosFijos || null);
  const tablaMedidas = (p) => !p.tablaTallas ? "" : `<details class="producto__tabla"><summary>Guía de tallas · medidas en cm</summary><table><caption>Prenda extendida; ancho plano, no contorno corporal</caption><thead><tr><th>Talla</th><th>Ancho</th><th>Largo</th></tr></thead><tbody>${Object.entries(p.tablaTallas).map(([t,v]) => `<tr><th>${esc(t)}</th><td>${v.ancho}</td><td>${v.largo}</td></tr>`).join("")}</tbody></table>${p.tolerancia?`<small>Tolerancia: ancho ±${esc(p.tolerancia.ancho)} cm; largo ±${esc(p.tolerancia.largo)} cm.</small>`:""}</details>`;
  const varianteSelector = (p, id, attr = "") => {
    const opciones = variantes(p);
    if (opciones.length < 2) return "";
    const grupo = id || "silueta-catalogo-" + p.familia;
    return `<fieldset class="siluetas producto__variante" ${id ? `id="${esc(id)}"` : ""} aria-label="Silueta de ${esc(p.nombreFamilia || p.nombre)}"><legend>Silueta</legend><div class="siluetas__opciones">${opciones.map(x => `<label class="siluetas__opcion"><input class="siluetas__radio" type="radio" name="${esc(grupo)}" value="${esc(x.id)}" ${attr}${x.id === p.id ? " checked" : ""}><span class="siluetas__boton"><span>${esc(x.silueta)}</span><span class="siluetas__marca" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m4 8 2.5 2.5L12 5"/></svg></span></span></label>`).join("")}</div></fieldset>`;
  };
  // Los controles se reconstruyen al cambiar de prenda; conservar el foco permite seguir con flechas.
  const enfocarSilueta = (contenedor, id) => $$(".siluetas__radio", contenedor).find(x => x.value === id)?.focus({ preventScroll: true });
  const medidasTexto = (p) => {
    const d = p.dimensiones;
    return d ? [`Largo de la base: ${d.largoBase} cm`, `Altura: ${d.altura} cm`, d.fuelle && `Fuelle: ${d.fuelle} cm`, d.alturaConAsas && `Altura con asas: ${d.alturaConAsas} cm`].filter(Boolean).join(" · ") : p.medidas || "";
  };
  const fichaProducto = (p, compacto = false) => (compacto ? "" : "<p class=\"producto__nota\">SKU ZAIN: " + esc(p.sku) + "</p>") + (p.especificaciones ? "<p class=\"producto__nota\">" + esc(p.especificaciones) + "</p>" : "") + (p.prendaCatalogo ? `<div class="producto__datos"><b>${esc(p.silueta)}</b><span>${esc([p.tejido,p.gramaje?`${p.gramaje} g/m²`:null].filter(Boolean).join(" · "))}</span><span>${esc(p.composicion)}${Object.entries(p.composicionColor||{}).map(([id,comp])=>`; ${esc(C.colores.find(c=>c.id===id)?.nombre||"Variante de color")}: ${esc(comp)}`).join("")}</span></div><p class="producto__disponibilidad">${esc(p.disponibilidad)}</p><p class="producto__nota">Imagen ilustrativa. ${compacto ? "" : "Color y acabado se confirman al cotizar."}</p>${compacto ? "" : `<p class="producto__nota">${esc(p.tecnicasNota)}</p>`}${tablaMedidas(p)}` : p.medidas ? `<div class="producto__medidas"><b class="num">${esc(p.medidas)}</b><small>${esc(medidasTexto(p))}</small></div>
    <p class="producto__disponibilidad">${esc(p.disponibilidad)}</p>${minimo(p) ? `<p class="producto__nota">${esc(reglaCantidad(p))}</p>` : ""}${p.aplicacionesNota ? `<p class="producto__nota">${esc(p.aplicacionesNota)}</p>` : ""}` : "");
  const wa = (texto) => (C.whatsapp ? `https://wa.me/${C.whatsapp}?text=${encodeURIComponent(texto)}` : "#contacto");
  const almacen = {
    leer(k, d) {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : d;
      } catch (e) {
        return d;
      }
    },
    guardar(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
        return true;
      } catch (e) {
        return false;
      }
    },
  };

  let tToast = 0;
  const toast = (msg) => {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("on");
    clearTimeout(tToast);
    tToast = setTimeout(() => t.classList.remove("on"), 2600);
  };

  /* ---------------------------------------------------------------- datos */
  $("#datos").innerHTML = [
    ["Técnicas", "Bordado · Serigrafía · DTF"],
    ["Pedidos", C.minimoTexto || "Se confirman al cotizar"],
    ["Entrega", C.diasEntrega],
    ["Render", "Al instante, aquí mismo"],
  ]
    .map(([a, b]) => `<li><span>${esc(a)}</span><b>${esc(b)}</b></li>`)
    .join("");
  $("#pEntrega").textContent = C.diasEntrega;
  // la portada nombra solo lo que hoy está en el catálogo (se activa y oculta desde Gestión)
  const productosLede = (C.categoriasCatalogo || []).flatMap((c) => String(c).toLocaleLowerCase("es-MX").split(/\s+y\s+/));
  if (productosLede.length > 1) {
    const lista = productosLede.slice(0, -1).join(", ") + " y " + productosLede.at(-1);
    $("#ledeProductos").textContent = lista.charAt(0).toLocaleUpperCase("es-MX") + lista.slice(1);
  }
  $("#anio").textContent = "© " + new Date().getFullYear();

  $("#preguntasLista").innerHTML = C.preguntas
    .map(
      (q) => `<details class="pregunta"><summary>${esc(q.p)}<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></summary><p>${esc(q.r)}</p></details>`,
    )
    .join("");

  // cada técnica se revela con su propio oficio: el bordado se cose, el DTF se despega
  // y la serigrafía se imprime en puntos de semitono (js/trama.js)
  const EXTRA_TECNICA = {
    bordado: `<svg class="puntada" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden="true"><defs><mask id="mPuntada"><rect class="puntada__mascara" x="16" y="16" width="368" height="268" rx="8" pathLength="1" /></mask></defs><rect class="puntada__hilo" x="16" y="16" width="368" height="268" rx="8" mask="url(#mPuntada)" /></svg>`,
    dtf: `<span class="pelicula" aria-hidden="true"></span>`,
  };
  $("#tecnicasLista").innerHTML = C.tecnicas
    .map(
      (t, i) => `<article class="tecnica tecnica--${esc(t.id)}${i % 2 ? " tecnica--inv" : ""}">
        <figure><img src="${esc(t.foto)}" alt="Detalle de ${esc(t.nombre.toLowerCase())}" loading="lazy" width="1400" height="1050" />${EXTRA_TECNICA[t.id] || ""}</figure>
        <div class="tecnica__txt">
          <h3>${esc(t.nombre)}</h3>
          <p>${esc(t.corto)}</p>
          <dl>
            <div><dt>Ideal para</dt><dd>${esc(t.ideal)}</dd></div>
            <div><dt>Acabado</dt><dd>${esc(t.detalle)}</dd></div>
          </dl>
        </div>
      </article>`,
    )
    .join("");

  const saludo = `Hola ${C.marca}, quiero información para un pedido con mi logo.`;
  // 525662923967 → +52 56 6292 3967
  const telefono = (n) => {
    const d = String(n).replace(/\D/g, "");
    return d.length === 12 && d.startsWith("52") ? `+52 ${d.slice(2, 4)} ${d.slice(4, 8)} ${d.slice(8)}` : "+" + d;
  };
  const piezaDatos = [
    C.ciudad && `<div><span>Taller</span><b>${esc(C.ciudad)}</b></div>`,
    C.whatsapp && `<div><span>WhatsApp</span><a class="num" href="${esc(wa(saludo))}" target="_blank" rel="noopener">${esc(telefono(C.whatsapp))}</a></div>`,
    C.correo && `<div><span>Correo</span><a href="mailto:${esc(C.correo)}">${esc(C.correo)}</a></div>`,
    C.horario && `<div><span>Horario</span><b>${esc(C.horario)}</b></div>`,
    C.instagram && `<div><span>Instagram</span><a href="${esc(C.instagram)}" target="_blank" rel="noopener">Síguenos</a></div>`,
  ];
  $("#pieDatos").innerHTML = piezaDatos.filter(Boolean).join("");
  // botón principal de la portada: quien llega de un anuncio solo quiere preguntar precio
  const ctaPortada = $("#ctaPortada");
  if (C.whatsapp) ctaPortada.href = wa(`Hola ${C.marca}, quiero cotizar uniformes con mi logo.`);
  else { ctaPortada.removeAttribute("target"); ctaPortada.href = "#contacto"; }
  if (C.minimoTexto) $("#portadaNota").textContent = C.minimoTexto + " · Entrega en " + C.diasEntrega + ".";
  // precios «desde» por categoría (calculados con costos y margen; ver CLAUDE.md)
  const precios = (C.preciosDesde || []).filter((x) => x.precio > 0 && (C.categoriasCatalogo || []).includes(x.categoria));
  if (precios.length) {
    $("#preciosDesde").innerHTML = `<ul>${precios.map((x) => `<li><span>${esc(x.categoria)} desde</span><b class="num">$${x.precio.toLocaleString("es-MX")}</b></li>`).join("")}</ul><p>${esc(C.preciosLeyenda || "")}</p>`;
    $("#preciosDesde").hidden = false;
  }
  ["#ctaPie", "#flotante", "#ctaEmpresas"].forEach((s) => {
    const a = $(s);
    a.href = wa(saludo);
    if (C.whatsapp) {
      a.target = "_blank";
      a.rel = "noopener";
    }
  });

  /* ------------------------------------------------------------- barra */
  const barra = $("#barra");
  let yPrev = scrollY;
  const alScroll = () => {
    const y = scrollY;
    barra.classList.toggle("baja", y > 24);
    // se esconde al bajar y regresa en cuanto subes un poco
    if (Math.abs(y - yPrev) > 6) {
      barra.classList.toggle("oculta", y > yPrev && y > 480 && !document.documentElement.classList.contains("sin-scroll"));
      yPrev = y;
    }
  };
  addEventListener("scroll", alScroll, { passive: true });
  alScroll();

  /* =====================================================================
     PORTADA: prendas sobre un arco (Arc Carousel de Scrolltide, adaptado)
     Cada prenda se coloca con UNA transformación: se gira alrededor de un
     círculo grande cuyo centro queda abajo, fuera de la escena, y se empuja
     por el radio; posición en la curva e inclinación salen de la misma
     operación. Arrastrar mueve el arco bajo el dedo; al soltar, un resorte
     lo acomoda en la prenda más cercana.
     ===================================================================== */
  if (!C.productos.length) {
    $("#catTitulo").textContent="Catálogo";
    $("#catDescripcion").textContent=C.catalogoNoDisponible?"No pudimos actualizar el catálogo. Intenta recargar o escríbenos para consultar disponibilidad.":"Estamos actualizando la disponibilidad. Escríbenos para cotizar.";
    $("#rejilla").replaceChildren();$("#personaliza").hidden=true;$("#escena").hidden=true;return;
  }
  if (C.catalogoRespaldo) $("#catRespaldo").hidden = false;
  const MUESTRAS = C.muestrasPortada.filter(m => prod(m.p)?.activo !== false && color(m.c));

  const escena = $("#escena");
  const N = MUESTRAS.length;
  const piezas = MUESTRAS.map((m, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.className = "pieza";
    d.setAttribute("aria-label", `${prod(m.p).nombre} en ${color(m.c).nombre.toLowerCase()}`);
    const cv = document.createElement("canvas");
    cv.width = cv.height = 640;
    d.appendChild(cv);
    escena.appendChild(d);
    d.addEventListener("click", () => {
      if (huboArrastre) return;
      const o = envolver(i - pos);
      if (Math.abs(o) < 0.5) abrirEnTaller(m);
      else irA(i);
    });
    return { el: d, cv, m, listo: false };
  });

  const pintarMuestra = async (pz) => {
    const p = prod(pz.m.p);
    const col = color(pz.m.c);
    const img = await ZR.cargar(fotoDe(p, pz.m.c));
    const S = 640;
    const t = ZR.lienzo(S);
    const g = t.getContext("2d");
    g.drawImage(prendaTenida(p, img, pz.m.c, S), 0, 0);
    const zona = p.zonas.find((z) => z.id === pz.m.z) || p.zonas[0];
    const tinta = ZR.luz(ZR.hexARgb(fondoLogo(zona, pz.m.c))) > 0.55 ? "#141416" : "#f4f4f2";
    const k = S / 1000;
    ZR.estampar(g, img, ZR.logoZain(tinta), { x: zona.x * k, y: zona.y * k, ancho: pz.m.cm * p.pxPorCm * k, tecnica: pz.m.t, S, sombraLocal: !!p.fotosColor, giro: zona.giro, sesgo: zona.sesgo, inclina: zona.inclina, compresion: zona.compresion, textura: zona.textura });
    // gorras y bolsas llenan su foto: se encogen para que guarden proporción con la ropa
    const e = pz.m.e || 1;
    const d = pz.cv.getContext("2d");
    d.clearRect(0, 0, S, S);
    d.drawImage(t, (S * (1 - e)) / 2, S * (1 - e), S * e, S * e);
    pz.listo = true;
    pz.el.classList.add("lista");
  };
  // la del frente primero; las demás cuando el navegador esté libre
  pintarMuestra(piezas[0]).then(() => {
    const resto = piezas.slice(1);
    const siguiente = () => {
      const pz = resto.shift();
      if (!pz) return;
      pintarMuestra(pz).then(() => ("requestIdleCallback" in window ? requestIdleCallback(siguiente) : setTimeout(siguiente, 30)));
    };
    siguiente();
  });

  let G = {};
  const medir = () => {
    const r = escena.getBoundingClientRect();
    const W = r.width;
    const H = r.height;
    const movil = innerWidth < 900;
    const alto = movil ? Math.min(H * 0.84, W * 0.8) : Math.min(H * 0.64, W * 0.7);
    G = movil
      ? { cx: W * 0.5, base: H * 0.98, R: W * 1.6, paso: 17, contra: 0.6, sIn: 0.5, sLejos: 0.32, alto }
      : { cx: W * 0.5, base: H * 0.97, R: W * 1.1, paso: 19, contra: 0.6, sIn: 0.52, sLejos: 0.34, alto };
    piezas.forEach((p) => (p.el.style.height = p.el.style.width = G.alto.toFixed(0) + "px"));
  };

  let pos = reducido ? 0 : -1.2;
  let meta = 0;
  let vel = 0;
  let arrastrando = false;
  let actual = 0;
  const envolver = (o) => {
    o = ((o % N) + N) % N;
    return o > N / 2 ? o - N : o;
  };
  const dibujarArco = () => {
    escena.style.setProperty("--corre", pos.toFixed(3));
    for (let i = 0; i < N; i++) {
      const v = piezas[i].el;
      const o = envolver(i - pos);
      const d = Math.abs(o);
      const foco = Math.max(0, 1 - d);
      const s = d <= 1 ? G.sIn + (1 - G.sIn) * foco : Math.max(0.15, G.sIn - (G.sIn - G.sLejos) * (d - 1));
      const ang = -o * G.paso;
      const op = Math.max(0, Math.min(1, 2.6 - d));
      v.style.transform = `translate3d(${G.cx.toFixed(1)}px, ${(G.base - G.R).toFixed(1)}px, 0) rotate(${ang.toFixed(3)}deg) translateY(${G.R.toFixed(1)}px) rotate(${(-ang * G.contra).toFixed(3)}deg) scale(${s.toFixed(4)}) translate(-50%, -100%)`;
      v.style.opacity = op.toFixed(3);
      v.style.zIndex = String(100 - Math.round(d * 10));
      v.style.visibility = op < 0.01 ? "hidden" : "visible";
      v.tabIndex = d < 0.5 ? 0 : -1;
      v.classList.toggle("centro", d < 0.5);
    }
  };
  let raf = 0;
  let tPrev = 0;
  const paso = (t) => {
    const dt = Math.min(0.032, (t - tPrev) / 1000 || 0.016);
    tPrev = t;
    if (!arrastrando) {
      const k = 110;
      const c = 2 * Math.sqrt(k) * 0.66;
      vel += ((meta - pos) * k - vel * c) * dt;
      pos += vel * dt;
      if (Math.abs(meta - pos) < 0.0005 && Math.abs(vel) < 0.002) {
        pos = meta;
        vel = 0;
        dibujarArco();
        raf = 0;
        return;
      }
    }
    dibujarArco();
    raf = requestAnimationFrame(paso);
  };
  const mover = () => {
    if (reducido) {
      pos = meta;
      dibujarArco();
      return;
    }
    if (!raf) {
      tPrev = performance.now();
      raf = requestAnimationFrame(paso);
    }
  };

  let tFicha = 0;
  const ficha = (m, inst) => {
    const p = prod(m.p);
    const z = p.zonas.find((x) => x.id === m.z) || p.zonas[0];
    const poner = () => {
      $("#fPrenda").textContent = p.nombre;
      $("#fColor").textContent = color(m.c).nombre;
      $("#fTecnica").textContent = `${tecnica(m.t).nombre} · ${z.nombre.toLowerCase()}`;
      $("#fMedida").textContent = cm(m.cm);
      $("#ficha").classList.remove("cambia");
    };
    clearTimeout(tFicha);
    if (inst || reducido) return poner();
    $("#ficha").classList.add("cambia");
    tFicha = setTimeout(poner, 260);
  };
  const irA = (i) => {
    const o = envolver(i - meta);
    meta += o;
    actual = ((Math.round(meta) % N) + N) % N;
    ficha(MUESTRAS[actual]);
    mover();
    reiniciarAvance();
  };
  $("#fIr").addEventListener("click", () => abrirEnTaller(MUESTRAS[actual]));

  // arrastre: solo si el gesto es más horizontal que vertical (el scroll sigue funcionando)
  let gesto = null;
  let huboArrastre = false;
  escena.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return;
    gesto = { x: e.clientX, y: e.clientY, desde: pos, id: e.pointerId, movio: false };
    huboArrastre = false;
  });
  escena.addEventListener("pointermove", (e) => {
    if (!gesto || gesto.id !== e.pointerId) return;
    const dx = e.clientX - gesto.x;
    const dy = e.clientY - gesto.y;
    if (!gesto.movio) {
      if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(dy) * 1.2) {
        if (Math.abs(dy) > 12) gesto = null;
        return;
      }
      gesto.movio = true;
      arrastrando = true;
      huboArrastre = true;
      escena.classList.add("arrastrando");
      try {
        escena.setPointerCapture(e.pointerId);
      } catch (er) {
        /* nada */
      }
      pararAvance();
    }
    pos = gesto.desde - dx / (escena.clientWidth * 0.28);
    vel = 0;
    mover();
  });
  const soltar = (e) => {
    if (!gesto || gesto.id !== e.pointerId) return;
    const movio = gesto.movio;
    gesto = null;
    if (!movio) return;
    arrastrando = false;
    escena.classList.remove("arrastrando");
    meta = Math.round(pos);
    irA(((meta % N) + N) % N);
    setTimeout(() => (huboArrastre = false), 60);
  };
  escena.addEventListener("pointerup", soltar);
  escena.addEventListener("pointercancel", soltar);
  escena.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") (irA(actual + 1), e.preventDefault());
    if (e.key === "ArrowLeft") (irA(actual - 1), e.preventDefault());
  });

  // avance automático (se pausa fuera de pantalla, al arrastrar y con el cursor encima)
  let tAvance = 0;
  let enPantalla = true;
  let encima = false;
  const pararAvance = () => clearTimeout(tAvance);
  const reiniciarAvance = () => {
    pararAvance();
    if (reducido || !enPantalla || encima || document.hidden) return;
    tAvance = setTimeout(() => irA(actual + 1), 4200);
  };
  escena.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") (encima = true), pararAvance();
  });
  escena.addEventListener("pointerleave", () => ((encima = false), reiniciarAvance()));
  new IntersectionObserver(([en]) => {
    enPantalla = en.isIntersecting;
    reiniciarAvance();
  }).observe(escena);
  document.addEventListener("visibilitychange", reiniciarAvance);

  medir();
  dibujarArco();
  ficha(MUESTRAS[0], true);
  if (!reducido) setTimeout(mover, 200);
  reiniciarAvance();
  let tMedir = 0;
  addEventListener("resize", () => {
    clearTimeout(tMedir);
    tMedir = setTimeout(() => (medir(), dibujarArco()), 120);
  });

  /* =====================================================================
     CATÁLOGO
     ===================================================================== */
  const categorias = ["Todo", ...C.categoriasCatalogo];
  let filtro = location.hash === "#bolsas" ? "Bolsas" : "Todo";
  const bolsas = C.productos.filter(p=>p.grupo==="bolsas");
  const grupoBolsas = C.grupos.bolsas;
  function pintarCatalogo() {
    $$("#rejilla [data-categoria-titulo]").forEach(h=>h.hidden=filtro!=="Todo");
    $("#catTitulo").textContent=filtro==="Todo"?"Catálogo":filtro;
    $("#catDescripcion").textContent=filtro==="Bolsas"?grupoBolsas.aviso:"Elige tus productos, colores y cantidades. Personaliza tu selección con tu logo. Consulta disponibilidad.";
    // en «Todos» las bolsas se agrupan: solo la principal y la tarjeta para ver los demás modelos
    $$("#rejilla .mini").forEach(art=>art.hidden=filtro!=="Todo"?art.dataset.cat!==filtro:art.hasAttribute("data-bolsa-extra"));
    $$("#rejilla [data-abrir-bolsas]").forEach(b=>b.hidden=filtro!=="Todo");
    $$("#rejilla [data-categoria-grupo]").forEach(grupo=>grupo.hidden=filtro!=="Todo"&&grupo.dataset.categoriaGrupo!==filtro);
    $$(".filtro").forEach(x=>{x.classList.toggle("on",x.dataset.cat===filtro);x.setAttribute("aria-selected",String(x.dataset.cat===filtro));});
  }
  const abrirBolsas=()=>{
    filtro="Bolsas";history.replaceState(null,"","#bolsas");pintarCatalogo();
    $("#catalogo").scrollIntoView({behavior:reducido?"auto":"smooth"});$("#catTitulo").focus({preventScroll:true});
  };
  addEventListener("hashchange",()=>{
    if(location.hash==="#bolsas"){filtro="Bolsas";pintarCatalogo();$("#catalogo").scrollIntoView({behavior:reducido?"auto":"smooth"});}
    else if(location.hash==="#catalogo"){filtro="Todo";pintarCatalogo();}
  });
  $("#filtros").innerHTML=categorias.map(c=>'<button type="button" role="tab" class="filtro'+(c===filtro?' on':'')+'" aria-selected="'+(c===filtro)+'" data-cat="'+esc(c)+'">'+esc(c==="Todo"?"Todos":c)+'</button>').join("");
  $("#filtros").addEventListener("click",e=>{
    const b=e.target.closest("[data-cat]");if(!b)return;
    filtro=b.dataset.cat;history.replaceState(null,"",filtro==="Bolsas"?"#bolsas":"#catalogo");pintarCatalogo();
    // con los filtros fijos arriba, al cambiar de categoría se vuelve al inicio de la rejilla
    const rej=$("#rejilla").getBoundingClientRect(), alto=$("#filtros").getBoundingClientRect().bottom;
    if(rej.top<alto) scrollTo({top:scrollY+rej.top-alto-12,behavior:reducido?"auto":"smooth"});
    const barraF=$("#filtros");barraF.scrollTo({left:b.offsetLeft-(barraF.clientWidth-b.offsetWidth)/2,behavior:reducido?"auto":"smooth"});
  });

  // tarjeta compacta de la rejilla: foto, nombre, siluetas y colores; lo demás vive en la hoja de detalle
  const mini = (p) => {
    const nombre = p.nombreFamilia || p.nombre, v = variantes(p), n = p.colores.length;
    const sub = [v.length > 1 ? v.map((x) => x.silueta).join(" y ") : "", `${n} ${n === 1 ? "color" : "colores"}`].filter(Boolean).join(" · ");
    return `<article class="mini" data-id="${esc(p.id)}" data-cat="${esc(p.categoria)}" data-color="${esc(p.colores[0])}">
    <div class="mini__foto"><canvas width="560" height="560" role="img" aria-label="${esc(nombre)}${p.imagenIA ? "; imagen ilustrativa de la prenda sin persona" : ""}"></canvas></div>
    <div class="mini__txt"><span class="mini__cat">${esc(p.categoria)}</span><h4 class="mini__nombre"><button type="button" class="mini__abrir" data-ver aria-haspopup="dialog">${esc(nombre)}</button></h4>
    <p class="mini__sub">${esc(sub)}</p>
    <div class="mini__puntos" aria-hidden="true">${p.colores.slice(0, 6).map(color).map((c) => `<i style="${tono(c)}"></i>`).join("")}${n > 6 ? `<span>+${n - 6}</span>` : ""}</div></div>
    <button type="button" class="mini__mas" data-agregar aria-label="Agregar ${esc(nombre)} al pedido" title="Agregar al pedido"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
  </article>`;
  };
  const tarjeta = (p) => `<article class="producto${p.prendaCatalogo ? " producto--catalogo" : ""}" data-id="${esc(p.id)}" data-cat="${esc(p.categoria)}">
    <div class="producto__foto"><canvas width="840" height="840" aria-label="${esc(p.nombre)}${p.imagenIA ? "; imagen ilustrativa de la prenda sin persona" : ""}" role="img"></canvas>
      ${p.fotoModelo ? `<img class="producto__modelo" src="${esc(p.fotoModelo)}" alt="${esc(p.nombre)} · foto de referencia" loading="lazy" width="1000" height="1000" hidden /><button type="button" class="producto__flecha producto__flecha--antes" data-galeria="-1" aria-label="Imagen anterior de ${esc(p.nombreFamilia || p.nombre)}">‹</button><button type="button" class="producto__flecha producto__flecha--despues" data-galeria="1" aria-label="Imagen siguiente de ${esc(p.nombreFamilia || p.nombre)}">›</button>` : ""}<span class="producto__origen">${p.fotoModelo ? "Vista personalizable · 1 / 2" : "Vista personalizable"}</span><button type="button" class="producto__mas" data-agregar aria-label="Agregar ${esc(p.nombreFamilia || p.nombre)} al pedido" title="Agregar al pedido"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></div>
    <div class="producto__contenido"><div class="producto__txt"><h3>${esc(p.nombreFamilia || p.nombre)}</h3></div>
    ${varianteSelector(p, "", "data-variante")}
    <div class="producto__paleta"><div class="producto__colores" role="radiogroup" aria-label="Color de ${esc(p.nombreFamilia || p.nombre)}">${p.colores.map(color).map((c,i) => `<button type="button" role="radio" class="punto${i ? "" : " on"}" style="${tono(c)}" data-color="${c.id}" aria-checked="${!i}" aria-label="${esc(nombreColor(c))}" title="${esc(nombreColor(c))}"></button>`).join("")}</div><p class="producto__tono" aria-live="polite">Color elegido: ${esc(nombreColor(color(p.colores[0])))}</p></div>
    <ul class="producto__tec" aria-label="Técnicas disponibles">${p.tecnicas.map(t => `<li>${esc(tecnica(t).nombre)}</li>`).join("")}</ul>
    <details class="producto__detalles"><summary><span class="producto__ver">Ver detalles</span><span class="producto__ocultar">Ocultar detalles</span><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5"/></svg></summary><div class="producto__ficha"><p>${esc(p.descripcion)}</p>${fichaProducto(p)}</div></details>
    <div class="producto__pie"><button type="button" class="btn btn--linea btn--chico" data-agregar>Agregar rápido</button><button type="button" class="btn btn--tinta btn--chico" data-personalizar>Personalizar con tu logo</button></div></div></article>`;
  const principalBolsas = familias.find((p) => p.id === grupoBolsas?.productoInicial) || familias.find((p) => p.grupo === "bolsas");
  const extrasBolsas = familias.filter((p) => p.grupo === "bolsas" && p !== principalBolsas).length;
  const miniGrupo = (p) => p.grupo === "bolsas" && p !== principalBolsas ? mini(p).replace("<article ", "<article data-bolsa-extra ") : mini(p);
  const verBolsas = extrasBolsas ? `<button type="button" class="mini-grupo" data-abrir-bolsas><span class="mini-grupo__n num">+${extrasBolsas}</span><span class="mini-grupo__txt">modelos más</span><span class="mini-grupo__ver">Ver todas las bolsas</span></button>` : "";
  $("#rejilla").innerHTML = categorias.slice(1).map((cat,i) => {const prendas=familias.filter(p=>p.categoria===cat);return prendas.length?`<section class="rejilla__grupo" data-categoria-grupo="${esc(cat)}"><h3 class="rejilla__categoria" id="categoria-${i}" data-categoria-titulo="${esc(cat)}">${esc(cat)}</h3><div class="rejilla__productos" data-cantidad="${prendas.length}">${prendas.map(miniGrupo).join("")}${prendas.includes(principalBolsas) ? verBolsas : ""}</div></section>`:'';}).join("");


  const mostrarImagen = (art, index) => {
    const cv = $("canvas", art), photo = $(".producto__modelo", art);
    if (!photo) return;
    const second = index === 1;
    cv.hidden = second; photo.hidden = !second;
    art.dataset.imagen = second ? "1" : "0";
    $(".producto__origen", art).textContent = second ? "Foto de referencia · 2 / 2" : "Vista personalizable · 1 / 2";
  };
  const pintarTarjeta = async (art, idColor) => {
    const p = prod(art.dataset.id);
    art.dataset.color = idColor;
    const cv = $("canvas", art);
    const img = await ZR.cargar(fotoDe(p, idColor));
    if (art.dataset.id !== p.id || art.dataset.color && art.dataset.color !== idColor) return;
    const g = cv.getContext("2d");
    g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(prendaTenida(p, img, idColor, cv.width), 0, 0);
    mostrarImagen(art, Number(art.dataset.imagen) || 0);
    if (art.classList.contains("lista")) {
      cv.classList.remove("cambia");
      void cv.offsetWidth;
      cv.classList.add("cambia");
    }
    $(".producto__foto", art).style.setProperty("--c", color(idColor).hex);
    $(".producto__tono", art).textContent = "Color elegido: " + nombreColor(color(idColor));
    art.dataset.color = idColor;
    art.classList.add("lista");
  };
  const pintarMini = async (art) => {
    const p = prod(art.dataset.id), idColor = art.dataset.color || p.colores[0];
    const img = await ZR.cargar(fotoDe(p, idColor));
    if (art.dataset.id !== p.id || art.dataset.color !== idColor) return;
    const cv = $("canvas", art), g = cv.getContext("2d");
    g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(prendaTenida(p, img, idColor, cv.width), 0, 0);
    art.classList.add("lista");
  };
  const ioTarjetas = new IntersectionObserver(
    (ents) =>
      ents.forEach((en) => {
        if (!en.isIntersecting) return;
        ioTarjetas.unobserve(en.target);
        pintarMini(en.target);
      }),
    { rootMargin: "300px" },
  );
  $$("#rejilla .mini").forEach((a) => ioTarjetas.observe(a));

  /* hoja de detalle: la ficha completa del producto (silueta, colores, técnicas y especificaciones) */
  const hojaEl = $("#hoja"), hojaCuerpo = $("#hojaCuerpo");
  let hojaMini = null, hojaHistoria = false, alVolverHoja = null;
  function abrirHoja(m) {
    const p = prod(m.dataset.id);
    const holder = document.createElement("div"); holder.innerHTML = tarjeta(p);
    const art = holder.firstElementChild, elegido = m.dataset.color || p.colores[0];
    hojaCuerpo.replaceChildren(art);
    $$(".punto[data-color]", art).forEach((x) => { x.classList.toggle("on", x.dataset.color === elegido); x.setAttribute("aria-checked", x.dataset.color === elegido); });
    pintarTarjeta(art, elegido);
    $("#hojaTitulo").textContent = p.categoria;
    hojaMini = m;
    hojaEl.classList.add("abierto");
    hojaEl.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("sin-scroll");
    hojaCuerpo.scrollTop = 0;
    // el botón «atrás» del celular cierra la hoja en vez de salir de la página
    // sin restaurar scroll: regresar en el historial no debe mover el catálogo
    try { history.scrollRestoration = "manual"; history.pushState({ zainHoja: 1 }, ""); hojaHistoria = true; } catch { hojaHistoria = false; }
    setTimeout(() => $(".pedido__x", hojaEl).focus(), 50);
  }
  // la compacta adopta la silueta y el color que se eligieron en la hoja
  const sincronizarMini = () => {
    const art = $(".producto", hojaCuerpo);
    if (!hojaMini || !art || !art.dataset.color) return;
    if (hojaMini.dataset.id === art.dataset.id && hojaMini.dataset.color === art.dataset.color) return;
    hojaMini.dataset.id = art.dataset.id; hojaMini.dataset.color = art.dataset.color;
    pintarMini(hojaMini);
  };
  // la promesa espera a que el navegador regrese en el historial antes de mover la página
  function cerrarHoja({ foco = true } = {}) {
    if (!hojaEl.classList.contains("abierto")) return Promise.resolve();
    sincronizarMini();
    hojaEl.classList.remove("abierto");
    hojaEl.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("sin-scroll");
    if (foco) $("[data-ver]", hojaMini)?.focus({ preventScroll: true });
    setTimeout(() => { try { history.scrollRestoration = "auto"; } catch {} }, 500);
    if (!hojaHistoria) return Promise.resolve();
    hojaHistoria = false;
    return new Promise((listo) => {
      const fin = () => { clearTimeout(t); alVolverHoja = null; requestAnimationFrame(() => listo()); };
      const t = setTimeout(fin, 400);
      alVolverHoja = fin;
      history.back();
    });
  }
  addEventListener("popstate", () => {
    if (alVolverHoja) { alVolverHoja(); return; }
    if (hojaEl.classList.contains("abierto")) { hojaHistoria = false; cerrarHoja(); }
  });
  $$("[data-cerrar]", hojaEl).forEach((x) => x.addEventListener("click", () => cerrarHoja()));
  addEventListener("keydown", (e) => e.key === "Escape" && hojaEl.classList.contains("abierto") && cerrarHoja());

  $("#rejilla").addEventListener("click", (e) => {
    if (e.target.closest("[data-abrir-bolsas]")) { abrirBolsas(); return; }
    const m = e.target.closest(".mini");
    if (!m) return;
    if (e.target.closest("[data-agregar]")) { abrirRapido(m); return; }
    abrirHoja(m);
  });
  hojaCuerpo.addEventListener("click", async (e) => {
    const art = e.target.closest(".producto");
    if (!art) return;
    const arrow = e.target.closest("[data-galeria]");
    if (arrow) { mostrarImagen(art, art.dataset.imagen === "1" ? 0 : 1); return; }
    const punto = e.target.closest(".punto[data-color]");
    if (punto) {
      $$(".punto", art).forEach((x) => {
        x.classList.toggle("on", x === punto);
        x.setAttribute("aria-checked", x === punto);
      });
      mostrarImagen(art, 0);
      pintarTarjeta(art, punto.dataset.color);
      return;
    }
    if (e.target.closest("[data-agregar]")) {
      await cerrarHoja();
      abrirRapido(art);
      return;
    }
    if (e.target.closest("[data-personalizar]")) {
      const p = prod(art.dataset.id), c = art.dataset.color || p.colores[0];
      await cerrarHoja({ foco: false });
      abrirEnTaller({ p: p.id, c });
    }
  });
  hojaCuerpo.addEventListener("change", (e) => {
    const sel = e.target.closest("[data-variante]"); if (!sel) return;
    const art = sel.closest(".producto"), before = prod(art.dataset.id), p = prod(sel.value);
    if (!p || p.familia !== before.familia) return;
    const detallesAbiertos = $(".producto__detalles", art)?.open;
    const chosen = p.colores.includes(art.dataset.color) ? art.dataset.color : p.colores[0];
    const holder = document.createElement("div"); holder.innerHTML = tarjeta(p); const next = holder.firstElementChild;
    art.replaceWith(next);
    $(".producto__detalles", next).open = !!detallesAbiertos;
    $$("[data-color]", next).forEach(x => { x.classList.toggle("on", x.dataset.color === chosen); x.setAttribute("aria-checked", x.dataset.color === chosen); });
    pintarTarjeta(next, chosen); enfocarSilueta(next, p.id);
  });
  pintarCatalogo();

  /* =====================================================================
     PERSONALIZADOR
     ===================================================================== */
  const E = {
    extras: [], // logos adicionales (espalda, mangas, patrocinadores): [{id, x, y, cm, lugar, logo, nombre, crudo, fondo}] en px del lienzo
    p: MUESTRAS[0].p,
    c: MUESTRAS[0].c,
    t: MUESTRAS[0].t,
    z: MUESTRAS[0].z,
    cm: MUESTRAS[0].cm,
    modo: "imagen",
    logo: null, // canvas del logo subido
    logoNombre: "",
    tinta: "original", // color del logo subido: "original" o un hex
    pantone: "",
    info: null, // resultado del análisis del logo subido
    dx: 0, // ajuste fino de la posición, en cm
    dy: 0,
    texto: "",
    letra: "ancha",
    colorTexto: "#ffffff",
    tallas: {},
    piezas: 0,
    notas: "",
  };
  const lienzo = $("#lienzo");
  const lg = lienzo.getContext("2d");
  let logoTexto = null;
  let ejemplo = null;

  const pAct = () => prod(E.p);
  const zAct = () => pAct().zonas.find((z) => z.id === E.z) || pAct().zonas[0];
  const maxLogo = (z) => Math.round(z.max * (z.orientativa ? 1 : C.escalaMaxLogo || 1) * 2) / 2;
  const nombreTinta = () => E.tinta === "original" ? "Original" : (C.tintasLogo.find((c) => c.hex === E.tinta)?.nombre || "Color personalizado");
  $("#oTinta").innerHTML = `<button type="button" class="op op--chico on" data-tinta="original" aria-pressed="true">Original</button>` + C.tintasLogo.map((c) => `<button type="button" class="op op--tinta" data-tinta="${c.hex}" aria-pressed="false" aria-label="${esc(nombreColor(c))}" title="${esc(nombreColor(c))}"><i style="--c:${c.hex}"></i></button>`).join("");
  const sincronizarTinta = () => {
    $$("#oTinta [data-tinta]").forEach((x) => {
      const on = x.dataset.tinta === E.tinta;
      x.classList.toggle("on", on); x.setAttribute("aria-pressed", on);
    });
    if (E.tinta !== "original") { $("#colorLogo").value = E.tinta; $("#hexLogo").value = E.tinta.toUpperCase(); }
    $("#hexLogo").setCustomValidity("");
    $("#hexLogo").removeAttribute("aria-invalid");
    $("#hexLogoAviso").textContent = "";
    $("#tintaActual").textContent = E.tinta === "original" ? "Color original del archivo" : `${nombreTinta()} · ${E.tinta.toUpperCase()}`;
  };

  function construirOpciones() {
    const p = pAct();
    if (!p.colores.includes(E.c)) E.c = p.colores[0];
    if (!p.tecnicas.includes(E.t)) E.t = p.tecnicas[0];
    if (!p.zonas.some((z) => z.id === E.z)) E.z = p.zonas[0].id;

    $("#oPrenda").innerHTML = familias.filter((x) => x.grupo !== "bolsas")
      .map((x) => `<button type="button" class="op op--prenda${(x.familia ? x.familia === p.familia : x.id === E.p) ? " on" : ""}" data-p="${esc(x.id)}" aria-pressed="${x.familia ? x.familia === p.familia : x.id === E.p}"><img src="${esc(x.foto)}" alt="" width="64" height="64" loading="lazy" /><span>${esc(x.nombreFamilia || x.nombre)}</span></button>`)
      .join("") + (bolsas.length ? `<button type="button" class="op op--prenda${p.grupo === "bolsas" ? " on" : ""}" data-elegir-bolsas aria-pressed="${p.grupo === "bolsas"}"><img src="${esc(grupoBolsas.foto)}" alt="" width="64" height="64" loading="lazy" /><span>Bolsas</span></button>` : "");
    $("#modeloBolsaCampo").hidden = p.grupo !== "bolsas";
    $("#modeloBolsa").innerHTML = bolsas.map((x) => `<option value="${esc(x.id)}"${x.id === p.id ? " selected" : ""}>${esc(x.nombre)} · ${esc(x.medidas)}</option>`).join("");
    $("#siluetaCampo").hidden = variantes(p).length < 2;
    $("#siluetaCampo").innerHTML = varianteSelector(p, "siluetaPrenda");
    // la ficha técnica va plegada para que el editor no se alargue; conserva si estaba abierta
    const fichaAbierta = $("#productoInfo .mas-opciones")?.open;
    $("#productoInfo").innerHTML = `<details class="mas-opciones"${fichaAbierta ? " open" : ""}><summary>Detalles de la prenda</summary>${fichaProducto(p)}</details>`;
    $("#vistaOrientativa").hidden = !p.renderOrientativo;
    $("#oColor").innerHTML = p.colores
      .map(color)
      .filter(Boolean)
      .map((c) => `<button type="button" class="punto punto--grande${c.id === E.c ? " on" : ""}" style="${tono(c)}" data-c="${c.id}" aria-pressed="${c.id === E.c}" aria-label="${esc(nombreColor(c))}" title="${esc(nombreColor(c))}"></button>`)
      .join("");
    $("#oTecnica").innerHTML = p.tecnicas
      .map(tecnica)
      .filter(Boolean)
      .map((t) => `<button type="button" class="op op--tec${t.id === E.t ? " on" : ""}" data-t="${t.id}" aria-pressed="${t.id === E.t}"><b>${esc(t.nombre)}</b></button>`)
      .join("");
    $("#oZona").innerHTML = p.zonas
      .map((z) => `<button type="button" class="op op--zona${z.id === E.z ? " on" : ""}" data-z="${z.id}" aria-pressed="${z.id === E.z}">${esc(z.nombre)}</button>`)
      .join("");
    const tallas = p.tallas.length ? p.tallas : ["Piezas"];
    tallas.forEach((t) => {
      if (!(t in E.tallas)) E.tallas[t] = 0;
      if (minimo(p) && E.tallas[t] < minimo(p)) E.tallas[t] = minimo(p);
    });
    $("#oTallas").innerHTML = tallas
      .map(
        (t) => `<label class="talla"><span>${esc(t)}</span>
          <span class="talla__ctl"><button type="button" data-tt="${esc(t)}" data-d="-1" aria-label="Menos ${esc(t)}">−</button><input class="num" type="number" inputmode="numeric" min="${minimo(p)}" step="${pasoCantidad(p)}" max="${pasoCantidad(p) > 1 ? 9950 : 9999}" value="${E.tallas[t] || 0}" data-talla="${esc(t)}" aria-label="Piezas talla ${esc(t)}" /><button type="button" data-tt="${esc(t)}" data-d="1" aria-label="Más ${esc(t)}">+</button></span></label>`,
      )
      .join("");
    ajustarTamano();
    $("#vColor").textContent = nombreColor(color(E.c));
  }

  function ajustarTamano() {
    const z = zAct();
    const r = $("#tamano");
    r.max = maxLogo(z);
    E.cm = Math.min(Math.max(E.cm, 3), maxLogo(z));
    r.value = E.cm;
    $("#tamanoTxt").textContent = cm(E.cm);
    $("#reglaTxt").textContent = cm(E.cm);
  }

  function contarPiezas() {
    const p = pAct();
    const tallas = p.tallas.length ? p.tallas : ["Piezas"];
    E.piezas = tallas.reduce((a, t) => a + (Number(E.tallas[t]) || 0), 0);
    $("#vPiezas").textContent = `${E.piezas} ${E.piezas === 1 ? "pza" : "pzas"}`;
    const pt = $("#precioTxt");
    const nuevo = `${E.piezas} ${E.piezas === 1 ? "pieza" : "piezas"}`;
    if (pt.textContent !== nuevo && pt.textContent !== "—" && !reducido) {
      pt.classList.remove("cambia");
      void pt.offsetWidth;
      pt.classList.add("cambia");
    }
    pt.textContent = nuevo;
    $("#precioDetalle").textContent = reglaCantidad(p);
  }

  // logo de un solo color (hilo o tinta): se pinta la silueta del logo subido
  const entintados = new Map();
  const entintar = (logo, hex) => {
    const k = hex;
    if (entintados.get("logo") !== logo) (entintados.clear(), entintados.set("logo", logo));
    if (entintados.has(k)) return entintados.get(k);
    const c = ZR.lienzo(logo.width, logo.height);
    const g = c.getContext("2d");
    g.drawImage(logo, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = hex;
    g.fillRect(0, 0, c.width, c.height);
    entintados.set(k, c);
    return c;
  };
  // brillo promedio del logo (para avisar si casi no se ve sobre la prenda)
  const brillos = new WeakMap();
  const brilloLogo = (logo) => {
    if (brillos.has(logo)) return brillos.get(logo);
    const m = ZR.lienzo(48, 48);
    const g = m.getContext("2d", { willReadFrequently: true });
    g.drawImage(logo, 0, 0, 48, 48);
    const p = g.getImageData(0, 0, 48, 48).data;
    let suma = 0;
    let peso = 0;
    for (let i = 0; i < p.length; i += 4) {
      const a = p[i + 3] / 255;
      suma += a * (0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]);
      peso += a;
    }
    const b = peso ? suma / peso / 255 : 0.5;
    brillos.set(logo, b);
    return b;
  };

  // Logos adicionales: cada uno con su archivo; mientras no lo suban, un marcador «Logo N» para ubicarlo.
  const marcadores = new Map();
  async function logoExtra(x, n) {
    if (x.logo) return x.logo;
    if (!marcadores.has(n)) marcadores.set(n, await ZR.logoDeTexto("Logo " + n, "ancha", "#ffffff"));
    const base = marcadores.get(n);
    const claro = ZR.luz(ZR.hexARgb(fondoLogo(zAct(), E.c))) > 0.55;
    const c = ZR.lienzo(base.width, base.height);
    const g = c.getContext("2d");
    g.drawImage(base, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = claro ? "rgba(27,27,29,.45)" : "rgba(244,244,242,.55)";
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }
  async function logoActual() {
    if (E.modo === "imagen" && E.logo) return E.tinta === "original" ? E.logo : entintar(E.logo, E.tinta);
    if (E.modo === "texto" && E.texto.trim()) return logoTexto;
    // sin logo todavía: un ejemplo «TU LOGO» para ver ubicación y tamaño
    if (!ejemplo) ejemplo = await ZR.logoDeTexto("Tu logo", "ancha", "#ffffff");
    const claro = ZR.luz(ZR.hexARgb(fondoLogo(zAct(), E.c))) > 0.55;
    const c = ZR.lienzo(ejemplo.width, ejemplo.height);
    const g = c.getContext("2d");
    g.drawImage(ejemplo, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = E.modo === "imagen" && E.tinta !== "original" ? E.tinta : E.modo === "texto" ? E.colorTexto : claro ? "#1b1b1d" : "#f4f4f2";
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  let rafRender = 0;
  let renderVersion = 0;
  let rendersActivos = 0;
  let errorRender = null;
  let transicion = false;
  let caja = null; // dónde quedó el logo en el lienzo (para arrastrarlo)
  let cajas = []; // dónde quedó cada logo adicional
  const pedirRender = () => {
    if (rafRender) return;
    rafRender = requestAnimationFrame(async () => {
      rafRender = 0;
      rendersActivos++;
      errorRender = null;
      try {
      const v = ++renderVersion;
      const p = pAct();
      const z = zAct();
      const img = await ZR.cargar(fotoDe(p, E.c));
      const logo = await logoActual();
      if (v !== renderVersion) return;
      if (transicion && lienzo.classList.contains("listo") && !reducido) {
        // fundido: la vista anterior se queda encima y se desvanece mientras entra la nueva
        const f = $("#fantasma");
        const fg = f.getContext("2d");
        fg.clearRect(0, 0, 1000, 1000);
        fg.drawImage(lienzo, 0, 0);
        f.classList.remove("va");
        lienzo.classList.remove("entra");
        void f.offsetWidth;
        f.classList.add("va");
        lienzo.classList.add("entra");
      }
      transicion = false;
      lg.clearRect(0, 0, 1000, 1000);
      lg.drawImage(prendaTenida(p, img, E.c, 1000), 0, 0);
      if (logo) {
        // si el logo es más alto que ancho, se limita su alto para que no se salga de la zona
        let ancho = E.cm * p.pxPorCm;
        const altoMax = (z.maxAlto || maxLogo(z) * (z.id === "centro" ? 1 : 0.9)) * p.pxPorCm; // maxAlto: zonas bajas como el frente de una gorra; el frente centrado deja el mismo alto que ancho
        if ((ancho * logo.height) / logo.width > altoMax) ancho = (altoMax * logo.width) / logo.height;
        const lx = z.x + E.dx * p.pxPorCm;
        const ly = z.y + E.dy * p.pxPorCm;
        ZR.estampar(lg, img, logo, { x: lx, y: ly, ancho, tecnica: E.t, S: 1000, sombraLocal: !!p.fotosColor, giro: z.giro, sesgo: z.sesgo, inclina: z.inclina, compresion: z.compresion, textura: z.textura });
        const alto = (ancho * logo.height) / logo.width;
        $("#tamanoTxt").textContent = `${(ancho / p.pxPorCm).toFixed(2)} × ${(alto / p.pxPorCm).toFixed(2)} cm · ancho × alto estimados`;
        $("#reglaTxt").textContent = cm(ancho / p.pxPorCm);
        caja = { x0: lx - ancho / 2, y0: ly - alto / 2, x1: lx + ancho / 2, y1: ly + alto / 2 };
        cajas = [];
        for (const [n, x] of E.extras.entries()) {
          const logo2 = await logoExtra(x, n + 2);
          if (v !== renderVersion) return;
          let a2 = x.cm * p.pxPorCm;
          const maxH = 30 * p.pxPorCm;
          if ((a2 * logo2.height) / logo2.width > maxH) a2 = (maxH * logo2.width) / logo2.height;
          ZR.estampar(lg, img, logo2, { x: x.x, y: x.y, ancho: a2, tecnica: E.t, S: 1000, sombraLocal: !!p.fotosColor, textura: z.textura });
          const al2 = (a2 * logo2.height) / logo2.width;
          cajas[n] = { x0: x.x - a2 / 2, y0: x.y - al2 / 2, x1: x.x + a2 / 2, y1: x.y + al2 / 2 };
        }
        const propio = (E.modo === "imagen" && E.logo) || (E.modo === "texto" && E.texto.trim());
        const poco = propio && Math.abs(brilloLogo(logo) - ZR.luz(ZR.hexARgb(fondoLogo(z, E.c)))) < 0.2;
        const a = $("#aviso");
        if (poco) aviso(E.modo === "imagen" ? "Tu logo casi no se ve sobre este color. Prueba otro «Color del logo»." : "El texto casi no se ve sobre este color. Cambia el color del texto.");
        else if (/casi no se ve/.test(a.textContent)) aviso("");
      }
      $("#pieTxt").textContent = `${p.renderOrientativo ? "Vista previa · " : ""}${p.nombre} · ${nombreColor(color(E.c))} · ${tecnica(E.t).nombre}`;
      lienzo.classList.add("listo");
      } catch (er) { errorRender = er; aviso("No se pudo preparar la vista previa. Intenta otra vez.", true); }
      finally { rendersActivos--; }
    });
  };
  const esperarRender = () => {
    pedirRender();
    return new Promise((ok, mal) => {
      const inicio = performance.now();
      const revisar = () => {
        if (!rafRender && !rendersActivos) return errorRender ? mal(errorRender) : ok();
        if (performance.now() - inicio > 10000) return mal(new Error("La vista previa sigue cargando. Intenta agregarla otra vez."));
        setTimeout(revisar, 16);
      };
      revisar();
    });
  };

  function actualizar() {
    construirOpciones();
    contarPiezas();
    pedirRender();
    if (E.info && E.modo === "imagen") pintarAnalisis();
  }

  $("#oPrenda").addEventListener("click", (e) => {
    if (e.target.closest("[data-elegir-bolsas]")) {
      const p = pAct().grupo === "bolsas" ? pAct() : prod(grupoBolsas.productoInicial) || bolsas[0];
      transicion = true;
      E.dx = E.dy = 0;
      abrirEnTaller({ p: p.id, c: p.colores[0] });
      return;
    }
    const b = e.target.closest("[data-p]");
    if (!b) return;
    E.p = b.dataset.p; E.tallas = {}; transicion = true;
    E.dx = E.dy = 0;
    if (E.info) {
      construirOpciones();
      E.cm = tamanoIdeal();
      E.t = tecnicaIdeal(E.info);
    }
    actualizar();
  });
  $("#siluetaCampo").addEventListener("change", (e) => {
    const p = prod(e.target.value); if (!p || p.familia !== pAct().familia) return;
    E.p = p.id; E.tallas = {}; E.dx = E.dy = 0; transicion = true; actualizar(); enfocarSilueta($("#siluetaCampo"), p.id);
  });
  $("#modeloBolsa").addEventListener("change", (e) => {
    const p = prod(e.target.value);
    if (!p || p.grupo !== "bolsas") return;
    E.p = p.id; E.c = p.colores[0]; E.tallas = {}; E.dx = E.dy = 0;
    transicion = true;
    actualizar();
  });
  $("#oColor").addEventListener("click", (e) => {
    const b = e.target.closest("[data-c]");
    if (!b) return;
    E.c = b.dataset.c; transicion = true;
    actualizar();
  });
  $("#oTecnica").addEventListener("click", (e) => {
    const b = e.target.closest("[data-t]");
    if (!b) return;
    E.t = b.dataset.t; transicion = true;
    actualizar();
  });
  $("#oZona").addEventListener("click", (e) => {
    const b = e.target.closest("[data-z]");
    if (!b) return;
    E.z = b.dataset.z; transicion = true;
    E.cm = tamanoIdeal();
    E.dx = E.dy = 0;
    actualizar();
  });
  const LUGARES = ["Espalda", "Frente", "Manga izquierda", "Manga derecha", "Cuello / nuca", "Otro lugar"];
  const MAX_EXTRAS = 12;
  let capaActiva = -1;
  function pintarCapas() {
    $("#capas").innerHTML = E.extras.map((x, i) => `<div class="capa${i === capaActiva ? " capa--activa" : ""}" data-capa="${i}">
      <div class="capa__cab"><b>Logo ${i + 2}</b><button type="button" class="capa__quitar" data-quitar-capa="${i}" aria-label="Quitar logo ${i + 2}">Quitar</button></div>
      <label class="subir subir--capa"><input type="file" data-archivo="${i}" accept="image/png,image/jpeg,image/webp,image/svg+xml" /><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V5M7 10l5-5 5 5M5 19h14" /></svg><span>${x.nombre ? `<b>${esc(x.nombre)}</b> · toca para cambiarlo` : "<b>Elige este logo</b> · PNG, JPG o SVG"}</span></label>
      <div class="capa__fila"><label class="campo"><span>¿Dónde va?</span><select data-lugar="${i}">${LUGARES.map((l) => `<option${l === x.lugar ? " selected" : ""}>${l}</option>`).join("")}</select></label>
      <label class="interruptor"><input type="checkbox" data-fondo="${i}"${x.fondo ? " checked" : ""} /><span>Quitar fondo</span></label></div>
      <label class="deslizador"><span>Ancho</span><input type="range" data-ancho="${i}" min="3" max="42" step="0.5" value="${x.cm}" /><output class="num">${cm(x.cm)}</output></label>
    </div>`).join("");
    $("#capaAgregar").hidden = E.extras.length >= MAX_EXTRAS;
    $("#capaAgregar").textContent = E.extras.length ? "+ Agregar otro logo" : "+ Agregar más logos (espalda, mangas, patrocinadores…)";
  }
  const activar = (i) => { capaActiva = i; $$("#capas .capa").forEach((el) => el.classList.toggle("capa--activa", Number(el.dataset.capa) === i)); };
  $("#capaAgregar").addEventListener("click", () => {
    if (E.extras.length >= MAX_EXTRAS) return;
    // Cada logo nuevo aparece al centro del torso, un poco más abajo que el anterior, para no encimarse.
    const n = E.extras.length;
    E.extras.push({ id: crypto.randomUUID(), x: 500, y: Math.min(760, Math.max(420, zAct().y + 180) + n * 60), cm: n ? 10 : 22, lugar: n ? "Otro lugar" : "Espalda", logo: null, nombre: "", crudo: null, fondo: true });
    capaActiva = E.extras.length - 1;
    pintarCapas();
    pedirRender();
  });
  const analizarCapa = (x) => { x.logo = ZR.analizarLogo(x.crudo, x.fondo).logo; pedirRender(); };
  $("#capas").addEventListener("click", (e) => {
    const q = e.target.closest("[data-quitar-capa]");
    if (q) { E.extras.splice(Number(q.dataset.quitarCapa), 1); capaActiva = -1; cajas = []; pintarCapas(); pedirRender(); return; }
    const c = e.target.closest("[data-capa]");
    if (c) activar(Number(c.dataset.capa));
  });
  $("#capas").addEventListener("input", (e) => {
    const a = e.target.closest("[data-ancho]");
    if (!a) return;
    const x = E.extras[Number(a.dataset.ancho)];
    x.cm = Number(a.value);
    a.nextElementSibling.textContent = cm(x.cm);
    pedirRender();
  });
  $("#capas").addEventListener("change", async (e) => {
    const t = e.target;
    if (t.dataset.lugar !== undefined) { E.extras[Number(t.dataset.lugar)].lugar = t.value; return; }
    if (t.dataset.fondo !== undefined) { const x = E.extras[Number(t.dataset.fondo)]; x.fondo = t.checked; if (x.crudo) { try { analizarCapa(x); } catch (er) { aviso(er.message, true); } } return; }
    if (t.dataset.archivo === undefined) return;
    const x = E.extras[Number(t.dataset.archivo)], f = t.files[0];
    if (!f || !x) return;
    if (!/^image\//.test(f.type)) return aviso("Ese archivo no es una imagen. Sube el logo en PNG, JPG o SVG.", true);
    if (f.size > 15 * 1024 * 1024) return aviso("La imagen pesa más de 15 MB. Prueba con una versión más ligera.", true);
    t.parentElement.querySelector("span").innerHTML = "<b>Analizando el logo…</b>";
    try { x.crudo = await ZR.abrirArchivo(f); x.nombre = f.name; x.archivo = f; analizarCapa(x); aviso(""); }
    catch (er) { aviso(er.message, true); }
    pintarCapas();
  });
  $("#masTintas").addEventListener("click", (e) => {
    const abierto = $("#oTinta").classList.toggle("todas");
    e.currentTarget.textContent = abierto ? "Menos colores" : "Más colores";
    e.currentTarget.setAttribute("aria-expanded", String(abierto));
  });
  $("#tamano").addEventListener("input", (e) => {
    E.cm = Number(e.target.value);
    $("#tamanoTxt").textContent = cm(E.cm);
    $("#reglaTxt").textContent = cm(E.cm);
    pedirRender();
    if (E.info && E.modo === "imagen") pintarAnalisis();
  });
  $("#oTallas").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tt]");
    if (!b) return;
    const t = b.dataset.tt;
    E.tallas[t] = Math.min(pasoCantidad(pAct()) > 1 ? 9950 : 9999, Math.max(minimo(pAct()), (Number(E.tallas[t]) || 0) + Number(b.dataset.d) * pasoCantidad(pAct())));
    $(`input[data-talla="${CSS.escape(t)}"]`).value = E.tallas[t];
    contarPiezas();
  });
  $("#oTallas").addEventListener("input", (e) => {
    const i = e.target.closest("[data-talla]");
    if (!i) return;
    E.tallas[i.dataset.talla] = Math.max(0, Math.min(pasoCantidad(pAct()) > 1 ? 9950 : 9999, Math.floor(Number(i.value) || 0)));
    contarPiezas();
  });
  $("#notas").addEventListener("input", (e) => (E.notas = e.target.value));

  // pestañas imagen / texto
  $$(".pestana").forEach((b) =>
    b.addEventListener("click", () => {
      E.modo = b.dataset.modo;
      $$(".pestana").forEach((x) => {
        x.classList.toggle("on", x === b);
        x.setAttribute("aria-selected", x === b);
      });
      $$(".modo").forEach((m) => (m.hidden = m.dataset.modo !== E.modo));
      pedirRender();
    }),
  );

  // subir logo (botón o arrastrar)
  const aviso = (msg, error) => {
    const a = $("#aviso");
    a.textContent = msg;
    a.classList.toggle("error", !!error);
  };
  let archivoActual = null;
  let crudo = null; // la imagen tal cual la subieron (para volver a analizar)

  // tamaño que mejor luce según la forma del logo y la zona
  function tamanoIdeal() {
    const z = zAct();
    const pr = E.info ? E.info.proporcion : 2.2;
    // El frente centrado permite casi todo el ancho del pecho (42 cm), pero sugiere el tamaño habitual (base de 30 cm).
    const base = Math.min(z.max, 30);
    const f = E.info?.esFoto ? (z.max <= 12 ? 0.9 : 0.78) : z.max <= 12 ? (pr >= 2.2 ? 0.9 : pr >= 1.2 ? 0.8 : 0.66) : pr >= 1.5 ? 0.85 : 0.7;
    return Math.round(base * f * 2) / 2;
  }
  // técnica sugerida: fotos y degradados → DTF; pocos colores → la principal de la prenda
  function tecnicaIdeal(info) {
    const p = pAct();
    if ((info.esFoto || info.nColores > 5) && p.tecnicas.includes("dtf")) return "dtf";
    return p.tecnicas[0];
  }
  const POR_QUE = {
    bordado: "Pocos colores y trazos definidos: se ve elegante y dura años.",
    serigrafia: "Pocos colores sólidos: el mejor precio en volumen.",
    dtf: "Tiene muchos colores o degradados: el DTF los imprime todos.",
  };
  const ICO_OK = '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  function autoAjustar() {
    const info = E.info;
    const cambios = [];
    // una foto luce mejor grande y al centro (si la prenda tiene esa zona)
    if (info.esFoto && pAct().zonas.some((z) => z.id === "centro")) {
      cambios.push("Al ser foto, la pusimos al centro del pecho");
      E.z = "centro";
    } else E.z = pAct().zonas[0].id; // la ubicación principal de la prenda (la primera en config.js)
    E.t = tecnicaIdeal(info);
    E.cm = tamanoIdeal();
    E.dx = E.dy = 0;
    E.tinta = "original";
    // si es de 1 o 2 colores y casi no se ve sobre la prenda, se pasa a blanco o negro
    const luzPrenda = ZR.luz(ZR.hexARgb(fondoLogo(zAct(), E.c)));
    const seVe = info.colores.some((c) => Math.abs(ZR.luz(ZR.hexARgb(c)) - luzPrenda) >= 0.25);
    if (!info.esFoto && info.nColores <= 3 && !seVe) {
      E.tinta = luzPrenda < 0.5 ? "#f6f6f4" : "#141416";
      cambios.push(`Lo pasamos a ${luzPrenda < 0.5 ? "blanco" : "negro"} para que resalte sobre ${color(E.c).nombre.toLowerCase()}`);
    }
    sincronizarTinta();
    transicion = true;
    actualizar();
    pintarAnalisis(cambios);
  }

  let extrasAnalisis = [];
  function pintarAnalisis(extra) {
    if (extra) extrasAnalisis = extra;
    extra = extrasAnalisis;
    const info = E.info;
    const el = $("#analisis");
    if (!info) return (el.hidden = true);
    const t = tecnica(E.t);
    const hechos = [];
    if (info.fondoQuitado) hechos.push(`Quitamos el fondo <i class="muestra" style="--c:rgb(${info.fondo.map(Math.round).join(",")})"></i>`);
    else if (info.yaTransparente) hechos.push("Tu imagen ya venía sin fondo");
    if (info.agrandado) hechos.push("Era chica: la agrandamos y la enfocamos");
    if (info.limpio) hechos.push("Limpiamos bordes y colores");
    if (info.esFoto && !info.fondoQuitado && !info.yaTransparente) hechos.push("Es una foto: la preparamos como transfer con orillas suaves");
    hechos.push(...extra);
    hechos.push(`Ajustado a ${cm(E.cm)} en ${zAct().nombre.toLowerCase()}`);
    el.innerHTML = `<b class="analisis__titulo">Así preparamos tu logo</b>
      <div class="analisis__colores">${info.esFoto ? "<span>Foto o degradado</span>" : `<span>${info.nColores} ${info.nColores === 1 ? "color" : "colores"}</span>${info.colores.map((c) => `<i class="muestra" style="--c:${c}" title="${c}"></i>`).join("")}`}</div>
      <ul>${hechos.map((h) => `<li>${ICO_OK}<span>${h}</span></li>`).join("")}</ul>
      <p class="analisis__rec"><b>Recomendado: ${esc(t.nombre)}.</b> ${POR_QUE[t.id] || ""}</p>
      <p class="analisis__tip">Arrastra el logo en la vista o usa las flechas para moverlo.</p>`;
    el.hidden = false;
  }

  const analizar = () => {
    const r = ZR.analizarLogo(crudo, $("#quitarFondo").checked);
    E.logo = r.logo;
    E.info = r.info;
    autoAjustar();
  };

  const procesarArchivo = async (f) => {
    if (!f) return;
    if (!/^image\//.test(f.type)) return aviso("Ese archivo no es una imagen. Sube tu logo en PNG, JPG o SVG.", true);
    if (f.size > 15 * 1024 * 1024) return aviso("La imagen pesa más de 15 MB. Prueba con una versión más ligera.", true);
    $("#agregar").disabled = true;
    $("#subirTxt").innerHTML = `<b>Analizando tu logo…</b>`;
    $("#subir").classList.add("analizando");
    try {
      crudo = await ZR.abrirArchivo(f);
      await new Promise((r) => setTimeout(r, 30)); // deja pintar el «Analizando…»
      analizar();
      E.logoNombre = f.name;
      archivoActual = f;
      $("#subirTxt").innerHTML = `<b>${esc(f.name)}</b> · toca para cambiarlo`;
      $("#subir").classList.add("con-logo");
      aviso("");
    } catch (er) {
      $("#subirTxt").innerHTML = `<b>Elige tu logo</b><span class="solo-raton"> o arrástralo aquí</span> · PNG, JPG o SVG`;
      aviso(er.message, true);
    } finally {
      $("#subir").classList.remove("analizando");
      $("#agregar").disabled = false;
    }
  };
  $("#archivo").addEventListener("change", (e) => procesarArchivo(e.target.files[0]));
  $("#oTinta").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tinta]");
    if (!b) return;
    E.tinta = b.dataset.tinta;
    transicion = true;
    sincronizarTinta();
    pedirRender();
  });
  $("#colorLogo").addEventListener("input", (e) => {
    E.tinta = e.target.value.toLowerCase(); transicion = true;
    sincronizarTinta(); pedirRender();
  });
  $("#hexLogo").addEventListener("input", (e) => {
    let valor = e.target.value.trim().replace(/^#/, "");
    if (!/^[0-9a-f]{6}$/i.test(valor)) {
      e.target.setCustomValidity("Usa un código HEX como #2457C7.");
      e.target.setAttribute("aria-invalid", "true");
      $("#hexLogoAviso").textContent = "Usa un código HEX como #2457C7.";
      $("#hexLogoAviso").classList.add("error");
      return;
    }
    E.tinta = "#" + valor.toLowerCase(); transicion = true;
    sincronizarTinta(); pedirRender();
  });
  $("#pantoneLogo").addEventListener("input", (e) => { E.pantone = e.target.value.trim(); });
  $("#quitarFondo").addEventListener("change", () => {
    if (!crudo) return;
    try {
      analizar();
    } catch (er) {
      aviso(er.message, true);
    }
  });

  // mover el logo: flechas (1 cm por toque) o arrastrándolo en la vista
  const limitar = () => {
    const m = zAct().max * 0.7;
    E.dx = Math.max(-m, Math.min(m, E.dx));
    E.dy = Math.max(-m, Math.min(m, E.dy));
  };
  $(".mover").addEventListener("click", (e) => {
    const b = e.target.closest("[data-mover]");
    if (!b) return;
    const m = b.dataset.mover;
    if (m === "centro") E.dx = E.dy = 0;
    else {
      E.dx += m === "izq" ? -1 : m === "der" ? 1 : 0;
      E.dy += m === "arr" ? -1 : m === "aba" ? 1 : 0;
    }
    limitar();
    pedirRender();
  });
  const aLienzo = (e) => {
    const r = lienzo.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 1000, y: ((e.clientY - r.top) / r.height) * 1000 };
  };
  let arrastre = null;
  lienzo.addEventListener("pointerdown", (e) => {
    if (!caja) return;
    const q = aLienzo(e);
    const h = 18;
    for (let i = cajas.length - 1; i >= 0; i--) {
      const b = cajas[i];
      if (!b || q.x < b.x0 - h || q.x > b.x1 + h || q.y < b.y0 - h || q.y > b.y1 + h) continue;
      arrastre = { id: e.pointerId, x: q.x, y: q.y, ex: E.extras[i].x, ey: E.extras[i].y, capa: i };
      activar(i);
      lienzo.setPointerCapture(e.pointerId);
      lienzo.classList.add("moviendo");
      return;
    }
    activar(-1);
    if (q.x < caja.x0 - h || q.x > caja.x1 + h || q.y < caja.y0 - h || q.y > caja.y1 + h) return;
    arrastre = { id: e.pointerId, x: q.x, y: q.y, dx: E.dx, dy: E.dy };
    lienzo.setPointerCapture(e.pointerId);
    lienzo.classList.add("moviendo");
  });
  lienzo.addEventListener("pointermove", (e) => {
    if (caja && !arrastre && e.pointerType === "mouse") {
      const q = aLienzo(e);
      lienzo.classList.toggle("sobre-logo", q.x > caja.x0 && q.x < caja.x1 && q.y > caja.y0 && q.y < caja.y1);
    }
    if (!arrastre || arrastre.id !== e.pointerId) return;
    const q = aLienzo(e);
    const k = pAct().pxPorCm;
    if (arrastre.capa !== undefined) {
      const x = E.extras[arrastre.capa];
      if (!x) return;
      x.x = Math.min(950, Math.max(50, arrastre.ex + q.x - arrastre.x));
      x.y = Math.min(950, Math.max(50, arrastre.ey + q.y - arrastre.y));
      pedirRender();
      return;
    }
    E.dx = arrastre.dx + (q.x - arrastre.x) / k;
    E.dy = arrastre.dy + (q.y - arrastre.y) / k;
    limitar();
    pedirRender();
  });
  const finArrastre = () => {
    arrastre = null;
    lienzo.classList.remove("moviendo");
  };
  lienzo.addEventListener("pointerup", finArrastre);
  lienzo.addEventListener("pointercancel", finArrastre);
  const subir = $("#subir");
  ["dragenter", "dragover"].forEach((ev) =>
    subir.addEventListener(ev, (e) => {
      e.preventDefault();
      subir.classList.add("encima");
    }),
  );
  ["dragleave", "drop"].forEach((ev) => subir.addEventListener(ev, () => subir.classList.remove("encima")));
  subir.addEventListener("drop", (e) => {
    e.preventDefault();
    procesarArchivo(e.dataTransfer.files[0]);
  });

  // logo de texto
  let tTexto = 0;
  const rehacerTexto = () => {
    clearTimeout(tTexto);
    tTexto = setTimeout(actualizarLogoTexto, 120);
  };
  async function actualizarLogoTexto() {
      E.texto = $("#texto").value;
      E.letra = $("#letra").value;
      E.colorTexto = $("#colorTexto").value;
      logoTexto = E.texto.trim() ? await ZR.logoDeTexto(E.texto.trim(), E.letra, E.colorTexto) : null;
      pedirRender();
  }
  ["#texto", "#letra", "#colorTexto"].forEach((s) => $(s).addEventListener("input", rehacerTexto));

  // Diseño comercial: prenda y logo exactos del editor, con alpha y sin ficha.
  function renderDiseno(S) {
    const c = ZR.lienzo(S, S);
    c.getContext("2d").drawImage(lienzo, 0, 0, S, S);
    return c;
  }
  // Descarga técnica: conserva fondo y ficha; no se usa como imagen del membrete.
  function renderFinal(S) {
    const c = ZR.lienzo(S, S);
    const g = c.getContext("2d");
    g.fillStyle = "#e9e9e6";
    g.fillRect(0, 0, S, S);
    g.drawImage(lienzo, S * 0.06, S * 0.02, S * 0.88, S * 0.88);
    const p = pAct();
    const z = zAct();
    g.fillStyle = "#141416";
    g.font = `600 ${Math.round(S * 0.022)}px Archivo, Arial, sans-serif`;
    g.textBaseline = "alphabetic";
    g.fillText(`${C.marca} · ${p.nombre} · ${nombreColor(color(E.c))}`, S * 0.05, S * 0.925, S * 0.90);
    g.font = `400 ${Math.round(S * 0.019)}px 'JetBrains Mono', monospace`;
    g.fillStyle = "#4a4a4e";
    g.fillText(`${tecnica(E.t).nombre} · ${z.nombre} · logo ${cm(E.cm)}${p.renderOrientativo ? " solicitado" : ""}`, S * 0.05, S * 0.957, S * 0.90);
    if (p.renderOrientativo) { g.font = `500 ${Math.round(S * 0.015)}px Arial, sans-serif`; g.fillText("VISTA PREVIA · color, tamaño y acabado por confirmar", S * 0.05, S * 0.985, S * 0.90); }
    return c;
  }
  const descargarCanvas = (c, nombre) =>
    c.toBlob((b) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = nombre;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, "image/png");
  $("#descargar").addEventListener("click", () => descargarCanvas(renderFinal(1200), `${C.marca.toLowerCase()}-${E.p}-${E.c}.png`));

  // abrir el personalizador con una prenda elegida
  function abrirEnTaller(m) {
    if (E.p !== m.p) { E.tallas = {}; E.dx = E.dy = 0; }
    E.p = m.p;
    if (m.c) E.c = m.c;
    if (m.t) E.t = m.t;
    if (m.z) E.z = m.z;
    if (m.cm) E.cm = m.cm;
    actualizar();
    $("#personaliza").scrollIntoView({ behavior: reducido ? "auto" : "smooth", block: "start" });
  }

  /* =====================================================================
     PEDIDO (carrito) — se guarda en el teléfono y se envía por WhatsApp
     ===================================================================== */
  const LLAVE = "zain-pedido";
  const pedidoGuardado = almacen.leer(LLAVE, []);
  let pedido = Array.isArray(pedidoGuardado) ? pedidoGuardado.filter((x) => x && typeof x === "object").map(({ unit, ...x }) => {
    const p=prod(x.p);
    if (!p) return x;
    const col=p.colores.map(color).find(c=>c.nombre === String(x.color || "").replace(/ · \d+$/, ""));
    return {...x,p:p.id,nombre:p.nombre,sku:p.sku,...(col ? {color:col.nombre,colorId:col.id,colorCodigo:""} : {})};
  }) : [];
  let paquete = null, revisionArchivos = 0, compartiendo = false;
  // nombre y fecha deseada: se recuerdan en este teléfono para el siguiente pedido
  const LLAVE_CLIENTE = "zain-cliente";
  const clienteGuardado = almacen.leer(LLAVE_CLIENTE, {});
  const cliente = {
    nombre: typeof clienteGuardado?.nombre === "string" ? clienteGuardado.nombre.slice(0, 120) : "",
    fecha: typeof clienteGuardado?.fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(clienteGuardado.fecha) ? clienteGuardado.fecha : "",
  };
  const hoyISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const errorCliente = () => cliente.nombre.trim().length < 2 ? "nombre" : cliente.fecha && cliente.fecha < hoyISO() ? "fecha" : "";
  const datosItem = (x) => prod(x.p) || (x.p === "bolsa" ? { minimoPiezas: 100, pasoPiezas: 50 } : {});
  // prendas: mínimo general por pedido, sumando todos los modelos, tallas y colores (las bolsas llevan su propio mínimo)
  const esPrenda = (x) => { const p = datosItem(x); return !!p.id && minimo(p) <= 1; };
  const faltanPedido = () => {
    if (!(C.minimoPedido > 1)) return 0;
    const prendas = pedido.filter(esPrenda);
    return prendas.length ? Math.max(0, C.minimoPedido - prendas.reduce((s, y) => s + (Number(y.piezas) || 0), 0)) : 0;
  };
  const erroresCantidad = () => pedido.filter((x) => !cantidadValida(datosItem(x), Number(x.piezas)) || (esPrenda(x) && faltanPedido() > 0));
  function estadoArchivos() {
    const boton = $("#compartirPedido"), estado = $("#archivosEstado");
    if (!boton || !estado) return;
    const invalidos = erroresCantidad();
    boton.disabled = compartiendo || !paquete || !!invalidos.length;
    $("#descargarPaquete").disabled = !paquete || !!invalidos.length;
    $("#enviar").setAttribute("aria-disabled", compartiendo || !!invalidos.length);
    $("#enviar").href = invalidos.length ? "#pedido" : wa(mensajePedido());
    estado.classList.toggle("error", !!invalidos.length || !!paquete?.faltan.length);
    if (invalidos.length) { estado.textContent = "Ajusta las cantidades indicadas antes de enviar el pedido."; return; }
    if (!paquete) { estado.textContent = "Preparando los archivos de tu pedido…"; return; }
    const conArchivos = paquete.files.length > 1;
    boton.textContent = compartiendo ? "Guardando solicitud…" : "Solicitar cotización por WhatsApp";
    $("#otrasFormas").hidden = !conArchivos && !paquete.faltan.length;
    $("#descargarPaquete").hidden = !conArchivos;
    estado.textContent = conArchivos ? `Listos para adjuntar: ${paquete.renders} render${paquete.renders === 1 ? "" : "s"} y ${paquete.logos} logo${paquete.logos === 1 ? "" : "s"} original${paquete.logos === 1 ? "" : "es"}.` : "";
    if (paquete.faltan.length) estado.textContent += " Faltan archivos de pedidos guardados anteriormente; vuelve a agregarlos con su logo.";
    else if (pedido.some((x) => x.archivosTemporales)) estado.textContent += " Descarga el paquete antes de cerrar esta pestaña: no pudimos guardar los archivos en este equipo.";
    $("#pedidoNota").textContent = P.activo()
      ? "Guardamos tu solicitud con tus archivos y se abre el WhatsApp de ZAIN: solo confirma el envío."
      : conArchivos ? "Se abrirá directamente el WhatsApp de ZAIN con el texto. El guardado de imágenes todavía no está habilitado: puedes descargar los archivos en Otra forma de enviar y adjuntarlos al chat."
      : "Se abrirá directamente WhatsApp con el detalle de tu pedido.";
  }
  async function prepararArchivos() {
    const rev = ++revisionArchivos;
    paquete = null;
    if (!pedido.length) return;
    estadoArchivos();
    try {
      const nuevo = await A.preparar(pedido.map((x) => ({ ...x })), mensajePedido());
      if (rev !== revisionArchivos) return;
      nuevo.zip = await A.zip(nuevo.files);
      if (rev !== revisionArchivos) return;
      paquete = nuevo; estadoArchivos();
    } catch (_) {
      if (rev !== revisionArchivos || !$("#archivosEstado")) return;
      $("#compartirPedido").textContent = "Archivos no disponibles";
      $("#otrasFormas").hidden = false;
      $("#otrasFormas").open = true;
      $("#descargarPaquete").hidden = true;
      $("#archivosEstado").textContent = "No se pudieron preparar los archivos. Tu pedido sigue guardado; puedes enviar el texto por WhatsApp.";
    }
  }
  // Conserva pedidos anteriores y elimina sus importes de referencia.
  if (Array.isArray(pedidoGuardado) && pedidoGuardado.some((x) => x && typeof x === "object" && "unit" in x)) almacen.guardar(LLAVE, pedido);
  const pedidoEl = $("#pedido");
  let focoAntes = null;
  const abrirPedido = () => {
    focoAntes = document.activeElement;
    pedidoEl.classList.add("abierto");
    pedidoEl.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("sin-scroll");
    setTimeout(() => $(".pedido__x").focus(), 50);
  };
  const cerrarPedido = () => {
    pedidoEl.classList.remove("abierto");
    pedidoEl.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("sin-scroll");
    focoAntes?.focus?.();
  };
  $("#abrirPedido").addEventListener("click", abrirPedido);
  $$("[data-cerrar]", pedidoEl).forEach((x) => x.addEventListener("click", cerrarPedido));
  addEventListener("keydown", (e) => e.key === "Escape" && pedidoEl.classList.contains("abierto") && cerrarPedido());

  /* ------------------------------------------------------------------
     Botón «+» del catálogo: panel para elegir color, técnica, ubicación,
     logo y piezas por talla sin pasar por el personalizador
     ------------------------------------------------------------------ */
  const rapidoEl = $("#rapido");
  const R = { p: null, c: "", t: "", z: "", tallas: {}, archivo: "", archivoOriginal: null };
  let focoRapido = null;
  const rTallas = () => (prod(R.p).tallas.length ? prod(R.p).tallas : ["Piezas"]);
  const rPiezas = () => rTallas().reduce((a, t) => a + (Number(R.tallas[t]) || 0), 0);

  let rapVersion = 0;
  let revisionFotoRapida = 0;
  async function rPintarFoto() {
    const revision = ++revisionFotoRapida;
    const idColor = R.c;
    const version = ++rapVersion, chosen = R.c;
    const p = prod(R.p);
    const cv = $("#rapFoto");
    const img = await ZR.cargar(fotoDe(p, chosen));
    if (revision !== revisionFotoRapida) return;
    if (version !== rapVersion) return;
    const g = cv.getContext("2d");
    g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(prendaTenida(p, img, chosen, 320), 0, 0);
  }

  function rPintar() {
    const p = prod(R.p);
    $("#rapNombre").textContent = p.nombre;
    $("#rapPrecio").textContent = "Cotización por WhatsApp";
    $("#rapSilueta").hidden = variantes(p).length < 2;
    $("#rapSilueta").innerHTML = varianteSelector(p, "rapVariante");
    $("#rapFicha").innerHTML = fichaProducto(p);
    $("#rapColorTxt").textContent = nombreColor(color(R.c));
    $("#rapColor").innerHTML = p.colores
      .map(color)
      .filter(Boolean)
      .map((c) => `<button type="button" class="punto punto--grande${c.id === R.c ? " on" : ""}" style="${tono(c)}" data-rc="${c.id}" aria-pressed="${c.id === R.c}" aria-label="${esc(nombreColor(c))}" title="${esc(nombreColor(c))}"></button>`)
      .join("");
    $("#rapTecnica").innerHTML = p.tecnicas
      .map(tecnica)
      .filter(Boolean)
      .map((t) => `<button type="button" class="op op--tec${t.id === R.t ? " on" : ""}" data-rt="${t.id}" aria-pressed="${t.id === R.t}"><b>${esc(t.nombre)}</b></button>`)
      .join("");
    $("#rapZona").innerHTML = p.zonas
      .map((z) => `<button type="button" class="op${z.id === R.z ? " on" : ""}" data-rz="${z.id}" aria-pressed="${z.id === R.z}">${esc(z.nombre)}</button>`)
      .join("");
    $("#rapTallasTit").textContent = p.tallas.length ? p.tallasNombre || "Tallas" : "Piezas";
    $("#rapTallas").innerHTML = rTallas()
      .map(
        (t) => `<label class="talla"><span>${esc(t)}</span>
          <span class="talla__ctl"><button type="button" data-rtt="${esc(t)}" data-d="-1" aria-label="Menos ${esc(t)}">−</button><input class="num" type="number" inputmode="numeric" min="${minimo(p)}" step="${pasoCantidad(p)}" max="${pasoCantidad(p) > 1 ? 9950 : 9999}" value="${R.tallas[t] || 0}" data-rtalla="${esc(t)}" aria-label="Piezas ${esc(t)}" /><button type="button" data-rtt="${esc(t)}" data-d="1" aria-label="Más ${esc(t)}">+</button></span></label>`,
      )
      .join("");
    rTotal();
  }

  function rTotal() {
    const n = rPiezas();
    $("#rapPiezas").textContent = `${n} ${n === 1 ? "pza" : "pzas"}`;
    $("#rapTotal").textContent = `${n} ${n === 1 ? "pieza" : "piezas"}`;
    $("#rapDetalle").textContent = reglaCantidad(prod(R.p));
  }

  function abrirRapido(art) {
    const p = prod(art.dataset.id);
    Object.assign(R, { p: p.id, c: art.dataset.color || p.colores[0], t: p.tecnicas[0], z: p.zonas[0].id, tallas: minimo(p) ? { Piezas: minimo(p) } : {}, archivo: "", archivoOriginal: null });
    $("#rapArchivo").value = "";
    $("#rapSubirTxt").innerHTML = "<b>Elige tu logo</b> · PNG, JPG, SVG o PDF";
    $("#rapSubir").classList.remove("con-logo");
    $("#rapTexto").value = "";
    $("#rapNotas").value = "";
    $("#rapAviso").textContent = "";
    rPintar();
    rPintarFoto();
    focoRapido = document.activeElement;
    rapidoEl.classList.add("abierto");
    rapidoEl.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("sin-scroll");
    $(".rapido__cuerpo").scrollTop = 0;
    setTimeout(() => $(".pedido__x", rapidoEl).focus(), 50);
  }
  const cerrarRapido = () => {
    rapidoEl.classList.remove("abierto");
    rapidoEl.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("sin-scroll");
    focoRapido?.focus?.();
  };
  $$("[data-cerrar]", rapidoEl).forEach((x) => x.addEventListener("click", cerrarRapido));
  addEventListener("keydown", (e) => e.key === "Escape" && rapidoEl.classList.contains("abierto") && cerrarRapido());

  $(".rapido__cuerpo").addEventListener("click", (e) => {
    const c = e.target.closest("[data-rc]");
    const t = e.target.closest("[data-rt]");
    const z = e.target.closest("[data-rz]");
    const tt = e.target.closest("[data-rtt]");
    if (c) {
      R.c = c.dataset.rc;
      $$("[data-rc]", rapidoEl).forEach((x) => {
        x.classList.toggle("on", x === c);
        x.setAttribute("aria-pressed", x === c);
      });
      $("#rapColorTxt").textContent = nombreColor(color(R.c));
      rPintarFoto();
    }
    if (t || z) {
      const b = t || z;
      if (t) R.t = t.dataset.rt;
      else R.z = z.dataset.rz;
      $$(t ? "[data-rt]" : "[data-rz]", rapidoEl).forEach((x) => {
        x.classList.toggle("on", x === b);
        x.setAttribute("aria-pressed", x === b);
      });
      rTotal();
    }
    if (tt) {
      const k = tt.dataset.rtt;
      R.tallas[k] = Math.min(pasoCantidad(prod(R.p)) > 1 ? 9950 : 9999, Math.max(minimo(prod(R.p)), (Number(R.tallas[k]) || 0) + Number(tt.dataset.d) * pasoCantidad(prod(R.p))));
      $$("[data-rtalla]", rapidoEl).find((i) => i.dataset.rtalla === k).value = R.tallas[k];
      $("#rapAviso").textContent = "";
      rTotal();
    }
  });
  $("#rapSilueta").addEventListener("change", (e) => {
    const p = prod(e.target.value), before = prod(R.p); if (!p || p.familia !== before.familia) return;
    R.p = p.id; R.tallas = {};
    if (!p.colores.includes(R.c)) R.c = p.colores[0];
    if (!p.tecnicas.includes(R.t)) R.t = p.tecnicas[0];
    if (!p.zonas.some(z => z.id === R.z)) R.z = p.zonas[0].id;
    rPintar(); rPintarFoto(); enfocarSilueta($("#rapSilueta"), p.id);
  });
  $("#rapTallas").addEventListener("input", (e) => {
    const i = e.target.closest("[data-rtalla]");
    if (!i) return;
    R.tallas[i.dataset.rtalla] = Math.max(0, Math.min(pasoCantidad(prod(R.p)) > 1 ? 9950 : 9999, Math.floor(Number(i.value) || 0)));
    $("#rapAviso").textContent = "";
    rTotal();
  });
  $("#rapArchivo").addEventListener("change", (e) => {
    const f = e.target.files[0];
    if (f && (f.size > 15 * 1024 * 1024 || !/^image\//.test(f.type) && f.type !== "application/pdf")) {
      e.target.value = ""; R.archivo = ""; R.archivoOriginal = null;
      $("#rapSubirTxt").innerHTML = "<b>Elige tu logo</b> · PNG, JPG, SVG o PDF";
      $("#rapSubir").classList.remove("con-logo");
      $("#rapAviso").textContent = "Elige una imagen o PDF de hasta 15 MB.";
      return;
    }
    R.archivo = f ? f.name : "";
    R.archivoOriginal = f || null;
    $("#rapSubir").classList.toggle("con-logo", !!f);
    $("#rapSubirTxt").innerHTML = f ? `<b>${esc(f.name)}</b> · tócalo para cambiarlo` : "<b>Elige tu logo</b> · PNG, JPG, SVG o PDF";
  });

  let guardandoRapido = false;
  $("#rapidoForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (guardandoRapido) return;
    const p = prod(R.p);
    const n = rPiezas();
    if (!n) {
      $("#rapAviso").textContent = p.tallas.length ? `Indica cuántas piezas quieres de cada ${p.tallasNombre ? "tamaño" : "talla"}.` : "Indica cuántas piezas quieres.";
      $("#rapTallas input")?.focus();
      return;
    }
    if (!cantidadValida(p, n)) { $("#rapAviso").textContent = reglaCantidad(p); return; }
    guardandoRapido = true;
    const boton = $("#rapidoForm button[type='submit']");
    const campos = $$("#rapidoForm fieldset");
    boton.disabled = true;
    campos.forEach((f) => { f.disabled = true; });
    try {
    const t = tecnica(R.t);
    const texto = $("#rapTexto").value.trim();
    const logo = [R.archivo && `archivo «${R.archivo}»`, texto && `texto «${texto}»`].filter(Boolean).join(" + ") || "lo envío por WhatsApp";
    await rPintarFoto(); // que la miniatura tenga el color final
    const m = document.createElement("canvas");
    m.width = m.height = 180;
    const g = m.getContext("2d");
    g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--mesa").trim() || "#e7e7e3";
    g.fillRect(0, 0, 180, 180);
    g.drawImage($("#rapFoto"), 10, 10, 160, 160);
    const item = {
      id: crypto.randomUUID(),
      p: p.id,
      nombre: p.nombre,
      medidas: p.medidas || "",
      detalleMedidas: medidasTexto(p),
      color: color(R.c).nombre,
      colorId: color(R.c).id,
      sku: p.sku,
      colorCodigo: "",
      tallasDetalle: tallasPedido(p, R.tallas),
      tecnica: t.nombre,
      zona: p.zonas.find((z) => z.id === R.z).nombre,
      cm: 0,
      tallas: p.tallas.length ? rTallas().filter((x) => R.tallas[x] > 0).map((x) => `${x}: ${R.tallas[x]}`).join(" · ") : "",
      tallasEtq: p.tallasNombre || "Tallas",
      piezas: n,
      logo,
      notas: $("#rapNotas").value.trim(),
      mini: m.toDataURL("image/jpeg", 0.8),
      tieneLogo: !!R.archivoOriginal,
      tieneRender: false,
    };
    if (R.archivoOriginal) item.archivosTemporales = !await A.guardar(item.id, { logo: R.archivoOriginal, logoNombre: R.archivoOriginal.name });
    pedido.push(item);
    guardarPedido();
    cerrarRapido();
    toast(`${p.nombre} agregado al pedido ✓`);
    } catch (_) { $("#rapAviso").textContent = "No se pudo agregar al pedido. Intenta otra vez."; }
    finally { guardandoRapido = false; boton.disabled = false; campos.forEach((f) => { f.disabled = false; }); }
  });

  const guardarPedido = () => {
    if (!almacen.guardar(LLAVE, pedido)) {
      // si no cabe (muchas imágenes), se guarda sin las vistas previas
      almacen.guardar(
        LLAVE,
        pedido.map((x) => ({ ...x, mini: "" })),
      );
    }
    pintarPedido();
  };

  let guardandoEditor = false;
  $("#panel").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (guardandoEditor) return;
    contarPiezas();
    if (!E.piezas) {
      aviso("Indica cuántas piezas quieres en cada talla para agregarlo al pedido.", true);
      $("#oTallas input")?.focus();
      return;
    }
    if (!cantidadValida(pAct(), E.piezas)) return aviso(reglaCantidad(pAct()), true);
    if (E.modo === "imagen" && !$("#hexLogo").checkValidity()) { $("#otroColor").open = true; $("#hexLogo").focus(); return aviso("Revisa el código HEX del logo.", true); }
    guardandoEditor = true;
    $("#agregar").disabled = true;
    const campos = $$("#panel fieldset");
    campos.forEach((f) => { f.disabled = true; });
    try {
    if (E.modo === "texto") { clearTimeout(tTexto); await actualizarLogoTexto(); }
    await esperarRender();
    const p = pAct();
    const t = tecnica(E.t);
    const z = zAct();
    const tallas = p.tallas.length ? p.tallas : ["Piezas"];
    const desglose = tallas.filter((x) => E.tallas[x] > 0).map((x) => (p.tallas.length ? `${x} ${E.tallas[x]}` : `${E.tallas[x]}`));
    const sinArchivo = E.extras.findIndex((x) => !x.logo);
    if (sinArchivo >= 0) throw new Error(`Sube el archivo del logo ${sinArchivo + 2} o quítalo antes de agregar.`);
    const mini = renderFinal(360).toDataURL("image/jpeg", 0.78);
    const logo =
      E.modo === "imagen" ? (E.logo ? `archivo «${E.logoNombre}»${E.tinta === "original" ? "" : ` en ${nombreTinta()}`}` : "lo envío por WhatsApp") : E.texto.trim() ? `texto «${E.texto.trim()}»` : "lo envío por WhatsApp";
    const tieneRender = !!(E.modo === "imagen" ? E.logo : E.texto.trim());
    const original = E.modo === "imagen" && E.logo ? archivoActual : null;
    const logoPreparado = tieneRender ? await logoActual() : null;
    const logoGeometria = logoPreparado && caja ? normalizarGeometria({anchoPx:logoPreparado.width,altoPx:logoPreparado.height,anchoCm:Math.round((caja.x1-caja.x0)/p.pxPorCm*100)/100}) : null;
    const render = tieneRender ? await new Promise((ok) => renderDiseno(1200).toBlob(ok, "image/png")) : null;
    if (tieneRender && !render) throw new Error("No se pudo guardar el render. Intenta otra vez.");
    const item = {
      id: crypto.randomUUID(),
      p: p.id,
      nombre: p.nombre,
      medidas: p.medidas || "",
      detalleMedidas: medidasTexto(p),
      color: color(E.c).nombre,
      colorId: color(E.c).id,
      sku: p.sku,
      colorCodigo: "",
      tallasDetalle: tallasPedido(p, E.tallas),
      renderOrientativo: !!p.renderOrientativo,
      tecnica: t.nombre,
      zona: z.nombre + (E.dx || E.dy ? " (posición ajustada)" : ""),
      cm: E.cm,
      ...(logoGeometria ? {logoGeometria} : {}),
      tallas: p.tallas.length ? desglose.join(" · ") : "",
      tallasEtq: p.tallasNombre || "Tallas",
      piezas: E.piezas,
      logo,
      colorLogo: E.modo === "texto" ? `HEX ${E.colorTexto.toUpperCase()}` : E.tinta === "original" ? "Original del archivo" : `${nombreTinta()} (${E.tinta.toUpperCase()})`,
      pantone: E.pantone,
      notas: [E.notas.trim(), E.extras.length && tieneRender ? "Logos adicionales (en el render se muestran al frente): " + E.extras.map((x, i) => `${i + 2}) ${x.lugar} · «${x.nombre}» · ${cm(x.cm)}`).join("; ") : ""].filter(Boolean).join(" · ").slice(0, 1500),
      mini,
      tieneLogo: !!original,
      tieneRender,
    };
    const extras = tieneRender ? E.extras.filter((x) => x.archivo).map((x, i) => ({ kind: "logo-" + (i + 2), nombre: x.archivo.name, blob: x.archivo })) : [];
    if (original || render || extras.length) item.archivosTemporales = !await A.guardar(item.id, { logo: original, logoNombre: original?.name, render, extras });
    pedido.push(item);
    guardarPedido();
    aviso("Agregado a tu pedido.");
    toast("Agregado a tu pedido ✓");
    E.tallas = {};
    E.notas = "";
    $("#notas").value = "";
    actualizar();
    abrirPedido();
    } catch (er) { aviso(er.message || "No se pudo agregar al pedido. Intenta otra vez.", true); }
    finally { guardandoEditor = false; $("#agregar").disabled = false; campos.forEach((f) => { f.disabled = false; }); }
  });

  // Solo símbolos del plano básico de Unicode: los emojis de 4 bytes llegan rotos a WhatsApp de escritorio vía wa.me.
  const fechaLarga = (iso) => { const d = new Date(iso + "T12:00:00"); return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("es-MX", { day: "numeric", month: "long" }); };
  function mensajePedido(recibo = null, items = pedido) {
    const nombreDe = (x) => prod(x.p)?.nombre || x.nombre.replace(/ \([CD]\d{4}\)$/, "");
    const lineas = items.map((x) => {
      const r = [`▸ *${nombreDe(x)}* · ${x.color.replace(/ · \d+$/, "")}`];
      r.push(`   ${x.piezas} pzas${x.tallas ? ` (${x.tallas})` : ""} · ${x.tecnica}, ${x.zona.toLowerCase()}${x.cm ? ` ${cm(x.cm)}` : ""}`);
      if (!recibo) {
        // sin folio el equipo no ve la ficha: se manda el detalle completo
        if (prod(x.p)?.sku) r.push(`   SKU ZAIN: ${prod(x.p).sku}`);
        if (x.medidas) r.push(`   Medidas: ${x.detalleMedidas || x.medidas}`);
        r.push(`   Logo: ${x.logo}${x.colorLogo ? ` · ${x.colorLogo}` : ""}`);
        if (x.pantone) r.push(`   Pantone de referencia: ${x.pantone}`);
        if (x.notas) r.push(`   Notas: ${x.notas}`);
      }
      return r.join("\n");
    });
    const pzs = items.reduce((a, x) => a + x.piezas, 0);
    const saludo = cliente.nombre ? `Hola ${C.marca}, soy *${cliente.nombre}*. Quiero cotizar:` : `Hola ${C.marca}, quiero cotizar:`;
    const pie = [`✅ *Total: ${pzs} piezas*`];
    if (cliente.fecha) pie.push(`✎ Lo necesito para el ${fechaLarga(cliente.fecha)}`);
    if (recibo) pie.push(`★ Folio ${recibo.folio}`, `Mi pedido: ${recibo.url}`);
    else pie.push("¿Me ayudan con la cotización?");
    return [saludo, lineas.join("\n"), pie.join("\n")].join("\n\n");
  }

  let pintado = false;
  function pintarPedido() {
    const ultimo=P.ultimo();
    const n = pedido.reduce((a, x) => a + x.piezas, 0);
    const cuenta = $("#cuenta");
    cuenta.hidden = !pedido.length;
    const txt = String(n > 999 ? "999+" : n);
    if (cuenta.textContent !== txt && pintado) {
      cuenta.classList.remove("salta");
      void cuenta.offsetWidth;
      cuenta.classList.add("salta");
    }
    cuenta.textContent = txt;
    pintado = true;
    $("#pedidoItems").innerHTML = pedido.length
      ? pedido
          .map(
            (x, i) => `<article class="renglon">
          ${x.mini ? `<img src="${x.mini}" alt="" width="88" height="88" />` : `<span class="renglon__sin"></span>`}
          <div class="renglon__txt">
            <b>${esc(x.nombre)}</b>
            ${x.medidas ? `<span class="num">${esc(x.medidas)}</span>` : ""}
            <span>${esc(x.color)} · ${esc(x.tecnica)} · ${esc(x.zona.toLowerCase())}</span>
            ${x.tallas ? `<span class="num">${esc(x.tallas)}</span>` : ""}
            <span>Logo: ${esc(x.logo)}</span>
            ${x.colorLogo ? `<span>Color del logo: ${esc(x.colorLogo)}</span>` : ""}
            ${x.pantone ? `<span>Referencia Pantone: ${esc(x.pantone)}</span>` : ""}
            ${x.notas ? `<span>Notas: ${esc(x.notas)}</span>` : ""}
            <span class="renglon__pzs num">${x.piezas} ${x.piezas === 1 ? "pieza" : "piezas"}</span>
            ${C.productosHistoricos?.some(p => p.id === x.p) ? `<span class="pedido__archivos">Selección del catálogo anterior. Para una solicitud nueva, elige un modelo actual; conserva tu logo y render.</span>` : ""}
            ${!cantidadValida(datosItem(x), Number(x.piezas)) ? `<span class="pedido__archivos error">${esc(reglaCantidad(datosItem(x)))}</span><button type="button" class="btn-texto" data-ajustar="${i}">Ajustar cantidad</button>` : esPrenda(x) && faltanPedido() && x === pedido.filter(esPrenda).at(-1) ? `<span class="pedido__archivos error">El pedido mínimo es de ${C.minimoPedido} piezas. Te ${faltanPedido() === 1 ? "falta 1" : `faltan ${faltanPedido()}`}: puedes mezclar modelos, tallas y colores.</span>` : ""}
          </div>
          <div class="renglon__acc">
            ${x.mini ? `<button type="button" class="btn-icono" data-bajar="${i}" aria-label="Descargar render de ${esc(x.nombre)}"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button>` : ""}
            <button type="button" class="btn-icono" data-quitar="${i}" aria-label="Quitar ${esc(x.nombre)}"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg></button>
          </div>
        </article>`,
          )
          .join("")
      : `<div class="pedido__vacio"><p>Tu pedido está vacío.</p>${ultimo?`<p>Tu última solicitud está guardada.</p><a class="btn-texto" href="${esc(ultimo.url)}">Ver solicitud ${esc(ultimo.folio)}</a>`:''}<a class="btn btn--linea" href="#catalogo" data-cerrar-ir>Ver catálogo</a></div>`;

    $("#pedidoPie").innerHTML = pedido.length
      ? `<div class="pedido__total"><span>Cotización personalizada</span><b>Por WhatsApp</b></div>
         <div class="pedido__piezas num">${n} piezas</div>
         <div class="pedido__cliente">
           <label class="campo"><span>Tu nombre o empresa</span><input type="text" id="clienteNombre" maxlength="120" autocomplete="name" enterkeyhint="done" required value="${esc(cliente.nombre)}" aria-describedby="clienteAviso" /></label>
           <label class="campo"><span>¿Para cuándo lo necesitas? <small>Opcional</small></span><input type="date" id="clienteFecha" min="${hoyISO()}" value="${esc(cliente.fecha)}" aria-describedby="clienteAviso" /></label>
           <p class="pedido__archivos" id="clienteAviso" role="status"></p>
         </div>
         <button class="btn btn--wa btn--ancho" type="button" id="compartirPedido" disabled>Preparando archivos…</button>
         <p class="pedido__archivos" id="archivosEstado" role="status"></p>
         <p class="pedido__nota" id="pedidoNota"></p>
         ${C.privacidadPublicada ? '<p class="pedido__privacidad"><a href="/privacidad" target="_blank" rel="noopener noreferrer">Aviso de privacidad</a> · Usamos tu selección y archivos para atender esta cotización.</p>' : ''}
         <details class="pedido__alternativas" id="otrasFormas" hidden>
           <summary>Otra forma de enviar</summary>
           <div>
             <button type="button" class="btn-texto" id="descargarPaquete" disabled>Descargar pedido y archivos (ZIP)</button>
             <a class="btn-texto" id="enviar" href="${esc(wa(mensajePedido()))}" ${C.whatsapp ? 'target="_blank" rel="noopener"' : ""}>Abrir chat de ZAIN solo con el texto</a>
             <p>Si abres el chat por este enlace, adjunta el ZIP descargado para incluir el render y el logo.</p>
           </div>
         </details>
         <button type="button" class="btn-texto" id="vaciar">Vaciar pedido</button>`
      : "";
    prepararArchivos();
  }
  $("#pedidoItems").addEventListener("click", async (e) => {
    const q = e.target.closest("[data-quitar]");
    const b = e.target.closest("[data-bajar]");
    const ajustar = e.target.closest("[data-ajustar]");
    if (ajustar) {
      const x = pedido[Number(ajustar.dataset.ajustar)], p = datosItem(x);
      x.piezas = Math.max(1, minimo(p) + Math.ceil((Math.max(minimo(p), Number(x.piezas)) - minimo(p)) / pasoCantidad(p)) * pasoCantidad(p));
      guardarPedido();
    }
    if (q) {
      const [item] = pedido.splice(Number(q.dataset.quitar), 1);
      A.eliminar([item.id]);
      guardarPedido();
    }
    if (b) {
      const x = pedido[Number(b.dataset.bajar)];
      const files = await A.obtener(x.id);
      if (files?.render) { A.descargar(files.render, `${C.marca.toLowerCase()}-${x.p}-render.png`); return; }
      const a = document.createElement("a");
      a.href = x.mini;
      a.download = `${C.marca.toLowerCase()}-${x.p}-${x.color.toLowerCase().replace(/\s+/g, "-")}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    if (e.target.closest("[data-cerrar-ir]")) cerrarPedido();
  });
  P.ready.then(()=>estadoArchivos());
  $("#pedidoPie").addEventListener("input", (e) => {
    if (e.target.id !== "clienteNombre" && e.target.id !== "clienteFecha") return;
    if (e.target.id === "clienteNombre") cliente.nombre = e.target.value.slice(0, 120);
    else cliente.fecha = /^\d{4}-\d{2}-\d{2}$/.test(e.target.value) ? e.target.value : "";
    almacen.guardar(LLAVE_CLIENTE, cliente);
    e.target.removeAttribute("aria-invalid");
    $("#clienteAviso").textContent = "";
    const enlace = $("#enviar");
    if (enlace && !erroresCantidad().length) enlace.href = wa(mensajePedido());
  });
  const revisarCliente = () => {
    const falta = errorCliente();
    if (!falta) return true;
    const campo = $(falta === "nombre" ? "#clienteNombre" : "#clienteFecha"), aviso = $("#clienteAviso");
    aviso.textContent = falta === "nombre" ? "Escribe tu nombre o el de tu empresa para saber a quién cotizamos." : "Elige una fecha a partir de hoy, o deja el campo vacío.";
    aviso.classList.add("error");
    campo.setAttribute("aria-invalid", "true");
    campo.focus();
    return false;
  };
  $("#pedidoPie").addEventListener("click", async (e) => {
    if (e.target.closest("#enviar") && (compartiendo || erroresCantidad().length)) { e.preventDefault(); estadoArchivos(); return; }
    if (e.target.closest("#enviar, #compartirPedido") && !revisarCliente()) { e.preventDefault(); return; }
    if (e.target.closest("#compartirPedido, #descargarPaquete")) {
      if (!paquete || compartiendo || erroresCantidad().length) return;
      if (e.target.closest("#descargarPaquete")) {
        A.descargar(paquete.zip, "pedido-zain.zip");
        $("#archivosEstado").textContent = "Paquete descargado. Adjunta pedido-zain.zip en el chat de ZAIN.";
        return;
      }
      const snapshot=pedido.map(x=>({...x})), texto=mensajePedido(null,snapshot), datosCliente={nombre:cliente.nombre.trim(),fecha:cliente.fecha};
      compartiendo=true; estadoArchivos();
      // Evita cambiar selecciones durante la subida y conserva el folio al reintentar.
      $$("#pedidoItems button, #vaciar").forEach(x=>x.disabled=true);
      try {
        await P.ready;
        if(P.error()) await P.reintentar();
        let mensaje=texto,receipt=null;
        if(P.activo()) {
          receipt=await P.enviar(snapshot,txt=>{$("#archivosEstado").textContent=txt;},datosCliente);
          mensaje=mensajePedido(receipt,snapshot);
          $("#archivosEstado").textContent=`Solicitud ${receipt.folio} guardada. Confirma el envío del mensaje en WhatsApp.`;
        }
        dispatchEvent(new CustomEvent('zain:whatsapp_click',{detail:{piezas:snapshot.reduce((s,x)=>s+x.piezas,0)}}));
        try{await window.ZAINMedicion?.whatsapp('pedido');}catch{} // Tiempo acotado; funciona también si Google está bloqueado.
        if(receipt&&C.whatsapp){
          // Solo retira lo que la nube confirmó. Conserva selecciones agregadas durante la carga.
          const enviados=new Set(snapshot.map(x=>x.id));
          P.terminar(receipt);
          pedido=pedido.filter(x=>!enviados.has(x.id));
          guardarPedido();
          await A.eliminar([...enviados]);
        }
        // Misma pestaña para evitar popups bloqueados después de subir los archivos.
        location.assign(wa(mensaje));
      }catch(er){
        const estado=$("#archivosEstado"),alternativas=$("#otrasFormas");
        if(estado){estado.textContent=er.message||"No se pudo guardar. Tu pedido sigue aquí; reintenta o envía solo el texto desde Otra forma de enviar.";estado.classList.add("error");}
        else toast("Tu solicitud está guardada. Puedes consultarla desde el carrito vacío.");
        if(alternativas){alternativas.hidden=false;alternativas.open=true;}
      }finally{
        compartiendo=false;
        const boton=$("#compartirPedido");
        if(boton){boton.disabled=!!erroresCantidad().length;boton.textContent="Solicitar cotización por WhatsApp";}
        $$("#pedidoItems button, #vaciar").forEach(x=>x.disabled=false);
      }
      return;
    }
    if (e.target.closest("#vaciar")) {
      A.eliminar(pedido.map((x) => x.id));
      pedido = [];
      guardarPedido();
    }
    if (e.target.closest("#enviar") && !C.whatsapp) cerrarPedido();
  });

  // los botones flotantes (WhatsApp y volver arriba) se esconden en el personalizador: ahí manda la barra de «Agregar»
  new IntersectionObserver(([en]) => {
    $("#flotante").classList.toggle("fuera", en.isIntersecting);
    document.documentElement.classList.toggle("en-taller", en.isIntersecting);
  }, { rootMargin: "-30% 0px -30% 0px" }).observe($(".taller"));

  /* =====================================================================
     ANIMACIONES (solo si <html> tiene .anim; ver el <script> del <head>)
     ===================================================================== */
  const raiz = document.documentElement;
  const portada = $(".portada");
  $$(".portada__datos li").forEach((li, i) => li.style.setProperty("--i", i));
  const abrirPortada = () => portada.classList.add("listo-portada");

  // entrada con el logo, una vez por visita
  const intro = $("#intro");
  if (raiz.classList.contains("anim") && !raiz.classList.contains("sin-intro")) {
    try {
      sessionStorage.setItem("zain-intro", "1");
    } catch (e) {
      /* nada */
    }
    raiz.classList.add("sin-scroll");
    setTimeout(() => {
      intro.classList.add("fuera");
      raiz.classList.remove("sin-scroll");
      setTimeout(abrirPortada, 180);
    }, 1900);
    setTimeout(() => intro.remove(), 2900);
  } else {
    intro.remove();
    requestAnimationFrame(() => requestAnimationFrame(abrirPortada));
  }

  // qué aparece y cómo al hacer scroll
  const marcar = (sel, tipo, escalonado) =>
    $$(sel).forEach((el, i) => {
      el.dataset.anim = tipo;
      if (escalonado) el.style.setProperty("--i", i % escalonado);
    });
  marcar(".seccion__cabeza h2, .empresas h2, .pie__cta h2", "mascara");
  marcar(".seccion__cabeza p", "sube");
  marcar(".filtros, .promos, .taller__lienzo, .taller__panel, .pie__datos, .pie__cta .btn", "sube");
  marcar(".mini", "sube", 4);
  marcar(".tecnica figure, .empresas__foto", "foto");
  $$(".tecnica--serigrafia figure").forEach((f) => window.ZainTrama?.montar(f));
  marcar(".tecnica__txt > *", "sube", 3);
  marcar(".proceso__pasos li", "sube", 4);
  marcar(".empresas__usos li", "sube", 4);
  marcar(".pregunta", "sube", 6);
  if (raiz.classList.contains("anim")) {
    // los títulos «mascara» empiezan recortados al 100% y el navegador los da por
    // invisibles; por eso se vigila su contenedor y se marca el título
    const vigilado = new Map();
    const io = new IntersectionObserver(
      (ents) =>
        ents.forEach((en) => {
          if (!en.isIntersecting) return;
          (vigilado.get(en.target) || [en.target]).forEach((el) => el.classList.add("visto"));
          io.unobserve(en.target);
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    $$("[data-anim], #pieMarca").forEach((el) => {
      if (el.dataset.anim !== "mascara") return io.observe(el);
      const padre = el.parentElement;
      if (!vigilado.has(padre)) vigilado.set(padre, []), io.observe(padre);
      vigilado.get(padre).push(el);
    });
  } else {
    $("#pieMarca").classList.add("visto");
  }

  // cinta: corre sola y acelera con la velocidad del scroll
  const cinta = $("#cinta");
  cinta.innerHTML += cinta.innerHTML; // dos copias para que el ciclo no tenga corte
  let cx = 0;
  let cVel = 0;
  let cY = scrollY;
  let cVisible = false;
  let cRaf = 0;
  const correr = () => {
    const dy = scrollY - cY;
    cY = scrollY;
    cVel += (dy * 0.35 - cVel) * 0.12;
    cx -= 0.6 + Math.abs(cVel);
    const mitad = cinta.scrollWidth / 2;
    if (-cx >= mitad) cx += mitad;
    cinta.style.transform = `translate3d(${cx.toFixed(1)}px,0,0) skewX(${Math.max(-8, Math.min(8, -cVel * 0.4)).toFixed(2)}deg)`;
    cRaf = cVisible ? requestAnimationFrame(correr) : 0;
  };
  if (!reducido) {
    new IntersectionObserver(([en]) => {
      cVisible = en.isIntersecting;
      if (cVisible && !cRaf) cRaf = requestAnimationFrame(correr);
    }).observe(cinta);
  }

  /* ---------------------------------------------------------- arranque */
  actualizar();
  sincronizarTinta();
  pintarPedido();
})();
