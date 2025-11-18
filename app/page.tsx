import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, TrendingUp, Award, Bell } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-semibold">thanks</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">ログイン</Link>
            </Button>
            <Button asChild>
              <Link href="/login">始める</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            チームに感謝の文化を
            <br />
            育てるプラットフォーム
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
            thanksは、メンバー同士が感謝のメッセージとポイントを送り合うことで、
            チームのエンゲージメントとモチベーションを高めるサービスです
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/login">無料で始める</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            主な機能
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">感謝を送る</h3>
              <p className="text-muted-foreground">
                メッセージと共にポイントを送って、日々の感謝を伝えましょう
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">タイムライン</h3>
              <p className="text-muted-foreground">
                チーム全体の感謝のメッセージをリアルタイムで確認できます
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">ダッシュボード</h3>
              <p className="text-muted-foreground">
                月ごとのポイント獲得数と付与数をランキング形式で表示
              </p>
            </div>

            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">リアルタイム通知</h3>
              <p className="text-muted-foreground">
                感謝のメッセージを受け取ると即座にブラウザ通知が届きます
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            使い方はシンプル
          </h2>
          <div className="space-y-12">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">メールでログイン</h3>
                <p className="text-muted-foreground">
                  管理者に許可されたメールアドレスでログインします。パスワード不要のマジックリンク認証で安全にアクセス。
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">感謝を送る</h3>
                <p className="text-muted-foreground">
                  週に100ポイントまで使用可能。チームメンバーに感謝のメッセージとポイントを送信します。
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">チームで共有</h3>
                <p className="text-muted-foreground">
                  タイムラインでチーム全体の感謝の輪を確認。ダッシュボードで月ごとの貢献度も可視化されます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            今すぐ感謝の文化を始めましょう
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            thanksで、チームのエンゲージメントを向上させ、
            ポジティブな職場環境を作りましょう
          </p>
          <Button size="lg" className="text-lg px-8 py-6" asChild>
            <Link href="/login">無料で始める</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 thanks. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
