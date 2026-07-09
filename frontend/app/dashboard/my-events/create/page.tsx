"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import EventForm from "@/components/EventForm";
import api from "@/lib/axios";

function CreateEventContent() {
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    await api.post("/events", formData, { headers: { "Content-Type": "multipart/form-data" } });
    toast.success("Event created successfully!");
    router.push("/dashboard/my-events");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Create Event</h1>
      <p className="mt-1 text-slate-500">Fill in the details below to publish a new event.</p>
      <div className="mt-6 max-w-2xl">
        <EventForm onSubmit={handleSubmit} submitLabel="Publish Event" />
      </div>
    </div>
  );
}

export default function CreateEventPage() {
  return (
    <ProtectedRoute allow={["organizer", "admin"]}>
      <CreateEventContent />
    </ProtectedRoute>
  );
}
