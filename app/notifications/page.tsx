import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { Header } from "@/components/header";
import { NotificationsList } from "@/components/notifications-list";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  // Get current user's profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  // Get notifications with post and sender info
  const { data: notifications } = await supabase
    .from("notifications")
    .select(`
      *,
      post:post_id(
        id,
        message,
        points,
        created_at,
        sender:sender_id(display_name, avatar_url)
      )
    `)
    .eq("user_id", data.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-background">
      <Header currentUserId={data.user.id} profile={profile} />
      <main className="container max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">通知</h1>
        <NotificationsList
          notifications={notifications || []}
          userId={data.user.id}
        />
      </main>
    </div>
  );
}
