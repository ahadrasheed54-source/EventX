"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import api, { getErrorMessage } from "@/lib/axios";
import { Ticket } from "@/types";

function TicketsContent() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Ticket[]>("/tickets/mine");
      setTickets(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this ticket? This cannot be undone.")) return;
    setCancellingId(id);
    try {
      await api.delete(`/tickets/${id}`);
      toast.success("Ticket cancelled");
      setTickets((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Tickets</h1>
      <p className="mt-1 text-slate-500">Tickets you've booked for upcoming and past events.</p>

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : tickets.length === 0 ? (
          <EmptyState title="No tickets yet" subtitle="Book your first event to see it here." icon="🎟️" />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {tickets.map((t) => {
              const ev = typeof t.event === "object" ? t.event : null;
              return (
                <div key={t._id} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{ev?.title || "Event"}</p>
                      {ev && <p className="text-sm text-slate-500">{format(new Date(ev.date), "MMM d, yyyy")} · {ev.time}</p>}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        t.attendanceStatus === "attended" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t.attendanceStatus === "attended" ? "Attended" : "Not Attended"}
                    </span>
                  </div>
                  <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                    #{t.ticketNumber}
                  </p>
                  <div className="mt-4 flex gap-2">
                    {ev && (
                      <Link href={`/events/${ev._id}`} className="btn-secondary flex-1 text-center">
                        View Event
                      </Link>
                    )}
                    <button
                      onClick={() => handleCancel(t._id)}
                      disabled={cancellingId === t._id}
                      className="btn-danger"
                    >
                      {cancellingId === t._id ? "..." : "Cancel"}
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

export default function TicketsPage() {
  return (
    <ProtectedRoute allow={["participant"]}>
      <TicketsContent />
    </ProtectedRoute>
  );
}
