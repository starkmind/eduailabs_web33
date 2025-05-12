-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

-- Create policy to allow only admins to update is_admin column
CREATE POLICY "Only admins can update is_admin"
ON profiles
FOR UPDATE
USING (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true))
WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE is_admin = true));

-- Create first admin user (replace 'YOUR_USER_ID' with the actual user ID you want to make admin)
-- You should run this manually with the specific user ID you want to make admin
-- UPDATE profiles SET is_admin = true WHERE id = 'YOUR_USER_ID';

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
