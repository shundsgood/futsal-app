export const EVENT_TYPE_LABEL: Record<string, string> = {
  practice: "練習",
  friendly: "練習試合",
  tournament: "大会",
  league: "リーグ戦",
  other: "その他",
};

export const VALID_ATTENDANCE_STATUSES = ["attending", "undecided", "absent"] as const;
export type AttendanceStatus = typeof VALID_ATTENDANCE_STATUSES[number];
