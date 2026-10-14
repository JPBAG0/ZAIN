# Catálogo ZAIN — prendas Yazbek

## Decisión vigente: renders aprobados, contornos limpios y categorías — 14-oct-2026

Después de revisar la galería de pruebas, JP autorizó explícitamente publicar las 14 familias / 25 referencias de prendas IA y pidió limpiar los puntos/manchas en contornos de las prendas anteriores. Esta autorización posterior reemplaza la pausa por exigencia de réplica exacta. Las imágenes siguen siendo ilustrativas: no llamarlas fotografías oficiales o réplicas verificadas del fabricante.

Se conservan los seis productos originales y sus IDs, colores, tallas y técnicas; sus archivos de imagen originales se mantienen intactos. Se usan versiones nuevas con limpieza IA de recorte en `img/productos/originales-limpios/`, sin retirar productos. Los 25 modelos nuevos están en `img/productos/yazbek-ia/`. Fuentes, prompts y hashes en `docs/IMAGENES-YAZBEK-IA.json` y `docs/IMAGENES-ORIGINALES-LIMPIAS.json`. La limpieza fue realizada con `image_gen` integrada; no se sustituyó por dibujos SVG. El motor omite ruido casi transparente en esas imágenes y conserva pliegues al cambiar de color.

Catálogo: 44 referencias (6 originales + 25 nuevas + 13 bolsas); 20 fichas de prendas en la vista inicial y una entrada Bolsas. Categorías ordenadas: Playeras, Polos, Camisas, Sudaderas, Chamarras, Gorras y Bolsas. Caballero/dama dentro de una ficha donde corresponde; sudaderas Adultos. Las bolsas mantienen Expo como entrada, sus fotografías/datos y mínimo de 100 por modelo/color, incrementos de 50.

Verificación: 34 pruebas aprobadas; las 31 imágenes de prendas cargan y se tiñen en negro, blanco y rojo. Comparación visual antes/después confirma eliminación de puntos blancos de axilas/mangas, especialmente sudadera/chamarra. Filtros y variantes comprobados en móvil; sin desbordamiento. Prueba sintética de cinco polos D0550 Rojo 413 guardó el logo original y render, dio seguimiento y descargas 200, y vació el carrito. Ningún mensaje WhatsApp real: navegación interceptada. La solicitud está marcada NO COTIZAR; su cancelación administrativa quedó solicitada a JP porque el conector SQL falló y una limpieza temporal en Edge fue rechazada. No se cambió ningún pedido real.

API `zain-pedidos` versión 9 ACTIVE, sin código de limpieza temporal, permisos/RLS/Storage privado conservados. Catálogo `originales-mas-yazbek-ia-2026-10-14`. Publicación comprobada: GitHub `c4efec9` en la rama de producción `claude/zain-website-deploy-d85pzy`, Vercel success y URL pública `https://zain-amber-sigma.vercel.app/?v=c4efec9#catalogo`. Navegador público: 44 referencias, 21 tarjetas iniciales, 6 versiones corregidas y 25 imágenes IA nuevas; siete categorías. Móvil 390×844 y escritorio 1280×800 sin desbordamiento. Árbol Git limpio tras publicación. El registro posterior de esta comprobación solo modifica documentación.

Pendientes comerciales: stock/costos, técnica por tejido y aprobación de impresión; tonos de pantalla aproximados, sin equivalencias Pantone oficiales. Las categorías no expresan rankings de ventas o margen. Ads, privacidad, precios y presupuestos no cambiaron.

## Datos verificados del proveedor

| Familia | Referencias y siluetas | Colores publicados: código y nombre | Tallas | Página física PDF |
|---|---|---|---|---|
| Polo piqué manga corta | C0550 (Caballero) / D0550 (Dama) | 415 Negro; 414 Marino; 100 Blanco; 102 Gris Jaspe; 421 Royal; 413 Rojo; 420 Jade | C0550: CH–EEG / D0550: CH–EG | 20 |
| Camisa Oxford manga larga | C0605 (Caballero) / D0605 (Dama) | 700 Blanco; 701 Azul Cielo; 703 Gris; 704 Cobalto; 705 Rosa | C0605: CH–EEG / D0605: CH–EEG | 40 |
| Playera básica 155 g | C0200 (Caballero) / D0200 (Dama) | 415 Negro; 414 Marino; 100 Blanco; 102 Gris Jaspe; 421 Royal; 413 Rojo | C0200: CH–EEEG / D0200: CH–EEG | 6 |
| Playera peso completo 195 g | C0300 (Caballero) / D0300 (Dama) | 415 Negro; 414 Marino; 100 Blanco; 102 Gris Jaspe; 421 Royal; 413 Rojo; 420 Jade | C0300: CH–EEEG / D0300: CH–EG | 10, 11 |
| Camisa gabardina manga corta | C0606 (Caballero) / D0606 (Dama) | 415 Negro; 414 Marino; 100 Blanco; 200 Beige; 213 Azul Francia; 413 Rojo | C0606: CH–EEG / D0606: CH–EEG | 41 |
| Camisa gabardina manga larga | C0607 (Caballero) / D0607 (Dama) | 415 Negro; 414 Marino; 426 Gris; 100 Blanco; 200 Beige; 213 Azul Francia; 425 Vino; 413 Rojo | C0607: CH–EEG / D0607: CH–EEG | 42 |
| Camisa Oxford manga corta | C0604 (Caballero) / D0604 (Dama) | 700 Blanco; 701 Azul Cielo | C0604: CH–EEG / D0604: CH–EEG | 39 |
| Polo ActiviTee manga corta | C1502 (Caballero) / D1502 (Dama) | 415 Negro; 414 Marino; 426 Gris; 100 Blanco; 421 Royal; 413 Rojo | C1502: CH–EEG / D1502: CH–EG | 27 |
| Playera ActiviTee manga corta | C1302 (Caballero) / D1302 (Dama) | 415 Negro; 414 Marino; 426 Gris; 100 Blanco; 421 Royal; 413 Rojo | C1302: CH–EEG / D1302: CH–EG | 24 |
| Sudadera con capucha y cierre | C0702 (Adultos) | 415 Negro; 414 Marino; 102 Gris Jaspe; 2415 Negro Jaspe | C0702: CH–EEG | 31 |
| Camisa mezclilla manga larga | C0601 (Caballero) / D0601 (Dama) | 652 Índigo Claro | C0601: CH–EEG / D0601: CH–EEG | 36 |
| Sudadera con capucha y cangurera | C0701 (Adultos) | 415 Negro; 414 Marino; 102 Gris Jaspe; 230 Arena; 427 Verde Bosque | C0701: CH–EEG | 30 |
| Sudadera con ¼ de cierre | C0703 (Adultos) | 415 Negro; 414 Marino; 2415 Negro Jaspe | C0703: CH–EEG | 31 |
| Polo ActiviTee manga larga | C1504 (Caballero) / D1504 (Dama) | 415 Negro; 414 Marino; 100 Blanco | C1504: CH–EEG / D1504: CH–EG | 28 |

El PDF completo y las guías de tallas fueron revisados. Las imágenes IA son ilustrativas, no fotografías oficiales. La ficha usa códigos y combinaciones de color/talla verificadas.
