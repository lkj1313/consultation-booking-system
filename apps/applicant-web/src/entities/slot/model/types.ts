export interface Counselor {
  id: number;
  name: string;
  email: string;
}

export interface AvailableSlot {
  id: number;
  counselor: Counselor;
  startAt: string;
  endAt: string;
  status: 'open' | 'closed' | 'cancelled';
  capacity: number;
  bookedCount: number;
}

export interface AvailableSlotsQuery {
  from: string;
  to: string;
  counselorId?: number;
}
