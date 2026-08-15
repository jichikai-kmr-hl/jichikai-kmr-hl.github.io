(function () {
  var url = "https://jichikai-kmr-hl.github.io/pr-homepage/";
  var title = "小室ハイランド自治会";
  var shareBtn = document.querySelector("[data-share-site]");
  var copyBtn = document.querySelector("[data-copy-url]");
  var statusEl = document.querySelector("[data-save-status]");
  var urlInput = document.getElementById("site-url");

  function showStatus(message) {
    if (!statusEl) return;
    statusEl.hidden = false;
    statusEl.textContent = message;
  }

  function copyUrl() {
    function fallbackSelect() {
      if (!urlInput) return false;
      urlInput.focus();
      urlInput.select();
      urlInput.setSelectionRange(0, urlInput.value.length);
      try {
        return document.execCommand("copy");
      } catch (e) {
        return false;
      }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(
        function () {
          showStatus("アドレスをコピーしました。メモやメールに貼れます。");
        },
        function () {
          showStatus(
            fallbackSelect()
              ? "アドレスをコピーしました。"
              : "コピーできませんでした。上のアドレスを長押ししてコピーしてください。"
          );
        }
      );
      return;
    }

    showStatus(
      fallbackSelect()
        ? "アドレスをコピーしました。"
        : "上のアドレスを長押ししてコピーするか、メモしてください。"
    );
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      if (navigator.share) {
        navigator
          .share({
            title: title,
            text: "小室ハイランド自治会の広報サイト",
            url: url
          })
          .catch(function (err) {
            if (!err || err.name === "AbortError") return;
            copyUrl();
          });
        return;
      }
      showStatus("この端末では共有できません。下の手順でホーム画面に追加するか、アドレスをコピーしてください。");
      copyUrl();
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", copyUrl);
  }
})();
