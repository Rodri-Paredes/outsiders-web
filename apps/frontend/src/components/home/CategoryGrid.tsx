'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HomeCategory } from '@/services/cms.service';

interface Props {
  categories: HomeCategory[];
}

export function CategoryGrid({ categories }: Props) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="w-full bg-white overflow-hidden">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full h-[60vh] md:h-[80vh]"
        style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}
      >
        {categories.map((category, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 50 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              },
            }}
            className="w-full h-full"
          >
            <Link
              href={category.href || '/shop'}
              className="relative w-full h-full group overflow-hidden block"
            >
              {/* Background Image */}
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200" />
              )}

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Text Content */}
              <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tighter uppercase transition-transform duration-300 group-hover:-translate-y-1">
                    {category.title}
                  </h3>
                  <svg
                    className="w-5 h-5 md:w-6 md:h-6 text-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                {category.subtitle && (
                  <p className="text-white/80 text-[11px] md:text-xs font-medium tracking-wide">
                    {category.subtitle}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
