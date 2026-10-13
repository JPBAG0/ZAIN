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
if (typeof module !== "undefined" && module.exports) module.exports = config;
else window.ZAIN = config;
})();
