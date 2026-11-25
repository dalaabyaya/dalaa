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
    $("#shop-grid").innerHTML = list.length ? list.map(D.card).join("") :
      '<div class="empty"><span class="script">Nothing yet, gorgeous</span><p>No pieces match those filters. Try loosening one.</p><button class="btn btn-ghost" data-clear>Clear filters</button></div>';
    $("#shop-count").textContent = list.length + (list.length === 1 ? " piece" : " pieces");
    $("#shop-chips").innerHTML = chipsHTML();
    var n = state.types.length + state.sizes.length + state.colors.length + (state.min !== "" || state.max !== "" ? 1 : 0);
    $("#filter-n").textContent = n ? " (" + n + ")" : "";
    writeURL();
  }

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
