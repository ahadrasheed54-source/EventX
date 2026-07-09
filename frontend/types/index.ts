export type Role = "admin" | "organizer" | "participant";

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  favorites?: string[];
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  image?: string;
}

export interface EventOrganizer {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface EventItem {
  _id: string;
  title: string;
  description: string;
  category: Category | string;
  organizer: EventOrganizer | string;
  date: string;
  time: string;
  venue: string;
  location: string;
  ticketPrice: number;
  totalSeats: number;
  availableSeats: number;
  image?: string;
  announcement?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt?: string;
}

export interface Ticket {
  _id: string;
  user: string | { _id: string; name: string; email: string; avatar?: string };
  event: EventItem | string;
  ticketNumber: string;
  paymentStatus: "pending" | "paid";
  attendanceStatus: "not_attended" | "attended";
  createdAt?: string;
}

export interface Review {
  _id: string;
  user: string | { _id: string; name: string; avatar?: string };
  event: string | { _id: string; title: string; image?: string; date?: string };
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  readStatus: boolean;
  event?: string;
  createdAt?: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  message: string | string[];
  statusCode?: number;
}
