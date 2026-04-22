import React, { useEffect, useRef, useState } from "react";

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    if (existing) {
      if (window.google?.accounts?.id) resolve();
      else {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
      }
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google script"));
    document.head.appendChild(script);
  });

export default function GoogleAuthSection({
  mode = "signin",
  onCredential,
  loading = false,
}) {
  const buttonRef = useRef(null);
  const initializedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    let active = true;

    if (!clientId) {
      setError("Google sign-in is not configured yet.");
      return undefined;
    }

    loadGoogleScript()
      .then(() => {
        if (!active || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: ({ credential }) => {
            if (credential) onCredential?.(credential);
          },
        });

        initializedRef.current = true;
        setReady(true);
      })
      .catch(() => {
        if (active) setError("Unable to load Google sign-in.");
      });

    return () => {
      active = false;
    };
  }, [clientId, onCredential]);

  useEffect(() => {
    if (!ready || !buttonRef.current || !initializedRef.current) return;

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(buttonRef.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: mode === "signup" ? "signup_with" : "signin_with",
      shape: "pill",
      width: Math.min(buttonRef.current.offsetWidth || 360, 360),
      logo_alignment: "left",
    });
  }, [mode, ready]);

  return (
    <div className={`google-auth-shell${loading ? " is-loading" : ""}`}>
      <div className="auth-divider">
        <span>{mode === "signup" ? "Create account faster" : "Continue instantly"}</span>
      </div>
      <div className="google-auth-card">
        <div className="google-auth-copy">
          <strong>Continue with Google</strong>
          <p>Use your Google account for a faster, secure sign-in.</p>
        </div>
        {error ? (
          <div className="google-auth-fallback">{error}</div>
        ) : (
          <div ref={buttonRef} className="google-button-slot" />
        )}
      </div>
      <div className="auth-divider auth-divider-bottom">
        <span>or continue with email</span>
      </div>
    </div>
  );
}
