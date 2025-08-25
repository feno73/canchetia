'use client';

import { useEffect, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { User, UserRole } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  authUser: SupabaseUser | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    authUser: null,
    loading: true,
    error: null,
  });

  const supabase = createSupabaseClient();

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (!session?.user) {
          setState({
            user: null,
            authUser: null,
            loading: false,
            error: null,
          });
          return;
        }

        // Get user profile from database
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!mounted) return;

        if (error) {
          setState({
            user: null,
            authUser: session.user,
            loading: false,
            error: error.message,
          });
          return;
        }

        setState({
          user: userData,
          authUser: session.user,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (!mounted) return;
        setState({
          user: null,
          authUser: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        });
      }
    };

    // Initial session load
    getSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        setState({
          user: null,
          authUser: null,
          loading: false,
          error: null,
        });
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Get user profile
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!mounted) return;

        setState({
          user: userData || null,
          authUser: session.user,
          loading: false,
          error: error?.message || null,
        });
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
    return { error };
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!state.user) return { error: new Error('No user logged in') };

    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', state.user.id)
      .select()
      .single();

    if (!error && data) {
      setState((prev) => ({ ...prev, user: data }));
    }

    return { data, error };
  };

  const hasRole = (role: UserRole) => {
    return state.user?.rol === role;
  };

  const isAdmin = () => hasRole('admin_complejo');
  const isPlayer = () => hasRole('jugador');

  return {
    ...state,
    signOut,
    updateProfile,
    hasRole,
    isAdmin,
    isPlayer,
    isAuthenticated: !!state.user,
  };
}