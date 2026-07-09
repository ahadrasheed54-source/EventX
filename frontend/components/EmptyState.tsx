export default function EmptyState({
  title = "Nothing here yet",
  subtitle,
  icon = "📭",
}: {
  title?: string;
  subtitle?: string;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="font-medium text-slate-700">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}
