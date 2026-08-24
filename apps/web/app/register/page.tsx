"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

declare global {
  interface Window {
    google: any;
    FB: any;
    fbAsyncInit: any;
  }
}

export default function RegisterPage() {
  console.log('=== RegisterPage rendered ===');
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
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
        body: JSON.stringify({ idToken: response.credential }),
      });

      const data = await res.json();

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));

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
        setError(data.message || "Đăng ký Google thất bại");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setGoogleLoading(false);
    }
  }, [router]);

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
    const buttonDiv = document.getElementById("google-signin-btn-register");
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
        body: JSON.stringify({ accessToken }),
      });

      const data = await res.json();

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.user));

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
        setError(data.message || "Đăng ký Facebook thất bại");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setFacebookLoading(false);
    }
  }

  function calculatePasswordStrength(pass: string) {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return Math.min(4, score);
  }

  async function register() {
    setError("");

    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên");
      return;
    }
    if (!email.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!agreeAll) {
      setError("Vui lòng đồng ý với Điều khoản sử dụng và Chính sách bảo mật");
      return;
    }

    const res = await fetch(
      "http://localhost:3001/auth/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      }
    );

    const data = await res.json();

    if (data.requiresVerification) {
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } else if (data.id) {
      router.push("/login");
    } else {
      setError(data.message || "Đăng ký thất bại");
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 shadow-2xl border border-red-600">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-600 flex items-center justify-center text-4xl font-bold text-white">
            B
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-center text-white">
          BELLA
        </h1>

        <p className="text-center text-zinc-400 mt-2 mb-8">
          Tạo tài khoản TOEIC
        </p>

        {/* Error message */}
        {error && (
          <div className="w-full p-3 rounded-xl bg-red-600/20 border border-red-600/40 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Google OAuth Button */}
        <button
          id="google-signin-btn-register"
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
          <span>{googleLoading ? "Đang xử lý..." : "Đăng ký bằng Google"}</span>
        </button>

        {/* Facebook OAuth Button */}
        <button
          onClick={loginWithFacebook}
          disabled={facebookLoading || googleLoading || !facebookSdkReady}
          className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166FE5] disabled:bg-[#7baaf7] disabled:opacity-50 transition text-white font-semibold py-3.5 rounded-xl mb-4 shadow-sm"
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
          <span>{facebookLoading ? "Đang xử lý..." : !facebookSdkReady ? "Đang tải Facebook SDK..." : "Đăng ký bằng Facebook"}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-zinc-700"></div>
          <span className="text-zinc-500 text-sm">hoặc</span>
          <div className="flex-1 h-px bg-zinc-700"></div>
        </div>

        {/* Họ tên */}
        <input
          type="text"
          placeholder="Họ và tên"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 mb-4 focus:outline-none focus:border-red-500"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 text-white border border-zinc-700 mb-4 focus:outline-none focus:border-red-500"
        />

        {/* Password */}
        <div className="mb-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pr-12 rounded-xl bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:border-red-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M1 1l22 22" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
          {password && (
            <div className="flex gap-1 mt-2">
              {[...Array(4)].map((_, i) => {
                const strength = calculatePasswordStrength(password);
                const isActive = i < strength;
                let colorClass = "bg-zinc-700";
                if (isActive) {
                  if (strength === 1) colorClass = "bg-red-500";
                  else if (strength === 2) colorClass = "bg-orange-500";
                  else if (strength === 3) colorClass = "bg-yellow-500";
                  else colorClass = "bg-green-500";
                }
                return (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${colorClass}`}></div>
                );
              })}
            </div>
          )}
          {password && calculatePasswordStrength(password) < 2 && (
            <p className="text-xs text-zinc-500 mt-1">Mật khẩu yếu, nên thêm chữ hoa, số hoặc ký tự đặc biệt.</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="relative mb-4">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && register()}
            className={`w-full p-4 pr-12 rounded-xl bg-zinc-800 text-white border focus:outline-none transition ${
              confirmPassword && confirmPassword !== password
                ? "border-red-500"
                : confirmPassword && confirmPassword === password
                ? "border-green-500"
                : "border-zinc-700 focus:border-red-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 transition-colors"
          >
            {showConfirmPassword ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1 1l22 22" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </div>

        {/* Terms and Privacy Checkbox */}
        <label className="flex items-center gap-3 mb-6 cursor-pointer group">
          <div className="relative flex items-center justify-center w-5 h-5 rounded border border-zinc-600 bg-zinc-800 group-hover:border-red-500 transition-colors">
            <input
              type="checkbox"
              checked={agreeAll}
              onChange={(e) => setAgreeAll(e.target.checked)}
              className="absolute opacity-0 cursor-pointer w-full h-full"
            />
            {agreeAll && (
              <svg className="w-3.5 h-3.5 text-red-500 pointer-events-none" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-zinc-400 text-sm group-hover:text-zinc-300 transition-colors">
            Tôi đồng ý với <Link href="/terms" className="text-red-500 hover:underline">Điều khoản sử dụng</Link> và <Link href="/privacy" className="text-red-500 hover:underline">Chính sách bảo mật</Link>
          </span>
        </label>

        {/* Register Button */}
        <button
          onClick={register}
          className="w-full bg-red-600 hover:bg-red-700 transition text-white font-bold py-4 rounded-xl"
        >
          Đăng ký
        </button>

        <p className="text-center text-zinc-400 mt-6">
          Đã có tài khoản?
          <a href="/login" className="text-red-500 ml-2">
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}