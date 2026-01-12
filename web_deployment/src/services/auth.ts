import { supabase } from '../lib/supabase';

/**
 * AuthService to decouple UI from Supabase (Rule 1)
 */
export const authService = {
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }
};
