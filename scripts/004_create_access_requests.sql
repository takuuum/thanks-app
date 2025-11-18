-- 利用リクエストテーブルの作成
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLSポリシー：誰でもリクエスト作成可能
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "access_requests_insert_anonymous"
  ON access_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 管理者のみが閲覧・更新可能（将来的に管理画面で使用）
CREATE POLICY "access_requests_select_admin"
  ON access_requests
  FOR SELECT
  TO authenticated
  USING (false); -- 管理者ロール実装時に変更

CREATE POLICY "access_requests_update_admin"
  ON access_requests
  FOR UPDATE
  TO authenticated
  USING (false); -- 管理者ロール実装時に変更
