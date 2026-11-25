/* ==========================================================
   DALAA BY AYA — shared storefront code
   Cart, product cards, search, drawers, newsletter, small details.
   Data lives in /data/settings.js and /data/products.js
   ========================================================== */
(function () {
  "use strict";
  var S = window.DALAA_SETTINGS || {};
  var P = window.DALAA_PRODUCTS || [];
  var CART_KEY = "dalaa_cart_v1";
  var D = (window.Dalaa = {});
  D.settings = S; D.products = P;

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  D.esc = esc; D.$ = $; D.$$ = $$;

  function money(n) { return "$" + Number(n).toFixed(2).replace(/\.00$/, ".00"); }
  function priceHTML(p) {
    if (p.price == null) return '<span class="price tbd">Price TBC</span>';
    return '<span class="price">' + money(p.price) + '<span class="cur">AUD</span></span>';
  }
  D.priceHTML = priceHTML; D.money = money;

  function byId(id) { return P.filter(function (p) { return p.id === id; })[0]; }
  function byColor(p, name) { return p.colors.filter(function (c) { return c.name === name; })[0]; }
  D.byId = byId;

  function totalStock(p) { var t = 0; p.colors.forEach(function (c) { Object.keys(c.stock || {}).forEach(function (k) { t += c.stock[k] || 0; }); }); return t; }
  function colorStock(c) { var t = 0; Object.keys(c.stock || {}).forEach(function (k) { t += c.stock[k] || 0; }); return t; }
  D.totalStock = totalStock;

  /* placeholder / photo */
  function tint(hex, pct) { return "background:color-mix(in srgb," + hex + " " + (pct || 38) + "%,#FFF8F1)"; }
  function ph(hex, label, cls, pct) {
    return '<div class="ph ' + (cls || "") + '" style="' + tint(hex || "#F7C6DA", pct) + '"><img class="ph-kiss" src="assets/img/kiss.png" alt=""><span class="ph-label">' + esc(label || "Your photo here") + "</span></div>";
  }
  function imgOrPh(p, color, i, cls, alt) {
    var src = color.images && color.images[i];
    if (src) return '<img class="photo ' + (cls || "") + '" src="' + esc(src) + '" alt="' + esc(alt || p.name) + '" loading="lazy">';
    return ph(color.hex, i === 0 ? "Product photo to come" : "Photo " + (i + 1) + " to come", cls, i === 0 ? 38 : 58);
  }
  D.ph = ph; D.imgOrPh = imgOrPh;

  /* ---------- toast ---------- */
  var toastT;
  function toast(msg) {
    var t = $("#toast"); if (!t) return;
    t.textContent = msg; t.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("on"); }, 2600);
  }
  D.toast = toast;

  /* ---------- cart ---------- */
  var cart = [];
  try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (e) { cart = []; }
  function save() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) {} }
  function stockFor(id, colorName, size) {
    var p = byId(id); if (!p) return 0; var c = byColor(p, colorName); if (!c) return 0;
    return (c.stock && c.stock[size]) || 0;
  }
  // drop anything that no longer exists, clamp to stock
  cart = cart.filter(function (l) { return stockFor(l.id, l.color, l.size) > 0; }).map(function (l) { l.qty = Math.min(l.qty, stockFor(l.id, l.color, l.size)); return l; });
  save();

  D.cart = {
    lines: function () { return cart; },
    count: function () { return cart.reduce(function (n, l) { return n + l.qty; }, 0); },
    qtyOf: function (id, color, size) { var l = cart.filter(function (x) { return x.id === id && x.color === color && x.size === size; })[0]; return l ? l.qty : 0; },
    add: function (id, color, size, qty) {
      qty = qty || 1;
      var max = stockFor(id, color, size);
      if (max < 1) return { ok: false, reason: "soldout" };
      var l = cart.filter(function (x) { return x.id === id && x.color === color && x.size === size; })[0];
      var have = l ? l.qty : 0;
      var next = Math.min(have + qty, max);
      if (next === have) return { ok: false, reason: "max" };
      if (l) l.qty = next; else cart.push({ id: id, color: color, size: size, qty: next });
      save(); render(); return { ok: true, capped: have + qty > max };
    },
    setQty: function (i, q) {
      var l = cart[i]; if (!l) return;
      var max = stockFor(l.id, l.color, l.size);
      if (q < 1) cart.splice(i, 1); else l.qty = Math.min(q, max);
      save(); render();
    },
    remove: function (i) { cart.splice(i, 1); save(); render(); }
  };

  /* ---------- layers (drawer / modal / panels) ---------- */
  var openEl = null, lastFocus = null;
  function openLayer(el) {
    closeLayers(true);
    lastFocus = document.activeElement; openEl = el;
    el.classList.add("open"); el.setAttribute("aria-hidden", "false");
    var s = $("#scrim"); if (s) s.classList.add("on");
    document.body.style.overflow = "hidden";
    var f = $("input,button,a,[tabindex]", el); setTimeout(function () { if (f) f.focus(); }, 60);
  }
  function closeLayers(quiet) {
    $$(".drawer.open,.modal.open,.search-panel.open").forEach(function (e) { e.classList.remove("open"); e.setAttribute("aria-hidden", "true"); });
    var s = $("#scrim"); if (s) s.classList.remove("on");
    document.body.style.overflow = "";
    if (!quiet && lastFocus && lastFocus.focus) lastFocus.focus();
    openEl = null;
  }
  D.openLayer = openLayer; D.closeLayers = closeLayers;
  D.openCart = function () { openLayer($("#cart")); };

  /* ---------- cart render ---------- */
  function render() {
    var n = D.cart.count();
    $$("[data-cart-count]").forEach(function (c) { c.textContent = n; c.setAttribute("data-n", n); c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); });
    var body = $("#cart-body"), foot = $("#cart-foot"); if (!body) return;
    if (!cart.length) {
      body.innerHTML = '<div class="cart-empty"><span class="script">Your bag is empty</span><p>Nothing here yet, gorgeous. Let\'s fix that.</p><a class="btn btn-primary" href="shop.html">Shop the collection</a></div>';
      foot.hidden = true; return;
    }
    foot.hidden = false;
    var unknown = false, sum = 0;
    body.innerHTML = cart.map(function (l, i) {
      var p = byId(l.id), c = byColor(p, l.color);
      if (p.price == null) unknown = true; else sum += p.price * l.qty;
      var media = (c.images && c.images[0]) ? '<img src="' + esc(c.images[0]) + '" alt="' + esc(p.name) + '">' : ph(c.hex, "", "");
      return '<div class="line" data-i="' + i + '">' + media +
        '<div><h3><a href="product.html?p=' + esc(p.slug) + '">' + esc(p.name) + '</a></h3>' +
        '<div class="vars">' + esc(c.name) + " · Size " + esc(l.size) + " · " + (p.price == null ? "Price TBC" : money(p.price)) + '</div>' +
        '<div class="ctl"><div class="qty" role="group" aria-label="Quantity"><button data-act="dec" aria-label="Decrease quantity">−</button><output>' + l.qty + '</output><button data-act="inc" aria-label="Increase quantity">+</button></div>' +
        '<button class="rm" data-act="rm">Remove</button></div></div></div>';
    }).join("");
    $("#cart-sub").textContent = unknown ? "TBC" : money(sum) + " AUD";
    $("#cart-note").textContent = (S.shipping && S.shipping.cartNote) || "";
    var off = !S.checkout || S.checkout.mode !== "shopify" || !S.checkout.shopifyCheckoutUrl;
    $("#cart-notice").hidden = !off;
    $("#cart-notice").textContent = off ? (S.checkout && S.checkout.offMessage) || "" : "";
    var cb = $("#checkout-btn"); cb.disabled = off; cb.textContent = off ? "Checkout opens soon" : "Checkout";
  }
  D.renderCart = render;

  /* ---------- product card ---------- */
  function firstAvailableColor(p) {
    for (var i = 0; i < p.colors.length; i++) if (colorStock(p.colors[i]) > 0) return i;
    return 0;
  }
  D.card = function (p) {
    var ci = firstAvailableColor(p), c = p.colors[ci], sold = totalStock(p) === 0;
    var tags = "";
    if (sold) tags += '<span class="tag sold">Sold out</span>';
    else if (p.badge) tags += '<span class="tag">' + esc(p.badge) + "</span>";
    if (p.placeholder) tags += '<span class="tag ph-flag">Placeholder</span>';
    var sw = p.colors.length > 1 ? '<div class="swatches" role="group" aria-label="Colours">' + p.colors.map(function (k, i) {
      return '<button class="sw" style="--c:' + esc(k.swatch || k.hex) + '" data-ci="' + i + '" aria-pressed="' + (i === ci) + '" aria-label="' + esc(k.name) + '" title="' + esc(k.name) + '"></button>';
    }).join("") + "</div>" : '<div class="swatches"><span class="sw" style="--c:' + esc(c.swatch || c.hex) + '" title="' + esc(c.name) + '"></span></div>';
    var no = String(Math.max(0, (window.DALAA_PRODUCTS || []).indexOf(p)) + 1).padStart(2, "0");
    return '<article class="card' + (p.placeholder ? " is-ph" : "") + '" data-id="' + esc(p.id) + '" data-ci="' + ci + '">' +
      '<div class="cm"><a class="card-media" href="product.html?p=' + esc(p.slug) + '" aria-label="' + esc(p.name) + '">' + tags +
      '<span class="media-alt">' + imgOrPh(p, c, 1, "alt") + "</span>" +
      '<span class="leaf"><span class="leaf-front"><span class="media-main">' + imgOrPh(p, c, 0, "main") + "</span>" +
      '<span class="cv-top"><span class="cv-mast">DALAA</span><span class="cv-by">by aya</span></span>' +
      '<span class="cv-no">No. ' + no + '</span><span class="cv-type">' + esc(p.type) + "</span></span>" +
      '<span class="leaf-back"></span></span></a>' +
      '<div class="quick">' + (sold ? '<button class="quick-btn" disabled>Sold out</button>' : '<button class="quick-btn" data-act="qa">Quick add</button>') + "</div></div>" +
      '<div class="card-info"><h3 class="card-name"><a href="product.html?p=' + esc(p.slug) + '">' + esc(p.name) + "</a></h3>" +
      '<div class="card-meta">' + priceHTML(p) + sw + "</div></div></article>";
  };
  /* Page turn: hover (or keyboard focus) turns the cover page; leaving turns it back. */
  function turn(card, on) {
    if (!card) return;
    var is = card.classList.contains("turned");
    if (on === is) return;
    card.classList.toggle("turned", on); card.classList.toggle("unturned", !on);
  }
  document.addEventListener("mouseover", function (e) { var c = e.target.closest && e.target.closest(".card"); if (c && window.matchMedia("(hover:hover)").matches) turn(c, true); });
  document.addEventListener("mouseout", function (e) { var c = e.target.closest && e.target.closest(".card"); if (c && !(e.relatedTarget && c.contains(e.relatedTarget))) turn(c, false); });
  document.addEventListener("focusin", function (e) { var c = e.target.closest && e.target.closest(".card"); if (c) turn(c, true); });
  document.addEventListener("focusout", function (e) { var c = e.target.closest && e.target.closest(".card"); if (c && !(e.relatedTarget && c.contains(e.relatedTarget))) turn(c, false); });
  /* On phones there is no hover, so each cover turns its page once as it scrolls into view. */
  (function () {
    if (!window.IntersectionObserver || !window.matchMedia || !matchMedia("(hover:none)").matches) return;
    var seen = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; seen.unobserve(e.target);
        var c = e.target; setTimeout(function () { turn(c, true); setTimeout(function () { turn(c, false); }, 2400); }, 500);
      });
    }, { threshold: 0.7 });
    function scan(root) { Array.prototype.forEach.call((root.querySelectorAll ? root.querySelectorAll(".card") : []), function (c) { if (!c.__w) { c.__w = 1; seen.observe(c); } }); }
    document.addEventListener("DOMContentLoaded", function () {
      scan(document);
      new MutationObserver(function (ms) { ms.forEach(function (m) { Array.prototype.forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) { if (n.classList.contains("card")) { if (!n.__w) { n.__w = 1; seen.observe(n); } } else scan(n); } }); }); }).observe(document.body, { childList: true, subtree: true });
    });
  })();

  function swapCardColor(card, ci) {
    var p = byId(card.dataset.id), c = p.colors[ci]; card.dataset.ci = ci;
    $(".media-main", card).innerHTML = imgOrPh(p, c, 0, "main");
    $(".media-alt", card).innerHTML = imgOrPh(p, c, 1, "alt");
    $$(".sw[data-ci]", card).forEach(function (b) { b.setAttribute("aria-pressed", String(+b.dataset.ci === ci)); });
    closeQA(card);
  }
  function closeQA(card) {
    var q = $(".quick", card); if (!q || !card.classList.contains("qa-open")) return;
    card.classList.remove("qa-open"); q.innerHTML = '<button class="quick-btn" data-act="qa">Quick add</button>';
  }
  function openQA(card) {
    $$(".card.qa-open").forEach(function (c) { if (c !== card) closeQA(c); });
    var p = byId(card.dataset.id), c = p.colors[+card.dataset.ci];
    card.classList.add("qa-open");
    $(".quick", card).innerHTML = '<div class="qa-panel"><p>Pick a size</p><div class="qa-sizes">' + p.sizes.map(function (s) {
      var n = (c.stock && c.stock[s]) || 0;
      return '<button class="chip" data-act="qa-size" data-size="' + esc(s) + '"' + (n < 1 ? " disabled" : "") + ">" + esc(s) + "</button>";
    }).join("") + "</div></div>";
  }

  /* ---------- global click handling ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act],[data-open],[data-close],.sw[data-ci]");
    if (!t) { $$(".pop.open").forEach(function (p) { if (!e.target.closest(".pop")) p.classList.remove("open"); }); return; }

    if (t.dataset.open) {
      var k = t.dataset.open;
      if (k === "cart") openLayer($("#cart"));
      else if (k === "search") { openLayer($("#search")); }
      else if (k === "sizeguide") openLayer($("#sizeguide"));
      else if (k === "account") { var pop = $("#account-pop"); pop.classList.toggle("open"); t.setAttribute("aria-expanded", pop.classList.contains("open")); }
      return;
    }
    if (t.dataset.close !== undefined) { closeLayers(); return; }

    var card = t.closest(".card");
    if (t.classList.contains("sw") && card) { swapCardColor(card, +t.dataset.ci); return; }
    var act = t.dataset.act;
    if (act === "qa" && card) openQA(card);
    else if (act === "qa-size" && card) {
      var p = byId(card.dataset.id), c = p.colors[+card.dataset.ci];
      var r = D.cart.add(p.id, c.name, t.dataset.size, 1);
      closeQA(card);
      if (r.ok) { toast("Added to your bag, gorgeous ♡"); openLayer($("#cart")); } else toast("That's all we have of that one ♡");
    }
    else if (act === "inc" || act === "dec" || act === "rm") {
      var line = t.closest(".line"); if (!line) return; var i = +line.dataset.i, l = cart[i];
      if (act === "rm") D.cart.remove(i);
      else { var before = l.qty; D.cart.setQty(i, l.qty + (act === "inc" ? 1 : -1)); if (act === "inc" && cart[i] && cart[i].qty === before) toast("That's every one we have ♡"); }
    }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeLayers(); var n = $("#nav"); if (n) n.classList.remove("open"); $$(".pop.open").forEach(function (p) { p.classList.remove("open"); }); } });

  /* ---------- search panel ---------- */
  function initSearch() {
    var inp = $("#search-input"), out = $("#search-results"); if (!inp) return;
    function run() {
      var q = inp.value.trim().toLowerCase();
      if (!q) { out.innerHTML = ""; return; }
      var hits = P.filter(function (p) { return (p.name + " " + p.type + " " + p.colors.map(function (c) { return c.name; }).join(" ")).toLowerCase().indexOf(q) > -1; }).slice(0, 8);
      out.innerHTML = hits.length ? hits.map(function (p) {
        var c = p.colors[firstAvailableColor(p)];
        return '<a href="product.html?p=' + esc(p.slug) + '">' + ((c.images && c.images[0]) ? '<img src="' + esc(c.images[0]) + '" alt="">' : ph(c.hex, "")) + "<span>" + esc(p.name) + "</span>" + priceHTML(p) + "</a>";
      }).join("") : '<p style="grid-column:1/-1">Nothing matches that yet, gorgeous. Try "dress" or "top".</p>';
    }
    inp.addEventListener("input", run);
    $("#search-form").addEventListener("submit", function (e) { e.preventDefault(); var q = inp.value.trim(); location.href = "shop.html" + (q ? "?q=" + encodeURIComponent(q) : ""); });
  }

  /* ---------- forms ---------- */
  function sendForm(form, endpoint, okMsg, msgEl) {
    var fd = new FormData(form);
    msgEl.textContent = "Sending…";
    fetch(endpoint, { method: "POST", body: fd, headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error("bad"); form.reset(); msgEl.textContent = okMsg; })
      .catch(function () { msgEl.textContent = "Hmm, that didn't go through. Please try again in a moment."; });
  }
  function initForms() {
    $$("form[data-newsletter]").forEach(function (f) {
      var msg = f.parentElement.querySelector(".form-msg") || f.nextElementSibling;
      f.addEventListener("submit", function (e) {
        e.preventDefault();
        var em = f.querySelector("input[type=email]");
        if (!em.value || !em.checkValidity()) { msg.textContent = "Please enter a valid email, gorgeous."; em.focus(); return; }
        if (S.newsletterEndpoint) sendForm(f, S.newsletterEndpoint, "You're on the list, gorgeous ♡", msg);
        else msg.textContent = "Signups aren't switched on yet, so we haven't saved your email. Follow along on Instagram in the meantime ♡";
      });
    });
    var cf = $("#contact-form");
    if (cf) cf.addEventListener("submit", function (e) {
      e.preventDefault(); var msg = $("#contact-msg"); var d = new FormData(cf);
      if (S.contactEndpoint) return sendForm(cf, S.contactEndpoint, "Message sent. We'll be in touch soon ♡", msg);
      if (S.contact && S.contact.email) {
        location.href = "mailto:" + S.contact.email + "?subject=" + encodeURIComponent("Message from " + d.get("name")) + "&body=" + encodeURIComponent(d.get("message") + "\n\n" + d.get("name") + " (" + d.get("email") + ")");
        msg.textContent = "Opening your email app…"; return;
      }
      msg.textContent = "The contact form isn't connected yet. For now, please send us a message on Instagram ♡";
    });
  }

  /* ---------- page chrome ---------- */
  function initChrome() {
    // announcement bar
    var a = $("#announce"), A = S.announcement || {};
    if (a) {
      if (A.enabled === false || !A.messages || !A.messages.length) a.hidden = true;
      else {
        var i = 0, el = $("span", a);
        var set = function () { var m = esc(A.messages[i % A.messages.length]); el.innerHTML = A.link ? '<a href="' + esc(A.link) + '">' + m + "</a>" : m; };
        set(); if (A.messages.length > 1) setInterval(function () { i++; set(); }, 5000);
      }
    }
    // photo slots
    $$("[data-slot]").forEach(function (el) {
      var src = S.images && S.images[el.dataset.slot];
      if (src) el.innerHTML = '<img class="photo" src="' + esc(src) + '" alt="' + esc(el.dataset.alt || "") + '" loading="lazy">';
    });
    // social + contact
    var C = S.contact || {};
    $$("[data-social=instagram]").forEach(function (x) { x.href = C.instagram || "#"; });
    $$("[data-social=tiktok]").forEach(function (x) { x.href = C.tiktok || "#"; });
    $$("[data-loc]").forEach(function (x) { x.textContent = C.location || "Melbourne, Australia"; });
    $$("[data-email]").forEach(function (x) { if (C.email) { x.href = "mailto:" + C.email; x.textContent = C.email; } else { x.textContent = "Email address to be added"; x.removeAttribute("href"); } });
    // size guide
    var sg = $("#sg-body");
    if (sg && S.sizeGuide) sg.innerHTML = '<p>' + esc(S.sizeGuide.note) + '</p><table class="sg"><thead><tr>' + S.sizeGuide.columns.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      S.sizeGuide.rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table><p style=\"font-size:14px\">Measurements in cm.</p>";
    // mobile nav
    var nav = $("#nav"), mb = $("#menu-btn");
    if (mb) {
      mb.addEventListener("click", function () { nav.classList.add("open"); mb.setAttribute("aria-expanded", "true"); document.body.style.overflow = "hidden"; });
      $("#nav-close").addEventListener("click", function () { nav.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); document.body.style.overflow = ""; });
    }
    // current page
    var here = location.pathname.split("/").pop() || "index.html";
    if (here === "product.html") here = "shop.html";
    $$("#nav a").forEach(function (l) { if (l.getAttribute("href") === here) l.setAttribute("aria-current", "page"); });
    // scroll reveal
    document.documentElement.classList.remove("no-js");
    var rv = $$(".rv");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });
      rv.forEach(function (x) { io.observe(x); });
    } else rv.forEach(function (x) { x.classList.add("in"); });
    $("#scrim").addEventListener("click", function () { closeLayers(); });
  }
  D.reveal = function (root) { $$(".rv", root).forEach(function (x) { x.classList.add("in"); }); };

  document.addEventListener("DOMContentLoaded", function () {
    initChrome(); initSearch(); initForms(); render();
    // featured grid on the home page
    var fg = $("#featured-grid");
    if (fg) fg.innerHTML = P.filter(function (p) { return p.featured; }).slice(0, 4).map(D.card).join("");
    document.dispatchEvent(new CustomEvent("dalaa:ready"));
  });
})();
