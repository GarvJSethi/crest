"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from "@/validations/auth";
import type { ActionResult } from "@/types";

export async function loginAction(data: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(data);
  
  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signupAction(data: SignupInput): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(data);
  
  if (!parsed.success) {
    return { success: false, error: "Invalid form data" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Instead of redirecting to home, redirect to the verify email page
  // We pass the email in the URL so we can pre-fill it or use it for the verify action.
  redirect(`/verify-email?email=${encodeURIComponent(parsed.data.email)}`);
}

export async function verifyOtpAction(email: string, token: string): Promise<ActionResult> {
  if (!email || !token) {
    return { success: false, error: "Missing email or verification code" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'signup',
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // Revalidate layout to pick up new session and go to home
  revalidatePath("/", "layout");
  redirect("/");
}

export async function logoutAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
