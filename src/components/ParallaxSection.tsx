'use client';

import { ReactNode, useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Car } from 'lucide-react';

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
}

export default function ParallaxSection({ children, className = '' }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0]);

  return (
    <section ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-red-50/20 to-transparent" />
        <div className="absolute top-20 left-10 opacity-10">
          <Car className="h-40 w-40 text-red-500" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10">
          <Car className="h-40 w-40 text-red-500 rotate-180" />
        </div>
      </motion.div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}