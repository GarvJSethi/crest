"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyOtpSchema, type VerifyOtpInput } from "@/validations/auth";
import { verifyOtpAction } from "@/features/auth/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function VerifyOtpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpInput>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      email: emailParam,
      token: "",
    },
  });

  async function onSubmit(data: VerifyOtpInput) {
    setIsLoading(true);
    try {
      const result = await verifyOtpAction(data.email, data.token);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Email verified successfully! Welcome.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We've sent a 6-digit verification code to <span className="font-medium text-foreground">{emailParam}</span>.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 hidden">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="hidden"
            {...register("email")} 
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="token">Verification Code</Label>
          <Input 
            id="token" 
            type="text" 
            maxLength={6}
            placeholder="000000" 
            className="text-center text-2xl tracking-widest font-mono h-12"
            {...register("token")} 
            aria-invalid={!!errors.token}
          />
          {errors.token && (
            <p className="text-sm font-medium text-destructive">{errors.token.message}</p>
          )}
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Verify Email"
          )}
        </Button>
      </form>
    </div>
  );
}
