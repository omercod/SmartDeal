"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import "./Counter.css";

function Counter({ value, title }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);

  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
  });
  const isInView = useInView(ref);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (isInView && !hasAnimated) {
      motionValue.set(value);
      setHasAnimated(true);
    }
  }, [motionValue, value, isInView, hasAnimated]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("he-IL").format(
          Math.floor(latest)
        );
      }
    });
  }, [springValue]);

  return (
    <div className="flex flex-col items-center justify-center gap-2 ">
      <motion.div ref={ref} className="text-4xl font-bold text-[#D4AF37]">
        0
      </motion.div>
      <div className="text-lg text-muted-foreground">{title}</div>
    </div>
  );
}

export function AnimatedCounters() {
  return (
    <div className="grid-wrapper">
      <div className="grid">
        <Counter value={1206} title="עבודות הושלמו" />
        <Counter value={256} title="אנשי מקצוע" />
        <Counter value={98} title="% שביעות רצון" />
      </div>
    </div>
  );
}
