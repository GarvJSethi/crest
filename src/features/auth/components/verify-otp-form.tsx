"use client";

import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "your email address";

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-6">
      <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
        <MailCheck className="h-8 w-8" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          We've sent a confirmation link to <br/>
          <span className="font-medium text-foreground">{emailParam}</span>.
        </p>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
          Please click the link in that email to confirm your account and sign in automatically.
        </p>
      </div>
      <div className="pt-4 text-center">
        <p className="text-xs text-muted-foreground mb-4">
          Didn't receive the email? Check your spam folder.
        </p>
        <Button variant="outline" asChild>
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    </div>
  );
}
