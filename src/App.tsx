
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminDashboard, AdminSettings, AdminLayout } from '@/pages/AdminDashboard';
import { StaffDashboard } from '@/pages/StaffDashboard';
import { StudentDashboard } from '@/pages/StudentDashboard';
import { StudentCertificates } from '@/pages/StudentCertificates';
import { UserManagement } from '@/components/admin/UserManagement';
import { CourseList } from '@/components/admin/CourseList';
import { CourseEditor } from '@/components/admin/CourseEditor';
import { ContentManager } from '@/components/admin/ContentManager';
import { CertificateUpload } from '@/components/admin/CertificateUpload';
import { QuizManager } from '@/components/staff/QuizManager';
import { AssignmentManager } from '@/components/staff/AssignmentManager';
import { CourseViewer } from '@/components/student/CourseViewer';
import NotFound from '@/pages/NotFound';
import { NewHomePage } from '@/pages/NewHomePage';
import { LoginForm } from '@/components/auth/LoginForm';
import { PaymentPage } from '@/pages/PaymentPage';
import { PaymentSuccessPage } from '@/pages/PaymentSuccessPage';
import { PaymentHistoryPage } from '@/pages/PaymentHistoryPage';
import { InquiryManagement } from '@/components/admin/InquiryManagement';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <div className="min-h-screen bg-background">
            <Toaster />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<NewHomePage />} />
              <Route path="/home" element={<NewHomePage />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/payment/:courseId" element={<PaymentPage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/history" element={<PaymentHistoryPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminLayout><UserManagement /></AdminLayout>} />
                <Route path="courses" element={<AdminLayout><CourseList /></AdminLayout>} />
                <Route path="courses/new" element={<AdminLayout><CourseEditor /></AdminLayout>} />
                <Route path="courses/:id" element={<AdminLayout><CourseEditor /></AdminLayout>} />
                <Route path="courses/:courseId/content" element={<AdminLayout><ContentManager /></AdminLayout>} />
                <Route path="certificates" element={<AdminLayout><CertificateUpload /></AdminLayout>} />
                <Route path="payments" element={<AdminLayout><div className="p-8"><h1>Payment Management</h1></div></AdminLayout>} />
                <Route path="inquiries" element={<AdminLayout><InquiryManagement /></AdminLayout>} />
                <Route path="settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
              </Route>
              
              {/* Staff Routes */}
              <Route path="/staff" element={<ProtectedRoute allowedRoles={['admin', 'staff']} />}>
                <Route path="dashboard" element={<StaffDashboard />} />
                <Route path="courses" element={<AdminLayout><CourseList /></AdminLayout>} />
                <Route path="courses/new" element={<AdminLayout><CourseEditor /></AdminLayout>} />
                <Route path="courses/:id" element={<AdminLayout><CourseEditor /></AdminLayout>} />
                <Route path="courses/:courseId/content" element={<AdminLayout><ContentManager /></AdminLayout>} />
                <Route path="students" element={<AdminLayout><div className="p-8"><h1>Student Management</h1></div></AdminLayout>} />
                <Route path="quizzes" element={<AdminLayout><QuizManager /></AdminLayout>} />
                <Route path="assignments" element={<AdminLayout><AssignmentManager /></AdminLayout>} />
                <Route path="certificates" element={<AdminLayout><CertificateUpload /></AdminLayout>} />
              </Route>
              
              {/* Student Routes */}
              <Route path="/student" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'student']} />}>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="courses/:courseId" element={<CourseViewer />} />
                <Route path="certificates" element={<StudentCertificates />} />
                <Route path="progress" element={<div className="p-8"><h1>Student Progress</h1></div>} />
              </Route>
              
              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
