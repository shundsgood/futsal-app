"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function createMember(teamId: string, formData: FormData) {
  const displayName = (formData.get("displayName") as string).trim();
  const uniformNumber = formData.get("uniformNumber") as string | null;
  const position = (formData.get("position") as string | null)?.trim() || null;
  const uniformSize = (formData.get("uniformSize") as string | null)?.trim() || null;
  const joinedAt = formData.get("joinedAt") as string | null;
  const notes = (formData.get("notes") as string | null)?.trim() || null;

  if (!displayName) throw new Error("表示名は必須です");

  await prisma.teamMember.create({
    data: {
      teamId,
      displayName,
      uniformNumber: uniformNumber ? parseInt(uniformNumber, 10) : null,
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
