"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from 'lucide-react';

interface SendPointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId: string;
}

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export function SendPointDialog({
  open,
  onOpenChange,
  currentUserId,
}: SendPointDialogProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState("");
  const [remainingPoints, setRemainingPoints] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (open) {
      fetchProfiles();
      fetchRemainingPoints();
    }
  }, [open]);

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .neq("id", currentUserId)
      .order("display_name");

    if (data) {
      setProfiles(data);
    }
  };

  const fetchRemainingPoints = async () => {
    // Get the start of the current week (Monday)
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(now.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("weekly_points")
      .select("total_sent")
      .eq("user_id", currentUserId)
      .eq("week_start", weekStart.toISOString().split("T")[0])
      .single();

    setRemainingPoints(100 - (data?.total_sent || 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const pointsNum = parseInt(points);

    if (!selectedRecipient || !message || !pointsNum) {
      setError("すべてのフィールドを入力してください");
      setIsLoading(false);
      return;
    }

    if (pointsNum <= 0 || pointsNum > 100) {
      setError("ポイントは1から100の間で入力してください");
      setIsLoading(false);
      return;
    }

    if (pointsNum > remainingPoints) {
      setError(`今週の残りポイントは${remainingPoints}ptです`);
      setIsLoading(false);
      return;
    }

    try {
      // Get the start of the current week
      const now = new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(now.setDate(diff));
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = weekStart.toISOString().split("T")[0];

      // Insert or update weekly points
      const { data: existingWeekly } = await supabase
        .from("weekly_points")
        .select("*")
        .eq("user_id", currentUserId)
        .eq("week_start", weekStartStr)
        .single();

      if (existingWeekly) {
        await supabase
          .from("weekly_points")
          .update({
            total_sent: existingWeekly.total_sent + pointsNum,
          })
          .eq("id", existingWeekly.id);
      } else {
        await supabase.from("weekly_points").insert({
          user_id: currentUserId,
          week_start: weekStartStr,
          total_sent: pointsNum,
        });
      }

      // Create post
      const { error: postError } = await supabase.from("posts").insert({
        sender_id: currentUserId,
        recipient_id: selectedRecipient,
        message,
        points: pointsNum,
      });

      if (postError) throw postError;

      // Reset form
      setSelectedRecipient("");
      setMessage("");
      setPoints("");
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>感謝を送る</DialogTitle>
          <DialogDescription>
            チームメンバーに感謝のメッセージとポイントを送りましょう
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">送り先</Label>
            <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
              <SelectTrigger id="recipient">
                <SelectValue placeholder="メンバーを選択" />
              </SelectTrigger>
              <SelectContent>
                {profiles.map((profile) => {
                  const initials = profile.display_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span>{profile.display_name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">ポイント</Label>
            <Input
              id="points"
              type="number"
              min="1"
              max={remainingPoints}
              placeholder="1-100"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              今週の残りポイント: {remainingPoints}pt
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">感謝のメッセージ</Label>
            <Textarea
              id="message"
              placeholder="ありがとうございます！"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "送信中..." : "送信"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
