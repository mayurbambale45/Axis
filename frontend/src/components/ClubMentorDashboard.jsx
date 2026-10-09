import React, { useState, useEffect } from 'react';

/* ────────────────────────────────────────────
   API BASE
   ──────────────────────────────────────────── */
const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/mentor`;

/* ────────────────────────────────────────────
   SIDEBAR NAV
   ──────────────────────────────────────────── */
const navItems = [
  { section: 'Overview', items: [
    { id: 'dashboard',   icon: '📊', label: 'Dashboard' },
    { id: 'events',      icon: '📅', label: 'Event Progress' },
  ]},
  { section: 'Management', items: [
    { id: 'budget',      icon: '💰', label: 'Budget Review' },
    { id: 'suggestions', icon: '💡', label: 'Suggestion Panel' },
  ]},
  { section: 'Account', items: [
    { id: 'settings',    icon: '⚙️',  label: 'Settings' },
  ]},
];

const Sidebar = ({ activeTab, setActiveTab }) => (
  <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white/70 dark:bg-surface-900/80 backdrop-blur-xl border-r border-surface-200/50 dark:border-surface-800/50 flex flex-col py-6 px-4 z-50">
    <div className="flex items-center gap-3 px-3 mb-8">
      <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-brand-500 rounded-xl flex items-center justify-center text-white text-base shrink-0 shadow-lg shadow-violet-500/20">🎓</div>
      <div>
        <span className="text-xl font-extrabold bg-gradient-to-r from-brand-500 to-violet-500 bg-clip-text text-transparent tracking-tight block leading-tight">AXIS</span>
        <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider block mt-0.5">Mentor Panel</span>
      </div>
    </div>
    <nav className="flex-1 space-y-0.5 overflow-y-auto">
      {navItems.map(group => (
        <div key={group.section}>
          <p className="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-surface-400 dark:text-surface-500">{group.section}</p>
          {group.items.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group
                ${activeTab === item.id
                  ? 'bg-violet-500/10 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 font-semibold'
                  : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100/80 dark:hover:bg-surface-800/50 hover:text-surface-700 dark:hover:text-surface-200'}`}
            >
              {activeTab === item.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-violet-500 rounded-r-full" />}
              <span className="text-base transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </nav>
  </aside>
);

/* ────────────────────────────────────────────
   TOP BAR
   ──────────────────────────────────────────── */
const TopBar = ({ isDark, toggleTheme, onLogout, userName, onOpenSettings }) => (
  <header className="fixed top-0 left-60 right-0 h-16 bg-white/60 dark:bg-surface-900/60 backdrop-blur-2xl border-b border-surface-200/40 dark:border-surface-800/40 flex items-center justify-between px-8 z-40">
    <p className="text-sm text-surface-400 dark:text-surface-500">
      {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
    </p>
    <div className="flex items-center gap-3">
      <span className="px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-500 dark:text-violet-400 text-xs font-bold border border-violet-500/10">🎓 Faculty Mentor</span>
      <button onClick={toggleTheme} className="w-9 h-9 rounded-xl border border-surface-200/60 dark:border-surface-700/50 bg-white/50 dark:bg-surface-800/30 flex items-center justify-center text-sm hover:bg-violet-500/10 hover:border-violet-400/50 hover:scale-105 hover:rotate-12 transition-all duration-300">
        {isDark ? '☀️' : '🌙'}
      </button>
      <div className="w-px h-7 bg-surface-200/50 dark:bg-surface-700/50 mx-1" />
      {/* Avatar — click opens Settings > Profile */}
      <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => onOpenSettings('profile')}>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-brand-500 flex items-center justify-center text-white text-sm font-bold group-hover:scale-105 group-hover:ring-2 group-hover:ring-violet-400/50 transition-all duration-300">
          {(userName || 'M').charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold leading-tight">{userName || 'Mentor'}</p>
          <p className="text-[11px] text-surface-400">Club Mentor</p>
        </div>
      </div>
      <button onClick={onLogout} className="ml-2 text-xs font-semibold text-surface-400 hover:text-red-400 uppercase tracking-wider transition">Sign Out</button>
    </div>
  </header>
);

/* ────────────────────────────────────────────
   BADGE
   ──────────────────────────────────────────── */
const Badge = ({ label, color }) => {
  const map = {
    green:  'bg-emerald-500/10 text-emerald-500',
    red:    'bg-red-500/10 text-red-500',
    amber:  'bg-amber-500/10 text-amber-500',
    brand:  'bg-brand-500/10 text-brand-500',
    violet: 'bg-violet-500/10 text-violet-500',
    gray:   'bg-surface-200/60 dark:bg-surface-800/60 text-surface-500',
  };
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${map[color] || map.gray}`}>{label}</span>;
};

/* ────────────────────────────────────────────
   CIRCULAR PROGRESS
   ──────────────────────────────────────────── */
const CircleProgress = ({ pct, color = '#8b5cf6', size = 64 }) => {
  const r = 26, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="30" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-surface-200 dark:text-surface-700" />
      <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 30 30)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x="30" y="35" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold" className="fill-current text-surface-800 dark:text-surface-200">{pct}%</text>
    </svg>
  );
};

/* ════════════════════════════════════════════
   MAIN DASHBOARD
   ════════════════════════════════════════════ */
export const ClubMentorDashboard = ({ mentorId, userName, userEmail, userPhone, designation, department, mentorClubIds = [], isDark, toggleTheme, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [activeClubId, setActiveClubId] = useState(mentorClubIds[0] || null);
  const [profile, setProfile] = useState({
    full_name: userName || 'Mentor',
    email: userEmail || '',
    phone: userPhone || '',
    department: department || '',
    designation: designation || 'Faculty Advisor',
    bio: '',
  });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [security, setSecurity] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const openSettings = (tab = 'profile') => { setActiveTab('settings'); setSettingsTab(tab); };
  const [overview, setOverview] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [budgetItems, setBudgetItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allMentorClubs, setAllMentorClubs] = useState([]);
  const [newSuggestion, setNewSuggestion] = useState({ title: '', body: '', category: 'GENERAL', priority: 'MEDIUM', event_id: '' });
  const [showSugForm, setShowSugForm] = useState(false);
  const [budgetNote, setBudgetNote] = useState({});

  const activeMentorId = mentorId || 'demo-mentor';

  useEffect(() => {
    fetchOverview();
    fetchSuggestions();
  }, [activeClubId]);

  useEffect(() => {
    if (activeClubId) fetchBudget();
  }, [activeClubId, overview]);

  const fetchOverview = async () => {
    try {
      const url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/mentor/overview?mentor_id=${activeMentorId}${activeClubId ? `&club_id=${activeClubId}` : ''}`;
      const r = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } });
      if (r.ok) {
        const data = await r.json();
        setOverview(data);
        if (data.mentorClubs) setAllMentorClubs(data.mentorClubs);
        if (!activeClubId && data.activeClubId) setActiveClubId(data.activeClubId);
      } else setOverview(null);
    } catch { setOverview(null); }
    setLoading(false);
  };

  const fetchSuggestions = async () => {
    try {
      const r = await fetch(`${API}/suggestions?mentor_id=${activeMentorId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } });
      if (r.ok) setSuggestions(await r.json());
    } catch {}
  };

  const fetchBudget = async () => {
    try {
      const clubId = activeClubId || overview?.club?.id;
      if (!clubId) return;
      const r = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/mentor/budget?club_id=${clubId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` } });
      if (r.ok) setBudgetItems(await r.json());
      else setBudgetItems([]);
    } catch { setBudgetItems([]); }
  };

  const handleChangePassword = async () => {
    setPwError(''); setPwSuccess('');
    if (!security.oldPassword || !security.newPassword) return setPwError('All fields are required.');
    if (security.newPassword !== security.confirmPassword) return setPwError('Passwords do not match.');
    if (security.newPassword.length < 6) return setPwError('Min 6 characters required.');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: activeMentorId, old_password: security.oldPassword, new_password: security.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPwSuccess('Password changed successfully!');
      setSecurity({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setPwError(err.message || 'Failed to change password.'); }
  };

  const requestSecondClub = async (clubId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/mentor/request-club`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify({ user_id: activeMentorId, club_id: clubId }),
      });
      const data = await res.json();
      alert(data.message);
    } catch { alert('Request could not be sent.'); }
  };

  const postSuggestion = async () => {
    if (!newSuggestion.title.trim() || !newSuggestion.body.trim()) return;
    await fetch(`${API}/suggestions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      body: JSON.stringify({ ...newSuggestion, mentor_id: activeMentorId, club_id: overview?.club?.id || 'demo' })
    });
    setNewSuggestion({ title: '', body: '', category: 'GENERAL', priority: 'MEDIUM', event_id: '' });
    setShowSugForm(false);
    fetchSuggestions();
  };

  const reviewBudget = async (id, status) => {
    await fetch(`${API}/budget/${id}/review`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      body: JSON.stringify({ approval_status: status, mentor_note: budgetNote[id] || '' })
    });
    fetchBudget();
  };

  // ── DEMO DATA for frontend-only mode ──
  const demoEvents = [
    { id: 'e1', title: 'AI Hackathon 2026', totalRegistrations: 120, checkedIn: 87, attendanceRate: 72, totalBudgetSpend: 18500, approvedBudget: 15000, budgetItems: [] },
    { id: 'e2', title: 'Cultural Night: Resonance', totalRegistrations: 200, checkedIn: 178, attendanceRate: 89, totalBudgetSpend: 32000, approvedBudget: 28000, budgetItems: [] },
    { id: 'e3', title: 'Robotics Workshop', totalRegistrations: 60, checkedIn: 42, attendanceRate: 70, totalBudgetSpend: 9200, approvedBudget: 8000, budgetItems: [] },
  ];
  const demoSuggestions = [
    { id: 's1', title: 'Improve post-event feedback collection', body: 'Recommend adding a structured Google Form linked in the thank-you email to boost response rates.', category: 'GENERAL', priority: 'MEDIUM', status: 'PENDING', event: null, createdAt: new Date().toISOString() },
    { id: 's2', title: 'Budget ceiling for refreshments', body: 'Per college policy, catering expenses must not exceed ₹150 per head. Please revise the Cultural Night estimate.', category: 'BUDGET', priority: 'HIGH', status: 'ACKNOWLEDGED', event: { title: 'Cultural Night: Resonance' }, createdAt: new Date().toISOString() },
    { id: 's3', title: 'Sponsor outreach for Hackathon', body: 'Have you reached out to TechCorp India? They offered sponsorship last year. CC me on the email.', category: 'OUTREACH', priority: 'HIGH', status: 'IMPLEMENTED', event: { title: 'AI Hackathon 2026' }, createdAt: new Date().toISOString() },
  ];
  const demoBudget = [
    { id: 'b1', description: 'Venue Booking – Seminar Hall', category: 'VENUE', estimated_amount: 5000, actual_amount: null, approval_status: 'APPROVED', mentor_note: 'Good choice, within budget.', event: { title: 'AI Hackathon 2026' } },
    { id: 'b2', description: 'Refreshments (120 pax × ₹150)', category: 'CATERING', estimated_amount: 18000, actual_amount: null, approval_status: 'REVISION_REQUESTED', mentor_note: 'Please reduce to ₹150/head per policy.', event: { title: 'Cultural Night: Resonance' } },
    { id: 'b3', description: 'Printing & Banners', category: 'MARKETING', estimated_amount: 3200, actual_amount: null, approval_status: 'PENDING', mentor_note: null, event: { title: 'AI Hackathon 2026' } },
    { id: 'b4', description: 'Prize Pool – Winners', category: 'PRIZES', estimated_amount: 10000, actual_amount: null, approval_status: 'APPROVED', mentor_note: 'Approved. Ensure receipts collected.', event: { title: 'Robotics Workshop' } },
  ];

  // Use REAL data only — no demo fallbacks. Show empty state when no data.
  const events = overview?.eventSummaries || [];
  const sug    = suggestions;
  const budget = budgetItems;
  const club   = overview?.club || { name: 'Your Club', mission_statement: 'Welcome to your club dashboard.' };

  const statusColor = (s) => ({ PENDING: 'amber', APPROVED: 'green', REJECTED: 'red', REVISION_REQUESTED: 'violet', ACKNOWLEDGED: 'brand', IMPLEMENTED: 'green', DISMISSED: 'gray' }[s] || 'gray');
  const prioColor   = (p) => ({ HIGH: 'red', MEDIUM: 'amber', LOW: 'brand' }[p] || 'gray');

  return (
    <div className="min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); if (t === 'settings') setSettingsTab('profile'); }} />
      <TopBar isDark={isDark} toggleTheme={toggleTheme} onLogout={onLogout} userName={userName} onOpenSettings={openSettings} />

      {/* Club Switcher — shown when mentor oversees multiple clubs */}
      {allMentorClubs.length > 1 && (
        <div className="fixed top-16 left-60 right-0 z-30 bg-surface-900/80 backdrop-blur-md border-b border-surface-800/50 px-8 py-2 flex items-center gap-3">
          <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">Active Club:</span>
          {allMentorClubs.map(c => (
            <button key={c.id} onClick={() => setActiveClubId(c.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${activeClubId === c.id ? 'bg-violet-500/15 border-violet-500/30 text-violet-400' : 'bg-transparent border-surface-700/40 text-surface-500 hover:text-surface-300'}`}>
              {c.name}
            </button>
          ))}
          {allMentorClubs.length < 2 && (
            <span className="ml-auto text-xs text-surface-500">You can request a 2nd club from Settings</span>
          )}
        </div>
      )}

      <main className={`ml-60 p-8 ${allMentorClubs.length > 1 ? 'mt-28' : 'mt-16'}`}>

        {/* ══════ DASHBOARD ══════ */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
              <p className="text-surface-400 text-sm mt-1">
                Oversight of <span className="font-semibold text-violet-500">{club.name}</span> — events, budget, and student guidance.
              </p>
            </div>

            {/* Club info banner */}
            <div className="animate-slide-up stagger-1 relative overflow-hidden bg-gradient-to-r from-violet-600 to-brand-500 rounded-2xl p-6 text-white">
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-violet-200 text-xs font-semibold uppercase tracking-wider mb-1">Assigned Club</p>
                  <h2 className="text-2xl font-extrabold">{club.name}</h2>
                  <p className="text-white/70 text-sm mt-1 max-w-md">{club.mission_statement}</p>
                </div>
                <div className="text-6xl opacity-30">🎓</div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { icon: '📅', label: 'Total Events', value: events.length, color: 'violet' },
                { icon: '👥', label: 'Total Registrations', value: events.reduce((s, e) => s + e.totalRegistrations, 0), color: 'brand' },
                { icon: '✅', label: 'Total Check-ins', value: events.reduce((s, e) => s + e.checkedIn, 0), color: 'green' },
                { icon: '💡', label: 'Suggestions Given', value: sug.length, color: 'amber' },
              ].map((s, i) => (
                <div key={i} className={`animate-slide-up stagger-${i+2} p-5 bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl hover-lift`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{s.icon}</span>
                    <Badge label={s.color === 'green' ? 'Active' : 'Total'} color={s.color} />
                  </div>
                  <p className="text-3xl font-extrabold">{s.value}</p>
                  <p className="text-xs text-surface-400 font-medium mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Budget alerts */}
            {budget.filter(b => b.approval_status === 'PENDING').length > 0 && (
              <div className="animate-slide-up stagger-4 flex items-center gap-4 p-4 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl shrink-0">⚠️</div>
                <div>
                  <p className="font-semibold text-amber-600 dark:text-amber-400">
                    {budget.filter(b => b.approval_status === 'PENDING').length} budget items awaiting your review
                  </p>
                  <p className="text-xs text-surface-400">Click <button className="text-amber-500 underline underline-offset-2" onClick={() => setActiveTab('budget')}>Budget Review</button> to action them.</p>
                </div>
              </div>
            )}

            {/* Quick suggestion */}
            <div className="animate-slide-up stagger-5 p-6 bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Recent Suggestions</h2>
                <button onClick={() => setActiveTab('suggestions')} className="text-sm font-medium text-violet-500 hover:text-violet-400 transition">View All →</button>
              </div>
              <div className="space-y-3">
                {sug.slice(0, 3).map(s => (
                  <div key={s.id} className="flex items-start gap-3 p-3 rounded-xl bg-surface-50/50 dark:bg-surface-800/30 border border-surface-200/30 dark:border-surface-700/30">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-sm shrink-0">💡</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{s.title}</p>
                      <p className="text-xs text-surface-400 truncate mt-0.5">{s.body}</p>
                    </div>
                    <Badge label={s.status} color={statusColor(s.status)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════ EVENT PROGRESS ══════ */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold">Event Progress</h1>
              <p className="text-surface-400 text-sm mt-1">Attendance rates, registrations, and budget spend per event.</p>
            </div>
            <div className="space-y-5">
              {events.map((evt, i) => (
                <div key={evt.id} className={`animate-slide-up stagger-${Math.min(i+1,6)} bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6`}>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold">{evt.title}</h3>
                      <p className="text-sm text-surface-400">{evt.totalRegistrations} registered · {evt.checkedIn} attended</p>
                    </div>
                    <Badge label={evt.attendanceRate >= 80 ? 'Excellent' : evt.attendanceRate >= 60 ? 'Good' : 'Needs Attention'}
                           color={evt.attendanceRate >= 80 ? 'green' : evt.attendanceRate >= 60 ? 'brand' : 'red'} />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {/* Attendance ring */}
                    <div className="flex flex-col items-center gap-2">
                      <CircleProgress pct={evt.attendanceRate} color={evt.attendanceRate >= 80 ? '#10b981' : evt.attendanceRate >= 60 ? '#06b6d4' : '#ef4444'} />
                      <p className="text-xs font-semibold text-surface-500">Attendance Rate</p>
                    </div>

                    {/* Progress bars */}
                    <div className="col-span-2 space-y-4">
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-medium text-surface-600 dark:text-surface-400">Registrations</span>
                          <span className="font-bold">{evt.checkedIn} / {evt.totalRegistrations}</span>
                        </div>
                        <div className="h-2.5 bg-surface-200/50 dark:bg-surface-700/50 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500 rounded-full transition-all duration-700"
                               style={{ width: `${evt.totalRegistrations > 0 ? Math.round((evt.checkedIn/evt.totalRegistrations)*100) : 0}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-medium text-surface-600 dark:text-surface-400">Budget Utilisation</span>
                          <span className="font-bold">₹{evt.approvedBudget.toLocaleString()} / ₹{evt.totalBudgetSpend.toLocaleString()} est.</span>
                        </div>
                        <div className="h-2.5 bg-surface-200/50 dark:bg-surface-700/50 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-700 ${evt.approvedBudget / evt.totalBudgetSpend > 0.9 ? 'bg-red-500' : 'bg-amber-500'}`}
                               style={{ width: `${evt.totalBudgetSpend > 0 ? Math.min(Math.round((evt.approvedBudget/evt.totalBudgetSpend)*100), 100) : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════ BUDGET REVIEW ══════ */}
        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold">Budget Review</h1>
              <p className="text-surface-400 text-sm mt-1">Review, approve, or request revisions for club budget submissions.</p>
            </div>

            {/* Summary */}
            <div className="animate-slide-up stagger-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Pending',  count: budget.filter(b => b.approval_status === 'PENDING').length,            color: 'amber' },
                { label: 'Approved', count: budget.filter(b => b.approval_status === 'APPROVED').length,           color: 'green' },
                { label: 'Needs Revision', count: budget.filter(b => b.approval_status === 'REVISION_REQUESTED').length, color: 'violet' },
                { label: 'Rejected', count: budget.filter(b => b.approval_status === 'REJECTED').length,           color: 'red' },
              ].map((s, i) => (
                <div key={i} className="p-4 bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-xl text-center">
                  <p className="text-2xl font-extrabold">{s.count}</p>
                  <Badge label={s.label} color={s.color} />
                </div>
              ))}
            </div>

            {/* Budget items table */}
            <div className="animate-slide-up stagger-2 bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200/50 dark:border-surface-800/50 bg-surface-50/30 dark:bg-surface-800/20">
                    {['Description', 'Event', 'Category', 'Est. Amount', 'Status', 'Mentor Note', 'Action'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-surface-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {budget.map((item, i) => (
                    <tr key={item.id} className="border-b border-surface-100/50 dark:border-surface-800/30 hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-all duration-200">
                      <td className="py-3.5 px-4 font-semibold">{item.description}</td>
                      <td className="py-3.5 px-4 text-surface-500 text-xs">{item.event?.title || '—'}</td>
                      <td className="py-3.5 px-4"><Badge label={item.category} color="brand" /></td>
                      <td className="py-3.5 px-4 font-bold text-surface-700 dark:text-surface-300">₹{item.estimated_amount.toLocaleString()}</td>
                      <td className="py-3.5 px-4"><Badge label={item.approval_status.replace('_', ' ')} color={statusColor(item.approval_status)} /></td>
                      <td className="py-3.5 px-4">
                        {item.approval_status === 'PENDING' ? (
                          <input value={budgetNote[item.id] || ''} onChange={e => setBudgetNote({ ...budgetNote, [item.id]: e.target.value })}
                            className="input-soft !py-1.5 !text-xs w-48" placeholder="Add note…" />
                        ) : (
                          <span className="text-xs text-surface-400 italic max-w-[160px] block truncate">{item.mentor_note || '—'}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.approval_status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button onClick={() => reviewBudget(item.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition">✓ Approve</button>
                            <button onClick={() => reviewBudget(item.id, 'REVISION_REQUESTED')}
                              className="px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-bold hover:bg-violet-500/20 transition">↩ Revise</button>
                            <button onClick={() => reviewBudget(item.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition">✕ Reject</button>
                          </div>
                        )}
                        {item.approval_status !== 'PENDING' && <span className="text-xs text-surface-400">Reviewed</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════ SUGGESTION PANEL ══════ */}
        {activeTab === 'suggestions' && (
          <div className="space-y-6">
            <div className="flex items-start justify-between animate-fade-in">
              <div>
                <h1 className="text-2xl font-bold">Suggestion Panel</h1>
                <p className="text-surface-400 text-sm mt-1">Post guidance, advice, and recommendations to your club.</p>
              </div>
              <button onClick={() => setShowSugForm(!showSugForm)}
                className="btn-brand bg-violet-500 hover:bg-violet-600 shadow-violet-500/20">
                + New Suggestion
              </button>
            </div>

            {/* New Suggestion Form */}
            {showSugForm && (
              <div className="animate-scale-in bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-violet-500/20 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-violet-500">New Suggestion</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">Title</label>
                    <input className="input-soft" placeholder="Suggestion title…"
                      value={newSuggestion.title} onChange={e => setNewSuggestion({...newSuggestion, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">Category</label>
                    <select className="input-soft" value={newSuggestion.category} onChange={e => setNewSuggestion({...newSuggestion, category: e.target.value})}>
                      {['GENERAL', 'BUDGET', 'EVENT_PLANNING', 'SAFETY', 'ACADEMIC', 'OUTREACH'].map(c => (
                        <option key={c} value={c}>{c.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">Priority</label>
                    <select className="input-soft" value={newSuggestion.priority} onChange={e => setNewSuggestion({...newSuggestion, priority: e.target.value})}>
                      {['LOW', 'MEDIUM', 'HIGH'].map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">Linked Event (Optional)</label>
                    <select className="input-soft" value={newSuggestion.event_id} onChange={e => setNewSuggestion({...newSuggestion, event_id: e.target.value})}>
                      <option value="">— General (not event-specific) —</option>
                      {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-1.5">Message / Guidance</label>
                  <textarea rows={4} className="input-soft resize-none" placeholder="Write your suggestion, recommendation, or guidance here…"
                    value={newSuggestion.body} onChange={e => setNewSuggestion({...newSuggestion, body: e.target.value})} />
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowSugForm(false)} className="btn-outline-brand">Cancel</button>
                  <button onClick={postSuggestion} className="btn-brand bg-violet-500 hover:bg-violet-600 shadow-violet-500/20">Post Suggestion</button>
                </div>
              </div>
            )}

            {/* Suggestions list */}
            <div className="space-y-4">
              {sug.map((s, i) => (
                <div key={s.id} className={`animate-slide-up stagger-${Math.min(i+1,6)} bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-5 hover-lift`}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-xl shrink-0">
                        {({ GENERAL:'💡', BUDGET:'💰', EVENT_PLANNING:'📅', SAFETY:'🛡️', ACADEMIC:'📚', OUTREACH:'📣' }[s.category] || '💡')}
                      </div>
                      <div>
                        <h3 className="font-bold">{s.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge label={s.category.replace('_', ' ')} color="violet" />
                          {s.event && <span className="text-[11px] text-surface-400">· {s.event.title}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge label={s.priority} color={prioColor(s.priority)} />
                      <Badge label={s.status} color={statusColor(s.status)} />
                    </div>
                  </div>
                  <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed pl-13 ml-13">{s.body}</p>
                  <p className="text-[11px] text-surface-400 mt-3 pl-13 ml-13">
                    {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              ))}
              {sug.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3 animate-float">💡</p>
                  <p className="text-surface-400">No suggestions posted yet. Share your first guidance above!</p>
                </div>
              )}
            </div>
          </div>
        )}


        {/* ══════ SETTINGS ══════ */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-surface-400 text-sm mt-1">Manage your mentor profile, preferences, and security.</p>
            </div>

            <div className="flex gap-8">
              {/* Settings sidebar */}
              <div className="w-56 shrink-0">
                <nav className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-3 space-y-1 sticky top-24">
                  {[
                    { id: 'profile', icon: '👤', label: 'Profile' },
                    { id: 'access',  icon: '🛡️', label: 'Access & Role' },
                    { id: 'security',icon: '🔒', label: 'Security' },
                  ].map(s => (
                    <button key={s.id} onClick={() => setSettingsTab(s.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${settingsTab === s.id ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400 font-semibold' : 'text-surface-500 hover:bg-surface-100/80 dark:hover:bg-surface-800/50'}`}>
                      <span>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="flex-1 min-w-0">
                {settingsTab === 'profile' && (
                  <div className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6 space-y-5">
                    <h2 className="text-lg font-bold">Profile Information</h2>
                    <div className="flex items-center gap-5 p-4 bg-surface-50/50 dark:bg-surface-800/30 rounded-xl border border-surface-200/40 dark:border-surface-700/30">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-400 to-brand-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-violet-500/20">
                        {(profile.full_name || 'M').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{profile.full_name}</h3>
                        <p className="text-sm text-surface-400">{profile.designation}</p>
                        <p className="text-xs text-surface-400 mt-0.5">{profile.department}</p>
                      </div>
                      <button className="ml-auto btn-outline-brand text-xs">Change Photo</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { label: 'Full Name', key: 'full_name', placeholder: 'Your full name' },
                        { label: 'Email', key: 'email', placeholder: 'mentor@college.edu' },
                        { label: 'Department', key: 'department', placeholder: 'e.g. Computer Engineering' },
                        { label: 'Designation', key: 'designation', placeholder: 'e.g. Faculty Advisor' },
                        { label: 'Phone', key: 'phone', placeholder: '+91 9XXXXXXXXX' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1.5">{f.label}</label>
                          <input type="text" value={profile[f.key] || ''} placeholder={f.placeholder}
                            onChange={e => setProfile({ ...profile, [f.key]: e.target.value })}
                            className="input-soft" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1.5">Bio</label>
                      <textarea value={profile.bio || ''} placeholder="Brief professional bio..."
                        onChange={e => setProfile({ ...profile, bio: e.target.value })}
                        className="input-soft resize-none" rows={3} />
                    </div>
                    <button onClick={() => alert('Profile saved!')} className="btn-brand w-full !py-3 bg-violet-500 hover:bg-violet-600">Save Profile</button>
                  </div>
                )}

                {settingsTab === 'access' && (
                  <div className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6 space-y-5">
                    <h2 className="text-lg font-bold">Access & Role Permissions</h2>
                    <p className="text-sm text-surface-400">Your authorized actions as a Club Mentor within the AXIS platform.</p>
                    <div className="space-y-3">
                      {[
                        { label: 'View Event Progress', desc: 'Monitor attendance rates and budget utilisation', granted: true },
                        { label: 'Review Budget Items', desc: 'Approve, revise, or reject club budget submissions', granted: true },
                        { label: 'Post Suggestions', desc: 'Send guidance and recommendations to the club', granted: true },
                        { label: 'Send Student Notifications', desc: 'Broadcast alerts to students (requires Club Admin)', granted: false },
                        { label: 'Create Events', desc: 'Launch new events (requires Club Admin role)', granted: false },
                        { label: 'System Admin Access', desc: 'Access system governance controls', granted: false },
                      ].map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-surface-50/50 dark:bg-surface-800/30 border border-surface-200/30 dark:border-surface-700/30">
                          <div>
                            <p className="text-sm font-semibold">{p.label}</p>
                            <p className="text-xs text-surface-400">{p.desc}</p>
                          </div>
                          <span className={`badge-pill ${p.granted ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400'}`}>
                            {p.granted ? '✓ Granted' : '✗ Restricted'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {settingsTab === 'security' && (
                  <div className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6">
                    <h2 className="text-lg font-bold mb-4">Change Password</h2>
                    {pwError && <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{pwError}</div>}
                    {pwSuccess && <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">{pwSuccess}</div>}
                    <div className="space-y-4 max-w-md">
                      {[['oldPassword','Current Password'],['newPassword','New Password'],['confirmPassword','Confirm New Password']].map(([key, label]) => (
                        <div key={key}>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1.5">{label}</label>
                          <input type="password" className="input-soft" placeholder="••••••••"
                            value={security[key]}
                            onChange={e => { setSecurity({...security,[key]:e.target.value}); setPwError(''); setPwSuccess(''); }} />
                        </div>
                      ))}
                      <button onClick={handleChangePassword} className="btn-brand w-full !py-3 bg-violet-500 hover:bg-violet-600">Update Password</button>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
