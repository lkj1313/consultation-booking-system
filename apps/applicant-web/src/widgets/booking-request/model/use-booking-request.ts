import { useMemo, useState } from 'react';
import { getDefaultRange, toIso } from '@consult/shared-lib';
import { useAvailableSlotsQuery } from '@/entities/slot';
import { useCreateBookingMutation } from '@/features/create-booking';

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
