import { apiFetch } from "./api";

/**
 * Unified Analytics Dispatcher for TOEIC AI Platform
 * Dispatches events to:
 * 1. Google Analytics 4 (gtag)
 * 2. Mixpanel (window.mixpanel)
 * 3. Amplitude (window.amplitude)
 * 4. Custom Internal Telemetry (POST /analytics/track)
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    mixpanel?: {
      track: (eventName: string, props?: Record<string, any>) => void;
      identify: (userId: string | number) => void;
    };
    amplitude?: {
      track: (eventName: string, props?: Record<string, any>) => void;
      setUserId: (userId: string | number) => void;
    };
  }
}

export function trackEvent(eventName: string, properties: Record<string, any> = {}) {
  // 1. Google Analytics 4
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, properties);
  }

  // 2. Mixpanel
  if (typeof window !== "undefined" && window.mixpanel && typeof window.mixpanel.track === "function") {
    window.mixpanel.track(eventName, properties);
  }

  // 3. Amplitude
  if (typeof window !== "undefined" && window.amplitude && typeof window.amplitude.track === "function") {
    window.amplitude.track(eventName, properties);
  }

  // 4. Custom Internal Analytics Engine
  try {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = userStr ? JSON.parse(userStr) : null;
    
    apiFetch("/analytics/track", {
      method: "POST",
      body: JSON.stringify({
        eventName,
        userId: user?.id || "guest",
        properties,
        platform: "web",
      }),
    }).catch(() => {
      // Non-blocking telemetry
    });
  } catch (err) {
    // Non-blocking
  }
}

export function identifyUser(userId: string | number, traits: Record<string, any> = {}) {
  if (typeof window !== "undefined" && window.mixpanel && typeof window.mixpanel.identify === "function") {
    window.mixpanel.identify(userId);
  }
  if (typeof window !== "undefined" && window.amplitude && typeof window.amplitude.setUserId === "function") {
    window.amplitude.setUserId(userId);
  }
}
