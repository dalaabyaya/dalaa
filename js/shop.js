/* Shop page: filters, sorting, search. Reads /data/products.js */
(function () {
  "use strict";
  var D = window.Dalaa, P = D.products, $ = D.$, $$ = D.$$, esc = D.esc;
  var state = { q: "", sort: "featured", types: [], sizes: [], colors: [], min: "", max: "" };

  function readURL() {
    var u = new URLSearchParams(location.search);
    state.q = u.get("q") || ""; state.sort = u.get("sort") || "featured";
    state.types = (u.get("type") || "").split(",").filter(Boolean);
    state.sizes = (u.get("size") || "").split(",").filter(Boolean);
    state.colors = (u.get("color") || "").split(",").filter(Boolean);
    state.min = u.get("min") || ""; state.max = u.get("max") || "";
  }
  function writeURL() {
    var u = new URLSearchParams();
    if (state.q) u.set("q", state.q);
    if (state.sort !== "featured") u.set("sort", state.sort);
    if (state.types.length) u.set("type", state.types.join(","));
    if (state.sizes.length) u.set("size", state.sizes.join(","));
    if (state.colors.length) u.set("color", state.colors.join(","));
    if (state.min) u.set("min", state.min);
    if (state.max) u.set("max", state.max);
    var s = u.toString(); history.replaceState(null, "", location.pathname + (s ? "?" + s : ""));
  }

  function uniq(a) { return a.filter(function (x, i) { return a.indexOf(x) === i; }); }
  var allTypes = uniq(P.map(function (p) { return p.type; }));
  var allSizes = uniq([].concat.apply([], P.map(function (p) { return p.sizes; })));
  var colorMap = {}; P.forEach(function (p) { p.colors.forEach(function (c) { if (!colorMap[c.hex]) colorMap[c.hex] = c.name.replace(/\s*\(placeholder\)/i, ""); }); });
  var swatchMap = {}; P.forEach(function (p) { p.colors.forEach(function (c) { if (c.swatch && !swatchMap[c.hex]) swatchMap[c.hex] = c.swatch; }); });
  var anyPrice = P.some(function (p) { return p.price != null; });

  function buildFilters() {
    $("#f-type").innerHTML = allTypes.map(function (t) {
      return '<label class="check"><input type="checkbox" data-f="types" value="' + esc(t) + '"> ' + esc(t) + "</label>";
    }).join("");
    $("#f-size").innerHTML = allSizes.map(function (s) {
      return '<button class="chip" data-f="sizes" data-v="' + esc(s) + '" aria-pressed="false">' + esc(s) + "</button>";
    }).join("");
    $("#f-color").innerHTML = Object.keys(colorMap).map(function (h) {
      return '<button class="sw" style="--c:' + esc(swatchMap[h] || h) + ';width:30px;height:30px" data-f="colors" data-v="' + esc(h) + '" aria-pressed="false" aria-label="' + esc(colorMap[h]) + '" title="' + esc(colorMap[h]) + '"></button>';
    }).join("");
    $("#f-price-note").textContent = anyPrice ? "" : "Prices will appear here once your collection is added.";
  }

  function syncControls() {
    $("#shop-q").value = state.q; $("#shop-sort").value = state.sort;
    $$("input[data-f=types]").forEach(function (i) { i.checked = state.types.indexOf(i.value) > -1; });
    $$("button[data-f]").forEach(function (b) { b.setAttribute("aria-pressed", String(state[b.dataset.f].indexOf(b.dataset.v) > -1)); });
    $("#pmin").value = state.min; $("#pmax").value = state.max;
  }

  function matches(p) {
    if (state.q) {
      var hay = (p.name + " " + p.type + " " + p.description + " " + p.colors.map(function (c) { return c.name; }).join(" ")).toLowerCase();
      if (state.q.toLowerCase().split(/\s+/).some(function (w) { return hay.indexOf(w) < 0; })) return false;
    }
    if (state.types.length && state.types.indexOf(p.type) < 0) return false;
    if (state.colors.length && !p.colors.some(function (c) { return state.colors.indexOf(c.hex) > -1; })) return false;
    if (state.sizes.length && !state.sizes.some(function (s) { return p.colors.some(function (c) { return (c.stock && c.stock[s] > 0); }); })) return false;
    if (state.min !== "" || state.max !== "") {
      if (p.price == null) return false;
      if (state.min !== "" && p.price < +state.min) return false;
      if (state.max !== "" && p.price > +state.max) return false;
    }
    return true;
  }
  function sorter() {
    var idx = function (p) { return P.indexOf(p); };
    var rank = function (p, b) { return p.badge === b ? 0 : 1; };
    var pr = function (p, d) { return p.price == null ? Infinity : p.price * d; };
    switch (state.sort) {
      case "new": return function (a, b) { return rank(a, "New") - rank(b, "New") || idx(a) - idx(b); };
      case "best": return function (a, b) { return rank(a, "Bestseller") - rank(b, "Bestseller") || idx(a) - idx(b); };
      case "low": return function (a, b) { return pr(a, 1) - pr(b, 1) || idx(a) - idx(b); };
      case "high": return function (a, b) { return (a.price == null) - (b.price == null) || (b.price || 0) - (a.price || 0); };
      case "az": return function (a, b) { return a.name.localeCompare(b.name); };
      default: return function (a, b) { return idx(a) - idx(b); };
    }
  }

  function chipsHTML() {
    var c = [];
    state.types.forEach(function (v) { c.push(["types", v, v]); });
    state.sizes.forEach(function (v) { c.push(["sizes", v, "Size " + v]); });
    state.colors.forEach(function (v) { c.push(["colors", v, colorMap[v] || v]); });
    if (state.min !== "" || state.max !== "") c.push(["price", "", "$" + (state.min || 0) + " – " + (state.max ? "$" + state.max : "any")]);
    if (state.q) c.push(["q", "", "“" + state.q + "”"]);
    return c.map(function (x) { return '<span class="fchip">' + esc(x[2]) + '<button data-rm="' + x[0] + '" data-v="' + esc(x[1]) + '" aria-label="Remove filter ' + esc(x[2]) + '">×</button></span>'; }).join("") +
      (c.length ? '<button class="link-u" data-clear style="font-size:11px">Clear all</button>' : "");
  }

  function update() {
    var list = P.filter(matches).sort(sorter());
    var real = list.filter(function (p) { return !p.placeholder; }), soon = list.filter(function (p) { return p.placeholder; });
    function spread(p, i) {
      var url = "product.html?p=" + esc(p.slug), c0 = p.colors[0];
      var cols = p.colors.map(function (c) { return '<li><i style="--c:' + esc(c.swatch || c.hex) + '"></i>' + esc(c.name) + "</li>"; }).join("");
      return '<div class="pg"><div class="pg-front"><section class="spread' + (i % 2 ? " alt" : "") + '" aria-label="' + esc(p.name) + '"><div class="sp-cover">' + D.card(p) + "</div>" +
        '<div class="sp-info"><span class="sp-no">No. ' + String(P.indexOf(p) + 1).padStart(2, "0") + '</span>' +
        '<h2 class="sp-name"><a href="' + url + '">' + esc(p.name) + "</a></h2>" +
        '<p class="sp-type">' + esc(p.type) + "</p>" +
        '<div class="sp-price">' + D.priceHTML(p) + "</div>" +
        '<p class="sp-desc">' + esc(p.description) + "</p>" +
        '<ul class="sp-cols">' + cols + "</ul>" +
        '<div class="sp-cta"><a class="btn btn-primary" href="' + url + '">View the piece</a></div></div></section></div><div class="pg-back"></div></div>';
    }
    var html = real.length ? '<div class="mag" id="mag" tabindex="0" aria-label="The collection. Use the arrows to turn the page."><div class="mag-stage">' + real.map(spread).join("") + "</div>" +
      (real.length > 1 ? '<div class="mag-nav"><button class="mag-btn" data-mag="prev" aria-label="Previous page">&#8592;</button><span class="mag-count" aria-live="polite"><b>01</b> / ' + String(real.length).padStart(2, "0") + '</span><button class="mag-btn" data-mag="next" aria-label="Turn the page">&#8594;</button></div>' : "") + "</div>" : "";
    if (soon.length) html += '<section class="soon" aria-label="Coming soon"><h2 class="soon-h">Coming <em>soon</em></h2><div class="grid soon-grid">' + soon.map(D.card).join("") + "</div></section>";
    $("#shop-grid").innerHTML = list.length ? html :
      '<div class="empty"><span class="script">Nothing yet, gorgeous</span><p>No pieces match those filters. Try loosening one.</p><button class="btn btn-ghost" data-clear>Clear filters</button></div>';
    initMag();
    $("#shop-count").textContent = list.length + (list.length === 1 ? " piece" : " pieces");
    $("#shop-chips").innerHTML = chipsHTML();
    var n = state.types.length + state.sizes.length + state.colors.length + (state.min !== "" || state.max !== "" ? 1 : 0);
    $("#filter-n").textContent = n ? " (" + n + ")" : "";
    writeURL();
  }


  /* Magazine pager: pages flip over to the right like thin paper. */
  var mag = null;
  function initMag() {
    var el = $("#mag"); mag = null; if (!el) return;
    var pgs = $$(".pg", el), cur = 0, busy = false, count = $(".mag-count b", el);
    function set() {
      pgs.forEach(function (p, i) {
        p.classList.remove("cur", "under", "done", "hid", "fo", "fb");
        p.classList.add(i < cur ? "done" : i === cur ? "cur" : i === cur + 1 ? "under" : "hid");
      });
      if (count) count.textContent = String(cur + 1).padStart(2, "0");
      $$("[data-mag=prev]", el).forEach(function (b) { b.disabled = cur === 0; });
      $$("[data-mag=next]", el).forEach(function (b) { b.disabled = cur === pgs.length - 1; });
    }
    function go(dir) {
      if (busy) return;
      var to = cur + dir; if (to < 0 || to >= pgs.length) return;
      busy = true;
      var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
      var mover = dir > 0 ? pgs[cur] : pgs[to];
      if (dir < 0) { mover.classList.remove("done"); mover.classList.add("fb"); pgs[cur].classList.remove("cur"); pgs[cur].classList.add("under"); }
      else { mover.classList.add("fo"); pgs[to].classList.remove("hid"); pgs[to].classList.add("under"); }
      var finished = false;
      function end() { if (finished) return; finished = true; cur = to; busy = false; set(); window.scrollTo({ top: Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - 150), behavior: "smooth" }); }
      mover.addEventListener("animationend", function h(e) { if (e.target === mover) { mover.removeEventListener("animationend", h); end(); } });
      setTimeout(end, reduce ? 50 : 1500);
    }
    el.addEventListener("click", function (e) { var b = e.target.closest("[data-mag]"); if (b) go(b.dataset.mag === "next" ? 1 : -1); });
    /* a flick to the right turns the page over; a flick to the left turns it back */
    var sx = null;
    el.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse" || e.button === 0) sx = [e.clientX, e.clientY]; });
    el.addEventListener("pointerup", function (e) {
      if (!sx) return; var dx = e.clientX - sx[0], dy = e.clientY - sx[1]; sx = null;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) go(dx > 0 ? 1 : -1);
    });
    mag = { go: go, el: el };
    set();
  }
  document.addEventListener("keydown", function (e) {
    if (!mag || /input|select|textarea/i.test((e.target.tagName || ""))) return;
    if (e.key === "ArrowRight") mag.go(1); else if (e.key === "ArrowLeft") mag.go(-1);
  });

  function toggle(arr, v) { var i = arr.indexOf(v); if (i > -1) arr.splice(i, 1); else arr.push(v); }

  document.addEventListener("dalaa:ready", function () {
    readURL(); buildFilters(); syncControls(); update();
    var t; $("#shop-q").addEventListener("input", function (e) { clearTimeout(t); var v = e.target.value; t = setTimeout(function () { state.q = v.trim(); update(); }, 180); });
    $("#shop-sort").addEventListener("change", function (e) { state.sort = e.target.value; update(); });
    ["pmin", "pmax"].forEach(function (id) { $("#" + id).addEventListener("input", function (e) { state[id === "pmin" ? "min" : "max"] = e.target.value; update(); }); });
    document.addEventListener("change", function (e) { var i = e.target.closest("input[data-f]"); if (i) { toggle(state[i.dataset.f], i.value); update(); } });
    document.addEventListener("click", function (e) {
      var b = e.target.closest("button[data-f]");
      if (b) { toggle(state[b.dataset.f], b.dataset.v); b.setAttribute("aria-pressed", String(state[b.dataset.f].indexOf(b.dataset.v) > -1)); update(); return; }
      var rm = e.target.closest("[data-rm]");
      if (rm) { var k = rm.dataset.rm; if (k === "price") { state.min = state.max = ""; } else if (k === "q") state.q = ""; else toggle(state[k], rm.dataset.v); syncControls(); update(); return; }
      if (e.target.closest("[data-clear]")) { state = { q: "", sort: state.sort, types: [], sizes: [], colors: [], min: "", max: "" }; syncControls(); update(); return; }
      if (e.target.closest("#filter-open")) { $("#filters").classList.add("open"); document.body.style.overflow = "hidden"; }
      if (e.target.closest("#filter-close")) { $("#filters").classList.remove("open"); document.body.style.overflow = ""; }
    });
  });
})();
