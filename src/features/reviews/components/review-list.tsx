import { Star } from "lucide-react";
import type { Review, RatingSummary } from "@/features/reviews/queries/get-reviews";
import { ReviewForm } from "./review-form";

export function ReviewList({ 
  productId, 
  reviews, 
  summary: dbSummary 
}: { 
  productId: string; 
  reviews: Review[]; 
  summary: RatingSummary | null;
}) {
  // Compute fallback summary if the materialized view hasn't updated yet
  // but we clearly have reviews in the array.
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

  return (
    <div className="w-full py-12 border-t mt-12">
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Left column: Summary and Form */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <h2 className="text-2xl font-serif tracking-tight">Customer Reviews</h2>
          
          {summary && summary.review_count > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-semibold">{summary.average_rating}</span>
                <div className="flex flex-col gap-1">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(summary.average_rating)
                            ? "fill-current"
                            : "text-muted fill-transparent"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Based on {summary.review_count} {summary.review_count === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-4 text-sm text-muted-foreground">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = summary[`${['one', 'two', 'three', 'four', 'five'][rating - 1]}_star_count` as keyof RatingSummary] as number;
                  const percentage = summary.review_count > 0 ? (count / summary.review_count) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="w-12">{rating} stars</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="w-8 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">This product hasn't received any reviews yet.</p>
          )}

          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">Share your thoughts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you've used this product, share your thoughts with other customers.
            </p>
            <ReviewForm productId={productId} />
          </div>
        </div>

        {/* Right column: Reviews List */}
        <div className="w-full md:w-2/3 flex flex-col gap-8">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review.id} className="flex flex-col gap-2 border-b pb-8 last:border-0">
                <div className="flex items-center gap-2 text-yellow-400 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating ? "fill-current" : "text-muted fill-transparent"
                      }`}
                    />
                  ))}
                </div>
                {review.title && <h4 className="font-medium text-lg">{review.title}</h4>}
                <div className="text-sm text-muted-foreground flex items-center gap-2 mb-2">
                  <span className="font-medium text-foreground">
                    {review.user?.full_name || "Anonymous Customer"}
                  </span>
                  <span>•</span>
                  <span>{new Date(review.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
                {review.body && <p className="text-muted-foreground leading-relaxed">{review.body}</p>}
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full min-h-[200px] bg-muted/30 rounded-xl border border-dashed">
              <p className="text-muted-foreground text-center px-4">
                Be the first to review this product!
              </p>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
