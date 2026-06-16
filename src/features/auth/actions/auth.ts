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
