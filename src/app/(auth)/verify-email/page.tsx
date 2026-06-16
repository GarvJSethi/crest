import { VerifyOtpForm } from "@/features/auth/components/verify-otp-form";
import { Suspense } from "react";

export const metadata = {
  title: "Verify Email - Crest",
  description: "Verify your email address to complete registration",
};

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <VerifyOtpForm />
    </Suspense>
  );
}
