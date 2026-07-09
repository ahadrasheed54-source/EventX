"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import StarRating from "@/components/StarRating";
import api, { getErrorMessage } from "@/lib/axios";
import { Review } from "@/types";

function ReviewsContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Review[]>("/reviews/mine");
      setReviews(data);
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
    if (!confirm("Delete this review?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/reviews/${id}`);
      toast.success("Review deleted");
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Reviews</h1>
      <p className="mt-1 text-slate-500">Reviews you've left on events you attended.</p>

      <div className="mt-6 flex flex-col gap-4">
        {loading ? (
          <Loader />
        ) : reviews.length === 0 ? (
          <EmptyState title="No reviews yet" subtitle="Reviews you leave on events will show up here." icon="⭐" />
        ) : (
          reviews.map((r) => {
            const ev = typeof r.event === "object" ? r.event : null;
            return (
              <div key={r._id} className="card flex items-start justify-between gap-4">
                <div>
                  {ev && (
                    <Link href={`/events/${ev._id}`} className="font-semibold text-slate-900 hover:text-primary-600">
                      {ev.title}
                    </Link>
                  )}
                  <div className="mt-1">
                    <StarRating value={r.rating} size="text-sm" />
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
                </div>
                <button
                  onClick={() => handleDelete(r._id)}
                  disabled={deletingId === r._id}
                  className="btn-danger shrink-0"
                >
                  {deletingId === r._id ? "..." : "Delete"}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <ProtectedRoute allow={["participant"]}>
      <ReviewsContent />
    </ProtectedRoute>
  );
}
