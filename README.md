This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## ⚠️ 認証について

現在の実装は**ダミー認証**（固定ユーザー `dummy-user-01`）を使用しています。
**本番環境では使用しないでください。** 誰がアクセスしても同じユーザーとして扱われ、全チームのデータに無制限アクセスできる状態です。
本番デプロイ前に NextAuth.js・Clerk 等の実認証を実装してください。

---

## セットアップ

### 環境変数

`.env.example` をコピーして `.env` を作成し、Supabase の接続文字列を設定してください。

```bash
cp .env.example .env
```

Supabase の接続文字列は **プロジェクト設定 → Database → Connection string** から取得できます。

| 変数 | 用途 | 取得元 |
|------|------|--------|
| `DATABASE_URL` | アプリ runtime 用（Transaction Pooler・port 6543） | Connection string → Transaction pooler |
| `DIRECT_URL` | `prisma migrate` 専用（Direct・port 5432） | Connection string → Direct connection |

### DB マイグレーション

| コマンド | 用途 |
|---------|------|
| `npx prisma migrate dev` | ローカル開発時・スキーマ変更時（`DIRECT_URL` が必要） |
| `npx prisma migrate deploy` | 本番 DB への適用（CI/CD や Vercel の build hook で実行） |

> **注意:** `migrate dev` は shadow DB を作成するため本番環境では実行しないでください。

### 初期データ（seed）

```bash
npx prisma db seed
```

---

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
