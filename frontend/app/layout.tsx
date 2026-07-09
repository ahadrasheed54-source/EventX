import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import ReduxProvider from "@/redux/provider";

export const metadata: Metadata = {
  title: "EventX — Discover & Manage Events",
  description: "A complete event management platform to create, discover, and attend events.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ReduxProvider>
          {children}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </ReduxProvider>
      </body>
    </html>
  );
}
