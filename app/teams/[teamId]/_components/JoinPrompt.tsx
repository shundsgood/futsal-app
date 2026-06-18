"use client";

import { useActionState } from "react";
import { joinTeam } from "@/lib/actions/team";
import { SubmitButton } from "@/app/_components/SubmitButton";

type Props = { teamId: string; teamName: string };

export function JoinPrompt({ teamId, teamName }: Props) {
  const [state, formAction] = useActionState(joinTeam.bind(null, teamId), undefined);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">チーム</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{teamName}</h1>
        <p className="text-sm text-gray-500 mb-8">このチームにまだ参加していません</p>
        <form action={formAction}>
          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
              {state.error}
            </p>
          )}
          <SubmitButton label="このチームに参加する" pendingLabel="参加中..." />
        </form>
      </div>
    </div>
  );
}
