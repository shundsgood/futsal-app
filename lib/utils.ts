const JST = "Asia/Tokyo";

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
