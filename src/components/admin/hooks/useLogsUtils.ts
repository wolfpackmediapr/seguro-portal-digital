
import { supabase } from '@/integrations/supabase/client';

export const checkAuthSession = async (): Promise<boolean> => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error("Error checking auth session:", error);
    return false;
  }
  
  return !!data.session;
};

// Add a small delay to help with connection issues
export const networkDelay = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
};

// Debounce function to prevent excessive fetching
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

// Fetch user email by user ID
export const fetchUserEmail = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error || !data.user) {
      console.error("Error fetching user data:", error);
      return null;
    }
    
    return data.user.email || null;
  } catch (error) {
    console.error("Exception fetching user email:", error);
    return null;
  }
};

// Cache for storing user emails to reduce API calls
export const userEmailCache: Record<string, string> = {};

// Get user email with caching
export const getUserEmail = async (userId: string): Promise<string> => {
  if (!userId) return 'Unknown';
  
  // Return from cache if available
  if (userEmailCache[userId]) {
    return userEmailCache[userId];
  }
  
  try {
    // Get user data from the auth.users table through an RPC function
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (error) {
      // If we can't get from profiles, try to get from user_roles with email
      const { data: userData, error: userError } = await supabase
        .rpc('get_user_email', { user_id: userId });
      
      if (userError || !userData) {
        console.error("Error fetching user email:", userError);
        return userId.substring(0, 8) + '...'; // Return truncated ID if email not found
      }
      
      // Cache the email
      userEmailCache[userId] = userData;
      return userData;
    }
    
    // Cache the email from profiles
    if (data?.email) {
      userEmailCache[userId] = data.email;
      return data.email;
    }
    
    return userId.substring(0, 8) + '...';
  } catch (error) {
    console.error("Exception getting user email:", error);
    return userId.substring(0, 8) + '...';
  }
};
