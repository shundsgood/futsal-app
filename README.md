# フットサル管理アプリ

チームの日程調整・メンバー管理・試合記録を行うフットサル向け Web アプリです。

## 技術スタック

| 項目 | 内容 |
|------|------|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| DB | Supabase (PostgreSQL) |
| ORM | Prisma 7 |
| 認証 | Supabase Auth（メール＋パスワード） |
| デプロイ | Vercel |

---

## セットアップ

### 1. 環境変数

`.env.example` をコピーして `.env` を作成します。

```bash
cp .env.example .env
```

| 変数 | 用途 | 取得元 |
|------|------|--------|
| `DATABASE_URL` | アプリ runtime（Transaction Pooler・port 6543） | Supabase → Project Settings → Database → Transaction pooler |
| `DIRECT_URL` | `prisma migrate` 専用（Session Pooler・port 5432） | Supabase → Project Settings → Database → Session pooler |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | Supabase → Project Settings → API → Publishable key |

### 2. DB マイグレーション

```bash
npx prisma migrate dev    # 開発時・スキーマ変更時
npx prisma migrate deploy # 本番 DB への適用
```

> `migrate dev` は shadow DB を作成するため本番環境では実行しないでください。

### 3. 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

---

## Supabase 設定

### Authentication

- **Providers → Email → Confirm email**: 開発中は OFF 推奨（メール送信なしで即ログイン可能）

---

## デプロイ（Vercel）

1. GitHub リポジトリを Vercel に接続
2. Environment Variables に上記4つの環境変数を設定（Production / Preview / Development すべてにチェック）
3. `main` ブランチへの push で自動デプロイ

本番 DB へのマイグレーションは Vercel の build コマンドに含めるか、手動で `npx prisma migrate deploy` を実行してください。
