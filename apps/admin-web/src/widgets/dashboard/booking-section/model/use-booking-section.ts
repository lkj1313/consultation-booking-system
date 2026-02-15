import { useMemo, useState } from 'react';
import { useBookingsQuery } from '@/entities/booking';
import type { BookingQuery, BookingStatus } from '@/entities/booking';
import { useCancelBookingMutation } from '@/features/cancel-booking';
import { useCompleteBookingMutation } from '@/features/complete-booking';
import { getDefaultRange, toIso } from '@/shared/lib/date-time';

interface UseBookingSectionParams {
  isAdmin: boolean;
  userId: number | null;
}

export const useBookingSection = ({ isAdmin, userId }: UseBookingSectionParams) => {
  void isAdmin;
  void userId;
  const initialRange = useMemo(() => getDefaultRange(), []);

  const [bookingFilter, setBookingFilter] = useState({
    from: initialRange.from,
    to: initialRange.to,
    status: '' as '' | BookingStatus,
  });

  const queryPayload: BookingQuery = {
    from: toIso(bookingFilter.from),
    to: toIso(bookingFilter.to),
    ...(bookingFilter.status ? { status: bookingFilter.status } : {}),
  };

  const bookingsQuery = useBookingsQuery(queryPayload);
  const cancelBookingMutation = useCancelBookingMutation();
  const completeBookingMutation = useCompleteBookingMutation();

  return {
    isAdmin,
    bookingFilter,
    setBookingFilter,
    bookingsQuery,
    cancelBookingMutation,
    completeBookingMutation,
  };
};
