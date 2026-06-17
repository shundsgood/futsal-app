"use client";

type Props = { url: string };

export function CopyInviteLinkButton({ url }: Props) {
  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      alert("リンクをコピーしました");
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="w-full border border-gray-300 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-50 transition text-sm"
    >
      リンクをコピー
    </button>
  );
}
