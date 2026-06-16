import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/providers/theme-provider";
import { CartHydration } from "@/providers/cart-hydration";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Crest | Premium Men's Fashion",
    template: "%s | Crest",
  },
  description:
    "Discover curated premium men's fashion at Crest. From tailored essentials to contemporary streetwear — elevate your wardrobe with pieces designed for the modern man.",
  keywords: [
    "men's fashion",
    "premium clothing",
    "luxury menswear",
    "designer clothes",
    "Crest fashion",
    "men's shirts",
    "men's jeans",
    "online shopping India",
  ],
  authors: [{ name: "Crest" }],
  creator: "Crest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Crest",
    title: "Crest | Premium Men's Fashion",
    description:
      "Discover curated premium men's fashion at Crest. Elevate your wardrobe with pieces designed for the modern man.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crest | Premium Men's Fashion",
    description:
      "Discover curated premium men's fashion at Crest. Elevate your wardrobe with pieces designed for the modern man.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF9" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0A" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider>
          <TooltipProvider>
            <CartHydration>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    color: "hsl(var(--foreground))",
                  },
                }}
              />
            </CartHydration>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
