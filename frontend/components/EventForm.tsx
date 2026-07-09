"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import api, { fileUrl, getErrorMessage } from "@/lib/axios";
import { Category, EventItem } from "@/types";
import { toast } from "react-toastify";

export interface EventFormValues {
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  location: string;
  ticketPrice: number;
  totalSeats: number;
  announcement?: string;
}

export default function EventForm({
  initialEvent,
  onSubmit,
  submitLabel,
}: {
  initialEvent?: EventItem;
  onSubmit: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialEvent?.image ? fileUrl(initialEvent.image) : "");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormValues>({
    defaultValues: initialEvent
      ? {
          title: initialEvent.title,
          description: initialEvent.description,
          category: typeof initialEvent.category === "object" ? initialEvent.category._id : initialEvent.category,
          date: initialEvent.date.slice(0, 10),
          time: initialEvent.time,
          venue: initialEvent.venue,
          location: initialEvent.location,
          ticketPrice: initialEvent.ticketPrice,
          totalSeats: initialEvent.totalSeats,
          announcement: initialEvent.announcement,
        }
      : undefined,
  });

  useEffect(() => {
    api.get<Category[]>("/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const submit = async (values: EventFormValues) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== "") formData.append(key, String(value));
      });
      if (imageFile) formData.append("image", imageFile);
      await onSubmit(formData);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="card flex flex-col gap-4">
      <div>
        <label className="label">Event Banner</label>
        <div className="flex items-center gap-4">
          <div className="relative h-24 w-40 shrink-0 overflow-hidden rounded-xl bg-slate-100">
            {preview ? (
              <Image src={preview} alt="Preview" fill className="object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-2xl">🖼️</div>
            )}
          </div>
          <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm" />
        </div>
      </div>

      <div>
        <label className="label">Title</label>
        <input className="input" {...register("title", { required: "Title is required" })} />
        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div>
        <label className="label">Description</label>
        <textarea className="input" rows={4} {...register("description", { required: "Description is required" })} />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Category</label>
          <select className="input" {...register("category", { required: "Category is required" })}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="input" {...register("date", { required: "Date is required" })} />
          {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>}
        </div>
        <div>
          <label className="label">Time</label>
          <input className="input" placeholder="10:00 AM" {...register("time", { required: "Time is required" })} />
          {errors.time && <p className="mt-1 text-xs text-red-600">{errors.time.message}</p>}
        </div>
        <div>
          <label className="label">Venue</label>
          <input className="input" {...register("venue", { required: "Venue is required" })} />
          {errors.venue && <p className="mt-1 text-xs text-red-600">{errors.venue.message}</p>}
        </div>
        <div>
          <label className="label">Location</label>
          <input className="input" placeholder="City, Country" {...register("location", { required: "Location is required" })} />
          {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location.message}</p>}
        </div>
        <div>
          <label className="label">Ticket Price (Rs.)</label>
          <input
            type="number"
            className="input"
            {...register("ticketPrice", { required: "Price is required", valueAsNumber: true, min: 0 })}
          />
          {errors.ticketPrice && <p className="mt-1 text-xs text-red-600">{errors.ticketPrice.message}</p>}
        </div>
        <div>
          <label className="label">Total Seats</label>
          <input
            type="number"
            className="input"
            {...register("totalSeats", { required: "Total seats is required", valueAsNumber: true, min: 1 })}
          />
          {errors.totalSeats && <p className="mt-1 text-xs text-red-600">{errors.totalSeats.message}</p>}
        </div>
      </div>

      <div>
        <label className="label">Announcement (optional)</label>
        <input className="input" placeholder="Doors open 30 minutes early." {...register("announcement")} />
      </div>

      <button type="submit" disabled={submitting} className="btn-primary self-start">
        {submitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
