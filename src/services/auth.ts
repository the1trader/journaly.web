import { supabase } from '../lib/supabase';

/**
 * AuthService to decouple UI from Supabase (Rule 1)
 */
export const authService = {
  async getCurrentUser() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getSession() {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async signIn(email: string, password: string) {
    if (!supabase) throw new Error("Auth service not initialized");
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signUp(email: string, password: string) {
    if (!supabase) throw new Error("Auth service not initialized");
    return await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      }
    });
  },

  async signOut() {
    if (!supabase) return;
    return await supabase.auth.signOut();
  },

  async resetPassword(email: string) {
    if (!supabase) throw new Error("Auth service not initialized");
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?type=recovery`,
    });
  }
};
