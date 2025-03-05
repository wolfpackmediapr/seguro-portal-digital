
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

// Fetch user email by user ID using the edge function
export const fetchUserEmail = async (userId: string): Promise<string | null> => {
  try {
    // Call the edge function to get the user email
    const { data, error } = await supabase.functions.invoke('get-user-email', {
      body: { userId }
    });
    
    if (error || !data?.email) {
      console.error("Error fetching user email:", error);
      return null;
    }
    
    return data.email;
  } catch (error) {
    console.error("Exception fetching user email:", error);
    return null;
  }
};

// Get user email with caching
export const getUserEmail = async (userId: string): Promise<string> => {
  if (!userId) return 'Unknown';
  
  // Return from cache if available
  if (userEmailCache[userId]) {
    return userEmailCache[userId];
  }
  
  try {
    // Fetch email using the edge function
    const email = await fetchUserEmail(userId);
    
    if (email) {
      // Cache the email if found
      userEmailCache[userId] = email;
      return email;
    }
    
    return userId.substring(0, 8) + '...'; // Return truncated ID if email not found
  } catch (error) {
    console.error("Exception getting user email:", error);
    return userId.substring(0, 8) + '...';
  }
};
