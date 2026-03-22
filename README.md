# 🌌 宇宙感謝ポエム変換器

ネガティブな言葉を、OpenAI APIが「壮大な感謝のポエム」に変換するチャット風Webアプリ。

## ファイル構成

```
negative-to-poem/
├── index.html       # フロントエンド（チャットUI）
├── style.css        # デザイン
├── script.js        # フロントのロジック
├── api/
│   └── poem.js      # Vercel Serverless Function（APIキー隠蔽）
├── vercel.json      # Vercel設定
└── README.md
```

## デプロイ手順

### 1. OpenAI APIキーを取得
1. https://platform.openai.com にアクセス
2. サインアップ（無料）
3. 「API Keys」→「Create new secret key」でキーを発行
4. `sk-...` で始まるキーをメモしておく

### 2. GitHubにpush
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/あなたのユーザー名/negative-to-poem.git
git push -u origin main
```

### 3. Vercelにデプロイ
1. https://vercel.com にアクセス（GitHubでサインアップ）
2. 「Add New Project」→ GitHubリポジトリを選択
3. 「Environment Variables」に追加：
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-xxxxxxxxxxxxxxxx`（メモしたキー）
4. 「Deploy」ボタンをクリック → 完了！

## ローカル開発（任意）

```bash
npm i -g vercel
vercel dev
```

環境変数は `.env.local` ファイルに書く（Gitには含めない）：
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
```
