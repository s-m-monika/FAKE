import type { ReactNode } from "react";
import { motion } from "framer-motion";

/**
 * App shell: a single centered content column on a light background.
 * (The left branding panel has been removed.)
 */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <main className="shell__content">
        <motion.div
          className="shell__inner"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
