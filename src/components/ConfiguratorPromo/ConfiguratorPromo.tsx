import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Cpu, MemoryStick, Fan, MonitorPlay, MessageCircle } from 'lucide-react';

export default function ConfiguratorPromo() {
  return (
    <section style={{ padding: '40px 24px', backgroundColor: 'transparent', position: 'relative', zIndex: 10 }}>
      <div style={{ maxWidth: 'var(--container)', margin: '0 auto', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Left Card: Custom PC */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ 
            flex: '1 1 600px', 
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 32px',
            display: 'flex',
            gap: '32px',
            flexWrap: 'wrap',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle background glow */}
          <div style={{
            position: 'absolute', top: '-50%', left: '-10%', width: '60%', height: '150%',
            background: 'radial-gradient(circle at center, rgba(0, 240, 255, 0.05) 0%, transparent 60%)',
            pointerEvents: 'none', zIndex: 0
          }} />

          {/* PC Image */}
          <div style={{ flex: '0 0 220px', position: 'relative', zIndex: 1 }}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <img 
                src="/images/transparent_pc_case.png" 
                alt="Custom PC Build" 
                style={{ width: '100%', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.5))' }}
              />
            </motion.div>
          </div>

          {/* Text and Button */}
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 1 }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }} className="text-gradient">
                Custom PC
              </div>
              <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', lineHeight: 1.1, marginBottom: '12px' }}>
                Собери свой<br/>
                <span style={{ color: 'var(--violet)' }}>ПК</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, maxWidth: '280px' }}>
                Любой бюджет, стиль корпуса и комплектующие под твои игры, работу и монитор.
              </p>
            </div>
            
            <a 
              href="#custom"
              style={{
              background: '#1a1a1a',
              color: '#ffffff',
              border: '1px solid #333333',
              padding: '12px 24px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'none',
              alignSelf: 'flex-start',
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.borderColor = '#555555'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.borderColor = '#333333'; }}
            >
              Собрать ПК 
              <span style={{ fontSize: '1.2rem', transform: 'translateY(-1px)' }}>→</span>
            </a>
          </div>

          {/* Components List */}
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 1 }}>
            {[
              { icon: <MonitorPlay size={18} />, title: 'ВИДЕОКАРТА', desc: 'NVIDIA RTX / AMD Radeon RX', progress: 0.85, color: '#00f0ff' },
              { icon: <Cpu size={18} />, title: 'ПРОЦЕССОР', desc: 'Intel Core i5-i9 / AMD Ryzen 3-9', progress: 0.75, color: '#00f0ff' },
              { icon: <MemoryStick size={18} />, title: 'ПАМЯТЬ', desc: '16-128 ГБ DDR4 / DDR5', progress: 0.65, color: '#00f0ff' },
              { icon: <Fan size={18} />, title: 'ОХЛАЖДЕНИЕ', desc: 'Кастомные СЖО / Топовые башни', progress: 0.9, color: '#00f0ff' },
            ].map((item, idx) => (
              <div key={idx} style={{ 
                background: 'var(--bg-card-soft)', 
                border: '1px solid var(--border-soft)',
                borderRadius: '10px',
                padding: '12px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  background: 'rgba(0, 229, 255, 0.08)', 
                  color: 'var(--cyan)',
                  padding: '8px', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '2px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', minHeight: '1.2em' }}>
                    <TypewriterText text={item.desc} delay={500 + idx * 200} speed={40} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Card: Help me choose */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ 
            flex: '1 1 300px', 
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <h3 style={{ fontSize: '1.4rem', lineHeight: 1.2, textTransform: 'uppercase', marginBottom: '12px' }}>
            НЕ<br/>
            РАЗБИРАЕШЬСЯ В<br/>
            КОМПЛЕКТУЮЩИХ?
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '24px' }}>
            Напиши нам, подберём лучшее решение под цели и бюджет.
          </p>

          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SocialButton 
              icon={<MessageCircle size={20} />} 
              label="ВКонтакте" 
              bg="#0077FF" 
              color="#fff" 
              href="https://vk.com/togoshol"
            />
            <SocialButton 
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" x2="11" y1="2" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              } 
              label="Telegram" 
              bg="#2AABEE" 
              color="#fff" 
              href="https://t.me/togoshol"
            />
            <SocialButton 
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
              } 
              label="Instagram" 
              bg="linear-gradient(90deg, #F58529, #DD2A7B, #8134AF)" 
              color="#fff" 
              href="https://instagram.com/togoshol"
            />
          </div>
        </motion.div>

      </div>
    </section>
  )
}

function SocialButton({ icon, label, bg, color, href }: { icon: React.ReactNode, label: string, bg: string, color: string, href?: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: bg,
        color: color,
        border: 'none',
        borderRadius: '12px',
        padding: '12px 20px',
        fontSize: '1rem',
        fontWeight: 800,
        cursor: 'pointer',
        textDecoration: 'none',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}
    >
      <div style={{ width: '20px', display: 'flex', justifyContent: 'center' }}>
        {icon}
      </div>
      <div style={{ flex: 1, textAlign: 'left' }}>
        {label}
      </div>
    </motion.a>
  )
}

function TypewriterText({ text, delay = 0, speed = 40 }: { text: string; delay?: number, speed?: number }) {
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;
    
    let currentIdx = 0;
    setIndex(0);
    
    let intervalId: ReturnType<typeof setInterval>;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        currentIdx++;
        setIndex(currentIdx);
        if (currentIdx >= text.length) {
          clearInterval(intervalId);
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, delay, isInView]);

  return (
    <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center' }}>
      {text.slice(0, index)}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        style={{ 
          display: 'inline-block', 
          width: '2px', 
          height: '1.2em', 
          background: 'var(--cyan)', 
          marginLeft: '4px' 
        }}
      />
    </span>
  );
}
