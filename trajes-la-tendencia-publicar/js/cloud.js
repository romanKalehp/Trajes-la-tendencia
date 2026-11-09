/* ============================================================
   TRAJES LA TENDENCIA · Sincronización con la nube (Supabase)
   ------------------------------------------------------------
   Con esto, los cambios que guardes en el panel se publican en
   internet y los ven todos los dispositivos, sin exportar ni
   volver a subir archivos.

   CONFIGURACIÓN (solo una vez):
   1. Crea un proyecto gratis en https://supabase.com
   2. Abre "SQL Editor", pega el contenido de supabase/schema.sql
      y presiona "Run".
   3. Ve a "Project Settings → API" y copia:
        - Project URL
        - anon public key
   4. Pégalos abajo, entre las comillas, y vuelve a desplegar.

   Si dejas los dos valores vacíos, la tienda funciona como
   antes: solo con js/data.js y la copia del navegador.
   ============================================================ */
window.LT_CLOUD = {
  url: "https://enfrqredpblgainhjahp.supabase.co",                 // Ej: "https://abcdefgh.supabase.co"
  anonKey: "sb_publishable_ZzTMjt2l4QeWEhyQr0_9Zw_-n3-wClP",             // Ej: "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  table: "site_data",
  rpc: "save_catalog",
  timeout: 3500
};

window.LTCloud = (function () {
  "use strict";

  function cfg() { return window.LT_CLOUD || {}; }

  function ready() {
    const c = cfg();
    return !!(c.url && c.anonKey);
  }

  function headers() {
    const c = cfg();
    const key = String(c.anonKey || "");
    const h = { apikey: key };
    // Las llaves nuevas "sb_publishable_..." no son JWT: van solo en apikey.
    if (key.indexOf("eyJ") === 0) h.Authorization = "Bearer " + key;
    return h;
  }

  function request(url, options, ms) {
    const ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), ms) : null;
    const opts = Object.assign({}, options);
    if (ctrl) opts.signal = ctrl.signal;
    return fetch(url, opts).finally(() => { if (timer) clearTimeout(timer); });
  }

  function base() {
    return String(cfg().url || "").replace(/\/+$/, "");
  }

  async function load() {
    if (!ready()) return null;
    const c = cfg();
    const url = base() + "/rest/v1/" + c.table + "?id=eq.catalog&select=data";
    const res = await request(url, { headers: headers() }, c.timeout || 3500);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const rows = await res.json();
    return (rows && rows[0] && rows[0].data) || null;
  }

  async function version() {
    if (!ready()) return null;
    const c = cfg();
    const url = base() + "/rest/v1/" + c.table + "?id=eq.catalog&select=updated_at";
    const res = await request(url, { headers: headers() }, c.timeout || 3500);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const rows = await res.json();
    return (rows && rows[0] && rows[0].updated_at) || null;
  }

  async function save(data, password) {
    if (!ready()) throw new Error("La nube no está configurada.");
    const c = cfg();
    const url = base() + "/rest/v1/rpc/" + c.rpc;
    const res = await request(url, {
      method: "POST",
      headers: Object.assign({ "Content-Type": "application/json" }, headers()),
      body: JSON.stringify({ p_password: password || "", p_data: data })
    }, (c.timeout || 3500) * 3);
    if (!res.ok) {
      let msg = "HTTP " + res.status;
      try {
        const body = await res.json();
        if (body && (body.message || body.error)) msg = body.message || body.error;
      } catch (e) { /* respuesta sin JSON */ }
      throw new Error(msg);
    }
    return res.json().catch(() => ({}));
  }

  return { ready: ready, load: load, version: version, save: save };
})();
