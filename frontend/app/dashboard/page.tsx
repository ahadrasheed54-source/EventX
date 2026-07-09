"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import Loader from "@/components/Loader";
import api from "@/lib/axios";
import { useAppSelector } from "@/redux/hooks";

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalTicketsSold: number;
  revenue: number;
  totalReviews: number;
  activeOrganizers: number;
  usersByRole: { _id: string; count: number }[];
  recentEvents: any[];
}

interface OrganizerStats {
  totalEvents: number;
  totalTicketsSold: number;
  revenue: number;
  attendedCount: number;
  recentRegistrations: any[];
  events: any[];
}

interface ParticipantStats {
  registeredEvents: number;
  upcomingEvents: number;
  favoriteEvents: number;
  recentTickets: any[];
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

export default function DashboardOverview() {
  const { user } = useAppSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<AdminStats | null>(null);
  const [organizer, setOrganizer] = useState<OrganizerStats | null>(null);
  const [participant, setParticipant] = useState<ParticipantStats | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        if (user.role === "admin") {
          const { data } = await api.get("/dashboard/admin");
          setAdmin(data);
        } else if (user.role === "organizer") {
          const { data } = await api.get("/dashboard/organizer");
          setOrganizer(data);
        } else {
          const { data } = await api.get("/dashboard/participant");
          setParticipant(data);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Hi {user?.name?.split(" ")[0]}, welcome back 👋</h1>
      <p className="mt-1 text-slate-500 capitalize">{user?.role} dashboard overview</p>

      {/* Admin */}
      {admin && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total Users" value={admin.totalUsers} icon="👥" />
            <StatCard label="Total Events" value={admin.totalEvents} icon="🎪" />
            <StatCard label="Tickets Sold" value={admin.totalTicketsSold} icon="🎟️" />
            <StatCard label="Revenue" value={`Rs. ${admin.revenue}`} icon="💰" />
            <StatCard label="Total Reviews" value={admin.totalReviews} icon="⭐" />
            <StatCard label="Active Organizers" value={admin.activeOrganizers} icon="🧑‍💼" />
          </div>

          <div className="card mt-6">
            <h2 className="font-semibold text-slate-900">Recent Events</h2>
            <div className="mt-4 flex flex-col divide-y divide-slate-100">
              {admin.recentEvents.length === 0 && <p className="py-4 text-sm text-slate-400">No events yet.</p>}
              {admin.recentEvents.map((ev) => (
                <Link key={ev._id} href={`/events/${ev._id}`} className="flex items-center justify-between py-3 hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{ev.title}</p>
                    <p className="text-xs text-slate-400">by {ev.organizer?.name} · {ev.category?.name}</p>
                  </div>
                  <span className="text-xs text-slate-400">{format(new Date(ev.date), "MMM d, yyyy")}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Organizer */}
      {organizer && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="My Events" value={organizer.totalEvents} icon="🎪" />
            <StatCard label="Tickets Sold" value={organizer.totalTicketsSold} icon="🎟️" />
            <StatCard label="Revenue" value={`Rs. ${organizer.revenue}`} icon="💰" />
            <StatCard label="Attended" value={organizer.attendedCount} icon="✅" />
          </div>

          <div className="card mt-6">
            <h2 className="font-semibold text-slate-900">Recent Registrations</h2>
            <div className="mt-4 flex flex-col divide-y divide-slate-100">
              {organizer.recentRegistrations.length === 0 && (
                <p className="py-4 text-sm text-slate-400">No registrations yet.</p>
              )}
              {organizer.recentRegistrations.map((t) => (
                <div key={t._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{t.user?.name}</p>
                    <p className="text-xs text-slate-400">{t.event?.title} · #{t.ticketNumber}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      t.attendanceStatus === "attended" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {t.attendanceStatus === "attended" ? "Attended" : "Not Attended"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Participant */}
      {participant && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="Registered Events" value={participant.registeredEvents} icon="🎟️" />
            <StatCard label="Upcoming Events" value={participant.upcomingEvents} icon="📅" />
            <StatCard label="Favorite Events" value={participant.favoriteEvents} icon="❤️" />
          </div>

          <div className="card mt-6">
            <h2 className="font-semibold text-slate-900">Recent Tickets</h2>
            <div className="mt-4 flex flex-col divide-y divide-slate-100">
              {participant.recentTickets.length === 0 && (
                <p className="py-4 text-sm text-slate-400">You haven't booked any tickets yet.</p>
              )}
              {participant.recentTickets.map((t) => (
                <Link key={t._id} href={`/events/${t.event?._id}`} className="flex items-center justify-between py-3 hover:bg-slate-50">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{t.event?.title}</p>
                    <p className="text-xs text-slate-400">#{t.ticketNumber}</p>
                  </div>
                  <span className="text-xs text-slate-400">{t.event ? format(new Date(t.event.date), "MMM d, yyyy") : ""}</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
