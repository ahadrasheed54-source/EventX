import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <p className="text-7xl">🧭</p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-slate-500">The page you're looking for doesn't exist.</p>
        <Link href="/" className="btn-primary mt-6">
          Back to Home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
