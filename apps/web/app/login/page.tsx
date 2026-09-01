"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Eye, EyeOff, Check } from "lucide-react";

declare global {
  interface Window {
    google: any;
    FB: any;
    fbAsyncInit: any;
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<Date | null>(null);
  const [lockCount, setLockCount] = useState(0);
  const [isPermanentlyLocked, setIsPermanentlyLocked] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [facebookSdkReady, setFacebookSdkReady] = useState(false);
  
  // Ref to track Google GIS initialization status
  const googleInitialized = useRef(false);

  // Google credential handler with stable reference
  const handleGoogleCredential = useCallback(async (response: any) => {
    setGoogleLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: response.credential, rememberMe }),
      });

      const data = await res.json();

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Save or remove email based on rememberMe
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        if (
          data.user.role === "SUPER_ADMIN" ||
          data.user.role === "CONTENT_ADMIN"
        ) {
          router.push("/admin");
        } else if (!data.user.firstLoginCompleted) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Đăng nhập Google thất bại");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setGoogleLoading(false);
    }
  }, [rememberMe, email, router]);

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Countdown timer for lock
  useEffect(() => {
    if (isLocked && lockedUntil && !isPermanentlyLocked) {
      const interval = setInterval(() => {
        const now = Date.now();
        if (lockedUntil.getTime() <= now) {
          setIsLocked(false);
          setLockedUntil(null);
          setRemainingAttempts(null);
          setLockCount(0);
          setError("");
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLocked, lockedUntil, isPermanentlyLocked]);

  // Load Google Identity Services script and initialize once
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (clientId && clientId !== "your-google-client-id.apps.googleusercontent.com" && window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredential,
        });
        googleInitialized.current = true;
      }
    };

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
      // Reset Google GIS initialization when component unmounts
      if (window.google && window.google.accounts) {
        window.google.accounts.id.cancel();
      }
      googleInitialized.current = false;
    };
  }, [handleGoogleCredential]);

  // Load Facebook JS SDK
  useEffect(() => {
    console.log('=== Facebook SDK Loading Debug ===');
    console.log('Current URL:', window.location.href);
    console.log('Protocol:', window.location.protocol);
    console.log('Host:', window.location.host);
    console.log('Facebook App ID:', process.env.NEXT_PUBLIC_FACEBOOK_APP_ID);

    // Define fbAsyncInit globally - called by Facebook SDK when loaded
    window.fbAsyncInit = function () {
      console.log('fbAsyncInit called');
      console.log('window.FB exists:', !!window.FB);
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || "",
        cookie: true,
        xfbml: true,
        version: "v20.0",
      });
      console.log('FB.init called');
      setFacebookSdkReady(true);
      console.log('facebookSdkReady set to true');
    };

    // Load Facebook SDK script
    console.log('Creating Facebook SDK script element');
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/vi_VN/sdk.js';
    script.async = true;
    script.onload = () => console.log('Facebook SDK script loaded');
    script.onerror = () => console.error('Facebook SDK script failed to load');
    document.head.appendChild(script);
    console.log('Facebook SDK script inserted into DOM');

    // Cleanup on unmount
    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
      delete window.fbAsyncInit;
    };
  }, []);

  function loginWithGoogle() {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "your-google-client-id.apps.googleusercontent.com") {
      setError("Chưa cấu hình Google Client ID. Vui lòng điền NEXT_PUBLIC_GOOGLE_CLIENT_ID vào .env.local");
      return;
    }

    if (!window.google) {
      setError("Google SDK chưa tải xong. Vui lòng thử lại.");
      return;
    }

    if (!googleInitialized.current) {
      setError("Google GIS chưa được khởi tạo. Vui lòng tải lại trang.");
      return;
    }

    // Render button and trigger it programmatically
    const buttonDiv = document.getElementById("google-signin-btn-login");
    if (buttonDiv) {
      window.google.accounts.id.renderButton(buttonDiv, {
        theme: "outline",
        size: "large",
        width: buttonDiv.offsetWidth,
      });
      buttonDiv.click();
    }
  }

  function loginWithFacebook() {
    const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
    if (!appId || appId === "your-facebook-app-id") {
      setError("Chưa cấu hình Facebook App ID. Vui lòng điền NEXT_PUBLIC_FACEBOOK_APP_ID vào .env.local");
      return;
    }

    if (!window.FB) {
      setError("Facebook SDK chưa tải xong. Vui lòng thử lại.");
      return;
    }

    // Check if running on HTTPS
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:') {
      setError("Facebook Login yêu cầu HTTPS. Vui lòng chạy development server với HTTPS tunnel (ngrok/localtunnel).");
      return;
    }

    window.FB.login(function (response: any) {
      if (response.authResponse) {
        handleFacebookCredential(response.authResponse.accessToken);
      } else {
        setError("Đăng nhập Facebook bị huỷ.");
      }
    }, { scope: 'public_profile,email' });
  }

  async function handleFacebookCredential(accessToken: string) {
    setFacebookLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/auth/facebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken, rememberMe }),
      });

      const data = await res.json();

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        // Save or remove email based on rememberMe
        if (rememberMe) {
          localStorage.setItem("rememberedEmail", data.user.email);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        if (
          data.user.role === "SUPER_ADMIN" ||
          data.user.role === "CONTENT_ADMIN"
        ) {
          router.push("/admin");
        } else if (!data.user.firstLoginCompleted) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Đăng nhập Facebook thất bại");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setFacebookLoading(false);
    }
  }

  async function loginWithApple() {
    setAppleLoading(true);
    setError("");
    try {
      // Mock / Real Apple token flow
      const mockApplePayload = {
        idToken: "mock_apple_token." + Buffer.from(JSON.stringify({ sub: "apple_" + Date.now(), email: "apple_user@icloud.com" })).toString("base64") + ".sig",
        user: { name: { firstName: "Apple", lastName: "Learner" } },
        rememberMe,
      };

      const res = await fetch("http://localhost:3001/auth/apple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mockApplePayload),
      });

      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role === "SUPER_ADMIN" || data.user.role === "CONTENT_ADMIN") {
          router.push("/admin");
        } else if (!data.user.firstLoginCompleted) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Đăng nhập Apple thất bại");
      }
    } catch {
      setError("Lỗi kết nối Apple Sign In. Vui lòng thử lại.");
    } finally {
      setAppleLoading(false);
    }
  }

  async function loginWithMicrosoft() {
    setMicrosoftLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/auth/microsoft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: "mock_microsoft_token_" + Date.now(),
          rememberMe,
        }),
      });

      const data = await res.json();
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.user.role === "SUPER_ADMIN" || data.user.role === "CONTENT_ADMIN") {
          router.push("/admin");
        } else if (!data.user.firstLoginCompleted) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(data.message || "Đăng nhập Microsoft thất bại");
      }
    } catch {
      setError("Lỗi kết nối Microsoft. Vui lòng thử lại.");
    } finally {
      setMicrosoftLoading(false);
    }
  }

  async function login() {
    setError("");
    setRemainingAttempts(null);
    setIsLocked(false);
    setLockedUntil(null);
    setLockCount(0);
    setIsPermanentlyLocked(false);

    const res = await fetch(
      "http://localhost:3001/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          rememberMe,
        }),
      }
    );

    const data = await res.json();

    if (data.requiresVerification) {
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } else if (data.accessToken) {
      // Lưu JWT
      localStorage.setItem("accessToken", data.accessToken);

      // Lưu thông tin user
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Save or remove email based on rememberMe
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      if (
        data.user.role === "SUPER_ADMIN" ||
        data.user.role === "CONTENT_ADMIN"
      ) {
        router.push("/admin");
      } else if (!data.user.firstLoginCompleted) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } else {
      setError(data.message || "Đăng nhập thất bại");

      // Handle remaining attempts and lock status
      if (data.remainingAttempts !== undefined) {
        setRemainingAttempts(data.remainingAttempts);
      }
      if (data.locked) {
        setIsLocked(true);
        setLockedUntil(data.lockedUntil ? new Date(data.lockedUntil) : null);
        setLockCount(data.lockCount || 1);
        setIsPermanentlyLocked(data.isPermanentlyLocked || false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-red-600">

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-4xl font-bold text-white">
            B
          </div>
        </div>

        <h1 className="text-4xl font-bold text-center text-white">
          BELLA
        </h1>

        <p className="text-center text-zinc-400 mt-2 mb-8">
          Đăng nhập hệ thống
        </p>

        {/* Error message */}
        {error && (
          <div className={`w-full p-3 rounded-xl border text-sm mb-4 ${
            isLocked
              ? "bg-orange-600/20 border-orange-600/40 text-orange-400"
              : "bg-red-600/20 border-red-600/40 text-red-400"
          }`}>
            {error}
          </div>
        )}

        {/* Remaining attempts indicator */}
        {remainingAttempts !== null && remainingAttempts > 0 && !isLocked && (
          <div className="w-full p-3 rounded-xl bg-yellow-600/20 border border-yellow-600/40 text-yellow-400 text-sm mb-4">
            Số lần thử còn lại: {remainingAttempts}/5
          </div>
        )}

        {/* Lock countdown */}
        {isLocked && lockedUntil && !isPermanentlyLocked && (
          <div className="w-full p-3 rounded-xl bg-orange-600/20 border border-orange-600/40 text-orange-400 text-sm mb-4">
            <div className="font-semibold mb-1">
              Tài khoản bị khóa lần thứ {lockCount}
            </div>
            <div>
              Mở khóa sau: {Math.ceil((lockedUntil.getTime() - Date.now()) / 60000)} phút
            </div>
            <div className="text-xs mt-1 opacity-75">
              {lockCount === 1 && "Lần vi phạm đầu tiên"}
              {lockCount === 2 && "Thời gian khóa tăng lên 30 phút"}
              {lockCount === 3 && "Thời gian khóa tăng lên 1 giờ"}
              {lockCount === 4 && "Thời gian khóa tăng lên 2 giờ"}
              {lockCount >= 5 && "Thời gian khóa tối đa 4 giờ"}
            </div>
          </div>
        )}

        {/* Permanent lock message */}
        {isLocked && isPermanentlyLocked && (
          <div className="w-full p-4 rounded-xl bg-red-600/20 border border-red-600/40 text-red-400 text-sm mb-4">
            <div className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Tài khoản đã bị khóa vĩnh viễn</span>
            </div>
            <div className="text-xs mb-3">
              Tài khoản của bạn đã bị khóa do hoạt động đăng nhập bất thường liên tục.
            </div>
            <button
              onClick={() => router.push(`/unlock-request?email=${encodeURIComponent(email)}`)}
              className="w-full bg-red-600 hover:bg-red-700 transition text-white font-semibold py-2 rounded-lg text-sm"
            >
              Gửi yêu cầu mở khóa
            </button>
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          id="google-signin-btn-login"
          onClick={loginWithGoogle}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 disabled:bg-gray-200 transition text-gray-800 font-semibold py-3.5 rounded-xl mb-4 shadow-sm"
        >
          {googleLoading ? (
            <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{googleLoading ? "Đang xử lý..." : "Đăng nhập bằng Google"}</span>
        </button>

        {/* Facebook OAuth Button */}
        <button
          onClick={loginWithFacebook}
          disabled={facebookLoading || googleLoading || !facebookSdkReady}
          className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] disabled:bg-[#7baaf7] disabled:opacity-50 transition text-white font-semibold py-3.5 rounded-xl mb-3 shadow-sm"
        >
          {facebookLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          )}
          <span>{facebookLoading ? "Đang xử lý..." : !facebookSdkReady ? "Đang tải Facebook SDK..." : "Đăng nhập bằng Facebook"}</span>
        </button>

        {/* Apple Sign In & Microsoft Account Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Apple Button */}
          <button
            type="button"
            onClick={loginWithApple}
            disabled={appleLoading}
            className="flex items-center justify-center gap-2 bg-black border border-zinc-700 hover:bg-zinc-900 transition text-white font-semibold py-3 rounded-xl text-xs shadow-sm"
          >
            <span className="text-base font-bold"></span>
            <span>{appleLoading ? "Đang xử lý..." : "Apple Sign In"}</span>
          </button>

          {/* Microsoft Button */}
          <button
            type="button"
            onClick={loginWithMicrosoft}
            disabled={microsoftLoading}
            className="flex items-center justify-center gap-2 bg-zinc-800 border border-zinc-700 hover:bg-zinc-750 transition text-white font-semibold py-3 rounded-xl text-xs shadow-sm"
          >
            <svg className="h-4 w-4" viewBox="0 0 21 21">
              <rect x="1" y="1" width="9" height="9" fill="#f25022" />
              <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
              <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
              <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
            </svg>
            <span>{microsoftLoading ? "Đang xử lý..." : "Microsoft"}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-zinc-700"></div>
          <span className="text-zinc-500 text-sm">hoặc</span>
          <div className="flex-1 h-px bg-zinc-700"></div>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full p-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 mb-4 focus:outline-none focus:border-red-500"
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            onKeyDown={(e) => e.key === "Enter" && login()}
            className="w-full p-4 pr-12 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-red-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center w-5 h-5 rounded border border-zinc-600 bg-zinc-800 group-hover:border-red-500 transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="absolute opacity-0 cursor-pointer w-full h-full"
              />
              {rememberMe && (
                <Check className="w-3.5 h-3.5 text-red-500 pointer-events-none" />
              )}
            </div>
            <span className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">
              Ghi nhớ đăng nhập
            </span>
          </label>
          <a
            href="/forgot-password"
            className="text-sm text-red-500 hover:text-red-400 transition"
          >
            Quên mật khẩu?
          </a>
        </div>

        <button
          onClick={login}
          disabled={isLocked}
          className={`w-full transition text-white font-bold py-4 rounded-xl ${
            isLocked
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {isLocked ? "Tài khoản bị khóa" : "Đăng nhập"}
        </button>

        <p className="text-center text-zinc-400 mt-6">
          Chưa có tài khoản?
          <a
            href="/register"
            className="text-red-500 ml-2"
          >
            Đăng ký
          </a>
        </p>
      </div>
    </div>
  );
}