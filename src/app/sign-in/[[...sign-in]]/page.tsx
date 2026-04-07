import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/sign-in-form";

function shouldRedirectToSignUp(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const product =
    typeof searchParams.product === "string" ? searchParams.product.trim() : "";
  const slug =
    typeof searchParams.slug === "string" ? searchParams.slug.trim() : "";
  const redirectUrl =
    typeof searchParams.redirect_url === "string"
      ? searchParams.redirect_url.trim()
      : "";

  return Boolean(product || slug || redirectUrl.includes("product="));
}

function buildSignUpUrl(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value))
      value.forEach((item) => {
        params.append(key, item);
      });
  }

  const query = params.toString();
  return query ? `/sign-up?${query}` : "/sign-up";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  if (shouldRedirectToSignUp(params)) redirect(buildSignUpUrl(params));

  return (
    <main className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_45%),linear-gradient(180deg,_rgba(255,255,255,1),_rgba(248,250,252,1))] px-4 py-10">
      <SignInForm />
    </main>
  );
}
