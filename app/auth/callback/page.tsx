"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { useEffect } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        router.push("/timeline");
      }
    });
  }, [router]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">認証中...</p>
      </div>
    </div>
  );
}
