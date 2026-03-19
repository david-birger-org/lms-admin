"use client";

import { UserButton } from "@clerk/nextjs";

export function AdminHeaderActions() {
  return (
    <div className="flex h-10 items-center rounded-full border bg-background px-1 shadow-sm">
      <UserButton userProfileMode="navigation" userProfileUrl="/settings" />
    </div>
  );
}
