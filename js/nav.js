/**
 * モバイル用ハンバーガーメニュー
 * 狭い画面ではナビを隠し、ボタンで開閉する。
 * 大きな文字・拡大表示でも末尾の項目まで届くよう、開いている間は
 * ヘッダー下の残り領域に高さを合わせ、メニュー内を縦スクロールする。
 */
(function () {
  "use strict";

  var MQ = window.matchMedia("(max-width: 880px)");

  function init() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    var header = document.querySelector(".site-header");
    if (!toggle || !nav) return;

    function isOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    function fitNavToViewport() {
      if (!isOpen() || !MQ.matches) {
        nav.style.maxHeight = "";
        return;
      }
      var headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      var viewport = window.visualViewport;
      var viewBottom = viewport
        ? viewport.offsetTop + viewport.height
        : window.innerHeight;
      var available = Math.floor(viewBottom - headerBottom);
      nav.style.maxHeight = Math.max(available, 120) + "px";
    }

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("is-nav-open", open);
      if (open) {
        fitNavToViewport();
      } else {
        nav.style.maxHeight = "";
        nav.scrollTop = 0;
      }
    }

    setOpen(false);

    toggle.addEventListener("click", function () {
      setOpen(!isOpen());
    });

    document.addEventListener("click", function (e) {
      if (!isOpen()) return;
      if (toggle.contains(e.target) || nav.contains(e.target)) return;
      setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !isOpen()) return;
      setOpen(false);
      toggle.focus();
    });

    function onMqChange(e) {
      if (!e.matches) setOpen(false);
      else fitNavToViewport();
    }
    if (MQ.addEventListener) {
      MQ.addEventListener("change", onMqChange);
    } else if (MQ.addListener) {
      MQ.addListener(onMqChange);
    }

    window.addEventListener("resize", fitNavToViewport);
    window.addEventListener("orientationchange", fitNavToViewport);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", fitNavToViewport);
      window.visualViewport.addEventListener("scroll", fitNavToViewport);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
