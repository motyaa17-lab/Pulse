import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor shell for Pulse (@pulse/web).
 *
 * Рекомендуемый режим для Next.js с динамическими маршрутами (`/chats/[chatId]` и т.д.):
 * WebView должен грузить публичный HTTPS-URL (а не статическую папку), иначе статический export
 * сломается на динамических страницах.
 *
 * Пример (Windows PowerShell): `$env:CAPACITOR_SERVER_URL="https://pulse.example.com"; npx cap sync`
 */
const serverUrl = (process.env.CAPACITOR_SERVER_URL ?? 'https://pulseweb-beta.vercel.app').replace(
  /\/$/,
  '',
);

const config: CapacitorConfig = {
  appId: 'chat.pulse.app',
  appName: 'Pulse',
  webDir: 'www',
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: 'automatic',
  },
  server: {
    url: serverUrl,
    cleartext: serverUrl.startsWith('http://'),
    // Allow navigation to API / media hosts if the app opens them directly.
    allowNavigation: [
      '*.up.railway.app',
      'pulse-production-b6ff.up.railway.app',
      'pulseweb-beta.vercel.app',
    ],
  },
};

export default config;
