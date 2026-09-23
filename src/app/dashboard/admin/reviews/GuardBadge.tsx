type Guard = {
  risk: "ok" | "suspicious" | "likely_spam";
  score: number;
  reasons: string[];
  aiNote?: string;
};

export default function GuardBadge({ guard }: { guard: Guard }) {
  const cls =
    guard.risk === "likely_spam"
      ? "bg-red-100 text-red-700"
      : guard.risk === "suspicious"
        ? "bg-amber-100 text-amber-800"
        : "bg-emerald-100 text-emerald-700";

  return (
    <div className="mt-1.5">
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cls}`}
      >
        ReviewGuard · {guard.risk} ({guard.score})
      </span>
      {guard.reasons.length > 0 && (
        <p className="mt-1 text-[11px] leading-snug text-neutral-500">
          {guard.reasons.join(" · ")}
        </p>
      )}
      {guard.aiNote && (
        <p className="mt-1 text-[11px] italic text-neutral-500">{guard.aiNote}</p>
      )}
    </div>
  );
}