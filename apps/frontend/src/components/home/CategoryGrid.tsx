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
    <section className="w-full bg-white overflow-hidden py-1">
      {/* ── Mobile: cuadrícula 2x2 ── */}
      <div className="grid md:hidden grid-cols-2 gap-2 px-3">
        {categories.map((category, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.25, 1, 0.5, 1] }}
            className="rounded-2xl overflow-hidden aspect-[3/4]"
          >
            <Link
              href={category.href || '/shop'}
              className="relative w-full h-full group overflow-hidden block"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                  sizes="45vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-3">
                {category.subtitle && (
                  <span className="text-white/70 text-[9px] font-bold tracking-[0.25em] uppercase block mb-0.5">
                    {category.subtitle}
                  </span>
                )}
                <h3 className="text-xl font-bold text-white tracking-tighter uppercase leading-none">
                  {category.title}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── Desktop: grid vertical ── */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
          },
        }}
        className="hidden md:grid w-full h-[80vh] gap-1 px-1"
        style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 4)}, 1fr)` }}
      >
        {categories.map((category, index) => (
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, scale: 0.95, filter: 'blur(10px)' },
              visible: {
                opacity: 1,
                scale: 1,
                filter: 'blur(0px)',
                transition: { duration: 1, ease: [0.25, 1, 0.5, 1] },
              },
            }}
            className="w-full h-full rounded-2xl overflow-hidden"
          >
            <Link
              href={category.href || '/shop'}
              className="relative w-full h-full group overflow-hidden block"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  className="object-cover transition-all duration-1000 group-hover:scale-110 group-hover:brightness-75"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-700 opacity-60 group-hover:opacity-90" />
              <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end">
                <div className="flex flex-col transform transition-transform duration-500 ease-out translate-y-6 group-hover:translate-y-0">
                  {category.subtitle && (
                    <span className="text-white/70 text-xs font-bold tracking-[0.3em] uppercase mb-2 opacity-0 -translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 delay-100">
                      {category.subtitle}
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <h3 className="text-5xl font-bold text-white tracking-tighter uppercase leading-none">
                      {category.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-4 opacity-0 transition-opacity duration-500 delay-150 group-hover:opacity-100">
                    <span className="text-xs text-white uppercase tracking-widest font-semibold border-b border-white pb-0.5">
                      Ver Colección
                    </span>
                    <svg
                      className="w-4 h-4 text-white transform transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
