"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function createTeam(formData: FormData) {
  const user = await getCurrentUser();

  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string | null)?.trim() || null;
  const activityArea = (formData.get("activityArea") as string | null)?.trim() || null;

  if (!name) throw new Error("チーム名は必須です");

  const team = await prisma.team.create({
    data: {
      name,
      description,
      activityArea,
      ownerUserId: user.id,
      members: {
        create: {
          userId: user.id,
          displayName: user.displayName,
          role: "owner",
          membershipStatus: "active",
        },
      },
    },
  });

  redirect(`/teams/${team.id}`);
}
