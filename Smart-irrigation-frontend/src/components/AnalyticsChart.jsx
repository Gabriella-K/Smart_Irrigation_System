import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = { Low: '#75853e', Medium: '#ae7b6a', High: '#c0392b' };

export default function AnalyticsChart({ probabilities, palette: P }) {
  if (!probabilities) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <p style={{ fontSize: 40, marginBottom: 12 }}></p>
      <p style={{ fontFamily: "'DM Sans', sans-serif", color: P.muted, fontSize: 16, fontWeight: 300 }}>Run a prediction first to see analytics</p>
    </div>
  );
  const data = Object.entries(probabilities).map(([name, prob]) => ({ name, probability: parseFloat((prob*100).toFixed(1)) }));
  return (
    <div>
      <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 18, color: P.dark, marginBottom: 24 }}>Prediction Probability Breakdown</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(117,133,62,0.12)" />
          <XAxis dataKey="name" tick={{ fontFamily: 'DM Sans', fontSize: 14, fill: P.body }} />
          <YAxis domain={[0,100]} tickFormatter={v => `${v}%`} tick={{ fontFamily: 'DM Sans', fontSize: 12, fill: P.muted }} />
          <Tooltip formatter={v => [`${v}%`, 'Probability']} contentStyle={{ fontFamily: 'DM Sans', borderRadius: 14, background: '#fff', border: '1px solid rgba(117,133,62,0.15)', color: P.dark }} />
          <Bar dataKey="probability" radius={[8,8,0,0]}>
            {data.map(e => <Cell key={e.name} fill={COLORS[e.name] || P.olive} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 16 }}>
        {Object.entries(COLORS).map(([level, color]) => (
          <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: color }} />
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: P.muted, fontWeight: 300 }}>{level} Need</span>
          </div>
        ))}
      </div>
    </div>
  );
}
