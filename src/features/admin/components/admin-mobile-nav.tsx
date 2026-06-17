"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, LayoutDashboard, ShoppingBag, Package, LogOut, Users, Settings } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navItems = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-40">
      <Link href="/admin" className="font-serif text-xl font-bold tracking-tighter">
        CREST Admin
      </Link>
      
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button className="p-2 -mr-2">
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0 flex flex-col">
          <div className="p-6 border-b">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tighter" onClick={() => setIsOpen(false)}>
              CREST Store
            </Link>
          </div>

          <nav className="p-4 flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout Admin
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
