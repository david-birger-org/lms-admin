"use client";

import { ModeToggle } from "@/components/dashboard/mode-toggle";
import { LanguageSwitcherClient } from "@/components/layout/language-switcher-client";

export function DashboardHeaderControls() {
  return (
    <div className="ml-auto flex items-center gap-2">
      <LanguageSwitcherClient />
      <ModeToggle />
    </div>
  );
}
