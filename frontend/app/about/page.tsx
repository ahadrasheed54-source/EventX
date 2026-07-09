import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">About EventX</h1>
        <p className="mt-4 leading-relaxed text-slate-600">
          EventX is a complete event management platform that connects organizers with participants.
          Organizers can create and manage events, sell tickets, and track attendance, while participants
          can discover events, book tickets, and share reviews — all in one place.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="card text-center">
            <p className="text-3xl">🎪</p>
            <p className="mt-2 font-semibold text-slate-900">For Organizers</p>
            <p className="mt-1 text-sm text-slate-500">Create and manage events with ease.</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl">🎟️</p>
            <p className="mt-2 font-semibold text-slate-900">For Participants</p>
            <p className="mt-1 text-sm text-slate-500">Discover and book events in seconds.</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl">📊</p>
            <p className="mt-2 font-semibold text-slate-900">For Admins</p>
            <p className="mt-1 text-sm text-slate-500">Monitor the whole platform at a glance.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
