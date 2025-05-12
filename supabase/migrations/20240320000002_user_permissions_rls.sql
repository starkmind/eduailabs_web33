-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_permissions;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_permissions;

-- RLS 활성화
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- 새 정책 추가
CREATE POLICY "Enable read access for authenticated users" ON user_permissions
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update for users based on user_id" ON user_permissions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 