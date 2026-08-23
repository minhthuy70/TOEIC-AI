import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIMEOUT = 5 * 60 * 1000; // 5 minutes before logout

export function useAutoLogout() {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const resetTimers = () => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    setShowWarning(false);

    // Set new warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(WARNING_TIMEOUT / 1000); // 5 minutes in seconds

      // Countdown timer
      const countdownInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Store interval ID to clear on reset
      warningTimeoutRef.current = setTimeout(() => {
        clearInterval(countdownInterval);
        logout();
      }, WARNING_TIMEOUT);
    }, INACTIVITY_TIMEOUT - WARNING_TIMEOUT);

    // Set new logout timeout
    timeoutRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  const handleStayLoggedIn = () => {
    resetTimers();
  };

  const handleLogoutNow = () => {
    logout();
  };

  useEffect(() => {
    // Only run if user is logged in
    const user = localStorage.getItem('user');
    if (!user) {
      return;
    }

    const handleActivity = () => {
      resetTimers();
    };

    // Set up activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Initial timer setup
    resetTimers();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [router]);

  return {
    showWarning,
    timeRemaining,
    handleStayLoggedIn,
    handleLogoutNow,
  };
}