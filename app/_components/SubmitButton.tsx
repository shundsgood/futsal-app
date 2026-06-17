"use client";

import { useFormStatus } from "react-dom";

type Props = { label: string; pendingLabel?: string };

export function SubmitButton({ label, pendingLabel }: Props) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (pendingLabel ?? "処理中...") : label}
    </button>
  );
}
