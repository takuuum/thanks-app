"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { CheckCheck } from 'lucide-react';
import { useEffect } from "react";

interface Notification {
  id: string;
  is_read: boolean;
  created_at: string;
  post: {
    id: string;
    message: string;
    points: number;
    created_at: string;
    sender: {
      display_name: string;
      avatar_url: string | null;
    };
  };
}

interface NotificationsListProps {
  notifications: Notification[];
  userId: string;
}

export function NotificationsList({
  notifications,
  userId,
}: NotificationsListProps) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Request notification permission on component mount
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Subscribe to new notifications
    const channel = supabase
      .channel("new_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          // Show browser notification
          if (
            "Notification" in window &&
            Notification.permission === "granted"
          ) {
            // Fetch the post details
            const { data: post } = await supabase
              .from("posts")
              .select(
                "message, points, sender:sender_id(display_name)"
              )
              .eq("id", (payload.new as any).post_id)
              .single();

            if (post) {
              new Notification("新しい感謝が届きました", {
                body: `${(post.sender as any).display_name}さんから${post.points}ポイント`,
                icon: "/icon.png",
                tag: (payload.new as any).id,
              });
            }
          }

          // Refresh the page to show new notification
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, router]);

  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter((n) => !n.is_read)
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", unreadIds);

    router.refresh();
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    router.refresh();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unreadCount}件の未読通知
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            すべて既読にする
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">通知はありません</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const initials = notification.post.sender.display_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer transition-colors ${
                  !notification.is_read
                    ? "bg-primary/5 border-primary/20"
                    : ""
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={notification.post.sender.avatar_url || undefined}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">
                        {notification.post.sender.display_name}
                      </span>
                      <span className="text-muted-foreground">
                        さんから感謝が届きました
                      </span>
                      <Badge variant="secondary" className="ml-auto">
                        {notification.post.points}pt
                      </Badge>
                    </div>

                    <p className="text-sm leading-relaxed">
                      {notification.post.message}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </p>
                  </div>

                  {!notification.is_read && (
                    <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
