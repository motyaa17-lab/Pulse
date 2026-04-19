# Capacitor и Pulse (Next.js)

## Зачем два режима

- **Удалённый URL (рекомендуется сейчас)** — приложение в WebView открывает ваш задеплоенный сайт (HTTPS). Подходит для текущего Next.js с динамическими маршрутами (`/chats/[chatId]` и т.д.) без статического экспорта.
- **Локальная папка `www/`** — статические файлы внутри приложения. Для полного Next-приложения потребуется `output: 'export'` и отдельная стратегия для динамических страниц (или только «оболочка» с редиректом).

## Установка зависимостей

Из корня монорепозитория:

```bash
npm install -w @pulse/web
```

## Добавление платформ (один раз)

Из каталога `apps/web`:

```bash
cd apps/web
npx cap add android
npx cap add ios
```

iOS-требуется macOS с Xcode.

## Синхронизация с удалённым сервером

Укажите продакшен-URL (без завершающего `/`):

**PowerShell**

```powershell
$env:CAPACITOR_SERVER_URL="https://ваш-домен.com"
npx cap sync
```

**bash**

```bash
export CAPACITOR_SERVER_URL=https://ваш-домен.com
npx cap sync
```

Затем откройте нативный проект:

```bash
npm run cap:open:android
npm run cap:open:ios
```

## Локальная разработка с телефона

Подставьте IP машины в локальной сети и порт Next (3000). Для Android эмулятора часто используют `http://10.0.2.2:3000`. Для реального устройства — `http://192.168.x.x:3000`. Включите `cleartext` только для HTTP (уже выставляется, если URL начинается с `http://`).

## Иконки и splash

Сгенерируйте ресурсы, например:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate
```

Или положите иконки по [документации Capacitor](https://capacitorjs.com/docs/guides/splash-screens-and-icons).

## Ссылки для сторов

Публичные URL приложения:

- Политика конфиденциальности: `https://ваш-домен.com/privacy`
- Условия использования: `https://ваш-домен.com/terms`

Замените плейсхолдеры `[…]` в текстах страниц перед подачей на модерацию.

## Идентификатор приложения

В `capacitor.config.ts` поле `appId` сейчас `chat.pulse.app`. Перед релизом замените на свой обратный DNS-идентификатор (например, `com.вашастудия.pulse`).
