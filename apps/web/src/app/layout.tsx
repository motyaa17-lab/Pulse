import type { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geist = Inter({ subsets: ['latin'], variable: '--font-geist' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'Pulse — calm, fast messaging',
  description: 'Pulse is a modern messenger for people who value clarity and speed.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  /** iOS Safari: lock page zoom (focus on small inputs, “stuck” zoom after navigation). App-like; users can still use OS accessibility zoom. */
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'overlays-content',
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0e1621' }, { color: '#f8fafc' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${outfit.variable} font-sans`}>
        <script
          // Apply theme/preset before paint to avoid a dark flash on navigation/hydration.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem('pulse-ui');var st=raw?JSON.parse(raw):null;var s=st&&st.state?st.state:{};var theme=s.theme||'system';var preset=s.visualPreset||'default';var root=document.documentElement;var isDark=(theme==='dark')||(theme==='system'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(isDark)root.classList.add('dark');else root.classList.remove('dark');if(preset&&preset!=='default')root.dataset.visualPreset=preset;else delete root.dataset.visualPreset;}catch(e){}})();`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
