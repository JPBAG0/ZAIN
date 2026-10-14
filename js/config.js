/* ============================================================================
   ZAIN — CONFIGURACIÓN DE LA PÁGINA
   ----------------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas editar para cambiar datos,
   productos, colores, técnicas y preguntas frecuentes. No hace falta tocar el
   HTML ni el resto del código.

   ✏️  = dato de ejemplo: cámbialo por el real antes de publicar.
   ============================================================================ */

(() => {
const config = {
  marca: "ZAIN",
  pedidosApi: "https://upzecgfgdtllxdhshhkd.supabase.co/functions/v1/zain-pedidos",
  // Activar solo después de completar el aviso y obtener los IDs de ZAIN.
  privacidadPublicada: false,
  medicion: {
    activa: false,
    origenes: ["https://zain-amber-sigma.vercel.app"],
    googleAdsId: "",
    etiquetaSolicitud: "",
    etiquetaWhatsApp: "",
  },

  // ✏️ WhatsApp con lada de país, sin espacios ni signos. México: 52 + 10 dígitos.
  //    Ejemplo: "523312345678". Mientras esté vacío, los botones llevan a «Contacto».
  whatsapp: "525662923967",

  // ✏️ Datos de contacto que aparecen en el pie de página
  correo: "atencion.zain@gmail.com",
  ciudad: "Guadalajara, Jalisco",
  instagram: "https://instagram.com/thezainlab", // ej. "https://instagram.com/zain"
  horario: "Lunes a viernes de 9:00 a 18:00 · Sábados de 9:00 a 14:00",

  // ✏️ Datos rápidos de la portada
  minimoPiezas: null,
  diasEntrega: "7 a 12 días hábiles",

  // Tonos de vista previa; las referencias Pantone se confirman al cotizar.
  tintasLogo: [
    { nombre: "Blanco", hex: "#f6f6f4" }, { nombre: "Negro", hex: "#141416" },
    { nombre: "Dorado", hex: "#c9a453" }, { nombre: "Plata", hex: "#b4b4b4" },
    { nombre: "Rojo", hex: "#d02f35" }, { nombre: "Vino", hex: "#7a2438" },
    { nombre: "Naranja", hex: "#f07828" }, { nombre: "Amarillo", hex: "#f2c52b" },
    { nombre: "Verde", hex: "#399c59" }, { nombre: "Verde botella", hex: "#205a42" },
    { nombre: "Azul rey", hex: "#2457c7" }, { nombre: "Azul marino", hex: "#182f53" },
    { nombre: "Cian", hex: "#21b5cf" }, { nombre: "Morado", hex: "#7951b7" },
    { nombre: "Rosa", hex: "#e66aa4" },
  ],
  // Más espacio en el render; se confirma el área de impresión antes de producir.
  escalaMaxLogo: 1.3,


  /* --------------------------------------------------------------------------
     COLORES DE PRENDA
     Cada producto elige cuáles usa (por su id). El color se aplica sobre la
     foto blanca del producto, así que no necesitas una foto por color.
     -------------------------------------------------------------------------- */
  colores: [
    {"id": "bolsa-boutique-negro", "nombre": "Negro", "hex": "#000000"},
    {"id": "bolsa-boutique-azul-rey", "nombre": "Azul rey", "hex": "#0957c6"},
    {"id": "bolsa-boutique-rojo", "nombre": "Rojo", "hex": "#bb3937"},
    {"id": "bolsa-boutique-blanco", "nombre": "Blanco", "hex": "#ffffff"},
    {"id": "bolsa-boutique-rosa", "nombre": "Rosa", "hex": "#f895d2"},
    {"id": "bolsa-sobre-chico-negro", "nombre": "Negro", "hex": "#000000"},
    {"id": "bolsa-sobre-chico-rosa", "nombre": "Rosa", "hex": "#f895d2"},
    {"id": "bolsa-sobre-chico-kaki", "nombre": "Kaki", "hex": "#ae935e"},
    {"id": "bolsa-sobre-chico-morado", "nombre": "Morado", "hex": "#564b9c"},
    {"id": "bolsa-sobre-chico-blanco", "nombre": "Blanco", "hex": "#ffffff"},
    {"id": "bolsa-sobre-chico-azul-rey", "nombre": "Azul rey", "hex": "#0957c6"},
    {"id": "bolsa-sobre-chico-rojo", "nombre": "Rojo", "hex": "#bb3937"},
    {"id": "bolsa-sobre-chico-verde-limon", "nombre": "Verde limón", "hex": "#9fed51"},
    {"id": "bolsa-sobre-grande-negro", "nombre": "Negro", "hex": "#000000"},
    {"id": "bolsa-sobre-grande-gris-oxford", "nombre": "Gris oxford", "hex": "#4b4a4a"},
    {"id": "bolsa-sobre-grande-kaki", "nombre": "Kaki", "hex": "#ae935e"},
    {"id": "bolsa-sobre-grande-blanco", "nombre": "Blanco", "hex": "#ffffff"},
    {"id": "bolsa-sobre-grande-rojo", "nombre": "Rojo", "hex": "#bb3937"},
    {"id": "bolsa-regalo-negro", "nombre": "Negro", "hex": "#000000"},
    {"id": "bolsa-regalo-rojo", "nombre": "Rojo", "hex": "#bb3937"},
    {"id": "bolsa-regalo-verde-limon", "nombre": "Verde limón", "hex": "#9fed51"},
    {"id": "bolsa-regalo-blanco", "nombre": "Blanco", "hex": "#ffffff"},
    {"id": "bolsa-regalo-azul-rey", "nombre": "Azul rey", "hex": "#0957c6"},
    {"id": "bolsa-expo-negro", "nombre": "Negro", "hex": "#000000"},
    {"id": "bolsa-expo-rojo", "nombre": "Rojo", "hex": "#bb3937"},
    {"id": "bolsa-expo-blanco", "nombre": "Blanco", "hex": "#ffffff"},
    {"id": "bolsa-zapatera-negro", "nombre": "Negro", "hex": "#000000"},
    {"id": "bolsa-zapatera-rojo", "nombre": "Rojo", "hex": "#bb3937"},
    {"id": "bolsa-zapatera-verde-limon", "nombre": "Verde limón", "hex": "#9fed51"},
    {"id": "bolsa-zapatera-blanco", "nombre": "Blanco", "hex": "#ffffff"},
    {"id": "bolsa-zapatera-azul-rey", "nombre": "Azul rey", "hex": "#0957c6"},
    {"id": "bolsa-market-negro", "nombre": "Negro", "hex": "#000000"},
    {"id": "bolsa-market-rojo", "nombre": "Rojo", "hex": "#bb3937"},
    {"id": "bolsa-market-naranja", "nombre": "Naranja", "hex": "#ff751f"},
    {"id": "bolsa-market-rosa", "nombre": "Rosa", "hex": "#f895d2"},
    {"id": "bolsa-market-blanco", "nombre": "Blanco", "hex": "#ffffff"},
    {"id": "bolsa-market-azul-rey", "nombre": "Azul rey", "hex": "#0957c6"},
    {"id": "bolsa-market-kaki", "nombre": "Kaki", "hex": "#ae935e"},
    {"id": "bolsa-market-azul-marino", "nombre": "Azul marino", "hex": "#28314f"},
    {"id": "bolsa-market-amarillo", "nombre": "Amarillo", "hex": "#fdf370"},
    {"id": "bolsa-market-fiusha", "nombre": "Fiusha", "hex": "#c84088"},
    {"id": "bolsa-market-tinto", "nombre": "Tinto", "hex": "#792f28"},
    {"id": "bolsa-market-verde-limon", "nombre": "Verde limón", "hex": "#9fed51"},
    {"id": "bolsa-market-morado", "nombre": "Morado", "hex": "#8c52ff"},
    {"id": "bolsa-market-gris-plata", "nombre": "Gris plata", "hex": "#b4b4b4"},
    {"id": "bolsa-market-lino", "nombre": "Lino", "hex": "#e6ded2"},
    {"id": "bolsa-restaurant-negro", "nombre": "Negro", "hex": "#000000"},
    {"id": "bolsa-restaurant-kaki", "nombre": "Kaki", "hex": "#a38856"},
    {"id": "bolsa-restaurant-blanco", "nombre": "Blanco", "hex": "#ffffff"},
    {"id": "bolsa-colombia-gris-oxford", "nombre": "Gris oxford", "hex": "#4b4a4a"},
    {"id": "bolsa-colombia-rojo", "nombre": "Rojo", "hex": "#a27f7d"},
    {"id": "bolsa-colombia-beige", "nombre": "Beige", "hex": "#c9c2a6"},
    {"id": "bolsa-colombia-azul-cielo", "nombre": "Azul cielo", "hex": "#5a7b94"},
    {"id": "bolsa-manta-manta", "nombre": "Manta", "hex": "#e6ded2"},
    {"id": "bolsa-mezclilla-mezclilla", "nombre": "Mezclilla", "hex": "#28324f"},
    {"id": "bolsa-morral-negro", "nombre": "Negro", "hex": "#000000"},
    {"id": "bolsa-morral-azul-rey", "nombre": "Azul rey", "hex": "#0957c6"},
    {"id": "bolsa-jumbo-negro", "nombre": "Negro", "hex": "#000000"},
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
     El importe se cotiza por WhatsApp según el diseño y la cantidad.
     -------------------------------------------------------------------------- */
  tecnicas: [
    {
      id: "bordado",
      nombre: "Bordado",

      corto: "Hilo cosido a la prenda. El acabado más elegante y el que más dura.",
      ideal: "Polos, camisas, chamarras y gorras",
      detalle: "Relieve real · hasta 12 colores de hilo · no se despinta",
      foto: "img/fotos/t-bordado.webp",
    },
    {
      id: "serigrafia",
      nombre: "Serigrafía",

      corto: "Tinta aplicada con malla. Colores sólidos para pedidos de volumen.",
      ideal: "Playeras, sudaderas y bolsas en volumen",
      detalle: "Tintas planas · ideal desde 50 piezas · muy resistente al lavado",
      foto: "img/fotos/t-serigrafia.webp",
    },
    {
      id: "dtf",
      nombre: "DTF",

      corto: "Transfer a todo color planchado con calor. Fotos, degradados y detalle fino.",
      ideal: "Logos a todo color y tirajes cortos",
      detalle: "Color ilimitado · detalle fino · cantidad a confirmar al cotizar",
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
       colores   ids de la lista de colores de arriba (el primero es el que se ve en el catálogo)
       tecnicas  ids de la lista de técnicas de arriba
       tallas    lista de tallas; [] para unitalla
       tallasNombre  (opcional) cómo se llaman las tallas, p. ej. "Tamaños"
       pxPorCm   cuántos píxeles de la foto equivalen a 1 cm (para el tamaño del logo)
       zonas     dónde se puede poner el logo: x, y = centro en píxeles de la
                 foto (de 0 a 1000); max = ancho máximo del logo en cm
     -------------------------------------------------------------------------- */
  grupos: {
    bolsas: {
      nombre: "Bolsas",
      descripcion: "Bolsas ecológicas para regalos, eventos, tiendas y pedidos de volumen. Elige el modelo, sus medidas y su color.",
      aviso: "Consulta disponibilidad de modelo y color. Las imágenes son ilustrativas y los colores pueden variar.",
      foto: "img/productos/bolsas/expo.webp",
      productoInicial: "bolsa-expo",
    },
  },
  productos: [
    {
      id: "playera",
      nombre: "Playera cuello redondo",
      categoria: "Textil",
      descripcion: "Algodón peinado 180 g. La base de todo uniforme y evento.",
      foto: "img/productos/playera.webp",
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
      colores: ["arena", "negro", "blanco", "marino", "rey", "rojo", "gris", "botella"],
      tecnicas: ["bordado", "dtf"],
      tallas: [],
      pxPorCm: 42,
      zonas: [{ id: "frente", nombre: "Frente", x: 500, y: 430, max: 12 }],
    },
    {
      "id": "bolsa-boutique",
      "nombre": "Bolsa Boutique",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Termo sellada. Non woven 70 gr.",
      "medidas": "18 × 24 × 8 cm",
      "dimensiones": {
        "largoBase": 18,
        "altura": 24,
        "fuelle": 8
      },
      "foto": "img/productos/bolsas/boutique.webp",
      "fotoColor": "bolsa-boutique-rojo",
      "colores": [
        "bolsa-boutique-rojo",
        "bolsa-boutique-negro",
        "bolsa-boutique-azul-rey",
        "bolsa-boutique-blanco",
        "bolsa-boutique-rosa"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 23.52,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 500,
          "y": 550,
          "max": 8.1
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 3
      },
      "piezasBulto": 500
    },
    {
      "id": "bolsa-sobre-chico",
      "nombre": "Bolsa Sobre chico",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Termo sellada. Non woven 70 gr.",
      "medidas": "30 × 30 cm",
      "dimensiones": {
        "largoBase": 30,
        "altura": 30
      },
      "foto": "img/productos/bolsas/sobre-chico.webp",
      "fotoColor": "bolsa-sobre-chico-morado",
      "colores": [
        "bolsa-sobre-chico-morado",
        "bolsa-sobre-chico-negro",
        "bolsa-sobre-chico-rosa",
        "bolsa-sobre-chico-kaki",
        "bolsa-sobre-chico-blanco",
        "bolsa-sobre-chico-azul-rey",
        "bolsa-sobre-chico-rojo",
        "bolsa-sobre-chico-verde-limon"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 24.6,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 500,
          "y": 530,
          "max": 13.5
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 4
      },
      "piezasBulto": 500
    },
    {
      "id": "bolsa-sobre-grande",
      "nombre": "Bolsa Sobre grande",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Termo sellada. Non woven 70 gr.",
      "medidas": "40 × 40 cm",
      "dimensiones": {
        "largoBase": 40,
        "altura": 40
      },
      "foto": "img/productos/bolsas/sobre-grande.webp",
      "fotoColor": "bolsa-sobre-grande-kaki",
      "colores": [
        "bolsa-sobre-grande-kaki",
        "bolsa-sobre-grande-negro",
        "bolsa-sobre-grande-gris-oxford",
        "bolsa-sobre-grande-blanco",
        "bolsa-sobre-grande-rojo"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 18.45,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 500,
          "y": 550,
          "max": 18.0
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 5
      },
      "piezasBulto": 500
    },
    {
      "id": "bolsa-regalo",
      "nombre": "Bolsa Regalo",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Termo sellada. Non woven 70 gr.",
      "medidas": "25 × 35 × 10 cm",
      "dimensiones": {
        "largoBase": 25,
        "altura": 35,
        "fuelle": 10,
        "alturaConAsas": 40
      },
      "foto": "img/productos/bolsas/regalo.webp",
      "fotoColor": "bolsa-regalo-azul-rey",
      "colores": [
        "bolsa-regalo-azul-rey",
        "bolsa-regalo-negro",
        "bolsa-regalo-rojo",
        "bolsa-regalo-verde-limon",
        "bolsa-regalo-blanco"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 12.33,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 500,
          "y": 610,
          "max": 11.2
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 6
      },
      "piezasBulto": 1000
    },
    {
      "id": "bolsa-expo",
      "nombre": "Bolsa Expo",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Termo sellada. Non woven 70 gr.",
      "medidas": "38 × 32 cm",
      "dimensiones": {
        "largoBase": 38,
        "altura": 32,
        "alturaConAsas": 55
      },
      "foto": "img/productos/bolsas/expo.webp",
      "fotoColor": "bolsa-expo-rojo",
      "colores": [
        "bolsa-expo-rojo",
        "bolsa-expo-negro",
        "bolsa-expo-blanco"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 14.54,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 500,
          "y": 660,
          "max": 17.1
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 7
      },
      "piezasBulto": 1000
    },
    {
      "id": "bolsa-zapatera",
      "nombre": "Bolsa Zapatera",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Termo sellada. Non woven 70 gr.",
      "medidas": "35 × 25 × 10 cm",
      "dimensiones": {
        "largoBase": 35,
        "altura": 25,
        "fuelle": 10,
        "alturaConAsas": 40
      },
      "foto": "img/productos/bolsas/zapatera.webp",
      "fotoColor": "bolsa-zapatera-blanco",
      "colores": [
        "bolsa-zapatera-blanco",
        "bolsa-zapatera-negro",
        "bolsa-zapatera-rojo",
        "bolsa-zapatera-verde-limon",
        "bolsa-zapatera-azul-rey"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 9.3,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 540,
          "y": 640,
          "max": 15.8
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 8
      },
      "piezasBulto": 1000
    },
    {
      "id": "bolsa-market",
      "nombre": "Bolsa Market",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Termo sellada. Non woven 70 gr.",
      "medidas": "45 × 35 × 12 cm",
      "dimensiones": {
        "largoBase": 45,
        "altura": 35,
        "fuelle": 12,
        "alturaConAsas": 60
      },
      "foto": "img/productos/bolsas/market.webp",
      "fotoColor": "bolsa-market-azul-marino",
      "colores": [
        "bolsa-market-azul-marino",
        "bolsa-market-negro",
        "bolsa-market-rojo",
        "bolsa-market-naranja",
        "bolsa-market-rosa",
        "bolsa-market-blanco",
        "bolsa-market-azul-rey",
        "bolsa-market-kaki",
        "bolsa-market-amarillo",
        "bolsa-market-fiusha",
        "bolsa-market-tinto",
        "bolsa-market-verde-limon",
        "bolsa-market-morado",
        "bolsa-market-gris-plata",
        "bolsa-market-lino"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 7.89,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 530,
          "y": 625,
          "max": 20.2
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 9
      },
      "piezasBulto": 1000
    },
    {
      "id": "bolsa-restaurant",
      "nombre": "Bolsa Restaurant",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Termo sellada. Non woven 70 gr.",
      "medidas": "31 × 30 × 22 cm",
      "dimensiones": {
        "largoBase": 31,
        "altura": 30,
        "fuelle": 22,
        "alturaConAsas": 50
      },
      "foto": "img/productos/bolsas/restaurant.webp",
      "fotoColor": "bolsa-restaurant-kaki",
      "colores": [
        "bolsa-restaurant-kaki",
        "bolsa-restaurant-negro",
        "bolsa-restaurant-blanco"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 14.82,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 560,
          "y": 650,
          "max": 14.0
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 11
      },
      "piezasBulto": 1000
    },
    {
      "id": "bolsa-colombia",
      "nombre": "Bolsa Colombia",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Cosida. 100% poliéster 130 gr.",
      "medidas": "38 × 42 cm",
      "dimensiones": {
        "largoBase": 38,
        "altura": 42,
        "alturaConAsas": 66
      },
      "foto": "img/productos/bolsas/colombia.webp",
      "fotoColor": "bolsa-colombia-rojo",
      "colores": [
        "bolsa-colombia-rojo",
        "bolsa-colombia-gris-oxford",
        "bolsa-colombia-beige",
        "bolsa-colombia-azul-cielo"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 18.9,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 500,
          "y": 550,
          "max": 17.1
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 12
      },
      "piezasBulto": 500,
      "aplicacionesNota": "También sublimable en beige y azul cielo; consulta esta opción al cotizar."
    },
    {
      "id": "bolsa-manta",
      "nombre": "Bolsa Manta",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Poli-cotton 80%-20%. Manta 180 gr.",
      "medidas": "40 × 45 cm",
      "dimensiones": {
        "largoBase": 40,
        "altura": 45,
        "alturaConAsas": 65
      },
      "foto": "img/productos/bolsas/manta.webp",
      "fotoColor": "bolsa-manta-manta",
      "colores": [
        "bolsa-manta-manta"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 7.65,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 560,
          "y": 640,
          "max": 18.0
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 13
      },
      "piezasBulto": 500,
      "aplicacionesNota": "El catálogo indica que es sublimable en color beige; consulta esta opción al cotizar."
    },
    {
      "id": "bolsa-mezclilla",
      "nombre": "Bolsa Mezclilla",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Mezclilla. GSM: 270 gr.",
      "medidas": "38 × 45 cm",
      "dimensiones": {
        "largoBase": 38,
        "altura": 45,
        "fuelle": 8,
        "alturaConAsas": 59
      },
      "foto": "img/productos/bolsas/mezclilla.webp",
      "fotoColor": "bolsa-mezclilla-mezclilla",
      "colores": [
        "bolsa-mezclilla-mezclilla"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 9.09,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 500,
          "y": 630,
          "max": 17.1
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 14
      },
      "piezasBulto": 1000
    },
    {
      "id": "bolsa-morral",
      "nombre": "Bolsa Morral",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Termo sellada. Non woven 80 gr.",
      "medidas": "36 × 46 cm",
      "dimensiones": {
        "largoBase": 36,
        "altura": 46
      },
      "foto": "img/productos/bolsas/morral.webp",
      "fotoColor": "bolsa-morral-azul-rey",
      "colores": [
        "bolsa-morral-azul-rey",
        "bolsa-morral-negro"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 20.5,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 500,
          "y": 500,
          "max": 16.2
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 15
      },
      "piezasBulto": 500
    },
    {
      "id": "bolsa-jumbo",
      "nombre": "Bolsa Jumbo",
      "categoria": "Bolsas",
      "grupo": "bolsas",
      "minimoPiezas": 100,
      "pasoPiezas": 50,
      "descripcion": "Cosida. Non woven 70 gr.",
      "medidas": "58 × 52 × 25 cm",
      "dimensiones": {
        "largoBase": 58,
        "altura": 52,
        "fuelle": 25,
        "alturaConAsas": 70
      },
      "foto": "img/productos/bolsas/jumbo.webp",
      "fotoColor": "bolsa-jumbo-negro",
      "colores": [
        "bolsa-jumbo-negro"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tallas": [],
      "pxPorCm": 6.47,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 560,
          "y": 630,
          "max": 26.1
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 16
      },
      "piezasBulto": 500
    },
  ],

  /* Otros artículos promocionales que se manejan (se muestran como lista) ✏️ */
  promocionales: ["Termos", "Tazas", "Libretas", "Plumas", "Mandiles", "Chalecos", "Lanyards", "Paraguas"],

  /* Preguntas frecuentes ✏️ */
  preguntas: [
    {
      p: "¿Cómo solicito una cotización?",
      r: "Elige productos, colores, técnica y cantidades, agrégalos a tu pedido y envíalo por WhatsApp. Te cotizamos según tu diseño y volumen, y confirmamos disponibilidad y fecha de entrega antes de producir.",
    },
    {
      p: "¿Cuál es el pedido mínimo?",
      r: "En bolsas el mínimo es de 100 piezas por modelo y color, en incrementos de 50: 100, 150, 200… Para los demás productos confirmamos la cantidad y las condiciones al cotizar.",
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
      r: "Arma tu pedido en la página y envíalo por WhatsApp. Te compartimos una cotización personalizada; cuando la apruebes, coordinamos el anticipo y la producción. Facturamos.",
    },
  ],
};

// Restauracion autorizada por JP: conservar las seis prendas originales.
Object.entries({playera:"Playeras",polo:"Polos",camisa:"Camisas",sudadera:"Sudaderas",chamarra:"Chamarras",gorra:"Gorras"}).forEach(([id,categoria]) => { config.productos.find(p => p.id === id).categoria = categoria; });
config.categoriasCatalogo = ["Playeras", "Polos", "Camisas", "Sudaderas", "Chamarras", "Gorras", "Bolsas"];
config.productos.filter(p => ["playera","polo","camisa","sudadera","chamarra","gorra"].includes(p.id)).forEach(p => { p.fotoOriginal=p.foto; p.foto="img/productos/originales-limpios/"+p.id+"-v2.webp"; p.imagenLimpia=true; });
config.catalogoVersion="originales-mas-yazbek-ia-2026-10-14";
config.catalogoYazbekPendiente = [];
config.productos.push(...[
  {
    "id": "yazbek-c0550",
    "nombre": "Polo piqué manga corta · Caballero (C0550)",
    "nombreFamilia": "Polo piqué manga corta",
    "familia": "yazbek-pique",
    "codigoFabricante": "C0550",
    "fabricante": "Yazbek",
    "silueta": "Caballero",
    "categoria": "Polos",
    "descripcion": "Uniformes de atención al público y equipos comerciales.",
    "gramaje": 225,
    "tejido": "Piqué",
    "composicion": "50% algodón / 50% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/c0550.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-100",
      "yazbek-102",
      "yazbek-421",
      "yazbek-413",
      "yazbek-420"
    ],
    "tecnicas": [
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 48.3,
        "largo": 70.5
      },
      "M": {
        "ancho": 53.3,
        "largo": 73
      },
      "G": {
        "ancho": 58.4,
        "largo": 75.6
      },
      "EG": {
        "ancho": 63.5,
        "largo": 78.1
      },
      "EEG": {
        "ancho": 68.6,
        "largo": 80.6
      }
    },
    "tolerancia": {
      "ancho": 1.9,
      "largo": 2.5
    },
    "pxPorCm": 7.4419,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 596,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 420,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 20,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 20,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-d0550",
    "nombre": "Polo piqué manga corta · Dama (D0550)",
    "nombreFamilia": "Polo piqué manga corta",
    "familia": "yazbek-pique",
    "codigoFabricante": "D0550",
    "fabricante": "Yazbek",
    "silueta": "Dama",
    "categoria": "Polos",
    "descripcion": "Uniformes de atención al público y equipos comerciales.",
    "gramaje": 225,
    "tejido": "Piqué",
    "composicion": "50% algodón / 50% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/d0550.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-100",
      "yazbek-102",
      "yazbek-421",
      "yazbek-413",
      "yazbek-420"
    ],
    "tecnicas": [
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 43.2,
        "largo": 64.1
      },
      "M": {
        "ancho": 47.6,
        "largo": 66.7
      },
      "G": {
        "ancho": 52.1,
        "largo": 69.2
      },
      "EG": {
        "ancho": 56.5,
        "largo": 71.8
      }
    },
    "tolerancia": {
      "ancho": 2.5,
      "largo": 2.5
    },
    "pxPorCm": 7.852,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 590,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 420,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 20,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 20,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c0605",
    "nombre": "Camisa Oxford manga larga · Caballero (C0605)",
    "nombreFamilia": "Camisa Oxford manga larga",
    "familia": "yazbek-oxford-larga",
    "codigoFabricante": "C0605",
    "fabricante": "Yazbek",
    "silueta": "Caballero",
    "categoria": "Camisas",
    "descripcion": "Una opción de oficina y representación comercial.",
    "gramaje": 155,
    "tejido": "Oxford",
    "composicion": "75% algodón / 25% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/c0605.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-700",
      "yazbek-701",
      "yazbek-703",
      "yazbek-704",
      "yazbek-705"
    ],
    "tecnicas": [
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 54.6,
        "largo": 76.2
      },
      "M": {
        "ancho": 57.2,
        "largo": 78.7
      },
      "G": {
        "ancho": 59.7,
        "largo": 82.6
      },
      "EG": {
        "ancho": 63.5,
        "largo": 85.1
      },
      "EEG": {
        "ancho": 66,
        "largo": 87.6
      }
    },
    "tolerancia": {
      "ancho": 1.3,
      "largo": 1.3
    },
    "pxPorCm": 7.2398,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 595,
        "y": 330,
        "max": 14,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 40,
      "tablaTallas": 45,
      "matrizColor": 48,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 40,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-d0605",
    "nombre": "Camisa Oxford manga larga · Dama (D0605)",
    "nombreFamilia": "Camisa Oxford manga larga",
    "familia": "yazbek-oxford-larga",
    "codigoFabricante": "D0605",
    "fabricante": "Yazbek",
    "silueta": "Dama",
    "categoria": "Camisas",
    "descripcion": "Una opción de oficina y representación comercial.",
    "gramaje": 155,
    "tejido": "Oxford",
    "composicion": "75% algodón / 25% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/d0605.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-700",
      "yazbek-701",
      "yazbek-703",
      "yazbek-704",
      "yazbek-705"
    ],
    "tecnicas": [
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 48.3,
        "largo": 63.5
      },
      "M": {
        "ancho": 50.8,
        "largo": 64.8
      },
      "G": {
        "ancho": 53.3,
        "largo": 66
      },
      "EG": {
        "ancho": 55.9,
        "largo": 67.3
      },
      "EEG": {
        "ancho": 58.4,
        "largo": 68.6
      }
    },
    "tolerancia": {
      "ancho": 1.3,
      "largo": 1.3
    },
    "pxPorCm": 6.7476,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 579,
        "y": 330,
        "max": 14,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 40,
      "tablaTallas": 45,
      "matrizColor": 48,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 40,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c0200",
    "nombre": "Playera básica 155 g · Caballero (C0200)",
    "nombreFamilia": "Playera básica 155 g",
    "familia": "yazbek-basica",
    "codigoFabricante": "C0200",
    "fabricante": "Yazbek",
    "silueta": "Caballero",
    "categoria": "Playeras",
    "descripcion": "Para eventos y promociones; tejido de menor gramaje.",
    "gramaje": 155,
    "tejido": "Chifón",
    "composicion": "100% algodón",
    "composicionColor": {
      "102": "90% algodón / 10% poliéster"
    },
    "foto": "img/productos/yazbek-ia/c0200.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-100",
      "yazbek-102",
      "yazbek-421",
      "yazbek-413"
    ],
    "tecnicas": [
      "serigrafia",
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG",
      "EEEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 45.7,
        "largo": 70.5
      },
      "M": {
        "ancho": 50.8,
        "largo": 73
      },
      "G": {
        "ancho": 55.9,
        "largo": 75.6
      },
      "EG": {
        "ancho": 61,
        "largo": 78.1
      },
      "EEG": {
        "ancho": 66,
        "largo": 80.6
      },
      "EEEG": {
        "ancho": 71.1,
        "largo": 83.2
      }
    },
    "tolerancia": {
      "ancho": 1.9,
      "largo": 2.5
    },
    "pxPorCm": 8.1885,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 601,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 390,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 6,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 6,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-d0200",
    "nombre": "Playera básica 155 g · Dama (D0200)",
    "nombreFamilia": "Playera básica 155 g",
    "familia": "yazbek-basica",
    "codigoFabricante": "D0200",
    "fabricante": "Yazbek",
    "silueta": "Dama",
    "categoria": "Playeras",
    "descripcion": "Para eventos y promociones; tejido de menor gramaje.",
    "gramaje": 155,
    "tejido": "Chifón",
    "composicion": "100% algodón",
    "composicionColor": {
      "102": "90% algodón / 10% poliéster"
    },
    "foto": "img/productos/yazbek-ia/d0200.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-100",
      "yazbek-102",
      "yazbek-421",
      "yazbek-413"
    ],
    "tecnicas": [
      "serigrafia",
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 43.2,
        "largo": 63.5
      },
      "M": {
        "ancho": 45.7,
        "largo": 66
      },
      "G": {
        "ancho": 50.8,
        "largo": 68.6
      },
      "EG": {
        "ancho": 55.9,
        "largo": 71.1
      },
      "EEG": {
        "ancho": 61,
        "largo": 73.7
      }
    },
    "tolerancia": {
      "ancho": 1.9,
      "largo": 2.5
    },
    "pxPorCm": 7.8803,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 588,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 390,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 6,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 6,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c0300",
    "nombre": "Playera peso completo 195 g · Caballero (C0300)",
    "nombreFamilia": "Playera peso completo 195 g",
    "familia": "yazbek-completa",
    "codigoFabricante": "C0300",
    "fabricante": "Yazbek",
    "silueta": "Caballero",
    "categoria": "Playeras",
    "descripcion": "Más gramaje que la básica para elegir según el uso de tu equipo.",
    "gramaje": 195,
    "tejido": "Chifón",
    "composicion": "100% algodón",
    "composicionColor": {
      "102": "90% algodón / 10% poliéster"
    },
    "foto": "img/productos/yazbek-ia/c0300.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-100",
      "yazbek-102",
      "yazbek-421",
      "yazbek-413",
      "yazbek-420"
    ],
    "tecnicas": [
      "serigrafia",
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG",
      "EEEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 45.7,
        "largo": 70.5
      },
      "M": {
        "ancho": 50.8,
        "largo": 73
      },
      "G": {
        "ancho": 55.9,
        "largo": 75.6
      },
      "EG": {
        "ancho": 61,
        "largo": 78.1
      },
      "EEG": {
        "ancho": 66,
        "largo": 80.6
      },
      "EEEG": {
        "ancho": 71.1,
        "largo": 83.2
      }
    },
    "tolerancia": {
      "ancho": 1.9,
      "largo": 2.5
    },
    "pxPorCm": 7.789,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 596,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 390,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 10,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 10,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-d0300",
    "nombre": "Playera peso completo 195 g · Dama (D0300)",
    "nombreFamilia": "Playera peso completo 195 g",
    "familia": "yazbek-completa",
    "codigoFabricante": "D0300",
    "fabricante": "Yazbek",
    "silueta": "Dama",
    "categoria": "Playeras",
    "descripcion": "Más gramaje que la básica para elegir según el uso de tu equipo.",
    "gramaje": 195,
    "tejido": "Chifón",
    "composicion": "100% algodón",
    "composicionColor": {
      "102": "90% algodón / 10% poliéster"
    },
    "foto": "img/productos/yazbek-ia/d0300.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-100",
      "yazbek-102",
      "yazbek-421",
      "yazbek-413",
      "yazbek-420"
    ],
    "tecnicas": [
      "serigrafia",
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 41.3,
        "largo": 59.7
      },
      "M": {
        "ancho": 43.8,
        "largo": 62.2
      },
      "G": {
        "ancho": 48.9,
        "largo": 64.8
      },
      "EG": {
        "ancho": 54,
        "largo": 67.3
      }
    },
    "tolerancia": {
      "ancho": 2.5,
      "largo": 2.5
    },
    "pxPorCm": 8.3006,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 589,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 390,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 11,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 11,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c0606",
    "nombre": "Camisa gabardina manga corta · Caballero (C0606)",
    "nombreFamilia": "Camisa gabardina manga corta",
    "familia": "yazbek-gabardina-corta",
    "codigoFabricante": "C0606",
    "fabricante": "Yazbek",
    "silueta": "Caballero",
    "categoria": "Camisas",
    "descripcion": "Para comercios y personal operativo; versión de manga corta.",
    "gramaje": 160,
    "tejido": "Gabardina",
    "composicion": "50% algodón / 50% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/c0606.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-100",
      "yazbek-200",
      "yazbek-213",
      "yazbek-413"
    ],
    "tecnicas": [
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 54.6,
        "largo": 76.2
      },
      "M": {
        "ancho": 57.2,
        "largo": 78.7
      },
      "G": {
        "ancho": 59.7,
        "largo": 82.6
      },
      "EG": {
        "ancho": 63.5,
        "largo": 85.1
      },
      "EEG": {
        "ancho": 66,
        "largo": 87.6
      }
    },
    "tolerancia": {
      "ancho": 1.3,
      "largo": 1.3
    },
    "pxPorCm": 7.2932,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 596,
        "y": 330,
        "max": 14,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 41,
      "tablaTallas": 45,
      "matrizColor": 48,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 41,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-d0606",
    "nombre": "Camisa gabardina manga corta · Dama (D0606)",
    "nombreFamilia": "Camisa gabardina manga corta",
    "familia": "yazbek-gabardina-corta",
    "codigoFabricante": "D0606",
    "fabricante": "Yazbek",
    "silueta": "Dama",
    "categoria": "Camisas",
    "descripcion": "Para comercios y personal operativo; versión de manga corta.",
    "gramaje": 160,
    "tejido": "Gabardina",
    "composicion": "50% algodón / 50% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/d0606.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-100",
      "yazbek-200",
      "yazbek-213",
      "yazbek-413"
    ],
    "tecnicas": [
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 48.3,
        "largo": 63.5
      },
      "M": {
        "ancho": 50.8,
        "largo": 64.8
      },
      "G": {
        "ancho": 53.3,
        "largo": 66
      },
      "EG": {
        "ancho": 55.9,
        "largo": 67.3
      },
      "EEG": {
        "ancho": 58.4,
        "largo": 68.6
      }
    },
    "tolerancia": {
      "ancho": 1.3,
      "largo": 1.3
    },
    "pxPorCm": 7.4658,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 588,
        "y": 330,
        "max": 14,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 41,
      "tablaTallas": 45,
      "matrizColor": 48,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 41,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c0607",
    "nombre": "Camisa gabardina manga larga · Caballero (C0607)",
    "nombreFamilia": "Camisa gabardina manga larga",
    "familia": "yazbek-gabardina-larga",
    "codigoFabricante": "C0607",
    "fabricante": "Yazbek",
    "silueta": "Caballero",
    "categoria": "Camisas",
    "descripcion": "Alternativa de manga larga para operaciones y supervisión.",
    "gramaje": 160,
    "tejido": "Gabardina",
    "composicion": "50% algodón / 50% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/c0607.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-426",
      "yazbek-100",
      "yazbek-200",
      "yazbek-213",
      "yazbek-425",
      "yazbek-413"
    ],
    "tecnicas": [
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 54.6,
        "largo": 76.2
      },
      "M": {
        "ancho": 57.2,
        "largo": 78.7
      },
      "G": {
        "ancho": 59.7,
        "largo": 82.6
      },
      "EG": {
        "ancho": 63.5,
        "largo": 85.1
      },
      "EEG": {
        "ancho": 66,
        "largo": 87.6
      }
    },
    "tolerancia": {
      "ancho": 1.3,
      "largo": 1.3
    },
    "pxPorCm": 6.8124,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 589,
        "y": 330,
        "max": 14,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 42,
      "tablaTallas": 45,
      "matrizColor": 48,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 42,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-d0607",
    "nombre": "Camisa gabardina manga larga · Dama (D0607)",
    "nombreFamilia": "Camisa gabardina manga larga",
    "familia": "yazbek-gabardina-larga",
    "codigoFabricante": "D0607",
    "fabricante": "Yazbek",
    "silueta": "Dama",
    "categoria": "Camisas",
    "descripcion": "Alternativa de manga larga para operaciones y supervisión.",
    "gramaje": 160,
    "tejido": "Gabardina",
    "composicion": "50% algodón / 50% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/d0607.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-426",
      "yazbek-100",
      "yazbek-200",
      "yazbek-213",
      "yazbek-425",
      "yazbek-413"
    ],
    "tecnicas": [
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 48.3,
        "largo": 63.5
      },
      "M": {
        "ancho": 50.8,
        "largo": 64.8
      },
      "G": {
        "ancho": 53.3,
        "largo": 66
      },
      "EG": {
        "ancho": 55.9,
        "largo": 67.3
      },
      "EEG": {
        "ancho": 58.4,
        "largo": 68.6
      }
    },
    "tolerancia": {
      "ancho": 1.3,
      "largo": 1.3
    },
    "pxPorCm": 6.987,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 582,
        "y": 330,
        "max": 14,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 42,
      "tablaTallas": 45,
      "matrizColor": 48,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 42,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c0604",
    "nombre": "Camisa Oxford manga corta · Caballero (C0604)",
    "nombreFamilia": "Camisa Oxford manga corta",
    "familia": "yazbek-oxford-corta",
    "codigoFabricante": "C0604",
    "fabricante": "Yazbek",
    "silueta": "Caballero",
    "categoria": "Camisas",
    "descripcion": "Para oficina y atención al público con manga corta.",
    "gramaje": 155,
    "tejido": "Oxford",
    "composicion": "75% algodón / 25% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/c0604.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-700",
      "yazbek-701"
    ],
    "tecnicas": [
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 54.6,
        "largo": 76.2
      },
      "M": {
        "ancho": 57.2,
        "largo": 78.7
      },
      "G": {
        "ancho": 59.7,
        "largo": 82.6
      },
      "EG": {
        "ancho": 63.5,
        "largo": 85.1
      },
      "EEG": {
        "ancho": 66,
        "largo": 87.6
      }
    },
    "tolerancia": {
      "ancho": 1.3,
      "largo": 1.3
    },
    "pxPorCm": 7.3066,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 596,
        "y": 330,
        "max": 14,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 39,
      "tablaTallas": 45,
      "matrizColor": 48,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 39,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-d0604",
    "nombre": "Camisa Oxford manga corta · Dama (D0604)",
    "nombreFamilia": "Camisa Oxford manga corta",
    "familia": "yazbek-oxford-corta",
    "codigoFabricante": "D0604",
    "fabricante": "Yazbek",
    "silueta": "Dama",
    "categoria": "Camisas",
    "descripcion": "Para oficina y atención al público con manga corta.",
    "gramaje": 155,
    "tejido": "Oxford",
    "composicion": "75% algodón / 25% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/d0604.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-700",
      "yazbek-701"
    ],
    "tecnicas": [
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 48.3,
        "largo": 63.5
      },
      "M": {
        "ancho": 50.8,
        "largo": 64.8
      },
      "G": {
        "ancho": 53.3,
        "largo": 66
      },
      "EG": {
        "ancho": 55.9,
        "largo": 67.3
      },
      "EEG": {
        "ancho": 58.4,
        "largo": 68.6
      }
    },
    "tolerancia": {
      "ancho": 1.3,
      "largo": 1.3
    },
    "pxPorCm": 7.6453,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 590,
        "y": 330,
        "max": 14,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 39,
      "tablaTallas": 45,
      "matrizColor": 48,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 39,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c1502",
    "nombre": "Polo ActiviTee manga corta · Caballero (C1502)",
    "nombreFamilia": "Polo ActiviTee manga corta",
    "familia": "yazbek-activa-polo",
    "codigoFabricante": "C1502",
    "fabricante": "Yazbek",
    "silueta": "Caballero",
    "categoria": "Polos",
    "descripcion": "Tejido ligero para equipos con trabajo activo.",
    "gramaje": 150,
    "tejido": "Mesh",
    "composicion": "100% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/c1502.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-426",
      "yazbek-100",
      "yazbek-421",
      "yazbek-413"
    ],
    "tecnicas": [
      "serigrafia"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 48.3,
        "largo": 70.5
      },
      "M": {
        "ancho": 53.3,
        "largo": 73
      },
      "G": {
        "ancho": 58.4,
        "largo": 75.6
      },
      "EG": {
        "ancho": 63.5,
        "largo": 78.1
      },
      "EEG": {
        "ancho": 68.6,
        "largo": 80.6
      }
    },
    "tolerancia": {
      "ancho": 1.9,
      "largo": 2.5
    },
    "pxPorCm": 7.4283,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 595,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 420,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 27,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 27,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-d1502",
    "nombre": "Polo ActiviTee manga corta · Dama (D1502)",
    "nombreFamilia": "Polo ActiviTee manga corta",
    "familia": "yazbek-activa-polo",
    "codigoFabricante": "D1502",
    "fabricante": "Yazbek",
    "silueta": "Dama",
    "categoria": "Polos",
    "descripcion": "Tejido ligero para equipos con trabajo activo.",
    "gramaje": 150,
    "tejido": "Mesh",
    "composicion": "100% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/d1502.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-426",
      "yazbek-100",
      "yazbek-421",
      "yazbek-413"
    ],
    "tecnicas": [
      "serigrafia"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 43.2,
        "largo": 64.1
      },
      "M": {
        "ancho": 47.6,
        "largo": 66.7
      },
      "G": {
        "ancho": 52.1,
        "largo": 69.2
      },
      "EG": {
        "ancho": 56.5,
        "largo": 71.8
      }
    },
    "tolerancia": {
      "ancho": 2.5,
      "largo": 2.5
    },
    "pxPorCm": 8.0663,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 592,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 420,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 27,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 27,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c1302",
    "nombre": "Playera ActiviTee manga corta · Caballero (C1302)",
    "nombreFamilia": "Playera ActiviTee manga corta",
    "familia": "yazbek-activa-playera",
    "codigoFabricante": "C1302",
    "fabricante": "Yazbek",
    "silueta": "Caballero",
    "categoria": "Playeras",
    "descripcion": "Una alternativa ligera de poliéster para eventos y equipos.",
    "gramaje": 150,
    "tejido": "Mesh",
    "composicion": "100% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/c1302.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-426",
      "yazbek-100",
      "yazbek-421",
      "yazbek-413"
    ],
    "tecnicas": [
      "serigrafia"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 45.7,
        "largo": 68.6
      },
      "M": {
        "ancho": 50.8,
        "largo": 71.1
      },
      "G": {
        "ancho": 55.9,
        "largo": 73.7
      },
      "EG": {
        "ancho": 61,
        "largo": 76.2
      },
      "EEG": {
        "ancho": 66,
        "largo": 78.7
      }
    },
    "tolerancia": {
      "ancho": 1.9,
      "largo": 2.5
    },
    "pxPorCm": 7.9887,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 598,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 390,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 24,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 24,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-d1302",
    "nombre": "Playera ActiviTee manga corta · Dama (D1302)",
    "nombreFamilia": "Playera ActiviTee manga corta",
    "familia": "yazbek-activa-playera",
    "codigoFabricante": "D1302",
    "fabricante": "Yazbek",
    "silueta": "Dama",
    "categoria": "Playeras",
    "descripcion": "Una alternativa ligera de poliéster para eventos y equipos.",
    "gramaje": 150,
    "tejido": "Mesh",
    "composicion": "100% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/d1302.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-426",
      "yazbek-100",
      "yazbek-421",
      "yazbek-413"
    ],
    "tecnicas": [
      "serigrafia"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 42.5,
        "largo": 61
      },
      "M": {
        "ancho": 46.4,
        "largo": 63.5
      },
      "G": {
        "ancho": 50.2,
        "largo": 66
      },
      "EG": {
        "ancho": 54,
        "largo": 68.6
      }
    },
    "tolerancia": {
      "ancho": 2.5,
      "largo": 2.5
    },
    "pxPorCm": 7.7521,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 586,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 390,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 24,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 24,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c0702",
    "nombre": "Sudadera con capucha y cierre · Adultos (C0702)",
    "nombreFamilia": "Sudadera con capucha y cierre",
    "familia": "yazbek-sudadera-cierre",
    "codigoFabricante": "C0702",
    "fabricante": "Yazbek",
    "silueta": "Adultos",
    "categoria": "Sudaderas",
    "descripcion": "Capucha, cangurera y cierre completo para uniforme casual.",
    "gramaje": 275,
    "tejido": "Felpa",
    "composicion": "50% algodón / 50% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/c0702.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-102",
      "yazbek-2415"
    ],
    "tecnicas": [
      "bordado",
      "serigrafia"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 49.5,
        "largo": 68.6
      },
      "M": {
        "ancho": 54.6,
        "largo": 71.1
      },
      "G": {
        "ancho": 59.7,
        "largo": 73.7
      },
      "EG": {
        "ancho": 64.8,
        "largo": 76.2
      },
      "EEG": {
        "ancho": 69.9,
        "largo": 78.7
      }
    },
    "tolerancia": {
      "ancho": 1.9,
      "largo": 3.2
    },
    "pxPorCm": 11.6745,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 653,
        "y": 330,
        "max": 14,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 31,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 31,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c0601",
    "nombre": "Camisa mezclilla manga larga · Caballero (C0601)",
    "nombreFamilia": "Camisa mezclilla manga larga",
    "familia": "yazbek-mezclilla",
    "codigoFabricante": "C0601",
    "fabricante": "Yazbek",
    "silueta": "Caballero",
    "categoria": "Camisas",
    "descripcion": "Para equipos que buscan una presentación casual.",
    "gramaje": 255,
    "tejido": "Mezclilla",
    "composicion": "100% algodón",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/c0601.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-652"
    ],
    "tecnicas": [
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 54.6,
        "largo": 76.2
      },
      "M": {
        "ancho": 57.2,
        "largo": 78.7
      },
      "G": {
        "ancho": 59.7,
        "largo": 82.6
      },
      "EG": {
        "ancho": 63.5,
        "largo": 85.1
      },
      "EEG": {
        "ancho": 66,
        "largo": 87.6
      }
    },
    "tolerancia": {
      "ancho": 1.3,
      "largo": 1.3
    },
    "pxPorCm": 7.1997,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 595,
        "y": 330,
        "max": 14,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 36,
      "tablaTallas": 45,
      "matrizColor": 48,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 36,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-d0601",
    "nombre": "Camisa mezclilla manga larga · Dama (D0601)",
    "nombreFamilia": "Camisa mezclilla manga larga",
    "familia": "yazbek-mezclilla",
    "codigoFabricante": "D0601",
    "fabricante": "Yazbek",
    "silueta": "Dama",
    "categoria": "Camisas",
    "descripcion": "Para equipos que buscan una presentación casual.",
    "gramaje": 255,
    "tejido": "Mezclilla",
    "composicion": "100% algodón",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/d0601.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-652"
    ],
    "tecnicas": [
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 48.3,
        "largo": 63.5
      },
      "M": {
        "ancho": 50.8,
        "largo": 64.8
      },
      "G": {
        "ancho": 53.3,
        "largo": 66
      },
      "EG": {
        "ancho": 55.9,
        "largo": 67.3
      },
      "EEG": {
        "ancho": 58.4,
        "largo": 68.6
      }
    },
    "tolerancia": {
      "ancho": 1.3,
      "largo": 1.3
    },
    "pxPorCm": 6.9571,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 582,
        "y": 330,
        "max": 14,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 36,
      "tablaTallas": 45,
      "matrizColor": 48,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 36,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c0701",
    "nombre": "Sudadera con capucha y cangurera · Adultos (C0701)",
    "nombreFamilia": "Sudadera con capucha y cangurera",
    "familia": "yazbek-sudadera-capucha",
    "codigoFabricante": "C0701",
    "fabricante": "Yazbek",
    "silueta": "Adultos",
    "categoria": "Sudaderas",
    "descripcion": "Una opción casual para equipos y artículos de marca.",
    "gramaje": 275,
    "tejido": "Felpa",
    "composicion": "50% algodón / 50% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/c0701.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-102",
      "yazbek-230",
      "yazbek-427"
    ],
    "tecnicas": [
      "serigrafia",
      "bordado"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 50.8,
        "largo": 68.6
      },
      "M": {
        "ancho": 55.9,
        "largo": 71.1
      },
      "G": {
        "ancho": 61,
        "largo": 73.7
      },
      "EG": {
        "ancho": 66,
        "largo": 76.2
      },
      "EEG": {
        "ancho": 71.1,
        "largo": 78.7
      }
    },
    "tolerancia": {
      "ancho": 1.9,
      "largo": 3.2
    },
    "pxPorCm": 11.648,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 656,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 390,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 30,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 30,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c0703",
    "nombre": "Sudadera con ¼ de cierre · Adultos (C0703)",
    "nombreFamilia": "Sudadera con ¼ de cierre",
    "familia": "yazbek-sudadera-cuarto",
    "codigoFabricante": "C0703",
    "fabricante": "Yazbek",
    "silueta": "Adultos",
    "categoria": "Sudaderas",
    "descripcion": "Cuello y cierre corto; alternativa sin capucha.",
    "gramaje": 275,
    "tejido": "Felpa",
    "composicion": "50% algodón / 50% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/c0703.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-2415"
    ],
    "tecnicas": [
      "bordado",
      "serigrafia"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 50.8,
        "largo": 71.8
      },
      "M": {
        "ancho": 55.9,
        "largo": 74.3
      },
      "G": {
        "ancho": 61,
        "largo": 76.8
      },
      "EG": {
        "ancho": 66,
        "largo": 79.4
      },
      "EEG": {
        "ancho": 71.1,
        "largo": 82
      }
    },
    "tolerancia": {
      "ancho": 1.9,
      "largo": 3.2
    },
    "pxPorCm": 11.4257,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 653,
        "y": 330,
        "max": 14,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 31,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 31,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-c1504",
    "nombre": "Polo ActiviTee manga larga · Caballero (C1504)",
    "nombreFamilia": "Polo ActiviTee manga larga",
    "familia": "yazbek-activa-polo-larga",
    "codigoFabricante": "C1504",
    "fabricante": "Yazbek",
    "silueta": "Caballero",
    "categoria": "Polos",
    "descripcion": "Complemento de manga larga para uniformes ligeros.",
    "gramaje": 150,
    "tejido": "Mesh",
    "composicion": "100% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/c1504.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-100"
    ],
    "tecnicas": [
      "serigrafia"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG",
      "EEG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 48.3,
        "largo": 70.5
      },
      "M": {
        "ancho": 53.3,
        "largo": 73
      },
      "G": {
        "ancho": 58.4,
        "largo": 75.6
      },
      "EG": {
        "ancho": 63.5,
        "largo": 78.1
      },
      "EEG": {
        "ancho": 68.6,
        "largo": 80.6
      }
    },
    "tolerancia": {
      "ancho": 1.9,
      "largo": 2.5
    },
    "pxPorCm": 7.401,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 595,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 420,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 28,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 28,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  },
  {
    "id": "yazbek-d1504",
    "nombre": "Polo ActiviTee manga larga · Dama (D1504)",
    "nombreFamilia": "Polo ActiviTee manga larga",
    "familia": "yazbek-activa-polo-larga",
    "codigoFabricante": "D1504",
    "fabricante": "Yazbek",
    "silueta": "Dama",
    "categoria": "Polos",
    "descripcion": "Complemento de manga larga para uniformes ligeros.",
    "gramaje": 150,
    "tejido": "Mesh",
    "composicion": "100% poliéster",
    "composicionColor": {},
    "foto": "img/productos/yazbek-ia/d1504.webp",
    "renderOrientativo": true,
    "colores": [
      "yazbek-415",
      "yazbek-414",
      "yazbek-100"
    ],
    "tecnicas": [
      "serigrafia"
    ],
    "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
    "tallas": [
      "CH",
      "M",
      "G",
      "EG"
    ],
    "tablaTallas": {
      "CH": {
        "ancho": 43.2,
        "largo": 64.1
      },
      "M": {
        "ancho": 47.6,
        "largo": 66.7
      },
      "G": {
        "ancho": 52.1,
        "largo": 69.2
      },
      "EG": {
        "ancho": 56.5,
        "largo": 71.8
      }
    },
    "tolerancia": {
      "ancho": 2.5,
      "largo": 2.5
    },
    "pxPorCm": 7.3316,
    "zonas": [
      {
        "id": "pecho-izq",
        "nombre": "Pecho izquierdo",
        "x": 584,
        "y": 330,
        "max": 14,
        "orientativa": true
      },
      {
        "id": "centro",
        "nombre": "Frente centrado",
        "x": 500,
        "y": 420,
        "max": 30,
        "orientativa": true
      }
    ],
    "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
    "fuente": {
      "catalogo": "Yazbek · catalogo.pdf",
      "pagina": 28,
      "tablaTallas": 44,
      "matrizColor": 47,
      "decorado": 46,
      "sha256": "642a2870b2662c9ee2259dae5876b9c39977de81475018d38d11c5145b662425"
    },
    "imagenFuente": {
      "origen": "IA",
      "referenciaCatalogo": "Yazbek · catalogo.pdf",
      "pagina": 28,
      "ilustrativa": true,
      "replicaVerificada": false
    },
    "escalaNota": "Esquema orientativo basado en el ancho de talla G; no es un patrón ni un área de impresión aprobada.",
    "imagenIA": true
  }
]);
config.colores.push(...[{"id": "yazbek-415", "nombre": "Negro", "codigo": "415", "hex": "#292829", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-414", "nombre": "Marino", "codigo": "414", "hex": "#242d3f", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-100", "nombre": "Blanco", "codigo": "100", "hex": "#ebebeb", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-102", "nombre": "Gris Jaspe", "codigo": "102", "hex": "#c7c6c6", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-421", "nombre": "Royal", "codigo": "421", "hex": "#263c76", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-413", "nombre": "Rojo", "codigo": "413", "hex": "#a82b27", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-420", "nombre": "Jade", "codigo": "420", "hex": "#296d46", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-426", "nombre": "Gris", "codigo": "426", "hex": "#494949", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-700", "nombre": "Blanco", "codigo": "700", "hex": "#f0f0f1", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-701", "nombre": "Azul Cielo", "codigo": "701", "hex": "#b1c8da", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-703", "nombre": "Gris", "codigo": "703", "hex": "#9fa1ae", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-704", "nombre": "Cobalto", "codigo": "704", "hex": "#7789bb", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-705", "nombre": "Rosa", "codigo": "705", "hex": "#f0d0df", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-200", "nombre": "Beige", "codigo": "200", "hex": "#aaa588", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-213", "nombre": "Azul Francia", "codigo": "213", "hex": "#3063a5", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-425", "nombre": "Vino", "codigo": "425", "hex": "#4c0f14", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-652", "nombre": "Índigo Claro", "codigo": "652", "hex": "#425677", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-230", "nombre": "Arena", "codigo": "230", "hex": "#eddab9", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-427", "nombre": "Verde Bosque", "codigo": "427", "hex": "#353a26", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}, {"id": "yazbek-2415", "nombre": "Negro Jaspe", "codigo": "2415", "hex": "#474c4f", "fabricante": "Yazbek", "muestra": "Aproximación de muestra impresa del catálogo; no Pantone."}]);
config.productosHistoricos=[];
if (typeof module !== "undefined" && module.exports) module.exports = config;
else window.ZAIN = config;
})();
