import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"; // Cloudflare test key fallback

// Props:
// - onToken(token: string): called when a token is issued
// - onExpire(): optional, called when token expires
// - theme: "auto" | "light" | "dark"
export default function TurnstileWidget({ onToken, onExpire, theme = "auto" }) {
  const widgetRef = useRef(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    const renderWidget = () => {
      if (!mounted) return;
      if (!widgetRef.current) return;
      if (renderedRef.current) return;
      if (!window.turnstile || !window.turnstile.render) return;

      window.turnstile.render(widgetRef.current, {
        sitekey: SITE_KEY,
        theme,
        callback: (token) => {
          onToken?.(token);
        },
        'expired-callback': () => {
          onExpire?.();
          onToken?.("");
        },
      });
      renderedRef.current = true;
    };

    // Load script if not present
    const ensureScript = () => {
      if (window.turnstile && window.turnstile.render) {
        renderWidget();
        return;
      }
      const existing = document.querySelector('script[data-turnstile]');
      if (existing) {
        existing.addEventListener('load', renderWidget);
        return;
      }
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      s.async = true;
      s.defer = true;
      s.setAttribute('data-turnstile', 'true');
      s.addEventListener('load', renderWidget);
      document.head.appendChild(s);
    };

    ensureScript();

    return () => {
      mounted = false;
    };
  }, [onToken, onExpire, theme]);

  return (
    <div
      ref={widgetRef}
      className="cf-turnstile"
      data-sitekey={SITE_KEY}
      data-theme={theme}
      style={{ display: 'inline-block' }}
    />
  );
}

TurnstileWidget.propTypes = {
  onToken: PropTypes.func,
  onExpire: PropTypes.func,
  theme: PropTypes.oneOf(["auto", "light", "dark"]),
};
