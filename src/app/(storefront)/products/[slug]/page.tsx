import { notFound } from "next/navigation";
import { getProductBySlug } from "@/features/products/queries/get-products";
import { ProductGallery } from "@/features/products/components/product-gallery";
import { AddToCart } from "@/features/products/components/add-to-cart";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getReviews, getProductRatingSummary } from "@/features/reviews/queries/get-reviews";
import { ReviewList } from "@/features/reviews/components/review-list";
import { Star } from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const product = await getProductBySlug(params.slug);
  
  if (!product) {
    return { title: "Product Not Found | Crest" };
  }
  
  return {
    title: `${product.name} | Crest`,
    description: product.meta_description || product.short_description || product.description,
  };
}

export default async function ProductDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const product = await getProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const [reviews, dbSummary] = await Promise.all([
    getReviews(product.id),
    getProductRatingSummary(product.id)
  ]);

  let summary = dbSummary;
  
  if ((!summary || summary.review_count === 0) && reviews.length > 0) {
    const review_count = reviews.length;
    const average_rating = Number((reviews.reduce((acc, r) => acc + r.rating, 0) / review_count).toFixed(2));
    summary = {
      average_rating,
      review_count,
      five_star_count: reviews.filter(r => r.rating === 5).length,
      four_star_count: reviews.filter(r => r.rating === 4).length,
      three_star_count: reviews.filter(r => r.rating === 3).length,
      two_star_count: reviews.filter(r => r.rating === 2).length,
      one_star_count: reviews.filter(r => r.rating === 1).length,
    };
  }

  // Ensure images array is sorted by display_order
  const images = (product.images || []).sort((a: any, b: any) => 
    (a.display_order || 0) - (b.display_order || 0)
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Gallery */}
        <div className="w-full">
          <ProductGallery images={images} productName={product.name} />
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col max-w-lg pt-4 md:pt-10">
          {product.brand && (
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-2">
              {product.brand}
            </p>
          )}
          
          <h1 className="text-3xl md:text-4xl font-serif tracking-tight mb-4">
            {product.name}
          </h1>

          {summary && summary.review_count > 0 && (
            <div className="flex items-center gap-2 mb-6 text-sm">
              <div className="flex text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
              </div>
              <span className="font-medium">{summary.average_rating}</span>
              <span className="text-muted-foreground underline underline-offset-4 cursor-pointer hover:text-foreground transition-colors">
                ({summary.review_count} {summary.review_count === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
          
          {(!summary || summary.review_count === 0) && (
            <div className="mb-6" />
          )}
          
          {product.short_description && (
            <p className="text-base text-muted-foreground mb-8">
              {product.short_description}
            </p>
          )}

          <div className="mb-10">
            <AddToCart product={product} variants={product.variants || []} />
          </div>

          <Accordion className="w-full border-t">
            <AccordionItem value="details">
              <AccordionTrigger className="text-base font-medium">Product Details</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {product.description || "No description available."}
              </AccordionContent>
            </AccordionItem>
            
            {product.material && (
              <AccordionItem value="material">
                <AccordionTrigger className="text-base font-medium">Material & Care</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  <p className="mb-2"><strong>Material:</strong> {product.material}</p>
                  {product.care_instructions && (
                    <p><strong>Care:</strong> {product.care_instructions}</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )}
            
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-base font-medium">Shipping & Returns</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed space-y-2">
                <p>Free standard shipping on all orders over ₹2000.</p>
                <p>Delivery typically within 3-5 business days.</p>
                <p>Returns accepted within 14 days of delivery. <a href="/returns" className="underline underline-offset-2">View return policy</a>.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <ReviewList productId={product.id} reviews={reviews} summary={summary} />
    </div>
  );
}
