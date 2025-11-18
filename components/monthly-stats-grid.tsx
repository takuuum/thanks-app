"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Award, Gift } from 'lucide-react';
import { useMemo } from "react";

interface Post {
  id: string;
  sender_id: string;
  recipient_id: string;
  points: number;
  created_at: string;
}

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

interface MonthlyStatsGridProps {
  posts: Post[];
  profiles: Profile[];
  currentMonth: Date;
}

export function MonthlyStatsGrid({
  posts,
  profiles,
  currentMonth,
}: MonthlyStatsGridProps) {
  const monthName = currentMonth.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });

  const stats = useMemo(() => {
    // Calculate points received and sent per user
    const userStats = new Map<
      string,
      { received: number; sent: number; profile: Profile }
    >();

    profiles.forEach((profile) => {
      userStats.set(profile.id, {
        received: 0,
        sent: 0,
        profile,
      });
    });

    posts.forEach((post) => {
      const recipient = userStats.get(post.recipient_id);
      const sender = userStats.get(post.sender_id);

      if (recipient) {
        recipient.received += post.points;
      }
      if (sender) {
        sender.sent += post.points;
      }
    });

    // Convert to arrays and sort
    const statsArray = Array.from(userStats.values());
    const topReceivers = statsArray
      .sort((a, b) => b.received - a.received)
      .slice(0, 10);
    const topSenders = statsArray
      .sort((a, b) => b.sent - a.sent)
      .slice(0, 10);

    return { topReceivers, topSenders };
  }, [posts, profiles]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Award className="h-5 w-5" />
        <span className="font-medium">{monthName}の統計</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Receivers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              ポイント獲得ランキング
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topReceivers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                データがありません
              </p>
            ) : (
              <div className="space-y-4">
                {stats.topReceivers.map((stat, index) => {
                  const initials = stat.profile.display_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={stat.profile.id}
                      className="flex items-center gap-4"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-semibold text-sm">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={stat.profile.avatar_url || undefined}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {stat.profile.display_name}
                        </p>
                      </div>
                      <Badge
                        variant={index === 0 ? "default" : "secondary"}
                        className="ml-auto"
                      >
                        {stat.received}pt
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Senders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-blue-600" />
              ポイント付与ランキング
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topSenders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                データがありません
              </p>
            ) : (
              <div className="space-y-4">
                {stats.topSenders.map((stat, index) => {
                  const initials = stat.profile.display_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={stat.profile.id}
                      className="flex items-center gap-4"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-semibold text-sm">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={stat.profile.avatar_url || undefined}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {stat.profile.display_name}
                        </p>
                      </div>
                      <Badge
                        variant={index === 0 ? "default" : "secondary"}
                        className="ml-auto"
                      >
                        {stat.sent}pt
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
