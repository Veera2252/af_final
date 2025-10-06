
-- Create student_certificates table
CREATE TABLE public.student_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.student_certificates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for student_certificates
CREATE POLICY "Students can view their own certificates"
  ON public.student_certificates
  FOR SELECT
  USING (student_id = auth.uid());

CREATE POLICY "Admins and staff can view all certificates"
  ON public.student_certificates
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins and staff can insert certificates"
  ON public.student_certificates
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins and staff can update certificates"
  ON public.student_certificates
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins and staff can delete certificates"
  ON public.student_certificates
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Create certificates storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false);

-- Create storage policies for certificates bucket
CREATE POLICY "Authenticated users can view certificates"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'certificates' AND auth.role() = 'authenticated');

CREATE POLICY "Admins and staff can upload certificates"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins and staff can update certificates"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins and staff can delete certificates"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'certificates' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );
