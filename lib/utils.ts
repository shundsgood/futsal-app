const JST = "Asia/Tokyo";

export function dateToSeason(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const startYear = month >= 7 ? year : year - 1;
  const s = String(startYear % 100).padStart(2, "0");
  const e = String((startYear + 1) % 100).padStart(2, "0");
  return `${s}-${e}`;
}

export function seasonToDateRange(season: string) {
  const startYear = 2000 + parseInt(season.split("-")[0], 10);
  return {
    gte: new Date(`${startYear}-07-01T00:00:00+09:00`),
    lt: new Date(`${startYear + 1}-07-01T00:00:00+09:00`),
  };
}

export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** datetime-local / date 入力値（タイムゾーンなし）を JST として解釈して Date を返す */
export function parseDatetimeLocalJST(value: string): Date {
  return new Date(value + "+09:00");
}

/** date 入力値（YYYY-MM-DD）を JST 0時として解釈して Date を返す */
export function parseDateLocalJST(value: string): Date {
  return new Date(value + "T00:00:00+09:00");
}

export function toDatetimeLocal(date: Date | string): string {
  const s = new Intl.DateTimeFormat("sv-SE", {
    timeZone: JST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
  return s.replace(" ", "T");
}

export function toDateLocal(date: Date | string): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: JST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}
