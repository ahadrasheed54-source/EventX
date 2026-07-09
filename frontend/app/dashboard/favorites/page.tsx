"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import EventCard from "@/components/EventCard";
import api, { getErrorMessage } from "@/lib/axios";
import { EventItem } from "@/types";

function FavoritesContent() {
  const [favorites, setFavorites] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<EventItem[]>("/favorites/mine");
        setFavorites(data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Favorite Events</h1>
      <p className="mt-1 text-slate-500">Events you've saved to check out later.</p>

      <div className="mt-6">
        {loading ? (
          <Loader />
        ) : favorites.length === 0 ? (
          <EmptyState title="No favorites yet" subtitle="Tap the heart icon on any event to save it here." icon="❤️" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((ev) => (
              <EventCard key={ev._id} event={ev} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <ProtectedRoute allow={["participant"]}>
      <FavoritesContent />
    </ProtectedRoute>
  );
}
