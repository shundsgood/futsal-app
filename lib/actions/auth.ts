"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string).trim();
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("メールアドレスまたはパスワードが違います");

  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const email = (formData.get("email") as string).trim();
  const password = formData.get("password") as string;
  const displayName = (formData.get("displayName") as string).trim();

  if (!displayName) throw new Error("表示名は必須です");
  if (password.length < 6) throw new Error("パスワードは6文字以上で入力してください");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) throw new Error("登録に失敗しました: " + error.message);

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
