"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const MEMBERSHIP_STATUSES = ["active", "inactive", "left"] as const;

export async function createMember(teamId: string, formData: FormData) {
  const displayName = (formData.get("displayName") as string).trim();
  const uniformNumber = formData.get("uniformNumber") as string | null;
  const position = (formData.get("position") as string | null)?.trim() || null;
  const uniformSize = (formData.get("uniformSize") as string | null)?.trim() || null;
  const joinedAt = formData.get("joinedAt") as string | null;
  const notes = (formData.get("notes") as string | null)?.trim() || null;

  if (!displayName) throw new Error("表示名は必須です");

  const uniformNumberParsed = uniformNumber ? parseInt(uniformNumber, 10) : null;
  if (uniformNumberParsed !== null && (uniformNumberParsed < 0 || uniformNumberParsed > 99)) {
    throw new Error("背番号は0〜99の範囲で入力してください");
  }

  await prisma.teamMember.create({
    data: {
      teamId,
      displayName,
      uniformNumber: uniformNumberParsed,
      position,
      uniformSize,
      joinedAt: joinedAt ? new Date(joinedAt) : null,
      notes,
      membershipStatus: "active",
      role: "member",
    },
  });

  redirect(`/teams/${teamId}/members`);
}

export async function updateMember(memberId: string, teamId: string, formData: FormData) {
  const member = await prisma.teamMember.findFirst({ where: { id: memberId, teamId } });
  if (!member) throw new Error("メンバーが見つかりません");

  const displayName = (formData.get("displayName") as string).trim();
  if (!displayName) throw new Error("表示名は必須です");

  const uniformNumber = formData.get("uniformNumber") as string | null;
  const position = (formData.get("position") as string | null)?.trim() || null;
  const uniformSize = (formData.get("uniformSize") as string | null)?.trim() || null;
  const joinedAt = formData.get("joinedAt") as string | null;
  const notes = (formData.get("notes") as string | null)?.trim() || null;
  const membershipStatus = (formData.get("membershipStatus") as string | null) ?? "active";

  if (!MEMBERSHIP_STATUSES.includes(membershipStatus as typeof MEMBERSHIP_STATUSES[number])) {
    throw new Error("無効な在籍ステータスです");
  }

  const uniformNumberParsed = uniformNumber ? parseInt(uniformNumber, 10) : null;
  if (uniformNumberParsed !== null && (uniformNumberParsed < 0 || uniformNumberParsed > 99)) {
    throw new Error("背番号は0〜99の範囲で入力してください");
  }

  await prisma.teamMember.update({
    where: { id: memberId },
    data: {
      displayName,
      uniformNumber: uniformNumberParsed,
      position,
      uniformSize,
      joinedAt: joinedAt ? new Date(joinedAt) : null,
      notes,
      membershipStatus,
    },
  });

  redirect(`/teams/${teamId}/members`);
}
