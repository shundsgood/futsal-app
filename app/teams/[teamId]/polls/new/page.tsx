import Link from "next/link";
import { PollForm } from "./PollForm";

type Props = { params: Promise<{ teamId: string }> };

export default async function NewPollPage({ params }: Props) {
  const { teamId } = await params;

  return (
    <div>
      <Link href={`/teams/${teamId}/polls`} className="text-sm text-gray-500 hover:text-blue-600 mb-4 inline-block">← 日程調整一覧に戻る</Link>
      <h2 className="text-lg font-bold text-gray-900 mb-4">日程調整を作成</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <PollForm teamId={teamId} />
      </div>
    </div>
  );
}
