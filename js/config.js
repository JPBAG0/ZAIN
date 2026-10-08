/* ============================================================================
   ZAIN — CONFIGURACIÓN DE LA PÁGINA
   ----------------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas editar para cambiar datos, precios,
   productos, colores, técnicas y preguntas frecuentes. No hace falta tocar el
   HTML ni el resto del código.

   ✏️  = dato de ejemplo: cámbialo por el real antes de publicar.
   ============================================================================ */

window.ZAIN = {
  marca: "ZAIN",

  // ✏️ WhatsApp con lada de país, sin espacios ni signos. México: 52 + 10 dígitos.
  //    Ejemplo: "523312345678". Mientras esté vacío, los botones llevan a «Contacto».
  whatsapp: "525662923967",

  // ✏️ Datos de contacto que aparecen en el pie de página
  correo: "hola@zain.mx",
  ciudad: "Guadalajara, Jalisco",
  instagram: "", // ej. "https://instagram.com/zain"
  horario: "Lunes a viernes de 9:00 a 18:00 · Sábados de 9:00 a 14:00",

  // ✏️ Datos rápidos de la portada
  minimoPiezas: 12,
  diasEntrega: "7 a 12 días hábiles",

  // Moneda para mostrar precios
  moneda: "MXN",

  /* --------------------------------------------------------------------------
     COLORES DE PRENDA
     Cada producto elige cuáles usa (por su id). El color se aplica sobre la
     foto blanca del producto, así que no necesitas una foto por color.
     -------------------------------------------------------------------------- */
  colores: [
    { id: "blanco", nombre: "Blanco", hex: "#f7f7f5" },
    { id: "negro", nombre: "Negro", hex: "#1d1d1f" },
    { id: "marino", nombre: "Azul marino", hex: "#1f2a44" },
    { id: "rey", nombre: "Azul rey", hex: "#2546b8" },
    { id: "gris", nombre: "Gris jaspe", hex: "#a9abad" },
    { id: "oxford", nombre: "Gris oxford", hex: "#4a4c50" },
    { id: "rojo", nombre: "Rojo", hex: "#b8262c" },
    { id: "vino", nombre: "Vino", hex: "#5e1f2d" },
    { id: "botella", nombre: "Verde botella", hex: "#1f4a36" },
    { id: "olivo", nombre: "Verde olivo", hex: "#5d6040" },
    { id: "arena", nombre: "Arena", hex: "#d8cbb2" },
    { id: "natural", nombre: "Natural", hex: "#ffffff" }, // deja la foto tal cual (manta cruda)
  ],

  /* --------------------------------------------------------------------------
     TÉCNICAS
     extra = cuánto se suma por pieza (✏️ precios de ejemplo). 0 = sin cargo.
     -------------------------------------------------------------------------- */
  tecnicas: [
    {
      id: "bordado",
      nombre: "Bordado",
      extra: 45,
      corto: "Hilo cosido a la prenda. El acabado más elegante y el que más dura.",
      ideal: "Polos, camisas, chamarras y gorras",
      detalle: "Relieve real · hasta 12 colores de hilo · no se despinta",
      foto: "img/fotos/t-bordado.webp",
    },
    {
      id: "serigrafia",
      nombre: "Serigrafía",
      extra: 25,
      corto: "Tinta aplicada con malla. Colores sólidos y el mejor precio en volumen.",
      ideal: "Playeras, sudaderas y bolsas en volumen",
      detalle: "Tintas planas · ideal desde 50 piezas · muy resistente al lavado",
      foto: "img/fotos/t-serigrafia.webp",
    },
    {
      id: "dtf",
      nombre: "DTF",
      extra: 35,
      corto: "Transfer a todo color planchado con calor. Fotos, degradados y detalle fino.",
      ideal: "Logos a todo color y tirajes cortos",
      detalle: "Color ilimitado · detalle fino · listo desde 1 pieza",
      foto: "img/fotos/t-dtf.webp",
    },
  ],

  /* --------------------------------------------------------------------------
     PRODUCTOS (catálogo de ejemplo ✏️)
     Para agregar un producto copia un bloque { ... } completo y cambia:
       id        identificador sin espacios (único)
       nombre    como se ve en la página
       categoria "Textil", "Accesorios" o la que quieras (crea un filtro nuevo)
       foto      foto de la prenda EN BLANCO con fondo transparente (.webp o .png),
                 cuadrada (1000×1000 recomendado)
       precio    precio base por pieza ✏️ (pon 0 para mostrar «A cotizar»)
       colores   ids de la lista de colores de arriba (el primero es el que se ve en el catálogo)
       tecnicas  ids de la lista de técnicas de arriba
       tallas    lista de tallas; [] para unitalla
       pxPorCm   cuántos píxeles de la foto equivalen a 1 cm (para el tamaño del logo)
       zonas     dónde se puede poner el logo: x, y = centro en píxeles de la
                 foto (de 0 a 1000); max = ancho máximo del logo en cm
     -------------------------------------------------------------------------- */
  productos: [
    {
      id: "playera",
      nombre: "Playera cuello redondo",
      categoria: "Textil",
      descripcion: "Algodón peinado 180 g. La base de todo uniforme y evento.",
      foto: "img/productos/playera.webp",
      precio: 89,
      colores: ["negro", "blanco", "marino", "rey", "gris", "oxford", "rojo", "vino", "botella", "arena"],
      tecnicas: ["serigrafia", "dtf", "bordado"],
      tallas: ["CH", "M", "G", "XG", "2XG"],
      pxPorCm: 10.4,
      zonas: [
        { id: "pecho-izq", nombre: "Pecho izquierdo", x: 640, y: 300, max: 10 },
        { id: "centro", nombre: "Centro del pecho", x: 500, y: 360, max: 28 },
        { id: "pecho-der", nombre: "Pecho derecho", x: 360, y: 300, max: 10 },
      ],
    },
    {
      id: "polo",
      nombre: "Polo piqué",
      categoria: "Textil",
      descripcion: "Piqué 220 g con cuello tejido. El uniforme de oficina por excelencia.",
      foto: "img/productos/polo.webp",
      precio: 189,
      colores: ["marino", "blanco", "negro", "rey", "gris", "rojo", "vino", "botella", "arena"],
      tecnicas: ["bordado", "dtf", "serigrafia"],
      tallas: ["CH", "M", "G", "XG", "2XG"],
      pxPorCm: 10,
      zonas: [
        { id: "pecho-izq", nombre: "Pecho izquierdo", x: 640, y: 330, max: 10 },
        { id: "pecho-der", nombre: "Pecho derecho", x: 360, y: 330, max: 10 },
        { id: "centro", nombre: "Centro del pecho", x: 500, y: 420, max: 24 },
      ],
    },
    {
      id: "camisa",
      nombre: "Camisa oxford",
      categoria: "Textil",
      descripcion: "Manga larga, tela oxford. Para atención a clientes y fuerza de ventas.",
      foto: "img/productos/camisa.webp",
      precio: 329,
      colores: ["blanco", "marino", "rey", "gris", "negro", "arena"],
      tecnicas: ["bordado"],
      tallas: ["CH", "M", "G", "XG", "2XG"],
      pxPorCm: 7.7,
      zonas: [
        { id: "pecho-izq", nombre: "Pecho izquierdo", x: 615, y: 300, max: 9 },
        { id: "pecho-der", nombre: "Pecho derecho", x: 385, y: 300, max: 9 },
      ],
    },
    {
      id: "chamarra",
      nombre: "Chamarra softshell",
      categoria: "Textil",
      descripcion: "Cierre completo, rompevientos y repelente al agua. Para campo y temporada de frío.",
      foto: "img/productos/chamarra.webp",
      precio: 549,
      colores: ["negro", "marino", "oxford", "rojo", "botella", "olivo", "blanco"],
      tecnicas: ["bordado", "dtf"],
      tallas: ["CH", "M", "G", "XG", "2XG"],
      pxPorCm: 7.7,
      zonas: [
        { id: "pecho-izq", nombre: "Pecho izquierdo", x: 615, y: 300, max: 10 },
        { id: "pecho-der", nombre: "Pecho derecho", x: 385, y: 300, max: 10 },
      ],
    },
    {
      id: "sudadera",
      nombre: "Sudadera con gorro",
      categoria: "Textil",
      descripcion: "Felpa perchada 280 g con bolsa canguro. Merch que sí se usa.",
      foto: "img/productos/sudadera.webp",
      precio: 389,
      colores: ["gris", "negro", "oxford", "marino", "vino", "botella", "arena", "blanco"],
      tecnicas: ["serigrafia", "dtf", "bordado"],
      tallas: ["CH", "M", "G", "XG", "2XG"],
      pxPorCm: 7.7,
      zonas: [
        { id: "centro", nombre: "Centro del pecho", x: 500, y: 390, max: 26 },
        { id: "pecho-izq", nombre: "Pecho izquierdo", x: 610, y: 320, max: 10 },
      ],
    },
    {
      id: "gorra",
      nombre: "Gorra 6 paneles",
      categoria: "Accesorios",
      descripcion: "Frente estructurado y ajuste trasero. El accesorio más pedido para eventos.",
      foto: "img/productos/gorra.webp",
      precio: 129,
      colores: ["arena", "negro", "blanco", "marino", "rey", "rojo", "gris", "botella"],
      tecnicas: ["bordado", "dtf"],
      tallas: [],
      pxPorCm: 42,
      zonas: [{ id: "frente", nombre: "Frente", x: 500, y: 430, max: 12 }],
    },
    {
      id: "bolsa",
      nombre: "Bolsa de manta",
      categoria: "Accesorios",
      descripcion: "Manta gruesa 38 × 42 cm. Para ferias, kits de bienvenida y tiendas.",
      foto: "img/productos/bolsa.webp",
      precio: 59,
      colores: ["natural", "negro", "marino", "rojo", "botella"],
      tecnicas: ["serigrafia", "dtf"],
      tallas: [],
      pxPorCm: 14,
      zonas: [{ id: "frente", nombre: "Frente", x: 480, y: 640, max: 28 }],
    },
  ],

  /* Otros artículos promocionales que se manejan (se muestran como lista) ✏️ */
  promocionales: ["Termos", "Tazas", "Libretas", "Plumas", "Mandiles", "Chalecos", "Lanyards", "Paraguas"],

  /* Preguntas frecuentes ✏️ */
  preguntas: [
    {
      p: "¿Cuál es el pedido mínimo?",
      r: "En bordado y DTF trabajamos desde 12 piezas. En serigrafía conviene desde 50 piezas por diseño, porque el costo de la malla se reparte entre más piezas.",
    },
    {
      p: "¿Cuánto tarda mi pedido?",
      r: "Normalmente de 7 a 12 días hábiles a partir de que apruebas el diseño y se confirma el anticipo. Si tienes fecha de evento, dínosla y la planeamos.",
    },
    {
      p: "¿Qué archivo de logo necesito?",
      r: "Lo ideal es vector (AI, PDF, SVG o EPS). Si solo tienes una imagen (PNG o JPG), también sirve: nosotros la preparamos para bordado o impresión.",
    },
    {
      p: "¿El render es exactamente como quedará?",
      r: "Es una vista previa para que decidas color, técnica y ubicación. Antes de producir te mandamos una prueba digital con medidas reales para que la apruebes.",
    },
    {
      p: "¿Puedo mezclar tallas y colores?",
      r: "Sí. En cada producto indicas cuántas piezas quieres de cada talla, y puedes agregar el mismo producto en otro color como una línea más del pedido.",
    },
    {
      p: "¿Cómo pago?",
      r: "Al confirmar tu pedido por WhatsApp te compartimos la cotización formal y los datos para el anticipo. Facturamos.",
    },
  ],
};
