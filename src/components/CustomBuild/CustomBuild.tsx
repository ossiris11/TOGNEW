import { useEffect, useMemo, useRef, useState } from 'react';
import { contacts } from '../../data/contacts';
import { useProducts } from '../../hooks/useProducts';
import { fetchCustomComponents, trackEvent, type ComponentOption } from '../../lib/api';
import { getClosestProducts, getProductKey } from '../../lib/products';
import { calculateFps, getBuildClass, getFallbackProfileForBudget, parseGpuProfile } from '../../lib/performance';
import { Cpu, MonitorPlay, Gamepad2, Crosshair, Swords } from 'lucide-react';
import './CustomBuild.css';

const resolutions = ['1080p', '1440p', '4K'] as const;
const ramOptions = ['16GB', '32GB', '64GB'] as const;
const storageOptions = ['512GB', '1TB', '2TB'] as const;

type Resolution = (typeof resolutions)[number];
type RamOption = (typeof ramOptions)[number];
type StorageOption = (typeof storageOptions)[number];

const componentLabels: Record<ComponentOption['category'], string> = {
  cpu: 'Процессор',
  gpu: 'Видеокарта',
  motherboard: 'Материнская плата',
  ram: 'Оперативная память',
  storage: 'Накопитель',
  psu: 'Блок питания',
  cooling: 'Охлаждение',
  case: 'Корпус',
  os: 'Система',
  service: 'Сервис',
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
}

async function copyTextToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.append(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  }
}

export function CustomBuild() {
  const [budget, setBudget] = useState(120000);
  const [resolution, setResolution] = useState<Resolution>('1440p');
  const [ramChoice, setRamChoice] = useState<RamOption>('32GB');
  const [storageChoice, setStorageChoice] = useState<StorageOption>('1TB');
  
  const [componentOptions, setComponentOptions] = useState<ComponentOption[]>([]);
  
  // User overrides
  const [manualGpuId, setManualGpuId] = useState<string | null>(null);
  const [manualCpuId, setManualCpuId] = useState<string | null>(null);

  const [requestState, setRequestState] = useState<'idle' | 'copying' | 'ready' | 'error'>('idle');
  const { products } = useProducts();

  useEffect(() => {
    let alive = true;
    fetchCustomComponents().then((items) => {
      if (alive) setComponentOptions(items);
    }).catch(() => undefined);
    return () => { alive = false; };
  }, []);

  const gpus = useMemo(() => componentOptions.filter(c => c.category === 'gpu').sort((a,b) => a.price - b.price), [componentOptions]);
  const cpus = useMemo(() => componentOptions.filter(c => c.category === 'cpu').sort((a,b) => a.price - b.price), [componentOptions]);

  // Auto-pick based on budget if not manually overridden
  const recommendedGpu = useMemo(() => {
    if (gpus.length === 0) return null;
    const fallbackProfile = getFallbackProfileForBudget(budget);
    // Find closest GPU in options to the fallback tier/price
    const targetPrice = budget * 0.45; // roughly 45% of budget for GPU
    const closest = gpus.reduce((prev, curr) => Math.abs(curr.price - targetPrice) < Math.abs(prev.price - targetPrice) ? curr : prev);
    return closest;
  }, [budget, gpus]);

  const recommendedCpu = useMemo(() => {
    if (cpus.length === 0) return null;
    const targetPrice = budget * 0.20; // roughly 20% for CPU
    const closest = cpus.reduce((prev, curr) => Math.abs(curr.price - targetPrice) < Math.abs(prev.price - targetPrice) ? curr : prev);
    return closest;
  }, [budget, cpus]);

  const activeGpu = manualGpuId ? gpus.find(g => g.id === manualGpuId) || recommendedGpu : recommendedGpu;
  const activeCpu = manualCpuId ? cpus.find(c => c.id === manualCpuId) || recommendedCpu : recommendedCpu;

  // Calculate dynamic exact price
  const baseOtherPartsPrice = 30000; // MB, Case, PSU, Cooling
  const ramPrice = ramChoice === '16GB' ? 4000 : ramChoice === '32GB' ? 8000 : 16000;
  const storagePrice = storageChoice === '512GB' ? 4000 : storageChoice === '1TB' ? 8000 : 15000;
  
  const exactPrice = (activeGpu?.price || 0) + (activeCpu?.price || 0) + ramPrice + storagePrice + baseOtherPartsPrice;

  // Handle Budget slider change -> reset manual overrides
  const handleBudgetChange = (newBudget: number) => {
    setBudget(newBudget);
    setManualGpuId(null);
    setManualCpuId(null);
  };

  const closestProducts = useMemo(() => getClosestProducts(products, exactPrice, 3), [exactPrice, products]);
  
  const gpuProfile = parseGpuProfile(activeGpu?.title || '');
  const fpsCyberpunk = calculateFps(gpuProfile, 'Cyberpunk 2077', resolution);
  const fpsCsgo = calculateFps(gpuProfile, 'Counter-Strike 2', resolution);
  const buildClass = getBuildClass(gpuProfile.tier);

  const messageText = `Здравствуйте! Хочу обсудить сборку из Калькулятора.
Бюджет/Оценка: ${formatPrice(exactPrice)}
Процессор: ${activeCpu?.title}
Видеокарта: ${activeGpu?.title}
RAM: ${ramChoice}
SSD: ${storageChoice}
Разрешение: ${resolution}

Хочу оформить эту сборку.`;

  const submitRequest = async () => {
    setRequestState('copying');
    const didCopy = await copyTextToClipboard(messageText);
    trackEvent('configurator_submit', { exactPrice, resolution, copied: didCopy });
    setRequestState(didCopy ? 'ready' : 'error');
    if (didCopy) window.setTimeout(() => setRequestState('idle'), 3000);
  };

  return (
    <section id="custom" className="premium-config-section">
      <div className="container">
        <div className="premium-configurator">
          <div className="config-copy">
            <span className="premium-badge">Интерактивный Подбор</span>
            <h2 className="premium-section-title">
              Калькулятор <span>Сборки</span>
            </h2>
            <p className="premium-section-subtitle">
              Двигайте ползунок бюджета или выбирайте комплектующие вручную. Мы моментально рассчитаем стоимость и FPS в играх.
            </p>

            <div className="premium-config-controls">
              {/* Budget Slider */}
              <label className="premium-budget-control">
                <div className="budget-header">
                  <span>Ориентировочный бюджет:</span>
                  <strong>{formatPrice(budget)}</strong>
                </div>
                <input
                  className="premium-slider"
                  type="range"
                  min="60000"
                  max="350000"
                  step="5000"
                  value={budget}
                  onChange={(e) => handleBudgetChange(Number(e.target.value))}
                />
              </label>

              {/* Visual Components Selector */}
              <div className="visual-components-grid">
                <div className="visual-component-card">
                  <div className="vc-header">
                    <MonitorPlay size={20} className="vc-icon gpu" />
                    <span>Видеокарта</span>
                  </div>
                  <select 
                    className="vc-select" 
                    value={activeGpu?.id || ''} 
                    onChange={(e) => setManualGpuId(e.target.value)}
                  >
                    {gpus.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>

                <div className="visual-component-card">
                  <div className="vc-header">
                    <Cpu size={20} className="vc-icon cpu" />
                    <span>Процессор</span>
                  </div>
                  <select 
                    className="vc-select" 
                    value={activeCpu?.id || ''} 
                    onChange={(e) => setManualCpuId(e.target.value)}
                  >
                    {cpus.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Memory & Resolution */}
              <div className="premium-control-group split">
                <div>
                  <span>RAM:</span>
                  <div className="premium-segmented" role="radiogroup">
                    {ramOptions.map((item) => (
                      <button className={ramChoice === item ? 'isActive' : ''} key={item} type="button" onClick={() => setRamChoice(item)}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span>SSD:</span>
                  <div className="premium-segmented" role="radiogroup">
                    {storageOptions.map((item) => (
                      <button className={storageChoice === item ? 'isActive' : ''} key={item} type="button" onClick={() => setStorageChoice(item)}>
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="premium-control-group" style={{ marginTop: '24px' }}>
                <span>Разрешение монитора:</span>
                <div className="premium-segmented" role="radiogroup">
                  {resolutions.map((item) => (
                    <button className={resolution === item ? 'isActive' : ''} key={item} type="button" onClick={() => setResolution(item)}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="premium-config-actions" style={{ marginTop: '32px' }}>
              <button className="premium-btn solid large" type="button" onClick={submitRequest} disabled={requestState === 'copying'}>
                {requestState === 'copying' ? 'Обработка...' : requestState === 'ready' ? '✓ Конфигурация скопирована' : 'Отправить в мессенджер'}
              </button>
            </div>

            {requestState === 'ready' && (
              <div className="premium-channel-panel" style={{ marginTop: '16px' }}>
                <p>Заявка скопирована! Отправьте её нам:</p>
                <div className="channel-actions">
                  <a className="premium-btn ghost" href={contacts.vk} target="_blank" rel="noreferrer">ВКонтакте</a>
                  <a className="premium-btn ghost" href={contacts.telegram} target="_blank" rel="noreferrer">Telegram</a>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Recommendation & FPS */}
          <aside className="premium-recommendation-card">
            <div className="rec-header">
              <span>Точная стоимость</span>
              <div className="rec-status">Оптимально</div>
            </div>
            <h3 style={{ fontSize: '2.5rem', color: 'var(--cyan)', marginBottom: '8px' }}>
              {formatPrice(exactPrice)}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '8px', fontStyle: 'italic' }}>
              *Цена примерная, итоговая стоимость зависит от конкретных вендоров и наличия деталей.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
              Уровень системы: <strong>{buildClass}</strong>
            </p>

            <div className="multi-fps-container">
              <h4 className="multi-fps-title">Ожидаемый FPS ({resolution})</h4>
              
              <div className="multi-fps-row">
                <div className="multi-fps-game">
                  <Crosshair size={18} color="#f59e0b" />
                  Counter-Strike 2
                </div>
                <div className="multi-fps-value">{fpsCsgo > 0 ? `~${fpsCsgo}` : 'N/A'}</div>
              </div>

              <div className="multi-fps-row">
                <div className="multi-fps-game">
                  <Gamepad2 size={18} color="var(--cyan)" />
                  Cyberpunk 2077
                </div>
                <div className="multi-fps-value">{fpsCyberpunk > 0 ? `~${fpsCyberpunk}` : 'N/A'}</div>
              </div>

              <div className="multi-fps-row">
                <div className="multi-fps-game">
                  <Swords size={18} color="#ef4444" />
                  Dota 2
                </div>
                {/* Fallback estimation if Dota 2 isn't strictly in calculateFps patterns */}
                <div className="multi-fps-value">{fpsCsgo > 0 ? `~${Math.floor(fpsCsgo * 1.15)}` : 'N/A'}</div>
              </div>
            </div>

            <div className="rec-closest" style={{ marginTop: '32px' }}>
              <span>Похожие готовые ПК</span>
              {closestProducts.map((product) => (
                <a key={getProductKey(product)} href={contacts.vk} target="_blank" rel="noreferrer" className="closest-link">
                  <b>{product.normalizedTitle}</b>
                  <small>{product.price}</small>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
