# Trajes La Tendencia · Tienda en línea

Sitio web completo para **Trajes La Tendencia**, tienda de trajes, blusas y cortes típicos de Guatemala.

Incluye tienda pública, carrito, checkout, pedido por WhatsApp y un **panel de administración con clave** para manejar el catálogo, subir fotos y revisar los pedidos hechos desde ese mismo dispositivo.

> Los productos, precios, textos, testimonios e imágenes de esta entrega son **de ejemplo**, listos para reemplazarse con la información real del negocio. Las ilustraciones son SVG locales, sin depender de bancos de imágenes.

## Lo que incluye

- Escaparate con hero, categorías, destacados, historia, mayoreo, galería, testimonios, visita y boletín.
- Catálogo filtrable por **Trajes**, **Blusas** y **Cortes típicos**, con búsqueda, orden y fichas de producto.
- Carrito persistente y checkout de 4 pasos con envío local/nacional, retiro y contra entrega.
- Notificación instantánea al WhatsApp del taller con el pedido completo.
- Panel privado con resumen, productos, subida de fotos, pedidos y ajustes.
- Exportación de `data.js` con las fotos incluidas para publicar sin servicios externos.
- Diseño responsive y accesible (Lighthouse 100 en accesibilidad, buenas prácticas y SEO).

---

## Accesos rápidos

| Qué | Dónde |
|---|---|
| Tienda | `http://localhost:5178/` |
| Panel de administración | `http://localhost:5178/admin.html` |
| Clave del panel | privada (no se publica en el sitio) |
| WhatsApp del taller | `50233451029` (visible: 3345 1029) |
| Facebook | https://www.facebook.com/trajes.la.tendencia |

La clave del panel es privada: no está escrita en el sitio, solo su huella cifrada. Puedes cambiarla en **Ajustes → Seguridad**.

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

Si el puerto 5178 está ocupado:

```powershell
powershell -ExecutionPolicy Bypass -File .\servir.ps1 -Port 5180
```

En Mac o Linux, si tienes Python, también puedes usar:

```bash
python3 -m http.server 5178
```

No se recomienda abrir `index.html` haciendo doble clic (`file://`): algunos navegadores bloquean `localStorage` o la API de cifrado en ese modo. El servidor local evita esos problemas.

---

## 2. Probar una compra

1. Abre la tienda y elige una pieza.
2. Selecciona talla y cantidad, y agrégala al carrito.
3. Presiona **Finalizar pedido**.
4. Completa los 4 pasos: datos, entrega, pago y confirmación.
5. Al confirmar, se abre WhatsApp con el resumen completo dirigido al **3345 1029**.
6. El pedido queda guardado en el navegador donde se hizo la compra y el carrito se vacía.

**Tarjeta de prueba (solo demostración):**

- Número: `4242 4242 4242 4242`
- Vencimiento: cualquier fecha futura, formato `MM/AA`
- CVV: `123`
- Nombre: el que quieras

La tarjeta **no cobra dinero real**. Es una simulación para mostrar el flujo; los pagos reales se coordinan por WhatsApp (transferencia o contra entrega).

---

## 3. Panel de administración

### Entrar

1. Abre `/admin.html`.
2. Escribe tu clave maestra (la que se te entregó al configurar el sitio).
3. La sesión dura mientras la pestaña esté abierta. Al cerrar la pestaña o presionar **Cerrar sesión**, se pide la clave otra vez.

### Resumen

Muestra productos activos, pedidos guardados en ese navegador, ingresos confirmados, pedidos por atender, últimos pedidos y productos con stock bajo (3 unidades o menos).

### Productos

- **Nuevo producto**: nombre, categoría, precio, precio anterior, stock, tallas, colores, etiqueta, descripción y detalles.
- **Fotos**: arrastra o selecciona hasta 8 imágenes. Se comprimen automáticamente a un máximo de 1100 px en JPEG. La primera foto es la portada.
- **Editar / eliminar** con los botones de cada fila.
- **Visible / oculto** y **destacado** se controlan con las casillas del formulario.
- Si el navegador se queda sin espacio, reduce la cantidad o el tamaño de las fotos.

### Categorías

- **Nueva categoría**: nombre, descripción corta, texto de la tarjeta e imagen (opcional).
- Si no subes imagen, la tarjeta usa la primera foto de un producto de esa categoría.
- **Editar**, **eliminar** y cambiar el **orden** con las flechas. El orden se refleja en el menú, los filtros y el pie de la tienda.
- Si eliminas una categoría con productos, el panel te pide confirmar y los mueve a la primera categoría restante. No se puede borrar la última categoría.

### Pedidos

- Lista los pedidos **hechos desde este mismo navegador** (por ejemplo, ventas registradas en el taller).
- Permite ver el detalle, cambiar el estado (pendiente, pagado, preparando, enviado, entregado, cancelado) y reenviar el resumen al WhatsApp del taller o escribirle al cliente.

> **Importante:** los pedidos de tus clientes se guardan en el navegador de cada cliente, no en un servidor central. La notificación real e inmediata llega por **WhatsApp**. Usa WhatsApp como tu libro de pedidos; esta lista es un apoyo local.

### Ajustes

- Datos del negocio, WhatsApp, teléfono visible, correo, dirección y Facebook.
- Reglas de envío: envío gratis desde cierto monto, tarifas local y nacional, recargo por contra entrega.
- Datos bancarios para transferencias.
- Cambio de clave.
- Exportar catálogo publicado (`data.js`), descargar respaldo JSON, importar catálogo, restaurar el catálogo de ejemplo y borrar pedidos.

### Si olvidas la clave

La clave no se guarda en el sitio: solo su huella. Si la olvidas, pide que la restablezcan: hay que generar una nueva huella en `js/admin.js` y en la tabla privada `site_auth` de Supabase. **No borres los datos del navegador**: eso no cambia la clave de la nube y perderías el catálogo local.

---

## 4. Cómo publicar cambios en Internet

El sitio es estático: los archivos se suben a cualquier hosting. Hay dos formas de publicar el catálogo.

### Opción A · Modo nube (recomendado)

Con Supabase, los cambios del panel se publican solos y los ven todos los dispositivos al recargar, sin exportar ni volver a subir archivos.

1. Crea un proyecto gratis en https://supabase.com
2. Abre **SQL Editor → New query**, pega el contenido de `supabase/schema.sql` y presiona **Run**.
3. Ve a **Project Settings → API** y copia **Project URL** y **anon public key**.
4. Pégalos en `js/cloud.js`, dentro de `window.LT_CLOUD`.
5. Vuelve a desplegar el sitio una sola vez.

Desde entonces el panel muestra **Nube: conectada** y cada cambio se guarda en la nube. La clave de escritura es la misma del panel: se guarda como huella en la tabla privada `site_auth` y se puede cambiar desde **Ajustes → Seguridad** (se sincroniza sola con Supabase).

### Opción B · Exportar y subir (sin nube)

1. En el panel, edita productos, fotos y ajustes.
2. Entra a **Ajustes → Catálogo y respaldos**.
3. Presiona **Exportar catálogo publicado**. Se descarga `data.js`.
4. Sube ese archivo a la carpeta `js/` del hosting, reemplazando el `js/data.js` anterior.
5. Recarga la tienda y comprueba en tu teléfono.

El archivo exportado ya incluye las fotos subidas (como datos embebidos), así que no necesitas ningún servicio externo de imágenes.

Cada exportación lleva una **revisión nueva**. Gracias a eso, los visitantes que ya habían entrado antes dejan de ver el catálogo viejo y reciben el nuevo automáticamente al recargar.

### Dónde alojar

- **Netlify Drop** (https://app.netlify.com/drop): arrastra la carpeta completa. Para actualizar, vuelve a arrastrar la carpeta con el nuevo `data.js`.
- **GitHub Pages**: sube el contenido a un repositorio y activa Pages.
- **cPanel / hosting tradicional**: sube el contenido de `trajes-la-tendencia/` a `public_html` (o a la carpeta del dominio).
- **Cloudflare Pages, Vercel u otro hosting estático**: sube la carpeta como sitio estático.

Conviene usar **HTTPS** (todos los hostings anteriores lo dan gratis). WhatsApp, la API de cifrado del navegador y otras funciones modernas se comportan mejor en HTTPS.

### Protección adicional del panel

`admin.html` es un archivo público: cualquiera que conozca la URL puede ver la pantalla de acceso. La clave es una barrera del lado del navegador, no autenticación de servidor. Para protegerlo mejor:

- Usa una clave larga y única (nada de palabras obvias ni la misma clave del correo).
- No enlaces el panel desde la tienda (ya no está enlazado).
- En cPanel, usa **Directory Privacy** para proteger `admin.html` con usuario y contraseña del servidor.
- Si tu hosting lo permite, bloquea `/admin.html` por IP o con una regla de acceso.

---

## 5. Personalizar el negocio real

### Textos, precios y productos

Lo más sencillo es hacerlo desde el panel y luego exportar `data.js`. También puedes editar directamente `js/data.js` si prefieres trabajar con código.

Los datos de ejemplo están en:

- `js/data.js`: marca, ajustes, categorías, 11 productos y testimonios.
- `index.html`: textos fijos de secciones (hero, historia, mayoreo, visita, preguntas frecuentes).
- `js/app.js`: mensajes del carrito, checkout y WhatsApp.

### Fotos

- **Desde el panel**: Productos → editar → subir fotos (recomendado para el día a día).
- **Manualmente**: reemplaza los archivos de `assets/img/` conservando el nombre, o cambia las rutas en `data.js`.

Archivos actuales:

```text
assets/img/logo.svg       Logotipo
assets/img/hero.svg       Imagen principal
assets/img/pattern.svg    Patrón decorativo
assets/img/traje-1..4.svg
assets/img/blusa-1..4.svg
assets/img/corte-1..3.svg
```

### Logo, colores y tipografías

- **Logo**: reemplaza `assets/img/logo.svg` (o cambia el `<img>` en `index.html` y `admin.html`).
- **Colores**: variables al inicio de `css/styles.css` y `css/admin.css` (`--wine`, `--magenta`, `--gold`, etc.).
- **Tipografías**: DM Sans y Cormorant Garamond se cargan desde Google Fonts en el `<head>`. Si el hosting debe funcionar sin internet, descarga las fuentes y sírvelas localmente.

### Datos bancarios y envíos

Se cambian en **Ajustes** del panel:

- WhatsApp y teléfono visible.
- Envío gratis desde (por defecto Q600).
- Envío en San Marcos (Q25) y nacional (Q60).
- Recargo contra entrega (Q15).
- Banco, cuenta, titular y tipo de cuenta.

Los valores actuales del banco son de ejemplo (`Banco Industrial`, `000-000000-0`). Cámbialos antes de recibir transferencias reales.

---

## 6. Estructura del proyecto

```text
trajes-la-tendencia/
├── index.html              Tienda completa (secciones, carrito, checkout, modales)
├── admin.html              Panel de administración
├── servir.ps1              Servidor local de vista previa (Windows)
├── css/
│   ├── styles.css          Diseño de la tienda
│   └── admin.css           Diseño del panel
├── js/
│   ├── data.js             Catálogo semilla (marca, ajustes, productos)
│   ├── app.js              Carrito, filtros, checkout, pedidos y WhatsApp
│   └── admin.js            Login, CRUD, fotos, pedidos, ajustes y exportación
├── assets/img/             Logotipo, hero, patrón y 11 ilustraciones SVG
└── tools/
    ├── generate-images.ps1 Regenera las ilustraciones SVG
    └── preview.html        Hoja de contacto para revisar las imágenes (solo desarrollo)
```

---

## 7. Datos guardados en el navegador

| Clave | Contenido |
|---|---|
| `lt_catalog_v1` | Catálogo y ajustes usados por la tienda |
| `lt_cart_v1` | Carrito del visitante |
| `lt_orders_v1` | Pedidos hechos en ese navegador |
| `lt_newsletter_v1` | Correos suscritos desde ese navegador (el aviso real se envía por WhatsApp) |
| `lt_admin_hash_v1` | Huella SHA-256 de la clave del panel |
| `lt_admin_session_v1` | Sesión temporal del panel (sessionStorage) |
| `lt_cloud_pass_v1` | Clave usada para publicar en la nube (sessionStorage) |

Con el **modo nube** activo, el catálogo también vive en la tabla `site_data` de Supabase. Si se borran los datos del navegador, se pierden los cambios locales y los pedidos guardados ahí, pero el catálogo publicado se recupera de la nube al recargar. Por eso:

- Exporta un respaldo JSON de vez en cuando.
- Guarda una copia de `js/data.js` publicado.
- Considera a WhatsApp como el registro oficial de pedidos.

---

## 8. Flujo de un pedido

1. El cliente elige producto, talla y cantidad.
2. Completa sus datos, forma de entrega y pago.
3. El sitio calcula subtotal, envío y recargo por contra entrega.
4. Al confirmar, se registra el pedido y se abre WhatsApp con:
   - Código del pedido.
   - Nombre, teléfono y correo.
   - Dirección o retiro en Sipacapa.
   - Productos, tallas, cantidades y precios.
   - Subtotal, envío, recargo y total.
   - Forma de pago.
5. El taller recibe el mensaje al instante en el **3345 1029** y confirma disponibilidad.
6. El cliente puede imprimir su comprobante desde la pantalla de confirmación.

### Formas de pago

- **Transferencia bancaria**: se muestran los datos configurados y el pedido queda pendiente de comprobante.
- **Contra entrega**: se suma el recargo configurado y se paga al recibir.
- **Tarjeta**: simulación de pasarela para demostración. No procesa pagos reales. Para cobrar con tarjeta de verdad hace falta integrar una pasarela (por ejemplo, un proveedor de pagos de Guatemala) y un backend que confirme la transacción.

---

## 9. Antes de publicar: lista de comprobación

- [ ] Cambiar la clave del panel (Ajustes → Seguridad).
- [ ] Verificar que el WhatsApp sea `50233451029`.
- [ ] Reemplazar banco, cuenta y titular de ejemplo.
- [ ] Revisar precios, envíos y envío gratis.
- [ ] Reemplazar los 11 productos de ejemplo con piezas reales y fotos propias.
- [ ] Revisar textos de historia, mayoreo, preguntas frecuentes y testimonios.
- [ ] Sustituir el logotipo y el hero si ya hay fotografía profesional.
- [ ] Hacer un pedido de prueba y confirmar que llega a WhatsApp.
- [ ] Exportar `data.js` y subirlo al hosting.
- [ ] Abrir la tienda en un teléfono real y probar el menú, el carrito y el checkout.
- [ ] Guardar un respaldo JSON del catálogo.

---

## 10. Limitaciones y notas técnicas

- **Sin backend:** el catálogo se publica reemplazando `data.js`; no hay edición en vivo para todos los visitantes.
- **Pedidos locales:** cada pedido se guarda en el navegador del cliente. El aviso centralizado es el mensaje de WhatsApp.
- **Clave del panel del lado del cliente:** disuade accesos casuales, pero no equivale a autenticación de servidor. Para mayor seguridad, protege `admin.html` desde el hosting.
- **Tarjeta en modo demostración:** no se cobra dinero real.
- **Almacenamiento limitado:** `localStorage` suele permitir entre 5 y 10 MB. Las fotos se comprimen, pero conviene no subir decenas de imágenes por producto.
- **Dependencias externas:** solo Google Fonts. El resto es HTML, CSS y JavaScript sin librerías.
- **Navegadores:** Chrome, Edge, Firefox, Safari y navegadores móviles actuales con JavaScript activado.
- **Mapa:** la sección Visítanos muestra una referencia gráfica local, no un mapa interactivo. Si quieres uno, puedes insertar un iframe de Google Maps en `index.html`.

---

## 11. Herramientas de desarrollo

- `tools/generate-images.ps1`: vuelve a generar las ilustraciones SVG de productos, logo, hero y patrón.
- `tools/preview.html`: hoja de contacto para revisar visualmente todas las imágenes. No forma parte de la tienda y puede eliminarse al publicar.

---

© Trajes La Tendencia · Sipacapa, San Marcos, Guatemala.
