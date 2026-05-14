import React from 'react';
import { Sprout, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';

export default function Footer({ onNavigate }) {
  return (
    <footer style={s.footer}>
      <div style={s.top}>
        <div style={s.brand}>
          <div style={s.logo}>
            <Sprout size={18} color="#ae7b6a" />
            <span style={s.logoText}>SmartIrrigation</span>
          </div>
          <p style={s.desc}>
            AI-powered irrigation decisions for farmers across Africa.
            Built with care for the land and the people who tend it.
          </p>
        </div>

        <div style={s.col}>
          <p style={s.heading}>Navigate</p>
          <span style={s.link} onClick={() => onNavigate?.('welcome')}>Home</span>
          <span style={s.link} onClick={() => onNavigate?.('dashboard')}>Dashboard</span>
          <span style={s.link} onClick={() => onNavigate?.('login')}>Sign In</span>
          <span style={s.link} onClick={() => onNavigate?.('signup')}>Sign Up</span>
        </div>

        <div style={s.col}>
          <p style={s.heading}>Contact</p>
          <div style={s.row}><Mail size={12} color="#ae7b6a" /><span style={s.link}>smartirrigation@agri.rw</span></div>
          <div style={s.row}><Phone size={12} color="#ae7b6a" /><span style={s.link}>+250 700 000 000</span></div>
          <div style={s.row}><MapPin size={12} color="#ae7b6a" /><span style={s.link}>Kigali, Rwanda</span></div>
        </div>

        <div style={s.col}>
          <p style={s.heading}>Legal</p>
          <span style={s.link}>Privacy Policy</span>
          <span style={s.link}>Terms of Use</span>
          <span style={s.link}>About</span>
        </div>
      </div>

      <div style={s.bottom}>
        <p style={s.copy}>© 2026 SmartIrrigation — Smart Agriculture Analytics</p>
        <p style={s.copy}>Developed for farmers across Africa</p>
      </div>
    </footer>
  );
}

const s = {
  footer: { background: '#302215', flexShrink: 0 },
  top: {
    maxWidth: 1300, margin: '0 auto',
    padding: '48px 4vw 40px',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 36,
    borderBottom: '1px solid rgba(117,133,62,0.12)',
  },
  brand: { display: 'flex', flexDirection: 'column', gap: 13 },
  logo: { display: 'flex', alignItems: 'center', gap: 9 },
  logoText: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: '#e0d4be' },
  desc: { fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(245,234,216,0.28)', lineHeight: 1.8, fontWeight: 300 },
  col: { display: 'flex', flexDirection: 'column', gap: 10 },
  heading: { fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 10, color: 'rgba(200,184,154,0.5)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 2 },
  link: { fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(245,234,216,0.3)', fontWeight: 300, cursor: 'pointer', lineHeight: 1.5 },
  row: { display: 'flex', alignItems: 'center', gap: 8 },
  bottom: { maxWidth: 1300, margin: '0 auto', padding: '16px 4vw', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  copy: { fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: 'rgba(245,234,216,0.16)', fontWeight: 300 },
};
