'use client';

import {
  EvaFlickerOverlay,
  EvaGrainOverlay,
} from '@noverlink/ui-shared';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      {/* EVA Overlays */}
      <EvaGrainOverlay />
      <EvaFlickerOverlay />

      {/* Subtle ambient glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00ff00]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00ff00]/3 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
