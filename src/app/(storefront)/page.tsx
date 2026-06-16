"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function StorefrontPage() {
  const FADE_UP_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "tween", duration: 0.5 } as any },
  };

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero_bg.png"
            alt="Hero Background"
            fill
            className="object-cover object-top"
            priority
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="relative z-10 text-center px-4 max-w-4xl mx-auto"
        >
          <motion.h1
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white tracking-tighter mb-6"
          >
            ELEVATE YOUR EVERYDAY
          </motion.h1>
          <motion.p
            variants={FADE_UP_ANIMATION_VARIANTS}
            className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light"
          >
            Discover our new collection of premium essentials. Crafted for the modern man with uncompromising quality and timeless design.
          </motion.p>
          <motion.div variants={FADE_UP_ANIMATION_VARIANTS}>
            <Link href="/categories/new-arrivals" className="inline-flex items-center justify-center font-medium bg-white text-black hover:bg-white/90 px-8 py-4 text-lg">
              Shop New Arrivals
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 md:px-8 max-w-[1600px] mx-auto w-full">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl md:text-4xl font-serif tracking-tight">The Essentials</h2>
          <Link href="/categories/men" className="text-sm font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "Tailoring", image: "/images/tailoring_cat.png", href: "/categories/tailoring" },
            { name: "Knitwear", image: "/images/knitwear_cat.png", href: "/categories/knitwear" },
            { name: "Outerwear", image: "/images/outerwear_cat.png", href: "/categories/outerwear" },
          ].map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative aspect-[4/5] overflow-hidden bg-muted cursor-pointer"
            >
              <Link href={cat.href}>
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-serif text-white mb-2">{cat.name}</h3>
                  <span className="text-white/80 text-sm font-medium uppercase tracking-wider flex items-center gap-2 group-hover:gap-4 transition-all">
                    Shop Now <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Banner */}
      <section className="relative py-32 px-4 md:px-8 w-full flex items-center justify-center overflow-hidden bg-black text-white">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="absolute inset-0 z-0"
        >
           <Image
            src="/images/craft_banner.png"
            alt="Craftsmanship"
            fill
            className="object-cover opacity-40"
          />
        </motion.div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-serif mb-6"
          >
            UNCOMPROMISING CRAFTSMANSHIP
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/80 mb-8 font-light"
          >
            Every piece in our collection is designed with intention and crafted using the finest materials. We believe in creating garments that not only look exceptional but endure the test of time.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/about" className="inline-flex items-center justify-center font-medium border border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg">
              Explore Our Story
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
