"use client";

import { usePromotionStore } from "@/stores/promotionStore";
import { motion } from "framer-motion";

export function MarketingCopyPanel() {
  const store = usePromotionStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
        <h3 className="font-semibold text-gray-900">Marketing Copy</h3>
        <p className="mt-1 text-xs text-gray-600">
          Edit your marketing text for the final image
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500">
            Headline
          </label>
          <input
            type="text"
            value={store.editedHeadline}
            onChange={(e) => store.setEditedHeadline(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter headline..."
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500">
            Subline
          </label>
          <input
            type="text"
            value={store.editedSubline}
            onChange={(e) => store.setEditedSubline(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter subline..."
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-gray-500">
            CTA
          </label>
          <input
            type="text"
            value={store.editedCta}
            onChange={(e) => store.setEditedCta(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            placeholder="Enter CTA..."
          />
        </div>
      </div>
    </motion.div>
  );
}
