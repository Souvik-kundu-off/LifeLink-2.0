import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-8be7e5d1`;

// Helper function to make authenticated requests to our server
async function makeRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Failed to get session. Please sign in again.');
    }
    
    if (!session?.access_token) {
      throw new Error('No active session. Please sign in to continue.');
    }
    
    const response = await fetch(`${SERVER_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        errorData = { error: await response.text() };
      }
      
      console.error(`Request failed: ${endpoint}`, errorData);
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      }
      
      throw new Error(errorData.error || `Request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`makeRequest error for ${endpoint}:`, error);
    throw error;
  }
}

export const supabaseApi = {
  // Authentication
  signUp: async (userData: any) => {
    try {
      const response = await fetch(`${SERVER_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Transform the user data to include role information
    const transformedUser = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || '',
      role: data.user.user_metadata?.role || 'individual',
      hospitalId: data.user.user_metadata?.hospital_id,
      createdAt: data.user.created_at || new Date().toISOString(),
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || '',
        role: data.user.user_metadata?.role || 'individual',
        hospitalId: data.user.user_metadata?.hospital_id,
        createdAt: data.user.created_at || new Date().toISOString()
      }
    };

    return transformedUser;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  // Donors
  getDonors: async () => {
    return makeRequest('/donors');
  },

  createDonor: async (donorData: any) => {
    return makeRequest('/donors', {
      method: 'POST',
      body: JSON.stringify(donorData),
    });
  },

  // Recipients
  getRecipients: async () => {
    return makeRequest('/recipients');
  },

  createRecipient: async (recipientData: any) => {
    return makeRequest('/recipients', {
      method: 'POST',
      body: JSON.stringify(recipientData),
    });
  },

  // Matching
  findMatches: async (recipientId: string) => {
    return makeRequest('/find-matches', {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    });
  },

  // Alerts
  sendAlert: async (alertData: any) => {
    return makeRequest('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  },

  // Profile
  getProfile: async () => {
    return makeRequest('/profile');
  },

  updateProfile: async (profileData: any) => {
    return makeRequest('/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Demo data initialization
  initializeDemo: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/init-demo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Demo initialization failed');
      }

      return data;
    } catch (error) {
      console.error('Demo initialization error:', error);
      throw error;
    }
  },

  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Health check failed');
      }

      return data;
    } catch (error) {
      console.error('Health check error:', error);
      throw error;
    }
  },

  // Check demo accounts status
  demoStatus: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/demo-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check demo status');
      }

      return data;
    } catch (error) {
      console.error('Demo status check error:', error);
      throw error;
    }
  },

  // Debug: Test demo account login
  testDemoAccount: async (email: string, password: string) => {
    try {
      console.log(`Testing demo account: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Demo test failed:', error);
        return { success: false, error: error.message, data: null };
      }

      console.log('Demo test successful:', data.user);
      
      // Sign out immediately after test
      await supabase.auth.signOut();
      
      return { 
        success: true, 
        error: null, 
        data: {
          id: data.user.id,
          email: data.user.email,
          metadata: data.user.user_metadata,
          confirmed: data.user.email_confirmed_at ? true : false
        }
      };
    } catch (error) {
      console.error('Demo test error:', error);
      return { success: false, error: error.message, data: null };
    }
  },

  // Initialize admin user
  initializeAdmin: async () => {
    try {
      const adminEmail = 'souvikkundu7880@gmail.com';
      const adminPassword = '7718427880';
      
      const response = await fetch(`${SERVER_URL}/init-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          name: 'System Administrator',
          role: 'admin'
        }),
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Admin initialization failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If we can't parse JSON, use the response text
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Try to parse JSON response
      try {
        const data = await response.json();
        return data;
      } catch (parseError) {
        // If JSON parsing fails, return success based on status code
        console.warn('JSON parsing failed for admin init, but response was OK');
        return { success: true, message: 'Admin initialized successfully' };
      }
    } catch (error) {
      console.error('Admin initialization error:', error);
      throw error;
    }
  },
};