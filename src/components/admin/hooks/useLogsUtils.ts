
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
    // Try to get user profile info from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();
    
    if (!profileError && profileData?.full_name) {
      // Use full_name from profiles if available
      userEmailCache[userId] = profileData.full_name;
      return profileData.full_name;
    }
    
    // If no profile data, return user ID with truncation for privacy
    return userId.substring(0, 8) + '...';
  } catch (error) {
    console.error("Exception getting user email:", error);
    return userId.substring(0, 8) + '...';
  }
};
