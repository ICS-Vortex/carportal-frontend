"use client";

import Script from "next/script";
import { useEffect, useId, useRef, useState } from "react";

import { useToast } from "@/components/shared/toast-provider";
import { GOOGLE_CLIENT_ID, getApiErrorMessage, loginWithGoogle } from "@/lib/api";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, config: Record<string, string>) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

type GoogleSignInProps = {
  onSuccess: () => Promise<void>;
  onStatus: (message: string) => void;
};

export function GoogleSignIn({ onSuccess, onStatus }: GoogleSignInProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const id = useId();
  const toast = useToast();

  useEffect(() => {
    if (!loaded || !GOOGLE_CLIENT_ID || !window.google || !buttonRef.current) {
      return;
    }

    buttonRef.current.innerHTML = "";
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        if (!response.credential) {
          onStatus("Google не повернув токен авторизації.");
          toast.error("Google не повернув токен авторизації.");
          return;
        }

        onStatus("Підтверджуємо Google-профіль...");

        try {
          await loginWithGoogle(response.credential);
          await onSuccess();
          onStatus("Вхід через Google виконано.");
          toast.success("Вхід через Google виконано.");
        } catch (error) {
          const message = getApiErrorMessage(error);
          onStatus(message);
          toast.error(message);
        }
      }
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      text: "continue_with",
      shape: "pill",
      logo_alignment: "left"
    });

    return () => {
      window.google?.accounts.id.cancel();
    };
  }, [loaded, onStatus, onSuccess, toast]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        type="button"
        disabled
        className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white/60"
      >
        Додайте NEXT_PUBLIC_GOOGLE_CLIENT_ID для Google входу
      </button>
    );
  }

  return (
    <>
      <Script
        id={`google-identity-${id}`}
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
      />
      <div ref={buttonRef} className="min-h-11" />
    </>
  );
}
