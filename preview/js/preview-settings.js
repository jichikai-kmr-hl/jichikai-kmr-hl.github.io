/**
 * 確認用（/preview/）だけの設定。
 * 内容はルートの js/content-data.js（data/*.csv から GitHub Actions が生成）をそのまま使い、
 * トップの表示件数などだけをここで上書きする。CSV を直せば、公開中のサイトと確認用の両方に反映される。
 */
(function () {
  "use strict";
  var data = window.SITE_CONTENT;
  if (!data) return;
  data.settings = data.settings || {};
  // トップの表示件数（公開中のサイト: お知らせ5件・各種配布物3件）。3か月以内のルールは変えない
  data.settings.topNewsCount = 10;
  data.settings.topHandoutsCount = 10;
  // トップが長くなりすぎないよう、お知らせは日付と見出しだけにする（本文はお知らせ一覧で読める）
  data.settings.topNewsTitleOnly = true;
  // 画像はルートの assets/ にある。確認用フォルダから見た場所に直す
  (data.hero || []).forEach(function (h) {
    var src = h.src || (h.image ? "assets/hero-candidates/" + h.image : "");
    if (src && !/^(https?:)?\/\//i.test(src) && src.charAt(0) !== "/" && src.indexOf("../") !== 0) {
      h.src = "../" + src;
    }
  });
})();
