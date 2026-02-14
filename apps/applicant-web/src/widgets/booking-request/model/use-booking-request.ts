import { useMemo, useState } from 'react';
import { useAvailableSlotsQuery } from '@/entities/slot';
import { useCreateBookingMutation } from '@/features/create-booking';

const toIso = (value: string) => new Date(value).toISOString();

const pad = (num: number) => String(num).padStart(2, '0');

const toDateTimeLocal = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const getDefaultRange = () => {
  const now = new Date();
  const from = new Date(now);
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

export const useBookingRequest = () => {
  const initialRange = useMemo(() => getDefaultRange(), []);

  const [filter, setFilter] = useState({
    from: initialRange.from,
    to: initialRange.to,
    counselorId: 1,
  });

  const [form, setForm] = useState({
    slotId: 0,
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
  });

  const queryPayload = {
    from: toIso(filter.from),
    to: toIso(filter.to),
    counselorId: Number(filter.counselorId),
  };

  const slotsQuery = useAvailableSlotsQuery(queryPayload);
  const createBookingMutation = useCreateBookingMutation();

  const submitBooking = () => {
    if (!form.slotId) {
      return;
    }

    createBookingMutation.mutate({
      slotId: Number(form.slotId),
      applicantName: form.applicantName.trim(),
      applicantEmail: form.applicantEmail.trim(),
      applicantPhone: form.applicantPhone.trim() || undefined,
    });
  };

  return {
    filter,
    setFilter,
    form,
    setForm,
    slotsQuery,
    createBookingMutation,
    submitBooking,
  };
};
