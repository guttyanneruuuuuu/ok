# 🍣 Sushi Dash (スシダッシュ)

短時間で遊べる寿司分類アクション + 寿司ネタガチャコレクションゲーム。
100% Vanilla JS / HTML / CSS で動作し、ビルド不要・サーバー不要。
GitHub Pages や Cloudflare Pages にそのまま置くだけで運営できます。

## 🎮 ゲーム内容

- 30秒間、ベルトコンベアで流れてくる寿司を **正しい色の皿** にクリックで仕分け
- スコアに応じてコイン獲得
- コインで **寿司ネタガチャ** を引いてコレクション
- レアネタを集めると図鑑が埋まる達成感

1プレイ約30〜60秒。サクッと遊んで、ガチャで満足。

## 💰 収益化設計（将来の拡張）

ベース設計はそのままに、後から差し込めるよう抽象化済み：

| 収益化施策 | 実装箇所の想定 |
|---|---|
| バナー広告 | `index.html` のフッター枠（既に `.ad-slot` を配置済み） |
| リワード広告 | 「広告を見てコイン+50」ボタン（`game.js` の `rewardCoins()` を呼ぶだけ） |
| インタースティシャル | ガチャ後の演出に差し込み可能 |
| 課金（有料石） | コインとは別の `gems` 通貨を `state` に追加するだけ |
| アプリ化 | Capacitor / TWA で iOS / Android 化、ストア課金へ |

サーバーレス（LocalStorage 保存）なので、運営コストは **完全に 0 円**。

## 🛠 技術スタック

- Vanilla HTML / CSS / JavaScript（ビルドなし）
- LocalStorage（セーブデータ）
- フォント: Google Fonts (Kosugi Maru)

## 🚀 ローカル実行

```bash
# どんな静的サーバーでもOK
python3 -m http.server 8000
# → http://localhost:8000
```

## 🌐 デプロイ

- **GitHub Pages**: `main` ブランチを Pages 設定で公開するだけ
- **Cloudflare Pages**: リポジトリ連携、ビルドコマンドなし、出力ディレクトリ `/`

## 📁 ファイル構成

```
/
├── index.html      # エントリーポイント
├── css/
│   └── style.css   # 明るい和風デザイン
├── js/
│   ├── game.js     # ゲーム本体
│   ├── gacha.js    # ガチャシステム
│   ├── storage.js  # セーブデータ
│   └── data.js     # 寿司ネタマスター
└── README.md
```

## 📝 ライセンス

MIT
