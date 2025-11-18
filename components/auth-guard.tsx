"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const publicPaths = ["/", "/login", "/auth"];
      const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

      if (!user && !isPublicPath) {
        router.push("/login");
      } else {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
