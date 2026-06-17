"use client";

import { joinTeam } from "@/lib/actions/team";

type Props = { teamId: string; teamName: string };

export function JoinPrompt({ teamId, teamName }: Props) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">チーム</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">{teamName}</h1>
        <p className="text-sm text-gray-500 mb-8">このチームにまだ参加していません</p>
        <form action={joinTeam.bind(null, teamId)}>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition"
          >
            このチームに参加する
          </button>
        </form>
      </div>
    </div>
  );
}
