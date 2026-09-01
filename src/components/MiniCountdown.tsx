"use client";

import { useEffect, useState } from "react";

export default function MiniCountdown({ endsAt }: { endsAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const end = new Date(endsAt).getTime();
  const msLeft = end - now;
  if (msLeft <= 0) return null;

  const d = Math.floor(msLeft / 86_400_000);
  const h = Math.floor((msLeft % 86_400_000) / 3_600_000);
  const m = Math.floor((msLeft % 3_600_000) / 60_000);
  const s = Math.floor((msLeft % 60_000) / 1000);

  const label = d > 0 ? `${d}d ${h}h left` : h > 0 ? `${h}h ${m}m left` : `${m}m ${s}s left`;

  return (
    <span className="absolute bottom-2 right-2 z-10 rounded-full bg-[#2B2420]/90 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm">
      {label}
    </span>
  );
}