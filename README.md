# thanks

感謝の文化を育むポイントシステム - チームメンバー同士が感謝のメッセージとポイントを送り合えるサービス

## 概要

**thanks**は、uniposのようなチームエンゲージメントプラットフォームです。メンバー同士が日々の感謝を可視化し、ポジティブな職場文化を促進します。

### 主な機能

- **感謝のメッセージとポイント送信** - 週に100ポイントまで送信可能
- **タイムライン** - 全員の感謝メッセージをリアルタイムで確認
- **ダッシュボード** - 月ごとのポイント獲得/付与ランキング
- **ブラウザ通知** - 感謝メッセージを受け取ると即座に通知
- **プロフィール管理** - アバター画像のアップロード、通知設定
- **メールリンク認証** - パスワード不要の簡単ログイン

## 詳細仕様

### 認証機能

#### メールリンク認証（マジックリンク）
- パスワード不要の安全なログイン方式
- Supabase Authを使用
- 管理者に許可されたユーザーのみがアクセス可能
- ログインフロー：
  1. ユーザーがメールアドレスを入力
  2. Supabaseが認証リンク付きメールを送信
  3. ユーザーがリンクをクリック
  4. コールバックページ経由で認証完了
  5. タイムラインページへリダイレクト

#### Row Level Security (RLS)
- 全てのテーブルでRLSポリシーを適用
- ユーザーは自分のデータのみアクセス可能
- 投稿は全員が閲覧可能、作成は認証ユーザーのみ
- プロフィールは自分のもののみ編集可能

### ポイント送信機能

#### 週間ポイント制限
- 各ユーザーは毎週100ポイントまで送信可能
- 週は日曜日から土曜日まで
- `weekly_points`テーブルで管理
- リアルタイムで残りポイントを表示

#### ポイント送信フロー
1. 「感謝を送る」ボタンをクリック
2. 送信先ユーザーを選択（ドロップダウン）
3. メッセージ入力（必須、最大500文字）
4. ポイント数入力（1〜100、週の残りポイント内）
5. 送信ボタンクリック
6. データベースに保存：
   - `posts`テーブルに投稿作成
   - `weekly_points`テーブルを更新
   - `notifications`テーブルに通知作成
7. 受信者にブラウザ通知（オンの場合）

#### バリデーション
- 週の残りポイントを超える送信は不可
- 自分自身へのポイント送信は不可
- メッセージは必須入力

### タイムライン機能

#### リアルタイム更新
- Supabase Realtimeを使用
- 新しい投稿が即座に表示される
- WebSocketによる双方向通信

#### 表示内容
- 投稿者のアバターと名前
- 受信者の名前
- 送信されたポイント数
- 感謝のメッセージ
- 投稿時刻（相対時刻表示）

#### 通知設定トグル
- タイムラインページ上部に配置
- ワンクリックで通知のオン/オフ切り替え
- ブラウザ通知の許可リクエストを自動実行
- 拒否された場合は設定ガイドを表示

### ダッシュボード機能

#### 月次統計
- 当月のポイント獲得ランキング
- 当月のポイント付与ランキング
- 各ランキングはトップ10を表示
- リアルタイムで更新

#### 表示情報
- ユーザー名
- アバター画像
- ポイント数
- ランキング順位

### 通知機能

#### ブラウザ通知
- Notification APIを使用
- 通知内容：
  - 送信者名
  - 送信されたポイント数
  - メッセージの一部（最初の50文字）
- 通知クリックでタイムラインページへ遷移

#### 通知設定
- プロフィールページで設定可能
- タイムラインページでも設定可能
- `profiles.notification_enabled`で管理
- ブラウザの通知許可が必要

#### ブラウザ通知の許可管理
- 初回オン時に許可リクエスト
- 拒否された場合の対応：
  - 警告バナー表示
  - Chrome設定ガイドへのリンク提供
  - https://support.google.com/chrome/answer/95472

#### 通知一覧
- 未読通知をハイライト表示
- 通知の既読/未読管理
- 投稿時刻の相対表示
- 無限スクロール対応（将来実装）

### プロフィール管理機能

#### 編集可能項目
- 表示名（display_name）
- アバター画像（avatar_url）
- 通知設定（notification_enabled）

#### アバター画像アップロード
- Supabase Storageの`avator`バケットに保存
- UUIDでフォルダ分け：`{user_id}/{timestamp}.{ext}`
- 対応形式：JPEG、PNG、GIF、WebP
- ファイルサイズ制限：5MB
- アップロード後、自動的にURLを設定
- 削除機能あり

#### プロフィール表示
- ヘッダーにアバターと名前を表示
- ドロップダウンメニューから編集ページへ

### 技術スタック

- **フレームワーク**: Next.js 16 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS v4
- **UIコンポーネント**: shadcn/ui + Radix UI
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth (Magic Link)
- **ストレージ**: Supabase Storage
- **デプロイ**: Vercel

## セットアップ

### 前提条件

- Node.js 18以上
- pnpm (推奨)
- Supabaseアカウント

### 環境変数

プロジェクトには以下の環境変数が必要です：

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PostgreSQL (Supabaseから自動提供)
POSTGRES_URL=your-postgres-url
POSTGRES_PRISMA_URL=your-prisma-url
POSTGRES_URL_NON_POOLING=your-non-pooling-url
POSTGRES_USER=your-user
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=your-database
POSTGRES_HOST=your-host
\`\`\`

### インストール

1. 依存関係のインストール：

\`\`\`bash
pnpm install
\`\`\`

2. Supabaseプロジェクトのセットアップ：

\`\`\`bash
# scripts内のSQLファイルを順番に実行
# 001_create_tables.sql - テーブル作成
# 002_create_functions.sql - 関数とトリガー作成
# 003_add_notification_settings.sql - 通知設定追加
\`\`\`

3. Supabase Storageでバケット作成：
   - `avator` バケットを作成（公開設定）

4. 開発サーバーの起動：

\`\`\`bash
pnpm dev
\`\`\`

## データベーススキーマ

### profiles
ユーザープロフィール情報

- `id` (uuid, primary key)
- `email` (text)
- `display_name` (text)
- `avatar_url` (text)
- `notification_enabled` (boolean)
- `created_at` (timestamp)

### posts
感謝の投稿

- `id` (uuid, primary key)
- `sender_id` (uuid, foreign key)
- `receiver_id` (uuid, foreign key)
- `message` (text)
- `points` (integer)
- `created_at` (timestamp)

### weekly_points
週ごとのポイント管理

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `week_start` (date)
- `points_sent` (integer)
- `points_received` (integer)

### notifications
通知管理

- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `post_id` (uuid, foreign key)
- `message` (text)
- `is_read` (boolean)
- `created_at` (timestamp)

## プロジェクト構造

\`\`\`
.
├── app/
│   ├── auth/callback/          # 認証コールバック
│   ├── dashboard/              # ダッシュボード
│   ├── login/                  # ログイン
│   ├── notifications/          # 通知一覧
│   ├── profile/                # プロフィール編集
│   ├── timeline/               # タイムライン
│   ├── layout.tsx              # ルートレイアウト
│   └── page.tsx                # ランディングページ
├── components/
│   ├── ui/                     # shadcn/ui コンポーネント
│   ├── header.tsx              # ヘッダー
│   ├── timeline-feed.tsx       # タイムラインフィード
│   ├── send-point-dialog.tsx   # ポイント送信ダイアログ
│   ├── notification-toggle.tsx # 通知設定トグル
│   └── profile-edit-form.tsx   # プロフィール編集フォーム
├── hooks/
│   └── use-browser-notification.ts  # ブラウザ通知フック
├── lib/
│   └── supabase/               # Supabaseクライアント
├── scripts/
│   └── *.sql                   # データベースマイグレーション
└── public/
    └── avatars/                # デフォルトアバター画像
\`\`\`

## 使い方

### ログイン

1. メールアドレスを入力
2. 受信したメールのリンクをクリック
3. 自動的にログインしてタイムラインページへ

### 感謝を送る

1. タイムラインページの「感謝を送る」ボタンをクリック
2. 送り先のメンバーを選択
3. メッセージとポイントを入力（1〜100ポイント）
4. 送信（週の残りポイントが表示されます）

### 通知設定

- プロフィールページまたはタイムラインページで通知をオン/オフ
- ブラウザ通知の許可が必要
- 拒否された場合は設定ガイドリンクが表示されます

### アバター変更

1. プロフィールページを開く
2. 画像ファイルを選択（5MB以下）
3. 自動的にSupabase Storageにアップロード

## カラーパレット

- **プライマリ**: #006555 (ティールグリーン)
- **背景**: #f7f2ea (ベージュ)
- **アクセント**: #004d42 (ダークティール)
- **テキスト**: #1a1a1a (ダークグレー)
- **ボーダー**: #e5dfd0 (薄いベージュ)

## デプロイ

### Vercel

1. GitHubリポジトリに接続
2. 環境変数を設定
3. デプロイ

### 環境変数の設定

Vercelダッシュボードで以下を設定：
- Supabase統合を追加（推奨）
- または手動で環境変数を追加

## ライセンス

MIT

## 貢献

プルリクエストを歓迎します。大きな変更の場合は、まずissueを開いて変更内容を議論してください。

## 今後の拡張案

- [ ] コメント機能
- [ ] リアクション機能（いいね、拍手など）
- [ ] タグ機能
- [ ] 検索機能
- [ ] エクスポート機能（CSV、PDF）
- [ ] チーム/組織管理
- [ ] 管理者ダッシュボード
- [ ] 統計レポート
- [ ] モバイルアプリ（React Native）
