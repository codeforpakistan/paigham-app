import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { createServerClient, CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type AuthUser = User;

export async function signUp(email: string, password: string, userData: {
  first_name?: string;
  last_name?: string;
  company_id?: string;
  company_name?: string;
}) {
  try {
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // If a company_id is not provided, create a new company
    let companyId = userData.company_id;
    if (!companyId && userData.company_name) {
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: userData.company_name,
          credits_balance: 10, // Give 10 free credits to start
        })
        .select('id')
        .single();

      if (companyError) throw companyError;
      companyId = companyData.id;

      // Add a credit transaction for the initial credits
      await supabase.from('credit_transactions').insert({
        company_id: companyId,
        amount: 10,
        type: 'bonus',
        description: 'Welcome bonus credits',
      });
    }

    // Create the user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        company_id: companyId,
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        role: 'admin', // First user is admin
      });

    if (profileError) throw profileError;

    return { user: authData.user, companyId };
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, companies(*)')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
}

export async function updatePassword(password: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
}

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (_) {
            // Handle cookies in middleware, ignore error
            console.error('Error setting cookie:', name, value, options, _)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (_) {
            // Handle cookies in middleware, ignore error
            console.error('Error removing cookie:', name, options, _)
          }
        },
      },
    }
  )
} 