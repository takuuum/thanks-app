import { createClient } from "@/lib/supabase/server";
import { TimelineFeed } from "@/components/timeline-feed";
import { Header } from "@/components/header";
import { NotificationToggle } from "@/components/notification-toggle";

export default async function TimelinePage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  const userId = data?.user?.id || null;

  // Get posts with sender and recipient info
  const { data: posts } = await supabase
    .from("posts")
    .select(`
      *,
      sender:sender_id(display_name, avatar_url),
      recipient:recipient_id(display_name, avatar_url)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  let profile = null;
  if (userId) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    profile = profileData;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header currentUserId={userId} profile={profile} />
      <main className="container max-w-3xl mx-auto px-4 py-8">
        <NotificationToggle 
          userId={userId} 
          initialEnabled={profile?.notification_enabled ?? true} 
        />
        <TimelineFeed posts={posts || []} currentUserId={userId} />
      </main>
    </div>
  );
}
