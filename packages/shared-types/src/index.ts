export type SlotStatus = "open" | "closed" | "cancelled";
export type UserRole = "admin";

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

export type BookingStatus = "reserved" | "cancelled" | "completed";

export interface ConsultationNoteItem {
  id: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingItem {
  id: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string | null;
  status: BookingStatus;
  slot: ScheduleSlot;
  consultationNote?: ConsultationNoteItem | null;
}

export interface ScheduleQuery {
  from: string;
  to: string;
  counselorId?: number;
}

export interface BookingQuery extends ScheduleQuery {
  status?: BookingStatus;
}

export interface AvailableSlotsQuery {
  token: string;
  from: string;
  to: string;
}

export type AvailableSlot = ScheduleSlot;

export interface CreateScheduleRequest {
  startAt: string;
  endAt: string;
  capacity?: number;
  status?: SlotStatus;
}

export interface UpdateScheduleStatusRequest {
  id: number;
  status: SlotStatus;
}

export interface CreateBookingRequest {
  token: string;
  slotId: number;
  applicantPhone?: string;
}

export interface CreateBookingLinkRequest {
  targetName: string;
  targetEmail: string;
}

export interface CreateBookingLinkResponse {
  targetName: string;
  targetEmail: string;
  expiresAt: string;
  reservationUrl: string;
  message: string;
}

export interface UpsertConsultationNoteRequest {
  bookingId: number;
  note: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}
