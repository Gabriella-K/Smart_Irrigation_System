import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, BarChart2, Clock, Droplets, TrendingUp } from 'lucide-react';

const CONFIG = {
  Low:    { color: '#75853e', bg: 'rgba(117,133,62,0.1)',  border: 'rgba(117,133,62,0.25)',  Icon: CheckCircle,   badge: 'NO IRRIGATION NEEDED',  label: 'Skip Today',       msg: 'Soil moisture is adequate. Save water — no irrigation needed today.' },
  Medium: { color: '#c07842', bg: 'rgba(192,120,66,0.1)', border: 'rgba(192,120,66,0.25)', Icon: AlertTriangle, badge: 'IRRIGATE WITHIN 24H',    label: 'Irrigate Soon',    msg: 'Moderate irrigation recommended within the next 24 hours.' },
  High:   { color: '#c0392b', bg: 'rgba(192,57,43,0.1)',  border: 'rgba(192,57,43,0.25)',  Icon: XCircle,       badge: 'IRRIGATE IMMEDIATELY',   label: 'Irrigate Now',     msg: 'Soil moisture is critically low. Irrigate as soon as possible.' },
};

export default function PredictionResult({ result, palette: P, onNewPrediction, onViewAnalytics }) {
  if (!result) return null;
  const { prediction, confidence, water_amount, best_time, probabilities } = result;
  const cfg = CONFIG[prediction] || CONFIG.Medium;
  const { Icon } = cfg;
  const pct = (confidence * 100).toFixed(1);

  const card = (extra = {}) => ({ background: P.white, border: '1px solid rgba(117,133,62,0.1)', borderRadius: 20, boxShadow: '0 4px 20px rgba(48,34,21,0.05)', ...extra });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Main decision card */}
      <div style={{ ...card(), padding: 28 }}>
        <p style={s.eyebrow}>AI Recommendation</p>

        {/* Decision header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 16, padding: '18px 22px', marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: cfg.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon size={24} color={cfg.color} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 'clamp(22px,3vw,30px)', color: cfg.color, lineHeight: 1 }}>{cfg.label}</p>
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600, color: cfg.color, background: cfg.color + '18', borderRadius: 50, padding: '3px 10px', letterSpacing: 0.8, display: 'inline-block', marginTop: 5 }}>{cfg.badge}</span>
          </div>
        </div>

        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: P.body, lineHeight: 1.7, fontWeight: 300, marginBottom: 18 }}>{cfg.msg}</p>

        {/* Three metric boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { Icon: Droplets,   label: 'Water Amount', value: water_amount,   color: '#3b82f6' },
            { Icon: Clock,      label: 'Best Time',     value: best_time,      color: P.terra },
            { Icon: TrendingUp, label: 'Confidence',    value: `${pct}%`,      color: cfg.color },
          ].map(({ Icon: MIcon, label, value, color }, i) => (
            <div key={i} style={{ background: P.beige, borderRadius: 12, padding: '14px 12px', textAlign: 'center' }}>
              <MIcon size={16} color={color} style={{ marginBottom: 6, display: 'block', margin: '0 auto 6px' }} />
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: P.muted, marginBottom: 5 }}>{label}</p>
              <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 'clamp(14px,2vw,18px)', color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence + Probabilities row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        {/* Confidence */}
        <div style={{ ...card(), padding: 22 }}>
          <p style={s.eyebrow}>Model Confidence</p>
          <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 'clamp(32px,4vw,44px)', color: cfg.color, lineHeight: 1, marginBottom: 12 }}>{pct}%</p>
          <div style={{ height: 6, background: P.beige, borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, #447111, #75853e)`, borderRadius: 3, transition: 'width 0.8s ease' }} />
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: P.muted, fontWeight: 300 }}>
            {confidence >= 0.85 ? 'High confidence' : confidence >= 0.7 ? 'Moderate confidence' : 'Low confidence — verify readings'}
          </p>
        </div>

        {/* Probabilities */}
        {probabilities && (
          <div style={{ ...card(), padding: 22 }}>
            <p style={s.eyebrow}>Probability Breakdown</p>
            {Object.entries(probabilities).map(([level, prob]) => (
              <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, color: P.body, width: 60 }}>{level}</span>
                <div style={{ flex: 1, height: 7, background: P.beige, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(prob*100).toFixed(0)}%`, background: CONFIG[level]?.color || '#888', borderRadius: 4, transition: 'width 0.6s ease' }} />
                </div>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: P.muted, width: 34, textAlign: 'right' }}>{(prob*100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onNewPrediction} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: '#75853e', color: '#f5ead8', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', boxShadow: '0 4px 16px rgba(117,133,62,0.3)' }}>
          <RefreshCw size={15} /> New Prediction
        </button>
        <button onClick={onViewAnalytics} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px', background: P.white, border: '1px solid rgba(117,133,62,0.2)', color: P.body, borderRadius: 12, fontSize: 15, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }}>
          <BarChart2 size={15} /> View Analytics
        </button>
      </div>
    </div>
  );
}

const s = {
  eyebrow: { fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 600, color: '#9a8a75', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 },
};
