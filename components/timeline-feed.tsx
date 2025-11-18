"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { useState } from "react";
import { SendPointDialog } from "@/components/send-point-dialog";

interface Post {
  id: string;
  message: string;
  points: number;
  created_at: string;
  sender: {
    display_name: string;
    avatar_url: string | null;
  };
  recipient: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface TimelineFeedProps {
  posts: Post[];
  currentUserId: string;
}

export function TimelineFeed({ posts, currentUserId }: TimelineFeedProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">感謝のタイムライン</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          感謝を送る
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            まだ感謝のメッセージがありません
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            最初の感謝を送ってみましょう
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const senderInitials = post.sender.display_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const recipientInitials = post.recipient.display_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card key={post.id} className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.sender.avatar_url || undefined} />
                    <AvatarFallback>{senderInitials}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">
                        {post.sender.display_name}
                      </span>
                      <span className="text-muted-foreground">から</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={post.recipient.avatar_url || undefined}
                          />
                          <AvatarFallback className="text-xs">
                            {recipientInitials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold">
                          {post.recipient.display_name}
                        </span>
                      </div>
                      <span className="text-muted-foreground">へ</span>
                      <Badge variant="secondary" className="ml-auto">
                        {post.points}pt
                      </Badge>
                    </div>

                    <p className="text-base leading-relaxed">{post.message}</p>

                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                        locale: ja,
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <SendPointDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        currentUserId={currentUserId}
      />
    </div>
  );
}
