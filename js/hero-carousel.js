/**
 * キーイメージ・カルーセル
 * - data/hero.csv → build_content.py → SITE_CONTENT.hero
 * - 自動再生・左から右へスライド
 * - url がある画像はクリックでリンク先を開く
 */
(function () {
  "use strict";

  var DEFAULT_INTERVAL_MS = 10000;
  var TRANSITION_MS = 650;

  function getSlides() {
    var data = window.SITE_CONTENT;
    if (!data || !data.hero || !data.hero.length) {
      console.error("SITE_CONTENT.hero がありません。data/hero.csv を編集後 python build_content.py を実行してください。");
      return [];
    }
    return data.hero.map(function (h) {
      return {
        src: h.src || ("assets/hero-candidates/" + h.image),
        label: h.title || h.image || "",
        alt: h.title || "キーイメージ",
        url: (h.url || "").trim(),
      };
    });
  }

  function getIntervalMs() {
    var data = window.SITE_CONTENT;
    var n = data && data.settings && data.settings.heroIntervalMs;
    return typeof n === "number" && n > 0 ? n : DEFAULT_INTERVAL_MS;
  }

  function isExternalUrl(url) {
    return /^https?:\/\//i.test(url);
  }

  function init() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) return;

    var SLIDES = getSlides();
    if (!SLIDES.length) {
      var viewportEmpty = root.querySelector("[data-hero-viewport]");
      if (viewportEmpty) {
        viewportEmpty.innerHTML =
          '<p class="hero-carousel-empty">キーイメージが未登録です（data/hero.csv）</p>';
      }
      return;
    }

    var viewport = root.querySelector("[data-hero-viewport]");
    var labelEl = root.querySelector("[data-hero-label]");
    var countEl = root.querySelector("[data-hero-count]");
    var dotsEl = root.querySelector("[data-hero-dots]");
    var prevBtn = root.querySelector("[data-hero-prev]");
    var nextBtn = root.querySelector("[data-hero-next]");
    if (!viewport || !labelEl || !dotsEl) return;

    var intervalMs = getIntervalMs();
    var index = 0;
    var animating = false;
    var timer = null;
    var dots = [];
    var slideEls = [];
    var reducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    SLIDES.forEach(function (slide, i) {
      var el = document.createElement("div");
      el.className = "hero-carousel-slide" + (i === 0 ? " is-active" : "");
      el.setAttribute("aria-hidden", i === 0 ? "false" : "true");
      if (i !== 0) {
        el.style.transform = "translateX(-100%)";
      }

      var img = document.createElement("img");
      img.src = slide.src;
      img.alt = slide.alt;
      img.width = 1280;
      img.height = 720;
      img.decoding = "async";
      img.draggable = false;
      if (i === 0) {
        img.setAttribute("fetchpriority", "high");
      } else {
        img.loading = "lazy";
      }

      if (slide.url) {
        var a = document.createElement("a");
        a.className = "hero-carousel-link";
        a.href = slide.url;
        if (isExternalUrl(slide.url)) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
        a.setAttribute("aria-label", slide.label + "（詳細を開く）");
        a.appendChild(img);
        el.appendChild(a);
        el.classList.add("has-link");
      } else {
        el.appendChild(img);
      }

      viewport.appendChild(el);
      slideEls.push(el);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hero-carousel-dot" + (i === 0 ? " is-active" : "");
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-label", slide.label);
      btn.setAttribute("aria-selected", i === 0 ? "true" : "false");
      btn.addEventListener("click", function () {
        if (i === index) return;
        goTo(i, 1);
        restartAutoplay();
      });
      dotsEl.appendChild(btn);
      dots.push(btn);
    });

    function updateChrome() {
      var slide = SLIDES[index];
      labelEl.textContent = slide.label;
      if (countEl) {
        countEl.textContent = index + 1 + " / " + SLIDES.length;
      }
      dots.forEach(function (dot, di) {
        var on = di === index;
        dot.classList.toggle("is-active", on);
        dot.setAttribute("aria-selected", on ? "true" : "false");
      });
      slideEls.forEach(function (el, i) {
        el.classList.toggle("is-active", i === index);
        el.setAttribute("aria-hidden", i === index ? "false" : "true");
      });
    }

    /**
     * @param {number} newIndex
     * @param {number} dir 1 = 次（左から入って右へ） / -1 = 前
     */
    function goTo(newIndex, dir) {
      newIndex = (newIndex + SLIDES.length) % SLIDES.length;
      if (newIndex === index || animating) return;

      if (reducedMotion) {
        slideEls.forEach(function (el, i) {
          el.style.transition = "none";
          el.style.transform = i === newIndex ? "translateX(0)" : "translateX(-100%)";
        });
        index = newIndex;
        updateChrome();
        return;
      }

      animating = true;
      var currentEl = slideEls[index];
      var nextEl = slideEls[newIndex];

      var nextFrom = dir > 0 ? "-100%" : "100%";
      var currentTo = dir > 0 ? "100%" : "-100%";

      nextEl.style.transition = "none";
      nextEl.style.transform = "translateX(" + nextFrom + ")";
      nextEl.style.zIndex = "2";
      currentEl.style.zIndex = "1";

      void nextEl.offsetWidth;

      nextEl.style.transition = "transform " + TRANSITION_MS + "ms ease";
      currentEl.style.transition = "transform " + TRANSITION_MS + "ms ease";
      nextEl.style.transform = "translateX(0)";
      currentEl.style.transform = "translateX(" + currentTo + ")";

      window.setTimeout(function () {
        currentEl.style.transition = "none";
        currentEl.style.transform = "translateX(-100%)";
        currentEl.style.zIndex = "";
        nextEl.style.zIndex = "";
        index = newIndex;
        animating = false;
        updateChrome();
      }, TRANSITION_MS);
    }

    function next() {
      goTo(index + 1, 1);
    }

    function prev() {
      goTo(index - 1, -1);
    }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startAutoplay() {
      if (reducedMotion || SLIDES.length < 2) return;
      stopAutoplay();
      timer = setInterval(next, intervalMs);
    }

    function restartAutoplay() {
      startAutoplay();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prev();
        restartAutoplay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        next();
        restartAutoplay();
      });
    }

    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
        restartAutoplay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
        restartAutoplay();
      }
    });

    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", startAutoplay);
    root.addEventListener("focusin", stopAutoplay);
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) {
        startAutoplay();
      }
    });

    if (!root.hasAttribute("tabindex")) {
      root.setAttribute("tabindex", "0");
    }

    updateChrome();
    startAutoplay();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
