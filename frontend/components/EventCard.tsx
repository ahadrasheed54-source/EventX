import Link from "next/link";
import Image from "next/image";
import { EventItem } from "@/types";
import { fileUrl } from "@/lib/axios";
import { format } from "date-fns";

export default function EventCard({ event }: { event: EventItem }) {
  const categoryName = typeof event.category === "object" ? event.category.name : "";
  const soldOut = event.availableSeats <= 0;

  return (
    <Link
      href={`/events/${event._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-primary-100 to-primary-50">
        {event.image ? (
          <Image
            src={fileUrl(event.image)}
            alt={event.title}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">🎉</div>
        )}
        {categoryName && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary-700 shadow">
            {categoryName}
          </span>
        )}
        {soldOut && (
          <span className="absolute right-3 top-3 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
            Sold Out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-1 font-semibold text-slate-900">{event.title}</h3>
        <p className="flex items-center gap-1 text-sm text-slate-500">
          📅 {format(new Date(event.date), "MMM d, yyyy")} · {event.time}
        </p>
        <p className="flex items-center gap-1 text-sm text-slate-500">📍 {event.location}</p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-primary-700">
            {event.ticketPrice > 0 ? `Rs. ${event.ticketPrice}` : "Free"}
          </span>
          <span className="text-xs text-slate-400">{event.availableSeats} seats left</span>
        </div>
      </div>
    </Link>
  );
}
