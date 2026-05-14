import React, { useState } from 'react';
import { Sprout, User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Leaf, MapPin, UserPlus, CheckCircle } from 'lucide-react';
import { apiSignup } from '../api';
import { useAuth } from '../AuthContext';
import Footer from '../components/Footer';


const CROPS = ['Wheat','Rice','Maize','Sugarcane','Cotton','Soybean','Barley','Potato','Tomato','Sorghum'];
const REGIONS = ['North','South','East','West','Central'];

export default function SignupPage({ onBack, onLogin, onSuccess, onNavigate }) {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', farm_name: '', region: 'North', primary_crop: 'Maize' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const nextStep = () => {
    if (!form.name.trim()) { setError('Please enter your name'); return; }
    if (!form.email.trim()) { setError('Please enter your email'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true); setError('');
    const res = await apiSignup(form);
    setLoading(false);
    if (res.token) {
      login(res.user, res.token);
      onSuccess(res.user);
    } else {
      setError(res.error || 'Signup failed'); setStep(1);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} />

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
              <UserPlus size={22} color="#75853e" />
            </div>
            <h1 style={s.cardTitle}>Create your account</h1>
            <p style={s.cardSub}>Free forever · No credit card needed</p>
          </div>

          {/* Step indicator */}
          <div style={s.stepRow}>
            {[1,2].map(n => (
              <React.Fragment key={n}>
                <div style={{ ...s.stepBubble, background: step >= n ? '#75853e' : 'rgba(117,133,62,0.12)', border: step >= n ? 'none' : '1px solid rgba(117,133,62,0.25)' }}>
                  {step > n ? <CheckCircle size={14} color="#f5ead8" /> : <span style={{ ...s.stepNum, color: step >= n ? '#f5ead8' : '#75853e' }}>{n}</span>}
                </div>
                {n < 2 && <div style={{ ...s.stepLine, background: step > 1 ? '#75853e' : 'rgba(117,133,62,0.15)' }} />}
              </React.Fragment>
            ))}
          </div>
          <div style={s.stepLabels}>
            <span style={{ ...s.stepLabel, color: step === 1 ? '#302215' : '#9a8a75' }}>Account</span>
            <span style={{ ...s.stepLabel, color: step === 2 ? '#302215' : '#9a8a75' }}>Farm Details</span>
          </div>

          {error && (
            <div style={s.errorBox}><span style={s.errorText}>⚠ {error}</span></div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div style={s.form}>
              <div style={s.fieldWrap}>
                <label style={s.label}>Full Name</label>
                <div style={s.inputRow}>
                  <User size={17} color="#9a8a75" style={{ flexShrink: 0 }} />
                  <input type="text" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} style={s.input} />
                </div>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Email address</label>
                <div style={s.inputRow}>
                  <Mail size={17} color="#9a8a75" style={{ flexShrink: 0 }} />
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} style={s.input} />
                </div>
              </div>
              <div style={s.fieldWrap}>
                <label style={s.label}>Password</label>
                <div style={s.inputRow}>
                  <Lock size={17} color="#9a8a75" style={{ flexShrink: 0 }} />
                  <input type={showPw ? 'text' : 'password'} placeholder="At least 6 characters" value={form.password} onChange={e => set('password', e.target.value)} style={s.input} />
                  <button type="button" style={s.eyeBtn} onClick={() => setShowPw(p => !p)}>
                    {showPw ? <EyeOff size={16} color="#9a8a75" /> : <Eye size={16} color="#9a8a75" />}
                  </button>
                </div>
              </div>
              <button style={s.submitBtn} onClick={nextStep}>
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div style={s.form}>
              <div style={s.fieldWrap}>
                <label style={s.label}>Farm Name <span style={{ color: '#9a8a75', fontWeight: 300 }}>(optional)</span></label>
                <div style={s.inputRow}>
                  <Leaf size={17} color="#9a8a75" style={{ flexShrink: 0 }} />
                  <input type="text" placeholder="e.g. Kagera Green Farm" value={form.farm_name} onChange={e => set('farm_name', e.target.value)} style={s.input} />
                </div>
              </div>

              <div style={s.fieldWrap}>
                <label style={s.label}>Region</label>
                <div style={s.inputRow}>
                  <MapPin size={17} color="#9a8a75" style={{ flexShrink: 0 }} />
                  <select value={form.region} onChange={e => set('region', e.target.value)} style={{ ...s.input, cursor: 'pointer' }}>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div style={s.fieldWrap}>
                <label style={s.label}>Primary Crop</label>
                <div style={s.cropGrid}>
                  {CROPS.map(crop => (
                    <button key={crop} type="button"
                      style={{ ...s.cropBtn, background: form.primary_crop === crop ? '#75853e' : 'rgba(117,133,62,0.06)', border: `1px solid ${form.primary_crop === crop ? '#75853e' : 'rgba(117,133,62,0.2)'}`, color: form.primary_crop === crop ? '#f5ead8' : '#4a3a28' }}
                      onClick={() => set('primary_crop', crop)}
                    >
                      {form.primary_crop === crop && <CheckCircle size={13} />} {crop}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button style={s.backStepBtn} onClick={() => setStep(1)}>
                  <ArrowLeft size={15} /> Back
                </button>
                <button style={{ ...s.submitBtn, flex: 1, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating account...' : <><CheckCircle size={17} /> Create Account</>}
                </button>
              </div>
            </div>
          )}

          <div style={s.divider} />
          <button style={s.switchBtn} onClick={onLogin}>
            Already have an account? <span style={{ color: '#75853e', fontWeight: 600 }}>Sign in</span>
          </button>
        </div>

        <p style={s.bottomNote}>🌱 Join thousands of farmers making smarter irrigation decisions</p>
  
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
  card: { background: '#fff', border: '1px solid rgba(117,133,62,0.12)', borderRadius: 28, padding: 'clamp(28px,5vw,48px)', maxWidth: 480, width: '100%', boxShadow: '0 8px 48px rgba(48,34,21,0.1)' },
  cardHeader: { textAlign: 'center', marginBottom: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 },
  iconRing: { width: 64, height: 64, borderRadius: '50%', background: 'rgba(117,133,62,0.1)', border: '1px solid rgba(117,133,62,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 'clamp(22px,3vw,28px)', color: '#302215', letterSpacing: -0.5 },
  cardSub: { fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#9a8a75', fontWeight: 300 },
  stepRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 6 },
  stepBubble: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.3s' },
  stepNum: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 14 },
  stepLine: { width: 60, height: 2, transition: 'background 0.3s' },
  stepLabels: { display: 'flex', justifyContent: 'space-between', paddingLeft: 8, paddingRight: 8, marginBottom: 20 },
  stepLabel: { fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500, transition: 'color 0.3s' },
  errorBox: { background: 'rgba(220,60,40,0.08)', border: '1px solid rgba(220,60,40,0.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 16 },
  errorText: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#c0392b' },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 7 },
  label: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500, color: '#4a3a28' },
  inputRow: { display: 'flex', alignItems: 'center', gap: 10, background: '#f9f5ee', border: '1px solid rgba(117,133,62,0.2)', borderRadius: 12, padding: '12px 16px' },
  input: { flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: '#302215' },
  eyeBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 },
  cropGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  cropBtn: { display: 'flex', alignItems: 'center', gap: 5, borderRadius: 50, padding: '8px 14px', fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 400, transition: 'all 0.2s' },
  submitBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#75853e', color: '#f5ead8', border: 'none', borderRadius: 50, padding: '15px', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: '0 6px 22px rgba(117,133,62,0.35)' },
  backStepBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid rgba(117,133,62,0.25)', color: '#75853e', borderRadius: 50, padding: '14px 20px', fontSize: 15, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" },
  divider: { height: 1, background: 'rgba(117,133,62,0.1)', margin: '20px 0' },
  switchBtn: { width: '100%', background: 'transparent', border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#9a8a75', cursor: 'pointer', textAlign: 'center', fontWeight: 300 },

  sidebarBody: { display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 56px)' },
  sidebarMain: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  bottomNote: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#9a8a75', marginTop: 24, fontWeight: 300 },
};
