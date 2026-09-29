"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

interface FadeInViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** How far (px) to slide up from. Default 20. */
  y?: number;
  /** Intersection margin before trigger. Default "-60px". */
  margin?: string;
}

/**
 * Thin client wrapper that adds a whileInView fade-up animation.
 * Import this in Server Components instead of using motion.div directly,
 * so the parent stays a Server Component and avoids a full client boundary.
 */
export default function FadeInView({
  children,
  className,
  delay = 0,
  y = 20,
  margin = "-60px",
}: FadeInViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{ duration: 0.55, ease, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
