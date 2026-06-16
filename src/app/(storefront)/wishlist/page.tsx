import { WishlistPageContent } from "@/features/wishlist/components/wishlist-page-content";

export const metadata = {
  title: "Your Wishlist | Crest",
  description: "View and manage your saved items.",
};

export default function WishlistPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-16">
      <WishlistPageContent />
    </div>
  );
}
