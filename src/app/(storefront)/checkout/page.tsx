import { CheckoutForm } from "@/features/checkout/components/checkout-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Checkout | Crest",
  description: "Complete your purchase securely.",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-serif tracking-tight mb-10">Checkout</h1>
        <CheckoutForm />
      </div>
    </div>
  );
}
