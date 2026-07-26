# お知らせ・広報紙・各種配布物・キーイメージの更新方法（CSV）

HTML を編集せず、CSV を直してビルドするだけで更新できます。

## 手順

1. このフォルダの CSV を編集する（Excel 可。**UTF-8 CSV** で保存）
2. プロジェクト直下で次を実行する

```powershell
cd C:\Users\kabuk\Documents\work\kmr-hl\pr-homepage
python build_content.py
```

3. ブラウザでページを再読み込みする

生成されるファイル: `js/content-data.js`（自動生成・手編集不要）

---

## news.csv（お知らせ）

| 列名 | 必須 | 説明 |
|------|------|------|
| `date` | ○ | 日付 `YYYY-MM-DD`（例: `2026-07-01`） |
| `title` | ○ | タイトル |
| `body` | | 本文・要約 |
| `link` | | 詳細リンク（空なら `news.html#日付`）。外部URL可 |
| `badge` | | 例: `NEW`（トップの最新件に表示） |

- トップには **新しい日付から最大5件**
- 過去一覧は **年月別に自動グループ化**

### 例

```csv
date,title,body,link,badge
2026-07-01,夏の防犯パトロール実施のお知らせ,7月より夕方の見回りを実施します。,,NEW
2026-06-15,広報紙6月号を発行しました,最新号を公開しました。,newsletters.html,
```

---

## newsletters.csv（広報紙）

| 列名 | 必須 | 説明 |
|------|------|------|
| `year` | ○ | 発行年（例: `2026`） |
| `month` | ○ | 発行月 `1`〜`12` |
| `title` | ○ | 表示名（例: `タウンタウン 2026年6月号`） |
| `url` | ○ | Google ドライブ等の PDF リンク |
| `latest` | | 最新号なら `1`（1件だけ推奨）。空なら一番新しい年月を自動で最新に |
| `description` | | 補足文（トップのカード説明など） |

- 年別に自動グループ化
- `latest=1` の号がトップの「最新号」カードになる

### 例

```csv
year,month,title,url,latest,description
2026,6,タウンタウン 2026年6月号,https://drive.google.com/file/d/xxxx/view,1,最新号（PDF）
2026,5,タウンタウン 2026年5月号,https://drive.google.com/file/d/yyyy/view,0,
```

---

## hero.csv（トップ・キーイメージ／カルーセル）

| 列名 | 必須 | 説明 |
|------|------|------|
| `image` | ○ | 画像ファイル名（`assets/hero-candidates/` 配下）。例: `01-park-multigen.jpg` |
| `title` | ○ | 表示タイトル（キャプション・代替テキスト） |
| `url` | | クリック時のリンク先。空ならリンクなし。外部URL可 |

- 並び順＝カルーセルの表示順
- 自動再生間隔は `build_content.py` の `settings.heroIntervalMs`（既定 10000ms）
- 画像はあらかじめ `assets/hero-candidates/` に置いてから CSV に書いてください

### 例

```csv
image,title,url
00-current-hero-05tone.jpg,団地と公園の日常,
01-park-multigen.jpg,公園と多世代のくらし,newsletters.html
03-school-morning.jpg,団地と文教の朝,https://example.com/
05-morning-sky.jpg,朝の青空のもとで,handouts.html
```

---

## handouts.csv（各種配布物）

| 列名 | 必須 | 説明 |
|------|------|------|
| `year` | ○ | 配布年（例: `2026`） |
| `month` | ○ | 配布月 `1`〜`12` |
| `title` | ○ | 表示名（例: `総会資料 2026年度`） |
| `url` | ○ | Google ドライブ等の PDF リンク |
| `description` | | 補足文（一覧のメタ表示など） |

- **年月別に自動グループ化**（年 → 月）
- 同じ年月に複数件あっても問題ありません
- トップには新しいものから最大3件を表示

### 例

```csv
year,month,title,url,description
2026,7,夏休みの注意喚起チラシ,https://drive.google.com/file/d/xxxx/view,回覧・配布
2026,4,総会資料 2026年度,https://drive.google.com/file/d/yyyy/view,総会で配布した資料
2025,12,年末回覧,https://drive.google.com/file/d/zzzz/view,
```

---

## 注意

- Excel で開いて保存する場合、文字化けしたら「CSV UTF-8（コンマ区切り）」で保存
- タイトルや本文にカンマを含む場合は、Excel が自動でダブルクォートで囲みます（問題ありません）
- HTML（`index.html` 等）は通常いじりません
- Google Sites に載せる場合は、ビルド後の表示内容をコピーするか、CSV→Sites に手で反映してください
