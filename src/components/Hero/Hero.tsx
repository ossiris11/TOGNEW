import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './Hero.module.css';

gsap.registerPlugin(ScrollTrigger);

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    // Parallax effect for the hero content
    const ctx = gsap.context(() => {
      gsap.to(textRef.current, {
        y: 50,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className={styles.hero}>
      {/* Abstract Aurora Background */}
      <div className={styles.auroraBackground}>
        <div className={styles.auroraGradient} />
      </div>

      <div className={styles.content} ref={textRef}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className={styles.badge}>НОВОЕ ПОКОЛЕНИЕ</span>
        </motion.div>
        
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          ИГРОВЫЕ ПК<br />
          БЕЗ КОМПРОМИССОВ
          <span className={styles.visuallyHidden}> в Великом Новгороде</span>
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Мощность, тишина и эстетика, доведенные до абсолюта.
          Собрано профессионалами для максимального FPS в Великом Новгороде.
        </motion.p>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <a href="#catalog" className={styles.shimmerButton}>
            <span className={styles.shimmerText}>Выбрать сборку</span>
            <div className={styles.shimmerEffect} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
