import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export const getCurrentUser = cache(async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const displayName =
    (user.user_metadata?.display_name as string | undefined) ??
    user.email!.split("@")[0];

  try {
    return await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email!,
        displayName,
      },
    });
  } catch {
    // メールアドレスの一意制約違反など: 既存レコードを email で検索して返す
    const existing = await prisma.user.findUnique({ where: { email: user.email! } });
    if (existing) return existing;
    throw new Error("ユーザー情報の取得に失敗しました");
  }
});
