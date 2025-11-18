import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/header";
import { MonthlyStatsGrid } from "@/components/monthly-stats-grid";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id || null;

  let profile = null;
  if (userId) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    profile = profileData;
  }

  // Get all profiles for ranking
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url");

  // Get all posts for current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const { data: monthlyPosts } = await supabase
    .from("posts")
    .select("*")
    .gte("created_at", firstDayOfMonth.toISOString())
    .lte("created_at", lastDayOfMonth.toISOString());

  return (
    <div className="min-h-screen bg-background">
      <Header currentUserId={userId} profile={profile} />
      <main className="container max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">ダッシュボード</h1>
        <MonthlyStatsGrid
          posts={monthlyPosts || []}
          profiles={allProfiles || []}
          currentMonth={now}
        />
      </main>
    </div>
  );
}
