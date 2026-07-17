import React from 'react';
import './Marquee.css';

const LOGOS = [
  "NVIDIA GEFORCE RTX",
  "INTEL CORE",
  "AMD RYZEN",
  "ASUS ROG",
  "GIGABYTE AORUS",
  "MSI GAMING",
  "CORSAIR",
  "NZXT"
];

export function Marquee() {
  return (
    <section className="marquee-section">
      <div className="marquee-container">
        <div className="marquee-track">
          {/* We duplicate the logos array 3 times to create an infinite seamless loop */}
          {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, idx) => (
            <div key={idx} className="marquee-item">
              <span className="marquee-text">{logo}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
