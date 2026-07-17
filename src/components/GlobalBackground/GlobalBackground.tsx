import { useEffect, useRef } from 'react';
import './GlobalBackground.css';

class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * 2 + 0.5; // very small dust
    this.speedX = (Math.random() - 0.5) * 0.5;
    this.speedY = (Math.random() - 0.5) * 0.5 - 0.2; // slight upward drift
    this.opacity = Math.random() * 0.5 + 0.1;
    // Mostly cyan and deep blue
    this.color = Math.random() > 0.5 ? 'rgba(0, 229, 255,' : 'rgba(31, 107, 255,'; 
  }

  update(canvasWidth: number, canvasHeight: number) {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x < 0) this.x = canvasWidth;
    if (this.x > canvasWidth) this.x = 0;
    if (this.y < 0) this.y = canvasHeight;
    if (this.y > canvasHeight) this.y = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `${this.color}${this.opacity})`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = `${this.color}1)`;
    ctx.fill();
  }
}

export function GlobalBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particlesArray: Particle[] = [];
    let width = window.innerWidth;
    let height = window.innerHeight;

    const initParticles = () => {
      canvas.width = width;
      canvas.height = height;
      particlesArray = [];
      // Adjust density for full screen so it's not too crowded
      const numberOfParticles = (width * height) / 25000; 
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle(width, height));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update(width, height);
        particlesArray[i].draw(ctx);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      initParticles();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="global-particles-canvas" aria-hidden="true" />
  );
}
