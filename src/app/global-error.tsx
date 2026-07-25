'use client';

/**
 * Catches errors thrown by the root layout itself (fonts, providers, etc.) —
 * a case error.tsx can't handle since it renders *inside* that layout.
 * Deliberately uses inline styles instead of Tailwind classes or the Logo
 * component: if the root layout broke, we don't want this fallback's own
 * rendering to depend on anything that might have broken with it.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f7f6f3',
          color: '#2b2c2c',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <h1 style={{ fontSize: '26px', fontWeight: 300, margin: 0 }}>Something went wrong</h1>
        <p style={{ marginTop: '12px', maxWidth: '400px', fontSize: '13.5px', color: '#8a8d8f', lineHeight: 1.6 }}>
          An unexpected error occurred while loading this page. Please try again.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: '24px',
            borderRadius: '999px',
            backgroundColor: '#2b2c2c',
            color: '#fff',
            padding: '14px 28px',
            fontSize: '13px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- deliberate: a hard reload, not client-side routing, since the root layout (and whatever powers it) is what just failed */}
        <a href="/" style={{ marginTop: '16px', fontSize: '12.5px', color: '#444646' }}>
          Back to homepage
        </a>
      </body>
    </html>
  );
}
