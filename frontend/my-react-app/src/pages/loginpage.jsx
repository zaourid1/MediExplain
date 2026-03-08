/**
 * src/pages/LoginPage.jsx
 *
 * Works with your existing App.jsx which already has:
 *   - <BrowserRouter>
 *   - <Auth0Provider>
 *   - <Route path="/login"    element={<LoginPage />} />
 *   - <Route path="/setup"    element={<WelcomeSetup />} />  ← ADD THIS in App.jsx
 *   - <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const AUTH0_AUDIENCE = import.meta?.env?.VITE_AUTH0_AUDIENCE ?? undefined;
const ONBOARDED_KEY  = "healthapp_onboarded";

/* ═══════════════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #eef3fa;
  --surface:   #ffffff;
  --border:    #e2e8f0;
  --ink:       #0f172a;
  --muted:     #64748b;
  --accent:    #6c3de8;
  --accent-lt: #ede9ff;
  --green:     #16a34a;
  --green-lt:  #dcfce7;
  --amber:     #b45309;
  --amber-lt:  #fef9c3;
  --red:       #b91c1c;
  --red-lt:    #fee2e2;
  --btn-bg:    #0f172a;
  --btn-text:  #ffffff;
  --radius:    16px;
  --font-head: 'Sora', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --shadow-lg: 0 8px 40px rgba(15,23,42,.12);
}

html, body, #root { height: 100%; font-family: var(--font-body); background: var(--bg); }

.auth-shell {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 24px 16px;
  background: linear-gradient(160deg, #dbeafe 0%, #ede9ff 50%, #fce7f3 100%);
}

.auth-card {
  width: 100%; max-width: 480px;
  background: var(--surface);
  border-radius: var(--radius);
  padding: 40px 36px 44px;
  box-shadow: var(--shadow-lg);
  animation: cardIn .45s cubic-bezier(.16,1,.3,1) both;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(22px) scale(.97); }
  to   { opacity: 1; transform: none; }
}

.icon-badge {
  width: 72px; height: 72px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
}

.auth-title {
  font-family: var(--font-head);
  font-size: clamp(26px, 5vw, 32px);
  font-weight: 700; color: var(--ink);
  text-align: center; letter-spacing: -.5px;
}
.auth-sub {
  font-size: 15px; color: var(--muted);
  text-align: center; margin-top: 6px; line-height: 1.5;
}

.field-group { margin-top: 20px; }
.field-label {
  display: block; font-family: var(--font-head);
  font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 8px;
}
.field-wrap { position: relative; }
.field-wrap svg {
  position: absolute; left: 16px; top: 50%;
  transform: translateY(-50%); color: var(--muted); pointer-events: none;
}
.field-input {
  width: 100%; padding: 14px 16px 14px 46px;
  border: 1.5px solid var(--border); border-radius: 12px;
  background: #f8fafc; font-family: var(--font-body);
  font-size: 15px; color: var(--ink);
  transition: border-color .2s, box-shadow .2s; outline: none;
}
.field-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(108,61,232,.12); background: #fff;
}
.field-input::placeholder { color: #94a3b8; }

.btn-primary {
  width: 100%; margin-top: 24px; padding: 15px 20px;
  background: var(--btn-bg); color: var(--btn-text);
  border: none; border-radius: 12px;
  font-family: var(--font-head); font-size: 16px; font-weight: 600;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: transform .15s, box-shadow .15s, opacity .15s;
}
.btn-primary:hover  { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,23,42,.2); }
.btn-primary:active { transform: none; }
.btn-primary:disabled { opacity: .6; cursor: default; }

.btn-secondary {
  flex: 1; padding: 14px 20px;
  background: transparent; color: var(--ink);
  border: 1.5px solid var(--border); border-radius: 12px;
  font-family: var(--font-head); font-size: 15px; font-weight: 500;
  cursor: pointer; transition: background .15s, border-color .15s;
}
.btn-secondary:hover { background: #f1f5f9; border-color: #cbd5e1; }

.btn-pair { display: flex; gap: 12px; margin-top: 28px; }

.divider {
  display: flex; align-items: center; gap: 12px;
  margin: 22px 0; color: var(--muted); font-size: 13px;
}
.divider::before, .divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

.oauth-btn {
  width: 100%; padding: 13px 20px;
  background: #fff; border: 1.5px solid var(--border); border-radius: 12px;
  font-family: var(--font-head); font-size: 14px; font-weight: 500; color: var(--ink);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: background .15s, border-color .15s;
}
.oauth-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
.oauth-btn:disabled { opacity: .6; cursor: default; }

.toggle-link {
  text-align: center; margin-top: 20px;
  font-size: 13.5px; color: var(--muted);
}
.toggle-link button {
  background: none; border: none; color: var(--accent);
  font-family: var(--font-body); font-size: 13.5px; font-weight: 600;
  cursor: pointer; padding: 0 2px; transition: opacity .15s;
}
.toggle-link button:hover { opacity: .75; }

.setup-progress-bar {
  height: 6px; background: #e2e8f0;
  border-radius: 99px; overflow: hidden; margin-bottom: 28px;
}
.setup-progress-fill {
  height: 100%; background: var(--ink);
  border-radius: 99px; transition: width .4s cubic-bezier(.4,0,.2,1);
}
.step-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.step-label  { font-size: 13px; font-weight: 600; color: var(--ink); font-family: var(--font-head); }
.step-count  { font-size: 13px; color: var(--muted); }

.feature-list { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; }
.feature-item {
  display: flex; gap: 14px; align-items: flex-start;
  padding: 14px 16px; border-radius: 12px; background: var(--bg);
}
.feature-icon {
  width: 36px; height: 36px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.feature-text h4 { font-family: var(--font-head); font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 3px; }
.feature-text p  { font-size: 13px; color: var(--muted); line-height: 1.45; }

.how-box {
  background: #f5f3ff; border: 1px solid #ddd6fe;
  border-radius: 14px; padding: 20px 22px; margin-top: 22px;
}
.how-box h3 { font-family: var(--font-head); font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 14px; }
.how-step   { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
.how-step:last-child { margin-bottom: 0; }
.how-num {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--accent); color: #fff;
  font-family: var(--font-head); font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.how-step p { font-size: 14px; color: var(--ink); line-height: 1.45; }

.notice-cards { margin-top: 22px; display: flex; flex-direction: column; gap: 12px; }
.notice-card  { padding: 16px 18px; border-radius: 14px; }
.notice-card h4 { font-family: var(--font-head); font-size: 14px; font-weight: 700; margin-bottom: 6px; }
.notice-card p  { font-size: 13px; line-height: 1.5; color: #374151; }
.notice-green { background: var(--green-lt); } .notice-green h4 { color: var(--green); }
.notice-amber { background: var(--amber-lt); } .notice-amber h4 { color: var(--amber); }
.notice-red   { background: var(--red-lt);   } .notice-red   h4 { color: var(--red); }

.reminder-banner {
  margin-top: 20px; padding: 14px 18px;
  border: 1.5px solid #fde68a; border-radius: 12px;
  background: #fefce8; font-size: 13.5px; color: #713f12;
  text-align: center; line-height: 1.5;
}
.reminder-banner strong { font-weight: 700; }

.spinner {
  width: 18px; height: 18px;
  border: 2.5px solid rgba(255,255,255,.4);
  border-top-color: #fff; border-radius: 50%;
  animation: spin .6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-msg {
  margin-top: 10px; padding: 10px 14px; border-radius: 10px;
  background: #fee2e2; color: #991b1b; font-size: 13px; text-align: center;
}
`;

/* ═══════════════════════════════════════════════════════════════════
   ICONS
   ═══════════════════════════════════════════════════════════════════ */
const Icon = {
  User: () => (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Lock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Arrow: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  ),
  LogIn: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
    </svg>
  ),
  Google: () => (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  Check: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  Heart: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  ),
  Translate: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6"/>
    </svg>
  ),
  Pill: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6c3de8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.5 20.5 3.5 13.5a5 5 0 1 1 7-7l7 7a5 5 0 0 1-7 7z"/><line x1="14" y1="10" x2="8" y2="16"/>
    </svg>
  ),
  Shield: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
};

/* ═══════════════════════════════════════════════════════════════════
   LOGIN PAGE  (default export — <Route path="/login">)
   ═══════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const { loginWithRedirect, isLoading } = useAuth0();

  const [mode, setMode]         = useState("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState("");

  const handleAuth0Login = () => {
    setBusy(true);
    setError("");
    const alreadyOnboarded = localStorage.getItem(ONBOARDED_KEY) === "true";
    const returnTo = alreadyOnboarded ? "/dashboard" : "/setup";
    loginWithRedirect({
      appState: { returnTo },
      authorizationParams: {
        screen_hint: mode === "signup" ? "signup" : "login",
        ...(AUTH0_AUDIENCE ? { audience: AUTH0_AUDIENCE } : {}),
      },
    }).catch((e) => {
      setError(e.message || "Authentication failed. Please try again.");
      setBusy(false);
    });
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="auth-shell">
        <div className="auth-card">

          <div className="icon-badge" style={{ background: "#dbeafe" }}>
            <Icon.User />
          </div>

          <h1 className="auth-title">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="auth-sub">
            {mode === "login"
              ? "Log in to see your prescriptions"
              : "Sign up to start tracking your health"}
          </p>

          {/* Google OAuth via Auth0 */}
          <button
            className="oauth-btn"
            style={{ marginTop: 24 }}
            onClick={handleAuth0Login}
            disabled={busy || isLoading}
          >
            <Icon.Google />
            {mode === "login" ? "Continue with Google" : "Sign up with Google"}
          </button>

          <div className="divider">or</div>

          {/* Email / password — triggers Auth0 popup */}
          <form onSubmit={e => { e.preventDefault(); handleAuth0Login(); }}>
            <div className="field-group" style={{ marginTop: 0 }}>
              <label className="field-label">Email</label>
              <div className="field-wrap">
                <Icon.Mail />
                <input
                  className="field-input"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <Icon.Lock />
                <input
                  className="field-input"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>
            </div>

            {error && <div className="error-msg">{error}</div>}

            <button className="btn-primary" type="submit" disabled={busy || isLoading}>
              {busy || isLoading ? (
                <><div className="spinner" /> Please wait…</>
              ) : (
                <>{mode === "login" ? <Icon.LogIn /> : <Icon.Arrow />}
                {mode === "login" ? " Log In" : " Create Account"}</>
              )}
            </button>
          </form>

          <p className="toggle-link">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}>
              {mode === "login" ? " Sign Up" : " Log In"}
            </button>
          </p>

        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WELCOME SETUP  (named export — <Route path="/setup">)
   ═══════════════════════════════════════════════════════════════════ */
export function WelcomeSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const finish = () => {
    localStorage.setItem(ONBOARDED_KEY, "true");
    navigate("/dashboard");
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="auth-shell">
        {step === 1 && <Step1 onNext={() => setStep(2)} onSkip={finish} />}
        {step === 2 && <Step2 onNext={() => setStep(3)} onSkip={finish} />}
        {step === 3 && <Step3 onFinish={finish} />}
      </div>
    </>
  );
}

/* ─── Step 1 ─────────────────────────────────────────────────────── */
function Step1({ onNext, onSkip }) {
  const { user } = useAuth0();
  return (
    <div className="auth-card">
      <div className="step-header">
        <span className="step-label">Welcome Setup</span>
        <span className="step-count">Step 1 of 3</span>
      </div>
      <div className="setup-progress-bar">
        <div className="setup-progress-fill" style={{ width: "33%" }} />
      </div>
      <div className="icon-badge" style={{ background: "#dcfce7" }}><Icon.Check /></div>
      <h2 className="auth-title" style={{ fontSize: 28 }}>Profile Created!</h2>
      <p className="auth-sub">
        {user?.name ? `Welcome, ${user.name.split(" ")[0]}! ` : ""}
        Your account is ready. Let's set up your prescription tracking.
      </p>
      <div className="feature-list">
        {[
          { icon: <Icon.Pill />,   bg: "#ede9ff", title: "Track Your Medicines",  desc: "Upload prescriptions and get simple explanations in your language." },
          { icon: <Icon.Heart />,  bg: "#dbeafe", title: "Know What to Expect",   desc: "Learn about side effects and when to contact your doctor." },
          { icon: <Icon.Shield />, bg: "#dcfce7", title: "Your Data is Safe",     desc: "All information is encrypted and private. We protect your health data." },
        ].map(({ icon, bg, title, desc }) => (
          <div key={title} className="feature-item">
            <div className="feature-icon" style={{ background: bg }}>{icon}</div>
            <div className="feature-text"><h4>{title}</h4><p>{desc}</p></div>
          </div>
        ))}
      </div>
      <div className="btn-pair">
        <button className="btn-secondary" onClick={onSkip}>Skip Setup</button>
        <button className="btn-primary" style={{ margin: 0, flex: 2 }} onClick={onNext}>
          Continue <Icon.Arrow />
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2 ─────────────────────────────────────────────────────── */
function Step2({ onNext, onSkip }) {
  return (
    <div className="auth-card">
      <div className="step-header">
        <span className="step-label">Welcome Setup</span>
        <span className="step-count">Step 2 of 3</span>
      </div>
      <div className="setup-progress-bar">
        <div className="setup-progress-fill" style={{ width: "66%" }} />
      </div>
      <div className="icon-badge" style={{ background: "#dbeafe" }}><Icon.Heart /></div>
      <h2 className="auth-title" style={{ fontSize: 28 }}>What to Expect</h2>
      <p className="auth-sub">We help you understand what you might feel when taking your medicine.</p>
      <div className="notice-cards">
        <div className="notice-card notice-green">
          <h4>Normal Side Effects</h4>
          <p>Mild symptoms like tiredness or upset stomach are usually normal. These often go away after a few days.</p>
        </div>
        <div className="notice-card notice-amber">
          <h4>Monitor These</h4>
          <p>If symptoms last more than 3 days or get worse, contact your doctor. We'll help you track them.</p>
        </div>
        <div className="notice-card notice-red">
          <h4>Emergency Signs</h4>
          <p>Trouble breathing, chest pain, or severe reactions need immediate help. Call 911 right away.</p>
        </div>
      </div>
      <div className="btn-pair">
        <button className="btn-secondary" onClick={onSkip}>Skip Setup</button>
        <button className="btn-primary" style={{ margin: 0, flex: 2 }} onClick={onNext}>
          Continue <Icon.Arrow />
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3 ─────────────────────────────────────────────────────── */
function Step3({ onFinish }) {
  return (
    <div className="auth-card">
      <div className="step-header">
        <span className="step-label">Welcome Setup</span>
        <span className="step-count">Step 3 of 3</span>
      </div>
      <div className="setup-progress-bar">
        <div className="setup-progress-fill" style={{ width: "100%" }} />
      </div>
      <div className="icon-badge" style={{ background: "#ede9ff" }}><Icon.Translate /></div>
      <h2 className="auth-title" style={{ fontSize: 28 }}>Health Chat Assistant</h2>
      <p className="auth-sub">Tell us how you feel. We analyze your symptoms and recommend what to do.</p>
      <div className="how-box">
        <h3>How It Works:</h3>
        {[
          "Describe your symptoms or feelings in simple words",
          "Our system analyzes what you say",
          "Get recommendations and know if you need a doctor",
          "Emergency alerts if symptoms are serious",
        ].map((text, i) => (
          <div key={i} className="how-step">
            <div className="how-num">{i + 1}</div>
            <p>{text}</p>
          </div>
        ))}
      </div>
      <div className="reminder-banner">
        <strong>Remember:</strong> This is not medical advice. Always contact your doctor for serious concerns.
      </div>
      <button className="btn-primary" onClick={onFinish}>
        Get Started <Icon.Arrow />
      </button>
    </div>
  );
}