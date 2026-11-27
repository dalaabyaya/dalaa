/* Product detail page. Reads ?p=<slug> */
(function () {
  "use strict";
  var D = window.Dalaa, P = D.products, S = D.settings, $ = D.$, $$ = D.$$, esc = D.esc;

  document.addEventListener("dalaa:ready", function () {
    var slug = new URLSearchParams(location.search).get("p");
    var p = P.filter(function (x) { return x.slug === slug; })[0];
    var root = $("#pdp-root");
    if (!p) {
      root.innerHTML = '<div class="empty" style="padding:110px 0"><span class="script" style="font-size:64px">Oh no, gorgeous</span><p>We couldn\'t find that piece.</p><a class="btn btn-primary" href="shop.html">Back to the collection</a></div>';
      return;
    }
    var st = { ci: 0, size: "", qty: 1, img: 0 };
    for (var i = 0; i < p.colors.length; i++) { var t = 0; Object.keys(p.colors[i].stock || {}).forEach(function (k) { t += p.colors[i].stock[k]; }); if (t > 0) { st.ci = i; break; } }
    var fromURL = new URLSearchParams(location.search).get("c"); if (fromURL && p.colors[+fromURL]) st.ci = +fromURL;

    document.title = p.name + " | Dalaa by Aya";
    var md = $('meta[name="description"]'); if (md) md.content = p.description.slice(0, 155);
    var pageURL = "https://dalaabyaya.com/product.html?p=" + encodeURIComponent(slug);
    var cl = $('link[rel="canonical"]'); if (cl) cl.href = pageURL;
    var ou = $('meta[property="og:url"]'); if (ou) ou.content = pageURL;
    var ld = { "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description, brand: { "@type": "Brand", name: "Dalaa by Aya" } };
    if (p.price != null) ld.offers = { "@type": "Offer", priceCurrency: "AUD", price: p.price, availability: D.totalStock(p) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" };
    var s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);

    $("#crumb-name").textContent = p.name;
    $("#crumb-type").textContent = p.type;

    function color() { return p.colors[st.ci]; }
    function stock(size) { return (color().stock && color().stock[size]) || 0; }
    function remaining() { return Math.max(0, stock(st.size) - D.cart.qtyOf(p.id, color().name, st.size)); }
    function nImgs() { return color().images.length || 4; } // real photos only; placeholders keep 4 slots

    function draw() {
      var c = color(), n = nImgs();
      var sold = D.totalStock(p) === 0;
      root.innerHTML =
        '<div class="gallery"><div class="thumbs">' + Array.apply(null, Array(n)).map(function (_, i) {
          return '<button class="thumb' + (i === st.img ? " on" : "") + '" data-img="' + i + '" aria-label="Show photo ' + (i + 1) + '">' + D.imgOrPh(p, c, i, "") + "</button>";
        }).join("") + '</div><div class="mainimg">' + D.imgOrPh(p, c, st.img, "") + "</div></div>" +
        '<div class="pdp-info">' +
        (p.badge ? '<span class="eyebrow">' + esc(p.badge) + "</span>" : '<span class="eyebrow">' + esc(p.type) + "</span>") +
        "<h1>" + esc(p.name) + "</h1>" +
        '<div class="pdp-price' + (p.price == null ? " tbd" : "") + '">' + (p.price == null ? "Price TBC" : D.money(p.price) + ' <span class="cur">AUD</span>') + "</div>" +
        (p.placeholder ? '<p class="notice">This is a placeholder product so you can see how the store works. Real pieces, prices and photos replace it.</p>' : "") +
        '<div class="opt"><div class="opt-label">Colour <span>' + esc(c.name) + '</span></div><div class="swatches big" role="group" aria-label="Colour">' +
        p.colors.map(function (k, i) { return '<button class="sw" style="--c:' + esc(k.swatch || k.hex) + '" data-ci="' + i + '" aria-pressed="' + (i === st.ci) + '" aria-label="' + esc(k.name) + '" title="' + esc(k.name) + '"></button>'; }).join("") + "</div>" + (c.note ? '<p class="color-note">' + esc(c.note) + "</p>" : "") + "</div>" +
        '<div class="opt"><div class="opt-label">Size <button data-open="sizeguide">Size guide</button></div><div class="size-row" role="group" aria-label="Size">' +
        p.sizes.map(function (z) { return '<button class="chip" data-size="' + esc(z) + '" aria-pressed="' + (z === st.size) + '"' + (stock(z) < 1 ? " disabled" : "") + ">" + esc(z) + "</button>"; }).join("") + "</div></div>" +
        '<p class="stock-note" id="stock-note" aria-live="polite"></p>' +
        '<div class="buy-row"><div class="qty" role="group" aria-label="Quantity"><button data-q="-1" aria-label="Decrease quantity">−</button><output id="qty">' + st.qty + '</output><button data-q="1" aria-label="Increase quantity">+</button></div>' +
        '<button class="btn btn-primary" id="add"' + (sold ? " disabled" : "") + ">" + (sold ? "Sold out" : "Add to bag, gorgeous") + "</button></div>" +
        '<div class="perks"><span>♡ Handmade in Melbourne</span><span>♡ Prices in AUD</span></div>' +
        '<div class="acc">' +
        '<details><summary>Description</summary><div class="acc-body"><p>' + esc(p.description) + "</p></div></details>" +
        '<details><summary>Specifications</summary><div class="acc-body">' + specsHTML() + "</div></details>" +
        "<details><summary>Fabric &amp; care</summary><div class=\"acc-body\"><p>" + esc(p.fabricCare || S.defaultFabricCare) + "</p></div></details>" +
        "<details><summary>Shipping &amp; returns</summary><div class=\"acc-body\"><p>Shipping time: " + tbc(S.shipping.domesticTime) + " &nbsp; Cost: " + tbc(S.shipping.domesticCost) + '</p><p>Returns: ' + tbc(S.shipping.returnsWindow) + ' · <a class="link-u" style="font-size:11px" href="info.html#shipping">Full details</a></p></div></details></div></div>';
      note();
    }
    function specsHTML() {
      var has = p.specs && p.specs.length;
      var rows = has ? p.specs : [["Style", p.type], ["Sizes", p.sizes.join(", ")]];
      return '<dl class="specs">' + rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + tbc(r[1]) + "</dd></div>"; }).join("") + "</dl>" +
        (has ? "" : '<p><span class="tbc">More specifications to be confirmed</span></p>');
    }
    function tbc(v) { return !v || v === "TBC" ? '<span class="tbc">to be confirmed</span>' : esc(v); }
    function note() {
      var n = $("#stock-note"); if (!n || !st.size) { if (n) n.textContent = ""; return; }
      var left = stock(st.size);
      n.textContent = left <= 3 ? (left === 1 ? "Only 1 left in this size." : "Only " + left + " left in this size.") : "";
    }

    draw();

    root.addEventListener("click", function (e) {
      var b;
      if ((b = e.target.closest(".thumb"))) { st.img = +b.dataset.img; draw(); return; }
      if ((b = e.target.closest(".sw[data-ci]"))) { st.ci = +b.dataset.ci; st.img = 0; if (st.size && stock(st.size) < 1) st.size = ""; st.qty = 1; draw(); return; }
      if ((b = e.target.closest(".chip[data-size]"))) { st.size = b.dataset.size; st.qty = 1; draw(); return; }
      if ((b = e.target.closest("[data-q]"))) {
        var max = st.size ? Math.max(1, remaining()) : 10, next = st.qty + +b.dataset.q;
        st.qty = Math.min(max, Math.max(1, next)); $("#qty").textContent = st.qty; return;
      }
      if (e.target.closest("#add")) {
        if (!st.size) { $("#stock-note").textContent = "Choose a size first, gorgeous."; return; }
        var r = D.cart.add(p.id, color().name, st.size, st.qty);
        if (r.ok) { D.toast(r.capped ? "Added, that's every one we have ♡" : "Added to your bag. You've got good taste ♡"); D.openCart(); st.qty = 1; draw(); }
        else $("#stock-note").textContent = r.reason === "max" ? "You already have every one we have in your bag." : "Sorry gorgeous, that size is sold out.";
      }
    });

    // related
    var rel = P.filter(function (x) { return x.id !== p.id; }).sort(function (a, b) { return (b.type === p.type) - (a.type === p.type); }).slice(0, 4);
    $("#related-grid").innerHTML = rel.map(D.card).join("");
    if (!rel.length) $("#related").hidden = true;
  });
})();
