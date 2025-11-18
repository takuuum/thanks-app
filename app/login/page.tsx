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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { Mail, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // 利用リクエストフォーム
  const [requestName, setRequestName] = useState("");
  const [requestEmail, setRequestEmail] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push("/timeline");
      } else {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

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

  const handleAccessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from("access_requests")
        .insert({
          name: requestName,
          email: requestEmail,
          reason: requestReason,
        });
      
      if (error) throw error;
      setRequestSubmitted(true);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">認証状態を確認中...</p>
        </div>
      </div>
    );
  }

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

  if (requestSubmitted) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">リクエストを受け付けました</CardTitle>
              <CardDescription className="mt-2">
                利用リクエストを送信しました。管理者が確認後、{requestEmail} にメールでご連絡いたします。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setRequestSubmitted(false);
                  setRequestName("");
                  setRequestEmail("");
                  setRequestReason("");
                }}
              >
                戻る
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
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">ログイン</TabsTrigger>
                <TabsTrigger value="request">利用リクエスト</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
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
              </TabsContent>
              
              <TabsContent value="request">
                <form onSubmit={handleAccessRequest} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="request-name">お名前</Label>
                    <Input
                      id="request-name"
                      type="text"
                      placeholder="山田太郎"
                      value={requestName}
                      onChange={(e) => setRequestName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-email">メールアドレス</Label>
                    <Input
                      id="request-email"
                      type="email"
                      placeholder="you@example.com"
                      value={requestEmail}
                      onChange={(e) => setRequestEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-reason">利用目的（任意）</Label>
                    <Textarea
                      id="request-reason"
                      placeholder="thanksを利用したい理由をお聞かせください"
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      rows={3}
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
                    {isLoading ? "送信中..." : "利用リクエストを送信"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
