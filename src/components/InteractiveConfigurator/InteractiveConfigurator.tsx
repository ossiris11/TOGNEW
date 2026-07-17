import { useState } from 'react';
import { calculateFps, parseGpuProfile } from '../../lib/performance';
import { trackEvent } from '../../lib/api';
import { contacts, buildContactMessage } from '../../data/contacts';
import { Cpu, MonitorPlay, MemoryStick, HardDrive } from 'lucide-react';
import './InteractiveConfigurator.css';

const componentsData = {
  cpu: [
    { name: 'Intel Core i3-12100F', price: 7000 },
    { name: 'Intel Core i5-12400F', price: 13000 },
    { name: 'Intel Core i5-13400F', price: 19000 },
    { name: 'Intel Core i5-14400F', price: 21000 },
    { name: 'Intel Core i5-14600KF', price: 32000 },
    { name: 'Intel Core i7-13700KF', price: 40000 },
    { name: 'Intel Core i7-14700KF', price: 44000 },
    { name: 'Intel Core i9-14900KF', price: 60000 },
    { name: 'AMD Ryzen 5 5500', price: 9000 },
    { name: 'AMD Ryzen 5 5600', price: 12000 },
    { name: 'AMD Ryzen 5 7500F', price: 16000 },
    { name: 'AMD Ryzen 5 7600', price: 20000 },
    { name: 'AMD Ryzen 7 7700', price: 28000 },
    { name: 'AMD Ryzen 7 7800X3D', price: 40000 },
    { name: 'AMD Ryzen 9 7950X3D', price: 65000 },
  ],
  gpu: [
    { name: 'NVIDIA GeForce RTX 3050 8GB', price: 24000 },
    { name: 'NVIDIA GeForce RTX 4060 8GB', price: 35000 },
    { name: 'NVIDIA GeForce RTX 4060 Ti 8GB', price: 45000 },
    { name: 'NVIDIA GeForce RTX 4060 Ti 16GB', price: 52000 },
    { name: 'NVIDIA GeForce RTX 4070 SUPER 12GB', price: 68000 },
    { name: 'NVIDIA GeForce RTX 4070 Ti SUPER 16GB', price: 92000 },
    { name: 'NVIDIA GeForce RTX 4080 SUPER 16GB', price: 115000 },
    { name: 'NVIDIA GeForce RTX 4090 24GB', price: 220000 },
    { name: 'AMD Radeon RX 6600 8GB', price: 25000 },
    { name: 'AMD Radeon RX 7600 8GB', price: 30000 },
    { name: 'AMD Radeon RX 7700 XT 12GB', price: 48000 },
    { name: 'AMD Radeon RX 7800 XT 16GB', price: 60000 },
    { name: 'AMD Radeon RX 7900 GRE 16GB', price: 68000 },
    { name: 'AMD Radeon RX 7900 XTX 24GB', price: 110000 },
  ],
  ram: [
    { name: '16GB (2x8) DDR4 3200MHz', price: 4000 },
    { name: '32GB (2x16) DDR4 3200MHz', price: 7500 },
    { name: '32GB (2x16) DDR5 5600MHz', price: 10000 },
    { name: '32GB (2x16) DDR5 6000MHz', price: 12000 },
    { name: '64GB (2x32) DDR5 6000MHz', price: 23000 },
    { name: '64GB (2x32) DDR5 6400MHz', price: 25000 },
  ],
  ssd: [
    { name: '500GB M.2 NVMe Gen3', price: 4000 },
    { name: '500GB M.2 NVMe Gen4', price: 4500 },
    { name: '1TB M.2 NVMe Gen4', price: 8500 },
    { name: '2TB M.2 NVMe Gen4', price: 15500 },
    { name: '4TB M.2 NVMe Gen4', price: 35000 },
  ],
};

const basePrice = 20000; // Case, Motherboard, PSU, Cooling estimates

export function InteractiveConfigurator() {
  const [cpu, setCpu] = useState(componentsData.cpu[1]);
  const [gpu, setGpu] = useState(componentsData.gpu[0]);
  const [ram, setRam] = useState(componentsData.ram[1]);
  const [ssd, setSsd] = useState(componentsData.ssd[1]);

  const totalPrice = basePrice + cpu.price + gpu.price + ram.price + ssd.price;
  const formattedPrice = totalPrice.toLocaleString('ru-RU') + ' ₽';
  
  const gpuProfile = parseGpuProfile(gpu.name);
  const fpsCyberpunk = calculateFps(gpuProfile, 'Cyberpunk 2077', '1080p');
  const fpsCsgo = calculateFps(gpuProfile, 'Counter-Strike 2', '1080p');

  const orderText = `— Конфигуратор на сайте —
Бюджет: ${formattedPrice}
Процессор: ${cpu.name}
Видеокарта: ${gpu.name}
Память: ${ram.name}
Накопитель: ${ssd.name}
(Остальное подберет менеджер)

Хочу обсудить эту сборку!`;

  return (
    <section className="configurator-section" id="online-configurator">
      <div className="configurator-container">
        <div className="configurator-header">
          <h2 className="configurator-title">Онлайн Конфигуратор</h2>
          <p className="configurator-subtitle">Собери свой идеальный ПК прямо сейчас. Мы автоматически рассчитаем стоимость и примерную производительность в играх.</p>
        </div>

        <div className="configurator-grid">
          {/* Builder Options */}
          <div className="configurator-builder">
            <div className="config-item">
              <label><Cpu size={18} /> Процессор</label>
              <select 
                className="config-select" 
                value={cpu.name} 
                onChange={(e) => setCpu(componentsData.cpu.find(c => c.name === e.target.value) || componentsData.cpu[0])}
              >
                {componentsData.cpu.map(item => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="config-item">
              <label><MonitorPlay size={18} /> Видеокарта</label>
              <select 
                className="config-select" 
                value={gpu.name} 
                onChange={(e) => setGpu(componentsData.gpu.find(c => c.name === e.target.value) || componentsData.gpu[0])}
              >
                {componentsData.gpu.map(item => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="config-item">
              <label><MemoryStick size={18} /> Оперативная память</label>
              <select 
                className="config-select" 
                value={ram.name} 
                onChange={(e) => setRam(componentsData.ram.find(c => c.name === e.target.value) || componentsData.ram[0])}
              >
                {componentsData.ram.map(item => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="config-item">
              <label><HardDrive size={18} /> Накопитель SSD</label>
              <select 
                className="config-select" 
                value={ssd.name} 
                onChange={(e) => setSsd(componentsData.ssd.find(c => c.name === e.target.value) || componentsData.ssd[0])}
              >
                {componentsData.ssd.map(item => (
                  <option key={item.name} value={item.name}>{item.name}</option>
                ))}
              </select>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginTop: '16px', lineHeight: '1.4' }}>
              <strong>Внимание:</strong> Указанные цены носят ориентировочный характер и могут меняться в зависимости от актуального курса и доступности комплектующих на складе. <br/>
              * Стоимость материнской платы, блока питания, охлаждения и корпуса включена в базовый расчет и будет согласована с менеджером индивидуально.
            </p>
          </div>

          {/* Summary Sidebar */}
          <div className="configurator-summary">
            <div className="summary-price-box">
              <div className="summary-price-label">Итоговая стоимость</div>
              <div className="summary-price-value">~ {formattedPrice}</div>
            </div>

            <div className="summary-fps-box">
              <div className="summary-price-label" style={{ marginBottom: '16px' }}>Ожидаемый FPS (1080p)</div>
              
              <div className="fps-row">
                <div className="fps-game">
                  <MonitorPlay size={18} color="var(--cyan)" />
                  Cyberpunk 2077
                </div>
                <div className="fps-value">{fpsCyberpunk}</div>
              </div>
              
              <div className="fps-row">
                <div className="fps-game">
                  <MonitorPlay size={18} color="#f59e0b" />
                  Counter-Strike 2
                </div>
                <div className="fps-value">{fpsCsgo}</div>
              </div>
            </div>

            <a 
              href={`${contacts.vk}?message=${buildContactMessage(orderText)}`}
              target="_blank"
              rel="noreferrer"
              className="btn-order-config"
              onClick={() => trackEvent('configurator_order', { price: totalPrice })}
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
            >
              Заказать эту сборку
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
