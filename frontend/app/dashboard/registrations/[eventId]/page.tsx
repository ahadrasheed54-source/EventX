"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import api, { getErrorMessage } from "@/lib/axios";
import { EventItem, Ticket } from "@/types";

function RegistrationsContent() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [eventRes, ticketsRes] = await Promise.all([
        api.get<EventItem>(`/events/${eventId}`),
        api.get<Ticket[]>(`/tickets/event/${eventId}`),
      ]);
      setEvent(eventRes.data);
      setTickets(ticketsRes.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const markAttended = async (ticketId: string) => {
    setMarkingId(ticketId);
    try {
      await api.patch(`/tickets/${ticketId}/attendance`);
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, attendanceStatus: "attended" } : t))
      );
      toast.success("Marked as attended");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) return <Loader label="Loading registrations..." />;

  const attendedCount = tickets.filter((t) => t.attendanceStatus === "attended").length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Registrations</h1>
      <p className="mt-1 text-slate-500">{event?.title}</p>

      <div className="mt-4 flex gap-4">
        <div className="card">
          <p className="text-xs text-slate-400">Total Registered</p>
          <p className="text-xl font-bold text-slate-900">{tickets.length}</p>
        </div>
        <div className="card">
          <p className="text-xs text-slate-400">Attended</p>
          <p className="text-xl font-bold text-slate-900">{attendedCount}</p>
        </div>
      </div>

      <div className="card mt-6 overflow-x-auto !p-0">
        {tickets.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No registrations yet" subtitle="Participants who book will appear here." icon="🎟️" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Participant</th>
                <th className="px-4 py-3">Ticket #</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => {
                const p = typeof t.user === "object" ? t.user : null;
                return (
                  <tr key={t._id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{p?.name}</p>
                      <p className="text-xs text-slate-400">{p?.email}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{t.ticketNumber}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          t.attendanceStatus === "attended" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {t.attendanceStatus === "attended" ? "Attended" : "Not Attended"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {t.attendanceStatus !== "attended" && (
                        <button
                          onClick={() => markAttended(t._id)}
                          disabled={markingId === t._id}
                          className="btn-secondary text-xs"
                        >
                          {markingId === t._id ? "..." : "Mark Attended"}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function RegistrationsPage() {
  return (
    <ProtectedRoute allow={["organizer", "admin"]}>
      <RegistrationsContent />
    </ProtectedRoute>
  );
}
