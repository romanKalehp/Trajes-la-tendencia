# Trajes La Tendencia Â· Tienda en lÃ­nea

Sitio web completo para **Trajes La Tendencia**, tienda de trajes, blusas y cortes tÃ­picos de Guatemala.

Incluye tienda pÃºblica, carrito, checkout, pedido por WhatsApp y un **panel de administraciÃ³n con clave** para manejar el catÃ¡logo, subir fotos y revisar los pedidos hechos desde ese mismo dispositivo.

> Los productos, precios, textos, testimonios e imÃ¡genes de esta entrega son **de ejemplo**, listos para reemplazarse con la informaciÃ³n real del negocio. Las ilustraciones son SVG locales, sin depender de bancos de imÃ¡genes.

## Lo que incluye

- Escaparate con hero, categorÃ­as, destacados, historia, mayoreo, galerÃ­a, testimonios, visita y boletÃ­n.
- CatÃ¡logo filtrable por **Trajes**, **Blusas** y **Cortes tÃ­picos**, con bÃºsqueda, orden y fichas de producto.
- Carrito persistente y checkout de 4 pasos con envÃ­o local/nacional, retiro y contra entrega.
- NotificaciÃ³n instantÃ¡nea al WhatsApp del taller con el pedido completo.
- Panel privado con resumen, productos, subida de fotos, pedidos y ajustes.
- ExportaciÃ³n de `data.js` con las fotos incluidas para publicar sin servicios externos.
- DiseÃ±o responsive y accesible (Lighthouse 100 en accesibilidad, buenas prÃ¡cticas y SEO).

---

## Accesos rÃ¡pidos

| QuÃ© | DÃ³nde |
|---|---|
| Tienda en Internet | https://trajes-la-tendencia.pages.dev |
| Panel en Internet | https://trajes-la-tendencia.pages.dev/admin.html |
| Tienda local | `http://localhost:5178/` |
| Panel local | `http://localhost:5178/admin.html` |
| Clave del panel | privada (no se publica en el sitio) |
| WhatsApp del taller | `50245186290` (visible: 4518 6290) |
| Respaldo en Vercel | https://trajes-la-tendencia-trajes-la-tende.vercel.app/ |
| Facebook | https://www.facebook.com/trajes.la.tendencia |

La clave del panel es privada: no estÃ¡ escrita en el sitio, solo su huella cifrada. Puedes cambiarla en **Ajustes â†’ Seguridad**.

**Infraestructura:** Cloudflare Pages (hosting), Supabase (catÃ¡logo en la nube) y GitHub (cÃ³digo). Un Worker llamado `lt-keepalive` hace una lectura a Supabase cada 3 dÃ­as para que el plan gratis no se pause. Todo el stack es gratuito y permite uso comercial; el Ãºnico gasto es el dominio.

---

## 1. Ver el sitio en tu computadora

El proyecto no necesita Node, PHP ni base de datos. Solo abre una terminal de PowerShell dentro de la carpeta `trajes-la-tendencia` y ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File .\servir.ps1
```

Luego abre:

- Tienda: http://localhost:5178
- Panel: http://localhost:5178/admin.html

Para detener el servidor usa `Ctrl + C`.

Si el puerto 5178 estÃ¡ ocupado:

```powershell
powershell -ExecutionPolicy Bypass -File .\servir.ps1 -Port 5180
```

En Mac o Linux, si tienes Python, tambiÃ©n puedes usar:

```bash
python3 -m http.server 5178
```

No se recomienda abrir `index.html` haciendo doble clic (`file://`): algunos navegadores bloquean `localStorage` o la API de cifrado en ese modo. El servidor local evita esos problemas.

---

## 2. Probar una compra

1. Abre la tienda y elige una pieza.
2. Selecciona talla y cantidad, y agrÃ©gala al carrito.
3. Presiona **Finalizar pedido**.
4. Completa los 4 pasos: datos, entrega, pago y confirmaciÃ³n.
5. Al confirmar, se abre WhatsApp con el resumen completo dirigido al **4518 6290**.
6. El pedido queda guardado en el navegador donde se hizo la compra y el carrito se vacÃ­a.

**Tarjeta de prueba (solo demostraciÃ³n):**

- NÃºmero: `4242 4242 4242 4242`
- Vencimiento: cualquier fecha futura, formato `MM/AA`
- CVV: `123`
- Nombre: el que quieras

La tarjeta **no cobra dinero real**. Es una simulaciÃ³n para mostrar el flujo; los pagos reales se coordinan por WhatsApp (transferencia o contra entrega).

---

## 3. Panel de administraciÃ³n

### Entrar

1. Abre `/admin.html`.
2. Escribe tu clave maestra (la que se te entregÃ³ al configurar el sitio).
3. La sesiÃ³n dura mientras la pestaÃ±a estÃ© abierta. Al cerrar la pestaÃ±a o presionar **Cerrar sesiÃ³n**, se pide la clave otra vez.

### Resumen

Muestra productos activos, pedidos guardados en ese navegador, ingresos confirmados, pedidos por atender, Ãºltimos pedidos y productos con stock bajo (3 unidades o menos).

### Productos

- **Nuevo producto**: nombre, categorÃ­a, precio, precio anterior, stock, tallas, colores, etiqueta, descripciÃ³n y detalles.
- **Fotos**: arrastra o selecciona hasta 8 imÃ¡genes. Se comprimen automÃ¡ticamente a un mÃ¡ximo de 1100 px en JPEG. La primera foto es la portada.
- **Editar / eliminar** con los botones de cada fila.
- **Visible / oculto** y **destacado** se controlan con las casillas del formulario.
- Si el navegador se queda sin espacio, reduce la cantidad o el tamaÃ±o de las fotos.

### CategorÃ­as

- **Nueva categorÃ­a**: nombre, descripciÃ³n corta, texto de la tarjeta e imagen (opcional).
- Si no subes imagen, la tarjeta usa la primera foto de un producto de esa categorÃ­a.
- **Editar**, **eliminar** y cambiar el **orden** con las flechas. El orden se refleja en el menÃº, los filtros y el pie de la tienda.
- Si eliminas una categorÃ­a con productos, el panel te pide confirmar y los mueve a la primera categorÃ­a restante. No se puede borrar la Ãºltima categorÃ­a.

### Pedidos

- Los pedidos confirmados en la tienda web se guardan automÃ¡ticamente en **Supabase** y aparecen en el panel desde cualquier dispositivo (usa **Actualizar** en Pedidos para traer los Ãºltimos; tambiÃ©n se actualiza solo cada 45 segundos).
- Si un pedido no pudo subirse (sin internet), queda guardado en el navegador del cliente y se reintenta solo al recargar la tienda.
- Permite ver el detalle, cambiar el estado (pendiente, pagado, preparando, enviado, entregado, cancelado) â€” el estado tambiÃ©n se sincroniza a la nube â€” y reenviar el resumen al WhatsApp del taller o escribirle al cliente.
- Los pedidos registrados manualmente en el taller se guardan en ese navegador y se marcan "Local" hasta subirse.

> **Importante:** la notificaciÃ³n real e inmediata sigue llegando por **WhatsApp**. La lista del panel es el respaldo y control de estados.
> **Datos de clientes:** la tabla de pedidos en Supabase **no es pÃºblica**; solo el panel, con la clave maestra, puede leerla (funciÃ³n `list_orders`).
> **SQL necesario:** `supabase/schema_orders.sql` (ya ejecutado en el proyecto actual).

### Ajustes

- Datos del negocio, WhatsApp, telÃ©fono visible, correo, direcciÃ³n y Facebook.
- Reglas de envÃ­o: envÃ­o gratis desde cierto monto, tarifas local y nacional, recargo por contra entrega.
- Datos bancarios para transferencias.
- Cambio de clave.
- Exportar catÃ¡logo publicado (`data.js`), descargar respaldo JSON, importar catÃ¡logo, restaurar el catÃ¡logo de ejemplo y borrar pedidos.

### Si olvidas la clave

La clave no se guarda en el sitio: solo su huella. Si la olvidas, pide que la restablezcan: hay que generar una nueva huella en `js/admin.js` y en la tabla privada `site_auth` de Supabase. **No borres los datos del navegador**: eso no cambia la clave de la nube y perderÃ­as el catÃ¡logo local.

---

## 4. CÃ³mo publicar cambios en Internet

El sitio es estÃ¡tico: los archivos se suben a cualquier hosting. Hay dos formas de publicar el catÃ¡logo.

### OpciÃ³n A Â· Modo nube (recomendado)

Con Supabase, los cambios del panel se publican solos y los ven todos los dispositivos al recargar, sin exportar ni volver a subir archivos.

1. Crea un proyecto gratis en https://supabase.com
2. Abre **SQL Editor â†’ New query**, pega el contenido de `supabase/schema.sql` y presiona **Run**.
3. Ve a **Project Settings â†’ API** y copia **Project URL** y **anon public key**.
4. PÃ©galos en `js/cloud.js`, dentro de `window.LT_CLOUD`.
5. Vuelve a desplegar el sitio una sola vez.

Desde entonces el panel muestra **Nube: conectada** y cada cambio se guarda en la nube. La clave de escritura es la misma del panel: se guarda como huella en la tabla privada `site_auth` y se puede cambiar desde **Ajustes â†’ Seguridad** (se sincroniza sola con Supabase).

### OpciÃ³n B Â· Exportar y subir (sin nube)

1. En el panel, edita productos, fotos y ajustes.
2. Entra a **Ajustes â†’ CatÃ¡logo y respaldos**.
3. Presiona **Exportar catÃ¡logo publicado**. Se descarga `data.js`.
4. Sube ese archivo a la carpeta `js/` del hosting, reemplazando el `js/data.js` anterior.
5. Recarga la tienda y comprueba en tu telÃ©fono.

El archivo exportado ya incluye las fotos subidas (como datos embebidos), asÃ­ que no necesitas ningÃºn servicio externo de imÃ¡genes.

Cada exportaciÃ³n lleva una **revisiÃ³n nueva**. Gracias a eso, los visitantes que ya habÃ­an entrado antes dejan de ver el catÃ¡logo viejo y reciben el nuevo automÃ¡ticamente al recargar.

### DÃ³nde alojar

**El sitio ya estÃ¡ publicado en Cloudflare Pages**, conectado al repositorio de GitHub. Cada cambio que se suba a la rama `main` se publica solo. La carpeta publicada es `trajes-la-tendencia-publicar`.

- **Cloudflare Pages** (el que se usa): gratis, sin lÃ­mite de trÃ¡fico y permite uso comercial.
- **Vercel**: sigue activo como respaldo, pero el plan gratis es solo para proyectos personales.
- **Netlify Drop** (https://app.netlify.com/drop): alternativa gratis; arrastra la carpeta completa.
- **GitHub Pages**: sube el contenido a un repositorio y activa Pages.
- **cPanel / hosting tradicional**: sube el contenido de `trajes-la-tendencia-publicar/` a `public_html`.

Conviene usar **HTTPS** (todos los hostings anteriores lo dan gratis). WhatsApp, la API de cifrado del navegador y otras funciones modernas se comportan mejor en HTTPS.

### ProtecciÃ³n adicional del panel

`admin.html` es un archivo pÃºblico: cualquiera que conozca la URL puede ver la pantalla de acceso. La clave es una barrera del lado del navegador, no autenticaciÃ³n de servidor. Para protegerlo mejor:

- Usa una clave larga y Ãºnica (nada de palabras obvias ni la misma clave del correo).
- No enlaces el panel desde la tienda (ya no estÃ¡ enlazado).
- En cPanel, usa **Directory Privacy** para proteger `admin.html` con usuario y contraseÃ±a del servidor.
- Si tu hosting lo permite, bloquea `/admin.html` por IP o con una regla de acceso.

---

## 5. Personalizar el negocio real

### Textos, precios y productos

Lo mÃ¡s sencillo es hacerlo desde el panel y luego exportar `data.js`. TambiÃ©n puedes editar directamente `js/data.js` si prefieres trabajar con cÃ³digo.

Los datos de ejemplo estÃ¡n en:

- `js/data.js`: marca, ajustes, categorÃ­as, 11 productos y testimonios.
- `index.html`: textos fijos de secciones (hero, historia, mayoreo, visita, preguntas frecuentes).
- `js/app.js`: mensajes del carrito, checkout y WhatsApp.

### Fotos

- **Desde el panel**: Productos â†’ editar â†’ subir fotos (recomendado para el dÃ­a a dÃ­a).
- **Manualmente**: reemplaza los archivos de `assets/img/` conservando el nombre, o cambia las rutas en `data.js`.

Archivos actuales:

```text
assets/img/logo.svg       Logotipo
assets/img/hero.svg       Imagen principal
assets/img/pattern.svg    PatrÃ³n decorativo
assets/img/traje-1..4.svg
assets/img/blusa-1..4.svg
assets/img/corte-1..3.svg
```

### Logo, colores y tipografÃ­as

- **Logo**: reemplaza `assets/img/logo.svg` (o cambia el `<img>` en `index.html` y `admin.html`).
- **Colores**: variables al inicio de `css/styles.css` y `css/admin.css` (`--wine`, `--magenta`, `--gold`, etc.).
- **TipografÃ­as**: DM Sans y Cormorant Garamond se cargan desde Google Fonts en el `<head>`. Si el hosting debe funcionar sin internet, descarga las fuentes y sÃ­rvelas localmente.

### Datos bancarios y envÃ­os

Se cambian en **Ajustes** del panel:

- WhatsApp y telÃ©fono visible.
- EnvÃ­o gratis desde (por defecto Q600).
- EnvÃ­o en San Marcos (Q25) y nacional (Q60).
- Recargo contra entrega (Q15).
- Banco, cuenta, titular y tipo de cuenta.

Los valores actuales del banco son de ejemplo (`Banco Industrial`, `000-000000-0`). CÃ¡mbialos antes de recibir transferencias reales.

---

## 6. Estructura del proyecto

```text
trajes-la-tendencia/
â”œâ”€â”€ index.html              Tienda completa (secciones, carrito, checkout, modales)
â”œâ”€â”€ admin.html              Panel de administraciÃ³n
â”œâ”€â”€ servir.ps1              Servidor local de vista previa (Windows)
â”œâ”€â”€ css/
â”‚   â”œâ”€â”€ styles.css          DiseÃ±o de la tienda
â”‚   â””â”€â”€ admin.css           DiseÃ±o del panel
â”œâ”€â”€ js/
â”‚   â”œâ”€â”€ data.js             CatÃ¡logo semilla (marca, ajustes, productos)
â”‚   â”œâ”€â”€ app.js              Carrito, filtros, checkout, pedidos y WhatsApp
â”‚   â””â”€â”€ admin.js            Login, CRUD, fotos, pedidos, ajustes y exportaciÃ³n
â”œâ”€â”€ assets/img/             Logotipo, hero, patrÃ³n y 11 ilustraciones SVG
â””â”€â”€ tools/
    â”œâ”€â”€ generate-images.ps1 Regenera las ilustraciones SVG
    â””â”€â”€ preview.html        Hoja de contacto para revisar las imÃ¡genes (solo desarrollo)
```

---

## 7. Datos guardados en el navegador

| Clave | Contenido |
|---|---|
| `lt_catalog_v1` | CatÃ¡logo y ajustes usados por la tienda |
| `lt_cart_v1` | Carrito del visitante |
| `lt_orders_v1` | Pedidos hechos en ese navegador |
| `lt_newsletter_v1` | Correos suscritos desde ese navegador (el aviso real se envÃ­a por WhatsApp) |
| `lt_admin_hash_v2` | Huella SHA-256 de la clave del panel |
| `lt_admin_session_v2` | SesiÃ³n temporal del panel (sessionStorage) |
| `lt_cloud_pass_v1` | Clave usada para publicar en la nube (sessionStorage) |

Con el **modo nube** activo, el catÃ¡logo tambiÃ©n vive en la tabla `site_data` de Supabase. Si se borran los datos del navegador, se pierden los cambios locales y los pedidos guardados ahÃ­, pero el catÃ¡logo publicado se recupera de la nube al recargar. Por eso:

- Exporta un respaldo JSON de vez en cuando.
- Guarda una copia de `js/data.js` publicado.
- Considera a WhatsApp como el registro oficial de pedidos.

---

## 8. Flujo de un pedido

1. El cliente elige producto, talla y cantidad.
2. Completa sus datos, forma de entrega y pago.
3. El sitio calcula subtotal, envÃ­o y recargo por contra entrega.
4. Al confirmar, se registra el pedido y se abre WhatsApp con:
   - CÃ³digo del pedido.
   - Nombre, telÃ©fono y correo.
   - DirecciÃ³n o retiro en Sipacapa.
   - Productos, tallas, cantidades y precios.
   - Subtotal, envÃ­o, recargo y total.
   - Forma de pago.
5. El taller recibe el mensaje al instante en el **4518 6290** y confirma disponibilidad.
6. El cliente puede imprimir su comprobante desde la pantalla de confirmaciÃ³n.

### Formas de pago

- **Transferencia bancaria**: se muestran los datos configurados y el pedido queda pendiente de comprobante.
- **Contra entrega**: se suma el recargo configurado y se paga al recibir.
- **Tarjeta**: simulaciÃ³n de pasarela para demostraciÃ³n. No procesa pagos reales. Para cobrar con tarjeta de verdad hace falta integrar una pasarela (por ejemplo, un proveedor de pagos de Guatemala) y un backend que confirme la transacciÃ³n.

---

## 9. Antes de publicar: lista de comprobaciÃ³n

- [ ] Cambiar la clave del panel (Ajustes â†’ Seguridad).
- [ ] Verificar que el WhatsApp sea `50245186290`.
- [ ] Reemplazar banco, cuenta y titular de ejemplo.
- [ ] Revisar precios, envÃ­os y envÃ­o gratis.
- [ ] Reemplazar los 11 productos de ejemplo con piezas reales y fotos propias.
- [ ] Revisar textos de historia, mayoreo, preguntas frecuentes y testimonios.
- [ ] Sustituir el logotipo y el hero si ya hay fotografÃ­a profesional.
- [ ] Hacer un pedido de prueba y confirmar que llega a WhatsApp.
- [ ] Exportar `data.js` y subirlo al hosting.
- [ ] Abrir la tienda en un telÃ©fono real y probar el menÃº, el carrito y el checkout.
- [ ] Guardar un respaldo JSON del catÃ¡logo.

---

## 10. Limitaciones y notas tÃ©cnicas

- **CatÃ¡logo en la nube:** con Supabase, los cambios del panel se ven en todos los dispositivos al recargar. Si Supabase no estÃ¡ disponible, la tienda usa la Ãºltima copia guardada en el navegador o el `data.js` de respaldo.
- **Pedidos locales:** cada pedido se guarda en el navegador del cliente. El aviso centralizado es el mensaje de WhatsApp.
- **Clave del panel del lado del cliente:** disuade accesos casuales, pero no equivale a autenticaciÃ³n de servidor. Para mayor seguridad, protege `admin.html` desde el hosting.
- **Tarjeta en modo demostraciÃ³n:** no se cobra dinero real.
- **Almacenamiento limitado:** `localStorage` suele permitir entre 5 y 10 MB. Las fotos se comprimen, pero conviene no subir decenas de imÃ¡genes por producto.
- **Dependencias externas:** solo Google Fonts. El resto es HTML, CSS y JavaScript sin librerÃ­as.
- **Navegadores:** Chrome, Edge, Firefox, Safari y navegadores mÃ³viles actuales con JavaScript activado.
- **Mapa:** la secciÃ³n VisÃ­tanos muestra una referencia grÃ¡fica local, no un mapa interactivo. Si quieres uno, puedes insertar un iframe de Google Maps en `index.html`.

---

## 11. Herramientas de desarrollo

- `tools/generate-images.ps1`: vuelve a generar las ilustraciones SVG de productos, logo, hero y patrÃ³n.
- `tools/preview.html`: hoja de contacto para revisar visualmente todas las imÃ¡genes. No forma parte de la tienda y puede eliminarse al publicar.

---

Â© Trajes La Tendencia Â· Sipacapa, San Marcos, Guatemala.

