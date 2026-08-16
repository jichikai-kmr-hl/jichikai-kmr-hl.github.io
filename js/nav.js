/**
 * モバイル用ハンバーガーメニュー
 * 狭い画面ではナビを隠し、ボタンで開閉する。
 */
(function () {
  "use strict";

  var MQ = window.matchMedia("(max-width: 880px)");

  function init() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    if (!toggle || !nav) return;

    function isOpen() {
      return toggle.getAttribute("aria-expanded") === "true";
    }

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "メニューを閉じる" : "メニューを開く");
      nav.classList.toggle("is-open", open);
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
    }
    if (MQ.addEventListener) {
      MQ.addEventListener("change", onMqChange);
    } else if (MQ.addListener) {
      MQ.addListener(onMqChange);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
