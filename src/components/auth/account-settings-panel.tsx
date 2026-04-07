"use client";

import { KeyRound, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";

export function AccountSettingsPanel({
  email,
  fullName,
  role,
}: {
  email: string;
  fullName: string;
  role: string;
}) {
  const t = useTranslations("settings");
  const accountMenuT = useTranslations("auth.accountMenu");
  const router = useRouter();
  const [name, setName] = useState(fullName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingProfile(true);

    const { error } = await authClient.updateUser({ name: name.trim() });

    setIsSavingProfile(false);

    if (error) {
      toast.error(error.message || t("profile.error"));
      return;
    }

    toast.success(t("profile.updated"));
    router.refresh();
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t("password.mismatch"));
      return;
    }

    setIsSavingPassword(true);

    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    setIsSavingPassword(false);

    if (error) {
      toast.error(error.message || t("password.error"));
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success(t("password.updated"));
  }

  async function handleSignOut() {
    setIsSigningOut(true);
    await authClient.signOut();
    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <div className="grid gap-4">
        <Card className="shadow-xs">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <UserRound className="size-4" />
              {t("profile.title")}
            </CardTitle>
            <CardDescription>{t("profile.description")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleProfileSubmit}>
              <div className="space-y-2">
                <Label htmlFor="settings-name">{t("profile.name")}</Label>
                <Input
                  id="settings-name"
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t("profile.namePlaceholder")}
                  value={name}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="settings-email">{t("profile.email")}</Label>
                <Input disabled id="settings-email" value={email} />
              </div>
              <Button className="h-9" disabled={isSavingProfile} type="submit">
                {isSavingProfile ? t("profile.saving") : t("profile.save")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <KeyRound className="size-4" />
              {t("password.title")}
            </CardTitle>
            <CardDescription>{t("password.description")}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="space-y-2">
                <Label htmlFor="current-password">
                  {t("password.current")}
                </Label>
                <Input
                  autoComplete="current-password"
                  id="current-password"
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                  type="password"
                  value={currentPassword}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">{t("password.new")}</Label>
                <Input
                  autoComplete="new-password"
                  id="new-password"
                  minLength={8}
                  onChange={(event) => setNewPassword(event.target.value)}
                  required
                  type="password"
                  value={newPassword}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-new-password">
                  {t("password.confirm")}
                </Label>
                <Input
                  autoComplete="new-password"
                  id="confirm-new-password"
                  minLength={8}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  type="password"
                  value={confirmPassword}
                />
              </div>
              <Button className="h-9" disabled={isSavingPassword} type="submit">
                {isSavingPassword
                  ? t("password.submitting")
                  : t("password.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit shadow-xs">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <ShieldCheck className="size-4" />
            {t("session.title")}
          </CardTitle>
          <CardDescription>{t("session.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1 rounded-lg border bg-muted/20 p-4 text-sm">
            <p className="text-muted-foreground">{t("session.role")}</p>
            <p className="font-medium text-foreground">{role}</p>
          </div>
          <div className="space-y-1 rounded-lg border bg-muted/20 p-4 text-sm">
            <p className="text-muted-foreground">{t("session.email")}</p>
            <p className="break-all font-medium text-foreground">{email}</p>
          </div>
          <Button
            className="h-9 w-full"
            disabled={isSigningOut}
            onClick={() => void handleSignOut()}
            type="button"
            variant="outline"
          >
            <LogOut className="size-4" />
            {isSigningOut
              ? accountMenuT("signingOut")
              : accountMenuT("signOut")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
