import React from 'react';
import { Sprout, X, ArrowRight, UserPlus, LogIn } from 'lucide-react';

export default function TrialGate({ onSignup, onLogin, onClose }) {
  return (
    <div style={s.backdrop}>
      <div style={s.modal}>
        {/* Close */}
        <button style={s.closeBtn} onClick={onClose}><X size={18} color="#9a8a75" /></button>

        {/* Icon */}
        <div style={s.iconWrap}>
          <Sprout size={32} color="#75853e" />
        </div>

        {/* Text */}
        <h2 style={s.title}>You've used your 3 free predictions</h2>
        <p style={s.sub}>
          Create a free account to get unlimited predictions, save your history,
          and receive personalized irrigation recommendations for your specific farm.
        </p>

        {/* Trial used indicators */}
        <div style={s.dots}>
          {[0,1,2].map(i => (
            <div key={i} style={s.dot} />
          ))}
        </div>
        <p style={s.dotsLabel}>3 / 3 free predictions used this session</p>

        {/* Perks */}
        <div style={s.perks}>
          {['Unlimited predictions', 'Prediction history saved', 'Personalized farm recommendations', 'Access from any device'].map((perk, i) => (
            <div key={i} style={s.perk}>
              <div style={s.perkDot} />
              <span style={s.perkText}>{perk}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <button style={s.btnPrimary} onClick={onSignup}>
          <UserPlus size={17} /> Create Free Account <ArrowRight size={16} />
        </button>
        <button style={s.btnSecondary} onClick={onLogin}>
          <LogIn size={15} /> Already have an account? Sign in
        </button>
      </div>
    </div>
  );
}

const s = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 500,
    background: 'rgba(48,34,21,0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    background: '#f5ead8',
    borderRadius: 28, padding: '44px 40px',
    maxWidth: 460, width: '100%',
    position: 'relative',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    textAlign: 'center', gap: 14,
    boxShadow: '0 32px 80px rgba(48,34,21,0.3)',
    border: '1px solid rgba(117,133,62,0.15)',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    background: 'transparent', border: 'none', cursor: 'pointer', padding: 4,
  },
  iconWrap: {
    width: 68, height: 68, borderRadius: '50%',
    background: 'rgba(117,133,62,0.12)',
    border: '1px solid rgba(117,133,62,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontFamily: "'Bricolage Grotesque', sans-serif",
    fontWeight: 800, fontSize: 'clamp(20px,3vw,26px)',
    color: '#302215', letterSpacing: -0.5, lineHeight: 1.2,
  },
  sub: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 16, color: '#6a5a48', lineHeight: 1.7, fontWeight: 300,
  },
  dots: { display: 'flex', gap: 8 },
  dot: { width: 12, height: 12, borderRadius: '50%', background: '#75853e' },
  dotsLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13, color: '#9a8a75', fontWeight: 400,
    marginTop: -6,
  },
  perks: {
    background: 'rgba(117,133,62,0.08)',
    border: '1px solid rgba(117,133,62,0.15)',
    borderRadius: 16, padding: '18px 22px',
    width: '100%', display: 'flex', flexDirection: 'column', gap: 10,
    textAlign: 'left',
  },
  perk: { display: 'flex', alignItems: 'center', gap: 12 },
  perkDot: { width: 8, height: 8, borderRadius: '50%', background: '#75853e', flexShrink: 0 },
  perkText: { fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#4a3a28', fontWeight: 400 },
  btnPrimary: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: '#75853e', color: '#f5ead8',
    border: 'none', borderRadius: 50, padding: '15px 28px',
    fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700,
    cursor: 'pointer', boxShadow: '0 6px 22px rgba(117,133,62,0.35)',
  },
  btnSecondary: {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    background: 'transparent', color: '#75853e',
    border: '1px solid rgba(117,133,62,0.3)', borderRadius: 50, padding: '13px 28px',
    fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 400,
    cursor: 'pointer',
  },
};
