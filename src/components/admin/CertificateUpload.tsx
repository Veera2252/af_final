
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Award, FileText, User, BookOpen } from 'lucide-react';

interface Student {
  id: string;
  full_name: string;
  email: string;
}

interface Course {
  id: string;
  title: string;
}

export const CertificateUpload: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')
        .order('full_name');

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('is_published', true)
        .order('title');

      if (error) throw error;
      setCourses(data || []);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast({
          title: "Error",
          description: "Please select a PDF file",
          variant: "destructive",
        });
        return;
      }
      setCertificateFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedStudent || !selectedCourse || !certificateFile) {
      toast({
        title: "Error",
        description: "Please fill all fields and select a certificate file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = certificateFile.name.split('.').pop();
      const fileName = `${selectedStudent}_${selectedCourse}_${Date.now()}.${fileExt}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('certificates')
        .upload(fileName, certificateFile);

      if (uploadError) throw uploadError;

      // Save certificate record to database using raw insert
      const { error: dbError } = await supabase
        .from('student_certificates' as any)
        .insert({
          student_id: selectedStudent,
          course_id: selectedCourse,
          file_url: fileName,
          issued_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      toast({
        title: "Success",
        description: "Certificate uploaded successfully",
      });

      // Reset form
      setSelectedStudent('');
      setSelectedCourse('');
      setCertificateFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('certificate-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error: any) {
      console.error('Error uploading certificate:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload certificate",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Award className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Upload Student Certificates
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload completion certificates for students who have finished their courses
          </p>
        </div>

        {/* Upload Form */}
        <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-blue-50 border-b border-emerald-100 rounded-t-lg">
            <CardTitle className="text-2xl flex items-center gap-3 text-emerald-800">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Upload className="h-6 w-6 text-white" />
              </div>
              Certificate Upload Form
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Student Selection */}
            <div className="space-y-2">
              <Label htmlFor="student-select" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Select Student *
              </Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-emerald-500 rounded-xl shadow-sm">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id} className="text-lg py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{student.full_name}</span>
                        <span className="text-sm text-gray-500">{student.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Course Selection */}
            <div className="space-y-2">
              <Label htmlFor="course-select" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Select Course *
              </Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm">
                  <SelectValue placeholder="Choose a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id} className="text-lg py-3">
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="certificate-file" className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Certificate File (PDF) *
              </Label>
              <Input
                id="certificate-file"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="h-14 text-lg border-2 border-gray-200 focus:border-purple-500 rounded-xl shadow-sm file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              {certificateFile && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {certificateFile.name}
                </p>
              )}
            </div>

            {/* Upload Info */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-800 text-lg mb-2">Certificate Upload Guidelines</h3>
                  <ul className="text-blue-700 space-y-1">
                    <li>• Only PDF files are accepted</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• Certificate will be available for download in student dashboard</li>
                    <li>• Students will be notified via email (if configured)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <Button 
              onClick={handleUpload}
              disabled={uploading || !selectedStudent || !selectedCourse || !certificateFile}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Uploading Certificate...
                </>
              ) : (
                <>
                  <Upload className="h-6 w-6 mr-3" />
                  Upload Certificate
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
