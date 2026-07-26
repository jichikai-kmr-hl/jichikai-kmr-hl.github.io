#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
data/news.csv・newsletters.csv・handouts.csv を読み込み、
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
        items.append(
            {
                "year": year,
                "month": month,
                "title": r.get("title", ""),
                "url": r.get("url", "") or "https://drive.google.com/",
                "latest": latest,
                "description": r.get("description", ""),
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


def main() -> None:
    news = parse_news(read_csv(DATA / "news.csv"))
    newsletters = parse_newsletters(read_csv(DATA / "newsletters.csv"))
    handouts = parse_handouts(read_csv(DATA / "handouts.csv"))

    payload = {
        "generated": True,
        "news": news,
        "newsletters": newsletters,
        "handouts": handouts,
        "settings": {
            "topNewsCount": 5,
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
    latest = next((n for n in newsletters if n["latest"]), None)
    if latest:
        print(f"  最新号      : {latest['title']}")


if __name__ == "__main__":
    main()
