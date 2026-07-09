"use client";

import { Suspense, useEffect, useState } from "react";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import api, { getErrorMessage } from "@/lib/axios";
import { Paginated, Role, User } from "@/types";
import { useAppSelector } from "@/redux/hooks";

function UsersContent() {
  const currentUser = useAppSelector((s) => s.auth.user);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Paginated<User>>("/users", {
        params: { page, limit: 10, search: search || undefined, role: roleFilter || undefined },
      });
      setUsers(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const changeRole = async (id: string, role: Role) => {
    setBusyId(id);
    try {
      const { data } = await api.patch(`/users/${id}`, { role });
      setUsers((prev) => prev.map((u) => ((u._id || u.id) === id ? data : u)));
      toast.success("Role updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async (id: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setBusyId(id);
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      setUsers((prev) => prev.filter((u) => (u._id || u.id) !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
      <p className="mt-1 text-slate-500">Search, filter, and manage every account on the platform.</p>

      <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          className="input"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input sm:w-48"
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="organizer">Organizer</option>
          <option value="participant">Participant</option>
        </select>
        <button type="submit" className="btn-primary sm:w-auto">Search</button>
      </form>

      <div className="card mt-6 overflow-x-auto !p-0">
        {loading ? (
          <Loader />
        ) : users.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No users found" icon="👥" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const uid = (u._id || u.id) as string;
                const isSelf = uid === (currentUser?._id || currentUser?.id);
                return (
                  <tr key={uid}>
                    <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs capitalize"
                        value={u.role}
                        disabled={busyId === uid || isSelf}
                        onChange={(e) => changeRole(uid, e.target.value as Role)}
                      >
                        <option value="admin">admin</option>
                        <option value="organizer">organizer</option>
                        <option value="participant">participant</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removeUser(uid)}
                        disabled={busyId === uid || isSelf}
                        className="btn-danger text-xs"
                      >
                        {busyId === uid ? "..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allow={["admin"]}>
      <Suspense fallback={<Loader />}>
        <UsersContent />
      </Suspense>
    </ProtectedRoute>
  );
}
