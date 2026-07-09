"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import api, { getErrorMessage } from "@/lib/axios";
import { Notification, Paginated } from "@/types";

function NotificationsContent() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Paginated<Notification> & { unreadCount: number }>("/notifications/mine");
      setItems(data.data);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, readStatus: true } : n)));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setItems((prev) => prev.map((n) => ({ ...n, readStatus: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-slate-500">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        {items.length > 0 && (
          <button onClick={markAllRead} className="btn-secondary">
            Mark all as read
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {loading ? (
          <Loader />
        ) : items.length === 0 ? (
          <EmptyState title="No notifications" subtitle="You're all caught up!" icon="🔔" />
        ) : (
          items.map((n) => (
            <button
              key={n._id}
              onClick={() => !n.readStatus && markRead(n._id)}
              className={`card flex items-start justify-between gap-3 text-left transition ${
                !n.readStatus ? "border-primary-200 bg-primary-50/40" : ""
              }`}
            >
              <div>
                <p className="font-semibold text-slate-900">{n.title}</p>
                <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                {n.createdAt && (
                  <p className="mt-2 text-xs text-slate-400">
                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                  </p>
                )}
              </div>
              {!n.readStatus && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary-600" />}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <NotificationsContent />
    </ProtectedRoute>
  );
}
