import { useMemo, useState } from "react";
import { startOfMonth, startOfNextMonth, toDateKey } from "@consult/shared-lib";
import { useAvailableSlotsQuery } from "@/entities/slot";
import { useCreateBookingMutation } from "@/features/create-booking";

export const useBookingRequest = (token: string | null) => {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDateKey, setSelectedDateKey] = useState(() => toDateKey(new Date()));
  const [form, setForm] = useState({
    slotId: 0,
  });

  const queryPayload = useMemo(
    () => ({
      token: token ?? "",
      from: startOfMonth(viewMonth).toISOString(),
      to: startOfNextMonth(viewMonth).toISOString(),
    }),
    [token, viewMonth],
  );

  const slotsQuery = useAvailableSlotsQuery(queryPayload);
  const createBookingMutation = useCreateBookingMutation();

  const submitBooking = () => {
    if (!form.slotId) {
      return;
    }

    createBookingMutation.mutate({
      token: token ?? "",
      slotId: Number(form.slotId),
    });
  };

  return {
    viewMonth,
    setViewMonth,
    selectedDateKey,
    setSelectedDateKey,
    form,
    setForm,
    slotsQuery,
    createBookingMutation,
    submitBooking,
  };
};
