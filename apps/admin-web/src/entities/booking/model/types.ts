import type { ScheduleQuery, ScheduleSlot } from '@/entities/schedule/model/types';

export type BookingStatus = 'reserved' | 'cancelled' | 'completed';

export interface BookingItem {
  id: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string | null;
  status: BookingStatus;
  slot: ScheduleSlot;
}

export interface BookingQuery extends ScheduleQuery {
  status?: BookingStatus;
}
