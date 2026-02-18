import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "./components/ui/toaster"
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminDashboard, AdminSettings, AdminLayout } from './pages/AdminDashboard';
import { StaffDashboard } from './pages/StaffDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentCertificates } from './pages/StudentCertificates';
import UserManagement from './components/admin/UserManagement';
import { CourseList } from './components/admin/CourseList';
import { CourseEditor } from './components/courses/CourseEditor';
import { ContentManager } from './components/admin/ContentManager';
import { CertificateUpload } from './components/admin/CertificateUpload';
import { QuizManager } from './components/staff/QuizManager';
import { AssignmentManager } from './components/staff/AssignmentManager';
import { CourseViewer } from './components/courses/CourseViewer';
import NotFound from './pages/NotFound';
// import Home from '@/pages/home';
import Home1 from '@/pages/home1';
import AuthCallback from '@/pages/AuthCallback';
import { ModernLoginForm } from './components/auth/ModernLoginForm';
import { InquiryManagement } from './components/admin/InquiryManagement';
import AdminPayments from './components/admin/AdminPayments';
import { AdminCourseManagement } from './components/admin/AdminCourseManagement';
import { UserProgress } from './components/student/UserProgress';
import { ResetPassword } from './pages/ResetPassword';
import { AdminPasswordReset } from './components/auth/AdminPasswordReset';




function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <div className="min-h-screen bg-background">
            <Toaster />
            <Routes>
              {/* Public Routes */}
              {/* <Route path="/home" element={<Home />} /> */}
              <Route path="/" element={<Home1 />} />
              <Route path="/login" element={<ModernLoginForm />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />            
              {/* Accept any reset-password subpath Supabase may use (e.g. /reset-password/profile/update) */}
              <Route path="/reset-password/*" element={<ResetPassword />} />
              <Route path="/admin-reset" element={<AdminPasswordReset />} />
              <Route path="courses/:id" element={<CourseViewer />} />


              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminLayout><UserManagement /></AdminLayout>} />
                <Route path="courses" element={<AdminLayout><AdminCourseManagement /></AdminLayout>} />
                <Route path="courses/new" element={<AdminLayout><CourseEditor /></AdminLayout>} />
                <Route path="courses/:id" element={<AdminLayout><CourseEditor /></AdminLayout>} />
                <Route path="courses/:courseId/content" element={<AdminLayout><ContentManager /></AdminLayout>} />
                <Route path="quizzes" element={<AdminLayout><QuizManager /></AdminLayout>} />
                <Route path="assignments" element={<AdminLayout><AssignmentManager /></AdminLayout>} />
                <Route path="certificates" element={<AdminLayout><CertificateUpload /></AdminLayout>} />
                <Route path="payments" element={<AdminLayout><AdminPayments /></AdminLayout>} />        
                <Route path="inquiries" element={<AdminLayout><InquiryManagement /></AdminLayout>} />
                <Route path="settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
                <Route path="studashboard" element={<StudentDashboard />} />
                <Route path="staffdashboard" element={<StaffDashboard />} />
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
                <Route path="certificates" element={<StudentCertificates />} />
                <Route path="progress" element={<UserProgress />} />
              </Route>
              
              {/* Direct certificate access */}
              <Route path="/certificates" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'student']} />}>
                <Route index element={<StudentCertificates />} />
              </Route>
              
              {/* <Route path="/course-viewer/:courseId" element={<CourseViewer />} /> */}

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
