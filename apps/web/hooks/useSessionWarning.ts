import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useSessionWarning() {
  const router = useRouter();
  const [sessionWarning, setSessionWarning] = useState<{ show: boolean; minutesLeft: number } | null>(null);

  useEffect(() => {
    const checkSessionExpiration = () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // Decode JWT to get expiration time
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000; // Convert to milliseconds
        const now = Date.now();
        const timeLeft = exp - now;

        // Show warning if less than 5 minutes remaining
        if (timeLeft > 0 && timeLeft < 5 * 60 * 1000) {
          const minutesLeft = Math.ceil(timeLeft / (60 * 1000));
          setSessionWarning({ show: true, minutesLeft });
        } else {
          setSessionWarning(null);
        }

        // Auto logout if expired
        if (timeLeft <= 0) {
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          router.push("/login");
        }
      } catch (error) {
        console.error("Error checking session expiration:", error);
      }
    };

    // Check immediately
    checkSessionExpiration();

    // Check every 30 seconds
    const interval = setInterval(checkSessionExpiration, 30000);

    return () => clearInterval(interval);
  }, [router]);

  const dismissWarning = () => {
    setSessionWarning(null);
  };

  return {
    sessionWarning,
    dismissWarning,
  };
}
