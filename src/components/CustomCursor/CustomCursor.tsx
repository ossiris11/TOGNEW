import { useEffect, useRef } from 'react';
import './CustomCursor.css';

interface Particle {
  x: number;
  y: number;
  char: string;
  life: number;
  maxLife: number;
  size: number;
  velocityX: number;
  velocityY: number;
}

export function CustomCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -100, y: -100 });
  const chars = '01'; // Matrix binary

  useEffect(() => {
    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouseRef.current.x;
      const dy = e.clientY - mouseRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Spawn particles based on distance moved to create a continuous trail
      if (dist > 5) {
        particlesRef.current.push({
          x: e.clientX,
          y: e.clientY,
          char: chars[Math.floor(Math.random() * chars.length)],
          life: 1,
          maxLife: 1,
          size: Math.random() * 10 + 10,
          velocityX: (Math.random() - 0.5) * 1,
          velocityY: Math.random() * 2 + 1, // falls down like matrix rain
        });
        mouseRef.current.x = e.clientX;
        mouseRef.current.y = e.clientY;
      }
    };
    window.addEventListener('mousemove', onMouseMove);

    let animationFrameId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 0.02; // Fade out speed
        p.x += p.velocityX;
        p.y += p.velocityY;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.font = `${p.size}px monospace`;
        ctx.fillStyle = `rgba(0, 255, 204, ${p.life})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffcc';
        ctx.fillText(p.char, p.x, p.y);
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="matrix-cursor-canvas" />;
}
