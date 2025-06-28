import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Navbar } from "@/components/layout/Navbar";
import { HomePage } from "@/pages/HomePage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { StaffDashboard } from "@/pages/StaffDashboard";
import { StudentDashboard } from "@/pages/StudentDashboard";
import { UserManagement } from "@/components/admin/UserManagement";
import { CourseList } from "@/components/courses/CourseList";
import { CourseEditor } from "@/components/courses/CourseEditor";
import { CourseViewer } from "@/components/courses/CourseViewer";
import { QuizManager } from "@/components/assessments/QuizManager";
import { AssignmentManager } from "@/components/assessments/AssignmentManager";
import { PaymentPage } from "@/pages/PaymentPage";
import { PaymentSuccessPage } from "@/pages/PaymentSuccessPage";
import { PaymentHistoryPage } from "@/pages/PaymentHistoryPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/course/:courseId" element={<CourseViewer />} />
              <Route path="/course/:courseId/preview" element={<CourseViewer />} />
              
              {/* Payment Routes */}
              <Route path="/payment/:courseId" element={<PaymentPage />} />
              <Route path="/payment/success/:paymentId" element={<PaymentSuccessPage />} />
              <Route path="/payment/history" element={<PaymentHistoryPage />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/courses" element={<CourseList />} />
              <Route path="/admin/courses/:courseId" element={<CourseEditor />} />
              <Route path="/admin/courses/:courseId/quizzes" element={<QuizManager />} />
              <Route path="/admin/courses/:courseId/assignments" element={<AssignmentManager />} />
              <Route path="/admin/payments" element={<PaymentHistoryPage />} />
              
              {/* Staff Routes */}
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              
              {/* Student Routes */}
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/payments" element={<PaymentHistoryPage />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;