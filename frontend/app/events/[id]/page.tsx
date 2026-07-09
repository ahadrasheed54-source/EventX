"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "react-toastify";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import StarRating from "@/components/StarRating";
import api, { fileUrl, getErrorMessage } from "@/lib/axios";
import { useAppSelector } from "@/redux/hooks";
import { EventItem, Review, Paginated } from "@/types";

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAppSelector((s) => s.auth);

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadEvent = async () => {
    try {
      const { data } = await api.get<EventItem>(`/events/${id}`);
      setEvent(data);
    } catch {
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const { data } = await api.get<Paginated<Review> & { averageRating: number }>(`/reviews/event/${id}`);
      setReviews(data.data);
      setAvgRating(data.averageRating);
      setReviewCount(data.total);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (id) {
      loadEvent();
      loadReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (user?.favorites && event) {
      setIsFavorite(user.favorites.includes(event._id));
    }
  }, [user, event]);

  const handleBook = async () => {
    if (!user) return router.push("/login");
    if (user.role !== "participant") {
      toast.info("Only participants can book tickets.");
      return;
    }
    setBooking(true);
    try {
      await api.post("/tickets", { eventId: id });
      toast.success("Ticket booked successfully!");
      loadEvent();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBooking(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) return router.push("/login");
    if (user.role !== "participant") return;
    try {
      const { data } = await api.post(`/favorites/${id}`);
      setIsFavorite(data.isFavorite);
      toast.success(data.isFavorite ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return router.push("/login");
    setSubmittingReview(true);
    try {
      await api.post("/reviews", { eventId: id, rating, comment });
      toast.success("Review submitted!");
      setComment("");
      setRating(5);
      loadReviews();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <Loader label="Loading event..." />
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <EmptyState title="Event not found" subtitle="This event may have been removed." icon="🚫" />
        </div>
        <Footer />
      </div>
    );
  }

  const categoryName = typeof event.category === "object" ? event.category.name : "";
  const organizerName = typeof event.organizer === "object" ? event.organizer.name : "";
  const soldOut = event.availableSeats <= 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 sm:h-96">
          {event.image ? (
            <Image src={fileUrl(event.image)} alt={event.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">🎉</div>
          )}
        </div>

        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            {categoryName && (
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                {categoryName}
              </span>
            )}
            <h1 className="mt-2 text-3xl font-bold text-slate-900">{event.title}</h1>
            <p className="mt-1 text-slate-500">Hosted by {organizerName || "an organizer"}</p>
            {reviewCount > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <StarRating value={avgRating} />
                <span className="text-sm text-slate-500">
                  {avgRating.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleFavorite}
              className="btn-secondary"
              title="Save to favorites"
            >
              {isFavorite ? "❤️ Saved" : "🤍 Save"}
            </button>
            <button
              onClick={handleBook}
              disabled={booking || soldOut}
              className="btn-primary"
            >
              {soldOut ? "Sold Out" : booking ? "Booking..." : `Book Ticket · ${event.ticketPrice > 0 ? `Rs. ${event.ticketPrice}` : "Free"}`}
            </button>
          </div>
        </div>

        {event.announcement && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            📣 <strong>Announcement:</strong> {event.announcement}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <p className="text-xs text-slate-400">Date & Time</p>
            <p className="mt-1 font-semibold text-slate-900">{format(new Date(event.date), "MMM d, yyyy")}</p>
            <p className="text-sm text-slate-500">{event.time}</p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-400">Venue</p>
            <p className="mt-1 font-semibold text-slate-900">{event.venue}</p>
            <p className="text-sm text-slate-500">{event.location}</p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-400">Ticket Price</p>
            <p className="mt-1 font-semibold text-slate-900">
              {event.ticketPrice > 0 ? `Rs. ${event.ticketPrice}` : "Free"}
            </p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-400">Seats Available</p>
            <p className="mt-1 font-semibold text-slate-900">
              {event.availableSeats} / {event.totalSeats}
            </p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-900">About this event</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">{event.description}</p>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900">Reviews</h2>

          {user?.role === "participant" && (
            <form onSubmit={handleReviewSubmit} className="card mt-4 flex flex-col gap-3">
              <label className="label">Your Rating</label>
              <StarRating value={rating} onChange={setRating} size="text-2xl" />
              <textarea
                className="input"
                rows={3}
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button type="submit" disabled={submittingReview} className="btn-primary self-start">
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          <div className="mt-6 flex flex-col gap-4">
            {reviews.length === 0 ? (
              <EmptyState title="No reviews yet" subtitle="Be the first to share your experience." icon="⭐" />
            ) : (
              reviews.map((r) => {
                const reviewer = typeof r.user === "object" ? r.user : null;
                return (
                  <div key={r._id} className="card">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{reviewer?.name || "Anonymous"}</p>
                      <StarRating value={r.rating} size="text-sm" />
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
