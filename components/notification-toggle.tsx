'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, BellOff, ExternalLink, AlertTriangle } from 'lucide-react';
import { useBrowserNotification } from '@/hooks/use-browser-notification';
import { useToast } from '@/hooks/use-toast';

interface NotificationToggleProps {
  userId: string | null;
  initialEnabled?: boolean;
}

export function NotificationToggle({ userId, initialEnabled = true }: NotificationToggleProps) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const [showPermissionWarning, setShowPermissionWarning] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();
  const { requestPermission, hasPermission, permission } = useBrowserNotification();

  useEffect(() => {
    setEnabled(initialEnabled);
    // 通知がオンで、かつブラウザ許可が明示的に拒否されている場合のみ警告を表示
    if (initialEnabled && permission === 'denied') {
      setShowPermissionWarning(true);
    } else if (permission === 'granted') {
      setShowPermissionWarning(false);
    }
  }, [initialEnabled, permission]);

  const handleToggle = async (checked: boolean) => {
    if (!userId) {
      toast({
        title: 'ログインが必要です',
        description: '通知設定を変更するにはログインしてください',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (checked) {
        const granted = await requestPermission();
        if (!granted) {
          setShowPermissionWarning(true);
          setLoading(false);
          return;
        }
        setShowPermissionWarning(false);
      } else {
        setShowPermissionWarning(false);
      }

      // データベースに保存
      const { error } = await supabase
        .from('profiles')
        .update({ notification_enabled: checked })
        .eq('id', userId);

      if (error) throw error;

      setEnabled(checked);
      toast({
        title: checked ? '通知をオンにしました' : '通知をオフにしました',
        description: checked
          ? '感謝のメッセージを受け取った時に通知されます'
          : '通知を受け取らなくなります',
      });
    } catch (error) {
      console.error('[v0] Error toggling notification:', error);
      toast({
        title: 'エラーが発生しました',
        description: '通知設定の変更に失敗しました',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <>
      {showPermissionWarning && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
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
      
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {enabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
            <div>
              <Label htmlFor="notification-toggle" className="text-sm font-medium cursor-pointer">
                ブラウザ通知
              </Label>
              <p className="text-xs text-muted-foreground">
                感謝のメッセージを受け取った時に通知
              </p>
            </div>
          </div>
          <Switch
            id="notification-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={loading}
          />
        </div>
      </Card>
    </>
  );
}
