#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
data/news.csv・newsletters.csv・handouts.csv・hero.csv・events.csv を読み込み、
js/content-data.js を生成します。

使い方:
  python build_content.py

更新手順:
  1. data/*.csv を編集（Excel でも可。保存は UTF-8 CSV）
  2. このスクリプトを実行
  3. HTML は変更不要。ブラウザを再読み込み
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
OUT = ROOT / "js" / "content-data.js"


def read_csv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        raise SystemExit(f"ファイルがありません: {path}")
    # utf-8-sig: Excel が付ける BOM に対応
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            raise SystemExit(f"ヘッダがありません: {path}")
        rows = []
        for row in reader:
            # 空行スキップ
            if not any((v or "").strip() for v in row.values()):
                continue
            cleaned = {
                (k or "").strip(): (v or "").strip()
                for k, v in row.items()
                if k is not None
            }
            rows.append(cleaned)
        return rows


def parse_news(rows: list[dict[str, str]]) -> list[dict]:
    items = []
    for r in rows:
        date = r.get("date", "")
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
            print(f"警告: 日付形式が不正です（YYYY-MM-DD）: {date!r} — スキップ")
            continue
        items.append(
            {
                "date": date,
                "title": r.get("title", ""),
                "body": r.get("body", ""),
                "link": r.get("link", ""),
                "badge": r.get("badge", ""),
            }
        )
    # 新しい順
    items.sort(key=lambda x: x["date"], reverse=True)
    return items


def split_multiline(raw: str) -> list[str]:
    """
    複数行テキストを分割する（広報紙見出し・行事の説明など）。
    - セル内改行（Excel の Alt+Enter）
    - または区切り文字 |（1行で書く場合）
    """
    if not raw:
        return []
    # リテラル \\n も改行として扱う
    text = raw.replace("\\n", "\n")
    parts = re.split(r"[\r\n|]+", text)
    return [p.strip() for p in parts if p and p.strip()]


# 後方互換エイリアス
split_headlines = split_multiline


def parse_newsletters(rows: list[dict[str, str]]) -> list[dict]:
    items = []
    for r in rows:
        try:
            year = int(r.get("year", "0"))
            month = int(r.get("month", "0"))
        except ValueError:
            print(f"警告: 年月が不正: {r} — スキップ")
            continue
        if not (1 <= month <= 12) or year < 1900:
            print(f"警告: 年月の範囲外: year={year} month={month} — スキップ")
            continue
        latest_raw = (r.get("latest") or "").lower()
        latest = latest_raw in ("1", "true", "yes", "y", "○", "最新")
        headlines = split_headlines(r.get("description", ""))
        items.append(
            {
                "year": year,
                "month": month,
                "title": r.get("title", ""),
                "url": r.get("url", "") or "https://drive.google.com/",
                "latest": latest,
                # 後方互換: 単一文としても使える
                "description": " / ".join(headlines) if headlines else "",
                # 記事見出し（複数行）
                "headlines": headlines,
            }
        )
    # 新しい順
    items.sort(key=lambda x: (x["year"], x["month"]), reverse=True)
    # latest が複数 or 無しの場合は最新の1件だけ true
    if items:
        has_flag = any(x["latest"] for x in items)
        if not has_flag:
            items[0]["latest"] = True
        else:
            first = True
            for x in items:
                if x["latest"]:
                    if first:
                        first = False
                    else:
                        x["latest"] = False
    return items


def parse_events(rows: list[dict[str, str]]) -> list[dict]:
    """年間行事予定。年月（日は任意）・時刻・場所・リンク対応。"""
    items = []
    for r in rows:
        try:
            year = int(r.get("year", "0"))
            month = int(r.get("month", "0"))
        except ValueError:
            print(f"警告: 年月が不正: {r} — スキップ")
            continue
        if not (1 <= month <= 12) or year < 1900:
            print(f"警告: 年月の範囲外: year={year} month={month} — スキップ")
            continue
        day_raw = (r.get("day") or "").strip()
        day: int | None
        if day_raw == "":
            day = None
        else:
            try:
                day = int(day_raw)
            except ValueError:
                print(f"警告: 日が不正: {day_raw!r} — 日なしとして扱う")
                day = None
            if day is not None and not (1 <= day <= 31):
                print(f"警告: 日の範囲外: day={day} — 日なしとして扱う")
                day = None
        desc_lines = split_multiline(r.get("description", ""))
        link = (r.get("link") or "").strip()
        link_label = (r.get("link_label") or "").strip()
        if link and not link_label:
            link_label = "参考情報"
        items.append(
            {
                "year": year,
                "month": month,
                "day": day,
                "title": r.get("title", ""),
                "start_time": (r.get("start_time") or "").strip(),
                "end_time": (r.get("end_time") or "").strip(),
                "location": (r.get("location") or "").strip(),
                "map_url": (r.get("map_url") or "").strip(),
                "link": link,
                "link_label": link_label,
                "description": "\n".join(desc_lines),
                "descriptionLines": desc_lines,
            }
        )
    # 古い順（年間予定は時系列で読みやすい）
    items.sort(
        key=lambda x: (x["year"], x["month"], x["day"] if x["day"] is not None else 0)
    )
    return items


def parse_handouts(rows: list[dict[str, str]]) -> list[dict]:
    """各種配布物（年月別 PDF リンク）。"""
    items = []
    for r in rows:
        try:
            year = int(r.get("year", "0"))
            month = int(r.get("month", "0"))
        except ValueError:
            print(f"警告: 年月が不正: {r} — スキップ")
            continue
        if not (1 <= month <= 12) or year < 1900:
            print(f"警告: 年月の範囲外: year={year} month={month} — スキップ")
            continue
        items.append(
            {
                "year": year,
                "month": month,
                "title": r.get("title", ""),
                "url": r.get("url", "") or "https://drive.google.com/",
                "description": r.get("description", ""),
            }
        )
    # 新しい順（同月は CSV の順を維持するため、安定ソート）
    items.sort(key=lambda x: (x["year"], x["month"]), reverse=True)
    return items


def parse_hero(rows: list[dict[str, str]]) -> list[dict]:
    """トップ・キーイメージ（カルーセル）。CSV の並び順を維持。"""
    items = []
    hero_dir = ROOT / "assets" / "hero-candidates"
    for r in rows:
        image = (r.get("image") or "").strip()
        title = (r.get("title") or "").strip()
        url = (r.get("url") or "").strip()
        if not image:
            print(f"警告: image が空です: {r} — スキップ")
            continue
        # ファイル名のみの場合は hero-candidates 配下とみなす
        if "/" not in image and "\\" not in image:
            src = f"assets/hero-candidates/{image}"
            disk = hero_dir / image
        else:
            src = image.replace("\\", "/")
            disk = ROOT / src
        if not disk.is_file():
            print(f"警告: 画像ファイルがありません: {disk} — 登録は続行")
        items.append(
            {
                "image": image,
                "src": src,
                "title": title or image,
                "url": url,
            }
        )
    return items


def main() -> None:
    news = parse_news(read_csv(DATA / "news.csv"))
    newsletters = parse_newsletters(read_csv(DATA / "newsletters.csv"))
    handouts = parse_handouts(read_csv(DATA / "handouts.csv"))
    hero = parse_hero(read_csv(DATA / "hero.csv"))
    events = parse_events(read_csv(DATA / "events.csv"))

    payload = {
        "generated": True,
        "news": news,
        "newsletters": newsletters,
        "handouts": handouts,
        "hero": hero,
        "events": events,
        "settings": {
            "topNewsCount": 5,
            "topEventsMonths": 3,
            "heroIntervalMs": 10000,
        },
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    # HTML から script で読めるよう JS 変数として出力
    body = (
        "/* 自動生成ファイルです。手編集しないでください。\n"
        "   更新: data/*.csv を編集 → python build_content.py */\n"
        "window.SITE_CONTENT = "
        + json.dumps(payload, ensure_ascii=False, indent=2)
        + ";\n"
    )
    OUT.write_text(body, encoding="utf-8")

    print(f"生成完了: {OUT}")
    print(f"  お知らせ    : {len(news)} 件")
    print(f"  広報紙      : {len(newsletters)} 件")
    print(f"  各種配布物  : {len(handouts)} 件")
    print(f"  行事予定    : {len(events)} 件")
    print(f"  キーイメージ: {len(hero)} 件")
    latest = next((n for n in newsletters if n["latest"]), None)
    if latest:
        hl = len(latest.get("headlines") or [])
        print(f"  最新号      : {latest['title']}" + (f"（見出し {hl} 件）" if hl else ""))


if __name__ == "__main__":
    main()
