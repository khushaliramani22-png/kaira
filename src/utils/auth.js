// src/utils/auth.js
import { createClient } from './supabase/client';

/**
 * યુઝરને ઇમેઇલ અને પાસવર્ડથી લોગિન કરવા માટે
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

/**
 * યુઝરને લોગઆઉટ કરવા માટે
 */
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
 * યુઝર અત્યારે લોગિન છે કે નહીં તે ચેક કરવા (Client Side)
 * @returns {Promise<boolean>}
 */
export async function isLoggedIn() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user; // જો યુઝર હોય તો true, નહીંતર false
}

/**
 * લોગિન થયેલા યુઝરનો રોલ (Admin છે કે નહીં) ચેક કરવા
 */
export async function isAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Supabase User Metadata માંથી is_admin ફ્લેગ ચેક કરશે
  return user?.app_metadata?.is_admin === true;
}