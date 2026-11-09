/* ==========================================================================
   TRAJES LA TENDENCIA · Panel de administración
   Sin dependencias. Los datos viven en localStorage y se pueden exportar
   como js/data.js para publicarlos en la tienda.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Utilidades ---------- */
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const money = (n) => "Q" + Number(n || 0).toLocaleString("es-GT", { maximumFractionDigits: 0 });
  const digits = (s) => String(s || "").replace(/\D/g, "");
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money0 = (n) => Math.max(0, Math.round(Number(n) || 0));

  const KEYS = {
    catalog: "lt_catalog_v1",
    orders: "lt_orders_v1",
    hash: "lt_admin_hash_v1",
    session: "lt_admin_session_v1"
  };
  const DEFAULT_PASS = "LT2026";
  const BASE = window.LT_DATA;

  const STATUS = {
    pendiente: "Pendiente",
    pagado: "Pagado",
    preparando: "En preparación",
    enviado: "Enviado",
    entregado: "Entregado",
    cancelado: "Cancelado"
  };

  let memorySession = false;
  const session = {
    get() { try { return sessionStorage.getItem(KEYS.session) === "ok"; } catch (e) { return memorySession; } },
    set(v) { try { sessionStorage.setItem(KEYS.session, v ? "ok" : "no"); } catch (e) { memorySession = v; } },
    clear() { try { sessionStorage.removeItem(KEYS.session); } catch (e) {} memorySession = false; }
  };

  let catalog = loadCatalog();
  let draftImages = [];
  let editingId = null;
  let currentOrderCode = null;

  function loadCatalog() {
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(KEYS.catalog) || "null"); } catch (e) { saved = null; }
    const baseRev = Number(BASE.revision || 0);
    const savedRev = saved ? Number(saved.revision || 0) : -1;
    const useSaved = !!(saved && Array.isArray(saved.products) && savedRev >= baseRev);
    const source = useSaved ? saved : clone(BASE);
    return {
      version: source.version || 1,
      revision: Number(source.revision || 0),
      brand: Object.assign({}, BASE.brand, source.brand || {}),
      settings: Object.assign({}, BASE.settings, source.settings || {}),
      categories: source.categories || clone(BASE.categories),
      products: source.products || [],
      testimonials: source.testimonials || clone(BASE.testimonials || [])
    };
  }

  function saveCatalog() {
    try { localStorage.setItem(KEYS.catalog, JSON.stringify(catalog)); return true; }
    catch (e) { return false; }
  }

  function getOrders() {
    try { return JSON.parse(localStorage.getItem(KEYS.orders) || "[]"); } catch (e) { return []; }
  }
  function saveOrders(list) {
    try { localStorage.setItem(KEYS.orders, JSON.stringify(list)); return true; } catch (e) { return false; }
  }

  /* ---------- Toasts ---------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $("#admin-toast");
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 3200);
  }

  /* ---------- Clave ---------- */
  async function sha256(text) {
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      try {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
        return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
      } catch (e) { /* fallback */ }
    }
    let h = 5381;
    const s = "lt::" + text;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return "djb2:" + h.toString(16);
  }

  async function storedHash() {
    let h = null;
    try { h = localStorage.getItem(KEYS.hash); } catch (e) {}
    if (!h) {
      h = await sha256(DEFAULT_PASS);
      try { localStorage.setItem(KEYS.hash, h); } catch (e) {}
    }
    return h;
  }

  /* ---------- Login ---------- */
  function bindLogin() {
    const form = $("#login-form");
    const pass = $("#login-pass");
    const err = $("#login-error");
    const btn = form.querySelector("button[type=submit]");

    $("#toggle-pass").addEventListener("click", () => {
      pass.type = pass.type === "password" ? "text" : "password";
      pass.focus();
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      err.textContent = "";
      const value = pass.value;
      if (!value) { err.textContent = "Escribe tu clave para entrar."; pass.focus(); return; }
      btn.disabled = true;
      btn.textContent = "Verificando…";
      try {
        const stored = await storedHash();
        const attempt = await sha256(value);
        if (attempt !== stored) {
          err.textContent = "Clave incorrecta. Inténtalo de nuevo.";
          pass.select();
          return;
        }
        session.set(true);
        showApp();
      } finally {
        btn.disabled = false;
        btn.innerHTML = 'Entrar al panel <svg class="ico"><use href="#a-arrow"/></svg>';
      }
    });
  }

  function showApp() {
    $("#login-screen").hidden = true;
    $("#admin-app").hidden = false;
    document.body.style.background = "#F7F1EC";
    renderAll();
    const pending = getOrders().filter((o) => o.status === "pendiente").length;
    if (pending) toast("Tienes " + pending + (pending === 1 ? " pedido pendiente." : " pedidos pendientes."));
  }

  function showLogin() {
    $("#admin-app").hidden = true;
    $("#login-screen").hidden = false;
    setTimeout(() => { const p = $("#login-pass"); if (p) p.focus(); }, 100);
  }

  function logout() {
    session.clear();
    showLogin();
    toast("Sesión cerrada.");
  }

  /* ======================================================================
     NAVEGACIÓN
     ====================================================================== */
  const VIEW_META = {
    dashboard: ["Resumen", "Todo lo que pasa en tu tienda, de un vistazo."],
    products: ["Productos", "Agrega piezas, cambia precios y sube fotos."],
    orders: ["Pedidos", "Revisa, confirma y entrega los pedidos recibidos."],
    settings: ["Ajustes", "Datos del negocio, envíos, seguridad y respaldos."]
  };

  function switchView(name) {
    $$(".view").forEach((v) => v.classList.toggle("is-active", v.dataset.view === name));
    $$("[data-view-link]").forEach((b) => b.classList.toggle("is-active", b.dataset.viewLink === name));
    const meta = VIEW_META[name] || VIEW_META.dashboard;
    $("#view-title").textContent = meta[0];
    $("#view-subtitle").textContent = meta[1];
    if (name === "dashboard") renderDashboard();
    if (name === "products") renderProducts();
    if (name === "orders") renderOrders();
    if (name === "settings") fillSettings();
    closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openSidebar() {
    $("#sidebar").classList.add("is-open");
    $("#sidebar-overlay").classList.add("is-on");
  }
  function closeSidebar() {
    $("#sidebar").classList.remove("is-open");
    $("#sidebar-overlay").classList.remove("is-on");
  }

  /* ======================================================================
     RENDER GENERAL
     ====================================================================== */
  function renderAll() {
    fillCategoryOptions();
    renderDashboard();
    renderProducts();
    renderOrders();
    fillSettings();
    updateCounts();
  }

  function updateCounts() {
    const active = catalog.products.filter((p) => p.active !== false).length;
    const pending = getOrders().filter((o) => o.status === "pendiente" || o.status === "preparando").length;
    const sp = $("#side-count-products"), so = $("#side-count-orders");
    if (sp) sp.textContent = String(active);
    if (so) { so.textContent = String(pending); so.style.display = pending ? "" : "none"; }
  }

  function fillCategoryOptions() {
    const opts = catalog.categories.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("");
    const filter = $("#product-filter-cat");
    if (filter) filter.innerHTML = '<option value="all">Todas las categorías</option>' + opts;
    const formSel = $("#pf-category");
    if (formSel) formSel.innerHTML = opts;
  }

  /* ======================================================================
     DASHBOARD
     ====================================================================== */
  function renderDashboard() {
    const orders = getOrders();
    const active = catalog.products.filter((p) => p.active !== false);
    const paidStatuses = ["pagado", "preparando", "enviado", "entregado"];
    const revenue = orders.filter((o) => paidStatuses.includes(o.status)).reduce((n, o) => n + Number(o.total || 0), 0);
    const pending = orders.filter((o) => o.status === "pendiente" || o.status === "preparando").length;

    $("#kpi-products").textContent = active.length;
    $("#kpi-products-note").textContent = catalog.products.length + " en total · " + catalog.categories.length + " categorías";
    $("#kpi-orders").textContent = orders.length;
    $("#kpi-orders-note").textContent = orders.length ? "Último: " + new Date(orders[0].date).toLocaleDateString("es-GT") : "Aún sin pedidos";
    $("#kpi-revenue").textContent = money(revenue);
    $("#kpi-revenue-note").textContent = "Pedidos pagados o entregados";
    $("#kpi-pending").textContent = pending;
    $("#kpi-pending-note").textContent = pending ? "Requieren tu atención" : "Todo al día";

    const recent = orders.slice(0, 5);
    $("#recent-orders").innerHTML = recent.map((o) => `
      <tr data-order="${esc(o.code)}" style="cursor:pointer">
        <td><span class="order-code">${esc(o.code)}</span></td>
        <td>${esc(o.customer && o.customer.name || "Cliente")}<div class="muted">${esc(o.customer && o.customer.phone || "")}</div></td>
        <td><strong>${money(o.total)}</strong></td>
        <td><span class="pill pill--${esc(o.status || "pendiente")}">${esc(STATUS[o.status] || "Pendiente")}</span></td>
      </tr>`).join("");
    $("#recent-empty").hidden = recent.length > 0;

    const low = active.filter((p) => Number(p.stock) <= 3).sort((a, b) => Number(a.stock) - Number(b.stock)).slice(0, 5);
    $("#low-stock").innerHTML = low.map((p) => `
      <div class="lowstock-item">
        <img src="${esc((p.images || [])[0] || "")}" alt="">
        <div><strong>${esc(p.name)}</strong><span>${Number(p.stock) === 0 ? "Agotado" : "Quedan " + p.stock + " piezas"}</span></div>
        <b>${money(p.price)}</b>
      </div>`).join("");
    $("#low-empty").hidden = low.length > 0;

    updateCounts();
  }

  /* ======================================================================
     PRODUCTOS
     ====================================================================== */
  function productMatches(p, q) {
    if (!q) return true;
    return (p.name + " " + (p.desc || "") + " " + (p.badge || "")).toLowerCase().includes(q.toLowerCase());
  }

  function renderProducts() {
    const q = ($("#product-search").value || "").trim();
    const cat = $("#product-filter-cat").value || "all";
    const status = $("#product-filter-status").value || "all";
    let list = catalog.products.slice();

    if (q) list = list.filter((p) => productMatches(p, q));
    if (cat !== "all") list = list.filter((p) => p.category === cat);
    if (status === "active") list = list.filter((p) => p.active !== false);
    if (status === "inactive") list = list.filter((p) => p.active === false);
    if (status === "low") list = list.filter((p) => Number(p.stock) <= 3);

    $("#products-tbody").innerHTML = list.map((p) => `
      <tr>
        <td>
          <div class="prod-cell">
            <img src="${esc((p.images || [])[0] || "")}" alt="">
            <div><strong>${esc(p.name)}</strong><span>${p.featured ? "★ Destacado" : "&nbsp;"}</span></div>
          </div>
        </td>
        <td><span class="cat-chip">${esc(catName(p.category))}</span></td>
        <td class="price-cell">${money(p.price)}${p.compareAt > p.price ? `<s>${money(p.compareAt)}</s>` : ""}</td>
        <td class="stock-cell${Number(p.stock) <= 3 ? " is-low" : ""}">${Number(p.stock) === 0 ? "Agotado" : p.stock}</td>
        <td><span class="state-dot ${p.active !== false ? "is-on" : ""}">${p.active !== false ? "Activo" : "Inactivo"}</span></td>
        <td>
          <div class="row-actions">
            <button class="row-btn" data-edit="${esc(p.id)}" aria-label="Editar ${esc(p.name)}" title="Editar"><svg class="ico"><use href="#a-edit"/></svg></button>
            <button class="row-btn row-btn--del" data-del="${esc(p.id)}" aria-label="Eliminar ${esc(p.name)}" title="Eliminar"><svg class="ico"><use href="#a-trash"/></svg></button>
          </div>
        </td>
      </tr>`).join("");

    $("#products-empty").hidden = list.length > 0;
    updateCounts();
  }

  function catName(id) {
    const c = catalog.categories.find((x) => x.id === id);
    return c ? c.name : id;
  }

  function slugify(text) {
    return String(text).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "producto";
  }

  function openProductForm(id) {
    editingId = id || null;
    draftImages = [];
    $("#pf-error").textContent = "";
    $("#product-form").reset();
    $("#pf-stock").value = 10;
    $("#pf-active").checked = true;
    $("#pf-featured").checked = true;
    fillCategoryOptions();

    if (id) {
      const p = catalog.products.find((x) => x.id === id);
      if (!p) return;
      $("#pf-title").textContent = "Editar producto";
      $("#pf-name").value = p.name || "";
      $("#pf-category").value = p.category || "trajes";
      $("#pf-badge").value = p.badge || "";
      $("#pf-price").value = p.price || "";
      $("#pf-compare").value = p.compareAt || "";
      $("#pf-stock").value = p.stock != null ? p.stock : 0;
      $("#pf-sizes").value = (p.sizes || []).join(", ");
      $("#pf-colors").value = (p.colors || []).map((c) => c.name + ":" + c.hex).join(", ");
      $("#pf-desc").value = p.desc || "";
      $("#pf-details").value = (p.details || []).join("\n");
      $("#pf-featured").checked = !!p.featured;
      $("#pf-active").checked = p.active !== false;
      draftImages = (p.images || []).slice();
    } else {
      $("#pf-title").textContent = "Nuevo producto";
    }

    renderDraftImages();
    $("#product-form-modal").classList.add("is-open");
    $("#product-form-modal").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#pf-name").focus(), 150);
  }

  function closeProductForm() {
    $("#product-form-modal").classList.remove("is-open");
    $("#product-form-modal").setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function renderDraftImages() {
    $("#pf-images").innerHTML = draftImages.map((src, i) => `
      <div class="img-thumb">
        <img src="${esc(src)}" alt="Foto ${i + 1}">
        ${i === 0 ? '<span class="img-thumb__cover">Portada</span>' : ""}
        <button type="button" class="img-thumb__del" data-img-del="${i}" aria-label="Quitar foto ${i + 1}">
          <svg class="ico"><use href="#a-close"/></svg>
        </button>
      </div>`).join("");
  }

  function readDataUrl(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }

  async function compressImage(file) {
    if (!file.type || !file.type.startsWith("image/")) throw new Error("Archivo no compatible");
    if (file.type === "image/svg+xml") return await readDataUrl(file);
    const img = await loadImage(file);
    const max = 1100;
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.max(1, Math.round(img.width * scale));
    const h = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FDF8F4";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    return canvas.toDataURL("image/jpeg", 0.82);
  }

  async function addFiles(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    if (draftImages.length + list.length > 8) {
      toast("Puedes subir hasta 8 fotos por producto.");
    }
    const room = Math.max(0, 8 - draftImages.length);
    const chosen = list.slice(0, room);
    if (!chosen.length) return;
    toast("Procesando " + chosen.length + (chosen.length === 1 ? " foto…" : " fotos…"));
    for (const f of chosen) {
      try {
        const data = await compressImage(f);
        draftImages.push(data);
        renderDraftImages();
      } catch (e) {
        toast("No se pudo procesar " + f.name);
      }
    }
    $("#pf-file").value = "";
  }

  function parseSizes(text) {
    const arr = String(text || "").split(",").map((s) => s.trim()).filter(Boolean);
    return arr.length ? arr : ["Única"];
  }
  function parseColors(text) {
    return String(text || "").split(",").map((chunk) => chunk.trim()).filter(Boolean).map((c) => {
      const parts = c.split(":");
      if (parts.length >= 2) {
        const hex = parts.pop().trim();
        return { name: parts.join(":").trim() || "Color", hex: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex) ? hex : "#C2185B" };
      }
      return { name: "Color", hex: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(c) ? c : "#C2185B" };
    }).slice(0, 8);
  }

  function saveProduct(e) {
    e.preventDefault();
    const err = $("#pf-error");
    err.textContent = "";
    const name = $("#pf-name").value.trim();
    const price = money0($("#pf-price").value);
    const stock = money0($("#pf-stock").value);
    if (name.length < 3) { err.textContent = "El nombre debe tener al menos 3 letras."; $("#pf-name").focus(); return; }
    if (price <= 0) { err.textContent = "El precio debe ser mayor que cero."; $("#pf-price").focus(); return; }
    if (!draftImages.length) { err.textContent = "Sube al menos una foto del producto."; return; }

    const data = {
      id: editingId || (slugify(name) + "-" + Math.random().toString(36).slice(2, 5)),
      name: name,
      category: $("#pf-category").value,
      price: price,
      compareAt: money0($("#pf-compare").value),
      stock: stock,
      sizes: parseSizes($("#pf-sizes").value),
      colors: parseColors($("#pf-colors").value),
      badge: $("#pf-badge").value,
      featured: $("#pf-featured").checked,
      active: $("#pf-active").checked,
      images: draftImages.slice(),
      desc: $("#pf-desc").value.trim(),
      details: $("#pf-details").value.split("\n").map((s) => s.trim()).filter(Boolean)
    };

    const idx = catalog.products.findIndex((p) => p.id === editingId);
    const snapshot = catalog.products.slice();
    if (idx >= 0) catalog.products[idx] = data;
    else catalog.products.unshift(data);

    if (!saveCatalog()) {
      catalog.products = snapshot;
      err.textContent = "No hay espacio en este navegador para guardar las fotos. Sube menos imágenes o usa fotos más livianas.";
      return;
    }

    closeProductForm();
    renderProducts();
    renderDashboard();
    updateCounts();
    toast(editingId ? "Producto actualizado." : "Producto creado.");
    editingId = null;
  }

  function deleteProduct(id) {
    const p = catalog.products.find((x) => x.id === id);
    if (!p) return;
    if (!confirm('¿Eliminar "' + p.name + '"?\n\nEsta acción no se puede deshacer en este dispositivo.')) return;
    const snapshot = catalog.products.slice();
    catalog.products = catalog.products.filter((x) => x.id !== id);
    if (!saveCatalog()) {
      catalog.products = snapshot;
      toast("No se pudo guardar el cambio. Revisa el espacio del navegador.");
      return;
    }
    renderProducts();
    renderDashboard();
    updateCounts();
    toast("Producto eliminado.");
  }

  /* ======================================================================
     PEDIDOS
     ====================================================================== */
  function renderOrders() {
    const q = ($("#order-search").value || "").trim().toLowerCase();
    const status = $("#order-status-filter").value || "all";
    let orders = getOrders();
    if (q) orders = orders.filter((o) => (o.code + " " + (o.customer && o.customer.name) + " " + (o.customer && o.customer.phone)).toLowerCase().includes(q));
    if (status !== "all") orders = orders.filter((o) => o.status === status);

    $("#orders-list").innerHTML = orders.map((o) => {
      const c = o.customer || {};
      const pieces = (o.items || []).reduce((n, i) => n + Number(i.qty || 0), 0);
      return `
        <article class="order-card">
          <div class="order-card__head">
            <div><strong>${esc(o.code)}</strong><span>${new Date(o.date).toLocaleString("es-GT", { dateStyle: "medium", timeStyle: "short" })}</span></div>
            <span class="pill pill--${esc(o.status || "pendiente")}">${esc(STATUS[o.status] || "Pendiente")}</span>
          </div>
          <div class="order-card__body">
            <div><span>Cliente</span><strong>${esc(c.name || "Cliente")}</strong><small>${esc(c.phone || "")}</small></div>
            <div><span>Entrega</span><strong>${c.shipping === "retiro" ? "Retiro en Sipacapa" : esc(c.department || "—")}</strong><small>${esc(c.city || "")}</small></div>
            <div><span>Total</span><strong class="total-strong">${money(o.total)}</strong><small>${esc(o.payment && o.payment.label || "")}</small></div>
          </div>
          <div class="order-card__foot">
            <span>${pieces} ${pieces === 1 ? "pieza" : "piezas"} · ${esc(o.payment && o.payment.method || "")}</span>
            <button data-order="${esc(o.code)}">Ver detalle <svg class="ico"><use href="#a-arrow"/></svg></button>
          </div>
        </article>`;
    }).join("");

    $("#orders-empty").hidden = orders.length > 0;
    updateCounts();
  }

  function openOrder(code) {
    const o = getOrders().find((x) => x.code === code);
    if (!o) return;
    currentOrderCode = code;
    const c = o.customer || {};
    $("#order-modal-title").textContent = o.code;

    const rows = (o.items || []).map((it) => `
      <tr>
        <td>${esc(it.name)}${it.size ? `<small>Talla ${esc(it.size)}</small>` : ""}</td>
        <td>${it.qty}</td>
        <td>${money(it.price)}</td>
        <td>${money(Number(it.price) * Number(it.qty))}</td>
      </tr>`).join("");

    $("#order-detail").innerHTML = `
      <div class="order-detail__top">
        <div><strong>${esc(o.code)}</strong><span>${new Date(o.date).toLocaleString("es-GT")}</span></div>
        <span class="pill pill--${esc(o.status || "pendiente")}">${esc(STATUS[o.status] || "Pendiente")}</span>
      </div>
      <div class="order-detail__grid">
        <div class="order-detail__block">
          <h4>Cliente</h4>
          <p><strong>${esc(c.name || "—")}</strong><br>${esc(c.phone || "")}${c.email ? "<br>" + esc(c.email) : ""}</p>
        </div>
        <div class="order-detail__block">
          <h4>Entrega</h4>
          <p>${c.shipping === "retiro" ? "Retiro en Sipacapa, San Marcos" : `${esc(c.department || "")} · ${esc(c.city || "")}<br>${esc(c.address || "")}${c.reference ? "<br>Ref. " + esc(c.reference) : ""}`}</p>
        </div>
        <div class="order-detail__block">
          <h4>Pago</h4>
          <p>${esc(o.payment && o.payment.label || "—")}<br><span style="color:var(--muted)">${esc(o.payment && o.payment.status || "")}</span></p>
        </div>
        <div class="order-detail__block">
          <h4>Notas</h4>
          <p>${c.notes ? esc(c.notes) : "Sin notas."}</p>
        </div>
      </div>
      <table class="order-items">
        <thead><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="order-totals">
        <div><span>Subtotal</span><strong>${money(o.subtotal)}</strong></div>
        <div><span>Envío</span><strong>${Number(o.shipping) === 0 ? "Gratis" : money(o.shipping)}</strong></div>
        ${o.cod ? `<div><span>Contra entrega</span><strong>${money(o.cod)}</strong></div>` : ""}
        <div class="order-total"><span>Total</span><strong>${money(o.total)}</strong></div>
      </div>
      <p class="order-note">Pedido <b>${esc(o.code)}</b> · Registrado desde la tienda web el ${new Date(o.date).toLocaleDateString("es-GT")}. El resumen también se envió al WhatsApp del taller.</p>`;

    const sel = $("#order-status-select");
    sel.innerHTML = Object.keys(STATUS).map((k) => `<option value="${k}"${o.status === k ? " selected" : ""}>${STATUS[k]}</option>`).join("");

    const ownerMsg = orderMessage(o);
    $("#btn-order-wa").href = waUrl(ownerMsg);
    const phone = digits(c.phone);
    const fullPhone = phone.length === 8 ? "502" + phone : phone;
    const customerBtn = $("#btn-order-customer");
    if (fullPhone.length >= 8) {
      customerBtn.href = "https://wa.me/" + fullPhone + "?text=" + encodeURIComponent("Hola " + (c.name || "") + ", te escribimos de Trajes La Tendencia sobre tu pedido " + o.code + ". ¡Gracias!");
      customerBtn.style.display = "";
    } else {
      customerBtn.style.display = "none";
    }

    $("#order-modal").classList.add("is-open");
    $("#order-modal").setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeOrder() {
    $("#order-modal").classList.remove("is-open");
    $("#order-modal").setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    currentOrderCode = null;
  }

  function updateOrderStatus() {
    if (!currentOrderCode) return;
    const status = $("#order-status-select").value;
    const list = getOrders();
    const o = list.find((x) => x.code === currentOrderCode);
    if (!o) return;
    o.status = status;
    saveOrders(list);
    renderOrders();
    renderDashboard();
    $("#order-modal-title").textContent = currentOrderCode;
    toast("Estado actualizado a " + STATUS[status] + ".");
    closeOrder();
  }

  function orderMessage(o) {
    const c = o.customer || {};
    const lines = [];
    lines.push("*PEDIDO · TRAJES LA TENDENCIA*");
    lines.push("Código: " + o.code);
    lines.push("Fecha: " + new Date(o.date).toLocaleString("es-GT"));
    lines.push("Estado: " + (STATUS[o.status] || "Pendiente"));
    lines.push("");
    lines.push("*Cliente*");
    lines.push("Nombre: " + (c.name || ""));
    lines.push("Teléfono: " + (c.phone || ""));
    if (c.email) lines.push("Correo: " + c.email);
    lines.push("");
    lines.push("*Entrega*");
    if (c.shipping === "retiro") lines.push("Retiro en Sipacapa, San Marcos");
    else {
      lines.push((c.department || "") + " · " + (c.city || ""));
      lines.push(c.address || "");
      if (c.reference) lines.push("Referencia: " + c.reference);
    }
    if (c.notes) lines.push("Notas: " + c.notes);
    lines.push("");
    lines.push("*Productos*");
    (o.items || []).forEach((it) => {
      lines.push(it.qty + " × " + it.name + (it.size ? " · Talla " + it.size : "") + " — " + money(Number(it.price) * Number(it.qty)));
    });
    lines.push("");
    lines.push("Subtotal: " + money(o.subtotal));
    lines.push("Envío: " + (Number(o.shipping) === 0 ? "Gratis" : money(o.shipping)));
    if (o.cod) lines.push("Contra entrega: " + money(o.cod));
    lines.push("*TOTAL: " + money(o.total) + "*");
    lines.push("Pago: " + (o.payment && o.payment.label || "—"));
    return lines.join("\n");
  }

  function waUrl(msg) {
    const number = digits(catalog.brand.whatsapp || "50233451029");
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(msg);
  }

  /* ======================================================================
     AJUSTES
     ====================================================================== */
  function updateWaPreview() {
    const input = $("#set-whatsapp");
    const out = $("#wa-preview");
    if (!input || !out) return;
    const n = digits(input.value);
    const err = $("#wa-error");
    if (err) err.textContent = "";
    input.classList.remove("is-error");
    if (!n) {
      out.style.color = "";
      out.textContent = "Escribe el número con código de país. Ejemplo: 50233451029.";
      return;
    }
    const ok = n.length >= 8 && n.length <= 15;
    out.style.color = ok ? "" : "var(--magenta)";
    if (ok) {
      out.innerHTML = 'Enlace de prueba: <a href="https://wa.me/' + n + '" target="_blank" rel="noopener">wa.me/' + n + "</a>";
    } else {
      out.textContent = "Número incompleto: " + n.length + " dígitos. Debe tener entre 8 y 15, con código de país.";
    }
  }

  function fillSettings() {
    const b = catalog.brand, s = catalog.settings;
    $("#set-name").value = b.name || "";
    $("#set-whatsapp").value = b.whatsapp || "";
    $("#set-phone").value = b.phone || "";
    $("#set-email").value = b.email || "";
    $("#set-address").value = b.address || "";
    $("#set-facebook").value = b.facebook || "";
    $("#set-free").value = s.freeShippingFrom != null ? s.freeShippingFrom : 600;
    $("#set-cod").value = s.codFee != null ? s.codFee : 15;
    $("#set-ship-local").value = s.shippingLocal != null ? s.shippingLocal : 25;
    $("#set-ship-national").value = s.shippingNational != null ? s.shippingNational : 60;
    $("#set-bank").value = (s.bank && s.bank.bank) || "";
    $("#set-account").value = (s.bank && s.bank.account) || "";
    $("#set-holder").value = (s.bank && s.bank.holder) || "";
    $("#set-account-type").value = (s.bank && s.bank.type) || "";
    updateWaPreview();
    updateDataInfo();
  }

  function saveSettings(e) {
    e.preventDefault();
    const wa = digits($("#set-whatsapp").value);
    const waError = $("#wa-error");
    if (wa.length < 8 || wa.length > 15) {
      waError.textContent = "El número de WhatsApp debe tener entre 8 y 15 dígitos, con código de país (ej. 50233451029).";
      $("#set-whatsapp").classList.add("is-error");
      $("#set-whatsapp").focus();
      return;
    }
    $("#set-whatsapp").classList.remove("is-error");
    waError.textContent = "";
    catalog.brand.name = $("#set-name").value.trim() || catalog.brand.name;
    catalog.brand.whatsapp = wa;
    catalog.brand.phone = $("#set-phone").value.trim();
    catalog.brand.email = $("#set-email").value.trim();
    catalog.brand.address = $("#set-address").value.trim();
    catalog.brand.facebook = $("#set-facebook").value.trim();
    catalog.settings.freeShippingFrom = money0($("#set-free").value);
    catalog.settings.codFee = money0($("#set-cod").value);
    catalog.settings.shippingLocal = money0($("#set-ship-local").value);
    catalog.settings.shippingNational = money0($("#set-ship-national").value);
    catalog.settings.bank = {
      bank: $("#set-bank").value.trim(),
      account: $("#set-account").value.trim(),
      holder: $("#set-holder").value.trim(),
      type: $("#set-account-type").value.trim()
    };
    if (saveCatalog()) toast("Ajustes guardados.");
    else toast("No se pudieron guardar los ajustes. Revisa el espacio del navegador.");
    updateDataInfo();
  }

  async function changePassword() {
    const err = $("#pass-error");
    err.textContent = "";
    const cur = $("#set-pass-current").value;
    const next = $("#set-pass-new").value;
    const confirm = $("#set-pass-confirm").value;
    if (!cur || !next || !confirm) { err.textContent = "Completa los tres campos."; return; }
    if (next.length < 6) { err.textContent = "La nueva clave debe tener al menos 6 caracteres."; return; }
    if (next !== confirm) { err.textContent = "Las claves nuevas no coinciden."; return; }
    const stored = await storedHash();
    const attempt = await sha256(cur);
    if (attempt !== stored) { err.textContent = "La clave actual no es correcta."; return; }
    const h = await sha256(next);
    try { localStorage.setItem(KEYS.hash, h); } catch (e) { err.textContent = "No se pudo guardar la clave."; return; }
    $("#set-pass-current").value = "";
    $("#set-pass-new").value = "";
    $("#set-pass-confirm").value = "";
    toast("Clave actualizada. Úsala la próxima vez.");
  }

  function updateDataInfo() {
    const info = $("#data-info");
    if (!info) return;
    let bytes = 0;
    try { bytes = new Blob([JSON.stringify(catalog)]).size; } catch (e) {}
    const imgs = catalog.products.filter((p) => (p.images || []).some((src) => String(src).startsWith("data:"))).length;
    const orders = getOrders().length;
    info.textContent = "Catálogo: " + catalog.products.length + " productos · " + imgs + " con fotos subidas · ~" + Math.round(bytes / 1024) + " KB · Pedidos guardados: " + orders + ".";
  }

  /* ---------- Exportar / importar ---------- */
  function download(filename, text, mime) {
    const blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function exportCatalogJS() {
    const header = "/* ============================================================\n" +
      "   TRAJES LA TENDENCIA · Catálogo publicado\n" +
      "   Exportado desde el panel el " + new Date().toLocaleString("es-GT") + "\n" +
      "   Reemplaza este archivo en js/data.js de tu hosting.\n" +
      "   Las fotos subidas viajan incluidas como datos embebidos.\n" +
      "   ============================================================ */\n";
    // Nueva revisión: hace que los navegadores que ya visitaron el sitio
    // abandonen su copia vieja y muestren este catálogo.
    const out = clone(catalog);
    out.revision = Math.max(Date.now(), Number(catalog.revision || 0) + 1);
    catalog.revision = out.revision;
    saveCatalog();
    download("data.js", header + "window.LT_DATA = " + JSON.stringify(out, null, 2) + ";\n", "application/javascript;charset=utf-8");
    updateDataInfo();
    toast("data.js descargado. Reemplázalo en la carpeta js/ del sitio.");
  }

  function exportJSON() {
    const d = new Date();
    const stamp = d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    download("respaldo-la-tendencia-" + stamp + ".json", JSON.stringify(catalog, null, 2), "application/json;charset=utf-8");
    toast("Respaldo JSON descargado.");
  }

  async function importFile(file) {
    if (!file) return;
    try {
      const text = await file.text();
      let data = null;
      try { data = JSON.parse(text); }
      catch (e) {
        const start = text.indexOf("{");
        const end = text.lastIndexOf("}");
        if (start < 0 || end <= start) throw new Error("Formato no reconocido");
        data = JSON.parse(text.slice(start, end + 1));
      }
      if (!data || !Array.isArray(data.products)) throw new Error("El archivo no contiene un catálogo válido");
      if (!confirm("Se reemplazará el catálogo actual por el archivo importado.\n\n¿Deseas continuar?")) return;
      catalog = {
        version: data.version || 1,
        revision: Math.max(Number(data.revision || 0), Date.now()),
        brand: Object.assign({}, BASE.brand, data.brand || {}),
        settings: Object.assign({}, BASE.settings, data.settings || {}),
        categories: data.categories || clone(BASE.categories),
        products: data.products,
        testimonials: data.testimonials || clone(BASE.testimonials || [])
      };
      if (!saveCatalog()) { toast("El archivo es demasiado grande para este navegador."); return; }
      renderAll();
      toast("Catálogo importado: " + catalog.products.length + " productos.");
    } catch (e) {
      toast("No se pudo importar: " + e.message);
    } finally {
      $("#import-file").value = "";
    }
  }

  function resetCatalog() {
    if (!confirm("Se borrarán los cambios locales de productos y ajustes, y se restaurará el catálogo de ejemplo.\n\n¿Continuar?")) return;
    catalog = loadCatalogFrom(BASE);
    saveCatalog();
    renderAll();
    toast("Catálogo restaurado al ejemplo original.");
  }
  function loadCatalogFrom(src) {
    return {
      version: src.version || 1,
      revision: Number(src.revision || 0),
      brand: Object.assign({}, BASE.brand, src.brand || {}),
      settings: Object.assign({}, BASE.settings, src.settings || {}),
      categories: src.categories || clone(BASE.categories),
      products: src.products || [],
      testimonials: src.testimonials || clone(BASE.testimonials || [])
    };
  }

  function clearOrders() {
    if (!confirm("Se borrará todo el historial de pedidos de este navegador.\n\n¿Continuar?")) return;
    try { localStorage.removeItem(KEYS.orders); } catch (e) {}
    renderOrders();
    renderDashboard();
    toast("Historial de pedidos borrado.");
  }

  /* ======================================================================
     EVENTOS
     ====================================================================== */
  function bind() {
    $("#btn-logout").addEventListener("click", logout);
    $("#btn-open-sidebar").addEventListener("click", openSidebar);
    $("#btn-close-sidebar").addEventListener("click", closeSidebar);
    $("#sidebar-overlay").addEventListener("click", closeSidebar);

    $$("[data-view-link]").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.viewLink)));
    $$("[data-go]").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.go)));

    $("#btn-new-product").addEventListener("click", () => openProductForm());
    $("#btn-new-product-2").addEventListener("click", () => openProductForm());
    $("#btn-fab-new").addEventListener("click", () => openProductForm());
    $("#quick-product").addEventListener("click", (e) => { e.stopPropagation(); openProductForm(); });

    // Productos
    $("#product-search").addEventListener("input", renderProducts);
    $("#product-filter-cat").addEventListener("change", renderProducts);
    $("#product-filter-status").addEventListener("change", renderProducts);
    $("#products-tbody").addEventListener("click", (e) => {
      const ed = e.target.closest("[data-edit]");
      if (ed) { openProductForm(ed.dataset.edit); return; }
      const del = e.target.closest("[data-del]");
      if (del) deleteProduct(del.dataset.del);
    });

    // Formulario producto
    $("#product-form").addEventListener("submit", saveProduct);
    $("#pf-drop").addEventListener("click", (e) => {
      if (e.target && e.target.id === "pf-file") return;
      $("#pf-file").click();
    });
    $("#pf-file").addEventListener("change", (e) => addFiles(e.target.files));
    ["dragenter", "dragover"].forEach((ev) => $("#pf-drop").addEventListener(ev, (e) => {
      e.preventDefault(); $("#pf-drop").classList.add("is-drag");
    }));
    ["dragleave", "drop"].forEach((ev) => $("#pf-drop").addEventListener(ev, (e) => {
      e.preventDefault(); $("#pf-drop").classList.remove("is-drag");
    }));
    $("#pf-drop").addEventListener("drop", (e) => { if (e.dataTransfer) addFiles(e.dataTransfer.files); });
    $("#pf-images").addEventListener("click", (e) => {
      const b = e.target.closest("[data-img-del]");
      if (!b) return;
      draftImages.splice(Number(b.dataset.imgDel), 1);
      renderDraftImages();
    });

    // Pedidos
    $("#order-search").addEventListener("input", renderOrders);
    $("#order-status-filter").addEventListener("change", renderOrders);
    $("#orders-list").addEventListener("click", (e) => {
      const b = e.target.closest("[data-order]");
      if (b) openOrder(b.dataset.order);
    });
    $("#recent-orders").addEventListener("click", (e) => {
      const row = e.target.closest("[data-order]");
      if (row) openOrder(row.dataset.order);
    });
    $("#btn-order-save").addEventListener("click", updateOrderStatus);

    // Ajustes
    $("#settings-form").addEventListener("submit", saveSettings);
    $("#set-whatsapp").addEventListener("input", updateWaPreview);
    $("#btn-change-pass").addEventListener("click", changePassword);
    $("#btn-export-js").addEventListener("click", exportCatalogJS);
    $("#btn-export-json").addEventListener("click", exportJSON);
    $("#btn-import").addEventListener("click", () => $("#import-file").click());
    $("#import-file").addEventListener("change", (e) => importFile(e.target.files[0]));
    $("#btn-reset-catalog").addEventListener("click", resetCatalog);
    $("#btn-clear-orders").addEventListener("click", clearOrders);

    // Modales
    $$(".modal").forEach((m) => {
      m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) { closeProductForm(); closeOrder(); } });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      closeProductForm(); closeOrder(); closeSidebar();
    });

    // Fecha
    $("#login-year").textContent = new Date().getFullYear();
  }

  /* ---------- Inicio ---------- */
  function init() {
    bindLogin();
    bind();
    // Asegura la clave inicial en segundo plano.
    storedHash().catch(() => {});
    if (session.get()) showApp();
    else showLogin();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
