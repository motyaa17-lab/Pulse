import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor shell for Pulse (@pulse/web).
 *
 * Рекомендуемый режим для Next.js с динамическими маршрутами (`/chats/[chatId]` и т.д.):
 * укажите публичный HTTPS-URL продакшена в `CAPACITOR_SERVER_URL` — WebView будет грузить сайт,
 * а не статическую папку `www`.
 *
 * Пример (Windows PowerShell): `$env:CAPACITOR_SERVER_URL="https://pulse.example.com"; npx cap sync`
 */
const serverUrl = process.env.CAPACITOR_SERVER_URL?.replace(/\/$/, '');

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
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith('http://'),
        },
      }
    : {}),
};

export default config;
