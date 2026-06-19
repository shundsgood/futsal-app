"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { joinTeamByCode } from "@/lib/actions/team";
import { SubmitButton } from "./SubmitButton";

export function JoinByCodeForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(joinTeamByCode, undefined);

  useEffect(() => {
    if (state && "teamId" in state) {
      router.push(`/teams/${state.teamId}`);
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <div className="flex gap-2">
        <input
          name="code"
          type="text"
          placeholder="チームコード（例: P3K9XZ）"
          maxLength={6}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ textTransform: "uppercase" }}
        />
        <SubmitButton label="参加" pendingLabel="..." />
      </div>
      {state && "error" in state && (
        <p className="text-sm text-red-600 mt-2">{state.error}</p>
      )}
    </form>
  );
}
