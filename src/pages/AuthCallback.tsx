import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';

const AuthCallback: React.FC = () => {
  const { loading, user } = useAuth();

  // AuthProvider with detectSessionInUrl will parse tokens from URL and
  // onAuthStateChange + fetchProfile will route the user by role.
  // This screen only shows a transient loader while that completes.

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-700">
          {loading ? 'Completing sign-in…' : user ? 'Signed in. Redirecting…' : 'No session detected. Redirecting to login…'}
        </p>
      </div>
    </div>
  );
};

export default AuthCallback;
