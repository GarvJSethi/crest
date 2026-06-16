import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Package, User, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions/auth";

export const metadata = {
  title: "My Account | Crest",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/account");
  }

  // Get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  return (
    <div className="container mx-auto px-4 md:px-8 py-10 md:py-16">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="mb-8 px-4">
            <h2 className="text-xl font-serif mb-1">{profile?.full_name || "Welcome"}</h2>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>

          <nav className="flex flex-col space-y-1">
            <Link 
              href="/account" 
              className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors"
            >
              <User className="mr-3 h-4 w-4" />
              Account Overview
            </Link>
            <Link 
              href="/account/orders" 
              className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors"
            >
              <Package className="mr-3 h-4 w-4" />
              Order History
            </Link>
            <Link 
              href="/account/addresses" 
              className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-muted transition-colors"
            >
              <MapPin className="mr-3 h-4 w-4" />
              Saved Addresses
            </Link>
            
            <form action={async () => { "use server"; await logoutAction(); }} className="pt-4 mt-4 border-t border-border">
              <Button type="submit" variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground">
                <LogOut className="mr-3 h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
