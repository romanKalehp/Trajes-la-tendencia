/* ==========================================================================
   TRAJES LA TENDENCIA · Lógica de la tienda
   Carrito, checkout, pedidos y notificación por WhatsApp.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Utilidades ---------- */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const money = (n) => "Q" + Number(n || 0).toLocaleString("es-GT", { maximumFractionDigits: 0 });
  const digits = (s) => String(s || "").replace(/\D/g, "");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  const store = {
    get(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
      catch (e) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (e) { return false; }
    }
  };

  const KEYS = {
    catalog: "lt_catalog_v1",
    cart: "lt_cart_v1",
    orders: "lt_orders_v1",
    newsletter: "lt_newsletter_v1"
  };

  /* ---------- Catálogo ---------- */
  const BASE = window.LT_DATA;
  const saved = store.get(KEYS.catalog, null);
  const baseRev = Number(BASE.revision || 0);
  const savedRev = saved ? Number(saved.revision || 0) : -1;
  // Si el data.js publicado es más nuevo que la copia local, gana el publicado.
  const useSaved = !!(saved && Array.isArray(saved.products) && savedRev >= baseRev);
  const catalog = useSaved ? saved : clone(BASE);
  const brand = Object.assign({}, BASE.brand, catalog.brand || {});
  const settings = Object.assign({}, BASE.settings, catalog.settings || {});
  const products = catalog.products || [];
  const categories = catalog.categories || BASE.categories;

  const byId = (id) => products.find((p) => p.id === id);
  const catName = (id) => (categories.find((c) => c.id === id) || {}).name || "Colección";

  /* ---------- WhatsApp ---------- */
  const waNumber = digits(brand.whatsapp || "50233451029");
  const waUrl = (msg) => "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(msg || "Hola, vengo de la página web de Trajes La Tendencia y me gustaría más información.");
  const defaultWaMsg = "Hola, vengo de la página web de Trajes La Tendencia y me gustaría más información.";
  function refreshWaLinks() {
    $$("[data-wa-link]").forEach((a) => {
      a.href = waUrl(a.dataset.waMessage || defaultWaMsg);
      a.target = "_blank";
      a.rel = "noopener";
    });
  }
  function refreshBrandText() {
    $$("[data-brand-phone]").forEach((el) => { el.textContent = brand.phone || ""; });
  }

  /* ---------- Estado ---------- */
  let cart = store.get(KEYS.cart, []).filter((it) => byId(it.id));
  let activeFilter = "all";
  let currentProduct = null;
  let currentSize = null;
  let qty = 1;
  let checkoutStep = 1;
  let pendingOrder = null;
  let cardPaid = false;
  const SIZES_ORDER = ["XS", "S", "M", "L", "XL"];

  /* ---------- Toasts ---------- */
  let toastTimer = null;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-show"), 3200);
  }

  /* ---------- Bloqueo de scroll ---------- */
  function lockBody() { document.body.classList.add("no-scroll"); }
  function unlockBody() {
    const anyOpen = $(".modal.is-open") || $("#cart-drawer.is-open") || $("#search-panel.is-open") || $("#mobile-nav.is-open");
    if (!anyOpen) document.body.classList.remove("no-scroll");
  }

  /* ======================================================================
     RENDER DE CATEGORÍAS Y PRODUCTOS
     ====================================================================== */
  function renderCategories() {
    const grid = $("#category-grid");
    grid.innerHTML = categories.map((c) => {
      const n = products.filter((p) => p.active !== false && p.category === c.id).length;
      return `
        <a class="category-card" href="#coleccion" data-filter="${c.id}">
          <img src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy">
          <span class="category-card__body">
            <h3>${esc(c.name)}</h3>
            <p>${esc(c.desc || "")} · ${n} piezas</p>
          </span>
          <span class="category-card__arrow"><svg class="ico"><use href="#i-arrow"/></svg></span>
        </a>`;
    }).join("");
  }

  function badgeFor(p) {
    if (p.stock === 0) return '<span class="badge">Agotado</span>';
    if (p.compareAt > p.price) return '<span class="badge badge--sale">Oferta</span>';
    if (p.badge) return '<span class="badge' + (p.badge.toLowerCase().includes("nuevo") ? "" : " badge--gold") + '">' + esc(p.badge) + "</span>";
    return "";
  }

  function cardHTML(p) {
    const soldOut = p.stock === 0;
    const colors = (p.colors || []).slice(0, 4).map((c) => `<span class="dot" style="background:${esc(c.hex)}" title="${esc(c.name)}"></span>`).join("");
    return `
      <article class="product-card">
        <div class="product-card__media">
          ${badgeFor(p)}
          <a href="#coleccion" data-open-product="${esc(p.id)}" aria-label="Ver ${esc(p.name)}">
            <img src="${esc((p.images || [])[0] || "")}" alt="${esc(p.name)}" loading="lazy" width="800" height="1000">
          </a>
          ${soldOut ? "" : `<button class="quick-add" data-open-product="${esc(p.id)}" aria-label="Agregar ${esc(p.name)} al carrito"><svg class="ico"><use href="#i-plus"/></svg></button>`}
        </div>
        <div class="product-card__info">
          <p class="product-card__cat">${esc(catName(p.category))}</p>
          <h3 class="product-card__name"><a href="#coleccion" data-open-product="${esc(p.id)}">${esc(p.name)}</a></h3>
          <div class="product-card__price">
            <strong>${money(p.price)}</strong>
            ${p.compareAt > p.price ? `<s>${money(p.compareAt)}</s>` : ""}
          </div>
          ${colors ? `<div class="product-card__colors">${colors}</div>` : ""}
          ${!soldOut && p.stock <= 3 ? `<p class="product-card__stock">Últimas ${p.stock} piezas</p>` : ""}
          ${soldOut ? '<p class="product-card__stock">Agotado · pregúntanos por encargo</p>' : ""}
        </div>
      </article>`;
  }

  function renderFeatured() {
    const list = products.filter((p) => p.active !== false && p.featured).slice(0, 4);
    $("#featured-grid").innerHTML = list.map(cardHTML).join("");
  }

  function renderProducts() {
    let list = products.filter((p) => p.active !== false);
    if (activeFilter !== "all") list = list.filter((p) => p.category === activeFilter);
    const q = ($("#search-input") && $("#search-input").value || "").trim().toLowerCase();
    if (q.length > 1) {
      list = list.filter((p) => (p.name + " " + p.desc + " " + catName(p.category)).toLowerCase().includes(q));
    }
    const sort = $("#sort-select") ? $("#sort-select").value : "featured";
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "es"));
    else list.sort((a, b) => Number(b.featured) - Number(a.featured));

    $("#product-grid").innerHTML = list.map(cardHTML).join("");
    $("#product-count").textContent = list.length + (list.length === 1 ? " pieza" : " piezas");
    $("#empty-state").hidden = list.length !== 0;
  }

  function setFilter(filter) {
    activeFilter = filter;
    $$("#filters .filter").forEach((b) => {
      const on = b.dataset.filter === filter;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", String(on));
    });
    renderProducts();
  }

  /* ======================================================================
     MODAL DE PRODUCTO
     ====================================================================== */
  function openProduct(id) {
    const p = byId(id);
    if (!p) return;
    currentProduct = p;
    qty = 1;
    currentSize = (p.sizes || [])[0] || null;

    $("#pm-img").src = (p.images || [])[0] || "";
    $("#pm-img").alt = p.name;
    $("#pm-cat").textContent = catName(p.category);
    $("#pm-name").textContent = p.name;
    $("#pm-desc").textContent = p.desc || "";
    $("#pm-price").innerHTML = `<strong>${money(p.price)}</strong>${p.compareAt > p.price ? `<s>${money(p.compareAt)}</s>` : ""}`;

    const badge = $("#pm-badge");
    if (p.badge) { badge.hidden = false; badge.textContent = p.badge; } else badge.hidden = true;

    const sizesBox = $("#pm-sizes");
    sizesBox.innerHTML = (p.sizes || []).map((s, i) => `<button type="button" class="size${i === 0 ? " is-active" : ""}" data-size="${esc(s)}">${esc(s)}</button>`).join("");
    $("#pm-stock").textContent = p.stock > 0 ? (p.stock <= 3 ? "Últimas " + p.stock + " piezas" : "Disponible") : "Agotado";
    $("#pm-qty").value = 1;
    $("#pm-details").innerHTML = (p.details || []).map((d) => `<li>${esc(d)}</li>`).join("");
    updateProductWa();

    const addBtn = $("#pm-add");
    addBtn.disabled = p.stock === 0;
    addBtn.textContent = p.stock === 0 ? "Agotado" : "Añadir al carrito";

    $("#product-modal").classList.add("is-open");
    $("#product-modal").setAttribute("aria-hidden", "false");
    lockBody();
  }

  function closeProduct() {
    $("#product-modal").classList.remove("is-open");
    $("#product-modal").setAttribute("aria-hidden", "true");
    unlockBody();
  }

  function updateProductWa() {
    if (!currentProduct) return;
    const msg = `Hola, me interesa "${currentProduct.name}" (${money(currentProduct.price)})` +
      (currentSize ? ` en talla ${currentSize}` : "") +
      ". ¿Está disponible?";
    $("#pm-wa").href = waUrl(msg);
  }

  /* ======================================================================
     CARRITO
     ====================================================================== */
  function cartCount() { return cart.reduce((n, it) => n + it.qty, 0); }
  function cartSubtotal() {
    return cart.reduce((sum, it) => {
      const p = byId(it.id);
      return sum + (p ? p.price * it.qty : 0);
    }, 0);
  }

  function saveCart() { store.set(KEYS.cart, cart); }

  function addToCart(id, size, n) {
    const p = byId(id);
    if (!p) return;
    if (p.stock === 0) { toast("Esta pieza está agotada. Escríbenos por WhatsApp."); return; }
    const q = Math.max(1, Math.min(Number(n) || 1, p.stock));
    const found = cart.find((it) => it.id === id && it.size === size);
    if (found) found.qty = Math.min(found.qty + q, p.stock);
    else cart.push({ id: id, size: size || (p.sizes || [])[0] || "", qty: q });
    saveCart();
    renderCart();
    toast("Añadido al carrito · " + p.name);
    openCart();
  }

  function renderCart() {
    const box = $("#cart-items");
    const empty = cart.length === 0;
    $("#cart-drawer").classList.toggle("is-empty", empty);
    $("#cart-foot").hidden = empty;
    $("#cart-empty").style.display = empty ? "flex" : "none";

    box.innerHTML = cart.map((it, idx) => {
      const p = byId(it.id);
      if (!p) return "";
      return `
        <div class="cart-item">
          <img class="cart-item__img" src="${esc((p.images || [])[0] || "")}" alt="${esc(p.name)}">
          <div class="cart-item__body">
            <div class="cart-item__top">
              <div>
                <p class="cart-item__name">${esc(p.name)}</p>
                <p class="cart-item__meta">${it.size ? "Talla " + esc(it.size) + " · " : ""}${esc(catName(p.category))}</p>
              </div>
              <button class="cart-item__remove" data-remove="${idx}" aria-label="Quitar ${esc(p.name)}">
                <svg class="ico"><use href="#i-close"/></svg>
              </button>
            </div>
            <div class="cart-item__bottom">
              <div class="qty">
                <button class="qty__btn" data-qty="-1" data-idx="${idx}" aria-label="Quitar una unidad"><svg class="ico"><use href="#i-minus"/></svg></button>
                <input type="text" value="${it.qty}" data-qty-input="${idx}" aria-label="Cantidad" inputmode="numeric">
                <button class="qty__btn" data-qty="1" data-idx="${idx}" aria-label="Agregar una unidad"><svg class="ico"><use href="#i-plus"/></svg></button>
              </div>
              <span class="cart-item__price">${money(p.price * it.qty)}</span>
            </div>
          </div>
        </div>`;
    }).join("");

    const n = cartCount();
    $("#cart-count").textContent = n;
    $("#cart-count").classList.toggle("is-on", n > 0);
    $("#btn-cart").setAttribute("aria-label", "Abrir carrito, " + n + (n === 1 ? " artículo" : " artículos"));
    $("#cart-drawer-count").textContent = "(" + n + ")";
    $("#cart-subtotal").textContent = money(cartSubtotal());

    const threshold = Number(settings.freeShippingFrom) || 0;
    const missing = Math.max(0, threshold - cartSubtotal());
    $("#ship-note").textContent = missing > 0
      ? "Te faltan " + money(missing) + " para el envío gratis."
      : "¡Tenés envío gratis en este pedido!";
    $("#ship-bar").style.width = Math.min(100, threshold ? (cartSubtotal() / threshold) * 100 : 100) + "%";
  }

  function changeQty(idx, delta) {
    const it = cart[idx];
    if (!it) return;
    const p = byId(it.id);
    const next = it.qty + delta;
    if (next <= 0) { cart.splice(idx, 1); }
    else if (p && next > p.stock) { toast("Solo hay " + p.stock + " piezas disponibles."); return; }
    else it.qty = next;
    saveCart(); renderCart();
  }

  function openCart() {
    closeSearch();
    renderCart();
    $("#cart-drawer").classList.add("is-open");
    $("#cart-drawer").setAttribute("aria-hidden", "false");
    $("#drawer-overlay").hidden = false;
    requestAnimationFrame(() => $("#drawer-overlay").classList.add("is-on"));
    lockBody();
  }
  function closeCart() {
    $("#cart-drawer").classList.remove("is-open");
    $("#cart-drawer").setAttribute("aria-hidden", "true");
    $("#drawer-overlay").classList.remove("is-on");
    setTimeout(() => { if (!$("#cart-drawer").classList.contains("is-open")) $("#drawer-overlay").hidden = true; }, 320);
    unlockBody();
  }

  /* ======================================================================
     BUSCADOR
     ====================================================================== */
  function openSearch() {
    $("#search-panel").classList.add("is-open");
    $("#search-panel").setAttribute("aria-hidden", "false");
    lockBody();
    setTimeout(() => $("#search-input").focus(), 120);
    renderSearch("");
  }
  function closeSearch() {
    $("#search-panel").classList.remove("is-open");
    $("#search-panel").setAttribute("aria-hidden", "true");
    unlockBody();
  }
  function renderSearch(q) {
    const box = $("#search-results");
    const term = q.trim().toLowerCase();
    if (term.length < 2) { box.innerHTML = ""; return; }
    const list = products.filter((p) => p.active !== false && (p.name + " " + (p.desc || "") + " " + catName(p.category)).toLowerCase().includes(term)).slice(0, 6);
    box.innerHTML = list.length ? list.map((p) => `
      <a class="search-result" href="#coleccion" data-open-product="${esc(p.id)}">
        <img src="${esc((p.images || [])[0] || "")}" alt="">
        <span>
          <strong>${esc(p.name)}</strong>
          <span>${esc(catName(p.category))}</span>
          <b>${money(p.price)}</b>
        </span>
      </a>`).join("") : "";
    if (!list.length) box.innerHTML = '<p class="search-hint">No encontramos coincidencias. Escríbenos por WhatsApp y lo buscamos por ti.</p>';
  }

  /* ======================================================================
     CHECKOUT · DEPARTAMENTOS
     ====================================================================== */
  const DEPARTMENTS = ["Alta Verapaz", "Baja Verapaz", "Chimaltenango", "Chiquimula", "El Progreso", "Escuintla", "Guatemala", "Huehuetenango", "Izabal", "Jalapa", "Jutiapa", "Petén", "Quetzaltenango", "Quiché", "Retalhuleu", "Sacatepéquez", "San Marcos", "Santa Rosa", "Sololá", "Suchitepéquez", "Totonicapán", "Zacapa"];
  function fillDepartments() {
    const sel = $("#co-dept");
    if (!sel || sel.options.length > 1) return;
    DEPARTMENTS.forEach((d) => {
      const o = document.createElement("option");
      o.value = d; o.textContent = d;
      sel.appendChild(o);
    });
  }

  /* ======================================================================
     CHECKOUT · TOTALES
     ====================================================================== */
  function paymentValue() {
    const el = $('input[name="payment"]:checked');
    return el ? el.value : "transferencia";
  }
  function shippingMethod() {
    const el = $('input[name="shipping"]:checked');
    return el ? el.value : "domicilio";
  }
  function calcTotals() {
    const subtotal = cartSubtotal();
    const threshold = Number(settings.freeShippingFrom) || 0;
    let shipping = 0;
    if (shippingMethod() === "domicilio" && subtotal > 0 && (threshold === 0 || subtotal < threshold)) {
      const dept = ($("#co-dept") && $("#co-dept").value) || "";
      shipping = dept === "San Marcos" ? Number(settings.shippingLocal) || 0 : Number(settings.shippingNational) || 0;
    }
    const cod = paymentValue() === "contraentrega" ? (Number(settings.codFee) || 0) : 0;
    return { subtotal: subtotal, shipping: shipping, cod: cod, total: subtotal + shipping + cod };
  }

  function renderSummary() {
    const box = $("#co-items");
    box.innerHTML = cart.map((it) => {
      const p = byId(it.id);
      if (!p) return "";
      return `<div class="co-item">
        <img src="${esc((p.images || [])[0] || "")}" alt="">
        <div class="co-item__info">
          <strong>${esc(p.name)}</strong>
          <span>${it.size ? "Talla " + esc(it.size) + " · " : ""}x${it.qty}</span>
        </div>
        <span class="co-item__price">${money(p.price * it.qty)}</span>
      </div>`;
    }).join("");

    const t = calcTotals();
    $("#co-subtotal").textContent = money(t.subtotal);
    $("#co-shipping").textContent = t.shipping === 0 ? "Gratis" : money(t.shipping);
    $("#co-cod-row").hidden = t.cod === 0;
    $("#co-cod").textContent = money(t.cod);
    $("#co-total").textContent = money(t.total);

    const threshold = Number(settings.freeShippingFrom) || 0;
    $("#co-ship-note").textContent = (t.subtotal >= threshold && threshold > 0)
      ? "¡Envío gratis aplicado!"
      : "Envío gratis desde " + money(threshold) + ".";
    return t;
  }

  /* ======================================================================
     CHECKOUT · PASOS
     ====================================================================== */
  function resetCheckout() {
    checkoutStep = 1;
    cardPaid = false;
    $("#checkout-form").reset();
    $$("#checkout-form .field input, #checkout-form .field select").forEach((el) => el.classList.remove("is-error"));
    $("#form-error").textContent = "";
    $("#card-error").textContent = "";
    $("#co-dept").value = "";
    $("#transfer-box").hidden = false;
    $("#card-box").hidden = true;
    $("#address-fields").style.display = "";
    $("#co-actions").style.display = "";
    $$("#co-steps li").forEach((li) => li.classList.remove("is-done", "is-active"));
    showStep(1, true);
  }

  function showStep(n, force) {
    checkoutStep = n;
    $$(".step-panel").forEach((p) => p.classList.toggle("is-active", Number(p.dataset.panel) === n));
    $$("#co-steps li").forEach((li) => {
      const step = Number(li.dataset.stepDot);
      li.classList.toggle("is-active", step === n);
      li.classList.toggle("is-done", step < n);
    });
    $("#co-actions").style.display = n === 4 ? "none" : "";
    $("#co-back").hidden = n === 1;
    const next = $("#co-next");
    if (n === 3) next.innerHTML = 'Confirmar pedido <svg class="ico"><use href="#i-check"/></svg>';
    else next.innerHTML = 'Continuar <svg class="ico"><use href="#i-arrow"/></svg>';
    $(".checkout__form").scrollTop = 0;
    $(".checkout__body").scrollTop = 0;
    if (n === 3) renderSummary();
  }

  function markError(el, on) {
    if (!el) return;
    el.classList.toggle("is-error", !!on);
  }

  function validateStep(n) {
    $("#form-error").textContent = "";
    if (n === 1) {
      const name = $("#co-name"), phone = $("#co-phone"), email = $("#co-email");
      let ok = true;
      markError(name, name.value.trim().length < 3); if (name.value.trim().length < 3) ok = false;
      markError(phone, digits(phone.value).length < 8); if (digits(phone.value).length < 8) ok = false;
      const emailBad = email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      markError(email, emailBad); if (emailBad) ok = false;
      if (!ok) { $("#form-error").textContent = "Revisa los campos marcados para continuar."; return false; }
      return true;
    }
    if (n === 2) {
      if (shippingMethod() === "retiro") return true;
      const dept = $("#co-dept"), city = $("#co-city"), address = $("#co-address");
      let ok = true;
      markError(dept, !dept.value); if (!dept.value) ok = false;
      markError(city, city.value.trim().length < 2); if (city.value.trim().length < 2) ok = false;
      markError(address, address.value.trim().length < 5); if (address.value.trim().length < 5) ok = false;
      if (!ok) { $("#form-error").textContent = "Completa tu dirección de entrega."; return false; }
      return true;
    }
    if (n === 3) {
      if (!$("#co-consent").checked) {
        $("#form-error").textContent = "Necesitamos tu autorización para contactarte por WhatsApp.";
        return false;
      }
      if (paymentValue() === "tarjeta") {
        const err = validateCard();
        if (err) { $("#card-error").textContent = err; return false; }
        $("#card-error").textContent = "";
      }
      return true;
    }
    return true;
  }

  /* ---------- Tarjeta (demostración) ---------- */
  function luhn(num) {
    const s = digits(num);
    if (s.length < 13) return false;
    let sum = 0, alt = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let d = Number(s[i]);
      if (alt) { d *= 2; if (d > 9) d -= 9; }
      sum += d; alt = !alt;
    }
    return sum % 10 === 0;
  }
  function validateCard() {
    const num = $("#card-number").value;
    if (!luhn(num)) return "El número de tarjeta no es válido. Prueba con 4242 4242 4242 4242.";
    const exp = $("#card-exp").value.trim();
    const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(exp);
    if (!m) return "Usa el formato MM/AA para el vencimiento.";
    const month = Number(m[1]), year = 2000 + Number(m[2]);
    if (month < 1 || month > 12) return "El mes de vencimiento no es válido.";
    const now = new Date();
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return "La tarjeta está vencida.";
    if (digits($("#card-cvv").value).length < 3) return "El CVV debe tener 3 o 4 dígitos.";
    if ($("#card-name").value.trim().length < 3) return "Escribe el nombre como aparece en la tarjeta.";
    return "";
  }

  /* ======================================================================
     PEDIDO
     ====================================================================== */
  function orderCode() {
    const d = new Date();
    const ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    let rnd = "0000";
    if (window.crypto && crypto.getRandomValues) {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      rnd = String(a[0] % 10000).padStart(4, "0");
    } else {
      rnd = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    }
    return "LT-" + ymd + "-" + rnd;
  }

  function paymentLabel(method) {
    if (method === "tarjeta") return "Tarjeta de crédito/débito (aprobada en demo)";
    if (method === "contraentrega") return "Pago contra entrega";
    return "Transferencia bancaria";
  }

  function buildOrder() {
    const t = calcTotals();
    const method = paymentValue();
    return {
      code: orderCode(),
      date: new Date().toISOString(),
      source: "web",
      status: method === "tarjeta" ? "pagado" : "pendiente",
      payment: {
        method: method,
        label: paymentLabel(method),
        status: method === "tarjeta" ? "pagado" : (method === "transferencia" ? "esperando comprobante" : "por cobrar")
      },
      items: cart.map((it) => {
        const p = byId(it.id);
        return {
          id: it.id,
          name: p ? p.name : "Producto",
          size: it.size,
          qty: it.qty,
          price: p ? p.price : 0,
          image: p ? (p.images || [])[0] : ""
        };
      }),
      subtotal: t.subtotal,
      shipping: t.shipping,
      cod: t.cod,
      total: t.total,
      customer: {
        name: $("#co-name").value.trim(),
        phone: $("#co-phone").value.trim(),
        email: $("#co-email").value.trim(),
        shipping: shippingMethod(),
        department: $("#co-dept").value,
        city: $("#co-city").value.trim(),
        address: $("#co-address").value.trim(),
        reference: $("#co-reference").value.trim(),
        notes: $("#co-notes").value.trim()
      }
    };
  }

  function orderMessage(o) {
    const c = o.customer;
    const lines = [];
    lines.push("*NUEVO PEDIDO · TRAJES LA TENDENCIA*");
    lines.push("Código: " + o.code);
    lines.push("Fecha: " + new Date(o.date).toLocaleString("es-GT"));
    lines.push("");
    lines.push("*Cliente*");
    lines.push("Nombre: " + c.name);
    lines.push("Teléfono: " + c.phone);
    if (c.email) lines.push("Correo: " + c.email);
    lines.push("");
    lines.push("*Entrega*");
    if (c.shipping === "retiro") {
      lines.push("Retiro en Sipacapa, San Marcos");
    } else {
      lines.push(c.department + " · " + c.city);
      lines.push(c.address);
      if (c.reference) lines.push("Referencia: " + c.reference);
    }
    if (c.notes) lines.push("Notas: " + c.notes);
    lines.push("");
    lines.push("*Productos*");
    o.items.forEach((it) => {
      lines.push(it.qty + " × " + it.name + (it.size ? " · Talla " + it.size : "") + " — " + money(it.price * it.qty));
    });
    lines.push("");
    lines.push("Subtotal: " + money(o.subtotal));
    lines.push("Envío: " + (o.shipping === 0 ? "Gratis" : money(o.shipping)));
    if (o.cod) lines.push("Recargo contra entrega: " + money(o.cod));
    lines.push("*TOTAL: " + money(o.total) + "*");
    lines.push("Pago: " + o.payment.label);
    lines.push("");
    lines.push("Por favor confirmar disponibilidad y tiempo de entrega. ¡Gracias!");
    return lines.join("\n");
  }

  function saveOrder(o) {
    const orders = store.get(KEYS.orders, []);
    orders.unshift(o);
    const ok = store.set(KEYS.orders, orders.slice(0, 300));
    if (!ok) toast("El pedido se envió, pero no se pudo guardar en este dispositivo.");
    return ok;
  }

  function finalizeOrder(o) {
    saveOrder(o);
    cart = [];
    saveCart();
    renderCart();

    const waHref = waUrl(orderMessage(o));
    $("#success-wa").href = waHref;
    $("#success-code").textContent = o.code;
    $("#success-summary").innerHTML = `
      <div><span>Cliente</span><strong>${esc(o.customer.name)}</strong></div>
      <div><span>Productos</span><strong>${o.items.reduce((n, i) => n + i.qty, 0)} piezas</strong></div>
      <div><span>Pago</span><strong>${esc(o.payment.label)}</strong></div>
      <div><span>Total</span><strong>${money(o.total)}</strong></div>`;
    window.__ltLastOrder = o;

    showStep(4);
    checkoutStep = 4;

    // Abrir WhatsApp con el resumen (notificación instantánea al taller).
    try { window.open(waHref, "_blank", "noopener"); } catch (e) { /* popup bloqueado */ }
    toast("Pedido " + o.code + " registrado. Abriendo WhatsApp…");
  }

  function submitOrder() {
    if (!cart.length) { toast("Tu carrito está vacío."); return; }
    if (!validateStep(3)) return;
    const o = buildOrder();
    const method = paymentValue();

    if (method === "tarjeta") {
      // Simulación de pasarela de pago.
      const btn = $("#co-next");
      btn.disabled = true;
      btn.innerHTML = "Procesando pago…";
      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = 'Confirmar pedido <svg class="ico"><use href="#i-check"/></svg>';
        finalizeOrder(o);
      }, 1700);
    } else {
      finalizeOrder(o);
    }
  }

  /* ---------- Comprobante ---------- */
  function printReceipt() {
    const o = window.__ltLastOrder;
    if (!o) return;
    const rows = o.items.map((it) => `<tr><td>${esc(it.name)}${it.size ? "<br><small>Talla " + esc(it.size) + "</small>" : ""}</td><td>${it.qty}</td><td>${money(it.price * it.qty)}</td></tr>`).join("");
    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Comprobante ${esc(o.code)}</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;padding:28px;color:#241318;max-width:420px;margin:auto}
        h1{font-size:18px;margin:0 0 2px} .muted{color:#7C6B70;font-size:11px}
        hr{border:0;border-top:1px dashed #ccc;margin:14px 0}
        table{width:100%;border-collapse:collapse;font-size:12px} td{padding:5px 0;vertical-align:top}
        td:nth-child(2){text-align:center;width:30px} td:last-child{text-align:right;white-space:nowrap}
        .tot{font-size:14px;font-weight:bold}
        .cod{font-size:14px;letter-spacing:1px;font-weight:bold;text-align:center;margin:14px 0}
      </style></head><body>
      <h1>Trajes La Tendencia</h1>
      <p class="muted">Trajes y confecciones hechas a mano<br>Sipacapa, San Marcos · ${esc(brand.phone)}</p>
      <hr>
      <p><strong>Pedido:</strong> ${esc(o.code)}<br><strong>Fecha:</strong> ${new Date(o.date).toLocaleString("es-GT")}<br><strong>Cliente:</strong> ${esc(o.customer.name)}<br><strong>Teléfono:</strong> ${esc(o.customer.phone)}</p>
      <p class="muted">${o.customer.shipping === "retiro" ? "Retiro en Sipacapa" : esc(o.customer.department) + " · " + esc(o.customer.city) + "<br>" + esc(o.customer.address)}</p>
      <hr>
      <table>${rows}</table>
      <hr>
      <table>
        <tr><td>Subtotal</td><td></td><td>${money(o.subtotal)}</td></tr>
        <tr><td>Envío</td><td></td><td>${o.shipping === 0 ? "Gratis" : money(o.shipping)}</td></tr>
        ${o.cod ? `<tr><td>Contra entrega</td><td></td><td>${money(o.cod)}</td></tr>` : ""}
        <tr class="tot"><td>Total</td><td></td><td>${money(o.total)}</td></tr>
      </table>
      <p><strong>Pago:</strong> ${esc(o.payment.label)}</p>
      <p class="cod">${esc(o.code)}</p>
      <p class="muted">Gracias por apoyar el trabajo hecho a mano. Conserva este comprobante.</p>
      </body></html>`;
    const w = window.open("", "_blank", "width=460,height=700");
    if (!w) { toast("Permite las ventanas emergentes para descargar el comprobante."); return; }
    w.document.open(); w.document.write(html); w.document.close();
    w.focus();
    setTimeout(() => { try { w.print(); } catch (e) {} }, 350);
  }

  /* ======================================================================
     EVENTOS
     ====================================================================== */
  function bind() {
    // Filtros
    document.addEventListener("click", (e) => {
      const filterEl = e.target.closest("[data-filter]");
      if (filterEl) {
        if (filterEl.closest("#filters")) e.preventDefault();
        setFilter(filterEl.dataset.filter);
        return;
      }
      const openEl = e.target.closest("[data-open-product]");
      if (openEl) {
        e.preventDefault();
        closeSearch();
        openProduct(openEl.dataset.openProduct);
        return;
      }
    });

    $("#sort-select").addEventListener("change", renderProducts);

    // Carrito
    $("#btn-cart").addEventListener("click", openCart);
    $("#btn-close-cart").addEventListener("click", closeCart);
    $("#drawer-overlay").addEventListener("click", closeCart);
    $("#btn-empty-shop").addEventListener("click", closeCart);
    $("#cart-items").addEventListener("click", (e) => {
      const rm = e.target.closest("[data-remove]");
      if (rm) { cart.splice(Number(rm.dataset.remove), 1); saveCart(); renderCart(); return; }
      const qbtn = e.target.closest("[data-qty]");
      if (qbtn) changeQty(Number(qbtn.dataset.idx), Number(qbtn.dataset.qty));
    });
    $("#cart-items").addEventListener("change", (e) => {
      const inp = e.target.closest("[data-qty-input]");
      if (!inp) return;
      const idx = Number(inp.dataset.qtyInput);
      const it = cart[idx]; const p = it && byId(it.id);
      if (!it || !p) return;
      let v = Math.max(1, Math.min(Number(digits(inp.value)) || 1, p.stock));
      it.qty = v; saveCart(); renderCart();
    });

    // Buscador
    $("#btn-search").addEventListener("click", openSearch);
    $("#btn-close-search").addEventListener("click", closeSearch);
    $("#search-input").addEventListener("input", (e) => renderSearch(e.target.value));

    // Producto
    $("#product-modal").addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeProduct();
    });
    $("#pm-sizes").addEventListener("click", (e) => {
      const b = e.target.closest("[data-size]");
      if (!b) return;
      $$("#pm-sizes .size").forEach((x) => x.classList.remove("is-active"));
      b.classList.add("is-active");
      currentSize = b.dataset.size;
      updateProductWa();
    });
    $("#pm-minus").addEventListener("click", () => {
      qty = Math.max(1, qty - 1); $("#pm-qty").value = qty;
    });
    $("#pm-plus").addEventListener("click", () => {
      const max = currentProduct ? currentProduct.stock : 99;
      qty = Math.min(max || 99, qty + 1); $("#pm-qty").value = qty;
    });
    $("#pm-qty").addEventListener("change", (e) => {
      const max = currentProduct ? currentProduct.stock : 99;
      qty = Math.max(1, Math.min(Number(digits(e.target.value)) || 1, max || 1));
      e.target.value = qty;
    });
    $("#pm-add").addEventListener("click", () => {
      if (!currentProduct) return;
      addToCart(currentProduct.id, currentSize, qty);
      closeProduct();
    });

    // Checkout
    $("#btn-checkout").addEventListener("click", () => {
      if (!cart.length) { toast("Agrega una pieza primero."); return; }
      closeCart();
      resetCheckout();
      renderSummary();
      $("#checkout-modal").classList.add("is-open");
      $("#checkout-modal").setAttribute("aria-hidden", "false");
      lockBody();
    });
    $("#checkout-modal").addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) {
        $("#checkout-modal").classList.remove("is-open");
        $("#checkout-modal").setAttribute("aria-hidden", "true");
        unlockBody();
      }
    });
    $("#co-next").addEventListener("click", () => {
      if (checkoutStep < 3) {
        if (validateStep(checkoutStep)) showStep(checkoutStep + 1);
      } else if (checkoutStep === 3) {
        submitOrder();
      }
    });
    $("#co-back").addEventListener("click", () => { if (checkoutStep > 1) showStep(checkoutStep - 1); });
    $("#btn-print").addEventListener("click", printReceipt);

    $$('input[name="payment"]').forEach((r) => r.addEventListener("change", () => {
      const method = paymentValue();
      $("#transfer-box").hidden = method !== "transferencia";
      $("#card-box").hidden = method !== "tarjeta";
      renderSummary();
    }));
    $$('input[name="shipping"]').forEach((r) => r.addEventListener("change", () => {
      const pickup = shippingMethod() === "retiro";
      $("#address-fields").style.display = pickup ? "none" : "";
      renderSummary();
    }));
    $("#co-dept").addEventListener("change", renderSummary);
    $("#co-city").addEventListener("input", renderSummary);

    // Formato tarjeta
    $("#card-number").addEventListener("input", (e) => {
      let v = digits(e.target.value).slice(0, 16);
      e.target.value = v.replace(/(.{4})/g, "$1 ").trim();
    });
    $("#card-exp").addEventListener("input", (e) => {
      let v = digits(e.target.value).slice(0, 4);
      e.target.value = v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v;
    });
    $("#card-cvv").addEventListener("input", (e) => { e.target.value = digits(e.target.value).slice(0, 4); });

    // Menú móvil
    $("#btn-menu").addEventListener("click", () => {
      $("#mobile-nav").classList.add("is-open");
      $("#mobile-nav").setAttribute("aria-hidden", "false");
      lockBody();
    });
    $("#btn-close-menu").addEventListener("click", closeMobile);
    $("#mobile-nav").addEventListener("click", (e) => { if (e.target.closest("a")) closeMobile(); });

    function closeMobile() {
      $("#mobile-nav").classList.remove("is-open");
      $("#mobile-nav").setAttribute("aria-hidden", "true");
      unlockBody();
    }

    // Newsletter: guarda el correo y avisa al taller por WhatsApp.
    $("#newsletter-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = $("#newsletter-email");
      const feedback = $("#newsletter-msg");
      const email = input.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!ok) {
        feedback.textContent = "Escribe un correo válido para suscribirte.";
        feedback.classList.add("is-error");
        input.focus();
        return;
      }
      const list = store.get(KEYS.newsletter, []);
      if (!list.includes(email)) list.push(email);
      store.set(KEYS.newsletter, list);
      feedback.classList.remove("is-error");
      feedback.textContent = "¡Listo! Abrimos WhatsApp para confirmar tu suscripción. Si no se abrió, escríbenos al " + brand.phone + ".";
      input.value = "";
      try {
        window.open(waUrl("Hola, quiero recibir las novedades de Trajes La Tendencia. Mi correo es: " + email), "_blank", "noopener");
      } catch (err) { /* ventana bloqueada: el mensaje de arriba indica qué hacer */ }
    });

    // Escape global
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if ($("#checkout-modal").classList.contains("is-open")) {
        $("#checkout-modal").classList.remove("is-open");
        $("#checkout-modal").setAttribute("aria-hidden", "true");
      } else if ($("#product-modal").classList.contains("is-open")) closeProduct();
      else if ($("#search-panel").classList.contains("is-open")) closeSearch();
      else if ($("#cart-drawer").classList.contains("is-open")) closeCart();
      else if ($("#mobile-nav").classList.contains("is-open")) closeMobile();
      unlockBody();
    });

    // Abrir buscador con "/"
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        e.preventDefault(); openSearch();
      }
    });

    // Header scroll
    const header = $("#site-header");
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ======================================================================
     ANIMACIONES E INICIALIZACIÓN
     ====================================================================== */
  function initReveal() {
    const els = $$(".reveal");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => io.observe(el));
  }

  function initAnnouncements() {
    const items = $$("#announce-rotator .announce__item");
    if (items.length < 2) return;
    let i = 0;
    setInterval(() => {
      items[i].classList.remove("is-active");
      i = (i + 1) % items.length;
      items[i].classList.add("is-active");
    }, 4800);
  }

  function init() {
    fillDepartments();
    renderCategories();
    renderFeatured();
    renderProducts();
    renderCart();
    refreshWaLinks();
    refreshBrandText();
    bind();
    initReveal();
    initAnnouncements();
    $("#year").textContent = new Date().getFullYear();

    // Guarda una copia local del catálogo vigente.
    if (!useSaved) store.set(KEYS.catalog, clone(BASE));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
