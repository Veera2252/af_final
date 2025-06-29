import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

type Profile = Tables<'profiles'>;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isStaff: boolean;
  isStudent: boolean;
  canAccessAdminDashboard: boolean;
  canAccessStaffDashboard: boolean;
  canAccessStudentDashboard: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Defer profile fetching to avoid blocking auth state
        setTimeout(() => {
          fetchProfile(session.user.id);
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // Test Supabase connection first
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        console.error('Supabase connection test failed:', connectionError);
        throw new Error(`Connection failed: ${connectionError.message}`);
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          console.log('Profile not found, creating default profile');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user?.email || '',
              role: 'student',
              full_name: user?.user_metadata?.full_name || 'Unknown User',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            throw createError;
          }
          
          setProfile(newProfile);
          if (newProfile && newProfile.role) {
            navigateToRoleDashboard(newProfile.role);
          }
        } else {
          throw error;
        }
      } else {
        console.log('Profile fetched:', data);
        setProfile(data);
        
        // Navigate to appropriate dashboard based on role
        if (data && data.role) {
          navigateToRoleDashboard(data.role);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Provide more detailed error information
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error('Network error: Unable to connect to Supabase. Please check:');
        console.error('1. Your internet connection');
        console.error('2. Supabase project status');
        console.error('3. CORS configuration in Supabase dashboard');
        console.error('4. Firewall or proxy settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToRoleDashboard = (role: string) => {
    // Only navigate if we're currently on the home page or login page
    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/login') {
      switch (role) {
        case 'admin':
          window.location.href = '/admin/dashboard';
          break;
        case 'staff':
          window.location.href = '/staff/dashboard';
          break;
        case 'student':
          window.location.href = '/student/dashboard';
          break;
        default:
          console.log('Unknown role:', role);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('Attempting sign up for:', email);
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: 'student' // Default role for public signup
        }
      }
    });
    
    if (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Navigate to home page after sign out
    window.location.href = '/';
  };

  const isAdmin = profile?.role === 'admin';
  const isStaff = profile?.role === 'staff';
  const isStudent = profile?.role === 'student';

  // Admin users can access all dashboards
  const canAccessAdminDashboard = isAdmin;
  const canAccessStaffDashboard = isAdmin || isStaff;
  const canAccessStudentDashboard = isAdmin || isStaff || isStudent;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      isAdmin,
      isStaff,
      isStudent,
      canAccessAdminDashboard,
      canAccessStaffDashboard,
      canAccessStudentDashboard
    }}>
      {children}
    </AuthContext.Provider>
  );
};
