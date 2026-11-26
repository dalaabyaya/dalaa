/* Shop transition: gold shears cut down the middle of a sheet of white silk,
   and the two halves fall away on either side to reveal the shop page.
   Click "Shop" -> silk covers the screen -> shop page loads -> shears cut -> silk falls. */
(function () {
  "use strict";
  var KEY = "dalaaCut";
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
  function store(set) { try { if (set) sessionStorage.setItem(KEY, "1"); else sessionStorage.removeItem(KEY); } catch (e) {} }
  function has() { try { return sessionStorage.getItem(KEY) === "1"; } catch (e) { return false; } }

  var SHEARS = '<svg class="cut-shears" viewBox="0 0 100 270" width="86" height="232" aria-hidden="true">' +
    '<defs><linearGradient id="gld" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFF3BF"/><stop offset=".45" stop-color="#E2B93B"/><stop offset="1" stop-color="#8E6713"/></linearGradient></defs>' +
    '<g class="blade a"><circle cx="30" cy="40" r="17" fill="none" stroke="url(#gld)" stroke-width="9"/>' +
    '<path d="M36 55 L47 118 L47 122 L44.5 256 L53 122 L55 116 L46 118 Z" fill="url(#gld)" stroke="#8E6713" stroke-width="1"/></g>' +
    '<g class="blade b"><circle cx="70" cy="40" r="17" fill="none" stroke="url(#gld)" stroke-width="9"/>' +
    '<path d="M64 55 L53 118 L53 122 L55.5 256 L47 122 L45 116 L54 118 Z" fill="url(#gld)" stroke="#8E6713" stroke-width="1"/></g>' +
    '<circle cx="50" cy="120" r="5" fill="#FFF3BF" stroke="#8E6713" stroke-width="1.5"/></svg>';

  function build() {
    var d = document.createElement("div");
    d.className = "cut"; d.setAttribute("aria-hidden", "true");
    d.innerHTML = '<div class="silk l"></div><div class="silk r"></div>' + SHEARS;
    document.body.appendChild(d);
    return d;
  }

  /* Played on the shop page: cut down the middle, silk falls away. */
  function reveal() {
    var d = build(), L = d.querySelector(".silk.l"), R = d.querySelector(".silk.r"), S = d.querySelector(".cut-shears");
    root.classList.remove("cut-wait");
    var H = window.innerHeight, t0 = null, dur = 1500, tip = 232;
    function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var k = Math.min(1, (ts - t0 - 250) / dur); if (k < 0) k = 0;
      var Y = -30 + ease(k) * (H + 90);
      var g = Math.min(Math.max(Y, 0) * 0.09, 70);
      var y = Math.max(Y, 0);
      L.style.clipPath = "polygon(0 0," + "calc(100% - " + g + "px) 0,100% " + y + "px,100% 100%,0 100%)";
      R.style.clipPath = "polygon(" + g + "px 0,100% 0,100% 100%,0 100%,0 " + y + "px)";
      S.style.transform = "translate(-50%," + (Y - tip + 8) + "px)";
      if (k < 1) requestAnimationFrame(frame);
      else fall();
    }
    function fall() {
      d.classList.add("fall");
      setTimeout(function () { if (d.parentNode) d.parentNode.removeChild(d); }, 1300);
    }
    requestAnimationFrame(frame);
  }

  var onShop = /(^|\/)shop(\.html)?$/.test(location.pathname);

  if (has()) {
    store(false);
    if (reduce) root.classList.remove("cut-wait");
    else if (document.body) reveal(); else document.addEventListener("DOMContentLoaded", reveal);
  } else root.classList.remove("cut-wait");

  /* Clicking "Shop" from another page: silk drops over the screen, then we go. */
  if (!reduce) {
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a || a.target === "_blank") return;
      var h = a.getAttribute("href");
      if (!/^shop\.html(\?.*)?(#.*)?$/.test(h) || onShop) return;
      e.preventDefault();
      store(true);
      var d = build(); d.classList.add("cover");
      setTimeout(function () { location.href = a.href; }, 420);
    });
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) { store(false); var c = document.querySelector(".cut"); if (c) c.parentNode.removeChild(c); }
    });
  }
})();
