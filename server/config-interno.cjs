// Catálogo interno ZAIN; referencias de compras nuevas se guardan en la base privada.
module.exports = {
  "marca": "ZAIN",
  "pedidosApi": "https://upzecgfgdtllxdhshhkd.supabase.co/functions/v1/zain-pedidos",
  "privacidadPublicada": true,
  "medicion": {
    "activa": true,
    "origenes": [
      "https://zain.com.mx",
      "https://zain-amber-sigma.vercel.app"
    ],
    "googleAdsId": "AW-18438312158",
    "etiquetaSolicitud": "R0WHCIfxk6AdEN6hidhE",
    "etiquetaWhatsApp": "kQHRCIrxk6AdEN6hidhE"
  },
  "whatsapp": "525662923967",
  "correo": "atencion.zain@gmail.com",
  "ciudad": "Guadalajara, Jalisco",
  "instagram": "https://instagram.com/thezainlab",
  "horario": "Lunes a viernes de 9:00 a 18:00 · Sábados de 9:00 a 14:00",
  "minimoPiezas": null,
  "minimoPedido": 12,
  "minimoTexto": "Pedido mínimo: 12 piezas · bolsas desde 100",
  "seguimientoWhatsApp": [
    {
      "id": "amable",
      "nombre": "Seguimiento amable",
      "texto": "Hola {nombre}, soy {vendedor} de ZAIN. ¿Pudiste revisar la cotización de {prenda}? Si te late, ¿la apartamos para entregarte el {fecha A} o el {fecha B}?"
    },
    {
      "id": "lo-pienso",
      "nombre": "Lo pienso o lo consulto",
      "texto": "Sí, claro, así estás más seguro. Para ayudarte, ¿qué es lo que te falta definir, el precio, los tiempos o el diseño? Si quieres te mando fotos de trabajos parecidos para enseñárselas a quien decide. El precio te lo respeto hasta el {fecha}."
    },
    {
      "id": "precio",
      "nombre": "Está caro",
      "texto": "Sí, te entiendo. Fuera del precio, ¿hay algo más que te detenga? Lo que incluye es {beneficio confirmado}; sale a ${precio_por_persona} por persona de tu equipo. Si ajustamos {cantidad o técnica}, ¿lo cerramos así?"
    },
    {
      "id": "retroalimentacion",
      "nombre": "Pedir retroalimentación",
      "texto": "{nombre}, gracias por considerarnos. Queremos mejorar en lo que hacemos y nos ayudaría mucho saber qué nos faltó: ¿fue el precio, el tiempo de entrega, el diseño u otra cosa? Con una palabra nos basta."
    },
    {
      "id": "postventa",
      "nombre": "Post venta",
      "texto": "Hola {nombre}, ¿qué tal les quedaron los {prenda}? Nos encantaría ver una foto del equipo con ellos y, si te animas, compartirla en nuestra sección de clientes. Para tu próximo pedido aquí estamos."
    }
  ],
  "posadas": {
    "id": "posadas-2026",
    "activa": true,
    "bannerActivo": true,
    "inicio": "2026-10-22",
    "fin": "2026-12-31",
    "textoBanner": "Paquetes para tu posada — uniformes para todo tu equipo",
    "paquetes": [
      {
        "id": "gorra-chaleco",
        "nombre": "Gorra + chaleco",
        "estado": "PENDIENTE",
        "minimoPaquetes": null,
        "piezasPorPaquete": null,
        "precioPaquete": null,
        "precioPieza": null,
        "impuesto": null,
        "contenido": [
          {
            "producto": "Gorra",
            "cantidad": null,
            "tecnica": null,
            "ubicacion": null
          },
          {
            "producto": "Chaleco",
            "cantidad": null,
            "tecnica": null,
            "ubicacion": null
          }
        ]
      },
      {
        "id": "polo-gorra",
        "nombre": "Polo + gorra",
        "estado": "PENDIENTE",
        "minimoPaquetes": null,
        "piezasPorPaquete": null,
        "precioPaquete": null,
        "precioPieza": null,
        "impuesto": null,
        "contenido": [
          {
            "producto": "Polo",
            "cantidad": null,
            "tecnica": null,
            "ubicacion": null
          },
          {
            "producto": "Gorra",
            "cantidad": null,
            "tecnica": null,
            "ubicacion": null
          }
        ]
      }
    ]
  },
  "clientesSatisfechos": [
    {
      "id": "trabajo-1",
      "estado": "PENDIENTE",
      "permisoPublicar": false,
      "permisoEmpresa": false,
      "permisoImagen": false,
      "empresa": "",
      "foto": "",
      "frase": "",
      "producto": ""
    },
    {
      "id": "trabajo-2",
      "estado": "PENDIENTE",
      "permisoPublicar": false,
      "permisoEmpresa": false,
      "permisoImagen": false,
      "empresa": "",
      "foto": "",
      "frase": "",
      "producto": ""
    },
    {
      "id": "trabajo-3",
      "estado": "PENDIENTE",
      "permisoPublicar": false,
      "permisoEmpresa": false,
      "permisoImagen": false,
      "empresa": "",
      "foto": "",
      "frase": "",
      "producto": ""
    }
  ],
  "preciosDesde": [
    {
      "categoria": "Playeras",
      "precio": 130
    },
    {
      "categoria": "Polos",
      "precio": 165
    },
    {
      "categoria": "Camisas",
      "precio": 394
    }
  ],
  "preciosLeyenda": "Precio por pieza con tu logo, en pedidos de 50 piezas o más, más IVA. Cambia según modelo, color, talla, técnica, tamaño del logo y cantidad.",
  "diasEntrega": "7 a 12 días hábiles",
  "tintasLogo": [
    {
      "nombre": "Blanco",
      "hex": "#f6f6f4"
    },
    {
      "nombre": "Negro",
      "hex": "#141416"
    },
    {
      "nombre": "Dorado",
      "hex": "#c9a453"
    },
    {
      "nombre": "Plata",
      "hex": "#b4b4b4"
    },
    {
      "nombre": "Rojo",
      "hex": "#d02f35"
    },
    {
      "nombre": "Vino",
      "hex": "#7a2438"
    },
    {
      "nombre": "Naranja",
      "hex": "#f07828"
    },
    {
      "nombre": "Amarillo",
      "hex": "#f2c52b"
    },
    {
      "nombre": "Verde",
      "hex": "#399c59"
    },
    {
      "nombre": "Verde botella",
      "hex": "#205a42"
    },
    {
      "nombre": "Azul rey",
      "hex": "#2457c7"
    },
    {
      "nombre": "Azul marino",
      "hex": "#182f53"
    },
    {
      "nombre": "Cian",
      "hex": "#21b5cf"
    },
    {
      "nombre": "Morado",
      "hex": "#7951b7"
    },
    {
      "nombre": "Rosa",
      "hex": "#e66aa4"
    }
  ],
  "escalaMaxLogo": 1.3,
  "colores": [
    {
      "id": "bolsa-boutique-negro",
      "nombre": "Negro",
      "hex": "#000000"
    },
    {
      "id": "bolsa-boutique-azul-rey",
      "nombre": "Azul rey",
      "hex": "#0957c6"
    },
    {
      "id": "bolsa-boutique-rojo",
      "nombre": "Rojo",
      "hex": "#bb3937"
    },
    {
      "id": "bolsa-boutique-blanco",
      "nombre": "Blanco",
      "hex": "#ffffff"
    },
    {
      "id": "bolsa-boutique-rosa",
      "nombre": "Rosa",
      "hex": "#f895d2"
    },
    {
      "id": "bolsa-sobre-chico-negro",
      "nombre": "Negro",
      "hex": "#000000"
    },
    {
      "id": "bolsa-sobre-chico-rosa",
      "nombre": "Rosa",
      "hex": "#f895d2"
    },
    {
      "id": "bolsa-sobre-chico-kaki",
      "nombre": "Kaki",
      "hex": "#ae935e"
    },
    {
      "id": "bolsa-sobre-chico-morado",
      "nombre": "Morado",
      "hex": "#564b9c"
    },
    {
      "id": "bolsa-sobre-chico-blanco",
      "nombre": "Blanco",
      "hex": "#ffffff"
    },
    {
      "id": "bolsa-sobre-chico-azul-rey",
      "nombre": "Azul rey",
      "hex": "#0957c6"
    },
    {
      "id": "bolsa-sobre-chico-rojo",
      "nombre": "Rojo",
      "hex": "#bb3937"
    },
    {
      "id": "bolsa-sobre-chico-verde-limon",
      "nombre": "Verde limón",
      "hex": "#9fed51"
    },
    {
      "id": "bolsa-sobre-grande-negro",
      "nombre": "Negro",
      "hex": "#000000"
    },
    {
      "id": "bolsa-sobre-grande-gris-oxford",
      "nombre": "Gris oxford",
      "hex": "#4b4a4a"
    },
    {
      "id": "bolsa-sobre-grande-kaki",
      "nombre": "Kaki",
      "hex": "#ae935e"
    },
    {
      "id": "bolsa-sobre-grande-blanco",
      "nombre": "Blanco",
      "hex": "#ffffff"
    },
    {
      "id": "bolsa-sobre-grande-rojo",
      "nombre": "Rojo",
      "hex": "#bb3937"
    },
    {
      "id": "bolsa-regalo-negro",
      "nombre": "Negro",
      "hex": "#000000"
    },
    {
      "id": "bolsa-regalo-rojo",
      "nombre": "Rojo",
      "hex": "#bb3937"
    },
    {
      "id": "bolsa-regalo-verde-limon",
      "nombre": "Verde limón",
      "hex": "#9fed51"
    },
    {
      "id": "bolsa-regalo-blanco",
      "nombre": "Blanco",
      "hex": "#ffffff"
    },
    {
      "id": "bolsa-regalo-azul-rey",
      "nombre": "Azul rey",
      "hex": "#0957c6"
    },
    {
      "id": "bolsa-expo-negro",
      "nombre": "Negro",
      "hex": "#000000"
    },
    {
      "id": "bolsa-expo-rojo",
      "nombre": "Rojo",
      "hex": "#bb3937"
    },
    {
      "id": "bolsa-expo-blanco",
      "nombre": "Blanco",
      "hex": "#ffffff"
    },
    {
      "id": "bolsa-zapatera-negro",
      "nombre": "Negro",
      "hex": "#000000"
    },
    {
      "id": "bolsa-zapatera-rojo",
      "nombre": "Rojo",
      "hex": "#bb3937"
    },
    {
      "id": "bolsa-zapatera-verde-limon",
      "nombre": "Verde limón",
      "hex": "#9fed51"
    },
    {
      "id": "bolsa-zapatera-blanco",
      "nombre": "Blanco",
      "hex": "#ffffff"
    },
    {
      "id": "bolsa-zapatera-azul-rey",
      "nombre": "Azul rey",
      "hex": "#0957c6"
    },
    {
      "id": "bolsa-market-negro",
      "nombre": "Negro",
      "hex": "#000000"
    },
    {
      "id": "bolsa-market-rojo",
      "nombre": "Rojo",
      "hex": "#bb3937"
    },
    {
      "id": "bolsa-market-naranja",
      "nombre": "Naranja",
      "hex": "#ff751f"
    },
    {
      "id": "bolsa-market-rosa",
      "nombre": "Rosa",
      "hex": "#f895d2"
    },
    {
      "id": "bolsa-market-blanco",
      "nombre": "Blanco",
      "hex": "#ffffff"
    },
    {
      "id": "bolsa-market-azul-rey",
      "nombre": "Azul rey",
      "hex": "#0957c6"
    },
    {
      "id": "bolsa-market-kaki",
      "nombre": "Kaki",
      "hex": "#ae935e"
    },
    {
      "id": "bolsa-market-azul-marino",
      "nombre": "Azul marino",
      "hex": "#28314f"
    },
    {
      "id": "bolsa-market-amarillo",
      "nombre": "Amarillo",
      "hex": "#fdf370"
    },
    {
      "id": "bolsa-market-fiusha",
      "nombre": "Fiusha",
      "hex": "#c84088"
    },
    {
      "id": "bolsa-market-tinto",
      "nombre": "Tinto",
      "hex": "#792f28"
    },
    {
      "id": "bolsa-market-verde-limon",
      "nombre": "Verde limón",
      "hex": "#9fed51"
    },
    {
      "id": "bolsa-market-morado",
      "nombre": "Morado",
      "hex": "#8c52ff"
    },
    {
      "id": "bolsa-market-gris-plata",
      "nombre": "Gris plata",
      "hex": "#b4b4b4"
    },
    {
      "id": "bolsa-market-lino",
      "nombre": "Lino",
      "hex": "#e6ded2"
    },
    {
      "id": "bolsa-restaurant-negro",
      "nombre": "Negro",
      "hex": "#000000"
    },
    {
      "id": "bolsa-restaurant-kaki",
      "nombre": "Kaki",
      "hex": "#a38856"
    },
    {
      "id": "bolsa-restaurant-blanco",
      "nombre": "Blanco",
      "hex": "#ffffff"
    },
    {
      "id": "bolsa-colombia-gris-oxford",
      "nombre": "Gris oxford",
      "hex": "#4b4a4a"
    },
    {
      "id": "bolsa-colombia-rojo",
      "nombre": "Rojo",
      "hex": "#a27f7d"
    },
    {
      "id": "bolsa-colombia-beige",
      "nombre": "Beige",
      "hex": "#c9c2a6"
    },
    {
      "id": "bolsa-colombia-azul-cielo",
      "nombre": "Azul cielo",
      "hex": "#5a7b94"
    },
    {
      "id": "bolsa-manta-manta",
      "nombre": "Manta",
      "hex": "#e6ded2"
    },
    {
      "id": "bolsa-mezclilla-mezclilla",
      "nombre": "Mezclilla",
      "hex": "#28324f"
    },
    {
      "id": "bolsa-morral-negro",
      "nombre": "Negro",
      "hex": "#000000"
    },
    {
      "id": "bolsa-morral-azul-rey",
      "nombre": "Azul rey",
      "hex": "#0957c6"
    },
    {
      "id": "bolsa-jumbo-negro",
      "nombre": "Negro",
      "hex": "#000000"
    },
    {
      "id": "blanco",
      "nombre": "Blanco",
      "hex": "#f7f7f5"
    },
    {
      "id": "negro",
      "nombre": "Negro",
      "hex": "#1d1d1f"
    },
    {
      "id": "marino",
      "nombre": "Azul marino",
      "hex": "#1f2a44"
    },
    {
      "id": "rey",
      "nombre": "Azul rey",
      "hex": "#2546b8"
    },
    {
      "id": "gris",
      "nombre": "Gris jaspe",
      "hex": "#a9abad"
    },
    {
      "id": "oxford",
      "nombre": "Gris oxford",
      "hex": "#4a4c50"
    },
    {
      "id": "rojo",
      "nombre": "Rojo",
      "hex": "#b8262c"
    },
    {
      "id": "vino",
      "nombre": "Vino",
      "hex": "#5e1f2d"
    },
    {
      "id": "botella",
      "nombre": "Verde botella",
      "hex": "#1f4a36"
    },
    {
      "id": "olivo",
      "nombre": "Verde olivo",
      "hex": "#5d6040"
    },
    {
      "id": "arena",
      "nombre": "Arena",
      "hex": "#d8cbb2"
    },
    {
      "id": "natural",
      "nombre": "Natural",
      "hex": "#ffffff"
    },
    {
      "id": "yazbek-415",
      "nombre": "Negro",
      "codigo": "415",
      "hex": "#292829",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-071"
    },
    {
      "id": "yazbek-414",
      "nombre": "Marino",
      "codigo": "414",
      "hex": "#242d3f",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-072"
    },
    {
      "id": "yazbek-100",
      "nombre": "Blanco",
      "codigo": "100",
      "hex": "#ebebeb",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-073"
    },
    {
      "id": "yazbek-102",
      "nombre": "Gris Jaspe",
      "codigo": "102",
      "hex": "#c7c6c6",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-074"
    },
    {
      "id": "yazbek-421",
      "nombre": "Royal",
      "codigo": "421",
      "hex": "#263c76",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-075"
    },
    {
      "id": "yazbek-413",
      "nombre": "Rojo",
      "codigo": "413",
      "hex": "#a82b27",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-076"
    },
    {
      "id": "yazbek-420",
      "nombre": "Jade",
      "codigo": "420",
      "hex": "#296d46",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-077"
    },
    {
      "id": "yazbek-426",
      "nombre": "Gris",
      "codigo": "426",
      "hex": "#494949",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-078"
    },
    {
      "id": "yazbek-700",
      "nombre": "Blanco",
      "codigo": "700",
      "hex": "#f0f0f1",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-079"
    },
    {
      "id": "yazbek-701",
      "nombre": "Azul Cielo",
      "codigo": "701",
      "hex": "#b1c8da",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-080"
    },
    {
      "id": "yazbek-703",
      "nombre": "Gris",
      "codigo": "703",
      "hex": "#9fa1ae",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-081"
    },
    {
      "id": "yazbek-704",
      "nombre": "Cobalto",
      "codigo": "704",
      "hex": "#7789bb",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-082"
    },
    {
      "id": "yazbek-705",
      "nombre": "Rosa",
      "codigo": "705",
      "hex": "#f0d0df",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-083"
    },
    {
      "id": "yazbek-200",
      "nombre": "Beige",
      "codigo": "200",
      "hex": "#aaa588",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-084"
    },
    {
      "id": "yazbek-213",
      "nombre": "Azul Francia",
      "codigo": "213",
      "hex": "#3063a5",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-085"
    },
    {
      "id": "yazbek-425",
      "nombre": "Vino",
      "codigo": "425",
      "hex": "#4c0f14",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-086"
    },
    {
      "id": "yazbek-652",
      "nombre": "Índigo Claro",
      "codigo": "652",
      "hex": "#425677",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-087"
    },
    {
      "id": "yazbek-230",
      "nombre": "Arena",
      "codigo": "230",
      "hex": "#eddab9",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-088"
    },
    {
      "id": "yazbek-427",
      "nombre": "Verde Bosque",
      "codigo": "427",
      "hex": "#353a26",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-089"
    },
    {
      "id": "yazbek-2415",
      "nombre": "Negro Jaspe",
      "codigo": "2415",
      "hex": "#474c4f",
      "fabricante": "Yazbek",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "idPublico": "zain-color-090"
    },
    {
      "id": "zn-po-008-c01",
      "nombre": "Blanco",
      "hex": "#f6f6f4"
    },
    {
      "id": "zn-po-008-c02",
      "nombre": "Rojo",
      "hex": "#b91f2e"
    },
    {
      "id": "zn-po-008-c03",
      "nombre": "Azul rey",
      "hex": "#244d9c"
    },
    {
      "id": "zn-po-008-c04",
      "nombre": "Azul marino",
      "hex": "#1f304e"
    },
    {
      "id": "zn-po-008-c05",
      "nombre": "Gris jaspe",
      "hex": "#b9bdbb"
    },
    {
      "id": "zn-po-008-c06",
      "nombre": "Carbón",
      "hex": "#4b4f51"
    },
    {
      "id": "zn-po-008-c07",
      "nombre": "Negro",
      "hex": "#252527"
    },
    {
      "id": "zn-po-009-c01",
      "nombre": "Blanco",
      "hex": "#f6f6f4"
    },
    {
      "id": "zn-po-009-c02",
      "nombre": "Rojo",
      "hex": "#b91f2e"
    },
    {
      "id": "zn-po-009-c03",
      "nombre": "Azul rey",
      "hex": "#244d9c"
    },
    {
      "id": "zn-po-009-c04",
      "nombre": "Azul marino",
      "hex": "#1f304e"
    },
    {
      "id": "zn-po-009-c05",
      "nombre": "Gris jaspe",
      "hex": "#b9bdbb"
    },
    {
      "id": "zn-po-009-c06",
      "nombre": "Carbón",
      "hex": "#4b4f51"
    },
    {
      "id": "zn-po-009-c07",
      "nombre": "Negro",
      "hex": "#252527"
    },
    {
      "id": "zn-po-010-c01",
      "nombre": "Blanco",
      "hex": "#f6f6f4"
    },
    {
      "id": "zn-po-010-c02",
      "nombre": "Azul rey",
      "hex": "#244d9c"
    },
    {
      "id": "zn-po-010-c03",
      "nombre": "Azul marino",
      "hex": "#1f304e"
    },
    {
      "id": "zn-po-010-c04",
      "nombre": "Rojo",
      "hex": "#b91f2e"
    },
    {
      "id": "zn-po-010-c05",
      "nombre": "Gris Oxford",
      "hex": "#9ba5a6"
    },
    {
      "id": "zn-po-010-c06",
      "nombre": "Carbón",
      "hex": "#4b4f51"
    },
    {
      "id": "zn-po-010-c07",
      "nombre": "Negro",
      "hex": "#252527"
    },
    {
      "id": "zn-po-011-c01",
      "nombre": "Blanco",
      "hex": "#f6f6f4"
    },
    {
      "id": "zn-po-011-c02",
      "nombre": "Azul rey",
      "hex": "#244d9c"
    },
    {
      "id": "zn-po-011-c03",
      "nombre": "Azul marino",
      "hex": "#1f304e"
    },
    {
      "id": "zn-po-011-c04",
      "nombre": "Rojo",
      "hex": "#b91f2e"
    },
    {
      "id": "zn-po-011-c05",
      "nombre": "Gris Oxford",
      "hex": "#9ba5a6"
    },
    {
      "id": "zn-po-011-c06",
      "nombre": "Carbón",
      "hex": "#4b4f51"
    },
    {
      "id": "zn-po-011-c07",
      "nombre": "Negro",
      "hex": "#252527"
    },
    {
      "id": "zn-pl-008-c01",
      "nombre": "Blanco",
      "hex": "#f6f6f4"
    },
    {
      "id": "zn-pl-008-c02",
      "nombre": "Azul rey",
      "hex": "#244d9c"
    },
    {
      "id": "zn-pl-008-c03",
      "nombre": "Azul marino",
      "hex": "#1f304e"
    },
    {
      "id": "zn-pl-008-c04",
      "nombre": "Rojo",
      "hex": "#b91f2e"
    },
    {
      "id": "zn-pl-008-c05",
      "nombre": "Carbón",
      "hex": "#4b4f51"
    },
    {
      "id": "zn-pl-008-c06",
      "nombre": "Negro",
      "hex": "#252527"
    },
    {
      "id": "zn-pl-009-c01",
      "nombre": "Blanco",
      "hex": "#f6f6f4"
    },
    {
      "id": "zn-pl-009-c02",
      "nombre": "Azul rey",
      "hex": "#244d9c"
    },
    {
      "id": "zn-pl-009-c03",
      "nombre": "Azul marino",
      "hex": "#1f304e"
    },
    {
      "id": "zn-pl-009-c04",
      "nombre": "Rojo",
      "hex": "#b91f2e"
    },
    {
      "id": "zn-pl-009-c05",
      "nombre": "Carbón",
      "hex": "#4b4f51"
    },
    {
      "id": "zn-pl-009-c06",
      "nombre": "Negro",
      "hex": "#252527"
    },
    {
      "id": "zn-cm-012-c01",
      "nombre": "Blanco Oxford",
      "hex": "#eeeae3"
    },
    {
      "id": "zn-cm-012-c02",
      "nombre": "Rosa Oxford",
      "hex": "#dfc5cd"
    },
    {
      "id": "zn-cm-012-c03",
      "nombre": "Azul marino Oxford",
      "hex": "#344963"
    },
    {
      "id": "zn-cm-012-c04",
      "nombre": "Negro Oxford",
      "hex": "#3c3f43"
    },
    {
      "id": "zn-cm-013-c01",
      "nombre": "Blanco Oxford",
      "hex": "#eeeae3"
    },
    {
      "id": "zn-cm-013-c02",
      "nombre": "Rosa Oxford",
      "hex": "#dfc5cd"
    },
    {
      "id": "zn-cm-013-c03",
      "nombre": "Azul marino Oxford",
      "hex": "#344963"
    },
    {
      "id": "zn-cm-013-c04",
      "nombre": "Negro Oxford",
      "hex": "#3c3f43"
    },
    {
      "id": "zn-cm-014-c01",
      "nombre": "Blanco Oxford",
      "hex": "#eeeae3"
    },
    {
      "id": "zn-cm-014-c02",
      "nombre": "Rosa Oxford",
      "hex": "#dfc5cd"
    },
    {
      "id": "zn-cm-014-c03",
      "nombre": "Azul marino Oxford",
      "hex": "#344963"
    },
    {
      "id": "zn-cm-014-c04",
      "nombre": "Negro Oxford",
      "hex": "#3c3f43"
    },
    {
      "id": "zn-cm-015-c01",
      "nombre": "Blanco Oxford",
      "hex": "#eeeae3"
    },
    {
      "id": "zn-cm-015-c02",
      "nombre": "Rosa Oxford",
      "hex": "#dfc5cd"
    },
    {
      "id": "zn-cm-015-c03",
      "nombre": "Azul marino Oxford",
      "hex": "#344963"
    },
    {
      "id": "zn-cm-015-c04",
      "nombre": "Negro Oxford",
      "hex": "#3c3f43"
    },
    {
      "id": "zn-ce-001-c01",
      "nombre": "Azul marino",
      "hex": "#1f304e"
    },
    {
      "id": "zn-ce-001-c02",
      "nombre": "Carbón",
      "hex": "#4b4f51"
    },
    {
      "id": "zn-ce-001-c03",
      "nombre": "Negro",
      "hex": "#252527"
    },
    {
      "id": "zn-ce-001-c04",
      "nombre": "Verde bosque",
      "hex": "#254537"
    },
    {
      "id": "zn-ch-002-c01",
      "nombre": "Negro",
      "hex": "#252527"
    },
    {
      "id": "zn-ch-002-c02",
      "nombre": "Gris plata",
      "hex": "#aeb1b3"
    },
    {
      "id": "zn-ch-002-c03",
      "nombre": "Azul marino",
      "hex": "#1f304e"
    },
    {
      "id": "zn-ch-002-c04",
      "nombre": "Caqui",
      "hex": "#b2a28d"
    },
    {
      "id": "zn-ch-003-c01",
      "nombre": "Negro",
      "hex": "#252527"
    },
    {
      "id": "zn-ch-003-c02",
      "nombre": "Rojo",
      "hex": "#b91f2e"
    },
    {
      "id": "zn-ch-003-c03",
      "nombre": "Azul marino",
      "hex": "#1f304e"
    },
    {
      "id": "zn-ch-003-c04",
      "nombre": "Azul rey",
      "hex": "#244d9c"
    },
    {
      "id": "zn-ch-003-c05",
      "nombre": "Verde cactus",
      "hex": "#276148"
    },
    {
      "id": "zn-ch-003-c06",
      "nombre": "Azul cobalto",
      "hex": "#4c677c"
    },
    {
      "id": "zn-go-002-c01",
      "nombre": "Marino",
      "hex": "#1f2a44"
    },
    {
      "id": "zn-go-002-c02",
      "nombre": "Azul cielo",
      "hex": "#8fb8de"
    },
    {
      "id": "zn-go-002-c03",
      "nombre": "Vino",
      "hex": "#6b1f2e"
    },
    {
      "id": "zn-go-002-c04",
      "nombre": "Rojo",
      "hex": "#b8262c"
    },
    {
      "id": "zn-go-002-c05",
      "nombre": "Caqui",
      "hex": "#b2a28d"
    },
    {
      "id": "zn-go-002-c06",
      "nombre": "Negro",
      "hex": "#1d1d1f"
    },
    {
      "id": "zn-go-002-c07",
      "nombre": "Gris claro",
      "hex": "#c4c6c8"
    },
    {
      "id": "zn-go-002-c08",
      "nombre": "Rojo radiante",
      "hex": "#d7263d"
    },
    {
      "id": "zn-go-002-c09",
      "nombre": "Rosa pastel",
      "hex": "#f2c4ce"
    },
    {
      "id": "zn-go-002-c10",
      "nombre": "Blanco",
      "hex": "#f7f7f5"
    },
    {
      "id": "zn-go-002-c11",
      "nombre": "Verde salvia",
      "hex": "#9caf88"
    },
    {
      "id": "zn-go-002-c12",
      "nombre": "Gris oscuro",
      "hex": "#4b4f51"
    },
    {
      "id": "zn-go-002-c13",
      "nombre": "Azul rey",
      "hex": "#2546b8"
    },
    {
      "id": "zn-go-002-c14",
      "nombre": "Azul galáctico",
      "hex": "#2b3a8c"
    },
    {
      "id": "zn-go-003-c01",
      "nombre": "Marino",
      "hex": "#1f2a44"
    },
    {
      "id": "zn-go-003-c02",
      "nombre": "Vino",
      "hex": "#6b1f2e"
    },
    {
      "id": "zn-go-003-c03",
      "nombre": "Rojo",
      "hex": "#b8262c"
    },
    {
      "id": "zn-go-003-c04",
      "nombre": "Caqui",
      "hex": "#b2a28d"
    },
    {
      "id": "zn-go-003-c05",
      "nombre": "Negro",
      "hex": "#1d1d1f"
    },
    {
      "id": "zn-go-003-c06",
      "nombre": "Blanco",
      "hex": "#f7f7f5"
    },
    {
      "id": "zn-go-003-c07",
      "nombre": "Olivo",
      "hex": "#5b5e3a"
    },
    {
      "id": "zn-go-003-c08",
      "nombre": "Gris oscuro",
      "hex": "#4b4f51"
    },
    {
      "id": "zn-go-003-c09",
      "nombre": "Azul rey",
      "hex": "#2546b8"
    },
    {
      "id": "zn-go-004-c01",
      "nombre": "Negro / Beige / Mostaza",
      "hex": "#1d1d1f",
      "hex2": "#e0d4bc",
      "hexMalla": "#e0d4bc"
    },
    {
      "id": "zn-go-004-c02",
      "nombre": "Negro / Café / Mostaza",
      "hex": "#1d1d1f",
      "hex2": "#6b4a32",
      "hexMalla": "#6b4a32"
    },
    {
      "id": "zn-go-004-c03",
      "nombre": "Olivo / Gris oscuro / Caqui",
      "hex": "#5b5e3a",
      "hex2": "#4b4f51",
      "hexMalla": "#4b4f51"
    },
    {
      "id": "zn-go-004-c04",
      "nombre": "Caqui / Vino / Olivo",
      "hex": "#b2a28d",
      "hex2": "#6b1f2e",
      "hexMalla": "#6b1f2e"
    },
    {
      "id": "zn-go-005-c01",
      "nombre": "Caqui",
      "hex": "#a39270"
    },
    {
      "id": "zn-go-005-c02",
      "nombre": "Azul rey",
      "hex": "#1f4fb0"
    },
    {
      "id": "zn-go-005-c03",
      "nombre": "Piedra",
      "hex": "#d3c8a8"
    },
    {
      "id": "zn-go-005-c04",
      "nombre": "Rosa",
      "hex": "#d94a80"
    },
    {
      "id": "zn-go-005-c05",
      "nombre": "Olivo",
      "hex": "#3e4229"
    },
    {
      "id": "zn-go-005-c06",
      "nombre": "Blanco",
      "hex": "#f7f7f5"
    },
    {
      "id": "zn-go-005-c07",
      "nombre": "Marino",
      "hex": "#1b2347"
    },
    {
      "id": "zn-go-005-c08",
      "nombre": "Negro",
      "hex": "#1d1d1f"
    },
    {
      "id": "zn-go-005-c09",
      "nombre": "Gris",
      "hex": "#a8a8a8"
    },
    {
      "id": "zn-go-006-c01",
      "nombre": "Caqui / Marino",
      "hex": "#c8ad88",
      "hex2": "#262b45",
      "hexMalla": "#262b45"
    },
    {
      "id": "zn-go-006-c02",
      "nombre": "Negro",
      "hex": "#1d1d1f",
      "hexMalla": "#1d1d1f"
    },
    {
      "id": "zn-go-006-c03",
      "nombre": "Marino",
      "hex": "#1f2340",
      "hexMalla": "#1f2340"
    },
    {
      "id": "zn-go-006-c04",
      "nombre": "Negro / Gris oxford",
      "hex": "#1d1d1f",
      "hex2": "#5a5a5a",
      "hexMalla": "#5a5a5a"
    },
    {
      "id": "zn-go-006-c05",
      "nombre": "Gris jaspe / Negro",
      "hex": "#b3b5b7",
      "hex2": "#1d1d1f",
      "hexMalla": "#1d1d1f"
    },
    {
      "id": "zn-go-006-c06",
      "nombre": "Olivo / Café / Caqui",
      "hex": "#3a4034",
      "hex2": "#9a6248",
      "hexMalla": "#c8ad88"
    },
    {
      "id": "zn-go-007-c01",
      "nombre": "Gris oxford",
      "hex": "#55595c"
    },
    {
      "id": "zn-go-007-c02",
      "nombre": "Negro",
      "hex": "#1d1d1f"
    },
    {
      "id": "zn-go-007-c03",
      "nombre": "Rojo",
      "hex": "#c8102e"
    },
    {
      "id": "zn-go-007-c04",
      "nombre": "Marino",
      "hex": "#1b2140"
    },
    {
      "id": "zn-go-007-c05",
      "nombre": "Petróleo",
      "hex": "#2c4566"
    },
    {
      "id": "zn-go-007-c06",
      "nombre": "Blanco",
      "hex": "#f7f7f5"
    },
    {
      "id": "zn-ce-002-c01",
      "nombre": "Olivo",
      "hex": "#4f5a3a"
    },
    {
      "id": "zn-ce-002-c02",
      "nombre": "Vino",
      "hex": "#6e1528"
    },
    {
      "id": "zn-ce-002-c03",
      "nombre": "Azul marino",
      "hex": "#1f304e"
    },
    {
      "id": "zn-ce-002-c04",
      "nombre": "Carbón",
      "hex": "#4b4f51"
    },
    {
      "id": "zn-ce-002-c05",
      "nombre": "Negro",
      "hex": "#252527"
    }
  ],
  "tecnicas": [
    {
      "id": "bordado",
      "nombre": "Bordado",
      "corto": "Hilo cosido a la prenda. El acabado más elegante y el que más dura.",
      "ideal": "Polos, camisas, chamarras y gorras",
      "detalle": "Relieve real · hasta 12 colores de hilo · no se despinta",
      "foto": "img/fotos/t-bordado.webp"
    },
    {
      "id": "serigrafia",
      "nombre": "Serigrafía",
      "corto": "Tinta aplicada con malla. Colores sólidos para pedidos de volumen.",
      "ideal": "Playeras, sudaderas y bolsas en volumen",
      "detalle": "Tintas planas · ideal desde 50 piezas · muy resistente al lavado",
      "foto": "img/fotos/t-serigrafia.webp"
    },
    {
      "id": "dtf",
      "nombre": "DTF",
      "corto": "Transfer a todo color planchado con calor. Fotos, degradados y detalle fino.",
      "ideal": "Logos a todo color y tirajes cortos",
      "detalle": "Color ilimitado · detalle fino · cantidad a confirmar al cotizar",
      "foto": "img/fotos/t-dtf.webp"
    }
  ],
  "grupos": {
    "bolsas": {
      "nombre": "Bolsas",
      "descripcion": "Bolsas ecológicas para regalos, eventos, tiendas y pedidos de volumen. Elige el modelo, sus medidas y su color.",
      "aviso": "Consulta disponibilidad de modelo y color. Las imágenes son ilustrativas y los colores pueden variar.",
      "foto": "img/productos/bolsas/expo.webp",
      "productoInicial": "bolsa-expo"
    }
  },
  "productos": [
    {
      "id": "playera",
      "nombre": "Playera cuello redondo",
      "categoria": "Playeras",
      "descripcion": "Algodón peinado 180 g. La base de todo uniforme y evento.",
      "foto": "img/productos/originales-limpios/playera-v2.webp",
      "colores": [
        "negro",
        "blanco",
        "marino",
        "rey",
        "gris",
        "oxford",
        "rojo",
        "vino",
        "botella",
        "arena"
      ],
      "tecnicas": [
        "serigrafia",
        "dtf",
        "bordado"
      ],
      "tallas": [
        "CH",
        "M",
        "G",
        "XG",
        "2XG"
      ],
      "pxPorCm": 10.4,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 640,
          "y": 300,
          "max": 10
        },
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 360,
          "max": 28
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 360,
          "y": 300,
          "max": 10
        }
      ],
      "fotoOriginal": "img/productos/playera.webp",
      "imagenLimpia": true,
      "sku": "ZN-PL-001",
      "idPublico": "playera",
      "activo": false
    },
    {
      "id": "polo",
      "nombre": "Polo piqué",
      "categoria": "Polos",
      "descripcion": "Piqué 220 g con cuello tejido. El uniforme de oficina por excelencia.",
      "foto": "img/productos/originales-limpios/polo-v2.webp",
      "colores": [
        "marino",
        "blanco",
        "negro",
        "rey",
        "gris",
        "rojo",
        "vino",
        "botella",
        "arena"
      ],
      "tecnicas": [
        "bordado",
        "dtf",
        "serigrafia"
      ],
      "tallas": [
        "CH",
        "M",
        "G",
        "XG",
        "2XG"
      ],
      "pxPorCm": 10,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 640,
          "y": 330,
          "max": 10
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 360,
          "y": 330,
          "max": 10
        },
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 420,
          "max": 24
        }
      ],
      "fotoOriginal": "img/productos/polo.webp",
      "imagenLimpia": true,
      "sku": "ZN-PO-001",
      "idPublico": "polo",
      "activo": false
    },
    {
      "id": "camisa",
      "nombre": "Camisa oxford",
      "categoria": "Camisas",
      "descripcion": "Manga larga, tela oxford. Para atención a clientes y fuerza de ventas.",
      "foto": "img/productos/originales-limpios/camisa-v2.webp",
      "colores": [
        "blanco",
        "marino",
        "rey",
        "gris",
        "negro",
        "arena"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tallas": [
        "CH",
        "M",
        "G",
        "XG",
        "2XG"
      ],
      "pxPorCm": 7.7,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 615,
          "y": 300,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 385,
          "y": 300,
          "max": 9
        }
      ],
      "fotoOriginal": "img/productos/camisa.webp",
      "imagenLimpia": true,
      "sku": "ZN-CM-001",
      "idPublico": "camisa",
      "activo": false
    },
    {
      "id": "chamarra",
      "nombre": "Chamarra softshell",
      "categoria": "Chamarras",
      "descripcion": "Cierre completo, rompevientos y repelente al agua. Para campo y temporada de frío.",
      "foto": "img/productos/originales-limpios/chamarra-v2.webp",
      "colores": [
        "negro",
        "marino",
        "oxford",
        "rojo",
        "botella",
        "olivo",
        "blanco"
      ],
      "tecnicas": [
        "bordado",
        "dtf"
      ],
      "tallas": [
        "CH",
        "M",
        "G",
        "XG",
        "2XG"
      ],
      "pxPorCm": 7.7,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 615,
          "y": 300,
          "max": 10
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 385,
          "y": 300,
          "max": 10
        }
      ],
      "fotoOriginal": "img/productos/chamarra.webp",
      "imagenLimpia": true,
      "sku": "ZN-CH-001",
      "idPublico": "chamarra",
      "activo": false
    },
    {
      "id": "sudadera",
      "nombre": "Sudadera con gorro",
      "categoria": "Sudaderas",
      "descripcion": "Felpa perchada 280 g con bolsa canguro. Merch que sí se usa.",
      "foto": "img/productos/originales-limpios/sudadera-v2.webp",
      "colores": [
        "gris",
        "negro",
        "oxford",
        "marino",
        "vino",
        "botella",
        "arena",
        "blanco"
      ],
      "tecnicas": [
        "serigrafia",
        "dtf",
        "bordado"
      ],
      "tallas": [
        "CH",
        "M",
        "G",
        "XG",
        "2XG"
      ],
      "pxPorCm": 7.7,
      "zonas": [
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 390,
          "max": 26
        },
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 610,
          "y": 320,
          "max": 10
        }
      ],
      "fotoOriginal": "img/productos/sudadera.webp",
      "imagenLimpia": true,
      "sku": "ZN-SU-001",
      "idPublico": "sudadera",
      "activo": false
    },
    {
      "id": "gorra",
      "nombre": "Gorra 6 paneles",
      "categoria": "Gorras",
      "descripcion": "Frente estructurado y ajuste trasero. El accesorio más pedido para eventos.",
      "foto": "img/productos/originales-limpios/gorra-v2.webp",
      "colores": [
        "arena",
        "negro",
        "blanco",
        "marino",
        "rey",
        "rojo",
        "gris",
        "botella"
      ],
      "tecnicas": [
        "bordado",
        "dtf"
      ],
      "tallas": [],
      "pxPorCm": 42,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 500,
          "y": 430,
          "max": 12
        }
      ],
      "fotoOriginal": "img/productos/gorra.webp",
      "imagenLimpia": true,
      "sku": "ZN-GO-001",
      "idPublico": "gorra",
      "activo": true
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
      "piezasBulto": 500,
      "sku": "ZN-BO-001",
      "idPublico": "bolsa-boutique",
      "activo": true
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
      "piezasBulto": 500,
      "sku": "ZN-BO-002",
      "idPublico": "bolsa-sobre-chico",
      "activo": true
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
          "max": 18
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 5
      },
      "piezasBulto": 500,
      "sku": "ZN-BO-003",
      "idPublico": "bolsa-sobre-grande",
      "activo": true
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
      "piezasBulto": 1000,
      "sku": "ZN-BO-004",
      "idPublico": "bolsa-regalo",
      "activo": true
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
      "piezasBulto": 1000,
      "sku": "ZN-BO-005",
      "idPublico": "bolsa-expo",
      "activo": true
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
      "piezasBulto": 1000,
      "sku": "ZN-BO-006",
      "idPublico": "bolsa-zapatera",
      "activo": true
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
      "piezasBulto": 1000,
      "sku": "ZN-BO-007",
      "idPublico": "bolsa-market",
      "activo": true
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
          "max": 14
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 11
      },
      "piezasBulto": 1000,
      "sku": "ZN-BO-008",
      "idPublico": "bolsa-restaurant",
      "activo": true
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
      "aplicacionesNota": "También sublimable en beige y azul cielo; consulta esta opción al cotizar.",
      "sku": "ZN-BO-009",
      "idPublico": "bolsa-colombia",
      "activo": true
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
          "max": 18
        }
      ],
      "disponibilidad": "Consulta disponibilidad de modelo y color.",
      "fuente": {
        "catalogo": "Bolsas ecológicas · Colección 2026",
        "pagina": 13
      },
      "piezasBulto": 500,
      "aplicacionesNota": "El catálogo indica que es sublimable en color beige; consulta esta opción al cotizar.",
      "sku": "ZN-BO-010",
      "idPublico": "bolsa-manta",
      "activo": true
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
      "piezasBulto": 1000,
      "sku": "ZN-BO-011",
      "idPublico": "bolsa-mezclilla",
      "activo": true
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
      "piezasBulto": 500,
      "sku": "ZN-BO-012",
      "idPublico": "bolsa-morral",
      "activo": true
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
      "piezasBulto": 500,
      "sku": "ZN-BO-013",
      "idPublico": "bolsa-jumbo",
      "activo": true
    },
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
      "imagenIA": true,
      "sku": "ZN-PO-002",
      "idPublico": "zn-po-002",
      "activo": true,
      "nombreFamiliaComercial": "Polo clásico",
      "nombreComercial": "Polo clásico · Caballero"
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
      "imagenIA": true,
      "sku": "ZN-PO-003",
      "idPublico": "zn-po-003",
      "activo": true,
      "nombreFamiliaComercial": "Polo clásico",
      "nombreComercial": "Polo clásico · Dama"
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
      "imagenIA": true,
      "sku": "ZN-CM-002",
      "idPublico": "zn-cm-002",
      "activo": true,
      "nombreFamiliaComercial": "Camisa ejecutiva manga larga",
      "nombreComercial": "Camisa ejecutiva manga larga · Caballero"
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
      "imagenIA": true,
      "sku": "ZN-CM-003",
      "idPublico": "zn-cm-003",
      "activo": true,
      "nombreFamiliaComercial": "Camisa ejecutiva manga larga",
      "nombreComercial": "Camisa ejecutiva manga larga · Dama"
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
      "imagenIA": true,
      "sku": "ZN-PL-002",
      "idPublico": "zn-pl-002",
      "activo": true,
      "nombreFamiliaComercial": "Playera esencial",
      "nombreComercial": "Playera esencial · Caballero"
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
      "imagenIA": true,
      "sku": "ZN-PL-003",
      "idPublico": "zn-pl-003",
      "activo": true,
      "nombreFamiliaComercial": "Playera esencial",
      "nombreComercial": "Playera esencial · Dama"
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
      "foto": "img/productos/yazbek-ia/c0300-blanco-2026-10-14.webp",
      "versionRender": 2,
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
      "imagenIA": true,
      "sku": "ZN-PL-004",
      "idPublico": "zn-pl-004",
      "activo": true,
      "nombreFamiliaComercial": "Playera premium",
      "nombreComercial": "Playera premium · Caballero"
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
      "imagenIA": true,
      "sku": "ZN-PL-005",
      "idPublico": "zn-pl-005",
      "activo": true,
      "nombreFamiliaComercial": "Playera premium",
      "nombreComercial": "Playera premium · Dama"
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
      "imagenIA": true,
      "sku": "ZN-CM-004",
      "idPublico": "zn-cm-004",
      "activo": true,
      "nombreFamiliaComercial": "Camisa de trabajo manga corta",
      "nombreComercial": "Camisa de trabajo manga corta · Caballero"
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
      "imagenIA": true,
      "sku": "ZN-CM-005",
      "idPublico": "zn-cm-005",
      "activo": true,
      "nombreFamiliaComercial": "Camisa de trabajo manga corta",
      "nombreComercial": "Camisa de trabajo manga corta · Dama"
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
      "imagenIA": true,
      "sku": "ZN-CM-006",
      "idPublico": "zn-cm-006",
      "activo": true,
      "nombreFamiliaComercial": "Camisa de trabajo manga larga",
      "nombreComercial": "Camisa de trabajo manga larga · Caballero"
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
      "imagenIA": true,
      "sku": "ZN-CM-007",
      "idPublico": "zn-cm-007",
      "activo": true,
      "nombreFamiliaComercial": "Camisa de trabajo manga larga",
      "nombreComercial": "Camisa de trabajo manga larga · Dama"
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
      "imagenIA": true,
      "sku": "ZN-CM-008",
      "idPublico": "zn-cm-008",
      "activo": true,
      "nombreFamiliaComercial": "Camisa ejecutiva manga corta",
      "nombreComercial": "Camisa ejecutiva manga corta · Caballero"
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
      "imagenIA": true,
      "sku": "ZN-CM-009",
      "idPublico": "zn-cm-009",
      "activo": true,
      "nombreFamiliaComercial": "Camisa ejecutiva manga corta",
      "nombreComercial": "Camisa ejecutiva manga corta · Dama"
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
      "imagenIA": true,
      "sku": "ZN-PO-004",
      "idPublico": "zn-po-004",
      "activo": true,
      "nombreFamiliaComercial": "Polo ligero",
      "nombreComercial": "Polo ligero · Caballero"
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
      "imagenIA": true,
      "sku": "ZN-PO-005",
      "idPublico": "zn-po-005",
      "activo": true,
      "nombreFamiliaComercial": "Polo ligero",
      "nombreComercial": "Polo ligero · Dama"
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
      "imagenIA": true,
      "sku": "ZN-PL-006",
      "idPublico": "zn-pl-006",
      "activo": true,
      "nombreFamiliaComercial": "Playera deportiva",
      "nombreComercial": "Playera deportiva · Caballero"
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
      "imagenIA": true,
      "sku": "ZN-PL-007",
      "idPublico": "zn-pl-007",
      "activo": true,
      "nombreFamiliaComercial": "Playera deportiva",
      "nombreComercial": "Playera deportiva · Dama"
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
      "imagenIA": true,
      "sku": "ZN-SU-002",
      "idPublico": "zn-su-002",
      "activo": true,
      "nombreFamiliaComercial": "Sudadera con cierre",
      "nombreComercial": "Sudadera con cierre · Adultos"
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
      "imagenIA": true,
      "sku": "ZN-CM-010",
      "idPublico": "zn-cm-010",
      "activo": true,
      "nombreFamiliaComercial": "Camisa denim",
      "nombreComercial": "Camisa denim · Caballero"
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
      "imagenIA": true,
      "sku": "ZN-CM-011",
      "idPublico": "zn-cm-011",
      "activo": true,
      "nombreFamiliaComercial": "Camisa denim",
      "nombreComercial": "Camisa denim · Dama"
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
      "imagenIA": true,
      "sku": "ZN-SU-003",
      "idPublico": "zn-su-003",
      "activo": true,
      "nombreFamiliaComercial": "Sudadera canguro",
      "nombreComercial": "Sudadera canguro · Adultos"
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
      "imagenIA": true,
      "sku": "ZN-SU-004",
      "idPublico": "zn-su-004",
      "activo": true,
      "nombreFamiliaComercial": "Sudadera cuello alto",
      "nombreComercial": "Sudadera cuello alto · Adultos"
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
      "imagenIA": true,
      "sku": "ZN-PO-006",
      "idPublico": "zn-po-006",
      "activo": true,
      "nombreFamiliaComercial": "Polo ligero manga larga",
      "nombreComercial": "Polo ligero manga larga · Caballero"
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
      "imagenIA": true,
      "sku": "ZN-PO-007",
      "idPublico": "zn-po-007",
      "activo": true,
      "nombreFamiliaComercial": "Polo ligero manga larga",
      "nombreComercial": "Polo ligero manga larga · Dama"
    },
    {
      "id": "zn-po-008",
      "idPublico": "zn-po-008",
      "sku": "ZN-PO-008",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Polo corporativo",
      "nombreComercial": "Polo corporativo · Caballero",
      "nombreFamilia": "Polo corporativo",
      "nombreFamiliaComercial": "Polo corporativo",
      "familia": "zain-2026-polo-corporativo",
      "categoria": "Polos",
      "silueta": "Caballero",
      "descripcion": "Polo de manga corta en mezcla de algodón y poliéster para uniformar a tu equipo.",
      "especificaciones": "Refuerzo en hombros. Tapacostura. Doble pespunte en bajos y sisa. 3 Botones al tono de la tela. Construcción tubular. Cuello y puños tejidos.",
      "tejido": "Piqué Pre-encogido",
      "composicion": "50% Algodón - 50% Poliéster",
      "composicionColor": {
        "zn-po-008-c05": "90% Algodón - 10% Poliéster"
      },
      "foto": "img/productos/zain/zn-po-008-render.webp",
      "colores": [
        "zn-po-008-c01",
        "zn-po-008-c02",
        "zn-po-008-c03",
        "zn-po-008-c04",
        "zn-po-008-c05",
        "zn-po-008-c06",
        "zn-po-008-c07"
      ],
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tecnicas": [
        "bordado",
        "serigrafia"
      ],
      "tecnicasNota": "Técnicas documentadas: Bordado, Serigrafía. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 9.035,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        },
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 410,
          "max": 22
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "gramaje": 230,
      "tablaTallas": {
        "S": {
          "ancho": 45.72,
          "largo": 72.39
        },
        "M": {
          "ancho": 50.8,
          "largo": 74.93
        },
        "L": {
          "ancho": 55.88,
          "largo": 77.47
        },
        "XL": {
          "ancho": 60.96,
          "largo": 80.01
        },
        "2XL": {
          "ancho": 66.04,
          "largo": 82.55
        }
      },
      "tolerancia": {
        "ancho": 1.27,
        "largo": 1.27
      },
      "fotoModelo": "img/productos/zain/zn-po-008-modelo.webp"
    },
    {
      "id": "zn-po-009",
      "idPublico": "zn-po-009",
      "sku": "ZN-PO-009",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Polo corporativo",
      "nombreComercial": "Polo corporativo · Dama",
      "nombreFamilia": "Polo corporativo",
      "nombreFamiliaComercial": "Polo corporativo",
      "familia": "zain-2026-polo-corporativo",
      "categoria": "Polos",
      "silueta": "Dama",
      "descripcion": "Polo de manga corta y corte silueteado en mezcla de algodón y poliéster.",
      "especificaciones": "Refuerzo en hombros. Tapacostura. Doble pespunte en bajos y sisa. 4 Botones al tono de la tela. Cuello tejido. Aberturas laterales.",
      "tejido": "Piqué Pre-encogido",
      "composicion": "50% Algodón - 50% Poliéster",
      "composicionColor": {
        "zn-po-009-c05": "90% Algodón - 10% Poliéster"
      },
      "foto": "img/productos/zain/zn-po-009-render.webp",
      "colores": [
        "zn-po-009-c01",
        "zn-po-009-c02",
        "zn-po-009-c03",
        "zn-po-009-c04",
        "zn-po-009-c05",
        "zn-po-009-c06",
        "zn-po-009-c07"
      ],
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tecnicas": [
        "bordado",
        "serigrafia"
      ],
      "tecnicasNota": "Técnicas documentadas: Bordado, Serigrafía. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 8.902,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        },
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 410,
          "max": 22
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "gramaje": 230,
      "tablaTallas": {
        "S": {
          "ancho": 43.18,
          "largo": 60.96
        },
        "M": {
          "ancho": 45.72,
          "largo": 63.5
        },
        "L": {
          "ancho": 48.26,
          "largo": 66.04
        },
        "XL": {
          "ancho": 50.8,
          "largo": 68.58
        },
        "2XL": {
          "ancho": 53.34,
          "largo": 71.12
        }
      },
      "tolerancia": {
        "ancho": 1.27,
        "largo": 1.27
      },
      "fotoModelo": "img/productos/zain/zn-po-009-modelo.webp"
    },
    {
      "id": "zn-po-010",
      "idPublico": "zn-po-010",
      "sku": "ZN-PO-010",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Polo de piqué deportivo",
      "nombreComercial": "Polo de piqué deportivo · Caballero",
      "nombreFamilia": "Polo de piqué deportivo",
      "nombreFamiliaComercial": "Polo de piqué deportivo",
      "familia": "zain-2026-polo-deportivo",
      "categoria": "Polos",
      "silueta": "Caballero",
      "descripcion": "Polo de manga corta en piqué de poliéster, con corte recto.",
      "especificaciones": "Cerrado de costados. Triple pespunte en bajos y hombros. Cuello y puños tejidos. Tapacostura a contraste. Presillas a contraste. 3 Botones al tono de la tela.",
      "tejido": "Piqué",
      "composicion": "100% Poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-po-010-render.webp",
      "colores": [
        "zn-po-010-c01",
        "zn-po-010-c02",
        "zn-po-010-c03",
        "zn-po-010-c04",
        "zn-po-010-c05",
        "zn-po-010-c06",
        "zn-po-010-c07"
      ],
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "4XL"
      ],
      "tecnicas": [
        "bordado",
        "serigrafia"
      ],
      "tecnicasNota": "Técnicas documentadas: Bordado, Serigrafía. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 8.489,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        },
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 410,
          "max": 22
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "gramaje": 200,
      "tablaTallas": {
        "S": {
          "ancho": 46.99,
          "largo": 72.39
        },
        "M": {
          "ancho": 52.07,
          "largo": 74.93
        },
        "L": {
          "ancho": 57.15,
          "largo": 77.47
        },
        "XL": {
          "ancho": 62.23,
          "largo": 80.01
        },
        "2XL": {
          "ancho": 67.31,
          "largo": 82.55
        },
        "3XL": {
          "ancho": 72.39,
          "largo": 85.09
        },
        "4XL": {
          "ancho": 77.47,
          "largo": 87.63
        }
      },
      "tolerancia": {
        "ancho": 1.27,
        "largo": 1.27
      },
      "fotoModelo": "img/productos/zain/zn-po-010-modelo.webp"
    },
    {
      "id": "zn-po-011",
      "idPublico": "zn-po-011",
      "sku": "ZN-PO-011",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Polo de piqué deportivo",
      "nombreComercial": "Polo de piqué deportivo · Dama",
      "nombreFamilia": "Polo de piqué deportivo",
      "nombreFamiliaComercial": "Polo de piqué deportivo",
      "familia": "zain-2026-polo-deportivo",
      "categoria": "Polos",
      "silueta": "Dama",
      "descripcion": "Polo de manga corta en piqué de poliéster, con corte silueteado.",
      "especificaciones": "Cerrado de costados. Triple pespunte en bajos y hombros. Cuello y puños tejidos. Tapacostura a contraste. Presillas a contraste. 4 Botones al tono de la tela.",
      "tejido": "Piqué",
      "composicion": "100% Poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-po-011-render.webp",
      "colores": [
        "zn-po-011-c01",
        "zn-po-011-c02",
        "zn-po-011-c03",
        "zn-po-011-c04",
        "zn-po-011-c05",
        "zn-po-011-c06",
        "zn-po-011-c07"
      ],
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "4XL"
      ],
      "tecnicas": [
        "bordado",
        "serigrafia"
      ],
      "tecnicasNota": "Técnicas documentadas: Bordado, Serigrafía. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 8.023,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        },
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 410,
          "max": 22
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "gramaje": 200,
      "tablaTallas": {
        "S": {
          "ancho": 44.45,
          "largo": 60.96
        },
        "M": {
          "ancho": 46.99,
          "largo": 63.5
        },
        "L": {
          "ancho": 49.53,
          "largo": 66.04
        },
        "XL": {
          "ancho": 52.07,
          "largo": 68.58
        },
        "2XL": {
          "ancho": 54.61,
          "largo": 71.12
        },
        "3XL": {
          "ancho": 57.15,
          "largo": 73.66
        },
        "4XL": {
          "ancho": 59.69,
          "largo": 76.2
        }
      },
      "tolerancia": {
        "ancho": 1.27,
        "largo": 1.27
      },
      "fotoModelo": "img/productos/zain/zn-po-011-modelo.webp"
    },
    {
      "id": "zn-pl-008",
      "idPublico": "zn-pl-008",
      "sku": "ZN-PL-008",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Playera deportiva de malla",
      "nombreComercial": "Playera deportiva de malla · Caballero",
      "nombreFamilia": "Playera deportiva de malla",
      "nombreFamiliaComercial": "Playera deportiva de malla",
      "familia": "zain-2026-playera-deportiva",
      "categoria": "Playeras",
      "silueta": "Caballero",
      "descripcion": "Playera deportiva de cuello redondo en malla de poliéster y corte recto.",
      "especificaciones": "Cuello redondo. Cerrado de costados. Tapacostura a contraste. Doble pespunte en cuello. Etiqueta desprendible. Barra reflectiva en mangas. Los detalles reflectivos no se ofrecen como equipo de protección certificado.",
      "tejido": "Mesh",
      "composicion": "100% Poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-pl-008-render.webp",
      "colores": [
        "zn-pl-008-c01",
        "zn-pl-008-c02",
        "zn-pl-008-c03",
        "zn-pl-008-c04",
        "zn-pl-008-c05",
        "zn-pl-008-c06"
      ],
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tecnicas": [
        "serigrafia",
        "dtf"
      ],
      "tecnicasNota": "Técnicas documentadas: Serigrafía, DTF. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 8.878,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        },
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 410,
          "max": 24
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "gramaje": 150,
      "tablaTallas": {
        "S": {
          "ancho": 45.72,
          "largo": 68.58
        },
        "M": {
          "ancho": 50.8,
          "largo": 71.12
        },
        "L": {
          "ancho": 55.88,
          "largo": 73.66
        },
        "XL": {
          "ancho": 60.96,
          "largo": 76.2
        },
        "2XL": {
          "ancho": 66.04,
          "largo": 78.74
        }
      },
      "tolerancia": {
        "ancho": 1.27,
        "largo": 1.27
      },
      "fotoModelo": "img/productos/zain/zn-pl-008-modelo.webp",
      "acabadosFijos": {
        "reflectivos": [
          {
            "x": 90,
            "y": 375,
            "w": 90,
            "h": 50
          }
        ]
      }
    },
    {
      "id": "zn-pl-009",
      "idPublico": "zn-pl-009",
      "sku": "ZN-PL-009",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Playera deportiva de malla",
      "nombreComercial": "Playera deportiva de malla · Dama",
      "nombreFamilia": "Playera deportiva de malla",
      "nombreFamiliaComercial": "Playera deportiva de malla",
      "familia": "zain-2026-playera-deportiva",
      "categoria": "Playeras",
      "silueta": "Dama",
      "descripcion": "Playera deportiva de cuello redondo en malla de poliéster y corte silueteado.",
      "especificaciones": "Cuello redondo. Cerrado de costados. Tapacostura a contraste. Doble pespunte en cuello. Etiqueta desprendible. Barra reflectiva en mangas. Los detalles reflectivos no se ofrecen como equipo de protección certificado.",
      "tejido": "Mesh",
      "composicion": "100% Poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-pl-009-render.webp",
      "colores": [
        "zn-pl-009-c01",
        "zn-pl-009-c02",
        "zn-pl-009-c03",
        "zn-pl-009-c04",
        "zn-pl-009-c05",
        "zn-pl-009-c06"
      ],
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tecnicas": [
        "serigrafia",
        "dtf"
      ],
      "tecnicasNota": "Técnicas documentadas: Serigrafía, DTF. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 9.066,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        },
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 410,
          "max": 24
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "gramaje": 150,
      "tablaTallas": {
        "S": {
          "ancho": 41.91,
          "largo": 60.96
        },
        "M": {
          "ancho": 44.45,
          "largo": 63.5
        },
        "L": {
          "ancho": 46.99,
          "largo": 66.04
        },
        "XL": {
          "ancho": 49.53,
          "largo": 68.58
        },
        "2XL": {
          "ancho": 52.07,
          "largo": 71.12
        }
      },
      "tolerancia": {
        "ancho": 1.27,
        "largo": 1.27
      },
      "fotoModelo": "img/productos/zain/zn-pl-009-modelo.webp",
      "acabadosFijos": {
        "reflectivos": [
          {
            "x": 100,
            "y": 275,
            "w": 90,
            "h": 60
          },
          {
            "x": 825,
            "y": 275,
            "w": 85,
            "h": 60
          }
        ]
      }
    },
    {
      "id": "zn-cm-012",
      "idPublico": "zn-cm-012",
      "sku": "ZN-CM-012",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Camisa Oxford manga corta",
      "nombreComercial": "Camisa Oxford manga corta · Caballero",
      "nombreFamilia": "Camisa Oxford manga corta",
      "nombreFamiliaComercial": "Camisa Oxford manga corta",
      "familia": "zain-2026-oxford-corta",
      "categoria": "Camisas",
      "silueta": "Caballero",
      "descripcion": "Camisa Oxford de manga corta, corte regular y bolsillo frontal.",
      "especificaciones": "Pinzas en espalda. Botón down en cuello. Bolsa frontal. Contraste en bata y pie de cuello.",
      "tejido": "Oxford",
      "composicion": "60% Algodón - 40% Poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-012-render.webp",
      "colores": [
        "zn-cm-012-c01",
        "zn-cm-012-c02",
        "zn-cm-012-c03",
        "zn-cm-012-c04"
      ],
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "4XL"
      ],
      "tecnicas": [
        "bordado",
        "serigrafia"
      ],
      "tecnicasNota": "Técnicas documentadas: Bordado, Serigrafía. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 7.785,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "gramaje": 155,
      "tablaTallas": {
        "S": {
          "ancho": 53.34,
          "largo": 73.66
        },
        "M": {
          "ancho": 55.88,
          "largo": 76.2
        },
        "L": {
          "ancho": 58.42,
          "largo": 78.74
        },
        "XL": {
          "ancho": 60.96,
          "largo": 81.28
        },
        "2XL": {
          "ancho": 66.04,
          "largo": 83.82
        },
        "3XL": {
          "ancho": 71.12,
          "largo": 83.82
        },
        "4XL": {
          "ancho": 76.2,
          "largo": 83.82
        }
      },
      "tolerancia": {
        "ancho": 1.27,
        "largo": 1.27
      },
      "fotoModelo": "img/productos/zain/zn-cm-012-modelo.webp",
      "acabadosFijos": {
        "acentos": true
      }
    },
    {
      "id": "zn-cm-013",
      "idPublico": "zn-cm-013",
      "sku": "ZN-CM-013",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Camisa Oxford manga corta",
      "nombreComercial": "Camisa Oxford manga corta · Dama",
      "nombreFamilia": "Camisa Oxford manga corta",
      "nombreFamiliaComercial": "Camisa Oxford manga corta",
      "familia": "zain-2026-oxford-corta",
      "categoria": "Camisas",
      "silueta": "Dama",
      "descripcion": "Camisa Oxford de manga corta y corte silueteado.",
      "especificaciones": "Pinzas en espalda. Contraste en bata y pie de cuello.",
      "tejido": "Oxford",
      "composicion": "60% Algodón - 40% Poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-013-render.webp",
      "colores": [
        "zn-cm-013-c01",
        "zn-cm-013-c02",
        "zn-cm-013-c03",
        "zn-cm-013-c04"
      ],
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "4XL"
      ],
      "tecnicas": [
        "bordado",
        "serigrafia"
      ],
      "tecnicasNota": "Técnicas documentadas: Bordado, Serigrafía. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 6.991,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "gramaje": 155,
      "tablaTallas": {
        "S": {
          "ancho": 48.26,
          "largo": 62.23
        },
        "M": {
          "ancho": 52.07,
          "largo": 64.77
        },
        "L": {
          "ancho": 55.88,
          "largo": 67.31
        },
        "XL": {
          "ancho": 59.69,
          "largo": 69.85
        },
        "2XL": {
          "ancho": 63.5,
          "largo": 72.39
        },
        "3XL": {
          "ancho": 67.31,
          "largo": 74.93
        },
        "4XL": {
          "ancho": 71.12,
          "largo": 77.47
        }
      },
      "tolerancia": {
        "ancho": 1.27,
        "largo": 1.27
      },
      "acabadosFijos": {
        "acentos": true
      }
    },
    {
      "id": "zn-cm-014",
      "idPublico": "zn-cm-014",
      "sku": "ZN-CM-014",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Camisa Oxford manga larga",
      "nombreComercial": "Camisa Oxford manga larga · Caballero",
      "nombreFamilia": "Camisa Oxford manga larga",
      "nombreFamiliaComercial": "Camisa Oxford manga larga",
      "familia": "zain-2026-oxford-larga",
      "categoria": "Camisas",
      "silueta": "Caballero",
      "descripcion": "Camisa Oxford de manga larga, corte regular y bolsillo frontal.",
      "especificaciones": "Pinzas en espalda. Botón down en cuello. Bolsa frontal. Contraste en bata y pie de cuello. Contraste en aletilla de manga y puño interior. Pinzas en puño.",
      "tejido": "Oxford",
      "composicion": "60% Algodón - 40% Poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-014-render.webp",
      "colores": [
        "zn-cm-014-c01",
        "zn-cm-014-c02",
        "zn-cm-014-c03",
        "zn-cm-014-c04"
      ],
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "4XL"
      ],
      "tecnicas": [
        "bordado",
        "serigrafia"
      ],
      "tecnicasNota": "Técnicas documentadas: Bordado, Serigrafía. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 7.713,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "gramaje": 155,
      "tablaTallas": {
        "S": {
          "ancho": 53.34,
          "largo": 73.66
        },
        "M": {
          "ancho": 55.88,
          "largo": 76.2
        },
        "L": {
          "ancho": 58.42,
          "largo": 78.74
        },
        "XL": {
          "ancho": 60.96,
          "largo": 81.28
        },
        "2XL": {
          "ancho": 66.04,
          "largo": 83.82
        },
        "3XL": {
          "ancho": 71.12,
          "largo": 83.82
        },
        "4XL": {
          "ancho": 76.2,
          "largo": 83.82
        }
      },
      "tolerancia": {
        "ancho": 1.27,
        "largo": 1.27
      },
      "acabadosFijos": {
        "acentos": true
      }
    },
    {
      "id": "zn-cm-015",
      "idPublico": "zn-cm-015",
      "sku": "ZN-CM-015",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Camisa Oxford manga larga",
      "nombreComercial": "Camisa Oxford manga larga · Dama",
      "nombreFamilia": "Camisa Oxford manga larga",
      "nombreFamiliaComercial": "Camisa Oxford manga larga",
      "familia": "zain-2026-oxford-larga",
      "categoria": "Camisas",
      "silueta": "Dama",
      "descripcion": "Camisa Oxford de manga larga y corte silueteado.",
      "especificaciones": "Pinzas en espalda. Contraste en bata y pie de cuello. Contraste en aletilla de manga y puño interior. Pinzas en puño.",
      "tejido": "Oxford",
      "composicion": "60% Algodón - 40% Poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-015-render.webp",
      "colores": [
        "zn-cm-015-c01",
        "zn-cm-015-c02",
        "zn-cm-015-c03",
        "zn-cm-015-c04"
      ],
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL",
        "4XL"
      ],
      "tecnicas": [
        "bordado",
        "serigrafia"
      ],
      "tecnicasNota": "Técnicas documentadas: Bordado, Serigrafía. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 6.645,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "gramaje": 155,
      "tablaTallas": {
        "S": {
          "ancho": 48.26,
          "largo": 62.23
        },
        "M": {
          "ancho": 52.07,
          "largo": 64.77
        },
        "L": {
          "ancho": 55.88,
          "largo": 67.31
        },
        "XL": {
          "ancho": 59.69,
          "largo": 69.85
        },
        "2XL": {
          "ancho": 63.5,
          "largo": 72.39
        },
        "3XL": {
          "ancho": 67.31,
          "largo": 74.93
        },
        "4XL": {
          "ancho": 71.12,
          "largo": 77.47
        }
      },
      "tolerancia": {
        "ancho": 1.27,
        "largo": 1.27
      },
      "fotoModelo": "img/productos/zain/zn-cm-015-modelo.webp",
      "acabadosFijos": {
        "acentos": true
      }
    },
    {
      "id": "zn-ce-001",
      "idPublico": "zn-ce-001",
      "sku": "ZN-CE-001",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Chaleco softshell",
      "nombreComercial": "Chaleco softshell · Unisex",
      "nombreFamilia": "Chaleco softshell",
      "nombreFamiliaComercial": "Chaleco softshell",
      "familia": "zain-2026-chaleco",
      "categoria": "Chalecos",
      "silueta": "Unisex",
      "descripcion": "Chaleco softshell de corte unisex, con cierre frontal y bolsillos laterales con cierre.",
      "especificaciones": "Bolsillos laterales con cierre. Bies a contraste.",
      "tejido": "Softshell",
      "composicion": "100% Poliéster Tricapa",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-ce-001-render.webp",
      "colores": [
        "zn-ce-001-c01",
        "zn-ce-001-c02",
        "zn-ce-001-c03",
        "zn-ce-001-c04"
      ],
      "tallas": [
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tecnicas": [
        "bordado",
        "serigrafia"
      ],
      "tecnicasNota": "Técnicas documentadas: Bordado, Serigrafía. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 8.589,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "gramaje": 310,
      "tablaTallas": {
        "XS": {
          "ancho": 48.0,
          "largo": 65.0
        },
        "S": {
          "ancho": 53.0,
          "largo": 67.0
        },
        "M": {
          "ancho": 56.0,
          "largo": 70.0
        },
        "L": {
          "ancho": 58.0,
          "largo": 72.0
        },
        "XL": {
          "ancho": 61.0,
          "largo": 75.0
        },
        "2XL": {
          "ancho": 64.0,
          "largo": 77.0
        }
      },
      "tolerancia": {
        "ancho": 1.27,
        "largo": 1.27
      },
      "fotoModelo": "img/productos/zain/zn-ce-001-modelo.webp",
      "acabadosFijos": {
        "acentos": true
      }
    },
    {
      "id": "zn-ch-002",
      "idPublico": "zn-ch-002",
      "sku": "ZN-CH-002",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Chamarra de oficina",
      "nombreComercial": "Chamarra de oficina · Unisex",
      "nombreFamilia": "Chamarra de oficina",
      "nombreFamiliaComercial": "Chamarra de oficina",
      "familia": "zain-2026-chamarra-oficina",
      "categoria": "Chamarras",
      "silueta": "Unisex",
      "descripcion": "Chamarra unisex con cierre completo y bolsillos frontales individuales.",
      "especificaciones": "Corte regular. Cierre completo. Bolsillos frontales individuales.",
      "tejido": "Fleece",
      "composicion": "90% poliéster y 10% elastano.",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-ch-002-render.webp",
      "colores": [
        "zn-ch-002-c01",
        "zn-ch-002-c02",
        "zn-ch-002-c03",
        "zn-ch-002-c04"
      ],
      "tallas": [
        "2XS",
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL"
      ],
      "tecnicas": [
        "bordado",
        "serigrafia",
        "dtf"
      ],
      "tecnicasNota": "Técnicas documentadas: Bordado, Serigrafía, DTF. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 8.185,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "fotoModelo": "img/productos/zain/zn-ch-002-modelo.webp"
    },
    {
      "id": "zn-ch-003",
      "idPublico": "zn-ch-003",
      "sku": "ZN-CH-003",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Rompevientos con capucha",
      "nombreComercial": "Rompevientos con capucha · Unisex",
      "nombreFamilia": "Rompevientos con capucha",
      "nombreFamiliaComercial": "Rompevientos con capucha",
      "familia": "zain-2026-rompevientos",
      "categoria": "Chamarras",
      "silueta": "Unisex",
      "descripcion": "Rompevientos unisex con capucha, cierre completo y bolsillos frontales individuales.",
      "especificaciones": "Corte regular. Cierre completo. Bolsillos frontales individuales.",
      "tejido": "Poliéster",
      "composicion": "100% poliéster.",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-ch-003-render.webp",
      "colores": [
        "zn-ch-003-c01",
        "zn-ch-003-c02",
        "zn-ch-003-c03",
        "zn-ch-003-c04",
        "zn-ch-003-c05",
        "zn-ch-003-c06"
      ],
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL"
      ],
      "tecnicas": [
        "bordado",
        "dtf"
      ],
      "tecnicasNota": "Técnicas documentadas: Bordado, DTF. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 11.389,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 645,
          "y": 325,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 355,
          "y": 325,
          "max": 9
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "fotoModelo": "img/productos/zain/zn-ch-003-modelo.webp"
    },
    {
      "id": "zn-go-002",
      "idPublico": "zn-go-002",
      "sku": "ZN-GO-002",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Gorra clásica 6 paneles",
      "nombreComercial": "Gorra clásica 6 paneles",
      "nombreFamilia": "Gorra clásica 6 paneles",
      "nombreFamiliaComercial": "Gorra clásica 6 paneles",
      "familia": "zain-2026-gorra-clasica",
      "categoria": "Gorras",
      "silueta": "Unisex",
      "descripcion": "Gorra clásica de 6 paneles con visera curva. La opción económica para eventos, promociones y equipos, en 14 colores.",
      "especificaciones": "6 paneles. Visera curva. Ojillos de ventilación. Ajuste y circunferencia por confirmar al cotizar.",
      "tejido": "Tela de gorra",
      "composicion": "",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-go-002-render.webp",
      "colores": [
        "zn-go-002-c01",
        "zn-go-002-c02",
        "zn-go-002-c03",
        "zn-go-002-c04",
        "zn-go-002-c05",
        "zn-go-002-c06",
        "zn-go-002-c07",
        "zn-go-002-c08",
        "zn-go-002-c09",
        "zn-go-002-c10",
        "zn-go-002-c11",
        "zn-go-002-c12",
        "zn-go-002-c13",
        "zn-go-002-c14"
      ],
      "tallas": [],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Bordado en frente y lateral. Tamaño, puntadas y ubicación final se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 30,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 455,
          "y": 420,
          "max": 10,
          "maxAlto": 5.5,
          "orientativa": true,
          "inclina": -16,
          "sesgo": 2,
          "compresion": 0.88
        },
        {
          "id": "lateral",
          "nombre": "Lateral izquierdo",
          "x": 790,
          "y": 430,
          "max": 5,
          "maxAlto": 3.5,
          "orientativa": true,
          "inclina": 5,
          "compresion": 0.9
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "detalleMedidas": "Ajuste y circunferencia se confirman al cotizar."
    },
    {
      "id": "zn-go-003",
      "idPublico": "zn-go-003",
      "sku": "ZN-GO-003",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Gorra estructurada",
      "nombreComercial": "Gorra estructurada",
      "nombreFamilia": "Gorra estructurada",
      "nombreFamiliaComercial": "Gorra estructurada",
      "familia": "zain-2026-gorra-estructurada",
      "categoria": "Gorras",
      "silueta": "Unisex",
      "descripcion": "Gorra de 6 paneles con frente estructurado que conserva su forma y visera curva. Económica y con buena presencia para uniformes.",
      "especificaciones": "6 paneles. Frente estructurado. Visera curva. Tipo de ajuste por confirmar al cotizar.",
      "tejido": "Tela de gorra",
      "composicion": "",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-go-003-render.webp",
      "colores": [
        "zn-go-003-c01",
        "zn-go-003-c02",
        "zn-go-003-c03",
        "zn-go-003-c04",
        "zn-go-003-c05",
        "zn-go-003-c06",
        "zn-go-003-c07",
        "zn-go-003-c08",
        "zn-go-003-c09"
      ],
      "tallas": [],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Bordado en frente y lateral. Tamaño, puntadas y ubicación final se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 30,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 455,
          "y": 420,
          "max": 10,
          "maxAlto": 5.5,
          "orientativa": true,
          "inclina": -16,
          "sesgo": 2,
          "compresion": 0.88
        },
        {
          "id": "lateral",
          "nombre": "Lateral izquierdo",
          "x": 790,
          "y": 430,
          "max": 5,
          "maxAlto": 3.5,
          "orientativa": true,
          "inclina": 5,
          "compresion": 0.9
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "detalleMedidas": "Ajuste y circunferencia se confirman al cotizar."
    },
    {
      "id": "zn-go-004",
      "idPublico": "zn-go-004",
      "sku": "ZN-GO-004",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Gorra trucker con visera de gamuza",
      "nombreComercial": "Gorra trucker con visera de gamuza",
      "nombreFamilia": "Gorra trucker con visera de gamuza",
      "nombreFamiliaComercial": "Gorra trucker con visera de gamuza",
      "familia": "zain-2026-gorra-trucker-gamuza",
      "categoria": "Gorras",
      "silueta": "Unisex",
      "descripcion": "Trucker con frente de tela, malla trasera transpirable y visera tipo gamuza. Combinaciones de tres tonos: frente / malla / visera.",
      "especificaciones": "Frente de tela. Malla trasera. Visera tipo gamuza. El lateral es de malla. Ajuste por confirmar al cotizar.",
      "tejido": "Tela, malla y gamuza sintética",
      "composicion": "",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-go-004-render.webp",
      "colores": [
        "zn-go-004-c01",
        "zn-go-004-c02",
        "zn-go-004-c03",
        "zn-go-004-c04"
      ],
      "tallas": [],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Bordado en frente y lateral. Tamaño, puntadas y ubicación final se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 30,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 455,
          "y": 430,
          "max": 10,
          "maxAlto": 5.5,
          "orientativa": true,
          "inclina": -16,
          "sesgo": 2,
          "compresion": 0.88
        },
        {
          "id": "lateral",
          "nombre": "Lateral izquierdo",
          "x": 870,
          "y": 430,
          "max": 5,
          "maxAlto": 3.5,
          "orientativa": true,
          "inclina": 5,
          "compresion": 0.72,
          "textura": 0.25,
          "superficie": "malla"
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "detalleMedidas": "Ajuste y circunferencia se confirman al cotizar.",
      "fotosColor": {
        "zn-go-004-c01": "img/productos/zain/zn-go-004-c01.webp",
        "zn-go-004-c02": "img/productos/zain/zn-go-004-c02.webp",
        "zn-go-004-c03": "img/productos/zain/zn-go-004-c03.webp",
        "zn-go-004-c04": "img/productos/zain/zn-go-004-c04.webp"
      }
    },
    {
      "id": "zn-go-005",
      "idPublico": "zn-go-005",
      "sku": "ZN-GO-005",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Gorra suave de algodón",
      "nombreComercial": "Gorra suave de algodón",
      "nombreFamilia": "Gorra suave de algodón",
      "nombreFamiliaComercial": "Gorra suave de algodón",
      "familia": "zain-2026-gorra-algodon",
      "categoria": "Gorras",
      "silueta": "Unisex",
      "descripcion": "Gorra suave de perfil bajo en algodón peinado, con hebilla metálica ajustable. Estilo relajado para oficina, eventos y regalos corporativos.",
      "especificaciones": "Perfil bajo, 6 paneles. Sin estructura (suave). Algodón peinado. Hebilla metálica ajustable. Visera curva. Banda de sudor de poliéster.",
      "tejido": "Algodón peinado",
      "composicion": "100% algodón.",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-go-005-render.webp",
      "colores": [
        "zn-go-005-c01",
        "zn-go-005-c02",
        "zn-go-005-c03",
        "zn-go-005-c04",
        "zn-go-005-c05",
        "zn-go-005-c06",
        "zn-go-005-c07",
        "zn-go-005-c08",
        "zn-go-005-c09"
      ],
      "tallas": [],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Bordado en frente y lateral. Tamaño, puntadas y ubicación final se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 30,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 470,
          "y": 430,
          "max": 10,
          "maxAlto": 5.5,
          "orientativa": true,
          "inclina": -16,
          "sesgo": 2,
          "compresion": 0.88
        },
        {
          "id": "lateral",
          "nombre": "Lateral izquierdo",
          "x": 790,
          "y": 450,
          "max": 5,
          "maxAlto": 3.5,
          "orientativa": true,
          "inclina": 5,
          "compresion": 0.9
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "medidas": "Unitalla ajustable, 58 cm de circunferencia.",
      "detalleMedidas": "Unitalla ajustable, 58 cm de circunferencia."
    },
    {
      "id": "zn-go-006",
      "idPublico": "zn-go-006",
      "sku": "ZN-GO-006",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Gorra trucker de algodón",
      "nombreComercial": "Gorra trucker de algodón",
      "nombreFamilia": "Gorra trucker de algodón",
      "nombreFamiliaComercial": "Gorra trucker de algodón",
      "familia": "zain-2026-gorra-trucker-algodon",
      "categoria": "Gorras",
      "silueta": "Unisex",
      "descripcion": "Trucker de perfil alto con frente de algodón, malla trasera y cierre snapback. Estructura rígida que luce bien el bordado.",
      "especificaciones": "Perfil alto, 6 paneles. Estructura rígida. Frente 100% algodón; malla 100% poliéster. Cierre snapback. Visera curva. Banda de sudor de algodón. El lateral es de malla.",
      "tejido": "Algodón y malla",
      "composicion": "Frente 100% algodón; malla 100% poliéster.",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-go-006-render.webp",
      "colores": [
        "zn-go-006-c01",
        "zn-go-006-c02",
        "zn-go-006-c03",
        "zn-go-006-c04",
        "zn-go-006-c05",
        "zn-go-006-c06"
      ],
      "tallas": [],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Bordado en frente y lateral. Tamaño, puntadas y ubicación final se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 30,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 465,
          "y": 440,
          "max": 10,
          "maxAlto": 5.5,
          "orientativa": true,
          "inclina": -16,
          "sesgo": 2,
          "compresion": 0.88
        },
        {
          "id": "lateral",
          "nombre": "Lateral izquierdo",
          "x": 845,
          "y": 440,
          "max": 5,
          "maxAlto": 3.5,
          "orientativa": true,
          "inclina": 5,
          "compresion": 0.72,
          "textura": 0.25,
          "superficie": "malla"
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "medidas": "Unitalla ajustable, 58 cm de circunferencia.",
      "detalleMedidas": "Unitalla ajustable, 58 cm de circunferencia.",
      "fotosColor": {
        "zn-go-006-c01": "img/productos/zain/zn-go-006-c01.webp",
        "zn-go-006-c02": "img/productos/zain/zn-go-006-c02.webp",
        "zn-go-006-c03": "img/productos/zain/zn-go-006-c03.webp",
        "zn-go-006-c04": "img/productos/zain/zn-go-006-c04.webp",
        "zn-go-006-c05": "img/productos/zain/zn-go-006-c05.webp",
        "zn-go-006-c06": "img/productos/zain/zn-go-006-c06.webp"
      }
    },
    {
      "id": "zn-go-007",
      "idPublico": "zn-go-007",
      "sku": "ZN-GO-007",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Gorra deportiva",
      "nombreComercial": "Gorra deportiva",
      "nombreFamilia": "Gorra deportiva",
      "nombreFamiliaComercial": "Gorra deportiva",
      "familia": "zain-2026-gorra-deportiva",
      "categoria": "Gorras",
      "silueta": "Unisex",
      "descripcion": "Gorra deportiva de perfil medio en microfibra de secado rápido, con ventilas laterales y ajuste de velcro. Para equipos, carreras y trabajo al aire libre.",
      "especificaciones": "Perfil medio, 6 paneles. Estructura rígida. Microfibra de secado rápido. Ventilas laterales. Ajustador de velcro. Visera curva. Banda de sudor de microporo absorbente.",
      "tejido": "Microfibra",
      "composicion": "100% poliéster.",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-go-007-render.webp",
      "colores": [
        "zn-go-007-c01",
        "zn-go-007-c02",
        "zn-go-007-c03",
        "zn-go-007-c04",
        "zn-go-007-c05",
        "zn-go-007-c06"
      ],
      "tallas": [],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Bordado en frente y lateral. Tamaño, puntadas y ubicación final se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 30,
      "zonas": [
        {
          "id": "frente",
          "nombre": "Frente",
          "x": 480,
          "y": 430,
          "max": 10,
          "maxAlto": 5.5,
          "orientativa": true,
          "inclina": -18,
          "sesgo": 3,
          "compresion": 0.86
        },
        {
          "id": "lateral",
          "nombre": "Lateral izquierdo",
          "x": 830,
          "y": 440,
          "max": 5,
          "maxAlto": 3.5,
          "orientativa": true,
          "inclina": 5,
          "compresion": 0.9
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "medidas": "Unitalla ajustable, 58 cm de circunferencia.",
      "detalleMedidas": "Unitalla ajustable, 58 cm de circunferencia."
    },
    {
      "id": "zn-ce-002",
      "idPublico": "zn-ce-002",
      "sku": "ZN-CE-002",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Chaleco acolchado",
      "nombreComercial": "Chaleco acolchado · Unisex",
      "nombreFamilia": "Chaleco acolchado",
      "nombreFamiliaComercial": "Chaleco acolchado",
      "familia": "zain-2026-chaleco-acolchado",
      "categoria": "Chalecos",
      "silueta": "Unisex",
      "descripcion": "Chaleco unisex acolchado y ultraligero, con cuello alto, cierre metálico completo y bolsillos frontales con cierre. Resistente al viento y empacable.",
      "especificaciones": "Relleno suave. Resistente al viento. Bolsillos frontales. Cierres metálicos. Ultraligero. Empacable (incluye bolsa).",
      "tejido": "Nailon con relleno de poliéster",
      "composicion": "Tela exterior 100% nailon.",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-ce-002-render.webp",
      "colores": [
        "zn-ce-002-c01",
        "zn-ce-002-c02",
        "zn-ce-002-c03",
        "zn-ce-002-c04",
        "zn-ce-002-c05"
      ],
      "tallas": [
        "XS",
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnicas documentadas: Bordado y vinil textil; se cotiza en bordado. Área, ubicación y acabado se confirman al cotizar.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 9.36,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 630,
          "y": 311,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 370,
          "y": 311,
          "max": 9
        }
      ],
      "renderOrientativo": true,
      "imagenIA": true,
      "disponibilidad": "Consulta disponibilidad por talla y color. Colores e imágenes ilustrativos; confirma tono y acabado al cotizar.",
      "tablaTallas": {
        "XS": {
          "ancho": 45.72,
          "largo": 60.96
        },
        "S": {
          "ancho": 50.8,
          "largo": 63.5
        },
        "M": {
          "ancho": 55.88,
          "largo": 66.04
        },
        "L": {
          "ancho": 60.96,
          "largo": 68.58
        },
        "XL": {
          "ancho": 66.04,
          "largo": 71.12
        },
        "2XL": {
          "ancho": 71.12,
          "largo": 73.66
        }
      },
      "tolerancia": {
        "ancho": 1.27,
        "largo": 1.27
      },
      "fotoModelo": "img/productos/zain/zn-ce-002-modelo.webp"
    }
  ],
  "promocionales": [
    "Termos",
    "Tazas",
    "Libretas",
    "Plumas",
    "Mandiles",
    "Chalecos",
    "Lanyards",
    "Paraguas"
  ],
  "preguntas": [
    {
      "p": "¿Cómo solicito una cotización?",
      "r": "Lo más rápido: escríbenos por WhatsApp con tu logo, la prenda y cuántas piezas necesitas. Si prefieres, arma aquí tu pedido con colores, técnica y tallas y envíalo desde la página. Te cotizamos según tu diseño y volumen, y confirmamos disponibilidad y fecha de entrega antes de producir."
    },
    {
      "p": "¿Cuál es el pedido mínimo?",
      "r": "Prendas: 12 piezas por pedido, y puedes mezclar modelos, tallas, colores y Caballero/Dama. En serigrafía conviene desde 50 piezas; para menos te recomendamos bordado o DTF. Bolsas: mínimo 100 piezas por modelo y color, en incrementos de 50: 100, 150, 200…"
    },
    {
      "p": "¿Cuánto cuesta?",
      "r": "Playeras desde $130, polos desde $165 y camisas desde $394 por pieza, con tu logo, en pedidos de 50 piezas o más, más IVA. El precio final depende del modelo, color, talla, técnica, tamaño del logo y cantidad; te lo confirmamos en la cotización."
    },
    {
      "p": "¿Hacen envíos?",
      "r": "Sí, enviamos a todo México. El costo y la paquetería dependen del destino y del tamaño del pedido; te los confirmamos en la cotización."
    },
    {
      "p": "¿Cuánto tarda mi pedido?",
      "r": "Normalmente de 7 a 12 días hábiles a partir de que apruebas el diseño y se confirma el anticipo. Si tienes fecha de evento, dínosla y la planeamos."
    },
    {
      "p": "¿Qué archivo de logo necesito?",
      "r": "Lo ideal es vector (AI, PDF, SVG o EPS). Si solo tienes una imagen (PNG o JPG), también sirve: nosotros la preparamos para bordado o impresión."
    },
    {
      "p": "¿El render es exactamente como quedará?",
      "r": "Es una vista previa para que decidas color, técnica y ubicación. Antes de producir te mandamos una prueba digital con medidas reales para que la apruebes."
    },
    {
      "p": "¿Puedo mezclar tallas y colores?",
      "r": "Sí. En cada producto indicas cuántas piezas quieres de cada talla, y puedes agregar el mismo producto en otro color como una línea más del pedido."
    },
    {
      "p": "¿Cómo pago?",
      "r": "Arma tu pedido en la página y envíalo por WhatsApp. Te compartimos una cotización personalizada; cuando la apruebes, coordinamos el anticipo y la producción. Facturamos."
    }
  ],
  "categoriasCatalogo": [
    "Playeras",
    "Polos",
    "Camisas",
    "Sudaderas",
    "Chalecos",
    "Chamarras",
    "Gorras",
    "Bolsas"
  ],
  "catalogoVersion": "originales-mas-yazbek-ia-2026-10-14",
  "catalogoYazbekPendiente": [],
  "productosHistoricos": [
    {
      "id": "playera",
      "nombre": "Playera cuello redondo",
      "categoria": "Playeras",
      "descripcion": "Algodón peinado 180 g. La base de todo uniforme y evento.",
      "foto": "img/productos/originales-limpios/playera-v2.webp",
      "colores": [
        "negro",
        "blanco",
        "marino",
        "rey",
        "gris",
        "oxford",
        "rojo",
        "vino",
        "botella",
        "arena"
      ],
      "tecnicas": [
        "serigrafia",
        "dtf",
        "bordado"
      ],
      "tallas": [
        "CH",
        "M",
        "G",
        "XG",
        "2XG"
      ],
      "pxPorCm": 10.4,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 640,
          "y": 300,
          "max": 10
        },
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 360,
          "max": 28
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 360,
          "y": 300,
          "max": 10
        }
      ],
      "fotoOriginal": "img/productos/playera.webp",
      "imagenLimpia": true,
      "sku": "ZN-PL-001",
      "idPublico": "playera",
      "activo": false
    },
    {
      "id": "polo",
      "nombre": "Polo piqué",
      "categoria": "Polos",
      "descripcion": "Piqué 220 g con cuello tejido. El uniforme de oficina por excelencia.",
      "foto": "img/productos/originales-limpios/polo-v2.webp",
      "colores": [
        "marino",
        "blanco",
        "negro",
        "rey",
        "gris",
        "rojo",
        "vino",
        "botella",
        "arena"
      ],
      "tecnicas": [
        "bordado",
        "dtf",
        "serigrafia"
      ],
      "tallas": [
        "CH",
        "M",
        "G",
        "XG",
        "2XG"
      ],
      "pxPorCm": 10,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 640,
          "y": 330,
          "max": 10
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 360,
          "y": 330,
          "max": 10
        },
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 420,
          "max": 24
        }
      ],
      "fotoOriginal": "img/productos/polo.webp",
      "imagenLimpia": true,
      "sku": "ZN-PO-001",
      "idPublico": "polo",
      "activo": false
    },
    {
      "id": "camisa",
      "nombre": "Camisa oxford",
      "categoria": "Camisas",
      "descripcion": "Manga larga, tela oxford. Para atención a clientes y fuerza de ventas.",
      "foto": "img/productos/originales-limpios/camisa-v2.webp",
      "colores": [
        "blanco",
        "marino",
        "rey",
        "gris",
        "negro",
        "arena"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tallas": [
        "CH",
        "M",
        "G",
        "XG",
        "2XG"
      ],
      "pxPorCm": 7.7,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 615,
          "y": 300,
          "max": 9
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 385,
          "y": 300,
          "max": 9
        }
      ],
      "fotoOriginal": "img/productos/camisa.webp",
      "imagenLimpia": true,
      "sku": "ZN-CM-001",
      "idPublico": "camisa",
      "activo": false
    },
    {
      "id": "chamarra",
      "nombre": "Chamarra softshell",
      "categoria": "Chamarras",
      "descripcion": "Cierre completo, rompevientos y repelente al agua. Para campo y temporada de frío.",
      "foto": "img/productos/originales-limpios/chamarra-v2.webp",
      "colores": [
        "negro",
        "marino",
        "oxford",
        "rojo",
        "botella",
        "olivo",
        "blanco"
      ],
      "tecnicas": [
        "bordado",
        "dtf"
      ],
      "tallas": [
        "CH",
        "M",
        "G",
        "XG",
        "2XG"
      ],
      "pxPorCm": 7.7,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 615,
          "y": 300,
          "max": 10
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 385,
          "y": 300,
          "max": 10
        }
      ],
      "fotoOriginal": "img/productos/chamarra.webp",
      "imagenLimpia": true,
      "sku": "ZN-CH-001",
      "idPublico": "chamarra",
      "activo": false
    },
    {
      "id": "sudadera",
      "nombre": "Sudadera con gorro",
      "categoria": "Sudaderas",
      "descripcion": "Felpa perchada 280 g con bolsa canguro. Merch que sí se usa.",
      "foto": "img/productos/originales-limpios/sudadera-v2.webp",
      "colores": [
        "gris",
        "negro",
        "oxford",
        "marino",
        "vino",
        "botella",
        "arena",
        "blanco"
      ],
      "tecnicas": [
        "serigrafia",
        "dtf",
        "bordado"
      ],
      "tallas": [
        "CH",
        "M",
        "G",
        "XG",
        "2XG"
      ],
      "pxPorCm": 7.7,
      "zonas": [
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 390,
          "max": 26
        },
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 610,
          "y": 320,
          "max": 10
        }
      ],
      "fotoOriginal": "img/productos/sudadera.webp",
      "imagenLimpia": true,
      "sku": "ZN-SU-001",
      "idPublico": "sudadera",
      "activo": false
    }
  ],
  "muestrasPortada": [
    {
      "p": "zn-po-008",
      "c": "zn-po-008-c04",
      "t": "bordado",
      "z": "pecho-izq",
      "cm": 8
    },
    {
      "p": "yazbek-c0300",
      "c": "yazbek-415",
      "t": "serigrafia",
      "z": "centro",
      "cm": 22
    },
    {
      "p": "zn-cm-014",
      "c": "zn-cm-014-c01",
      "t": "bordado",
      "z": "pecho-izq",
      "cm": 8
    },
    {
      "p": "zn-ce-001",
      "c": "zn-ce-001-c01",
      "t": "bordado",
      "z": "pecho-izq",
      "cm": 8
    },
    {
      "p": "zn-ch-002",
      "c": "zn-ch-002-c01",
      "t": "bordado",
      "z": "pecho-izq",
      "cm": 8
    },
    {
      "p": "zn-go-006",
      "c": "zn-go-006-c01",
      "t": "bordado",
      "z": "frente",
      "cm": 8
    },
    {
      "p": "bolsa-expo",
      "c": "bolsa-expo-rojo",
      "t": "serigrafia",
      "z": "frente",
      "cm": 15,
      "e": 0.9
    }
  ]
};
