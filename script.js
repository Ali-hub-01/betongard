/* POLIGARD — интерактив */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: состояние при скролле ---------- */
  var header = document.getElementById("header");
  function onScrollHeader() {
    header.classList.toggle("scrolled", window.scrollY > 30);
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById("burger");
  var nav = document.getElementById("nav");
  function closeMenu() {
    burger.classList.remove("open");
    nav.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }
  burger.addEventListener("click", function () {
    var open = !nav.classList.contains("open");
    burger.classList.toggle("open", open);
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });

  /* ---------- Reveal-анимации ---------- */
  var revealEls = document.querySelectorAll(".rv, .rv-card, .rv-img");
  // каскадные задержки внутри одного родителя
  var groups = new Map();
  revealEls.forEach(function (el) {
    if (!el.classList.contains("rv-card")) return;
    var p = el.parentElement;
    var n = groups.get(p) || 0;
    el.style.setProperty("--d", n);
    groups.set(p, n + 1);
  });

  if ("IntersectionObserver" in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Счётчики ---------- */
  function animateCounter(el) {
    var to = parseInt(el.dataset.to, 10) || 0;
    var prefix = el.dataset.prefix || "";
    var suffix = el.dataset.suffix || "";
    var dur = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(to * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll(".counter");
  if ("IntersectionObserver" in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCounter(en.target);
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(function (el) {
      el.textContent = (el.dataset.prefix || "") + el.dataset.to + (el.dataset.suffix || "");
    });
  }

  /* ---------- Hero параллакс ---------- */
  var heroImg = document.querySelector(".hero__bg img");
  if (heroImg && !reduced) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          heroImg.style.transform = "translateY(" + y * 0.18 + "px)";
        }
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Карусель продукции ---------- */
  var track = document.getElementById("carouselTrack");
  if (track) {
    var prev = document.getElementById("cPrev");
    var next = document.getElementById("cNext");
    var cardW = function () {
      var card = track.querySelector(".pcard");
      return card ? card.offsetWidth + 20 : 300;
    };
    next.addEventListener("click", function () {
      track.scrollBy({ left: cardW() * 2, behavior: "smooth" });
    });
    prev.addEventListener("click", function () {
      track.scrollBy({ left: -cardW() * 2, behavior: "smooth" });
    });

    // drag-скролл мышью (десктоп)
    var isDown = false, startX = 0, startScroll = 0, moved = false;
    track.addEventListener("mousedown", function (e) {
      isDown = true; moved = false;
      startX = e.pageX;
      startScroll = track.scrollLeft;
      track.classList.add("dragging");
    });
    window.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 5) moved = true;
      track.scrollLeft = startScroll - dx;
    });
    window.addEventListener("mouseup", function () {
      isDown = false;
      track.classList.remove("dragging");
    });
    track.addEventListener("click", function (e) {
      if (moved) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  }

  /* ---------- Магнитные кнопки (десктоп) ---------- */
  if (matchMedia("(pointer: fine)").matches && !reduced) {
    document.querySelectorAll(".btn--magnet").forEach(function (btn) {
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.18;
        var y = (e.clientY - r.top - r.height / 2) * 0.3;
        btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Форма → WhatsApp ---------- */
  var WA_PHONE = "77001000619";
  var form = document.getElementById("waForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var phone = form.elements.phone.value.trim();
      var msg = form.elements.msg.value.trim();

      var ok = true;
      [form.elements.name, form.elements.phone].forEach(function (f) {
        var bad = !f.value.trim();
        f.classList.toggle("err", bad);
        if (bad) ok = false;
      });
      if (!ok) return;

      var text =
        "Здравствуйте! Заявка с сайта POLIGARD.\n" +
        "Имя: " + name + "\n" +
        "Телефон: " + phone +
        (msg ? "\nЗадача: " + msg : "");
      var url = "https://wa.me/" + WA_PHONE + "?text=" + encodeURIComponent(text);
      window.open(url, "_blank", "noopener");

      document.getElementById("formDone").hidden = false;
      form.querySelector("button[type=submit]").disabled = true;
      // (Opus: сюда можно повесить gtag-конверсию формы)
    });
    form.addEventListener("input", function (e) {
      if (e.target.classList) e.target.classList.remove("err");
    });
  }

  /* ---------- Делегированный клик по tel / WhatsApp ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href^='tel:'], a[href*='wa.me']");
    if (!a) return;
    // (Opus: сюда можно повесить gtag-конверсии клика по телефону/WhatsApp)
  });
})();
