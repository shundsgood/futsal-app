"use client";

import { useState } from "react";
import { updateMatch, deleteMatch } from "@/lib/actions/match";
import { MATCH_RESULT_LABEL, MATCH_RESULT_COLOR } from "@/lib/constants";

type Member = {
  id: string;
  displayName: string;
  uniformNumber: number | null;
  isAttending: boolean;
  isSelected: boolean;
};

type Props = {
  matchId: string;
  eventId: string;
  teamId: string;
  defaultValues: {
    matchOrder: number;
    opponentName: string;
    ourScore: number;
    opponentScore: number;
    memo: string;
  };
  members: Member[];
};

function calcResult(our: number, opp: number): "win" | "draw" | "loss" {
  if (our > opp) return "win";
  if (our === opp) return "draw";
  return "loss";
}

export function MatchEditForm({ matchId, eventId, teamId, defaultValues, members }: Props) {
  const [ourScore, setOurScore] = useState(defaultValues.ourScore);
  const [oppScore, setOppScore] = useState(defaultValues.opponentScore);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(members.filter((m) => m.isSelected).map((m) => m.id)),
  );

  const result = calcResult(ourScore, oppScore);
  const updateAction = updateMatch.bind(null, matchId, eventId, teamId);
  const deleteAction = deleteMatch.bind(null, matchId, eventId, teamId);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const attendingMembers = members.filter((m) => m.isAttending);
  const otherMembers = members.filter((m) => !m.isAttending);

  return (
    <div className="space-y-6">
      <form action={updateAction} className="space-y-5">
        {/* 試合順 */}
        <div>
          <label htmlFor="matchOrder" className="block text-sm font-medium text-gray-700 mb-1">
            試合順
          </label>
          <input
            id="matchOrder"
            name="matchOrder"
            type="number"
            min={1}
            defaultValue={defaultValues.matchOrder}
            required
            className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 対戦相手 */}
        <div>
          <label htmlFor="opponentName" className="block text-sm font-medium text-gray-700 mb-1">
            対戦相手 <span className="text-red-500">*</span>
          </label>
          <input
            id="opponentName"
            name="opponentName"
            type="text"
            required
            defaultValue={defaultValues.opponentName}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* スコア */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">スコア</p>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 text-center">自チーム</label>
              <input
                name="ourScore"
                type="number"
                min={0}
                value={ourScore}
                onChange={(e) => setOurScore(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <span className="text-xl font-bold text-gray-400 mt-4">-</span>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1 text-center">相手</label>
              <input
                name="opponentScore"
                type="number"
                min={0}
                value={oppScore}
                onChange={(e) => setOppScore(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1 mt-4">
              <span
                className={`block text-center text-sm font-bold px-2 py-2 rounded-lg ${
                  MATCH_RESULT_COLOR[result]
                }`}
              >
                {MATCH_RESULT_LABEL[result]}
              </span>
            </div>
          </div>
        </div>

        {/* 出場メンバー */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">出場メンバー</p>

          {Array.from(selectedIds).map((id) => (
            <input key={id} type="hidden" name="playerIds" value={id} />
          ))}

          {attendingMembers.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 font-medium mb-1">参加予定</p>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
                {attendingMembers.map((m) => (
                  <label key={m.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(m.id)}
                      onChange={() => toggleMember(m.id)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-xs text-gray-400 w-6 text-right shrink-0">
                      {m.uniformNumber != null ? `#${m.uniformNumber}` : ""}
                    </span>
                    <span className="text-sm text-gray-800">{m.displayName}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {otherMembers.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">その他メンバー</p>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
                {otherMembers.map((m) => (
                  <label key={m.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(m.id)}
                      onChange={() => toggleMember(m.id)}
                      className="w-4 h-4 rounded accent-blue-600"
                    />
                    <span className="text-xs text-gray-400 w-6 text-right shrink-0">
                      {m.uniformNumber != null ? `#${m.uniformNumber}` : ""}
                    </span>
                    <span className="text-sm text-gray-800">{m.displayName}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* メモ */}
        <div>
          <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
            メモ
          </label>
          <textarea
            id="memo"
            name="memo"
            rows={2}
            defaultValue={defaultValues.memo}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition"
        >
          保存する
        </button>
      </form>

      {/* 削除 */}
      <form
        action={deleteAction}
        onSubmit={(e) => {
          if (!window.confirm("この試合を削除しますか？")) e.preventDefault();
        }}
      >
        <button
          type="submit"
          className="w-full border border-red-200 text-red-500 font-medium py-2.5 rounded-xl hover:bg-red-50 active:scale-95 transition text-sm"
        >
          この試合を削除する
        </button>
      </form>
    </div>
  );
}
