const JST = "Asia/Tokyo";

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
