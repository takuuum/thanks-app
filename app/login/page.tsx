"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Mail } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setEmailSent(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">メールを確認してください</CardTitle>
              <CardDescription className="mt-2">
                {email} にログインリンクを送信しました。メール内のリンクをクリックしてログインしてください。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEmailSent(false);
                  setEmail("");
                  setIsLoading(false);
                }}
              >
                別のメールアドレスでログイン
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">thanks</CardTitle>
            <CardDescription>
              メールアドレスを入力してログインリンクを受け取る
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 p-3 text-sm text-muted-foreground bg-muted rounded-lg text-center">
              管理者に許可されたユーザーのみが使用できます
            </div>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? "送信中..." : "ログインリンクを送信"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
