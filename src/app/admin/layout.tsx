import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/features/admin/components/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  // 2. Fetch user profile to check role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    // If not an admin, redirect to homepage
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Sidebar Navigation */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-6xl space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
