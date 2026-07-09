"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import EmptyState from "@/components/EmptyState";
import api, { getErrorMessage } from "@/lib/axios";
import { EventItem } from "@/types";

interface AnnounceForm {
  eventId: string;
  title: string;
  message: string;
}

function AnnouncementsContent() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnnounceForm>();

  useEffect(() => {
    api
      .get<EventItem[]>("/events/organizer/mine")
      .then((res) => setEvents(res.data))
      .finally(() => setLoading(false));
  }, []);

  const onSubmit = async (values: AnnounceForm) => {
    setSending(true);
    try {
      await api.post("/notifications/announce", values);
      toast.success("Announcement sent to all registered participants!");
      reset();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
      <p className="mt-1 text-slate-500">Notify everyone registered for one of your events.</p>

      <div className="mt-6 max-w-xl">
        {!loading && events.length === 0 ? (
          <EmptyState title="No events yet" subtitle="Create an event before posting an announcement." icon="📣" />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="card flex flex-col gap-4">
            <div>
              <label className="label">Event</label>
              <select className="input" {...register("eventId", { required: "Please select an event" })}>
                <option value="">Select an event</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title}
                  </option>
                ))}
              </select>
              {errors.eventId && <p className="mt-1 text-xs text-red-600">{errors.eventId.message}</p>}
            </div>
            <div>
              <label className="label">Title</label>
              <input className="input" placeholder="Venue change" {...register("title", { required: "Title is required" })} />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
            </div>
            <div>
              <label className="label">Message</label>
              <textarea
                className="input"
                rows={4}
                placeholder="The venue has moved to..."
                {...register("message", { required: "Message is required" })}
              />
              {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
            </div>
            <button type="submit" disabled={sending} className="btn-primary self-start">
              {sending ? "Sending..." : "Send Announcement"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AnnouncementsPage() {
  return (
    <ProtectedRoute allow={["organizer", "admin"]}>
      <AnnouncementsContent />
    </ProtectedRoute>
  );
}
