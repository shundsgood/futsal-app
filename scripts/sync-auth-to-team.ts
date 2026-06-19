/**
 * Supabase Auth に登録されている全ユーザーを指定チームのメンバーに追加する暫定スクリプト。
 *
 * 使い方:
 *   npx tsx scripts/sync-auth-to-team.ts <teamId>
 *
 * 例:
 *   npx tsx scripts/sync-auth-to-team.ts clxxxxxxxxxxxxxxxxxx
 */

import "dotenv/config";
import { Pool } from "pg";
import { PrismaClient } from "../app/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

const teamId = process.argv[2];
if (!teamId) {
  console.error("使い方: npx tsx scripts/sync-auth-to-team.ts <teamId>");
  process.exit(1);
}

async function main() {
  // auth.users を直接 PostgreSQL で取得
  const pool = new Pool({ connectionString: process.env.DIRECT_URL });
  const { rows: authUsers } = await pool.query<{
    id: string;
    email: string;
    raw_user_meta_data: { display_name?: string } | null;
  }>(`SELECT id, email, raw_user_meta_data FROM auth.users ORDER BY created_at`);
  await pool.end();

  console.log(`Supabase Auth ユーザー数: ${authUsers.length}`);

  // Prisma クライアント
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const prisma = new PrismaClient({ adapter });

  // チーム存在確認
  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) {
    console.error(`チームが見つかりません: ${teamId}`);
    await prisma.$disconnect();
    process.exit(1);
  }
  console.log(`対象チーム: ${team.name}\n`);

  let addedUsers = 0;
  let addedMembers = 0;
  let skipped = 0;

  for (const authUser of authUsers) {
    const displayName =
      authUser.raw_user_meta_data?.display_name ??
      authUser.email.split("@")[0];

    // User レコードを upsert
    const user = await prisma.user.upsert({
      where: { id: authUser.id },
      update: {},
      create: {
        id: authUser.id,
        email: authUser.email,
        displayName,
      },
    }).catch(async () => {
      // メール重複の場合は既存レコードを返す
      return prisma.user.findUnique({ where: { email: authUser.email } });
    });

    if (!user) {
      console.warn(`  スキップ (User 取得失敗): ${authUser.email}`);
      continue;
    }

    if (user.id === authUser.id && user.email === authUser.email) {
      addedUsers++;
    }

    // TeamMember を作成（既存なら skip）
    const existing = await prisma.teamMember.findFirst({
      where: { teamId, userId: user.id },
    });

    if (existing) {
      console.log(`  既存: ${displayName} (${authUser.email})`);
      skipped++;
    } else {
      await prisma.teamMember.create({
        data: {
          teamId,
          userId: user.id,
          displayName,
          role: "member",
          membershipStatus: "active",
        },
      });
      console.log(`  追加: ${displayName} (${authUser.email})`);
      addedMembers++;
    }
  }

  await prisma.$disconnect();

  console.log(`\n完了`);
  console.log(`  User 同期: ${addedUsers} 件`);
  console.log(`  メンバー追加: ${addedMembers} 件`);
  console.log(`  スキップ (既存): ${skipped} 件`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
