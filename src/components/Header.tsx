"use client";

import { UserButton } from "@clerk/nextjs";
import { Sparkles, Menu } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { MobileSidebar } from "./MobileSidebar";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/projects" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-violet-600" />
            <span className="font-bold">PixelForge</span>
          </Link>
        </div>
        <div className="hidden md:block" />
        <UserButton afterSignOutUrl="/login" />
      </header>
      <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
