"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import EmptyState from "@/components/EmptyState";
import LoaderSpin from "@/components/Loader";
import api from "@/lib/axios";
import { Category, EventItem, Paginated } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [eventsRes, catsRes] = await Promise.all([
          api.get<Paginated<EventItem>>("/events", { params: { limit: 6 } }),
          api.get<Category[]>("/categories"),
        ]);
        setEvents(eventsRes.data.data);
        setCategories(catsRes.data);
      } catch {
        // silent - home page should never hard-fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(search ? `/events?search=${encodeURIComponent(search)}` : "/events");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur">
              🎉 Discover events happening around you
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight sm:text-5xl">
              Find, Host & Manage Events with EventX
            </h1>
            <p className="mt-4 text-lg text-primary-100">
              From conferences to concerts — browse upcoming events, grab your ticket, or launch your own in minutes.
            </p>
            <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-lg gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by title..."
                className="w-full rounded-xl border-0 px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-white"
              />
              <button className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold hover:bg-slate-800">
                Search
              </button>
            </form>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/events" className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary-700 hover:bg-primary-50">
                Browse Events
              </Link>
              <Link href="/register" className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold hover:bg-white/10">
                Become an Organizer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900">Browse by Category</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c._id}
                href={`/events?category=${c._id}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured events */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Upcoming Events</h2>
          <Link href="/events" className="text-sm font-semibold text-primary-600 hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <LoaderSpin />
        ) : events.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="No events yet" subtitle="Check back soon or create your own event." icon="🗓️" />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev) => (
              <EventCard key={ev._id} event={ev} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
