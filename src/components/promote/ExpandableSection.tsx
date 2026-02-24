"use client";

import { useState, ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExpandableSectionProps {
  title: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}

export function ExpandableSection({
  title,
  defaultExpanded = false,
  children,
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-8 py-6 text-left transition-colors hover:bg-gray-50"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {isExpanded ? (
          <ChevronDown className="h-5 w-5 text-gray-600 transition-transform" />
        ) : (
          <ChevronRight className="h-5 w-5 text-gray-600 transition-transform" />
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-8 py-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
