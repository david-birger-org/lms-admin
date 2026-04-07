"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { stripLocalePrefix } from "@/i18n/locale";
import { useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";

function buildAuthHref(path: string, redirectTo: string) {
  if (!redirectTo || redirectTo === "/") {
    return path;
  }

  const params = new URLSearchParams({ redirect_url: redirectTo });
  return `${path}?${params.toString()}`;
}

export function SignUpForm() {
  const t = useTranslations("auth.signUp");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_url")?.trim() || "/";
  const navigationTarget = stripLocalePrefix(redirectTo);
  const signInHref = useMemo(
    () => buildAuthHref("/sign-in", redirectTo),
    [redirectTo],
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setIsSubmitting(true);

    try {
      const derivedName = email.split("@")[0] || email;
      const { error: signUpError } = await authClient.signUp.email({
        callbackURL: navigationTarget,
        email,
        name: derivedName,
        password,
      });

      if (signUpError) {
        setError(signUpError.message || t("error"));
        return;
      }

      router.replace(navigationTarget);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : t("error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthCard
      description={t("description")}
      footerHref={signInHref}
      footerLabel={t("footerLabel")}
      footerText={t("footerText")}
      title={t("title")}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            autoComplete="email"
            id="email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            required
            type="email"
            value={email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            autoComplete="new-password"
            id="password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
          <Input
            autoComplete="new-password"
            id="confirmPassword"
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </div>
        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <Button className="h-9 w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? t("submitting") : t("submit")}
        </Button>
      </form>
    </AuthCard>
  );
}
