import { CartPageContent } from "@/features/cart/components/cart-page-content";

export const metadata = {
  title: "Your Shopping Cart | Crest",
  description: "Review and manage the items in your shopping cart.",
};

export default function CartPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-16">
      <CartPageContent />
    </div>
  );
}
