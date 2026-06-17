"use client";

type Member = {
  id: string;
  displayName: string;
  uniformNumber: number | null;
  isAttending: boolean;
};

type Props = {
  members: Member[];
  selectedIds: Set<string>;
  toggleMember: (id: string) => void;
};

export function MemberCheckList({ members, selectedIds, toggleMember }: Props) {
  const attendingMembers = members.filter((m) => m.isAttending);
  const otherMembers = members.filter((m) => !m.isAttending);

  const renderGroup = (group: Member[], label: string) => {
    if (group.length === 0) return null;
    return (
      <div className="mb-3 last:mb-0">
        <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-50">
          {group.map((m) => (
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
    );
  };

  return (
    <div>
      <p className="block text-sm font-medium text-gray-700 mb-2">出場メンバー</p>
      {renderGroup(attendingMembers, "参加予定")}
      {renderGroup(otherMembers, "その他メンバー")}
    </div>
  );
}
