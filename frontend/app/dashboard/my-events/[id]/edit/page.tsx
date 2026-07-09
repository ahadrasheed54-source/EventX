"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import EventForm from "@/components/EventForm";
import Loader from "@/components/Loader";
import api, { getErrorMessage } from "@/lib/axios";
import { EventItem } from "@/types";

function EditEventContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<EventItem>(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (formData: FormData) => {
    await api.patch(`/events/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    toast.success("Event updated successfully!");
    router.push("/dashboard/my-events");
  };

  if (loading) return <Loader label="Loading event..." />;
  if (!event) return <p className="text-slate-500">Event not found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Edit Event</h1>
      <p className="mt-1 text-slate-500">Update your event details below.</p>
      <div className="mt-6 max-w-2xl">
        <EventForm initialEvent={event} onSubmit={handleSubmit} submitLabel="Save Changes" />
      </div>
    </div>
  );
}

export default function EditEventPage() {
  return (
    <ProtectedRoute allow={["organizer", "admin"]}>
      <EditEventContent />
    </ProtectedRoute>
  );
}
