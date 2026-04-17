export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-black text-white">
      {/* Fullscreen background "image" (SVG data-URI), cover-fit */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='900'%3E%3Cdefs%3E%3CradialGradient id='g1' cx='30%25' cy='25%25' r='70%25'%3E%3Cstop offset='0%25' stop-color='%233B82F6' stop-opacity='0.95'/%3E%3Cstop offset='55%25' stop-color='%230B1020' stop-opacity='0.85'/%3E%3Cstop offset='100%25' stop-color='%23000000' stop-opacity='1'/%3E%3C/radialGradient%3E%3CradialGradient id='g2' cx='78%25' cy='60%25' r='65%25'%3E%3Cstop offset='0%25' stop-color='%2334D399' stop-opacity='0.75'/%3E%3Cstop offset='55%25' stop-color='%230B1020' stop-opacity='0.6'/%3E%3Cstop offset='100%25' stop-color='%23000000' stop-opacity='1'/%3E%3C/radialGradient%3E%3ClinearGradient id='grain' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23ffffff' stop-opacity='0.06'/%3E%3Cstop offset='1' stop-color='%23000000' stop-opacity='0.06'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1600' height='900' fill='url(%23g1)'/%3E%3Crect width='1600' height='900' fill='url(%23g2)'/%3E%3Cpath d='M0 720 C 320 600 560 820 800 720 C 1040 620 1240 820 1600 700 L1600 900 L0 900 Z' fill='%230A0F1E' fill-opacity='0.55'/%3E%3Crect width='1600' height='900' fill='url(%23grain)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* Dark overlay for readability */}
      <div aria-hidden className="absolute inset-0 bg-black/55" />

      {/* Centered content */}
      <div className="relative mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4 py-12 sm:px-6">
        {children}
      </div>
    </div>
  );
}
