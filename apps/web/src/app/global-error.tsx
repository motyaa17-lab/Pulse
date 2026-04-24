'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[pulse] Global error boundary caught', error);
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' }}>
        <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            Приложение упало при загрузке
          </h2>
          <p style={{ marginTop: 12, marginBottom: 0, color: '#444' }}>
            Откройте консоль браузера и пришлите первую ошибку со стеком — так мы быстро найдём
            точную строку.
          </p>
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              background: '#f6f6f6',
              borderRadius: 8,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontSize: 12,
              lineHeight: 1.35,
            }}
          >
            {String(error?.message ?? error)}
            {error?.digest ? `\n\nDigest: ${error.digest}` : ''}
          </pre>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #ddd',
                background: 'white',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Попробовать ещё раз
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                border: '1px solid #ddd',
                background: 'white',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Перезагрузить страницу
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
