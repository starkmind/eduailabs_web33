-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON inquiries;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON inquiries;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON inquiries;

-- RLS 활성화
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- 새 정책 추가
CREATE POLICY "Enable read access for authenticated users" ON inquiries
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON inquiries
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON inquiries
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 