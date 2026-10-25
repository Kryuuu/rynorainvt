'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { UserProfile, Workspace } from '@/types';
import { dataStore, MOCK_USERS, MOCK_WORKSPACES } from '@/lib/data-store';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  currentWorkspace: Workspace | null;
  session: Session | null;
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOtp: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInAsDemo: (type: 'personal' | 'vendor' | 'admin') => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(MOCK_WORKSPACES.ws_personal);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session and listen for auth state changes
  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted && data.session) {
          setSession(data.session);
          setUser(data.session.user);
          const userProfile: UserProfile = {
            id: data.session.user.id,
            full_name: data.session.user.user_metadata?.full_name || data.session.user.email?.split('@')[0] || 'Pengguna Rynora',
            email: data.session.user.email,
            avatar_url: data.session.user.user_metadata?.avatar_url || null,
            phone: data.session.user.phone || null,
            is_platform_admin: data.session.user.email === 'ahmadshawity@gmail.com',
            status: 'active',
            created_at: data.session.user.created_at,
            updated_at: new Date().toISOString(),
          };
          setProfile(userProfile);
          if (data.session.user.email) {
            dataStore.registerUser({
              id: data.session.user.id,
              full_name: userProfile.full_name,
              email: data.session.user.email,
              phone: data.session.user.phone,
            });
          }
        } else if (mounted) {
          // Check if local demo login exists
          const savedDemo = localStorage.getItem('rynora_demo_user');
          if (savedDemo) {
            try {
              const parsed = JSON.parse(savedDemo);
              setProfile(parsed.profile);
              setCurrentWorkspace(parsed.workspace);
            } catch (e) {
              console.error('Failed to parse saved demo user', e);
            }
          }
        }
      } catch (err) {
        console.warn('Supabase auth session fetch notice:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user || null);

        if (newSession?.user) {
          localStorage.removeItem('rynora_demo_user');
          const userProfile: UserProfile = {
            id: newSession.user.id,
            full_name: newSession.user.user_metadata?.full_name || newSession.user.email?.split('@')[0] || 'Pengguna Rynora',
            email: newSession.user.email,
            avatar_url: newSession.user.user_metadata?.avatar_url || null,
            phone: newSession.user.phone || null,
            is_platform_admin: newSession.user.email === 'ahmadshawity@gmail.com',
            status: 'active',
            created_at: newSession.user.created_at,
            updated_at: new Date().toISOString(),
          };
          setProfile(userProfile);
          if (newSession.user.email) {
            dataStore.registerUser({
              id: newSession.user.id,
              full_name: userProfile.full_name,
              email: newSession.user.email,
              phone: newSession.user.phone,
            });
          }
        }
      }
    );

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  // Sign In with Email & Password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        return { success: true };
      }

      return { success: false, error: 'Terjadi kesalahan saat masuk.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Koneksi gagal' };
    }
  };

  // Sign Up with Email & Password
  const signUpWithEmail = async (email: string, password: string, fullName: string, role = 'client') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: role,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        setSession(data.session);
        dataStore.registerUser({
          id: data.user.id,
          full_name: fullName,
          email: email,
          role: role,
        });
        return { success: true };
      }

      return { success: false, error: 'Pendaftaran gagal.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Koneksi gagal' };
    }
  };

  // Sign In with Magic Link (OTP)
  const signInWithOtp = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal mengirim email OTP' };
    }
  };

  // Sign In with Google OAuth
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Gagal masuk dengan Google' };
    }
  };

  // Quick Demo Access for instant testing
  const signInAsDemo = (type: 'personal' | 'vendor' | 'admin') => {
    let mockProfile: UserProfile;
    let mockWs: Workspace;

    if (type === 'vendor') {
      mockProfile = {
        id: 'user_vendor_01',
        full_name: 'Lentera Wedding Studio',
        email: 'budi@lenterastudio.id',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        phone: '081233445566',
        is_platform_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockWs = MOCK_WORKSPACES.ws_vendor;
    } else if (type === 'admin') {
      mockProfile = {
        id: 'user_admin_01',
        full_name: 'Ahmad Shawity (Super Admin)',
        email: 'ahmadshawity@gmail.com',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        phone: '081199887766',
        is_platform_admin: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockWs = MOCK_WORKSPACES.ws_admin;
    } else {
      mockProfile = MOCK_USERS.user_personal;
      mockWs = MOCK_WORKSPACES.ws_personal;
    }

    setProfile(mockProfile);
    setCurrentWorkspace(mockWs);
    localStorage.setItem('rynora_demo_user', JSON.stringify({ profile: mockProfile, workspace: mockWs }));
  };

  // Sign Out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }
    localStorage.removeItem('rynora_demo_user');
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        currentWorkspace,
        session,
        isLoading,
        signInWithEmail,
        signUpWithEmail,
        signInWithOtp,
        signInWithGoogle,
        signInAsDemo,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
