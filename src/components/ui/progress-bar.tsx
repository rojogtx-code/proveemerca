"use client";

import { motion, useSpring } from "framer-motion";
import { useEffect } from "react";

export function ProgressBar({ progress }: { progress: number }) {
  const scaleX = useSpring(0, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    scaleX.set(progress / 100);
  }, [progress, scaleX]);

  return (
    <div className="fixed top-0 left-0 right-0 h-1.5 z-50 bg-slate-200">
      <motion.div
        className="absolute top-0 left-0 bottom-0 bg-[#e4002b] origin-left"
        style={{ scaleX }}
      />
    </div>
  );
}
