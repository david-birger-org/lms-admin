import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpFallbackRedirectUrl="/api/post-sign-up"
        signUpForceRedirectUrl="/api/post-sign-up"
        signUpUrl="/sign-up"
      />
    </main>
  );
}
