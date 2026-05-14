import React from 'react';
import { Droplets, Wind, Thermometer, Wheat } from 'lucide-react';

export default function FarmStatus({ data, palette: P }) {
  const items = [
    { Icon: Droplets,    iconColor: '#3b82f6', bg: 'rgba(59,130,246,0.1)',   label: 'Soil Moisture',  value: data ? `${data.Soil_Moisture}%`        : '—', progress: data?.Soil_Moisture,  sub: data ? (data.Soil_Moisture < 30 ? 'Critically dry' : data.Soil_Moisture < 55 ? 'Moderate' : 'Well hydrated') : 'No data yet' },
    { Icon: Wind,        iconColor: '#6366f1', bg: 'rgba(99,102,241,0.1)',   label: 'Humidity',       value: data ? `${data.Humidity}%`            : '—', progress: data?.Humidity,       sub: data ? (data.Humidity > 70 ? 'High humidity' : 'Moderate') : 'No data yet' },
    { Icon: Thermometer, iconColor: P.terra,   bg: 'rgba(174,123,106,0.1)', label: 'Temperature',    value: data ? `${data.Temperature_C}°C`      : '—', progress: null,                 sub: data ? (data.Temperature_C > 35 ? 'Heat stress risk' : 'Optimal range') : 'No data yet' },
    { Icon: Wheat,       iconColor: P.olive,   bg: 'rgba(117,133,62,0.1)',  label: 'Crop',           value: data ? data.Crop_Type                 : '—', progress: null,                 sub: data ? `Stage: ${data.Crop_Growth_Stage}` : 'No data yet' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {items.map(({ Icon, iconColor, bg, label, value, progress, sub }, i) => (
        <div key={i} style={{ background: P.white, border: '1px solid rgba(117,133,62,0.1)', borderRadius: 16, padding: 16, boxShadow: '0 2px 12px rgba(48,34,21,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={15} color={iconColor} />
            </div>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: P.muted }}>{label}</span>
          </div>
          <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 24, color: iconColor, marginBottom: 5 }}>{value}</p>
          {progress != null && (
            <div style={{ height: 3, background: P.beige, borderRadius: 2, overflow: 'hidden', marginBottom: 5 }}>
              <div style={{ height: '100%', width: `${Math.min(100, progress)}%`, background: iconColor, borderRadius: 2, transition: 'width 0.6s ease' }} />
            </div>
          )}
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: P.muted, fontWeight: 300 }}>{sub}</p>
        </div>
      ))}
    </div>
  );
}
