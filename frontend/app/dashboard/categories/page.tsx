"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ProtectedRoute from "@/components/ProtectedRoute";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import api, { getErrorMessage } from "@/lib/axios";
import { Category } from "@/types";

interface CategoryForm {
  name: string;
  image?: string;
}

function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<CategoryForm>();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Category[]>("/categories");
      setCategories(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startEdit = (cat: Category) => {
    setEditingId(cat._id);
    reset({ name: cat.name, image: cat.image });
  };

  const cancelEdit = () => {
    setEditingId(null);
    reset({ name: "", image: "" });
  };

  const onSubmit = async (values: CategoryForm) => {
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/categories/${editingId}`, values);
        toast.success("Category updated");
      } else {
        await api.post("/categories", values);
        toast.success("Category created");
      }
      reset({ name: "", image: "" });
      setEditingId(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setBusyId(id);
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
      <p className="mt-1 text-slate-500">Manage the categories events can be tagged with.</p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <form onSubmit={handleSubmit(onSubmit)} className="card flex h-fit flex-col gap-4">
          <h2 className="font-semibold text-slate-900">{editingId ? "Edit Category" : "New Category"}</h2>
          <div>
            <label className="label">Name</label>
            <input className="input" placeholder="Music" {...register("name", { required: true })} />
          </div>
          <div>
            <label className="label">Image URL (optional)</label>
            <input className="input" placeholder="https://..." {...register("image")} />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1">
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-2">
          {loading ? (
            <Loader />
          ) : categories.length === 0 ? (
            <EmptyState title="No categories yet" subtitle="Create your first category." icon="🏷️" />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {categories.map((cat) => (
                <div key={cat._id} className="card flex items-center justify-between">
                  <span className="font-medium text-slate-900">{cat.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(cat)} className="btn-secondary text-xs">
                      Edit
                    </button>
                    <button
                      onClick={() => removeCategory(cat._id)}
                      disabled={busyId === cat._id}
                      className="btn-danger text-xs"
                    >
                      {busyId === cat._id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <ProtectedRoute allow={["admin"]}>
      <CategoriesContent />
    </ProtectedRoute>
  );
}
