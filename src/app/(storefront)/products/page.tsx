import { getProducts } from "@/features/products/queries/get-products";
import { ProductGrid } from "@/features/products/components/product-grid";

export const metadata = {
  title: "Shop All Products | Crest",
  description: "Browse our complete collection of premium men's clothing.",
};

export default async function ProductsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  // Extract search params for filtering/search
  const search = typeof searchParams.q === "string" ? searchParams.q : undefined;
  
  // Fetch data
  const products = await getProducts({ searchQuery: search, limit: 50 });

  return (
    <div className="container mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col gap-8">
        {/* Page Header */}
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-serif tracking-tight">
            {search ? `Search results for "${search}"` : "All Products"}
          </h1>
          <p className="text-muted-foreground">
            {products.length} {products.length === 1 ? "Product" : "Products"}
          </p>
        </div>

        {/* Filters and Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Mobile Categories (Horizontal Scroll) */}
          <div className="lg:hidden flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 snap-x scrollbar-hide">
            <a href="/products" className="shrink-0 snap-start px-4 py-2 bg-secondary text-secondary-foreground rounded-full text-sm font-medium whitespace-nowrap">All</a>
            <a href="/categories/shirts" className="shrink-0 snap-start px-4 py-2 border hover:bg-secondary/50 rounded-full text-sm font-medium whitespace-nowrap">Shirts</a>
            <a href="/categories/t-shirts" className="shrink-0 snap-start px-4 py-2 border hover:bg-secondary/50 rounded-full text-sm font-medium whitespace-nowrap">T-Shirts</a>
            <a href="/categories/jeans" className="shrink-0 snap-start px-4 py-2 border hover:bg-secondary/50 rounded-full text-sm font-medium whitespace-nowrap">Jeans</a>
            <a href="/categories/jackets" className="shrink-0 snap-start px-4 py-2 border hover:bg-secondary/50 rounded-full text-sm font-medium whitespace-nowrap">Jackets</a>
          </div>

          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-full">
            <div className="sticky top-24 border rounded-xl p-6">
              <h3 className="font-semibold mb-4 text-lg">Filters</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Advanced filtering coming soon in Phase 4.
              </p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3 text-sm">Categories</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li><a href="/categories/shirts" className="hover:text-foreground">Shirts</a></li>
                    <li><a href="/categories/t-shirts" className="hover:text-foreground">T-Shirts</a></li>
                    <li><a href="/categories/jeans" className="hover:text-foreground">Jeans</a></li>
                    <li><a href="/categories/jackets" className="hover:text-foreground">Jackets</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <ProductGrid products={products} />
          </div>
        </div>
      </div>
    </div>
  );
}
