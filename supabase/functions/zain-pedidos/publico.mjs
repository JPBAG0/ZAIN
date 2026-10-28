export default {
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
  "instagram": "",
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
    "notaPaquetes": "Precio por kit (una persona). Incluye un logo por prenda de hasta 10 cm. Tallas S a XL; 2XL con cargo extra. Para entregar antes de tu posada, confirma la fecha al cotizar.",
    "paquetes": [
      {
        "id": "kit-posada",
        "nombre": "Kit Posada",
        "subtitulo": "Para que todos lleguen iguales",
        "estado": "aprobado",
        "destacado": false,
        "minimoPaquetes": 20,
        "piezasPorPaquete": 2,
        "impuesto": 1600,
        "contenido": [
          {
            "producto": "Playera de algodón",
            "sku": "ZN-PL-004",
            "cantidad": 1,
            "tecnica": "DTF",
            "ubicacion": "Frente"
          },
          {
            "producto": "Gorra 6 paneles",
            "sku": "ZN-GO-002",
            "cantidad": 1,
            "tecnica": "Bordado",
            "ubicacion": "Frente"
          }
        ],
        "escalones": [
          {
            "desde": 20,
            "hasta": 49,
            "precio": 22500
          },
          {
            "desde": 50,
            "hasta": 99,
            "precio": 21500
          },
          {
            "desde": 100,
            "hasta": 149,
            "precio": 20500
          },
          {
            "desde": 150,
            "hasta": null,
            "precio": 19900
          }
        ]
      },
      {
        "id": "kit-equipo",
        "nombre": "Kit Equipo",
        "subtitulo": "Uniforme que siguen usando todo el año",
        "estado": "aprobado",
        "destacado": true,
        "minimoPaquetes": 20,
        "piezasPorPaquete": 2,
        "impuesto": 1600,
        "contenido": [
          {
            "producto": "Polo corporativo",
            "sku": "ZN-PO-008",
            "cantidad": 1,
            "tecnica": "DTF",
            "ubicacion": "Frente"
          },
          {
            "producto": "Gorra 6 paneles",
            "sku": "ZN-GO-002",
            "cantidad": 1,
            "tecnica": "Bordado",
            "ubicacion": "Frente"
          }
        ],
        "escalones": [
          {
            "desde": 20,
            "hasta": 49,
            "precio": 35900
          },
          {
            "desde": 50,
            "hasta": 99,
            "precio": 33900
          },
          {
            "desde": 100,
            "hasta": 149,
            "precio": 32500
          },
          {
            "desde": 150,
            "hasta": null,
            "precio": 31500
          }
        ]
      },
      {
        "id": "kit-regalo",
        "nombre": "Kit Regalo",
        "subtitulo": "El detalle de fin de año para tu equipo",
        "estado": "aprobado",
        "destacado": false,
        "minimoPaquetes": 20,
        "piezasPorPaquete": 2,
        "impuesto": 1600,
        "contenido": [
          {
            "producto": "Chaleco acolchado",
            "sku": "ZN-CE-002",
            "cantidad": 1,
            "tecnica": "Bordado",
            "ubicacion": "Frente"
          },
          {
            "producto": "Gorra 6 paneles",
            "sku": "ZN-GO-002",
            "cantidad": 1,
            "tecnica": "Bordado",
            "ubicacion": "Frente"
          }
        ],
        "escalones": [
          {
            "desde": 20,
            "hasta": 49,
            "precio": 68900
          },
          {
            "desde": 50,
            "hasta": 99,
            "precio": 65500
          },
          {
            "desde": 100,
            "hasta": 149,
            "precio": 62900
          },
          {
            "desde": 150,
            "hasta": null,
            "precio": 60500
          }
        ]
      }
    ]
  },
  "mostrarTrabajos": false,
  "empresasClientes": [
    {
      "nombre": "DREA",
      "logo": "img/clientes/drea.webp"
    },
    {
      "nombre": "Microvet",
      "logo": "img/clientes/microvet.webp"
    },
    {
      "nombre": "Zürichtec Laboratorios",
      "logo": "img/clientes/zurichtec.webp"
    }
  ],
  "clientesSatisfechos": [
    {
      "id": "gorras-bordadas",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/gorras-bordadas.webp",
      "frase": "",
      "producto": "Gorras",
      "tecnica": "Bordado",
      "formato": "ancho"
    },
    {
      "id": "chalecos-bordados",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/chalecos-bordados.webp",
      "frase": "",
      "producto": "Chalecos",
      "tecnica": "Bordado"
    },
    {
      "id": "polos-escolares",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/polos-escolares.webp",
      "frase": "",
      "producto": "Polos escolares",
      "tecnica": "Bordado",
      "formato": "ancho"
    },
    {
      "id": "bolsas-serigrafia",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/bolsas-serigrafia.webp",
      "frase": "",
      "producto": "Bolsas ecológicas",
      "tecnica": "Serigrafía",
      "formato": "ancho"
    },
    {
      "id": "camisas-bordadas",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/camisas-bordadas.webp",
      "frase": "",
      "producto": "Camisas de vestir",
      "tecnica": "Bordado",
      "formato": "ancho"
    },
    {
      "id": "sudaderas-dtf",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/sudaderas-dtf.webp",
      "frase": "",
      "producto": "Sudaderas",
      "tecnica": "DTF"
    },
    {
      "id": "playera-dtf",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/playera-dtf.webp",
      "frase": "",
      "producto": "Playeras a todo color",
      "tecnica": "DTF"
    },
    {
      "id": "playeras-trabajo",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/playeras-trabajo.webp",
      "frase": "",
      "producto": "Playeras de trabajo",
      "tecnica": "Con cinta reflejante",
      "formato": "ancho"
    },
    {
      "id": "playeras-logo",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/playeras-logo.webp",
      "frase": "",
      "producto": "Playeras con logo",
      "tecnica": "DTF"
    },
    {
      "id": "jerseys",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/jerseys.webp",
      "frase": "",
      "producto": "Jerseys",
      "tecnica": "DTF"
    },
    {
      "id": "camisas-trabajo",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/camisas-trabajo.webp",
      "frase": "",
      "producto": "Camisas de trabajo",
      "tecnica": "Bordado"
    },
    {
      "id": "bolsas-tienda",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/bolsas-tienda.webp",
      "frase": "",
      "producto": "Bolsas para negocio",
      "tecnica": "Serigrafía"
    },
    {
      "id": "bolsa-logo",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/bolsa-logo.webp",
      "frase": "",
      "producto": "Bolsas con logo",
      "tecnica": "Serigrafía"
    },
    {
      "id": "bolsas-mayoreo",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/bolsas-mayoreo.webp",
      "frase": "",
      "producto": "Bolsas por mayoreo",
      "tecnica": "Serigrafía"
    },
    {
      "id": "bordado-maquina",
      "estado": "aprobado",
      "permisoPublicar": true,
      "permisoEmpresa": false,
      "permisoImagen": true,
      "empresa": "",
      "foto": "img/trabajos/bordado-maquina.webp",
      "frase": "",
      "producto": "Así bordamos tu logo",
      "tecnica": "Bordado",
      "formato": "ancho"
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
  "preciosLeyenda": "Por pieza con tu logo, en pedidos desde 50 piezas, más IVA.",
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
      "id": "zain-color-071",
      "nombre": "Negro",
      "hex": "#292829",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "64b8ff18"
    },
    {
      "id": "zain-color-072",
      "nombre": "Marino",
      "hex": "#242d3f",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "65b900ab"
    },
    {
      "id": "zain-color-073",
      "nombre": "Blanco",
      "hex": "#ebebeb",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "fd9972c5"
    },
    {
      "id": "zain-color-074",
      "nombre": "Gris Jaspe",
      "hex": "#c7c6c6",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "fb996f9f"
    },
    {
      "id": "zain-color-075",
      "nombre": "Royal",
      "hex": "#263c76",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "58b2306f"
    },
    {
      "id": "zain-color-076",
      "nombre": "Rojo",
      "hex": "#a82b27",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "6ab9088a"
    },
    {
      "id": "zain-color-077",
      "nombre": "Jade",
      "hex": "#296d46",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "57b22edc"
    },
    {
      "id": "zain-color-078",
      "nombre": "Gris",
      "hex": "#494949",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "55b22bb6"
    },
    {
      "id": "zain-color-079",
      "nombre": "Blanco",
      "hex": "#f0f0f1",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "e51f58c3"
    },
    {
      "id": "zain-color-080",
      "nombre": "Azul Cielo",
      "hex": "#b1c8da",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "e41f5730"
    },
    {
      "id": "zain-color-081",
      "nombre": "Gris",
      "hex": "#9fa1ae",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "e61f5a56"
    },
    {
      "id": "zain-color-082",
      "nombre": "Cobalto",
      "hex": "#7789bb",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "e91f5f0f"
    },
    {
      "id": "zain-color-083",
      "nombre": "Rosa",
      "hex": "#f0d0df",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "e81f5d7c"
    },
    {
      "id": "zain-color-084",
      "nombre": "Beige",
      "hex": "#aaa588",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "c1d3a504"
    },
    {
      "id": "zain-color-085",
      "nombre": "Azul Francia",
      "hex": "#3063a5",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "c4d5e854"
    },
    {
      "id": "zain-color-086",
      "nombre": "Vino",
      "hex": "#4c0f14",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "54b22a23"
    },
    {
      "id": "zain-color-087",
      "nombre": "Índigo Claro",
      "hex": "#425677",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "156ec9f"
    },
    {
      "id": "zain-color-088",
      "nombre": "Arena",
      "hex": "#eddab9",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "33db143f"
    },
    {
      "id": "zain-color-089",
      "nombre": "Verde Bosque",
      "hex": "#353a26",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "56b22d49"
    },
    {
      "id": "zain-color-090",
      "nombre": "Negro Jaspe",
      "hex": "#474c4f",
      "muestra": "Aproximación de muestra impresa del catálogo; no Pantone.",
      "compatHash": "21942bb2"
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
      "id": "zn-po-012-c01",
      "nombre": "Blanco",
      "hex": "#f6f6f4"
    },
    {
      "id": "zn-po-012-c02",
      "nombre": "Azul rey",
      "hex": "#244d9c"
    },
    {
      "id": "zn-po-012-c03",
      "nombre": "Azul marino",
      "hex": "#1f304e"
    },
    {
      "id": "zn-po-012-c04",
      "nombre": "Rojo",
      "hex": "#b91f2e"
    },
    {
      "id": "zn-po-012-c05",
      "nombre": "Gris Oxford",
      "hex": "#9ba5a6"
    },
    {
      "id": "zn-po-012-c06",
      "nombre": "Carbón",
      "hex": "#4b4f51"
    },
    {
      "id": "zn-po-012-c07",
      "nombre": "Negro",
      "hex": "#252527"
    },
    {
      "id": "zn-po-013-c01",
      "nombre": "Blanco",
      "hex": "#f6f6f4"
    },
    {
      "id": "zn-po-013-c02",
      "nombre": "Azul rey",
      "hex": "#244d9c"
    },
    {
      "id": "zn-po-013-c03",
      "nombre": "Azul marino",
      "hex": "#1f304e"
    },
    {
      "id": "zn-po-013-c04",
      "nombre": "Rojo",
      "hex": "#b91f2e"
    },
    {
      "id": "zn-po-013-c05",
      "nombre": "Gris Oxford",
      "hex": "#9ba5a6"
    },
    {
      "id": "zn-po-013-c06",
      "nombre": "Carbón",
      "hex": "#4b4f51"
    },
    {
      "id": "zn-po-013-c07",
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
    },
    {
      "id": "zn-cm-016-c01",
      "nombre": "Blanco",
      "hex": "#e9e9e5"
    },
    {
      "id": "zn-cm-016-c02",
      "nombre": "Natural",
      "hex": "#d6d3ca"
    },
    {
      "id": "zn-cm-016-c03",
      "nombre": "Beige",
      "hex": "#bab8a8"
    },
    {
      "id": "zn-cm-016-c04",
      "nombre": "Olivo",
      "hex": "#414c27"
    },
    {
      "id": "zn-cm-016-c05",
      "nombre": "Azul marino",
      "hex": "#192138"
    },
    {
      "id": "zn-cm-016-c06",
      "nombre": "Carbón",
      "hex": "#383b36"
    },
    {
      "id": "zn-cm-016-c07",
      "nombre": "Negro",
      "hex": "#171a18"
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
      "imagenLimpia": true,
      "sku": "ZN-GO-001",
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
      "piezasBulto": 500,
      "sku": "ZN-BO-001",
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
      "piezasBulto": 500,
      "sku": "ZN-BO-002",
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
      "piezasBulto": 500,
      "sku": "ZN-BO-003",
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
      "piezasBulto": 1000,
      "sku": "ZN-BO-004",
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
      "piezasBulto": 1000,
      "sku": "ZN-BO-005",
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
      "piezasBulto": 1000,
      "sku": "ZN-BO-006",
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
      "piezasBulto": 1000,
      "sku": "ZN-BO-007",
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
      "piezasBulto": 1000,
      "sku": "ZN-BO-008",
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
      "piezasBulto": 500,
      "aplicacionesNota": "También sublimable en beige y azul cielo; consulta esta opción al cotizar.",
      "sku": "ZN-BO-009",
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
      "piezasBulto": 500,
      "aplicacionesNota": "El catálogo indica que es sublimable en color beige; consulta esta opción al cotizar.",
      "sku": "ZN-BO-010",
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
      "piezasBulto": 1000,
      "sku": "ZN-BO-011",
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
      "piezasBulto": 500,
      "sku": "ZN-BO-012",
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
      "piezasBulto": 500,
      "sku": "ZN-BO-013",
      "activo": true
    },
    {
      "id": "zn-po-002",
      "nombre": "Polo clásico · Caballero",
      "nombreFamilia": "Polo clásico",
      "familia": "zain-familia-1",
      "silueta": "Caballero",
      "categoria": "Polos",
      "descripcion": "Uniformes de atención al público y equipos comerciales.",
      "gramaje": 225,
      "tejido": "Piqué",
      "composicion": "50% algodón / 50% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-po-002-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-073",
        "zain-color-074",
        "zain-color-075",
        "zain-color-076",
        "zain-color-077"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 48.3,
          "largo": 70.5
        },
        "M": {
          "ancho": 53.3,
          "largo": 73
        },
        "L": {
          "ancho": 58.4,
          "largo": 75.6
        },
        "XL": {
          "ancho": 63.5,
          "largo": 78.1
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-PO-002",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "9927f26d",
      "fotoModelo": "img/productos/zain/zn-po-002-modelo.webp"
    },
    {
      "id": "zn-po-003",
      "nombre": "Polo clásico · Dama",
      "nombreFamilia": "Polo clásico",
      "familia": "zain-familia-1",
      "silueta": "Dama",
      "categoria": "Polos",
      "descripcion": "Uniformes de atención al público y equipos comerciales.",
      "gramaje": 225,
      "tejido": "Piqué",
      "composicion": "50% algodón / 50% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-po-003-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-073",
        "zain-color-074",
        "zain-color-075",
        "zain-color-076",
        "zain-color-077"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 43.2,
          "largo": 64.1
        },
        "M": {
          "ancho": 47.6,
          "largo": 66.7
        },
        "L": {
          "ancho": 52.1,
          "largo": 69.2
        },
        "XL": {
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
      "imagenIA": true,
      "sku": "ZN-PO-003",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "ddccd478",
      "fotoModelo": "img/productos/zain/zn-po-003-modelo.webp"
    },
    {
      "id": "zn-cm-002",
      "nombre": "Camisa ejecutiva manga larga · Caballero",
      "nombreFamilia": "Camisa ejecutiva manga larga",
      "familia": "zain-familia-2",
      "silueta": "Caballero",
      "categoria": "Camisas",
      "descripcion": "Una opción de oficina y representación comercial.",
      "gramaje": 155,
      "tejido": "Oxford",
      "composicion": "75% algodón / 25% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-002-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-079",
        "zain-color-080",
        "zain-color-081",
        "zain-color-082",
        "zain-color-083"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 54.6,
          "largo": 76.2
        },
        "M": {
          "ancho": 57.2,
          "largo": 78.7
        },
        "L": {
          "ancho": 59.7,
          "largo": 82.6
        },
        "XL": {
          "ancho": 63.5,
          "largo": 85.1
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-CM-002",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "5b1efa1a",
      "fotoModelo": "img/productos/zain/zn-cm-002-modelo.webp"
    },
    {
      "id": "zn-cm-003",
      "nombre": "Camisa ejecutiva manga larga · Dama",
      "nombreFamilia": "Camisa ejecutiva manga larga",
      "familia": "zain-familia-2",
      "silueta": "Dama",
      "categoria": "Camisas",
      "descripcion": "Una opción de oficina y representación comercial.",
      "gramaje": 155,
      "tejido": "Oxford",
      "composicion": "75% algodón / 25% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-003-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-079",
        "zain-color-080",
        "zain-color-081",
        "zain-color-082",
        "zain-color-083"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 48.3,
          "largo": 63.5
        },
        "M": {
          "ancho": 50.8,
          "largo": 64.8
        },
        "L": {
          "ancho": 53.3,
          "largo": 66
        },
        "XL": {
          "ancho": 55.9,
          "largo": 67.3
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-CM-003",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "1d13014b",
      "fotoModelo": "img/productos/zain/zn-cm-003-modelo.webp"
    },
    {
      "id": "zn-pl-002",
      "nombre": "Playera esencial · Caballero",
      "nombreFamilia": "Playera esencial",
      "familia": "zain-familia-3",
      "silueta": "Caballero",
      "categoria": "Playeras",
      "descripcion": "Para eventos y promociones; tejido de menor gramaje.",
      "gramaje": 155,
      "tejido": "Chifón",
      "composicion": "100% algodón",
      "composicionColor": {
        "zain-color-074": "90% algodón / 10% poliéster"
      },
      "foto": "img/productos/zain/zn-pl-002-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-073",
        "zain-color-074",
        "zain-color-075",
        "zain-color-076"
      ],
      "tecnicas": [
        "serigrafia",
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 45.7,
          "largo": 70.5
        },
        "M": {
          "ancho": 50.8,
          "largo": 73
        },
        "L": {
          "ancho": 55.9,
          "largo": 75.6
        },
        "XL": {
          "ancho": 61,
          "largo": 78.1
        },
        "2XL": {
          "ancho": 66,
          "largo": 80.6
        },
        "3XL": {
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
          "max": 42,
          "orientativa": true
        }
      ],
      "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
      "imagenIA": true,
      "sku": "ZN-PL-002",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "936a756d",
      "fotoModelo": "img/productos/zain/zn-pl-002-modelo.webp"
    },
    {
      "id": "zn-pl-003",
      "nombre": "Playera esencial · Dama",
      "nombreFamilia": "Playera esencial",
      "familia": "zain-familia-3",
      "silueta": "Dama",
      "categoria": "Playeras",
      "descripcion": "Para eventos y promociones; tejido de menor gramaje.",
      "gramaje": 155,
      "tejido": "Chifón",
      "composicion": "100% algodón",
      "composicionColor": {
        "zain-color-074": "90% algodón / 10% poliéster"
      },
      "foto": "img/productos/zain/zn-pl-003-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-073",
        "zain-color-074",
        "zain-color-075",
        "zain-color-076"
      ],
      "tecnicas": [
        "serigrafia",
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 43.2,
          "largo": 63.5
        },
        "M": {
          "ancho": 45.7,
          "largo": 66
        },
        "L": {
          "ancho": 50.8,
          "largo": 68.6
        },
        "XL": {
          "ancho": 55.9,
          "largo": 71.1
        },
        "2XL": {
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
          "max": 42,
          "orientativa": true
        }
      ],
      "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
      "imagenIA": true,
      "sku": "ZN-PL-003",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "e38a5178",
      "fotoModelo": "img/productos/zain/zn-pl-003-modelo.webp"
    },
    {
      "id": "zn-pl-004",
      "nombre": "Playera premium · Caballero",
      "nombreFamilia": "Playera premium",
      "familia": "zain-familia-4",
      "silueta": "Caballero",
      "categoria": "Playeras",
      "descripcion": "Más gramaje que la básica para elegir según el uso de tu equipo.",
      "gramaje": 195,
      "tejido": "Chifón",
      "composicion": "100% algodón",
      "composicionColor": {
        "zain-color-074": "90% algodón / 10% poliéster"
      },
      "foto": "img/productos/zain/zn-pl-004-render-v2.webp",
      "versionRender": 2,
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-073",
        "zain-color-074",
        "zain-color-075",
        "zain-color-076",
        "zain-color-077"
      ],
      "tecnicas": [
        "serigrafia",
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL",
        "3XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 45.7,
          "largo": 70.5
        },
        "M": {
          "ancho": 50.8,
          "largo": 73
        },
        "L": {
          "ancho": 55.9,
          "largo": 75.6
        },
        "XL": {
          "ancho": 61,
          "largo": 78.1
        },
        "2XL": {
          "ancho": 66,
          "largo": 80.6
        },
        "3XL": {
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
          "max": 42,
          "orientativa": true
        }
      ],
      "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
      "imagenIA": true,
      "sku": "ZN-PL-004",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "14d30f42",
      "fotoModelo": "img/productos/zain/zn-pl-004-modelo.webp"
    },
    {
      "id": "zn-pl-005",
      "nombre": "Playera premium · Dama",
      "nombreFamilia": "Playera premium",
      "familia": "zain-familia-4",
      "silueta": "Dama",
      "categoria": "Playeras",
      "descripcion": "Más gramaje que la básica para elegir según el uso de tu equipo.",
      "gramaje": 195,
      "tejido": "Chifón",
      "composicion": "100% algodón",
      "composicionColor": {
        "zain-color-074": "90% algodón / 10% poliéster"
      },
      "foto": "img/productos/zain/zn-pl-005-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-073",
        "zain-color-074",
        "zain-color-075",
        "zain-color-076",
        "zain-color-077"
      ],
      "tecnicas": [
        "serigrafia",
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 41.3,
          "largo": 59.7
        },
        "M": {
          "ancho": 43.8,
          "largo": 62.2
        },
        "L": {
          "ancho": 48.9,
          "largo": 64.8
        },
        "XL": {
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
          "max": 42,
          "orientativa": true
        }
      ],
      "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
      "imagenIA": true,
      "sku": "ZN-PL-005",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "435eb9c3",
      "fotoModelo": "img/productos/zain/zn-pl-005-modelo.webp"
    },
    {
      "id": "zn-cm-004",
      "nombre": "Camisa de trabajo manga corta · Caballero",
      "nombreFamilia": "Camisa de trabajo manga corta",
      "familia": "zain-familia-5",
      "silueta": "Caballero",
      "categoria": "Camisas",
      "descripcion": "Para comercios y personal operativo; versión de manga corta.",
      "gramaje": 160,
      "tejido": "Gabardina",
      "composicion": "50% algodón / 50% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-004-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-073",
        "zain-color-084",
        "zain-color-085",
        "zain-color-076"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 54.6,
          "largo": 76.2
        },
        "M": {
          "ancho": 57.2,
          "largo": 78.7
        },
        "L": {
          "ancho": 59.7,
          "largo": 82.6
        },
        "XL": {
          "ancho": 63.5,
          "largo": 85.1
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-CM-004",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "5a1ef887",
      "fotoModelo": "img/productos/zain/zn-cm-004-modelo.webp"
    },
    {
      "id": "zn-cm-005",
      "nombre": "Camisa de trabajo manga corta · Dama",
      "nombreFamilia": "Camisa de trabajo manga corta",
      "familia": "zain-familia-5",
      "silueta": "Dama",
      "categoria": "Camisas",
      "descripcion": "Para comercios y personal operativo; versión de manga corta.",
      "gramaje": 160,
      "tejido": "Gabardina",
      "composicion": "50% algodón / 50% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-005-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-073",
        "zain-color-084",
        "zain-color-085",
        "zain-color-076"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 48.3,
          "largo": 63.5
        },
        "M": {
          "ancho": 50.8,
          "largo": 64.8
        },
        "L": {
          "ancho": 53.3,
          "largo": 66
        },
        "XL": {
          "ancho": 55.9,
          "largo": 67.3
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-CM-005",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "1e1302de",
      "fotoModelo": "img/productos/zain/zn-cm-005-modelo.webp"
    },
    {
      "id": "zn-cm-006",
      "nombre": "Camisa de trabajo manga larga · Caballero",
      "nombreFamilia": "Camisa de trabajo manga larga",
      "familia": "zain-familia-6",
      "silueta": "Caballero",
      "categoria": "Camisas",
      "descripcion": "Alternativa de manga larga para operaciones y supervisión.",
      "gramaje": 160,
      "tejido": "Gabardina",
      "composicion": "50% algodón / 50% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-006-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-078",
        "zain-color-073",
        "zain-color-084",
        "zain-color-085",
        "zain-color-086",
        "zain-color-076"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 54.6,
          "largo": 76.2
        },
        "M": {
          "ancho": 57.2,
          "largo": 78.7
        },
        "L": {
          "ancho": 59.7,
          "largo": 82.6
        },
        "XL": {
          "ancho": 63.5,
          "largo": 85.1
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-CM-006",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "591ef6f4",
      "fotoModelo": "img/productos/zain/zn-cm-006-modelo.webp"
    },
    {
      "id": "zn-cm-007",
      "nombre": "Camisa de trabajo manga larga · Dama",
      "nombreFamilia": "Camisa de trabajo manga larga",
      "familia": "zain-familia-6",
      "silueta": "Dama",
      "categoria": "Camisas",
      "descripcion": "Alternativa de manga larga para operaciones y supervisión.",
      "gramaje": 160,
      "tejido": "Gabardina",
      "composicion": "50% algodón / 50% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-007-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-078",
        "zain-color-073",
        "zain-color-084",
        "zain-color-085",
        "zain-color-086",
        "zain-color-076"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 48.3,
          "largo": 63.5
        },
        "M": {
          "ancho": 50.8,
          "largo": 64.8
        },
        "L": {
          "ancho": 53.3,
          "largo": 66
        },
        "XL": {
          "ancho": 55.9,
          "largo": 67.3
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-CM-007",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "1f130471",
      "fotoModelo": "img/productos/zain/zn-cm-007-modelo.webp"
    },
    {
      "id": "zn-cm-008",
      "nombre": "Camisa ejecutiva manga corta · Caballero",
      "nombreFamilia": "Camisa ejecutiva manga corta",
      "familia": "zain-familia-7",
      "silueta": "Caballero",
      "categoria": "Camisas",
      "descripcion": "Para oficina y atención al público con manga corta.",
      "gramaje": 155,
      "tejido": "Oxford",
      "composicion": "75% algodón / 25% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-008-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-079",
        "zain-color-080"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 54.6,
          "largo": 76.2
        },
        "M": {
          "ancho": 57.2,
          "largo": 78.7
        },
        "L": {
          "ancho": 59.7,
          "largo": 82.6
        },
        "XL": {
          "ancho": 63.5,
          "largo": 85.1
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-CM-008",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "5c1efbad",
      "fotoModelo": "img/productos/zain/zn-cm-008-modelo.webp"
    },
    {
      "id": "zn-cm-009",
      "nombre": "Camisa ejecutiva manga corta · Dama",
      "nombreFamilia": "Camisa ejecutiva manga corta",
      "familia": "zain-familia-7",
      "silueta": "Dama",
      "categoria": "Camisas",
      "descripcion": "Para oficina y atención al público con manga corta.",
      "gramaje": 155,
      "tejido": "Oxford",
      "composicion": "75% algodón / 25% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-009-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-079",
        "zain-color-080"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 48.3,
          "largo": 63.5
        },
        "M": {
          "ancho": 50.8,
          "largo": 64.8
        },
        "L": {
          "ancho": 53.3,
          "largo": 66
        },
        "XL": {
          "ancho": 55.9,
          "largo": 67.3
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-CM-009",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "1c12ffb8",
      "fotoModelo": "img/productos/zain/zn-cm-009-modelo.webp"
    },
    {
      "id": "zn-po-004",
      "nombre": "Polo ligero · Caballero",
      "nombreFamilia": "Polo ligero",
      "familia": "zain-familia-8",
      "silueta": "Caballero",
      "categoria": "Polos",
      "descripcion": "Tejido ligero para equipos con trabajo activo.",
      "gramaje": 150,
      "tejido": "Mesh",
      "composicion": "100% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-po-004-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-078",
        "zain-color-073",
        "zain-color-075",
        "zain-color-076"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 48.3,
          "largo": 70.5
        },
        "M": {
          "ancho": 53.3,
          "largo": 73
        },
        "L": {
          "ancho": 58.4,
          "largo": 75.6
        },
        "XL": {
          "ancho": 63.5,
          "largo": 78.1
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-PO-004",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "3b176c77",
      "fotoModelo": "img/productos/zain/zn-po-004-modelo.webp"
    },
    {
      "id": "zn-po-005",
      "nombre": "Polo ligero · Dama",
      "nombreFamilia": "Polo ligero",
      "familia": "zain-familia-8",
      "silueta": "Dama",
      "categoria": "Polos",
      "descripcion": "Tejido ligero para equipos con trabajo activo.",
      "gramaje": 150,
      "tejido": "Mesh",
      "composicion": "100% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-po-005-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-078",
        "zain-color-073",
        "zain-color-075",
        "zain-color-076"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 43.2,
          "largo": 64.1
        },
        "M": {
          "ancho": 47.6,
          "largo": 66.7
        },
        "L": {
          "ancho": 52.1,
          "largo": 69.2
        },
        "XL": {
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
      "imagenIA": true,
      "sku": "ZN-PO-005",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "bd19c56e",
      "fotoModelo": "img/productos/zain/zn-po-005-modelo.webp"
    },
    {
      "id": "zn-pl-006",
      "nombre": "Playera deportiva · Caballero",
      "nombreFamilia": "Playera deportiva",
      "familia": "zain-familia-9",
      "silueta": "Caballero",
      "categoria": "Playeras",
      "descripcion": "Una alternativa ligera de poliéster para eventos y equipos.",
      "gramaje": 150,
      "tejido": "Mesh",
      "composicion": "100% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-pl-006-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-078",
        "zain-color-073",
        "zain-color-075",
        "zain-color-076"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 45.7,
          "largo": 68.6
        },
        "M": {
          "ancho": 50.8,
          "largo": 71.1
        },
        "L": {
          "ancho": 55.9,
          "largo": 73.7
        },
        "XL": {
          "ancho": 61,
          "largo": 76.2
        },
        "2XL": {
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
          "max": 42,
          "orientativa": true
        }
      ],
      "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
      "imagenIA": true,
      "sku": "ZN-PL-006",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "25602441",
      "fotoModelo": "img/productos/zain/zn-pl-006-modelo.webp"
    },
    {
      "id": "zn-pl-007",
      "nombre": "Playera deportiva · Dama",
      "nombreFamilia": "Playera deportiva",
      "familia": "zain-familia-9",
      "silueta": "Dama",
      "categoria": "Playeras",
      "descripcion": "Una alternativa ligera de poliéster para eventos y equipos.",
      "gramaje": 150,
      "tejido": "Mesh",
      "composicion": "100% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-pl-007-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-078",
        "zain-color-073",
        "zain-color-075",
        "zain-color-076"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 42.5,
          "largo": 61
        },
        "M": {
          "ancho": 46.4,
          "largo": 63.5
        },
        "L": {
          "ancho": 50.2,
          "largo": 66
        },
        "XL": {
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
          "max": 42,
          "orientativa": true
        }
      ],
      "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
      "imagenIA": true,
      "sku": "ZN-PL-007",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "d193d924",
      "fotoModelo": "img/productos/zain/zn-pl-007-modelo.webp"
    },
    {
      "id": "zn-su-002",
      "nombre": "Sudadera con cierre · Adultos",
      "nombreFamilia": "Sudadera con cierre",
      "familia": "zain-familia-10",
      "silueta": "Adultos",
      "categoria": "Sudaderas",
      "descripcion": "Capucha, cangurera y cierre completo para uniforme casual.",
      "gramaje": 275,
      "tejido": "Felpa",
      "composicion": "50% algodón / 50% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-su-002-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-074",
        "zain-color-090"
      ],
      "tecnicas": [
        "bordado",
        "serigrafia"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 49.5,
          "largo": 68.6
        },
        "M": {
          "ancho": 54.6,
          "largo": 71.1
        },
        "L": {
          "ancho": 59.7,
          "largo": 73.7
        },
        "XL": {
          "ancho": 64.8,
          "largo": 76.2
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-SU-002",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "d7878c10",
      "fotoModelo": "img/productos/zain/zn-su-002-modelo.webp"
    },
    {
      "id": "zn-cm-010",
      "nombre": "Camisa denim · Caballero",
      "nombreFamilia": "Camisa denim",
      "familia": "zain-familia-11",
      "silueta": "Caballero",
      "categoria": "Camisas",
      "descripcion": "Para equipos que buscan una presentación casual.",
      "gramaje": 255,
      "tejido": "Mezclilla",
      "composicion": "100% algodón",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-010-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-087"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 54.6,
          "largo": 76.2
        },
        "M": {
          "ancho": 57.2,
          "largo": 78.7
        },
        "L": {
          "ancho": 59.7,
          "largo": 82.6
        },
        "XL": {
          "ancho": 63.5,
          "largo": 85.1
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-CM-010",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "571ef3ce",
      "fotoModelo": "img/productos/zain/zn-cm-010-modelo.webp"
    },
    {
      "id": "zn-cm-011",
      "nombre": "Camisa denim · Dama",
      "nombreFamilia": "Camisa denim",
      "familia": "zain-familia-11",
      "silueta": "Dama",
      "categoria": "Camisas",
      "descripcion": "Para equipos que buscan una presentación casual.",
      "gramaje": 255,
      "tejido": "Mezclilla",
      "composicion": "100% algodón",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-cm-011-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-087"
      ],
      "tecnicas": [
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 48.3,
          "largo": 63.5
        },
        "M": {
          "ancho": 50.8,
          "largo": 64.8
        },
        "L": {
          "ancho": 53.3,
          "largo": 66
        },
        "XL": {
          "ancho": 55.9,
          "largo": 67.3
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-CM-011",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "21130797",
      "fotoModelo": "img/productos/zain/zn-cm-011-modelo.webp"
    },
    {
      "id": "zn-su-003",
      "nombre": "Sudadera canguro · Adultos",
      "nombreFamilia": "Sudadera canguro",
      "familia": "zain-familia-12",
      "silueta": "Adultos",
      "categoria": "Sudaderas",
      "descripcion": "Una opción casual para equipos y artículos de marca.",
      "gramaje": 275,
      "tejido": "Felpa",
      "composicion": "50% algodón / 50% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-su-003-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-074",
        "zain-color-088",
        "zain-color-089"
      ],
      "tecnicas": [
        "serigrafia",
        "bordado"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 50.8,
          "largo": 68.6
        },
        "M": {
          "ancho": 55.9,
          "largo": 71.1
        },
        "L": {
          "ancho": 61,
          "largo": 73.7
        },
        "XL": {
          "ancho": 66,
          "largo": 76.2
        },
        "2XL": {
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
          "max": 42,
          "orientativa": true
        }
      ],
      "disponibilidad": "Consulta disponibilidad por modelo, color y talla.",
      "imagenIA": true,
      "sku": "ZN-SU-003",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "da8790c9",
      "fotoModelo": "img/productos/zain/zn-su-003-modelo.webp"
    },
    {
      "id": "zn-su-004",
      "nombre": "Sudadera cuello alto · Adultos",
      "nombreFamilia": "Sudadera cuello alto",
      "familia": "zain-familia-13",
      "silueta": "Adultos",
      "categoria": "Sudaderas",
      "descripcion": "Cuello y cierre corto; alternativa sin capucha.",
      "gramaje": 275,
      "tejido": "Felpa",
      "composicion": "50% algodón / 50% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-su-004-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-090"
      ],
      "tecnicas": [
        "bordado",
        "serigrafia"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 50.8,
          "largo": 71.8
        },
        "M": {
          "ancho": 55.9,
          "largo": 74.3
        },
        "L": {
          "ancho": 61,
          "largo": 76.8
        },
        "XL": {
          "ancho": 66,
          "largo": 79.4
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-SU-004",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "d8878da3",
      "fotoModelo": "img/productos/zain/zn-su-004-modelo.webp"
    },
    {
      "id": "zn-po-006",
      "nombre": "Polo ligero manga larga · Caballero",
      "nombreFamilia": "Polo ligero manga larga",
      "familia": "zain-familia-14",
      "silueta": "Caballero",
      "categoria": "Polos",
      "descripcion": "Complemento de manga larga para uniformes ligeros.",
      "gramaje": 150,
      "tejido": "Mesh",
      "composicion": "100% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-po-006-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-073"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 48.3,
          "largo": 70.5
        },
        "M": {
          "ancho": 53.3,
          "largo": 73
        },
        "L": {
          "ancho": 58.4,
          "largo": 75.6
        },
        "XL": {
          "ancho": 63.5,
          "largo": 78.1
        },
        "2XL": {
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
      "imagenIA": true,
      "sku": "ZN-PO-006",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "39176951",
      "fotoModelo": "img/productos/zain/zn-po-006-modelo.webp"
    },
    {
      "id": "zn-po-007",
      "nombre": "Polo ligero manga larga · Dama",
      "nombreFamilia": "Polo ligero manga larga",
      "familia": "zain-familia-14",
      "silueta": "Dama",
      "categoria": "Polos",
      "descripcion": "Complemento de manga larga para uniformes ligeros.",
      "gramaje": 150,
      "tejido": "Mesh",
      "composicion": "100% poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-po-007-render.webp",
      "renderOrientativo": true,
      "colores": [
        "zain-color-071",
        "zain-color-072",
        "zain-color-073"
      ],
      "tecnicas": [
        "serigrafia"
      ],
      "tecnicasNota": "Técnica y acabado sujetos a revisión del logo y del tejido. DTF por confirmar: solicítalo en notas.",
      "tallas": [
        "S",
        "M",
        "L",
        "XL"
      ],
      "tablaTallas": {
        "S": {
          "ancho": 43.2,
          "largo": 64.1
        },
        "M": {
          "ancho": 47.6,
          "largo": 66.7
        },
        "L": {
          "ancho": 52.1,
          "largo": 69.2
        },
        "XL": {
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
      "imagenIA": true,
      "sku": "ZN-PO-007",
      "activo": true,
      "prendaCatalogo": true,
      "compatHash": "bf19c894",
      "fotoModelo": "img/productos/zain/zn-po-007-modelo.webp"
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
    "Gorras",
    "Bolsas"
  ],
  "catalogoVersion": "zain-catalogo-empresarial-2026-10-15",
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
        "S",
        "M",
        "L",
        "XL",
        "2XL"
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
          "max": 32.5
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 360,
          "y": 300,
          "max": 10
        }
      ],
      "imagenLimpia": true,
      "sku": "ZN-PL-001",
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
        "S",
        "M",
        "L",
        "XL",
        "2XL"
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
      "imagenLimpia": true,
      "sku": "ZN-PO-001",
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
        "S",
        "M",
        "L",
        "XL",
        "2XL"
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
      "imagenLimpia": true,
      "sku": "ZN-CM-001",
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
        "S",
        "M",
        "L",
        "XL",
        "2XL"
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
      "imagenLimpia": true,
      "sku": "ZN-CH-001",
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
        "S",
        "M",
        "L",
        "XL",
        "2XL"
      ],
      "pxPorCm": 7.7,
      "zonas": [
        {
          "id": "centro",
          "nombre": "Centro del pecho",
          "x": 500,
          "y": 390,
          "max": 32.5
        },
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 610,
          "y": 320,
          "max": 10
        }
      ],
      "imagenLimpia": true,
      "sku": "ZN-SU-001",
      "activo": false
    },
    {
      "id": "zn-po-008",
      "sku": "ZN-PO-008",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Polo corporativo · Caballero",
      "nombreFamilia": "Polo corporativo",
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
      "sku": "ZN-PO-009",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Polo corporativo · Dama",
      "nombreFamilia": "Polo corporativo",
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
      "sku": "ZN-PO-010",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Polo de piqué deportivo · Caballero",
      "nombreFamilia": "Polo de piqué deportivo",
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
      "sku": "ZN-PO-011",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Polo de piqué deportivo · Dama",
      "nombreFamilia": "Polo de piqué deportivo",
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
      "id": "zn-po-012",
      "sku": "ZN-PO-012",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Polo de piqué deportivo manga larga · Caballero",
      "nombreFamilia": "Polo de piqué deportivo manga larga",
      "familia": "zain-2026-polo-deportivo-ml",
      "categoria": "Polos",
      "silueta": "Caballero",
      "descripcion": "Polo de manga larga en piqué de poliéster, con corte recto y puño tejido.",
      "especificaciones": "Cerrado de costados. Triple pespunte en bajos y hombros. Cuello y puños tejidos. Tapacostura a contraste. Presillas a contraste. 3 Botones al tono de la tela.",
      "tejido": "Piqué",
      "composicion": "100% Poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-po-012-render.webp",
      "colores": [
        "zn-po-012-c01",
        "zn-po-012-c02",
        "zn-po-012-c03",
        "zn-po-012-c04",
        "zn-po-012-c05",
        "zn-po-012-c06",
        "zn-po-012-c07"
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
      }
    },
    {
      "id": "zn-po-013",
      "sku": "ZN-PO-013",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Polo de piqué deportivo manga larga · Dama",
      "nombreFamilia": "Polo de piqué deportivo manga larga",
      "familia": "zain-2026-polo-deportivo-ml",
      "categoria": "Polos",
      "silueta": "Dama",
      "descripcion": "Polo de manga larga en piqué de poliéster, con corte silueteado y puño tejido.",
      "especificaciones": "Cerrado de costados. Triple pespunte en bajos y hombros. Cuello y puños tejidos. Tapacostura a contraste. Presillas a contraste. 4 Botones al tono de la tela.",
      "tejido": "Piqué",
      "composicion": "100% Poliéster",
      "composicionColor": {},
      "foto": "img/productos/zain/zn-po-013-render.webp",
      "colores": [
        "zn-po-013-c01",
        "zn-po-013-c02",
        "zn-po-013-c03",
        "zn-po-013-c04",
        "zn-po-013-c05",
        "zn-po-013-c06",
        "zn-po-013-c07"
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
      }
    },
    {
      "id": "zn-pl-008",
      "sku": "ZN-PL-008",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Playera deportiva de malla · Caballero",
      "nombreFamilia": "Playera deportiva de malla",
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
          "max": 32.5
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
      "sku": "ZN-PL-009",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Playera deportiva de malla · Dama",
      "nombreFamilia": "Playera deportiva de malla",
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
          "max": 32.5
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
      "sku": "ZN-CM-012",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Camisa Oxford manga corta · Caballero",
      "nombreFamilia": "Camisa Oxford manga corta",
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
      "sku": "ZN-CM-013",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Camisa Oxford manga corta · Dama",
      "nombreFamilia": "Camisa Oxford manga corta",
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
      "sku": "ZN-CM-014",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Camisa Oxford manga larga · Caballero",
      "nombreFamilia": "Camisa Oxford manga larga",
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
      "sku": "ZN-CM-015",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Camisa Oxford manga larga · Dama",
      "nombreFamilia": "Camisa Oxford manga larga",
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
      "sku": "ZN-CE-001",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Chaleco softshell · Unisex",
      "nombreFamilia": "Chaleco softshell",
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
          "ancho": 48,
          "largo": 65
        },
        "S": {
          "ancho": 53,
          "largo": 67
        },
        "M": {
          "ancho": 56,
          "largo": 70
        },
        "L": {
          "ancho": 58,
          "largo": 72
        },
        "XL": {
          "ancho": 61,
          "largo": 75
        },
        "2XL": {
          "ancho": 64,
          "largo": 77
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
      "sku": "ZN-CH-002",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Chamarra de oficina · Unisex",
      "nombreFamilia": "Chamarra de oficina",
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
      "sku": "ZN-CH-003",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Rompevientos con capucha · Unisex",
      "nombreFamilia": "Rompevientos con capucha",
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
      "sku": "ZN-GO-002",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Gorra clásica 6 paneles",
      "nombreFamilia": "Gorra clásica 6 paneles",
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
      "sku": "ZN-GO-003",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Gorra estructurada",
      "nombreFamilia": "Gorra estructurada",
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
      "sku": "ZN-GO-004",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Gorra trucker con visera de gamuza",
      "nombreFamilia": "Gorra trucker con visera de gamuza",
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
      "sku": "ZN-GO-005",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Gorra suave de algodón",
      "nombreFamilia": "Gorra suave de algodón",
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
      "sku": "ZN-GO-006",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Gorra trucker de algodón",
      "nombreFamilia": "Gorra trucker de algodón",
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
      "sku": "ZN-GO-007",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Gorra deportiva",
      "nombreFamilia": "Gorra deportiva",
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
      "sku": "ZN-CE-002",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Chaleco acolchado · Unisex",
      "nombreFamilia": "Chaleco acolchado",
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
    },
    {
      "id": "zn-cm-016",
      "sku": "ZN-CM-016",
      "catalogo2026": true,
      "prendaCatalogo": true,
      "activo": false,
      "nombre": "Camisa utilitaria manga larga · Unisex",
      "nombreFamilia": "Camisa utilitaria manga larga",
      "familia": "zain-camisa-utilitaria",
      "categoria": "Camisas",
      "silueta": "Unisex",
      "descripcion": "Camisa ligera y elástica de manga larga, con ventilación trasera y bolsillos funcionales. Mangas enrollables con broche.",
      "especificaciones": "Ventilación trasera y bolsillos con malla. Broches frontales. Mangas enrollables con broche. Bolsillo frontal con cierre y bolsillo frontal con velcro. Corte recto. Protección UPF 50+ declarada por el fabricante.",
      "tejido": "Poliéster con elastano",
      "composicion": "86% poliéster / 14% elastano.",
      "composicionColor": {},
      "gramaje": 140,
      "foto": "img/productos/zain/zn-cm-016-c01.webp",
      "fotosColor": {
        "zn-cm-016-c01": "img/productos/zain/zn-cm-016-c01.webp",
        "zn-cm-016-c02": "img/productos/zain/zn-cm-016-c02.webp",
        "zn-cm-016-c03": "img/productos/zain/zn-cm-016-c03.webp",
        "zn-cm-016-c04": "img/productos/zain/zn-cm-016-c04.webp",
        "zn-cm-016-c05": "img/productos/zain/zn-cm-016-c05.webp",
        "zn-cm-016-c06": "img/productos/zain/zn-cm-016-c06.webp",
        "zn-cm-016-c07": "img/productos/zain/zn-cm-016-c07.webp"
      },
      "colores": [
        "zn-cm-016-c01",
        "zn-cm-016-c02",
        "zn-cm-016-c03",
        "zn-cm-016-c04",
        "zn-cm-016-c05",
        "zn-cm-016-c06",
        "zn-cm-016-c07"
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
      "tecnicasNota": "Bordado disponible para cotización. La ficha también menciona vinil textil; otras aplicaciones requieren confirmación. Acabado y ubicación se revisan antes de producir.",
      "minimoPiezas": 1,
      "pasoPiezas": 1,
      "pxPorCm": 7,
      "zonas": [
        {
          "id": "pecho-izq",
          "nombre": "Pecho izquierdo",
          "x": 595,
          "y": 310,
          "max": 9,
          "maxAlto": 4,
          "orientativa": true
        },
        {
          "id": "pecho-der",
          "nombre": "Pecho derecho",
          "x": 410,
          "y": 310,
          "max": 9,
          "maxAlto": 4,
          "orientativa": true
        }
      ],
      "renderOrientativo": true,
      "imagenIA": false,
      "detalleMedidas": "Tallas XS a 2XL. Medidas exactas de la prenda y área de bordado por confirmar.",
      "disponibilidad": "Consulta disponibilidad por talla y color. Fotografías del modelo; el tono de pantalla puede variar. Tamaño, ubicación del logo y acabado se confirman al cotizar."
    }
  ],
  "muestrasPortada": [
    {
      "p": "zn-pl-004",
      "c": "zain-color-071",
      "t": "serigrafia",
      "z": "centro",
      "cm": 22
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
