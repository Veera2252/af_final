
-- Create a table to store course inquiries from the chatbot
CREATE TABLE public.course_inquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  course_interest TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - Make inquiries readable by admin/staff only
ALTER TABLE public.course_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert inquiries (for the chatbot form)
CREATE POLICY "Anyone can create course inquiries" 
  ON public.course_inquiries 
  FOR INSERT 
  WITH CHECK (true);

-- Allow admin and staff to view all inquiries
CREATE POLICY "Admin and staff can view all inquiries" 
  ON public.course_inquiries 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Allow admin and staff to update inquiries
CREATE POLICY "Admin and staff can update inquiries" 
  ON public.course_inquiries 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'staff')
    )
  );
