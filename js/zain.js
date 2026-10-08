/* ============================================================================
   ZAIN — lógica de la página (portada, catálogo, personalizador y pedido)
   Los datos (productos, precios, WhatsApp…) viven en js/config.js.
   ============================================================================ */
(() => {
  "use strict";
  const C = window.ZAIN;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const dinero = (n) => "$" + Math.round(n).toLocaleString("es-MX");
  const cm = (n) => (Math.round(n * 10) / 10).toFixed(1) + " cm";
  const prod = (id) => C.productos.find((p) => p.id === id);
  const color = (id) => C.colores.find((c) => c.id === id);
  const tecnica = (id) => C.tecnicas.find((t) => t.id === id);
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
    ["Pedido mínimo", `${C.minimoPiezas} piezas`],
    ["Entrega", C.diasEntrega],
    ["Render", "Al instante, aquí mismo"],
  ]
    .map(([a, b]) => `<li><span>${esc(a)}</span><b>${esc(b)}</b></li>`)
    .join("");
  $("#pEntrega").textContent = C.diasEntrega;
  $("#promos").innerHTML = C.promocionales.map((p) => `<li>${esc(p)}</li>`).join("");
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
            <div><dt>Costo</dt><dd class="num">${t.extra ? `+${dinero(t.extra)} por pieza` : "Incluido"}</dd></div>
          </dl>
        </div>
      </article>`,
    )
    .join("");

  const saludo = `Hola ${C.marca} 👋 quiero información para un pedido con mi logo.`;
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
  const MUESTRAS = [
    { p: "polo", c: "marino", t: "bordado", z: "pecho-izq", cm: 9 },
    { p: "playera", c: "negro", t: "serigrafia", z: "centro", cm: 22 },
    { p: "gorra", c: "negro", t: "bordado", z: "frente", cm: 10, e: 0.66 },
    { p: "sudadera", c: "oxford", t: "dtf", z: "centro", cm: 20 },
    { p: "chamarra", c: "botella", t: "bordado", z: "pecho-izq", cm: 9 },
    { p: "bolsa", c: "natural", t: "serigrafia", z: "frente", cm: 22, e: 0.9 },
    { p: "camisa", c: "blanco", t: "bordado", z: "pecho-izq", cm: 8 },
  ].filter((m) => prod(m.p) && color(m.c));

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
    const img = await ZR.cargar(p.foto);
    const S = 640;
    const t = ZR.lienzo(S);
    const g = t.getContext("2d");
    g.drawImage(ZR.tenir(img, col.hex, S), 0, 0);
    const zona = p.zonas.find((z) => z.id === pz.m.z) || p.zonas[0];
    const tinta = ZR.luz(ZR.hexARgb(col.hex)) > 0.55 ? "#141416" : "#f4f4f2";
    const k = S / 1000;
    ZR.estampar(g, img, ZR.logoZain(tinta), { x: zona.x * k, y: zona.y * k, ancho: pz.m.cm * p.pxPorCm * k, tecnica: pz.m.t, S });
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
  const categorias = ["Todo", ...new Set(C.productos.map((p) => p.categoria))];
  let filtro = "Todo";
  $("#filtros").innerHTML = categorias
    .map((c) => `<button type="button" role="tab" class="filtro${c === filtro ? " on" : ""}" aria-selected="${c === filtro}" data-cat="${esc(c)}">${esc(c)}</button>`)
    .join("");
  $("#filtros").addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]");
    if (!b) return;
    filtro = b.dataset.cat;
    $$(".filtro").forEach((x) => {
      x.classList.toggle("on", x === b);
      x.setAttribute("aria-selected", x === b);
    });
    $$(".producto").forEach((t) => (t.hidden = filtro !== "Todo" && t.dataset.cat !== filtro));
  });

  const precioTxt = (p) => (p.precio ? `<b class="num">${dinero(p.precio)}</b><span>por pieza</span>` : `<b>A cotizar</b>`);
  $("#rejilla").innerHTML = C.productos
    .map((p) => {
      const cols = p.colores.map(color).filter(Boolean);
      return `<article class="producto" data-id="${esc(p.id)}" data-cat="${esc(p.categoria)}">
        <div class="producto__foto"><canvas width="560" height="560" aria-label="${esc(p.nombre)}" role="img"></canvas></div>
        <div class="producto__colores" role="radiogroup" aria-label="Color de ${esc(p.nombre)}">
          ${cols.map((c, i) => `<button type="button" role="radio" class="punto${i ? "" : " on"}" style="--c:${c.hex}" data-color="${c.id}" aria-checked="${!i}" aria-label="${esc(c.nombre)}" title="${esc(c.nombre)}"></button>`).join("")}
        </div>
        <div class="producto__txt">
          <h3>${esc(p.nombre)}</h3>
          <p>${esc(p.descripcion)}</p>
          <ul class="producto__tec">${p.tecnicas.map((t) => `<li>${esc(tecnica(t)?.nombre)}</li>`).join("")}</ul>
        </div>
        <div class="producto__pie">
          <div class="producto__precio">${precioTxt(p)}</div>
          <button type="button" class="btn btn--tinta btn--chico" data-personalizar>Personalizar</button>
        </div>
      </article>`;
    })
    .join("");

  const pintarTarjeta = async (art, idColor) => {
    const p = prod(art.dataset.id);
    const cv = $("canvas", art);
    const img = await ZR.cargar(p.foto);
    const g = cv.getContext("2d");
    g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(ZR.tenir(img, color(idColor).hex, 560), 0, 0);
    if (art.classList.contains("lista")) {
      cv.classList.remove("cambia");
      void cv.offsetWidth;
      cv.classList.add("cambia");
    }
    $(".producto__foto", art).style.setProperty("--c", color(idColor).hex);
    art.dataset.color = idColor;
    art.classList.add("lista");
  };
  const ioTarjetas = new IntersectionObserver(
    (ents) =>
      ents.forEach((en) => {
        if (!en.isIntersecting) return;
        ioTarjetas.unobserve(en.target);
        pintarTarjeta(en.target, prod(en.target.dataset.id).colores[0]);
      }),
    { rootMargin: "300px" },
  );
  $$(".producto").forEach((a) => ioTarjetas.observe(a));
  $("#rejilla").addEventListener("click", (e) => {
    const art = e.target.closest(".producto");
    if (!art) return;
    const punto = e.target.closest("[data-color]");
    if (punto) {
      $$(".punto", art).forEach((x) => {
        x.classList.toggle("on", x === punto);
        x.setAttribute("aria-checked", x === punto);
      });
      pintarTarjeta(art, punto.dataset.color);
      return;
    }
    if (e.target.closest("[data-personalizar]")) {
      const p = prod(art.dataset.id);
      abrirEnTaller({ p: p.id, c: art.dataset.color || p.colores[0] });
    }
  });

  /* =====================================================================
     PERSONALIZADOR
     ===================================================================== */
  const E = {
    p: "polo",
    c: "marino",
    t: "bordado",
    z: "pecho-izq",
    cm: 9,
    modo: "imagen",
    logo: null, // canvas del logo subido
    logoNombre: "",
    tinta: "original", // color del logo subido: "original" o un hex
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

  function construirOpciones() {
    const p = pAct();
    if (!p.colores.includes(E.c)) E.c = p.colores[0];
    if (!p.tecnicas.includes(E.t)) E.t = p.tecnicas[0];
    if (!p.zonas.some((z) => z.id === E.z)) E.z = p.zonas[0].id;

    $("#oPrenda").innerHTML = C.productos
      .map((x) => `<button type="button" class="op op--prenda${x.id === E.p ? " on" : ""}" data-p="${esc(x.id)}" aria-pressed="${x.id === E.p}"><img src="${esc(x.foto)}" alt="" width="64" height="64" loading="lazy" /><span>${esc(x.nombre)}</span></button>`)
      .join("");
    $("#oColor").innerHTML = p.colores
      .map(color)
      .filter(Boolean)
      .map((c) => `<button type="button" class="punto punto--grande${c.id === E.c ? " on" : ""}" style="--c:${c.hex}" data-c="${c.id}" aria-pressed="${c.id === E.c}" aria-label="${esc(c.nombre)}" title="${esc(c.nombre)}"></button>`)
      .join("");
    $("#oTecnica").innerHTML = p.tecnicas
      .map(tecnica)
      .filter(Boolean)
      .map((t) => `<button type="button" class="op op--tec${t.id === E.t ? " on" : ""}" data-t="${t.id}" aria-pressed="${t.id === E.t}"><b>${esc(t.nombre)}</b><small class="num">${t.extra ? "+" + dinero(t.extra) : "Incluido"}</small></button>`)
      .join("");
    $("#oZona").innerHTML = p.zonas
      .map((z) => `<button type="button" class="op op--zona${z.id === E.z ? " on" : ""}" data-z="${z.id}" aria-pressed="${z.id === E.z}">${esc(z.nombre)}</button>`)
      .join("");
    const tallas = p.tallas.length ? p.tallas : ["Piezas"];
    tallas.forEach((t) => {
      if (!(t in E.tallas)) E.tallas[t] = 0;
    });
    $("#oTallas").innerHTML = tallas
      .map(
        (t) => `<label class="talla"><span>${esc(t)}</span>
          <span class="talla__ctl"><button type="button" data-tt="${esc(t)}" data-d="-1" aria-label="Menos ${esc(t)}">−</button><input class="num" type="number" inputmode="numeric" min="0" max="9999" value="${E.tallas[t] || 0}" data-talla="${esc(t)}" aria-label="Piezas talla ${esc(t)}" /><button type="button" data-tt="${esc(t)}" data-d="1" aria-label="Más ${esc(t)}">+</button></span></label>`,
      )
      .join("");
    ajustarTamano();
    $("#vColor").textContent = color(E.c).nombre;
  }

  function ajustarTamano() {
    const z = zAct();
    const r = $("#tamano");
    r.max = z.max;
    E.cm = Math.min(Math.max(E.cm, 3), z.max);
    r.value = E.cm;
    $("#tamanoTxt").textContent = cm(E.cm);
    $("#reglaTxt").textContent = cm(E.cm);
  }

  function contarPiezas() {
    const p = pAct();
    const tallas = p.tallas.length ? p.tallas : ["Piezas"];
    E.piezas = tallas.reduce((a, t) => a + (Number(E.tallas[t]) || 0), 0);
    $("#vPiezas").textContent = `${E.piezas} ${E.piezas === 1 ? "pza" : "pzas"}`;
    const t = tecnica(E.t);
    const unit = p.precio ? p.precio + (t?.extra || 0) : 0;
    const pt = $("#precioTxt");
    const nuevo = unit ? (E.piezas ? dinero(unit * E.piezas) : `${dinero(unit)} c/u`) : "A cotizar";
    if (pt.textContent !== nuevo && pt.textContent !== "—" && !reducido) {
      pt.classList.remove("cambia");
      void pt.offsetWidth;
      pt.classList.add("cambia");
    }
    pt.textContent = nuevo;
    $("#precioDetalle").textContent = unit && E.piezas ? `${E.piezas} × ${dinero(unit)} (${p.nombre.split(" ")[0].toLowerCase()} ${dinero(p.precio)} + ${t.nombre.toLowerCase()} ${dinero(t.extra)})` : unit ? "Indica tus piezas por talla" : "";
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

  async function logoActual() {
    if (E.modo === "imagen" && E.logo) return E.tinta === "original" ? E.logo : entintar(E.logo, E.tinta);
    if (E.modo === "texto" && E.texto.trim()) return logoTexto;
    // sin logo todavía: un ejemplo «TU LOGO» para ver ubicación y tamaño
    if (!ejemplo) ejemplo = await ZR.logoDeTexto("Tu logo", "ancha", "#ffffff");
    const claro = ZR.luz(ZR.hexARgb(color(E.c).hex)) > 0.55;
    const c = ZR.lienzo(ejemplo.width, ejemplo.height);
    const g = c.getContext("2d");
    g.drawImage(ejemplo, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = claro ? "#1b1b1d" : "#f4f4f2";
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  let rafRender = 0;
  let renderVersion = 0;
  let transicion = false;
  let caja = null; // dónde quedó el logo en el lienzo (para arrastrarlo)
  const pedirRender = () => {
    if (rafRender) return;
    rafRender = requestAnimationFrame(async () => {
      rafRender = 0;
      const v = ++renderVersion;
      const p = pAct();
      const z = zAct();
      const img = await ZR.cargar(p.foto);
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
      lg.drawImage(ZR.tenir(img, color(E.c).hex, 1000), 0, 0);
      if (logo) {
        // si el logo es más alto que ancho, se limita su alto para que no se salga de la zona
        let ancho = E.cm * p.pxPorCm;
        const altoMax = z.max * p.pxPorCm * 0.9;
        if ((ancho * logo.height) / logo.width > altoMax) ancho = (altoMax * logo.width) / logo.height;
        const lx = z.x + E.dx * p.pxPorCm;
        const ly = z.y + E.dy * p.pxPorCm;
        ZR.estampar(lg, img, logo, { x: lx, y: ly, ancho, tecnica: E.t, S: 1000 });
        const alto = (ancho * logo.height) / logo.width;
        caja = { x0: lx - ancho / 2, y0: ly - alto / 2, x1: lx + ancho / 2, y1: ly + alto / 2 };
        const propio = (E.modo === "imagen" && E.logo) || (E.modo === "texto" && E.texto.trim());
        const poco = propio && Math.abs(brilloLogo(logo) - ZR.luz(ZR.hexARgb(color(E.c).hex))) < 0.2;
        const a = $("#aviso");
        if (poco) aviso(E.modo === "imagen" ? "Tu logo casi no se ve sobre este color. Prueba otro «Color del logo»." : "El texto casi no se ve sobre este color. Cambia el color del texto.");
        else if (/casi no se ve/.test(a.textContent)) aviso("");
      }
      $("#pieTxt").textContent = `${p.nombre} · ${color(E.c).nombre} · ${tecnica(E.t).nombre}`;
      lienzo.classList.add("listo");
    });
  };

  function actualizar() {
    construirOpciones();
    contarPiezas();
    pedirRender();
    if (E.info && E.modo === "imagen") pintarAnalisis();
  }

  $("#oPrenda").addEventListener("click", (e) => {
    const b = e.target.closest("[data-p]");
    if (!b) return;
    E.p = b.dataset.p; transicion = true;
    E.dx = E.dy = 0;
    if (E.info) {
      construirOpciones();
      E.cm = tamanoIdeal();
      E.t = tecnicaIdeal(E.info);
    }
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
    E.tallas[t] = Math.max(0, (Number(E.tallas[t]) || 0) + Number(b.dataset.d));
    $(`input[data-talla="${CSS.escape(t)}"]`).value = E.tallas[t];
    contarPiezas();
  });
  $("#oTallas").addEventListener("input", (e) => {
    const i = e.target.closest("[data-talla]");
    if (!i) return;
    E.tallas[i.dataset.talla] = Math.max(0, Math.min(9999, Math.floor(Number(i.value) || 0)));
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
    const f = E.info?.esFoto ? (z.max <= 12 ? 0.9 : 0.78) : z.max <= 12 ? (pr >= 2.2 ? 0.9 : pr >= 1.2 ? 0.8 : 0.66) : pr >= 1.5 ? 0.85 : 0.7;
    return Math.round(z.max * f * 2) / 2;
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
    const luzPrenda = ZR.luz(ZR.hexARgb(color(E.c).hex));
    const seVe = info.colores.some((c) => Math.abs(ZR.luz(ZR.hexARgb(c)) - luzPrenda) >= 0.25);
    if (!info.esFoto && info.nColores <= 3 && !seVe) {
      E.tinta = luzPrenda < 0.5 ? "#f6f6f4" : "#141416";
      cambios.push(`Lo pasamos a ${luzPrenda < 0.5 ? "blanco" : "negro"} para que resalte sobre ${color(E.c).nombre.toLowerCase()}`);
    }
    $$("#oTinta [data-tinta]").forEach((x) => {
      x.classList.toggle("on", x.dataset.tinta === E.tinta);
      x.setAttribute("aria-pressed", x.dataset.tinta === E.tinta);
    });
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
    archivoActual = f;
    $("#subirTxt").innerHTML = `<b>Analizando tu logo…</b>`;
    $("#subir").classList.add("analizando");
    try {
      crudo = await ZR.abrirArchivo(f);
      await new Promise((r) => setTimeout(r, 30)); // deja pintar el «Analizando…»
      analizar();
      E.logoNombre = f.name;
      $("#subirTxt").innerHTML = `<b>${esc(f.name)}</b> · toca para cambiarlo`;
      $("#subir").classList.add("con-logo");
      aviso("");
    } catch (er) {
      $("#subirTxt").innerHTML = `<b>Elige tu logo</b> o arrástralo aquí · PNG, JPG o SVG`;
      aviso(er.message, true);
    } finally {
      $("#subir").classList.remove("analizando");
    }
  };
  $("#archivo").addEventListener("change", (e) => procesarArchivo(e.target.files[0]));
  $("#oTinta").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tinta]");
    if (!b) return;
    E.tinta = b.dataset.tinta;
    transicion = true;
    $$("#oTinta [data-tinta]").forEach((x) => {
      x.classList.toggle("on", x === b);
      x.setAttribute("aria-pressed", x === b);
    });
    pedirRender();
  });
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
    tTexto = setTimeout(async () => {
      E.texto = $("#texto").value;
      E.letra = $("#letra").value;
      E.colorTexto = $("#colorTexto").value;
      logoTexto = E.texto.trim() ? await ZR.logoDeTexto(E.texto.trim(), E.letra, E.colorTexto) : null;
      pedirRender();
    }, 120);
  };
  ["#texto", "#letra", "#colorTexto"].forEach((s) => $(s).addEventListener("input", rehacerTexto));

  // render final (para descargar y para el pedido): fondo, prenda y ficha técnica
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
    g.fillText(`${C.marca} · ${p.nombre} · ${color(E.c).nombre}`, S * 0.05, S * 0.935);
    g.font = `400 ${Math.round(S * 0.019)}px 'JetBrains Mono', monospace`;
    g.fillStyle = "#4a4a4e";
    g.fillText(`${tecnica(E.t).nombre} · ${z.nombre} · logo ${cm(E.cm)}`, S * 0.05, S * 0.966);
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
  let pedido = almacen.leer(LLAVE, []);
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

  $("#panel").addEventListener("submit", (e) => {
    e.preventDefault();
    contarPiezas();
    if (!E.piezas) {
      aviso("Indica cuántas piezas quieres en cada talla para agregarlo al pedido.", true);
      $("#oTallas input")?.focus();
      return;
    }
    const p = pAct();
    const t = tecnica(E.t);
    const z = zAct();
    const tallas = p.tallas.length ? p.tallas : ["Piezas"];
    const desglose = tallas.filter((x) => E.tallas[x] > 0).map((x) => (p.tallas.length ? `${x} ${E.tallas[x]}` : `${E.tallas[x]}`));
    const mini = renderFinal(360).toDataURL("image/jpeg", 0.78);
    const logo =
      E.modo === "imagen" ? (E.logo ? `archivo «${E.logoNombre}»${E.tinta === "original" ? "" : ` en ${$(`#oTinta [data-tinta="${E.tinta}"]`).textContent.trim().toLowerCase()}`}` : "lo envío por WhatsApp") : E.texto.trim() ? `texto «${E.texto.trim()}»` : "lo envío por WhatsApp";
    pedido.push({
      id: Date.now().toString(36),
      p: p.id,
      nombre: p.nombre,
      color: color(E.c).nombre,
      tecnica: t.nombre,
      zona: z.nombre + (E.dx || E.dy ? " (posición ajustada)" : ""),
      cm: E.cm,
      tallas: p.tallas.length ? desglose.join(" · ") : "",
      piezas: E.piezas,
      unit: p.precio ? p.precio + (t.extra || 0) : 0,
      logo,
      notas: E.notas.trim(),
      mini,
    });
    guardarPedido();
    aviso(E.piezas < C.minimoPiezas ? `Agregado. Ojo: el pedido mínimo es de ${C.minimoPiezas} piezas en total.` : "Agregado a tu pedido.");
    toast("Agregado a tu pedido ✓");
    E.tallas = {};
    E.notas = "";
    $("#notas").value = "";
    actualizar();
    abrirPedido();
  });

  function mensajePedido() {
    const lineas = pedido.map((x, i) => {
      const r = [`${i + 1}) ${x.nombre} — ${x.color}`, `   ${x.tecnica} · ${x.zona} · logo de ${cm(x.cm)}`];
      r.push(`   ${x.tallas ? `Tallas: ${x.tallas} (${x.piezas} pzas)` : `${x.piezas} pzas`}`);
      if (x.unit) r.push(`   Referencia: ${dinero(x.unit)} c/u → ${dinero(x.unit * x.piezas)}`);
      r.push(`   Logo: ${x.logo}`);
      if (x.notas) r.push(`   Notas: ${x.notas}`);
      return r.join("\n");
    });
    const total = pedido.reduce((a, x) => a + x.unit * x.piezas, 0);
    const pzs = pedido.reduce((a, x) => a + x.piezas, 0);
    return `Hola ${C.marca} 👋 quiero cotizar este pedido:\n\n${lineas.join("\n\n")}\n\n${total ? `Total de referencia: ${dinero(total)} ${C.moneda} (${pzs} piezas)` : `Total: ${pzs} piezas`}\n\nTe mando mi logo y los renders por aquí. ¿Me confirman precio final y fecha de entrega?`;
  }

  let pintado = false;
  function pintarPedido() {
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
            <span>${esc(x.color)} · ${esc(x.tecnica)} · ${esc(x.zona.toLowerCase())}</span>
            <span class="num">${x.tallas ? esc(x.tallas) : ""}</span>
            <span class="renglon__pzs num">${x.piezas} pzas${x.unit ? ` · ${dinero(x.unit * x.piezas)}` : " · a cotizar"}</span>
          </div>
          <div class="renglon__acc">
            ${x.mini ? `<button type="button" class="btn-icono" data-bajar="${i}" aria-label="Descargar render de ${esc(x.nombre)}"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg></button>` : ""}
            <button type="button" class="btn-icono" data-quitar="${i}" aria-label="Quitar ${esc(x.nombre)}"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12"/></svg></button>
          </div>
        </article>`,
          )
          .join("")
      : `<div class="pedido__vacio"><p>Tu pedido está vacío.</p><a class="btn btn--linea" href="#catalogo" data-cerrar-ir>Ver catálogo</a></div>`;

    const total = pedido.reduce((a, x) => a + x.unit * x.piezas, 0);
    const conPrecio = pedido.every((x) => x.unit);
    $("#pedidoPie").innerHTML = pedido.length
      ? `<div class="pedido__total"><span>Total de referencia</span><b class="num">${total ? dinero(total) + " " + C.moneda + (conPrecio ? "" : " +") : "A cotizar"}</b></div>
         <div class="pedido__piezas num">${n} piezas${n < C.minimoPiezas ? ` · mínimo ${C.minimoPiezas}` : ""}</div>
         <a class="btn btn--wa btn--ancho" id="enviar" href="${esc(wa(mensajePedido()))}" ${C.whatsapp ? 'target="_blank" rel="noopener"' : ""}>
           <svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19l-4 1Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.4-1.8-.9-.8.8a4 4 0 0 1-2.5-2.5l.8-.8-.9-1.8L9 9.5Z"/></svg>
           Enviar pedido por WhatsApp</a>
         <p class="pedido__nota">Se abre WhatsApp con tu pedido escrito. Adjunta ahí tu logo y los renders.</p>
         <button type="button" class="btn-texto" id="vaciar">Vaciar pedido</button>`
      : "";
  }
  $("#pedidoItems").addEventListener("click", (e) => {
    const q = e.target.closest("[data-quitar]");
    const b = e.target.closest("[data-bajar]");
    if (q) {
      pedido.splice(Number(q.dataset.quitar), 1);
      guardarPedido();
    }
    if (b) {
      const x = pedido[Number(b.dataset.bajar)];
      const a = document.createElement("a");
      a.href = x.mini;
      a.download = `${C.marca.toLowerCase()}-${x.p}-${x.color.toLowerCase().replace(/\s+/g, "-")}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    if (e.target.closest("[data-cerrar-ir]")) cerrarPedido();
  });
  $("#pedidoPie").addEventListener("click", (e) => {
    if (e.target.closest("#vaciar")) {
      pedido = [];
      guardarPedido();
    }
    if (e.target.closest("#enviar") && !C.whatsapp) cerrarPedido();
  });

  // el botón flotante de WhatsApp se esconde en el personalizador (ahí manda la barra de «Agregar»)
  new IntersectionObserver(([en]) => $("#flotante").classList.toggle("fuera", en.isIntersecting), { rootMargin: "-30% 0px -30% 0px" }).observe($(".taller"));

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
  marcar(".producto", "sube", 4);
  marcar(".tecnica figure, .empresas__foto", "foto");
  $$(".tecnica--serigrafia figure").forEach((f) => window.ZainTrama?.montar(f));
  marcar(".tecnica__txt > *", "sube", 3);
  marcar(".proceso__pasos li", "sube", 4);
  marcar(".empresas__usos li", "sube", 4);
  marcar(".pregunta", "sube", 6);
  if (raiz.classList.contains("anim")) {
    const io = new IntersectionObserver(
      (ents) =>
        ents.forEach((en) => {
          if (!en.isIntersecting) return;
          en.target.classList.add("visto");
          io.unobserve(en.target);
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    $$("[data-anim], #pieMarca").forEach((el) => io.observe(el));
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
  pintarPedido();
})();
