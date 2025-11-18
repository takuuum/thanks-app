"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from 'next/navigation';
import { Loader2, Upload, X, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useBrowserNotification } from "@/hooks/use-browser-notification";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ProfileEditFormProps {
  profile: {
    id: string;
    display_name: string;
    email: string;
    avatar_url: string | null;
    notification_enabled?: boolean;
  } | null;
}

export function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const { permission, isSupported, requestPermission, showNotification } = useBrowserNotification();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [notificationEnabled, setNotificationEnabled] = useState(profile?.notification_enabled ?? true);
  const [hasPermission, setHasPermission] = useState(permission === 'granted');

  useEffect(() => {
    setHasPermission(permission === 'granted');
  }, [permission]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "エラー",
        description: "ファイルサイズは5MB以下にしてください",
        variant: "destructive",
      });
      return;
    }

    // 画像形式チェック
    if (!file.type.startsWith('image/')) {
      toast({
        title: "エラー",
        description: "画像ファイルを選択してください",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${profile.id}/${fileName}`;

      // Supabase Storageにアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avator')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // パブリックURLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('avator')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      toast({
        title: "アップロード完了",
        description: "アバター画像をアップロードしました",
      });
    } catch (error) {
      console.error("[v0] Avatar upload error:", error);
      toast({
        title: "エラー",
        description: "画像のアップロードに失敗しました",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // ファイル入力をリセット
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          avatar_url: avatarUrl || null,
          notification_enabled: notificationEnabled,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "更新完了",
        description: "プロフィールを更新しました",
      });
      
      router.refresh();
    } catch (error) {
      console.error("[v0] Profile update error:", error);
      toast({
        title: "エラー",
        description: "プロフィールの更新に失敗しました",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleNotificationToggle = async (checked: boolean) => {
    if (checked && isSupported && !hasPermission) {
      const granted = await requestPermission();
      
      if (granted) {
        setNotificationEnabled(true);
        showNotification('通知が有効になりました', {
          body: '感謝のメッセージを受け取るとブラウザ通知が表示されます',
        });
        setHasPermission(true);
      } else {
        toast({
          title: "通知許可が必要です",
          description: (
            <div className="flex flex-col gap-2">
              <p>ブラウザの設定から通知を許可してください。</p>
              <a
                href="https://support.google.com/chrome/answer/95472"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm underline hover:no-underline"
              >
                Chrome通知の設定方法を見る
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) as any,
          variant: "destructive",
          duration: 10000,
        });
        setNotificationEnabled(false);
      }
    } else {
      setNotificationEnabled(checked);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
          <CardDescription>
            表示名とアバター画像を変更できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
            
              <div className="flex gap-2">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading || loading}
                    asChild
                  >
                    <span>
                      {uploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      画像をアップロード
                    </span>
                  </Button>
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || loading}
                  className="hidden"
                />
              
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={uploading || loading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    削除
                  </Button>
                )}
              </div>
            
              <p className="text-xs text-muted-foreground text-center">
                JPG、PNG、GIF（5MB以下）
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                メールアドレスは変更できません
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">表示名</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="山田 太郎"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatarUrl">アバター画像URL（オプション）</Label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-sm text-muted-foreground">
                または、画像のURLを直接入力することもできます
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading || uploading}
              >
                キャンセル
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                保存
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>通知設定</CardTitle>
          <CardDescription>
            ブラウザ通知の受信設定を変更できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isSupported && (
              <Alert>
                <AlertDescription>
                  お使いのブラウザは通知機能をサポートしていません
                </AlertDescription>
              </Alert>
            )}
            
            {isSupported && permission === 'denied' && (
              <Alert>
                <AlertDescription className="flex flex-col gap-2">
                  <p>ブラウザの通知が拒否されています。ブラウザの設定から通知を許可してください。</p>
                  <a
                    href="https://support.google.com/chrome/answer/95472"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm underline hover:no-underline"
                  >
                    Chrome通知の設定方法を見る
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notification-toggle" className="text-base">
                  ブラウザ通知
                </Label>
                <p className="text-sm text-muted-foreground">
                  感謝のメッセージを受け取った際に通知を表示します
                </p>
              </div>
              <Switch
                id="notification-toggle"
                checked={notificationEnabled}
                onCheckedChange={handleNotificationToggle}
                disabled={loading || !isSupported}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading || uploading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                保存
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
