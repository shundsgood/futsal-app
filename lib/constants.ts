export const EVENT_TYPE_LABEL: Record<string, string> = {
  practice: "練習",
  friendly: "練習試合",
  tournament: "大会",
  league: "リーグ戦",
  other: "その他",
};

export const EVENT_TYPE_COLOR: Record<string, string> = {
  practice: "bg-green-100 text-green-700",
  friendly: "bg-green-100 text-green-700",
  tournament: "bg-blue-100 text-blue-700",
  league: "bg-blue-100 text-blue-700",
  other: "bg-gray-100 text-gray-600",
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

export const GOAL_TYPE_LABEL: Record<string, string> = {
  normal: "通常得点",
  own_goal: "オウンゴール",
  unknown_scorer: "得点者不明",
};

export const ASSIST_TYPE_LABEL: Record<string, string> = {
  none: "アシストなし",
  unknown: "不明",
};

export const ATTENDANCE_LABEL: Record<string, string> = {
  attending: "参加",
  undecided: "未定",
  absent: "不参加",
};

export const ATTENDANCE_COLOR: Record<string, string> = {
  attending: "text-green-600 font-bold",
  undecided: "text-yellow-500 font-bold",
  absent: "text-red-500 font-bold",
};

export const POLL_RESPONSE_LABEL: Record<string, string> = {
  available: "○",
  maybe: "△",
  unavailable: "×",
};

export const POLL_RESPONSE_COLOR: Record<string, string> = {
  available: "text-green-600 font-bold",
  maybe: "text-yellow-500 font-bold",
  unavailable: "text-red-500 font-bold",
};
