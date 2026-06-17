"use client";

import { GOAL_TYPE_LABEL, ASSIST_TYPE_LABEL } from "@/lib/constants";

export type GoalType = "normal" | "own_goal" | "unknown_scorer";

export type GoalRow = {
  localId: number;
  goalType: GoalType;
  scorerId: string;
  assistValue: string;
};

type Member = {
  id: string;
  displayName: string;
  uniformNumber: number | null;
};

type Props = {
  goals: GoalRow[];
  players: Member[];
  others: Member[];
  updateGoalField: (localId: number, patch: Partial<Omit<GoalRow, "localId">>) => void;
};

const GOAL_TYPES: GoalType[] = ["normal", "own_goal", "unknown_scorer"];

function MemberOptions({ members, label }: { members: Member[]; label: string }) {
  if (members.length === 0) return null;
  return (
    <optgroup label={label}>
      {members.map((m) => (
        <option key={m.id} value={m.id}>
          {m.uniformNumber != null ? `#${m.uniformNumber} ` : ""}
          {m.displayName}
        </option>
      ))}
    </optgroup>
  );
}

export function GoalRows({ goals, players, others, updateGoalField }: Props) {
  if (goals.length === 0) return null;

  return (
    <div>
      <p className="block text-sm font-medium text-gray-700 mb-2">得点記録</p>
      <div className="space-y-3">
        {goals.map((row, idx) => (
          <div key={row.localId} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <input type="hidden" name={`goalType_${idx}`} value={row.goalType} />
            {row.goalType === "normal" && (
              <>
                <input type="hidden" name={`scorerId_${idx}`} value={row.scorerId} />
                <input type="hidden" name={`assistValue_${idx}`} value={row.assistValue} />
              </>
            )}

            <p className="text-xs font-semibold text-gray-500 mb-3">得点 {idx + 1}</p>

            <div className="flex gap-4 flex-wrap mb-3">
              {GOAL_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    checked={row.goalType === type}
                    onChange={() =>
                      updateGoalField(row.localId, { goalType: type, scorerId: "", assistValue: "none" })
                    }
                    className="accent-blue-600"
                  />
                  <span className="text-sm text-gray-700">{GOAL_TYPE_LABEL[type]}</span>
                </label>
              ))}
            </div>

            {row.goalType === "normal" && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">得点者</label>
                  <select
                    value={row.scorerId}
                    onChange={(e) => updateGoalField(row.localId, { scorerId: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">（未選択）</option>
                    <MemberOptions members={players} label="出場メンバー" />
                    <MemberOptions members={others} label="その他メンバー" />
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">アシスト</label>
                  <select
                    value={row.assistValue}
                    onChange={(e) => updateGoalField(row.localId, { assistValue: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="none">{ASSIST_TYPE_LABEL.none}</option>
                    <option value="unknown">{ASSIST_TYPE_LABEL.unknown}</option>
                    <MemberOptions members={players} label="出場メンバー" />
                    <MemberOptions members={others} label="その他メンバー" />
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
