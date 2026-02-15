export const WEEKDAY_LABELS_KO = ["일", "월", "화", "수", "목", "금", "토"] as const;

export const TIME_OPTIONS_30M = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, "0");
  const minute = index % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

export const toDateKey = (value: Date | string) => {
  const date = typeof value === "string" ? new Date(value) : value;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const startOfMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);

export const startOfNextMonth = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth() + 1, 1, 0, 0, 0, 0);

export const buildMonthCells = (month: Date) => {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: Array<Date | null> = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

export const formatMonthTitle = (month: Date, locale = "ko-KR") =>
  new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(month);

export const getTodayStart = (now = new Date()) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

export const isPastDate = (date: Date, todayStart: Date) => date.getTime() < todayStart.getTime();

export const filterFutureItems = <T>(items: T[], getStartAt: (item: T) => string, now: Date) =>
  items.filter((item) => new Date(getStartAt(item)).getTime() >= now.getTime());

export const countItemsByDate = <T>(items: T[], getStartAt: (item: T) => string) => {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = toDateKey(getStartAt(item));
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
};

export const filterItemsByDate = <T>(items: T[], dateKey: string, getStartAt: (item: T) =>
  string) => items.filter((item) => toDateKey(getStartAt(item)) === dateKey);

