import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase, supabaseApi } from '../utils/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the application
    const initializeApp = async () => {
      try {
        setError(null);
        console.log('Initializing application...');
        
        // First, check if the server is healthy
        try {
          console.log('Checking server health...');
          await supabaseApi.healthCheck();
          console.log('Server is healthy');
        } catch (healthError) {
          console.warn('Server health check failed, continuing anyway:', healthError);
        }
        
        // Check if demo accounts exist (don't auto-initialize to avoid timing conflicts)
        try {
          console.log('Checking demo account status...');
          const statusResult = await supabaseApi.demoStatus();
          const existingCount = statusResult.accounts.filter(acc => acc.status === 'exists').length;
          console.log(`Found ${existingCount}/3 demo accounts already created`);
          
          if (existingCount === 0) {
            console.log('No demo accounts found - user can initialize them manually from landing page');
          }
        } catch (demoError) {
          console.warn('Could not check demo status, continuing anyway:', demoError);
        }
        
        // Check for existing session
        console.log('Checking for existing session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Failed to check authentication status');
        } else if (session?.user) {
          console.log('Found existing session for user:', session.user.email);
          const transformedUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            role: session.user.user_metadata?.role || 'individual',
            hospitalId: session.user.user_metadata?.hospital_id,
            createdAt: session.user.created_at || new Date().toISOString()
          };
          setUser(transformedUser);
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        setError('Failed to initialize application. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          const transformedUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
            role: session.user.user_metadata?.role || 'individual',
            hospitalId: session.user.user_metadata?.hospital_id,
            createdAt: session.user.created_at || new Date().toISOString()
          };
          setUser(transformedUser);
          setError(null);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setError(null);
      await supabaseApi.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    signOut,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}