'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

export interface GridBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: string;
  size?: number;
  opacity?: number;
}

const GridBackground = React.forwardRef<HTMLDivElement, GridBackgroundProps>(
  (
    {
      className,
      color = 'white',
      size = 24,
      opacity = 0.03,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        {...props}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity,
            backgroundImage: `radial-gradient(circle at 1px 1px, ${color} 1px, transparent 1px)`,
            backgroundSize: `${size}px ${size}px`,
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }
);
GridBackground.displayName = 'GridBackground';

export interface ParticleFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  color?: string;
  speed?: number;
  connected?: boolean;
}

const ParticleField = React.forwardRef<HTMLDivElement, ParticleFieldProps>(
  (
    {
      className,
      count = 50,
      color = 'rgba(20,184,166,0.3)',
      speed = 0.3,
      connected = true,
      ...props
    },
    ref
  ) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);

    React.useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const resizeCanvas = () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      interface Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        size: number;
      }

      const particles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: Math.random() * 1.5 + 0.5,
        });
      }

      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();

          if (connected) {
            particles.slice(i + 1).forEach((p2) => {
              const dx = p.x - p2.x;
              const dy = p.y - p2.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 120) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p2.x, p2.y);
                const lineOpacity = 0.15 * (1 - dist / 120);
                ctx.strokeStyle = color.replace(/[\d.]+\)$/, `${lineOpacity})`);
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            });
          }
        });

        requestAnimationFrame(animate);
      };

      const animationId = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resizeCanvas);
      };
    }, [count, color, speed, connected]);

    return (
      <div
        ref={ref}
        className={cn('absolute inset-0 pointer-events-none', className)}
        {...props}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>
    );
  }
);
ParticleField.displayName = 'ParticleField';

export { GridBackground, ParticleField };
