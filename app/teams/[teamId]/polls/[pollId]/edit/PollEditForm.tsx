"use client";

import { useRef, useState, useActionState } from "react";
import { updatePollOptions } from "@/lib/actions/poll";
import { SubmitButton } from "@/app/_components/SubmitButton";

type OptionEntry = {
  localId: number;
  existingId: string;
  startDatetime: string;
  endDatetime: string;
  venueName: string;
  note: string;
};

type Props = {
  pollId: string;
  teamId: string;
  initialOptions: Omit<OptionEntry, "localId">[];
};

export function PollEditForm({ pollId, teamId, initialOptions }: Props) {
  const nextId = useRef(initialOptions.length);
  const [options, setOptions] = useState<OptionEntry[]>(
    initialOptions.map((opt, i) => ({ localId: i, ...opt })),
  );

  const addOption = () =>
    setOptions((prev) => [
      ...prev,
      {
        localId: nextId.current++,
        existingId: "",
        startDatetime: "",
        endDatetime: "",
        venueName: "",
        note: "",
      },
    ]);

  const removeOption = (localId: number) =>
    setOptions((prev) => prev.filter((o) => o.localId !== localId));

  const boundAction = updatePollOptions.bind(null, pollId, teamId);
  const [state, formAction] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">
            候補日時 <span className="text-red-500">*</span>
          </p>
          <button
            type="button"
            onClick={addOption}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            + 候補を追加
          </button>
        </div>

        <div className="space-y-4">
          {options.map((opt, idx) => (
            <div
              key={opt.localId}
              className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative"
            >
              <p className="text-xs font-semibold text-gray-500 mb-3">候補 {idx + 1}</p>

              {opt.existingId && (
                <input
                  type="hidden"
                  name={`existingOptionId_${idx}`}
                  value={opt.existingId}
                />
              )}

              {options.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeOption(opt.localId)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-lg leading-none"
                  aria-label="削除"
                >
                  ×
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">
                    開始日時 <span className="text-red-500">*</span>
                  </label>
                  <input
                    name={`startDatetime_${idx}`}
                    type="datetime-local"
                    required
                    defaultValue={opt.startDatetime}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">終了日時</label>
                  <input
                    name={`endDatetime_${idx}`}
                    type="datetime-local"
                    defaultValue={opt.endDatetime}
                    className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs text-gray-600 mb-1">会場</label>
                <input
                  name={`venueName_${idx}`}
                  type="text"
                  defaultValue={opt.venueName}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="例：○○フットサルコート"
                />
              </div>

              <div className="mt-3">
                <label className="block text-xs text-gray-600 mb-1">補足</label>
                <input
                  name={`note_${idx}`}
                  type="text"
                  defaultValue={opt.note}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      <SubmitButton label="保存する" />
    </form>
  );
}
