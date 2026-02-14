export const toIso = (value: string) => new Date(value).toISOString();

const pad = (value: number) => String(value).padStart(2, '0');

export const toDateTimeLocal = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

export const floorToThirtyMinutes = (date: Date) => {
  const next = new Date(date);
  next.setSeconds(0, 0);
  next.setMinutes(next.getMinutes() >= 30 ? 30 : 0, 0, 0);
  return next;
};

export const addMinutes = (dateTimeLocal: string, minutes: number) => {
  const date = new Date(dateTimeLocal);
  date.setMinutes(date.getMinutes() + minutes, 0, 0);
  return toDateTimeLocal(date);
};

export const getDefaultRange = () => {
  const now = new Date();
  const from = floorToThirtyMinutes(now);
  from.setHours(0, 0, 0, 0);

  const to = new Date(from);
  to.setDate(to.getDate() + 7);

  return {
    from: toDateTimeLocal(from),
    to: toDateTimeLocal(to),
  };
};

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ko-KR', { hour12: false });
