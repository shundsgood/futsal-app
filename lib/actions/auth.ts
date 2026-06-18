"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData): Promise<{ error: string } | undefined> {
  const supabase = await createClient();
  const email = (formData.get("email") as string).trim();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "メールアドレスまたはパスワードが違います" };
}

export async function signUp(formData: FormData): Promise<{ error: string } | undefined> {
  const supabase = await createClient();
  const email = (formData.get("email") as string).trim();
  const password = formData.get("password") as string;
  const displayName = (formData.get("displayName") as string).trim();

  if (!displayName) return { error: "表示名は必須です" };
  if (password.length < 6) return { error: "パスワードは6文字以上で入力してください" };

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) return { error: "登録に失敗しました: " + error.message };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
