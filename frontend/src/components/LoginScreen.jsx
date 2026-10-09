import React, { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const CLUB_ROLES = [
  { value: 'PRESIDENT', label: 'President' },
  { value: 'VP',        label: 'Vice President' },
  { value: 'SECRETARY', label: 'Secretary' },
  { value: 'LEAD',      label: 'Club Lead / Coordinator' },
  { value: 'MEMBER',    label: 'Club Member' },
];

const BRANCHES = [
  { value: 'CSE',         label: 'Computer Science (CSE)',      code: '51' },
  { value: 'IT',          label: 'Information Technology (IT)', code: '61' },
  { value: 'Electronics', label: 'Electronics & Communication', code: '41' },
  { value: 'Electrical',  label: 'Electrical Engineering',      code: '31' },
  { value: 'Mechanical',  label: 'Mechanical Engineering',      code: '21' },
  { value: 'Civil',       label: 'Civil Engineering',           code: '11' },
];

const SECTIONS = ['Aided', 'Unaided', 'A', 'B', 'C', 'D'];

const BASE_INPUT = {
  width: '100%', padding: '8px 11px', borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
  color: '#e2e8f0', fontSize: '12px', fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s',
};
const LABEL = {
  display: 'block', fontSize: '10px', fontWeight: 700, color: '#64748b',
  letterSpacing: '0.5px', marginBottom: 4, textTransform: 'uppercase',
};

export const LoginScreen = ({ onLogin, isDark, toggleTheme }) => {
  const [mode, setMode] = useState('login');
  const [requestedRole, setRequestedRole] = useState('STUDENT');
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });

  const [regForm, setRegForm] = useState({
    full_name: '', username: '', email: '', password: '', phone: '',
    program: 'BTECH', branch: 'CSE', section: 'Aided', gender: 'Male',
    year_level: '1',
    club_id: '', club_role: 'MEMBER',
    mentor_club_id: '',
    designation: '', department: '',
  });

  useEffect(() => {
    fetch(`${API}/clubs`)
      .then(r => r.json())
      .then(d => setClubs(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  const inputStyle = (focused) => ({
    ...BASE_INPUT,
    borderColor: focused ? 'rgba(99,102,241,0.55)' : 'rgba(255,255,255,0.1)',
    boxShadow:   focused ? '0 0 0 2px rgba(99,102,241,0.12)' : 'none',
  });

  const [focused, setFocused] = useState('');
  const inp = (name) => ({
    className: 'axis-input',
    style: inputStyle(focused === name),
    onFocus: () => setFocused(name),
    onBlur:  () => setFocused(''),
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginForm.username, password: loginForm.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem('accessToken', data.accessToken);
      onLogin(data);
    } catch (err) { setError(err.message || 'Login failed.'); }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // PRN validation for students and club members
    if (requestedRole !== 'CLUB_MENTOR') {
      const prn = regForm.username;
      if (!/^\d{8}$/.test(prn)) return setError('PRN must be exactly 8 digits (e.g. 23510001).');
      const branchCode = BRANCHES.find(b => b.value === regForm.branch)?.code;
      if (branchCode && prn.substring(2, 4) !== branchCode)
        return setError(`PRN digits 3-4 must match branch code ${branchCode} for ${regForm.branch}.`);
    }

    if (requestedRole === 'CLUB_MEMBER' && !regForm.club_id)
      return setError('Please select the club you want to join.');
    if (requestedRole === 'CLUB_MENTOR' && !regForm.mentor_club_id)
      return setError('Please select your primary club to mentor.');
    if (!regForm.email || !regForm.full_name)
      return setError('Full name and email are required.');

    // Calculate admission_year from selected year level
    const now = new Date();
    const currentYear = now.getFullYear();
    const academicYearDelta = now.getMonth() >= 6 ? 1 : 0;
    const admission_year = currentYear - parseInt(regForm.year_level) + academicYearDelta;

    setLoading(true);
    try {
      const payload = {
        ...regForm,
        requested_role: requestedRole,
        password: regForm.password || regForm.username,
        admission_year,
      };
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccessMsg(data.message || 'Registration submitted! Awaiting Super Admin approval.');
      setMode('login');
      setRegForm({
        full_name: '', username: '', email: '', password: '', phone: '',
        program: 'BTECH', branch: 'CSE', section: 'Aided', gender: 'Male',
        year_level: '1', club_id: '', club_role: 'MEMBER',
        mentor_club_id: '', designation: '', department: '',
      });
    } catch (err) { setError(err.message || 'Registration failed. Please try again.'); }
    setLoading(false);
  };

  const yearOptions = regForm.program === 'MTECH'
    ? [{ v: '1', l: '1st Year' }, { v: '2', l: '2nd Year' }]
    : [{ v: '1', l: '1st Year' }, { v: '2', l: '2nd Year' }, { v: '3', l: '3rd Year' }, { v: '4', l: '4th Year' }];

  return (
    <>
      <style>{`
        .axis-input::placeholder { color: rgba(100,116,139,0.4); font-size: 11px; }
        .axis-input option { background: #0f172a; color: #e2e8f0; }
        .login-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .login-btn:active { transform: scale(0.98); }
        .tab-btn:hover { background: rgba(255,255,255,0.03); }
        .role-card:hover { border-color: rgba(99,102,241,0.45) !important; transform: translateY(-1px); }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(100,116,139,0.3); border-radius: 4px; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-in { animation: fadeInUp 0.5s ease-out; }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg,#080e1a 0%,#0d1525 50%,#0a101e 100%)',
        fontFamily: "'Inter',-apple-system,sans-serif", padding: '24px 16px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background orbs */}
        <div style={{ position:'absolute', top:'-10%', right:'-10%', width:'40%', height:'40%', background:'radial-gradient(circle,rgba(239,68,68,0.05) 0%,transparent 70%)', filter:'blur(60px)' }}/>
        <div style={{ position:'absolute', bottom:'-10%', left:'-10%', width:'40%', height:'40%', background:'radial-gradient(circle,rgba(99,102,241,0.05) 0%,transparent 70%)', filter:'blur(60px)' }}/>

        <div style={{ width: '100%', maxWidth: 440, zIndex: 10 }} className="fade-in">
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: '0 8px 24px rgba(239,68,68,0.25)' }}>🛡️</div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.5px' }}>
              AXIS <span style={{ fontWeight: 400, color: '#64748b', fontSize: 16 }}>Governance</span>
            </h1>
          </div>

          <div style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(20px)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', padding: '28px', boxShadow: '0 32px 64px -12px rgba(0,0,0,0.6)' }}>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 1, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 10, marginBottom: 24 }}>
              {[{ id: 'login', label: 'Sign In' }, { id: 'register', label: 'Register' }].map(t => (
                <button key={t.id} onClick={() => { setMode(t.id); setError(''); setSuccessMsg(''); }} className="tab-btn"
                  style={{ flex: 1, padding: '8px', border: 'none', background: mode === t.id ? 'rgba(239,68,68,0.1)' : 'transparent', color: mode === t.id ? '#fca5a5' : '#64748b', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s', fontFamily: 'inherit' }}>
                  {t.label}
                </button>
              ))}
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ flexShrink: 0 }}>⚠️</span> {error}
              </div>
            )}
            {successMsg && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', padding: '10px 14px', borderRadius: 8, fontSize: 12, marginBottom: 18, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ flexShrink: 0 }}>✅</span> {successMsg}
              </div>
            )}

            {/* ── LOGIN ── */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap: 18 }}>
                <div>
                  <label style={LABEL}>User ID (PRN / Employee ID)</label>
                  <input {...inp('uid')} placeholder="Enter your PRN or Employee ID" required
                    value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
                </div>
                <div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <label style={LABEL}>Password</label>
                    <button type="button" onClick={() => alert('Please contact the Super Admin to reset your password.')}
                      style={{ background:'none', border:'none', color:'#dc2626', fontSize: 10, fontWeight: 600, cursor:'pointer', marginBottom: 4, fontFamily: 'inherit' }}>
                      Forgot?
                    </button>
                  </div>
                  <input type="password" {...inp('pwd')} placeholder="••••••••" required
                    value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                </div>

                <button type="submit" disabled={loading} className="login-btn"
                  style={{ marginTop: 8, padding: '12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
                  {loading ? 'Authenticating...' : <>Secure Entry →</>}
                </button>
                <p style={{ fontSize: 10, color: 'rgba(100,116,139,0.5)', textAlign: 'center', margin: 0 }}>
                  All accounts require Super Admin approval before first login
                </p>
              </form>
            )}

            {/* ── REGISTER ── */}
            {mode === 'register' && (
              <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap: 13 }}>

                {/* Role picker */}
                <div>
                  <label style={{ ...LABEL, marginBottom: 8 }}>I am registering as</label>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 8 }}>
                    {[
                      { k:'STUDENT',     label:'Student',     icon:'🎓', desc:'General student' },
                      { k:'CLUB_MEMBER', label:'Club Member', icon:'🏛️', desc:'Join a club' },
                      { k:'CLUB_MENTOR', label:'Club Mentor', icon:'👨‍🏫', desc:'Faculty advisor' },
                    ].map(r => (
                      <button key={r.k} type="button" onClick={() => { setRequestedRole(r.k); setError(''); }} className="role-card"
                        style={{ padding:'10px 8px', borderRadius: 8, border: requestedRole === r.k ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.07)', background: requestedRole === r.k ? 'rgba(99,102,241,0.1)' : 'transparent', cursor:'pointer', textAlign:'center', transition:'all 0.2s', fontFamily:'inherit' }}>
                        <div style={{ fontSize: 18, marginBottom: 3 }}>{r.icon}</div>
                        <p style={{ margin:0, fontSize: 10, fontWeight: 700, color: requestedRole === r.k ? '#818cf8' : '#94a3b8' }}>{r.label}</p>
                        <p style={{ margin:0, fontSize: 9, color:'rgba(100,116,139,0.55)', marginTop: 1 }}>{r.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.05)', margin:'2px 0' }}/>

                {/* Common fields */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={LABEL}>Full Name *</label>
                    <input {...inp('fn')} placeholder="e.g. Rahul Sharma" required
                      value={regForm.full_name} onChange={e => setRegForm({ ...regForm, full_name: e.target.value })} />
                  </div>
                  <div style={{ gridColumn:'1/-1' }}>
                    <label style={LABEL}>Email Address *</label>
                    <input type="email" {...inp('em')} placeholder="you@college.edu" required
                      value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
                  </div>
                  <div>
                    <label style={LABEL}>Phone</label>
                    <input {...inp('ph')} placeholder="+91 9XXXXXXXXX"
                      value={regForm.phone} onChange={e => setRegForm({ ...regForm, phone: e.target.value })} />
                  </div>

                  {/* Student / Club Member fields */}
                  {requestedRole !== 'CLUB_MENTOR' && (<>
                    <div>
                      <label style={LABEL}>PRN (User ID) *</label>
                      <input {...inp('prn')} placeholder="8-digit PRN e.g. 23510001" required maxLength={8}
                        value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value })} />
                    </div>
                    <div>
                      <label style={LABEL}>Password <span style={{ textTransform:'none', fontWeight:400, color:'rgba(100,116,139,0.45)' }}>(default: PRN)</span></label>
                      <input type="password" {...inp('pw')} placeholder="Leave blank to use PRN"
                        value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} />
                    </div>
                    <div>
                      <label style={LABEL}>Program *</label>
                      <select {...inp('prog')} value={regForm.program} onChange={e => setRegForm({ ...regForm, program: e.target.value, year_level: '1' })}>
                        <option value="BTECH">B.Tech</option>
                        <option value="MTECH">M.Tech</option>
                      </select>
                    </div>
                    <div>
                      <label style={LABEL}>Current Year *</label>
                      <select {...inp('yrl')} value={regForm.year_level} onChange={e => setRegForm({ ...regForm, year_level: e.target.value })}>
                        {yearOptions.map(y => <option key={y.v} value={y.v}>{y.l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={LABEL}>Branch *</label>
                      <select {...inp('br')} value={regForm.branch} onChange={e => setRegForm({ ...regForm, branch: e.target.value })}>
                        {BRANCHES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={LABEL}>Section</label>
                      <select {...inp('sec')} value={regForm.section} onChange={e => setRegForm({ ...regForm, section: e.target.value })}>
                        {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={LABEL}>Gender</label>
                      <select {...inp('gen')} value={regForm.gender} onChange={e => setRegForm({ ...regForm, gender: e.target.value })}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </>)}

                  {/* Mentor-specific fields */}
                  {requestedRole === 'CLUB_MENTOR' && (<>
                    <div>
                      <label style={LABEL}>Employee ID *</label>
                      <input {...inp('eid')} placeholder="e.g. FAC2023001" required
                        value={regForm.username} onChange={e => setRegForm({ ...regForm, username: e.target.value })} />
                    </div>
                    <div>
                      <label style={LABEL}>Password *</label>
                      <input type="password" {...inp('mpw')} placeholder="Set a secure password" required
                        value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} />
                    </div>
                    <div>
                      <label style={LABEL}>Designation</label>
                      <input {...inp('des')} placeholder="e.g. Assistant Professor"
                        value={regForm.designation} onChange={e => setRegForm({ ...regForm, designation: e.target.value })} />
                    </div>
                    <div>
                      <label style={LABEL}>Department</label>
                      <input {...inp('dept')} placeholder="e.g. Computer Engineering"
                        value={regForm.department} onChange={e => setRegForm({ ...regForm, department: e.target.value })} />
                    </div>
                  </>)}
                </div>

                {/* Club Member – club selection */}
                {requestedRole === 'CLUB_MEMBER' && (
                  <>
                    <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.05)', margin:'2px 0' }}/>
                    <p style={{ margin:0, fontSize:10, fontWeight:700, color:'#818cf8', textTransform:'uppercase', letterSpacing:'0.5px' }}>Club Membership Details</p>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <div style={{ gridColumn:'1/-1' }}>
                        <label style={LABEL}>Select Club *</label>
                        <select {...inp('ci')} required value={regForm.club_id} onChange={e => setRegForm({ ...regForm, club_id: e.target.value })}>
                          <option value="">— Choose a club —</option>
                          {clubs.map(c => <option key={c.id} value={c.id}>{c.name}{c.category ? ` (${c.category})` : ''}</option>)}
                        </select>
                      </div>
                      <div style={{ gridColumn:'1/-1' }}>
                        <label style={LABEL}>Your Role in the Club</label>
                        <select {...inp('cr')} value={regForm.club_role} onChange={e => setRegForm({ ...regForm, club_role: e.target.value })}>
                          {CLUB_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        <p style={{ margin:'4px 0 0', fontSize:9, color:'rgba(100,116,139,0.45)', lineHeight:1.4 }}>
                          Leaders (President, VP, Secretary, Lead) gain event management access upon approval.
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Club Mentor – club selector */}
                {requestedRole === 'CLUB_MENTOR' && (
                  <>
                    <hr style={{ border:'none', borderTop:'1px solid rgba(255,255,255,0.05)', margin:'2px 0' }}/>
                    <p style={{ margin:0, fontSize:10, fontWeight:700, color:'#818cf8', textTransform:'uppercase', letterSpacing:'0.5px' }}>Primary Club to Mentor</p>
                    <div>
                      <label style={LABEL}>Select Club *</label>
                      <select {...inp('mc')} required value={regForm.mentor_club_id} onChange={e => setRegForm({ ...regForm, mentor_club_id: e.target.value })}>
                        <option value="">— Select a club —</option>
                        {clubs.map(c => <option key={c.id} value={c.id}>{c.name}{c.category ? ` (${c.category})` : ''}</option>)}
                      </select>
                      <p style={{ margin:'4px 0 0', fontSize:9, color:'rgba(100,116,139,0.45)', lineHeight:1.4 }}>
                        You can request a second club through your dashboard after approval. Maximum: 2 clubs.
                      </p>
                    </div>
                  </>
                )}

                <button type="submit" disabled={loading} className="login-btn"
                  style={{ marginTop: 4, padding:'10px', borderRadius: 7, border:'none', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', fontSize:13, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition:'all 0.2s', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(99,102,241,0.3)' }}>
                  {loading ? 'Submitting…' : 'Submit Registration →'}
                </button>
                <p style={{ fontSize:10, color:'rgba(100,116,139,0.5)', textAlign:'center', margin:0 }}>
                  📋 Registration requires Super Admin approval before you can log in
                </p>
              </form>
            )}
          </div>
          <p style={{ textAlign:'center', marginTop:14, fontSize:10, color:'rgba(100,116,139,0.4)' }}>
            © 2025 AXIS Campus Portal · Secure · Role-Based Access Control
          </p>
        </div>
      </div>
    </>
  );
};
