# 小室ハイランド自治会 広報サイト

小室ハイランド自治会の公式広報用 Web サイトです。静的 HTML で構成され、[GitHub Pages](https://jichikai-kmr-hl.github.io/pr-homepage/) で公開します。

ローカルでは `index.html` をブラウザで開くと、完成イメージをそのまま確認できます。

> **作成の経緯・要件・資産の説明:** 詳細は [`作成記録.md`](./作成記録.md) を参照してください。

## 公開 URL

- サイト: https://jichikai-kmr-hl.github.io/pr-homepage/
- リポジトリ: https://github.com/jichikai-kmr-hl/pr-homepage

## フォルダ構成

```
pr-homepage/
├── index.html          … トップ（最新お知らせ5件・最新広報紙・各種配布物・ML参加QR）
├── news.html           … 過去のお知らせ（年月別）
├── newsletters.html    … 広報紙アーカイブ（年別）
├── handouts.html       … 各種配布物（年月別・CSV描画）
├── rules.html          … 規約・規程一覧
├── useful.html         … お役立ち情報（船橋市リンク等）
├── css/style.css       … 共通デザイン
├── js/                 … お知らせ・広報紙・各種配布物の描画
├── data/               … CSV（お知らせ・広報紙・各種配布物）
├── assets/
│   ├── logo.png            … 自治会公式ロゴ（丸・左画像）
│   ├── logo-full.png       … 同ロゴ（切り出し原寸）
│   ├── hero.jpg            … トップ用アイキャッチ（16:9）
│   ├── hero-square.jpg     … アイキャッチ正方形版（任意）
│   └── qr-mailinglist.png  … 広報ML参加用QR
├── build_content.py        … CSV → js/content-data.js
├── .nojekyll               … GitHub Pages で Jekyll を無効化
├── README.md               … 使い方
└── 作成記録.md             … 要件・経緯・デザイン・更新履歴
```

## ページと要件の対応

| 要件 | ページ |
|------|--------|
| 1. お知らせ（最新最大5件） | `index.html` |
| 1. 過去お知らせ（年月別） | `news.html` |
| 2. 最新広報紙リンク | `index.html` / `newsletters.html` |
| 2. 過去広報紙（年別） | `newsletters.html` |
| 3. 各種配布物（年月別 PDF） | `handouts.html`（トップは直近3件） |
| 4. 規約・規程 | `rules.html`（トップは導線のみ） |
| 5. お役立ち情報 | `useful.html` |
| 6. 広報ML参加QR | `index.html` の「メール配信」セクション |

広報ML URL: https://groups.google.com/g/jichikaikmrhlpr

## デザインについて

添付ロゴと同じテイストにしています。

- 背景: クリーム系 `#fbf8f1`
- メインカラー: ソフトブルー `#6ba3c8`
- アクセント: 緑・オレンジ（ロゴの丘・手の輪郭に合わせる）
- 大きめの文字・丸いカード・シンプルなナビ（高齢の方向けに見やすく）

## お知らせ・広報紙・各種配布物の更新（HTML 不要）

CSV を編集してビルドするだけです。詳細は [`data/README.md`](./data/README.md)。

```powershell
# リポジトリのルートで
# 1. data/news.csv / newsletters.csv / handouts.csv を編集
# 2. ビルド
python build_content.py
# 3. ブラウザ再読み込み（または GitHub Pages へ push）
```

| ファイル | 用途 |
|----------|------|
| `data/news.csv` | お知らせ（日付・タイトル・本文・リンク） |
| `data/newsletters.csv` | 広報紙（年月・タイトル・Drive URL・最新フラグ） |
| `data/handouts.csv` | 各種配布物（年月・タイトル・Drive URL） |
| `data/hero.csv` | キーイメージ（画像名・タイトル・リンクURL） |
| `build_content.py` | CSV → `js/content-data.js` を生成 |
| `js/render.js` | ページへ描画 |
| `js/hero-carousel.js` | トップのキーイメージ・カルーセル |

## 反映前に差し替える箇所

1. **お知らせ・広報紙・各種配布物** → 上記 CSV（HTML は触らない）
2. **規約・規程の Drive リンク** → `rules.html` の各 `href`
3. **お役立ちリンク** → 市サイト改修時は `useful.html` を確認
4. **ロゴ・アイキャッチ** → `assets/logo.png` / `assets/hero.jpg`

## Google Sites への移し方（推奨手順）

Google Sites は HTML のそのまま貼り付けに制限があるため、**見た目と構成を手本に再構築**するのが確実です。

### 1. サイト作成

1. [Google Sites](https://sites.google.com/) を開く
2. 空白のサイトを作成
3. サイト名: **小室ハイランド自治会** など

### 2. ページ構成

次のページを作成します。

| サイトのページ名 | 対応HTML |
|------------------|----------|
| ホーム（トップ） | index.html |
| お知らせ | news.html |
| 広報紙 | newsletters.html |
| 各種配布物 | handouts.html |
| 規約・規程 | rules.html |
| お役立ち情報 | useful.html |

ナビは「ページ」設定で上記を表示。

### 3. ホームのレイアウト例

上から順に:

1. **見出し** … 「ようこそ、小室ハイランド自治会へ」
2. **テキスト** … 短い紹介文
3. **見出し** … お知らせ
4. **テキスト / リスト** … 最新5件（日付＋タイトル）
5. **ボタン** … 「過去のお知らせ」→ お知らせページ
6. **見出し** … 広報紙
7. **ボタン / リンク** … 最新PDF（Drive）・アーカイブページ
8. **見出し** … 各種配布物
9. **リンク** … 直近の配布PDF・年月別一覧ページ
10. **見出し** … 各種リンク
11. **ボタン** … 規約・規程 / お役立ち情報
12. **見出し** … 広報メーリングリスト
13. **画像** … `assets/qr-mailinglist.png` をアップロード
14. **ボタン** … Google グループ参加 URL

### 4. 色の設定（Sites のテーマ）

- メイン: 青系（`#6ba3c8` 前後）
- 背景: オフホワイト / クリーム
- ボタン: 青またはオレンジ（ML参加ボタン）

### 5. Drive PDF の載せ方

1. Drive で PDF を「リンクを知っている全員が閲覧可」（運用方針に合わせて調整）
2. リンクをコピー
3. Sites の「ボタン」または「テキストリンク」に貼る

### 6. QR 画像

`assets/qr-mailinglist.png` を Sites に画像として挿入。  
再生成する場合の例:

```
https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=https://groups.google.com/g/jichikaikmrhlpr
```

## ローカルでのプレビュー

エクスプローラーで `index.html` をダブルクリックするか、次を実行:

```powershell
Start-Process "C:\Users\kabuk\Documents\komuro-highland-jichikai-site\index.html"
```

## 運用のポイント

- **トップは最新情報のみ**（お知らせ5件・最新広報紙・各種配布物直近・主要導線・ML）
- **過去・詳細は別ページ**（お知らせ年月別、広報紙年別、各種配布物年月別、規約一覧）
- **個人情報は載せない**（行事・市からのお知らせなど公開可能な情報中心）
- 紙配布との併用期間を想定し、サイトは「見に来る人向け」、メールは「届ける手段」として役割分担

## 補足

- この環境から Google アカウントにログインして Sites を直接作成することはできません。HTML を確認したうえで、Sites に手作業で反映してください。
- お知らせのサンプル文面は仮のものです。実運用時は必ず差し替えてください。
