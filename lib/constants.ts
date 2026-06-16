export const EVENT_TYPE_LABEL: Record<string, string> = {
  practice: "練習",
  friendly: "練習試合",
  tournament: "大会",
  league: "リーグ戦",
  other: "その他",
};

export const VALID_ATTENDANCE_STATUSES = ["attending", "undecided", "absent"] as const;
export type AttendanceStatus = typeof VALID_ATTENDANCE_STATUSES[number];

export const MATCH_RESULT_LABEL: Record<string, string> = {
  win: "勝",
  draw: "分",
  loss: "負",
};

export const MATCH_RESULT_COLOR: Record<string, string> = {
  win: "bg-green-100 text-green-700",
  draw: "bg-gray-100 text-gray-600",
  loss: "bg-red-100 text-red-600",
};
