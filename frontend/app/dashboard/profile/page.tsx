"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import api, { getErrorMessage } from "@/lib/axios";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateUser } from "@/redux/slices/authSlice";

interface ProfileForm {
  name: string;
  phone: string;
}

function ProfileContent() {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit } = useForm<ProfileForm>({
    defaultValues: { name: user?.name || "", phone: user?.phone || "" },
  });

  const onSubmit = async (values: ProfileForm) => {
    setSaving(true);
    try {
      const { data } = await api.patch("/users/me", values);
      dispatch(updateUser(data));
      toast.success("Profile updated");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
      <p className="mt-1 text-slate-500">Manage your account information.</p>

      <div className="mt-6 max-w-lg">
        <div className="card flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-600">
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card mt-4 flex flex-col gap-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" {...register("name", { required: true })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" placeholder="03xx-xxxxxxx" {...register("phone")} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={user?.email} disabled />
            <p className="mt-1 text-xs text-slate-400">Email cannot be changed.</p>
          </div>
          <button type="submit" disabled={saving} className="btn-primary self-start">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
