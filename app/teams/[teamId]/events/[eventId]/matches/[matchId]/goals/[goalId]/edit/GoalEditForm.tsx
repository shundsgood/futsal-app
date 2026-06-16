"use client";

import { useState } from "react";
import { updateGoal, deleteGoal } from "@/lib/actions/goal";
import { GOAL_TYPE_LABEL, ASSIST_TYPE_LABEL } from "@/lib/constants";

type Member = {
  id: string;
  displayName: string;
  uniformNumber: number | null;
  isPlayer: boolean;
};

type GoalType = "normal" | "own_goal" | "unknown_scorer";

type Props = {
  goalId: string;
  matchId: string;
  eventId: string;
  teamId: string;
  members: Member[];
  initialValues: {
    goalType: GoalType;
    scorerId: string;
    assistValue: string;
  };
};

export function GoalEditForm({
  goalId,
  matchId,
  eventId,
  teamId,
  members,
  initialValues,
}: Props) {
  const [goalType, setGoalType] = useState<GoalType>(initialValues.goalType);
  const updateAction = updateGoal.bind(null, goalId, matchId, eventId, teamId);
  const deleteAction = deleteGoal.bind(null, goalId, matchId, eventId, teamId);

  const players = members.filter((m) => m.isPlayer);
  const others = members.filter((m) => !m.isPlayer);

  return (
    <div className="space-y-6">
      <form action={updateAction} className="space-y-5">
        {/* 得点種別 */}
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">得点種別</p>
          <div className="flex gap-2 flex-wrap">
            {(["normal", "own_goal", "unknown_scorer"] as GoalType[]).map((type) => (
              <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="goalType"
                  value={type}
                  checked={goalType === type}
                  onChange={() => setGoalType(type)}
                  className="accent-blue-600"
                />
                <span className="text-sm text-gray-700">{GOAL_TYPE_LABEL[type]}</span>
              </label>
            ))}
          </div>
        </div>

        {goalType === "normal" && (
          <>
            {/* 得点者 */}
            <div>
              <label htmlFor="scorerId" className="block text-sm font-medium text-gray-700 mb-1">
                得点者
              </label>
              <select
                id="scorerId"
                name="scorerId"
                defaultValue={initialValues.scorerId}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">（未選択）</option>
                {players.length > 0 && (
                  <optgroup label="出場メンバー">
                    {players.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.uniformNumber != null ? `#${m.uniformNumber} ` : ""}
                        {m.displayName}
                      </option>
                    ))}
                  </optgroup>
                )}
                {others.length > 0 && (
                  <optgroup label="その他メンバー">
                    {others.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.uniformNumber != null ? `#${m.uniformNumber} ` : ""}
                        {m.displayName}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>

            {/* アシスト */}
            <div>
              <label
                htmlFor="assistValue"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                アシスト
              </label>
              <select
                id="assistValue"
                name="assistValue"
                defaultValue={initialValues.assistValue}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="none">{ASSIST_TYPE_LABEL.none}</option>
                <option value="unknown">{ASSIST_TYPE_LABEL.unknown}</option>
                {players.length > 0 && (
                  <optgroup label="出場メンバー">
                    {players.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.uniformNumber != null ? `#${m.uniformNumber} ` : ""}
                        {m.displayName}
                      </option>
                    ))}
                  </optgroup>
                )}
                {others.length > 0 && (
                  <optgroup label="その他メンバー">
                    {others.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.uniformNumber != null ? `#${m.uniformNumber} ` : ""}
                        {m.displayName}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </>
        )}

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
          if (!window.confirm("この得点記録を削除しますか？")) e.preventDefault();
        }}
      >
        <button
          type="submit"
          className="w-full border border-red-200 text-red-500 font-medium py-2.5 rounded-xl hover:bg-red-50 active:scale-95 transition text-sm"
        >
          この得点記録を削除する
        </button>
      </form>
    </div>
  );
}
