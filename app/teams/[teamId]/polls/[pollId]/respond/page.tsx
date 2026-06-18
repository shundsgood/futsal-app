import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { RespondForm } from "./RespondForm";

type Props = { params: Promise<{ teamId: string; pollId: string }> };

export default async function RespondPage({ params }: Props) {
  const { teamId, pollId } = await params;
  const user = await getCurrentUser();

  const [poll, member] = await Promise.all([
    prisma.schedulePoll.findUnique({
      where: { id: pollId },
      include: { options: { orderBy: { startDatetime: "asc" } } },
    }),
    prisma.teamMember.findFirst({ where: { teamId, userId: user.id } }),
  ]);

  if (!poll || poll.teamId !== teamId) notFound();

  const existingResponses = member
    ? await prisma.schedulePollResponse.findMany({
        where: { teamMemberId: member.id, option: { schedulePollId: pollId } },
      })
    : [];

  const initialResponses = Object.fromEntries(
    existingResponses.map((r) => [
      r.schedulePollOptionId,
      { responseType: r.responseType, comment: r.comment },
    ]),
  );

  return (
    <div>
      <Link href={`/teams/${teamId}/polls/${pollId}`} className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block">← 日程調整に戻る</Link>
      <h2 className="text-lg font-bold text-gray-900 mb-0.5">{poll.title}</h2>
      <p className="text-sm text-gray-500 mb-4">
        {member?.displayName ?? user.displayName} として回答
      </p>

      <RespondForm
        pollId={pollId}
        teamId={teamId}
        options={poll.options}
        initialResponses={initialResponses}
      />
    </div>
  );
}
