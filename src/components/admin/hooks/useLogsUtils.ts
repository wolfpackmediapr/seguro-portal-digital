
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
    // Directly query the auth.users table using a function
    // Note: This requires proper RLS policies or admin access
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError || !userData) {
      console.error("Error fetching user email:", userError);
      return userId.substring(0, 8) + '...'; // Return truncated ID if email not found
    }
    
    // Cache the email if found
    if (userData.user && userData.user.email) {
      userEmailCache[userId] = userData.user.email;
      return userData.user.email;
    }
    
    return userId.substring(0, 8) + '...';
  } catch (error) {
    console.error("Exception getting user email:", error);
    return userId.substring(0, 8) + '...';
  }
};
