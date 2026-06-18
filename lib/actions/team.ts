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

export async function deleteTeam(teamId: string) {
  const user = await getCurrentUser();
  const team = await prisma.team.findFirst({ where: { id: teamId, ownerUserId: user.id } });
  if (!team) throw new Error("チームが見つかりません");

  const memberIds = await prisma.teamMember
    .findMany({ where: { teamId }, select: { id: true } })
    .then((ms) => ms.map((m) => m.id));

  await prisma.$transaction([
    prisma.goal.updateMany({ where: { scorerId: { in: memberIds } }, data: { scorerId: null } }),
    prisma.goal.updateMany({ where: { assistId: { in: memberIds } }, data: { assistId: null } }),
    prisma.event.deleteMany({ where: { teamId } }),
    prisma.schedulePoll.deleteMany({ where: { teamId } }),
    prisma.teamMember.deleteMany({ where: { teamId } }),
    prisma.team.delete({ where: { id: teamId } }),
  ]);

  redirect("/");
}

export async function joinTeam(
  teamId: string,
  _prevState: unknown,
  _formData: FormData,
): Promise<{ error: string } | undefined> {
  const user = await getCurrentUser();

  const team = await prisma.team.findUnique({ where: { id: teamId } });
  if (!team) return { error: "チームが見つかりません" };

  const existing = await prisma.teamMember.findFirst({ where: { teamId, userId: user.id } });
  if (existing) redirect(`/teams/${teamId}`);

  await prisma.teamMember.create({
    data: {
      teamId,
      userId: user.id,
      displayName: user.displayName,
      role: "member",
      membershipStatus: "active",
    },
  });

  redirect(`/teams/${teamId}`);
}
