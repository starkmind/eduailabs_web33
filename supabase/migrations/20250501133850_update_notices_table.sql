-- Drop existing table if exists
DROP TABLE IF EXISTS notices;

-- Create notices table
CREATE TABLE notices (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_important BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access" ON notices;
DROP POLICY IF EXISTS "Allow admin insert" ON notices;
DROP POLICY IF EXISTS "Allow admin update" ON notices;
DROP POLICY IF EXISTS "Allow admin delete" ON notices;

-- Create policies
CREATE POLICY "Allow public read access"
ON notices FOR SELECT
TO public
USING (true);

-- 관리자만 공지사항 추가 가능 - 수정된 정책
CREATE POLICY "Allow admin insert"
ON notices FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 관리자만 공지사항 수정 가능 - 수정된 정책
CREATE POLICY "Allow admin update"
ON notices FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- 관리자만 공지사항 삭제 가능 - 수정된 정책
CREATE POLICY "Allow admin delete"
ON notices FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.is_admin = true
  )
);

-- profiles 테이블의 is_admin 컬럼이 존재하는지 확인
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'profiles'
    AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles
    ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
  END IF;
END
$$;
