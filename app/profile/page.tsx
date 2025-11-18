import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { Header } from "@/components/header";
import { ProfileEditForm } from "@/components/profile-edit-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email, avatar_url, notification_enabled")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <Header currentUserId={user.id} profile={profile} />
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">プロフィール編集</h1>
          <p className="text-muted-foreground">
            あなたの情報を更新します
          </p>
        </div>
        <ProfileEditForm profile={profile} />
      </main>
    </div>
  );
}
