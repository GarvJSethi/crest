import { getProducts } from "@/features/products/queries/get-products";
import { ProductGrid } from "@/features/products/components/product-grid";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const capitalizedSlug = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  return {
    title: `${capitalizedSlug} | Crest Men's Fashion`,
    description: `Shop our premium collection of ${params.slug}`,
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const capitalizedSlug = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  
  // Fetch data for this specific category
  const products = await getProducts({ categorySlug: params.slug, limit: 50 });

  return (
    <div className="container mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-serif tracking-tight">{capitalizedSlug}</h1>
          <p className="text-muted-foreground">
            {products.length} {products.length === 1 ? "Product" : "Products"}
          </p>
        </div>

        {/* Main Content */}
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
