import { PollForm } from "./PollForm";

type Props = { params: Promise<{ teamId: string }> };

export default async function NewPollPage({ params }: Props) {
  const { teamId } = await params;

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-4">日程調整を作成</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <PollForm teamId={teamId} />
      </div>
    </div>
  );
}
