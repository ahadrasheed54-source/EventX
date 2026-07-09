interface Props {
  value: number;
  onChange?: (value: number) => void;
  size?: string;
}

export default function StarRating({ value, onChange, size = "text-lg" }: Props) {
  const stars = [1, 2, 3, 4, 5];
  const interactive = Boolean(onChange);

  return (
    <div className={`flex gap-0.5 ${size}`}>
      {stars.map((star) => (
        <span
          key={star}
          onClick={() => onChange?.(star)}
          className={`${interactive ? "cursor-pointer" : ""} ${
            star <= Math.round(value) ? "text-amber-400" : "text-slate-200"
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
