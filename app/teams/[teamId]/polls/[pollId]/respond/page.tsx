import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { RespondForm } from "./RespondForm";

type Props = { params: Promise<{ teamId: string; pollId: string }> };

export default async function RespondPage({ params }: Props) {
  const { teamId, pollId } = await params;
  const user = await getCurrentUser();

  const poll = await prisma.schedulePoll.findUnique({
    where: { id: pollId },
    include: { options: { orderBy: { startDatetime: "asc" } } },
  });

  if (!poll || poll.teamId !== teamId) notFound();

  const member = await prisma.teamMember.findFirst({
    where: { teamId, userId: user.id },
  });

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
