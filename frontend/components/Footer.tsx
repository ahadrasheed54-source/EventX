import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-400 text-xs font-bold text-white">
              EX
            </span>
            <span className="font-bold text-slate-900">EventX</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link href="/about" className="hover:text-primary-600">About</Link>
            <Link href="/contact" className="hover:text-primary-600">Contact</Link>
            <Link href="/events" className="hover:text-primary-600">Events</Link>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} EventX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
