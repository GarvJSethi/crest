import Link from "next/link";
import { CheckCircle2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Order Confirmed | Crest",
  description: "Your order has been placed successfully.",
};

export default async function CheckoutSuccessPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const orderNumber = typeof searchParams.order === 'string' ? searchParams.order : null;

  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      
      <h1 className="text-4xl font-serif tracking-tight mb-4">Thank You for Your Order!</h1>
      
      <p className="text-muted-foreground text-lg mb-2 max-w-md">
        Your order has been successfully placed and is now being processed.
      </p>

      {orderNumber && (
        <div className="bg-muted px-6 py-4 rounded-lg my-8 flex items-center gap-4">
          <Package className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground text-left">Order Number</p>
            <p className="font-semibold text-lg font-mono">{orderNumber}</p>
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-10 max-w-md">
        We've sent a confirmation email with your order details and tracking information.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/account/orders" className="inline-flex items-center justify-center font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-none">
          View Order History
        </Link>
        <Link href="/products" className="inline-flex items-center justify-center font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-12 px-8 rounded-none">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
