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

  /** 広報紙の記事見出し一覧（headlines 優先、なければ description を分割） */
  function newsletterHeadlines(item) {
    if (item.headlines && item.headlines.length) {
      return item.headlines;
    }
    var d = item.description || "";
    if (!d) return [];
    return d
      .split(/\r?\n|\|/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function renderHeadlinesHtml(headlines, className) {
    if (!headlines || !headlines.length) return "";
    var cls = className || "newsletter-headlines";
    return (
      '<ul class="' +
      cls +
      '">' +
      headlines
        .map(function (h) {
          return "<li>" + esc(h) + "</li>";
        })
        .join("") +
      "</ul>"
    );
  }

  function eventDateLabel(item) {
    if (item.day != null && item.day !== "") {
      return item.month + "/" + item.day;
    }
    return item.month + "月";
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

  function renderNewsletterListItem(n) {
    var headlines = newsletterHeadlines(n);
    var latestBadge = n.latest
      ? '<span class="badge-latest">最新号</span>'
      : "";
    var headlinesHtml = renderHeadlinesHtml(headlines);
    var metaFallback = headlines.length
      ? ""
      : '<span class="link-meta">PDF · Google ドライブで開く</span>';
    return (
      '<li class="newsletter-item' +
      (n.latest ? " is-latest" : "") +
      '"><a href="' +
      esc(n.url) +
      '" target="_blank" rel="noopener noreferrer">' +
      '<span class="link-icon" aria-hidden="true">📄</span>' +
      '<span class="newsletter-item-body">' +
      '<span class="newsletter-item-title">' +
      esc(n.title) +
      latestBadge +
      "</span>" +
      headlinesHtml +
      metaFallback +
      "</span></a></li>"
    );
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
    var headlines = newsletterHeadlines(latest);
    var bodyHtml = headlines.length
      ? renderHeadlinesHtml(headlines, "newsletter-headlines card-headlines")
      : '<p class="card-desc">' +
        esc(latest.description || "Google ドライブ上の最新号を開きます。") +
        "</p>";
    el.innerHTML =
      '<article class="card">' +
      '<a class="card-link" href="' +
      esc(latest.url) +
      '" target="_blank" rel="noopener noreferrer">' +
      '<div class="card-icon" aria-hidden="true">' +
      '<img src="assets/icons/icon-paper.png" width="48" height="48" alt="" />' +
      "</div>" +
      '<div class="card-label">最新号</div>' +
      '<h3 class="card-title">' +
      esc(latest.title) +
      '（PDF） <span class="badge-latest">最新号</span></h3>' +
      bodyHtml +
      "</a></article>" +
      '<article class="card">' +
      '<a class="card-link" href="newsletters.html">' +
      '<div class="card-icon" aria-hidden="true">' +
      '<img src="assets/icons/icon-paper.png" width="48" height="48" alt="" />' +
      "</div>" +
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
    // 年 → 月 でグループ化（他のアーカイブと同じく月の区切り線を表示）
    var byYear = {};
    newsletters.forEach(function (n) {
      if (!byYear[n.year]) byYear[n.year] = {};
      if (!byYear[n.year][n.month]) byYear[n.year][n.month] = [];
      byYear[n.year][n.month].push(n);
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
          '</h3><ul class="link-list newsletter-list">';
        byYear[y][m].forEach(function (n) {
          html += renderNewsletterListItem(n);
        });
        html += "</ul></div>";
      });
      html += "</div>";
    });
    el.innerHTML = html;
  }

  function eventDescriptionLines(item) {
    if (item.descriptionLines && item.descriptionLines.length) {
      return item.descriptionLines;
    }
    var d = item.description || "";
    if (!d) return [];
    return d
      .split(/\r?\n|\|/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function eventTimeLabel(item) {
    var start = item.start_time || "";
    var end = item.end_time || "";
    if (start && end) return start + " – " + end;
    if (start) return start + " 開始";
    if (end) return end + " まで";
    return "";
  }

  function renderEventMeta(item, detailed) {
    var parts = [];
    var time = eventTimeLabel(item);
    if (time) {
      parts.push(
        '<span class="event-meta-item event-time"><span class="event-meta-icon" aria-hidden="true">🕐</span>' +
          esc(time) +
          "</span>"
      );
    }
    if (item.location) {
      var locInner = esc(item.location);
      if (detailed && item.map_url) {
        locInner =
          '<a href="' +
          esc(item.map_url) +
          '" target="_blank" rel="noopener noreferrer">' +
          locInner +
          "（地図）</a>";
      }
      parts.push(
        '<span class="event-meta-item event-location"><span class="event-meta-icon" aria-hidden="true">📍</span>' +
          locInner +
          "</span>"
      );
    } else if (detailed && item.map_url) {
      parts.push(
        '<span class="event-meta-item event-location"><span class="event-meta-icon" aria-hidden="true">📍</span>' +
          '<a href="' +
          esc(item.map_url) +
          '" target="_blank" rel="noopener noreferrer">地図を開く</a></span>'
      );
    }
    if (detailed && item.link) {
      parts.push(
        '<span class="event-meta-item event-ref"><span class="event-meta-icon" aria-hidden="true">🔗</span>' +
          '<a href="' +
          esc(item.link) +
          '" target="_blank" rel="noopener noreferrer">' +
          esc(item.link_label || "参考情報") +
          "</a></span>"
      );
    }
    if (!parts.length) return "";
    return '<div class="event-meta">' + parts.join("") + "</div>";
  }

  function renderEventItem(item, opts) {
    opts = opts || {};
    var detailed = !!opts.detailed;
    var dateHtml =
      '<span class="event-date">' + esc(String(eventDateLabel(item))) + "</span>";
    var lines = eventDescriptionLines(item);
    var desc = "";
    if (lines.length) {
      if (detailed) {
        desc =
          '<ul class="event-desc-list">' +
          lines
            .map(function (line) {
              return "<li>" + esc(line) + "</li>";
            })
            .join("") +
          "</ul>";
      } else {
        // トップは1行要約
        desc = '<p class="event-desc">' + esc(lines[0]) + "</p>";
      }
    }
    return (
      '<li class="event-item' +
      (detailed ? " event-item-detailed" : "") +
      '">' +
      dateHtml +
      '<div class="event-body">' +
      '<p class="event-title">' +
      esc(item.title) +
      "</p>" +
      renderEventMeta(item, detailed) +
      desc +
      "</div></li>"
    );
  }

  /** 当月を含む直近 N ヶ月（過去の日付は除く） */
  function isInNearMonths(item, now, months) {
    months = months || 3;
    var y = now.getFullYear();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    var nowIdx = y * 12 + m;
    var itemIdx = item.year * 12 + item.month;
    if (itemIdx < nowIdx || itemIdx >= nowIdx + months) return false;
    if (itemIdx === nowIdx) {
      if (item.day != null && item.day !== "") {
        return Number(item.day) >= d;
      }
    }
    return true;
  }

  function renderTopEvents(el, events, months) {
    if (!events.length) {
      el.innerHTML =
        '<p class="card-desc">行事予定はまだ登録されていません。</p>';
      return;
    }
    var now = new Date();
    var list = events.filter(function (e) {
      return isInNearMonths(e, now, months);
    });
    if (!list.length) {
      el.innerHTML =
        '<p class="card-desc">直近' +
        months +
        "ヶ月の予定はありません。</p>";
      return;
    }
    // 一覧ページと同じ詳細表示（時刻・場所・地図・参考リンク・複数行説明）
    // 一覧への導線はセクション見出しの more-link のみ
    var html =
      '<ul class="event-list">' +
      list
        .map(function (item) {
          return renderEventItem(item, { detailed: true });
        })
        .join("") +
      "</ul>";
    el.innerHTML = html;
  }

  function renderArchiveEvents(el, events) {
    if (!events.length) {
      el.innerHTML = "<p>行事予定はまだ登録されていません。</p>";
      return;
    }
    var byYear = {};
    events.forEach(function (e) {
      if (!byYear[e.year]) byYear[e.year] = {};
      if (!byYear[e.year][e.month]) byYear[e.year][e.month] = [];
      byYear[e.year][e.month].push(e);
    });
    var years = Object.keys(byYear)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
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
          return a - b;
        });
      months.forEach(function (m) {
        html +=
          '<div class="month-group"><h3 class="month-heading">' +
          monthLabel(m) +
          '</h3><ul class="event-list">';
        byYear[y][m].forEach(function (item) {
          html += renderEventItem(item, { detailed: true });
        });
        html += "</ul></div>";
      });
      html += "</div>";
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
      '<article class="card" style="grid-column:1/-1">' +
      '<div class="card-icon" aria-hidden="true">' +
      '<img src="assets/icons/icon-folder.png" width="48" height="48" alt="" />' +
      "</div>" +
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
    var eventsMonths = (data.settings && data.settings.topEventsMonths) || 3;
    var news = data.news || [];
    var newsletters = data.newsletters || [];
    var handouts = data.handouts || [];
    var events = data.events || [];

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

    var topEvents = document.querySelector('[data-content="top-events"]');
    if (topEvents) renderTopEvents(topEvents, events, eventsMonths);

    var archiveEvents = document.querySelector('[data-content="archive-events"]');
    if (archiveEvents) renderArchiveEvents(archiveEvents, events);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
