import React, { useState, useEffect, useRef } from "react";
import {
  Sprout, ArrowRight, ChevronDown,
  Leaf, BarChart2,
  Smartphone, CheckCircle, Menu, X, LogIn, UserPlus
} from "lucide-react";
import Footer from '../components/Footer';
import { Droplets} from "lucide-react";

const FACTS = [
  "Agriculture uses about 70% of the world's freshwater resources.",
  "Over-irrigation is responsible for nearly 50% of crop diseases globally.",
  "Smart irrigation can reduce water usage by up to 50% while improving yields.",
  "In Sub-Saharan Africa, only 6% of farmland is under irrigation.",
  "A single acre of corn needs about 350,000 liters of water to grow.",
  "Drip irrigation can be 90% efficient compared to flood irrigation at 60%.",
];

const STEPS = [
  { icon: <Smartphone size={26} color="#75853e" />, step: "01", title: "Open the App", desc: "Access Smart Irrigation from any device — phone, tablet or computer. No installation needed." },
  { icon: <Droplets size={26} color="#447111" />, step: "02", title: "Enter Your Readings", desc: "Input your soil moisture, temperature, humidity, rainfall and crop details using simple sliders." },
  { icon: <BarChart2 size={26} color="#ae7b6a" />, step: "03", title: "Get Your Prediction", desc: "Our AI analyses your data instantly and tells you whether to irrigate and exactly how much." },
  { icon: <CheckCircle size={26} color="#75853e" />, step: "04", title: "Act with Confidence", desc: "Follow the recommendation. Save water, protect your crops, and improve your harvest yield." },
];

export default function WelcomePage({ onGetStarted, onLogin, onSignup, onNavigate }) {
  const [factIndex, setFactIndex] = useState(0);
  const [factVisible, setFactVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => { const t = setTimeout(() => setTitleVisible(true), 300); return () => clearTimeout(t); }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFactVisible(false);
      setTimeout(() => { setFactIndex(i => (i + 1) % FACTS.length); setFactVisible(true); }, 400);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.setAttribute("playsinline", "");
      videoRef.current.setAttribute("muted", "");
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const anim = (delay) => ({
    opacity: titleVisible ? 1 : 0,
    transform: titleVisible ? "translateY(0)" : "translateY(32px)",
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
  });

  return (
    <div style={s.page}>

      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={s.navLogo}>
          <Sprout size={24} color="#a8c04a" />
          <span style={s.navLogoText}>SmartIrrigation</span>
        </div>
        <div style={s.navCenter}>
          <a href="#about" style={s.navLink}>About</a>
          <a href="#how" style={s.navLink}>How It Works</a>
          <a href="#contact" style={s.navLink}>Contact</a>
        </div>
        <div style={s.navRight}>
          <button style={s.navLoginBtn} onClick={onLogin}>
            <LogIn size={15} /> Sign In
          </button>
          <button style={s.navSignupBtn} onClick={onSignup}>
            <UserPlus size={15} /> Sign Up
          </button>
          <button style={s.navTryBtn} onClick={onGetStarted}>
            Try Free <ArrowRight size={14} />
          </button>
        </div>
        <button style={s.hamburger} onClick={() => setMenuOpen(p => !p)} aria-label="menu">
          {menuOpen ? <X size={24} color="#f5ead8" /> : <Menu size={24} color="#f5ead8" />}
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div style={{ ...s.mobileMenu, maxHeight: menuOpen ? 600 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
        <div style={s.mobileMenuInner}>
          <a href="#about" style={s.mobileLink} onClick={() => setMenuOpen(false)}>About</a>
          <a href="#how" style={s.mobileLink} onClick={() => setMenuOpen(false)}>How It Works</a>
          <a href="#contact" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Contact</a>
          <div style={s.mobileDivider} />
          <button style={s.mobileBtnOutline} onClick={() => { setMenuOpen(false); onLogin?.(); }}>
            <LogIn size={15} /> Sign In
          </button>
          <button style={s.mobileBtnGreen} onClick={() => { setMenuOpen(false); onSignup?.(); }}>
            <UserPlus size={15} /> Sign Up
          </button>
          <button style={s.mobileBtnDark} onClick={() => { setMenuOpen(false); onGetStarted(); }}>
            Try Free <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* HERO */}
      <section style={s.hero}>
        <video ref={videoRef} autoPlay muted loop playsInline style={s.video} poster="/irrigation.jpg">
          <source src="/Irrigation.mp4" type="video/mp4" />
          <source src="/irrigation.webm" type="video/webm" />
        </video>
        <div style={s.heroOverlay} />
        <div style={s.heroVignette} />

        <div style={s.heroContent}>
          <div style={{ ...s.heroBadge, ...anim(0.1) }}>
            <span style={s.badgeDot} />
            AI-Powered · 92%+ Accuracy · 11,000+ Farm Records
          </div>

          <div style={s.titleBlock}>
            <p style={{ ...s.titleTop, ...anim(0.3) }}>Welcome to</p>
            <div style={s.titleBig}>
              <span style={{ ...s.titleSmart, ...anim(0.5) }}>Smart</span>
              {" "}
              <span style={{ ...s.titleIrrigation, ...anim(0.7) }}>Irrigation</span>
            </div>
          </div>

          <p style={{ ...s.heroSub, ...anim(0.9) }}>
            Making smarter watering decisions accessible to every farmer —
            powered by machine learning, designed for the field.
          </p>

          <div style={{ ...s.heroCtas, ...{ opacity: titleVisible ? 1 : 0, transition: "opacity 0.8s ease 1.1s" } }}>
            <button style={s.btnPrimary} onClick={onGetStarted}>
              Try Free <ArrowRight size={17} />
            </button>
            <button style={s.btnOutline} onClick={onSignup}>
              <UserPlus size={16} /> Create Account
            </button>
          </div>

          <p style={{ ...s.freeNote, opacity: titleVisible ? 0.6 : 0, transition: "opacity 1s ease 1.3s" }}>
            ✦ Free trial — no account needed to start
          </p>

          <div style={{ ...s.factBox, ...{ opacity: titleVisible ? 1 : 0, transition: "opacity 1s ease 1.4s" } }}>
            <div style={s.factTag}><Leaf size={12} color="#ae7b6a" /> Did You Know?</div>
            <p style={{ ...s.factText, opacity: factVisible ? 1 : 0, transform: factVisible ? "translateY(0)" : "translateY(8px)", transition: "all 0.4s ease" }}>
              {FACTS[factIndex]}
            </p>
            <div style={s.factDots}>
              {FACTS.map((_, i) => <div key={i} style={{ ...s.factDot, background: i === factIndex ? "#75853e" : "rgba(245,234,216,0.2)" }} />)}
            </div>
          </div>
        </div>

        <div style={s.scrollCue}><ChevronDown size={22} color="rgba(245,234,216,0.5)" /></div>
      </section>

      {/* FREE TRIAL BANNER */}
      
          
          
        

      {/* ABOUT */}
      <section id="about" style={s.aboutSection}>
        <div style={s.inner}>
          <div style={s.sectionTag}><Sprout size={13} color="#75853e" /> About Us</div>
          <h2 style={s.sectionTitle}>We help farmers water smarter,<br />not harder</h2>
          <div style={s.aboutGrid}>
            <div style={s.aboutLeft}>
              <p style={s.aboutPara}>Smart Irrigation is an AI-powered decision support system built specifically for farmers in Rwanda and across Africa. We understand that water is precious, crops are vital, and decisions need to be simple — even in the middle of a field.</p>
              <p style={s.aboutPara}>Our system was trained on over <strong style={{ color: "#447111" }}>11,000 real farm records</strong>, learning the exact conditions that lead to healthy crops with optimal water use.</p>
              <p style={s.aboutPara}>No guesswork. No wasted water. No crop stress. Just one simple answer, <strong style={{ color: "#447111" }}>irrigate today, or wait.</strong></p>
              <button style={{ ...s.btnPrimary, width: "fit-content" }} onClick={onGetStarted}>Try It Free <ArrowRight size={16} /></button>
            </div>
            <div style={s.aboutRight}>
              {[
                { num: "11,000+", label: "Farm records the model learned from", color: "#447111" },
                { num: "92%+", label: "Prediction accuracy on test data", color: "#75853e" },
                { num: "3", label: "Clear decisions — Low, Medium, High", color: "#ae7b6a" },
                { num: "< 1s", label: "Response time per prediction", color: "#302215" },
              ].map((stat, i) => (
                <div key={i} style={s.statCard}>
                  <p style={{ ...s.statNum, color: stat.color }}>{stat.num}</p>
                  <p style={s.statLabel}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO USE */}
      <section id="how" style={s.howSection}>
        <div style={s.inner}>
          <div style={{ ...s.sectionTag, background: "rgba(174,123,106,0.12)", border: "1px solid rgba(174,123,106,0.3)", color: "#ae7b6a" }}>
            <BarChart2 size={13} color="#ae7b6a" /> How It Works
          </div>
          <h2 style={{ ...s.sectionTitle, color: "#302215" }}>Four simple steps to smarter irrigation</h2>
          <p style={s.howSub}>No technical knowledge required. If you can use a smartphone, you can use Smart Irrigation.</p>
          <div style={s.stepsGrid}>
            {STEPS.map((step, i) => (
              <div key={i} style={s.stepCard}>
                <div style={s.stepTop}>
                  <span style={s.stepNumText}>{step.step}</span>
                  <div style={s.stepIconWrap}>{step.icon}</div>
                </div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <button style={s.btnPrimary} onClick={onGetStarted}>Start Now <ArrowRight size={18} /></button>
          </div>
        </div>
      </section>

      <Footer onNavigate={onNavigate} />
    </div>
  );
}

const s = {
  page: { width: "100%", minHeight: "100vh", background: "#f5ead8", overflowX: "hidden" },

  // NAV
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 4vw", height: 56,
    background: "#302215",
    borderBottom: "1px solid rgba(117,133,62,0.18)",
    gap: 12,
  },
  navLogo: { display: "flex", alignItems: "center", gap: 10, flexShrink: 0 },
  navLogoText: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: "clamp(14px,1.8vw,17px)", color: "#e8dcc8", letterSpacing: -0.2 },
  navCenter: { display: "flex", gap: 28, flex: 1, justifyContent: "center" },
  navLink: { fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 500, color: "rgba(245,234,216,0.62)", textDecoration: "none" },
  navRight: { display: "flex", alignItems: "center", gap: 8, flexShrink: 0 },
  navLoginBtn: { display: "flex", alignItems: "center", gap: 5, background: "transparent", border: "1px solid rgba(245,234,216,0.15)", color: "rgba(245,234,216,0.6)", borderRadius: 50, padding: "6px 14px", fontSize: 15, fontWeight: 400, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" },
  navSignupBtn: { display: "flex", alignItems: "center", gap: 5, background: "rgba(117,133,62,0.12)", border: "1px solid rgba(117,133,62,0.28)", color: "#a8c04a", borderRadius: 50, padding: "6px 14px", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" },
  navTryBtn: { display: "flex", alignItems: "center", gap: 5, background: "#75853e", color: "#f5ead8", border: "none", borderRadius: 50, padding: "7px 16px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 3px 12px rgba(117,133,62,0.35)", whiteSpace: "nowrap" },
  hamburger: { display: "none", background: "transparent", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 },

  mobileMenu: { position: "fixed", top: 56, left: 0, right: 0, zIndex: 190, background: "#302215", borderBottom: "1px solid rgba(117,133,62,0.18)" },
  mobileMenuInner: { padding: "16px 5vw 24px", display: "flex", flexDirection: "column", gap: 8 },
  mobileLink: { fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 500, color: "rgba(245,234,216,0.7)", textDecoration: "none", padding: "12px 0", borderBottom: "1px solid rgba(245,234,216,0.06)" },
  mobileDivider: { height: 1, background: "rgba(245,234,216,0.08)", margin: "6px 0" },
  mobileBtnOutline: { display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "1px solid rgba(245,234,216,0.18)", color: "rgba(245,234,216,0.8)", borderRadius: 10, padding: "12px 16px", fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  mobileBtnGreen: { display: "flex", alignItems: "center", gap: 8, background: "#75853e", color: "#f5ead8", border: "none", borderRadius: 10, padding: "12px 16px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  mobileBtnDark: { display: "flex", alignItems: "center", gap: 8, background: "#447111", color: "#f5ead8", border: "none", borderRadius: 10, padding: "12px 16px", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },

  // HERO
  hero: { position: "relative", width: "100%", height: "100vh", minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#302215" },
  video: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.42) saturate(1.3)" },
  heroOverlay: { position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(48,34,21,0.65) 0%, rgba(48,34,21,0.2) 40%, rgba(48,34,21,0.9) 100%)" },
  heroVignette: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 35%, rgba(48,34,21,0.55) 100%)" },
  heroContent: { position: "relative", zIndex: 5, textAlign: "center", padding: "64px 5vw 28px", maxWidth: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 },
  heroBadge: { display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(117,133,62,0.15)", border: "1px solid rgba(117,133,62,0.32)", color: "rgba(200,216,122,0.85)", borderRadius: 50, padding: "5px 16px", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 300, letterSpacing: 1 },
  badgeDot: { width: 7, height: 7, borderRadius: "50%", background: "#75853e", boxShadow: "0 0 8px #75853e", display: "inline-block", flexShrink: 0 },
  titleBlock: { display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
  titleTop: { fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: "clamp(16px,2.5vw,28px)", color: "rgba(245,234,216,0.55)", letterSpacing: 2, textTransform: "uppercase" },
  titleBig: { display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "baseline", gap: "0 10px" },
  titleSmart: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(52px,9vw,108px)", color: "rgba(245,234,216,0.95)", lineHeight: 0.92, letterSpacing: -4, textShadow: "0 4px 40px rgba(0,0,0,0.5)", display: "inline-block" },
  titleIrrigation: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 300, fontSize: "clamp(52px,9vw,108px)", color: "#a8c04a", lineHeight: 0.92, letterSpacing: -2, textShadow: "0 0 60px rgba(168,192,74,0.3), 0 4px 40px rgba(0,0,0,0.5)", display: "inline-block", fontStyle: "italic" },
  heroSub: { fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(17px,2vw,20px)", color: "rgba(245,234,216,0.52)", lineHeight: 1.8, maxWidth: 460, fontWeight: 300, letterSpacing: 0.2 },
  heroCtas: { display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" },
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 7, background: "#75853e", color: "#f5ead8", border: "none", borderRadius: 50, padding: "14px 32px", fontSize: 17, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 6px 22px rgba(117,133,62,0.4)", letterSpacing: 0.1 },
  btnOutline: { display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(245,234,216,0.07)", backdropFilter: "blur(12px)", border: "1px solid rgba(245,234,216,0.18)", color: "rgba(245,234,216,0.65)", borderRadius: 50, padding: "14px 26px", fontSize: 17, fontWeight: 300, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" },
  freeNote: { fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(245,234,216,0.35)", letterSpacing: 0.8, fontWeight: 300 },
  factBox: { background: "rgba(48,34,21,0.65)", backdropFilter: "blur(20px)", border: "1px solid rgba(174,123,106,0.2)", borderRadius: 16, padding: "14px 20px", maxWidth: 500, width: "100%", textAlign: "left" },
  factTag: { display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400, color: "rgba(174,123,106,0.8)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 },
  factText: { fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(245,234,216,0.65)", lineHeight: 1.7, fontWeight: 300 },
  factDots: { display: "flex", gap: 6, marginTop: 14 },
  factDot: { width: 6, height: 6, borderRadius: "50%", transition: "background 0.3s", flexShrink: 0 },
  scrollCue: { position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 5 },

  // TRIAL BANNER
  trialBanner: { background: "#302215", borderBottom: "1px solid rgba(117,133,62,0.18)" },
  trialInner: { maxWidth: 1200, margin: "0 auto", padding: "24px 5vw", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 },
  trialLeft: { display: "flex", alignItems: "center", gap: 16 },
  trialTitle: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 20, color: "#f5ead8", marginBottom: 4 },
  trialSub: { fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "rgba(245,234,216,0.45)", lineHeight: 1.5 },
  trialBtns: { display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" },
  trialBtnOutline: { background: "transparent", border: "1px solid rgba(245,234,216,0.18)", color: "rgba(245,234,216,0.75)", borderRadius: 50, padding: "10px 22px", fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 500, cursor: "pointer" },
  trialBtnFill: { background: "#75853e", color: "#f5ead8", border: "none", borderRadius: 50, padding: "10px 22px", fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(117,133,62,0.4)" },

  // ABOUT
  aboutSection: { background: "#f5ead8", padding: "100px 0" },
  inner: { maxWidth: 1200, margin: "0 auto", padding: "0 5vw" },
  sectionTag: { display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(117,133,62,0.1)", border: "1px solid rgba(117,133,62,0.22)", color: "#75853e", borderRadius: 50, padding: "5px 14px", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 400, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 18 },
  sectionTitle: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(28px,4vw,52px)", color: "#302215", letterSpacing: -1, lineHeight: 1.15, marginBottom: 44 },
  aboutGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 60, alignItems: "start" },
  aboutLeft: { display: "flex", flexDirection: "column", gap: 18 },
  aboutPara: { fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: "#6a5a48", lineHeight: 1.85, fontWeight: 300 },
  aboutRight: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  statCard: { background: "#fff", border: "1px solid rgba(48,34,21,0.06)", borderRadius: 20, padding: "20px 16px", boxShadow: "0 4px 20px rgba(48,34,21,0.05)" },
  statNum: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: "clamp(24px,3vw,36px)", letterSpacing: -1, marginBottom: 5, lineHeight: 1 },
  statLabel: { fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#9a8a75", lineHeight: 1.5, fontWeight: 300 },

  // HOW
  howSection: { background: "#ede3ce", padding: "100px 0" },
  howSub: { fontFamily: "'DM Sans', sans-serif", fontSize: 18, color: "#7a6a58", lineHeight: 1.75, marginBottom: 52, marginTop: -30, maxWidth: 520, fontWeight: 300 },
  stepsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 52 },
  stepCard: { background: "#fff", border: "1px solid rgba(48,34,21,0.06)", borderRadius: 24, padding: "26px 20px", boxShadow: "0 4px 24px rgba(48,34,21,0.05)" },
  stepTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 },
  stepNumText: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 800, fontSize: 44, color: "rgba(48,34,21,0.07)", lineHeight: 1 },
  stepIconWrap: { width: 48, height: 48, borderRadius: 14, background: "#f5ead8", display: "flex", alignItems: "center", justifyContent: "center" },
  stepTitle: { fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700, fontSize: 20, color: "#302215", marginBottom: 10 },
  stepDesc: { fontFamily: "'DM Sans', sans-serif", fontSize: 16, color: "#7a6a58", lineHeight: 1.75, fontWeight: 300 },

  // FOOTER
};
