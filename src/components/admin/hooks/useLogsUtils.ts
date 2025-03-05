
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
