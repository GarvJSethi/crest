"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Search, Menu, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { useTheme } from "@/providers/theme-provider";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";

import { useRouter } from "next/navigation";

import { getSearchSuggestions, type SearchSuggestion } from "@/features/products/actions/search-actions";
import { formatCurrency } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const totalItems = getTotalItems();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await getSearchSuggestions(searchQuery);
        setSuggestions(results);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setSuggestions([]);
    }
  };

  const navLinks = [
    { href: "/products", label: "Shop All" },
    { href: "/categories/shirts", label: "Shirts" },
    { href: "/categories/accessories", label: "Accessories" },
    { href: "/products?filter=sale", label: "Sale" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      {isSearchOpen && (
        <div className="absolute inset-x-0 top-0 z-50 flex flex-col items-center bg-background px-4 py-3 border-b shadow-lg">
          <form onSubmit={handleSearch} className="w-full max-w-2xl flex items-center gap-2 relative">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <input 
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full h-10 pl-10 pr-12 bg-muted border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button 
              type="button" 
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery("");
                setSuggestions([]);
              }}
              className="absolute right-3 text-sm text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </form>
          
          {searchQuery.trim().length > 0 && (
            <div className="w-full max-w-2xl mt-2 bg-card rounded-md border shadow-sm max-h-96 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
              ) : suggestions.length > 0 ? (
                <ul className="flex flex-col">
                  {suggestions.map((product) => (
                    <li key={product.id} className="border-b last:border-0">
                      <Link
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                          setSuggestions([]);
                        }}
                        className="flex items-center gap-4 p-3 hover:bg-muted transition-colors"
                      >
                        <div className="relative h-12 w-10 bg-muted rounded overflow-hidden shrink-0">
                          {product.primary_image ? (
                            <Image src={product.primary_image.url} alt={product.primary_image.alt_text || product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-secondary" />
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-medium text-sm truncate">{product.name}</p>
                        </div>
                        <div className="shrink-0 text-sm font-semibold">
                          {formatCurrency(product.base_price)}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">No products found for "{searchQuery}"</div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-8 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4 lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger className="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left font-serif text-xl font-bold">CREST</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-2 py-1 text-lg font-medium hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-2 py-1 text-lg font-medium hover:text-primary transition-colors"
                >
                  My Account
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/crest_logo.png" alt="Crest Logo" width={32} height={32} className="rounded" />
            <span className="font-serif text-xl font-bold tracking-tight">CREST</span>
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/crest_logo.png" alt="Crest Logo" width={36} height={36} className="rounded" />
            <span className="font-serif text-2xl font-bold tracking-tighter">CREST</span>
          </Link>
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-foreground/80 ${
                  pathname === link.href ? "text-foreground" : "text-foreground/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setIsSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>
          
          <Link href="/account" aria-label="Account" className="hidden sm:inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground">
            <User className="h-5 w-5" />
          </Link>

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          )}

          <Link href="/cart" aria-label="Cart" className="relative inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground">
            <ShoppingBag className="h-5 w-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
