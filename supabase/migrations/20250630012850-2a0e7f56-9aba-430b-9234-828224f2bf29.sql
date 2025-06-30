
-- Add missing columns to profiles table for user management
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profession text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update the handle_new_user function to properly set roles from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role,
    phone,
    address,
    profession,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'profession',
    true
  );
  RETURN NEW;
END;
$$;

-- Add is_free column to courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_free boolean DEFAULT false;

-- Create RLS policies for course access based on enrollment and free status
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Policy for viewing courses - everyone can see published courses
CREATE POLICY "Anyone can view published courses" ON courses
  FOR SELECT USING (is_published = true);

-- Policy for course creators and admins to manage courses
CREATE POLICY "Course creators can manage their courses" ON courses
  FOR ALL USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Create RLS policy for enrollments
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Students can only see their own enrollments
CREATE POLICY "Students can view their own enrollments" ON enrollments
  FOR SELECT USING (auth.uid() = student_id);

-- Allow enrollment for free courses or when payment is made
CREATE POLICY "Allow enrollment for free courses or paid access" ON enrollments
  FOR INSERT WITH CHECK (
    auth.uid() = student_id AND (
      -- Free courses can be enrolled by anyone
      EXISTS (SELECT 1 FROM courses WHERE id = course_id AND is_free = true) OR
      -- Paid courses require payment
      EXISTS (SELECT 1 FROM payments WHERE student_id = auth.uid() AND course_id = enrollments.course_id AND status = 'completed')
    )
  );
