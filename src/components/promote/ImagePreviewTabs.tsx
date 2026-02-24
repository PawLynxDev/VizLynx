"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Sparkles, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImagePreviewTabsProps {
  sourceImageUrl: string | null;
  fluxImageUrl: string | null;
  finalImageUrl: string | null;
  onReset?: () => void;
}

type TabType = "original" | "generated" | "final";

export function ImagePreviewTabs({
  sourceImageUrl,
  fluxImageUrl,
  finalImageUrl,
  onReset,
}: ImagePreviewTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("original");

  // Auto-switch to new tab when new image appears
  useEffect(() => {
    if (finalImageUrl && activeTab !== "final") {
      setActiveTab("final");
    } else if (fluxImageUrl && !finalImageUrl && activeTab === "original") {
      setActiveTab("generated");
    }
  }, [fluxImageUrl, finalImageUrl, activeTab]);

  const tabs = [
    {
      id: "original" as TabType,
      label: "Original",
      icon: ImageIcon,
      available: !!sourceImageUrl,
      imageUrl: sourceImageUrl,
    },
    {
      id: "generated" as TabType,
      label: "Generated",
      icon: Sparkles,
      available: !!fluxImageUrl,
      imageUrl: fluxImageUrl,
    },
    {
      id: "final" as TabType,
      label: "Final",
      icon: Wand2,
      available: !!finalImageUrl,
      imageUrl: finalImageUrl,
    },
  ];

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="space-y-4">
      {/* Tabs Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => tab.available && setActiveTab(tab.id)}
                disabled={!tab.available}
                className={cn(
                  "flex items-center gap-2 rounded-2xl border-2 px-5 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : tab.available
                    ? "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {onReset && sourceImageUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="rounded-xl text-gray-600 hover:text-gray-900"
          >
            <X className="mr-2 h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Image Preview Area */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <AnimatePresence mode="wait">
          {activeTabData?.imageUrl ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <div className="overflow-hidden rounded-2xl bg-gray-50">
                <img
                  src={activeTabData.imageUrl}
                  alt={activeTabData.label}
                  className="w-full object-contain"
                  style={{ maxHeight: "500px" }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-[500px] items-center justify-center rounded-2xl bg-gray-50"
            >
              <div className="text-center">
                <div className="mx-auto mb-4 inline-flex rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-6">
                  <ImageIcon className="h-12 w-12 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500">No image available</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
