import React, { useState } from 'react';
import { Droplets, Thermometer, Wind, Sun, CloudRain, Beaker, Wheat, Layers, Calendar, MapPin, Loader } from 'lucide-react';

const DEFAULT = {
  Soil_Moisture: 32, Temperature_C: 28, Humidity: 65,
  Rainfall_mm: 5, Sunlight_Hours: 7, Previous_Irrigation_mm: 20,
  Soil_Type: 'Clay', Crop_Type: 'Tomato', Crop_Growth_Stage: 'Flowering',
  Season: 'Summer', Region: 'North',
};

const OPTIONS = {
  Soil_Type: ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty'],
  Crop_Type: ['Wheat', 'Rice', 'Maize', 'Sugarcane', 'Cotton', 'Soybean', 'Barley', 'Potato', 'Tomato', 'Sorghum'],
  Crop_Growth_Stage: ['Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity'],
  Season: ['Summer', 'Winter', 'Spring', 'Autumn'],
  Region: ['North', 'South', 'East', 'West', 'Central'],
};

const SLIDERS = [
  { key: 'Soil_Moisture',          Icon: Droplets,  label: 'Soil Moisture',       unit: '%',  min: 0,  max: 100, color: '#3b82f6' },
  { key: 'Temperature_C',          Icon: Thermometer, label: 'Temperature',        unit: '°C', min: 0,  max: 50,  color: '#ae7b6a' },
  { key: 'Humidity',               Icon: Wind,      label: 'Humidity',             unit: '%',  min: 0,  max: 100, color: '#6366f1' },
  { key: 'Rainfall_mm',            Icon: CloudRain, label: 'Rainfall (7 days)',    unit: 'mm', min: 0,  max: 300, color: '#0ea5e9' },
  { key: 'Sunlight_Hours',         Icon: Sun,       label: 'Sunlight Hours',       unit: 'h',  min: 0,  max: 14,  color: '#f59e0b' },
  { key: 'Previous_Irrigation_mm', Icon: Beaker,    label: 'Previous Irrigation',  unit: 'mm', min: 0,  max: 200, color: '#75853e' },
];

const SELECTS = [
  { key: 'Soil_Type',         Icon: Layers,   label: 'Soil Type' },
  { key: 'Crop_Type',         Icon: Wheat,    label: 'Crop Type' },
  { key: 'Crop_Growth_Stage', Icon: Droplets, label: 'Growth Stage' },
  { key: 'Season',            Icon: Calendar, label: 'Season' },
  { key: 'Region',            Icon: MapPin,   label: 'Region' },
];

export default function InputForm({ onSubmit, loading }) {
  const [form, setForm] = useState(DEFAULT);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      Soil_Moisture: parseFloat(form.Soil_Moisture),
      Temperature_C: parseFloat(form.Temperature_C),
      Humidity: parseFloat(form.Humidity),
      Rainfall_mm: parseFloat(form.Rainfall_mm),
      Sunlight_Hours: parseFloat(form.Sunlight_Hours),
      Previous_Irrigation_mm: parseFloat(form.Previous_Irrigation_mm),
    });
  };

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      {/* Sensor Readings */}
      <div style={s.section}>
        <p style={s.sectionLabel}>Sensor Readings</p>
        <div style={s.sliderGrid}>
          {SLIDERS.map(({ key, Icon, label, unit, min, max, color }) => (
            <div key={key} style={s.sliderCard}>
              <div style={s.sliderHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ ...s.iconBox, background: color + '18' }}>
                    <Icon size={15} color={color} />
                  </div>
                  <span style={s.sliderLabel}>{label}</span>
                </div>
                <span style={{ ...s.sliderValue, color }}>{parseFloat(form[key]).toFixed(0)}{unit}</span>
              </div>
              <input
                type="range" min={min} max={max} step="0.5"
                value={form[key]} onChange={e => set(key, e.target.value)}
                style={{ width: '100%', accentColor: color, cursor: 'pointer' }}
              />
              <div style={s.sliderRange}>
                <span>{min}{unit}</span><span>{max}{unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Farm Information */}
      <div style={s.section}>
        <p style={s.sectionLabel}>Farm Information</p>
        <div style={s.selectGrid}>
          {SELECTS.map(({ key, Icon, label }) => (
            <div key={key} style={s.selectCard}>
              <div style={s.selectLabelRow}>
                <Icon size={13} color="#9a8a75" />
                <span style={s.selectLabel}>{label}</span>
              </div>
              <select
                value={form[key]} onChange={e => set(key, e.target.value)}
                style={s.select}
              >
                {OPTIONS[key].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading} style={{ ...s.submit, opacity: loading ? 0.75 : 1 }}>
        {loading
          ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analysing conditions...</>
          : 'Get Irrigation Recommendation'}
      </button>
    </form>
  );
}

const s = {
  form: { display: 'flex', flexDirection: 'column', gap: 28 },
  section: { display: 'flex', flexDirection: 'column', gap: 14 },
  sectionLabel: { fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 11, color: '#9a8a75', textTransform: 'uppercase', letterSpacing: 1.8 },
  sliderGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 },
  sliderCard: { background: '#f9f5ee', border: '1px solid rgba(117,133,62,0.12)', borderRadius: 14, padding: '14px 16px' },
  sliderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 },
  iconBox: { width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sliderLabel: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#4a3a28' },
  sliderValue: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20 },
  sliderRange: { display: 'flex', justifyContent: 'space-between', fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#9a8a75', marginTop: 5 },
  selectGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 },
  selectCard: { background: '#f9f5ee', border: '1px solid rgba(117,133,62,0.12)', borderRadius: 12, padding: '12px 14px' },
  selectLabelRow: { display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 },
  selectLabel: { fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: '#9a8a75', textTransform: 'uppercase', letterSpacing: 1 },
  select: { width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 15, color: '#302215', cursor: 'pointer' },
  submit: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#75853e', color: '#f5ead8', border: 'none', borderRadius: 12, padding: '17px', fontSize: 16, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", boxShadow: '0 6px 22px rgba(117,133,62,0.3)', cursor: 'pointer' },
};
