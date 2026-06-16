import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PollEditForm } from "./PollEditForm";

type Props = { params: Promise<{ teamId: string; pollId: string }> };

function toDatetimeLocal(date: Date): string {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditPollPage({ params }: Props) {
  const { teamId, pollId } = await params;

  const poll = await prisma.schedulePoll.findFirst({
    where: { id: pollId, teamId },
    include: { options: { orderBy: { startDatetime: "asc" } } },
  });

  if (!poll) notFound();
  if (poll.status === "confirmed") redirect(`/teams/${teamId}/polls/${pollId}`);

  const initialOptions = poll.options.map((opt) => ({
    existingId: opt.id,
    startDatetime: toDatetimeLocal(opt.startDatetime),
    endDatetime: opt.endDatetime ? toDatetimeLocal(opt.endDatetime) : "",
    venueName: opt.venueName ?? "",
    note: opt.note ?? "",
  }));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-0.5">候補日を編集</h2>
        <p className="text-sm text-gray-500">{poll.title}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <PollEditForm pollId={pollId} teamId={teamId} initialOptions={initialOptions} />
      </div>
    </div>
  );
}
