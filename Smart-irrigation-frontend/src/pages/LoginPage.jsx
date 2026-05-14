import React, { useState } from 'react';
import { Sprout, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, LogIn } from 'lucide-react';
import { apiLogin } from '../api';
import { useAuth } from '../AuthContext';
import Footer from '../components/Footer';


export default function LoginPage({ onBack, onSignup, onSuccess, onNavigate }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(true);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    const res = await apiLogin(form.email, form.password);
    setLoading(false);
    if (res.token) {
      login(res.user, res.token);
      onSuccess(res.user);
    } else {
      setError(res.error || 'Login failed');
    }
  };

  return (
    <div style={s.page}>
      {/* Background blobs */}
      <div style={s.blob1} /><div style={s.blob2} />

      {/* Nav strip */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <Sprout size={20} color="#a8c04a" />
          <span style={s.navLogoText}>SmartIrrigation</span>
        </div>
        <button style={s.backBtn} onClick={onBack}>
          <ArrowLeft size={15} /> Back
        </button>
      </nav>


      <div style={s.center}>
        <div style={s.card}>
          {/* Header */}
          <div style={s.cardHeader}>
            <div style={s.iconRing}>
              <LogIn size={22} color="#75853e" />
            </div>
            <h1 style={s.cardTitle}>Welcome back</h1>
            <p style={s.cardSub}>Sign in to your farm account</p>
          </div>

          {error && (
            <div style={s.errorBox}>
              <span style={s.errorText}>⚠ {error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={s.form}>
            {/* Email */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Email address</label>
              <div style={s.inputRow}>
                <Mail size={17} color="#9a8a75" style={{ flexShrink: 0 }} />
                <input
                  type="email" placeholder="you@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)}
                  style={s.input}
                />
              </div>
            </div>

            {/* Password */}
            <div style={s.fieldWrap}>
              <label style={s.label}>Password</label>
              <div style={s.inputRow}>
                <Lock size={17} color="#9a8a75" style={{ flexShrink: 0 }} />
                <input
                  type={showPw ? 'text' : 'password'} placeholder="Your password"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  style={s.input}
                />
                <button type="button" style={s.eyeBtn} onClick={() => setShowPw(p => !p)}>
                  {showPw ? <EyeOff size={16} color="#9a8a75" /> : <Eye size={16} color="#9a8a75" />}
                </button>
              </div>
            </div>

            <button type="submit" style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? 'Signing in...' : <><LogIn size={17} /> Sign In <ArrowRight size={16} /></>}
            </button>
          </form>

          <div style={s.divider}><span style={s.dividerText}>Don't have an account?</span></div>

          <button style={s.switchBtn} onClick={onSignup}>
            Create a free account <ArrowRight size={15} />
          </button>
        </div>

        {/* Decoration */}
        <p style={s.bottomNote}>Join thousands of farmers making smarter irrigation decisions</p>
     
      <Footer onNavigate={onNavigate} />
      </div>
     
  </div>
  );
}

const s = {
  page: { width: '100%', height: '100vh', background: '#f5ead8', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  blob1: { position: 'fixed', width: 600, height: 600, borderRadius: '50%', top: -200, right: -150, background: 'radial-gradient(circle, rgba(117,133,62,0.1) 0%, transparent 70%)', pointerEvents: 'none' },
  blob2: { position: 'fixed', width: 500, height: 500, borderRadius: '50%', bottom: -150, left: -100, background: 'radial-gradient(circle, rgba(174,123,106,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  nav: { position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5vw', height: 56, background: '#302215', borderBottom: '1px solid rgba(117,133,62,0.18)' },
  navLogo: { display: 'flex', alignItems: 'center', gap: 8 },
  navLogoText: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 17, color: '#f5ead8' },
  backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,234,216,0.08)', border: '1px solid rgba(245,234,216,0.15)', color: 'rgba(245,234,216,0.7)', borderRadius: 50, padding: '7px 16px', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  center: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 5vw' },
  card: { background: '#fff', border: '1px solid rgba(117,133,62,0.12)', borderRadius: 28, padding: 'clamp(28px,5vw,48px)', maxWidth: 440, width: '100%', boxShadow: '0 8px 48px rgba(48,34,21,0.1)' },
  cardHeader: { textAlign: 'center', marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  iconRing: { width: 64, height: 64, borderRadius: '50%', background: 'rgba(117,133,62,0.1)', border: '1px solid rgba(117,133,62,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 'clamp(22px,3vw,28px)', color: '#302215', letterSpacing: -0.5 },
  cardSub: { fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: '#9a8a75', fontWeight: 300 },
  errorBox: { background: 'rgba(220,60,40,0.08)', border: '1px solid rgba(220,60,40,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 },
  errorText: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#c0392b' },
  form: { display: 'flex', flexDirection: 'column', gap: 18 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#4a3a28' },
  inputRow: { display: 'flex', alignItems: 'center', gap: 10, background: '#f9f5ee', border: '1px solid rgba(117,133,62,0.2)', borderRadius: 12, padding: '12px 16px' },
  input: { flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: '#302215' },
  eyeBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#75853e', color: '#f5ead8', border: 'none', borderRadius: 50, padding: '15px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 6px 22px rgba(117,133,62,0.35)', marginTop: 4 },
  divider: { textAlign: 'center', margin: '20px 0', position: 'relative' },
  dividerText: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#9a8a75', fontWeight: 300, background: '#fff', padding: '0 12px' },
  switchBtn: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'transparent', border: '1px solid rgba(117,133,62,0.25)', color: '#75853e', borderRadius: 50, padding: '13px', fontSize: 15, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },

  
  bottomNote: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#9a8a75', marginTop: 24, fontWeight: 300 },
};
