"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LayoutDashboard, MessageCircleHeart, LogIn, MessageSquare } from 'lucide-react';
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useBrowserNotification } from "@/hooks/use-browser-notification";

interface HeaderProps {
  currentUserId: string | null;
  profile: {
    display_name: string;
    avatar_url: string | null;
  } | null;
}

export function Header({ currentUserId, profile }: HeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const { permission, showNotification } = useBrowserNotification();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUserId) return;

    const fetchNotificationSettings = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("notification_enabled")
        .eq("id", currentUserId)
        .single();
      
      if (data) {
        setNotificationEnabled(data.notification_enabled ?? true);
      }
    };

    fetchNotificationSettings();

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", currentUserId)
        .eq("is_read", false);
      
      setUnreadCount(count || 0);
    };

    const checkNewNotifications = async () => {
      if (!notificationEnabled || permission !== 'granted') return;

      const { data } = await supabase
        .from("notifications")
        .select("id, post_id")
        .eq("user_id", currentUserId)
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data && data.id !== lastNotificationId) {
        setLastNotificationId(data.id);
        
        const { data: postData } = await supabase
          .from("gratitude_posts")
          .select("message, points, sender:profiles!gratitude_posts_sender_id_fkey(display_name)")
          .eq("id", data.post_id)
          .single();
        
        if (postData) {
          const senderName = (postData.sender as any)?.display_name || 'Someone';
          showNotification(
            `Message from ${senderName}`,
            {
              body: `${postData.points} points: ${postData.message.slice(0, 50)}${postData.message.length > 50 ? '...' : ''}`,
              tag: data.id,
              requireInteraction: false,
            }
          );
        }
      }
    };

    fetchUnreadCount();
    checkNewNotifications();

    const interval = setInterval(() => {
      fetchUnreadCount();
      checkNewNotifications();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [currentUserId, supabase, notificationEnabled, permission, showNotification, lastNotificationId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isGuest = !currentUserId;
  const displayName = profile?.display_name || "ゲスト";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircleHeart className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">thanks</h1>
        </div>

        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/timeline">
              <MessageSquare className="h-4 w-4 mr-1" />
              タイムライン
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-1" />
              ダッシュボード
            </Link>
          </Button>

          {!isGuest && (
            <div className="relative">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>
          )}

          {isGuest ? (
            <Button variant="default" size="sm" asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-2" />
                ログイン
              </Link>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    プロフィール編集
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>
      </div>
    </header>
  );
}
