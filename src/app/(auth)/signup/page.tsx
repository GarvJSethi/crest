import Link from "next/link";
import { SignupForm } from "@/features/auth/components/signup-form";

export const metadata = {
  title: "Create an Account",
  description: "Create your Crest account to start shopping",
};

export default function SignupPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center mb-4">
        <h1 className="text-3xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Enter your details below to create your account
        </p>
      </div>
      
      <SignupForm />
      
      <p className="px-8 text-center text-sm text-muted-foreground mt-8">
        By clicking continue, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </p>
      
      <p className="px-8 text-center text-sm text-muted-foreground mt-4">
        Already have an account?{" "}
        <Link
          href="/login"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
