"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import api from "@/lib/axios";
import { Category, EventItem, Paginated } from "@/types";

function EventsContent() {
  const router = useRouter();
  const params = useSearchParams();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState(params.get("search") || "");
  const [category, setCategory] = useState(params.get("category") || "");
  const [location, setLocation] = useState(params.get("location") || "");
  const [minPrice, setMinPrice] = useState(params.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(params.get("maxPrice") || "");
  const page = Number(params.get("page") || 1);

  useEffect(() => {
    api.get<Category[]>("/categories").then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    api
      .get<Paginated<EventItem>>("/events", {
        params: {
          page,
          limit: 9,
          search: params.get("search") || undefined,
          category: params.get("category") || undefined,
          location: params.get("location") || undefined,
          minPrice: params.get("minPrice") || undefined,
          maxPrice: params.get("maxPrice") || undefined,
        },
      })
      .then((res) => {
        setEvents(res.data.data);
        setTotalPages(res.data.totalPages);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [params]);

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    const query = new URLSearchParams();
    if (search) query.set("search", search);
    if (category) query.set("category", category);
    if (location) query.set("location", location);
    if (minPrice) query.set("minPrice", minPrice);
    if (maxPrice) query.set("maxPrice", maxPrice);
    router.push(`/events?${query.toString()}`);
  };

  const changePage = (p: number) => {
    const query = new URLSearchParams(params.toString());
    query.set("page", String(p));
    router.push(`/events?${query.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    router.push("/events");
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Explore Events</h1>
        <p className="mt-1 text-slate-500">Search and filter to find the perfect event for you.</p>

        {/* Filters */}
        <form onSubmit={applyFilters} className="card mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            className="input lg:col-span-2"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <input className="input" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input className="input" type="number" placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
          <input className="input" type="number" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          <div className="flex gap-2 lg:col-span-6">
            <button type="submit" className="btn-primary">Apply Filters</button>
            <button type="button" onClick={clearFilters} className="btn-secondary">Clear</button>
          </div>
        </form>

        {/* Results */}
        <div className="mt-8">
          {loading ? (
            <Loader />
          ) : events.length === 0 ? (
            <EmptyState title="No events found" subtitle="Try adjusting your search or filters." icon="🔍" />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((ev) => (
                  <EventCard key={ev._id} event={ev} />
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={changePage} />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <EventsContent />
    </Suspense>
  );
}
