-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 새 정책 추가
CREATE POLICY "Enable read access for authenticated users" ON profiles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update for users based on id" ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id); 