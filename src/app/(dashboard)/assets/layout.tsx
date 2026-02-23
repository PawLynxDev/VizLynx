"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/assets", label: "All" },
  { href: "/assets/promote", label: "Promote" },
  { href: "/assets/remove-bg", label: "Remove BG" },
  { href: "/assets/brand-kits", label: "Brand Kits" },
];

export default function AssetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Assets</h1>

      {/* Tabs Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {children}
    </div>
  );
}
