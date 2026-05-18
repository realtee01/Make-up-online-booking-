import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface PreloaderProps {
  businessName?: string;
  onComplete: () => void;
  isLoading?: boolean;
}

export default function Preloader({ businessName = "Maison Lumière", onComplete, isLoading = false }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [minTimePassed, setMinTimePassed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 2000); // 2 second minimum display time

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimePassed && !isLoading) {
      setIsVisible(false);
      const timer = setTimeout(onComplete, 800); // Wait for exit animation
      return () => clearTimeout(timer);
    }
  }, [minTimePassed, isLoading, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-50"
        >
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-center"
          >
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-brand-900 tracking-tight font-light italic">
              {businessName}
            </h1>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
