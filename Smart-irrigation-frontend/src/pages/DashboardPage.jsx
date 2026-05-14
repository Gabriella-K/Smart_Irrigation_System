import React, { useState } from 'react';
import { LayoutDashboard, ClipboardList, BarChart2, TrendingUp, Droplets, Thermometer, Wind, Sun, CloudRain, Leaf, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { predictIrrigation, incrementTrial, isTrialExhausted, getTrialRemaining, saveHistory } from '../api';
import InputForm from '../components/InputForm';
import PredictionResult from '../components/PredictionResult';
import FarmStatus from '../components/FarmStatus';
import AnalyticsChart from '../components/AnalyticsChart';
import TrialGate from '../components/TrialGate';


const TABS = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'input',     icon: ClipboardList,  label: 'Input' },
  { id: 'results',   icon: BarChart2,      label: 'Results' },
  { id: 'analytics', icon: TrendingUp,     label: 'Analytics' },
];

const P = {
  dark: '#302215', olive: '#75853e', forest: '#447111',
  terra: '#ae7b6a', cream: '#f5ead8', beige: '#ede3ce',
  white: '#ffffff', muted: '#9a8a75', body: '#4a3a28',
};

export default function DashboardPage({ onBack, onSignup, onLogin, onNavigate }) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [formData, setFormData]   = useState(null);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);
  const [showTrialGate, setShowTrialGate] = useState(false);
 

  const trialRemaining = getTrialRemaining();

  const handlePredict = async (data) => {
    if (isTrialExhausted()) { setShowTrialGate(true); return; }
    setFormData(data); setLoading(true); setError(null); setActiveTab('results');
    if (!user) incrementTrial();
    const response = await predictIrrigation(data);
    setLoading(false);
    if (response.success) {
      setResult(response.data);
      if (user) saveHistory({ input: data, result: response.data });
    } else {
      setError(response.error);
    }
  };

  const card = (extra = {}) => ({
    background: P.white, border: '1px solid rgba(117,133,62,0.12)',
    borderRadius: 22, boxShadow: '0 4px 24px rgba(48,34,21,0.06)', ...extra,
  });

  return (
    <div style={s.page}>
      {/* ── HEADER ── */}
      <header style={s.header}>
        <div style={s.headerLeft}>
          <button onClick={onBack} style={s.backBtn}><ArrowLeft size={14} /></button>
          <div style={s.logo}>
            <span style={{ fontSize: 18 }}></span>
            <span style={s.logoText}>SmartIrrigation</span>
          </div>
        </div>

        <nav style={s.tabs}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ ...s.tab, background: active ? P.olive : 'transparent', color: active ? P.cream : P.muted, borderBottom: `2px solid ${active ? P.olive : 'transparent'}` }}>
                <Icon size={14} /><span style={s.tabLabel}>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={s.headerRight}>
          {!user && (
            <div style={s.trialPill}>
              <div style={{ ...s.trialDot, background: trialRemaining > 2 ? P.olive : '#e07b5a' }} />
              <span style={s.trialText}>{trialRemaining} prediction{trialRemaining !== 1 ? 's' : ''} left</span>
            </div>
          )}
          {user ? (
            <div style={s.userChip}>
              <div style={s.avatar}>{user.name[0].toUpperCase()}</div>
              <span style={s.userName}>{user.name.split(' ')[0]}</span>
              <button style={s.logoutBtn} onClick={logout}><LogOut size={14} /></button>
            </div>
          ) : (
            <button style={s.signInBtn} onClick={onLogin}>Sign In</button>
          )}
        </div>
      </header>

      {/* ── BODY = MAIN + SIDEBAR ── */}
      <div style={s.body}>
        {/* MAIN */}
        <div style={s.mainWrap}>
          <main style={s.main}>

            {/* Welcome bar */}
            <div style={{ ...card(), padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={s.welcomeTitle}>{user ? `Good day, ${user.name.split(' ')[0]} ` : 'Welcome to SmartIrrigation '}</p>
                <p style={s.welcomeSub}>{user ? `${user.farm_name || 'Your farm'} · ${user.region || ''} Region` : `${trialRemaining} free prediction${trialRemaining !== 1 ? 's' : ''} this session. Sign up for unlimited access.`}</p>
              </div>
              {!user && <button style={s.signupCta} onClick={onSignup}>Create Free Account →</button>}
            </div>

            {/* DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div style={s.dashGrid}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div style={{ ...card(), padding: 24 }}>
                    <p style={s.cardEyebrow}>Latest Recommendation</p>
                    {result ? (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: P.beige, borderRadius: 14, padding: '14px 18px', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: P.body }}>Irrigation Decision</span>
                          <span style={{ ...s.badge, background: result.prediction === 'High' ? '#c0392b' : result.prediction === 'Medium' ? P.terra : P.olive }}>
                            {result.prediction === 'High' ? 'IRRIGATE NOW' : result.prediction === 'Medium' ? 'IRRIGATE SOON' : 'SKIP TODAY'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', background: P.beige, borderRadius: 14, padding: 16, marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                          {[{ label: 'Water Amount', val: result.water_amount }, { label: 'Best Time', val: result.best_time }, { label: 'Confidence', val: `${(result.confidence * 100).toFixed(0)}%`, color: P.olive }].map((m, i) => (
                            <div key={i} style={{ flex: '1 1 80px', textAlign: 'center' }}>
                              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: P.muted, marginBottom: 4 }}>{m.label}</p>
                              <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 20, color: m.color || P.dark }}>{m.val}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{ height: 6, background: P.beige, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(result.confidence*100).toFixed(0)}%`, background: `linear-gradient(90deg,${P.forest},${P.olive})`, borderRadius: 3, transition: 'width 1s ease' }} />
                        </div>
                      </>
                    ) : (
                      <div style={{ textAlign: 'center', padding: '28px 0' }}>
                        <p style={{ fontSize: 40, marginBottom: 10 }}></p>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: P.muted, marginBottom: 18, fontWeight: 300 }}>No prediction yet. Enter your farm conditions to get started.</p>
                        <button style={s.goBtn} onClick={() => setActiveTab('input')}>Enter Farm Data →</button>
                      </div>
                    )}
                  </div>
                  <p style={s.cardEyebrow}>Farm Status</p>
                  <FarmStatus data={formData} palette={P} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <p style={s.cardEyebrow}>Live Readings</p>
                  <div style={s.liveGrid}>
                    {[
                      { icon: <Droplets size={17} color="#3b82f6" />, iconBg: 'rgba(59,130,246,0.1)', label: 'Soil Moisture', val: formData ? `${formData.Soil_Moisture}%` : '—', color: '#3b82f6' },
                      { icon: <Thermometer size={17} color={P.terra} />, iconBg: 'rgba(174,123,106,0.1)', label: 'Temperature', val: formData ? `${formData.Temperature_C}°C` : '—', color: P.terra },
                      { icon: <Wind size={17} color="#6366f1" />, iconBg: 'rgba(99,102,241,0.1)', label: 'Humidity', val: formData ? `${formData.Humidity}%` : '—', color: '#6366f1' },
                      { icon: <Sun size={17} color="#f59e0b" />, iconBg: 'rgba(245,158,11,0.1)', label: 'Sunlight', val: formData ? `${formData.Sunlight_Hours}h` : '—', color: '#f59e0b' },
                      { icon: <CloudRain size={17} color="#6366f1" />, iconBg: 'rgba(99,102,241,0.1)', label: 'Rainfall', val: formData ? `${formData.Rainfall_mm}mm` : '—', color: '#6366f1' },
                      { icon: <Leaf size={17} color={P.olive} />, iconBg: 'rgba(117,133,62,0.1)', label: 'Crop', val: formData ? formData.Crop_Type : '—', color: P.olive },
                    ].map((item, i) => (
                      <div key={i} style={{ ...card(), padding: 16 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>{item.icon}</div>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: P.muted, marginBottom: 3 }}>{item.label}</p>
                        <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 'clamp(17px,2vw,22px)', color: item.color }}>{item.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* INPUT */}
            {activeTab === 'input' && (
              <div style={s.centered}>
                <h2 style={s.pageTitle}>Enter Farm Conditions</h2>
                <p style={s.pageSub}>Fill in your current field readings to get an AI-powered recommendation</p>
                <div style={{ ...card(), padding: 'clamp(20px,4vw,36px)' }}>
                  <InputForm onSubmit={handlePredict} loading={loading} palette={P} />
                </div>
              </div>
            )}

            {/* RESULTS */}
            {activeTab === 'results' && (
              <div style={s.centered}>
                <h2 style={s.pageTitle}>Prediction Results</h2>
                <p style={s.pageSub}>AI-powered irrigation recommendation for your farm</p>
                {loading ? (
                  <div style={{ ...card(), padding: 60, textAlign: 'center' }}>
                    <p style={{ fontSize: 48, marginBottom: 16 }}></p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", color: P.muted, fontSize: 17 }}>Analysing farm conditions...</p>
                  </div>
                ) : error ? (
                  <div style={{ ...card(), padding: 44, textAlign: 'center', border: '1px solid rgba(192,57,43,0.2)' }}>
                    <p style={{ fontSize: 40, marginBottom: 12 }}></p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#c0392b', fontSize: 16, marginBottom: 20 }}>{error}</p>
                    <button style={s.goBtn} onClick={() => setActiveTab('input')}>Try Again</button>
                  </div>
                ) : result ? (
                  <PredictionResult result={result} palette={P} onNewPrediction={() => setActiveTab('input')} onViewAnalytics={() => setActiveTab('analytics')} />
                ) : (
                  <div style={{ ...card(), padding: 60, textAlign: 'center' }}>
                    <p style={{ fontSize: 48, marginBottom: 16 }}></p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", color: P.muted, fontSize: 16, marginBottom: 24, fontWeight: 300 }}>No results yet. Submit your farm data first.</p>
                    <button style={s.goBtn} onClick={() => setActiveTab('input')}>Go to Input →</button>
                  </div>
                )}
              </div>
            )}

            {/* ANALYTICS */}
            {activeTab === 'analytics' && (
              <div style={s.centered}>
                <h2 style={s.pageTitle}>Analytics</h2>
                <p style={s.pageSub}>Probability breakdown and farm metadata</p>
                <div style={{ ...card(), padding: 28, marginBottom: 18 }}>
                  <AnalyticsChart probabilities={result?.probabilities} palette={P} />
                </div>
                {formData && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 14 }}>
                    {[
                      { emoji: '', label: 'Season', value: formData.Season },
                      { emoji: '', label: 'Region', value: formData.Region },
                      { emoji: '', label: 'Soil Type', value: formData.Soil_Type },
                      { emoji: '', label: 'Growth Stage', value: formData.Crop_Growth_Stage },
                    ].map((item, i) => (
                      <div key={i} style={{ ...card(), padding: 20, textAlign: 'center' }}>
                        <span style={{ fontSize: 28, display: 'block', marginBottom: 10 }}>{item.emoji}</span>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: P.muted, marginBottom: 5 }}>{item.label}</p>
                        <p style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: P.dark }}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>

         
        </div>

       
      
      </div>

      {/* Trial gate */}
      {showTrialGate && (
        <TrialGate
          onSignup={() => { setShowTrialGate(false); onSignup?.(); }}
          onLogin={() => { setShowTrialGate(false); onLogin?.(); }}
          onClose={() => setShowTrialGate(false)}
        />
      )}
    </div>
  );
}

const s = {
  page: { width: '100%', minHeight: '100vh', background: '#f5ead8', display: 'flex', flexDirection: 'column', overflow: 'hidden' },

  header: { position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 3vw', height: 56, background: '#302215', borderBottom: '1px solid rgba(117,133,62,0.18)', gap: 8, flexShrink: 0 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  backBtn: { display: 'flex', alignItems: 'center', background: 'rgba(245,234,216,0.08)', border: '1px solid rgba(245,234,216,0.12)', color: 'rgba(245,234,216,0.6)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer' },
  logo: { display: 'flex', alignItems: 'center', gap: 6 },
  logoText: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 16, color: '#f5ead8' },
  tabs: { display: 'flex', gap: 2, flex: 1, justifyContent: 'center', overflow: 'auto' },
  tab: { display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 13, padding: '0 14px', height: 56, cursor: 'pointer', border: 'none', borderBottom: '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' },
  tabLabel: { display: 'inline' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  trialPill: { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(245,234,216,0.08)', border: '1px solid rgba(245,234,216,0.15)', borderRadius: 50, padding: '5px 12px' },
  trialDot: { width: 7, height: 7, borderRadius: '50%', flexShrink: 0 },
  trialText: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(245,234,216,0.7)' },
  userChip: { display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,234,216,0.08)', border: '1px solid rgba(245,234,216,0.15)', borderRadius: 50, padding: '4px 12px 4px 4px' },
  avatar: { width: 28, height: 28, borderRadius: '50%', background: '#75853e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 13, color: '#f5ead8' },
  userName: { fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'rgba(245,234,216,0.8)', fontWeight: 500 },
  logoutBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(245,234,216,0.4)', display: 'flex', padding: 2 },
  signInBtn: { background: '#75853e', color: '#f5ead8', border: 'none', borderRadius: 50, padding: '7px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer' },

  body: { display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 56px)' },
  mainWrap: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  main: { flex: 1, padding: '22px 3vw 32px', maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: 18 },

  welcomeTitle: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 'clamp(17px,2vw,21px)', color: '#302215', marginBottom: 4 },
  welcomeSub: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: '#9a8a75', fontWeight: 300 },
  signupCta: { background: '#75853e', color: '#f5ead8', border: 'none', borderRadius: 50, padding: '9px 20px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, cursor: 'pointer', flexShrink: 0, boxShadow: '0 4px 14px rgba(117,133,62,0.3)' },

  dashGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 18, alignItems: 'start' },
  liveGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: 12 },
  cardEyebrow: { fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 11, color: '#9a8a75', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 },
  badge: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 11, padding: '5px 14px', borderRadius: 20, color: '#fff', letterSpacing: 0.5 },
  goBtn: { background: '#75853e', color: '#f5ead8', border: 'none', borderRadius: 50, padding: '12px 26px', fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px rgba(117,133,62,0.3)' },

  pageTitle: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 'clamp(20px,3vw,28px)', color: '#302215', letterSpacing: -0.5, marginBottom: 5 },
  pageSub: { fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: '#9a8a75', fontWeight: 300, marginBottom: 22 },
  centered: { maxWidth: 860, margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' },
};
