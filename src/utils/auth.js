
import { createClient } from './supabase/client';

/**
 * 
 * @param {string} email 
 * @param {string} password 
 */
export async function loginUser(email, password) {
  const supabase = createClient();
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Login Error:', error.message);
    return { success: false, error: error.message };
  }
}


export async function logoutUser() {
  const supabase = createClient();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Logout Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 
 * @returns {Promise<boolean>}
 */
export async function isLoggedIn() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user; 
}


export async function isAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return user?.app_metadata?.is_admin === true;
}