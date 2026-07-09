"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import api, { fileUrl, getErrorMessage } from "@/lib/axios";
import { EventItem } from "@/types";

function MyEventsContent() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<EventItem[]>("/events/organizer/mine");
      setEvents(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this event? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await api.delete(`/events/${id}`);
      toast.success("Event deleted");
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Events</h1>
          <p className="mt-1 text-slate-500">Events you've created and are managing.</p>
        </div>
        <Link href="/dashboard/my-events/create" className="btn-primary">
          + Create Event
        </Link>
      </div>

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : events.length === 0 ? (
          <EmptyState title="No events yet" subtitle="Create your first event to get started." icon="🎪" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => {
              const categoryName = typeof ev.category === "object" ? ev.category.name : "";
              return (
                <div key={ev._id} className="card flex flex-col overflow-hidden !p-0">
                  <div className="relative h-32 w-full bg-gradient-to-br from-primary-100 to-primary-50">
                    {ev.image ? (
                      <Image src={fileUrl(ev.image)} alt={ev.title} fill className="object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-3xl">🎉</div>
                    )}
                    <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold capitalize text-slate-700">
                      {ev.status}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="line-clamp-1 font-semibold text-slate-900">{ev.title}</p>
                    <p className="text-xs text-slate-400">{categoryName} · {format(new Date(ev.date), "MMM d, yyyy")}</p>
                    <p className="text-xs text-slate-500">{ev.availableSeats} / {ev.totalSeats} seats left</p>
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
                      <Link href={`/dashboard/my-events/${ev._id}/edit`} className="btn-secondary text-center text-xs">
                        Edit
                      </Link>
                      <Link href={`/dashboard/registrations/${ev._id}`} className="btn-secondary text-center text-xs">
                        Registrations
                      </Link>
                    </div>
                    <button
                      onClick={() => handleDelete(ev._id)}
                      disabled={deletingId === ev._id}
                      className="btn-danger mt-1 w-full text-xs"
                    >
                      {deletingId === ev._id ? "Deleting..." : "Delete Event"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyEventsPage() {
  return (
    <ProtectedRoute allow={["organizer", "admin"]}>
      <MyEventsContent />
    </ProtectedRoute>
  );
}
