"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";

export function SwitchAccountButton() {
  const t = useTranslations("auth.switchAccount");
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <Button
      type="button"
      disabled={isSigningOut}
      onClick={() => void handleSignOut()}
    >
      <LogOut />
      {isSigningOut ? t("signingOut") : t("label")}
    </Button>
  );
}
