export type SlotStatus = 'open' | 'closed' | 'cancelled';

export interface Counselor {
  id: number;
  name: string;
  email: string;
}

export interface ScheduleSlot {
  id: number;
  counselor: Counselor;
  startAt: string;
  endAt: string;
  status: SlotStatus;
  capacity: number;
  bookedCount: number;
}

export interface ScheduleQuery {
  from: string;
  to: string;
  counselorId?: number;
}
