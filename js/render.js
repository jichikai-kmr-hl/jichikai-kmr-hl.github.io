/**
 * CSV から生成した SITE_CONTENT をページに描画する
 * 前提: content-data.js が先に読み込まれていること
 */
(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDateSlash(iso) {
    // 2026-07-01 → 2026/07/01
    if (!iso || iso.length < 10) return esc(iso);
    return esc(iso.slice(0, 4) + "/" + iso.slice(5, 7) + "/" + iso.slice(8, 10));
  }

  function dateId(iso) {
    return esc(iso);
  }

  function monthLabel(m) {
    return m + "月";
  }

  function getContent() {
    if (!window.SITE_CONTENT) {
      console.error("SITE_CONTENT がありません。python build_content.py を実行してください。");
      return null;
    }
    return window.SITE_CONTENT;
  }

  function newsHref(item) {
    if (item.link) return item.link;
    return "news.html#" + item.date;
  }

  function renderNewsItem(item, opts) {
    opts = opts || {};
    var badge = item.badge
      ? '<span class="badge-new">' + esc(item.badge) + "</span>"
      : "";
    var title = badge + esc(item.title);
    var summary = item.body ? '<p class="news-summary">' + esc(item.body) + "</p>" : "";
    var href = newsHref(item);
    var external = /^https?:\/\//i.test(href);
    var target = external ? ' target="_blank" rel="noopener noreferrer"' : "";

    if (opts.archive) {
      // アーカイブ: リンクがあれば本文内、なければ静的表示
      var bodyInner =
        '<p class="news-title">' +
        esc(item.title) +
        "</p>" +
        (item.body
          ? '<p class="news-summary">' +
            esc(item.body) +
            (item.link
              ? ' <a href="' +
                esc(item.link) +
                '"' +
                target +
                ">詳細・関連ページ</a>"
              : "") +
            "</p>"
          : "");
      return (
        '<li id="' +
        dateId(item.date) +
        '">' +
        '<div class="news-item" style="cursor:default">' +
        '<span class="news-date">' +
        formatDateSlash(item.date) +
        "</span>" +
        '<span class="news-body">' +
        bodyInner +
        "</span></div></li>"
      );
    }

    return (
      "<li>" +
      '<a class="news-item" href="' +
      esc(href) +
      '"' +
      target +
      ">" +
      '<span class="news-date">' +
      formatDateSlash(item.date) +
      "</span>" +
      '<span class="news-body">' +
      '<p class="news-title">' +
      title +
      "</p>" +
      summary +
      "</span></a></li>"
    );
  }

  function renderTopNews(el, news, count) {
    var list = news.slice(0, count);
    if (!list.length) {
      el.innerHTML = "<li><p class=\"news-summary\">お知らせはまだありません。</p></li>";
      return;
    }
    el.innerHTML = list.map(function (item) {
      return renderNewsItem(item, { archive: false });
    }).join("");
  }

  function renderArchiveNews(el, news) {
    if (!news.length) {
      el.innerHTML = "<p>お知らせはまだありません。</p>";
      return;
    }
    // year → month → items
    var byYear = {};
    news.forEach(function (item) {
      var y = item.date.slice(0, 4);
      var m = parseInt(item.date.slice(5, 7), 10);
      if (!byYear[y]) byYear[y] = {};
      if (!byYear[y][m]) byYear[y][m] = [];
      byYear[y][m].push(item);
    });
    var years = Object.keys(byYear).sort(function (a, b) {
      return b.localeCompare(a);
    });
    var html = "";
    years.forEach(function (y) {
      html +=
        '<div class="year-block" id="y' +
        esc(y) +
        '"><h2 class="year-heading">' +
        esc(y) +
        "年</h2>";
      var months = Object.keys(byYear[y])
        .map(Number)
        .sort(function (a, b) {
          return b - a;
        });
      months.forEach(function (m) {
        html +=
          '<div class="month-group"><h3 class="month-heading">' +
          monthLabel(m) +
          "</h3><ul class=\"news-list\">";
        html += byYear[y][m]
          .map(function (item) {
            return renderNewsItem(item, { archive: true });
          })
          .join("");
        html += "</ul></div>";
      });
      html += "</div>";
    });
    el.innerHTML = html;
  }

  function renderTopNewsletter(el, newsletters) {
    var latest =
      newsletters.find(function (n) {
        return n.latest;
      }) || newsletters[0];
    if (!latest) {
      el.innerHTML =
        '<article class="card highlight"><p class="card-desc">広報紙はまだ登録されていません。</p></article>';
      return;
    }
    var desc =
      latest.description ||
      "Google ドライブ上の最新号を開きます。";
    el.innerHTML =
      '<article class="card highlight">' +
      '<a class="card-link" href="' +
      esc(latest.url) +
      '" target="_blank" rel="noopener noreferrer">' +
      '<div class="card-label">最新号</div>' +
      '<h3 class="card-title">' +
      esc(latest.title) +
      "（PDF）</h3>" +
      '<p class="card-desc">' +
      esc(desc) +
      "</p></a></article>" +
      '<article class="card">' +
      '<a class="card-link" href="newsletters.html">' +
      '<div class="card-label">アーカイブ</div>' +
      '<h3 class="card-title">過去の広報紙を年別に見る</h3>' +
      '<p class="card-desc">これまでの広報紙を、発行年ごとにまとめて掲載しています。</p>' +
      "</a></article>";
  }

  function renderArchiveNewsletters(el, newsletters) {
    if (!newsletters.length) {
      el.innerHTML = "<p>広報紙はまだ登録されていません。</p>";
      return;
    }
    var latest = newsletters.find(function (n) {
      return n.latest;
    });
    var html = "";
    if (latest) {
      html +=
        '<div class="year-block"><h2 class="year-heading">最新号</h2><ul class="link-list">' +
        '<li><a href="' +
        esc(latest.url) +
        '" target="_blank" rel="noopener noreferrer">' +
        '<span class="link-icon" aria-hidden="true">📄</span><span>' +
        esc(latest.title) +
        '<span class="link-meta">' +
        esc(latest.description || "Google ドライブで開く") +
        "</span></span></a></li></ul></div>";
    }

    var byYear = {};
    newsletters.forEach(function (n) {
      if (!byYear[n.year]) byYear[n.year] = [];
      byYear[n.year].push(n);
    });
    var years = Object.keys(byYear)
      .map(Number)
      .sort(function (a, b) {
        return b - a;
      });
    years.forEach(function (y) {
      html +=
        '<div class="year-block" id="y' +
        y +
        '"><h2 class="year-heading">' +
        y +
        "年</h2><ul class=\"link-list\">";
      byYear[y]
        .sort(function (a, b) {
          return b.month - a.month;
        })
        .forEach(function (n) {
          var meta = n.latest ? "最新号 · PDF" : "PDF";
          html +=
            '<li><a href="' +
            esc(n.url) +
            '" target="_blank" rel="noopener noreferrer">' +
            '<span class="link-icon" aria-hidden="true">📄</span><span>' +
            esc(n.title) +
            '<span class="link-meta">' +
            esc(meta) +
            "</span></span></a></li>";
        });
      html += "</ul></div>";
    });
    el.innerHTML = html;
  }

  function renderTopHandouts(el, handouts) {
    if (!handouts.length) {
      el.innerHTML =
        '<article class="card"><p class="card-desc">各種配布物はまだ登録されていません。</p></article>';
      return;
    }
    var recent = handouts.slice(0, 3);
    var listHtml = recent
      .map(function (h) {
        return (
          '<li><a href="' +
          esc(h.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          '<span class="link-icon" aria-hidden="true">📄</span><span>' +
          esc(h.title) +
          '<span class="link-meta">' +
          esc(h.year + "年" + h.month + "月 · PDF") +
          "</span></span></a></li>"
        );
      })
      .join("");
    el.innerHTML =
      '<article class="card highlight" style="grid-column:1/-1">' +
      '<div class="card-label">最近の配布物</div>' +
      '<ul class="link-list" style="margin-top:0.75rem">' +
      listHtml +
      "</ul>" +
      '<p style="margin-top:1rem;margin-bottom:0">' +
      '<a class="more-link" href="handouts.html">年月別の一覧を見る →</a></p>' +
      "</article>";
  }

  function renderArchiveHandouts(el, handouts) {
    if (!handouts.length) {
      el.innerHTML = "<p>各種配布物はまだ登録されていません。</p>";
      return;
    }
    // year → month → items
    var byYear = {};
    handouts.forEach(function (h) {
      if (!byYear[h.year]) byYear[h.year] = {};
      if (!byYear[h.year][h.month]) byYear[h.year][h.month] = [];
      byYear[h.year][h.month].push(h);
    });
    var years = Object.keys(byYear)
      .map(Number)
      .sort(function (a, b) {
        return b - a;
      });
    var html = "";
    years.forEach(function (y) {
      html +=
        '<div class="year-block" id="y' +
        y +
        '"><h2 class="year-heading">' +
        y +
        "年</h2>";
      var months = Object.keys(byYear[y])
        .map(Number)
        .sort(function (a, b) {
          return b - a;
        });
      months.forEach(function (m) {
        html +=
          '<div class="month-group"><h3 class="month-heading">' +
          monthLabel(m) +
          '</h3><ul class="link-list">';
        byYear[y][m].forEach(function (h) {
          var meta = h.description || "PDF · Google ドライブで開く";
          html +=
            '<li><a href="' +
            esc(h.url) +
            '" target="_blank" rel="noopener noreferrer">' +
            '<span class="link-icon" aria-hidden="true">📄</span><span>' +
            esc(h.title) +
            '<span class="link-meta">' +
            esc(meta) +
            "</span></span></a></li>";
        });
        html += "</ul></div>";
      });
      html += "</div>";
    });
    el.innerHTML = html;
  }

  function showError(msg) {
    var nodes = document.querySelectorAll("[data-content]");
    nodes.forEach(function (el) {
      el.innerHTML =
        '<p class="note"><strong>データ読み込みエラー:</strong> ' +
        esc(msg) +
        "</p>";
    });
  }

  function init() {
    var data = getContent();
    if (!data) {
      showError("content-data.js が見つかりません。python build_content.py を実行してください。");
      return;
    }
    var count = (data.settings && data.settings.topNewsCount) || 5;
    var news = data.news || [];
    var newsletters = data.newsletters || [];
    var handouts = data.handouts || [];

    var topNews = document.querySelector('[data-content="top-news"]');
    if (topNews) renderTopNews(topNews, news, count);

    var archiveNews = document.querySelector('[data-content="archive-news"]');
    if (archiveNews) renderArchiveNews(archiveNews, news);

    var topNl = document.querySelector('[data-content="top-newsletter"]');
    if (topNl) renderTopNewsletter(topNl, newsletters);

    var archiveNl = document.querySelector('[data-content="archive-newsletters"]');
    if (archiveNl) renderArchiveNewsletters(archiveNl, newsletters);

    var topHandouts = document.querySelector('[data-content="top-handouts"]');
    if (topHandouts) renderTopHandouts(topHandouts, handouts);

    var archiveHandouts = document.querySelector('[data-content="archive-handouts"]');
    if (archiveHandouts) renderArchiveHandouts(archiveHandouts, handouts);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
