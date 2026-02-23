"use client";

import { motion } from "framer-motion";

const logos = [
  "Shopify", "Amazon", "Etsy", "WooCommerce", "BigCommerce",
  "Walmart", "eBay", "Target", "Magento", "Squarespace"
];

export function MarqueeLogos() {
  return (
    <div className="relative overflow-hidden py-12">
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-white via-transparent to-white" />

      <motion.div
        className="flex gap-16"
        animate={{
          x: [0, -1920],
        }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: "loop",
            duration: 40,
            ease: "linear",
          },
        }}
      >
        {/* First set */}
        {logos.map((logo, i) => (
          <div
            key={`first-${i}`}
            className="flex items-center justify-center px-8"
          >
            <span className="text-2xl font-bold text-gray-400 whitespace-nowrap">
              {logo}
            </span>
          </div>
        ))}
        {/* Duplicate set for seamless loop */}
        {logos.map((logo, i) => (
          <div
            key={`second-${i}`}
            className="flex items-center justify-center px-8"
          >
            <span className="text-2xl font-bold text-gray-400 whitespace-nowrap">
              {logo}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
