
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

// Get user email with improved caching and privacy
export const getUserEmail = async (userId: string): Promise<string> => {
  if (!userId) return 'Unknown';
  
  // Return from cache if available
  if (userEmailCache[userId]) {
    return userEmailCache[userId];
  }
  
  try {
    // First attempt to fetch from auth.users using admin API
    try {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      
      if (!userError && userData?.user?.email) {
        // Mask email for privacy
        const email = userData.user.email;
        const maskedEmail = maskEmail(email);
        userEmailCache[userId] = maskedEmail;
        return maskedEmail;
      }
    } catch (adminError) {
      console.log("Admin API not available or error:", adminError);
      // Continue to fallback options
    }
    
    // Fallback to profiles table if admin API fails
    // Note: We're explicitly NOT using .single() and using regular accept header
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId);
    
    if (!profileError && profileData && profileData.length > 0 && profileData[0]?.full_name) {
      // Use full_name from profiles if available
      userEmailCache[userId] = profileData[0].full_name;
      return profileData[0].full_name;
    }
    
    // Last resort: return truncated user ID for privacy
    const truncatedId = userId.substring(0, 8) + '...';
    userEmailCache[userId] = truncatedId;
    return truncatedId;
  } catch (error) {
    console.error("Exception getting user email:", error);
    // Return truncated user ID in case of error
    const truncatedId = userId.substring(0, 8) + '...';
    userEmailCache[userId] = truncatedId;
    return truncatedId;
  }
};

// Helper function to mask email for privacy
const maskEmail = (email: string): string => {
  try {
    const [username, domain] = email.split('@');
    
    if (!username || !domain) {
      return email; // Return original if splitting fails
    }
    
    // Show first 3 characters of username or fewer if username is shorter
    const visibleLength = Math.min(3, username.length);
    const maskedUsername = username.substring(0, visibleLength) + 
      (username.length > visibleLength ? '***' : '');
    
    return `${maskedUsername}@${domain}`;
  } catch (e) {
    console.error("Error masking email:", e);
    return email; // Return original in case of error
  }
};
