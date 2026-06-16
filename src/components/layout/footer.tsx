import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          <div className="space-y-4">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tighter">
              CREST
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Elevating men's fashion with timeless pieces and uncompromising quality.
            </p>
            <div className="flex gap-4 items-center mt-2">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm">
                IG
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm">
                FB
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm">
                TW
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors font-medium text-sm">
                YT
              </Link>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm tracking-wider uppercase">Shop</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/categories/new-arrivals" className="hover:text-foreground transition-colors">New Arrivals</Link></li>
              <li><Link href="/categories/best-sellers" className="hover:text-foreground transition-colors">Best Sellers</Link></li>
              <li><Link href="/categories/clothing" className="hover:text-foreground transition-colors">Clothing</Link></li>
              <li><Link href="/categories/accessories" className="hover:text-foreground transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm tracking-wider uppercase">Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-foreground transition-colors">FAQ</Link></li>
              <li><Link href="/shipping" className="hover:text-foreground transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/size-guide" className="hover:text-foreground transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-sm tracking-wider uppercase">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Crest. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
