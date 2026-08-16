/**
 * メールアドレスなどのコピーボタン
 * button[data-copy-text="コピーする文字列"]
 */
(function () {
  "use strict";

  function copyText(text) {
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "0";
      ta.style.left = "0";
      ta.style.width = "2em";
      ta.style.height = "2em";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      var ok = false;
      try {
        ok = document.execCommand("copy");
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(ta);
      return ok;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(
        function () {
          return true;
        },
        function () {
          return fallback();
        }
      );
    }
    return Promise.resolve(fallback());
  }

  document.querySelectorAll("[data-copy-text]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy-text") || "";
      if (!text) return;
      var box = btn.closest(".addr-box") || btn.parentElement;
      var status = box.querySelector("[data-copy-status]");

      copyText(text).then(function (ok) {
        if (!status) return;
        status.hidden = false;
        status.textContent = ok
          ? "アドレスをコピーしました。メールの宛先に貼れます。"
          : "コピーできませんでした。上のアドレスを長押ししてコピーしてください。";
      });
    });
  });
})();

