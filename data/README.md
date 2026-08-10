# お知らせ・広報紙・各種配布物・行事予定・キーイメージの更新方法（CSV）

HTML を編集せず、CSV を直してビルドするだけで更新できます。

## 手順

1. このフォルダの CSV を編集する（Excel 可。**UTF-8 CSV** で保存）
2. 変更を commit / push する

**GitHub Actions** が `python build_content.py` を実行し、`js/content-data.js` を自動更新して push します。  
ローカルで先に確認したい場合は次を実行してください。

```powershell
cd C:\Users\kabuk\Documents\work\kmr-hl\pr-homepage
python build_content.py
```

3. ブラウザでページを再読み込みする（GitHub Pages 反映後）

生成されるファイル: `js/content-data.js`（自動生成・手編集不要）

### Actions の対象

| きっかけ | 内容 |
|----------|------|
| `data/**/*.csv` の push | ビルド → 差分があれば `content-data.js` をコミット |
| `build_content.py` の push | 同上 |
| 手動実行（workflow_dispatch） | Actions 画面からいつでも実行可 |

生成結果だけが push されるため、CSV 以外の変更では再実行されません（無限ループ防止）。

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
| `description` | | **記事の見出し（概要）**。複数行可（下記参照） |

- 年別に自動グループ化
- `latest=1` の号はタイトル横に **最新号** ラベルが表示され、トップの「最新号」カードにもなります
- `description` はアーカイブ一覧で見出しリストとして表示されます

### 概要（見出し）の複数行入力

どちらの書き方でも同じ結果になります。

1. **Excel でセル内改行**（`Alt + Enter`）してから UTF-8 CSV で保存  
2. **1行で `|`（パイプ）区切り**にする（テキストエディタ向け）

### 例

```csv
year,month,title,url,latest,description
2026,8,タウンタウン 2026年8月号,https://drive.google.com/file/d/xxxx/view,1,夏の防犯パトロール|盆踊りのご案内|ごみ出しの注意
2026,7,タウンタウン 2026年7月号,https://drive.google.com/file/d/yyyy/view,0,夏休みの注意喚起|熱中症予防
```

Excel のセル内改行を使う場合のイメージ:

| description |
|-------------|
| 夏の防犯パトロール<br>盆踊りのご案内<br>ごみ出しの注意 |

---

## events.csv（年間行事予定）

| 列名 | 必須 | 説明 |
|------|------|------|
| `year` | ○ | 年（例: `2026`） |
| `month` | ○ | 月 `1`〜`12` |
| `day` | | 日 `1`〜`31`。未定なら空欄（「7月」のように月単位表示） |
| `title` | ○ | 行事名 |
| `start_time` | | 開始時刻（例: `10:00`） |
| `end_time` | | 終了時刻（例: `12:00`） |
| `location` | | 場所名 |
| `map_url` | | Google マップ等の URL（場所名に「地図」リンクが付く） |
| `link` | | 外部の参考情報 URL |
| `link_label` | | 参考リンクの表示名（空なら「参考情報」） |
| `description` | | 説明。**複数行可**（下記） |

- 一覧ページは **年 → 月** の時系列（古い順）。時刻・場所・地図・参考リンク・説明を表示
- トップには **当月を含む直近3ヶ月** の予定（過ぎた日は非表示）
- 日程変更時は CSV を直してビルドするだけで反映

### 説明の複数行入力

広報紙の見出しと同様です。

1. Excel でセル内改行（`Alt + Enter`）
2. 1行で `|` 区切り

### 例

```csv
year,month,day,title,start_time,end_time,location,map_url,link,link_label,description
2026,4,20,定期総会,10:00,12:00,小室コミュニティセンター,https://www.google.com/maps/search/?api=1&query=小室コミュニティセンター,,,活動報告と役員選出|資料は当日配布
2026,7,,夏の防犯パトロール,18:30,20:00,団地内各所,,https://www.city.funabashi.lg.jp/,船橋市の防犯情報,7月より夕方の見回り
2026,8,16,盆踊り・夏祭り,16:00,21:00,団地内公園,,,,雨天時は中止または延期|出店あり
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
