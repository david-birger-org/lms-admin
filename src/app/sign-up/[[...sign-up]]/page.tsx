import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <SignUp
        fallbackRedirectUrl="/api/post-sign-up"
        forceRedirectUrl="/api/post-sign-up"
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
      />
    </main>
  );
}
