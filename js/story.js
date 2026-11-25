/* Our Story: scroll animation.
   Reveals, parallax, scroll-lit words, progress thread, cursor spotlight.
   Does nothing when html lacks .story-ready (reduced motion / no JS),
   in which case the page simply shows everything, statically. */
(function () {
  "use strict";
  window.__storyOK = true;
  var root = document.documentElement;
  if (!root.classList.contains("story-ready")) return;

  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

  var vh = window.innerHeight;

  /* 1. Reveal things as they scroll into view */
  var sx = $$(".sx");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    sx.forEach(function (el) { io.observe(el); });
  } else {
    sx.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* 2. Words that light up one by one as you scroll through them */
  var lits = $$(".lit").map(function (el) {
    var text = el.textContent.replace(/\s+/g, " ").trim();
    el.innerHTML = '<span class="sr-only">' + esc(text) + "</span>" +
      text.split(" ").map(function (w) { return '<span class="lw" aria-hidden="true">' + esc(w) + "</span>"; }).join(" ");
    return { el: el, words: $$(".lw", el) };
  });

  /* 3. Parallax: things drift at different speeds (and lips slowly turn) */
  var par = [];
  $$("[data-speed]").forEach(function (el) {
    par.push({ el: el, parent: el.parentElement, speed: parseFloat(el.getAttribute("data-speed")) || 0, rot: parseFloat(el.getAttribute("data-rot")) || 0 });
  });
  $$(".chapter .vis").forEach(function (vis, i) {
    var ph = vis.querySelector(".ph");
    if (ph) par.push({ el: ph, parent: vis, speed: i % 2 ? -0.07 : 0.07, rot: 0 });
  });

  var thread = $$(".thread")[0];
  var spot = $$(".spot")[0];
  var raf = 0;

  function tick() {
    raf = 0;
    var y = window.pageYOffset || 0;
    var max = document.documentElement.scrollHeight - vh;
    if (thread) thread.style.setProperty("--p", max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);

    var k = window.innerWidth < 860 ? 0.6 : 1;
    par.forEach(function (it) {
      var r = it.parent.getBoundingClientRect();
      if (r.bottom < -300 || r.top > vh + 300) return;
      var d = r.top + r.height / 2 - vh / 2;
      it.el.style.setProperty("--py", (d * it.speed * k).toFixed(1) + "px");
      if (it.rot) it.el.style.setProperty("--rot", (d / vh * it.rot).toFixed(2) + "deg");
    });

    lits.forEach(function (L) {
      var r = L.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var p = clamp((vh * 0.9 - r.top) / (vh * 0.5 + r.height / 2), 0, 1);
      var n = Math.round(p * L.words.length);
      L.words.forEach(function (w, i) { w.classList.toggle("on", i < n); });
    });
  }
  function queue() { if (!raf) raf = requestAnimationFrame(tick); }

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", function () { vh = window.innerHeight; queue(); });
  window.addEventListener("load", queue);
  tick();

  /* 4. Soft pink spotlight that follows the mouse */
  if (spot && window.matchMedia && window.matchMedia("(pointer:fine)").matches) {
    var mx = 0, my = 0, sraf = 0;
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!sraf) sraf = requestAnimationFrame(function () {
        sraf = 0;
        spot.style.setProperty("--mx", mx + "px");
        spot.style.setProperty("--my", my + "px");
        spot.classList.add("on");
      });
    }, { passive: true });
  }
})();
