import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import {
  useGetEventsQuery,
  useGetClubsQuery,
  useGetStudentRegistrationsQuery,
  useRegisterForEventMutation,
  usePayForTicketMutation,
  useGetStudentNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useApplyToClubMutation,
  useRequestTerminationMutation,
} from '../store/apiSlice';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

/* ═══════════════════════════════════════════════
   SIDEBAR NAV CONFIG
   ═══════════════════════════════════════════════ */
const navItems = [
  { section: 'Main', items: [
    { id: 'dashboard',    icon: '📊', label: 'Dashboard' },
    { id: 'discovery',   icon: '🔍', label: 'Explore Events' },
    { id: 'tickets',     icon: '🎫', label: 'Digital Wallet' },
    { id: 'clubs',       icon: '🏛️', label: 'Organizations' },
  ]},
  { section: 'Growth', items: [
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'certificates', icon: '📜', label: 'Certificates' },
    { id: 'leaderboard', icon: '🏆', label: 'Leaderboard' },
  ]},
  { section: 'Account', items: [
    { id: 'settings',    icon: '⚙️', label: 'Settings' },
  ]},
];

/* ═══════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════ */
const Sidebar = ({ activeTab, setActiveTab, unreadCount }) => (
  <aside className="fixed left-0 top-0 bottom-0 w-60 bg-white/70 dark:bg-surface-900/80 backdrop-blur-xl border-r border-surface-200/50 dark:border-surface-800/50 flex flex-col py-6 px-4 z-50">
    {/* Logo */}
    <div className="flex items-center gap-3 px-3 mb-8">
      <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center text-white text-base shrink-0 shadow-lg shadow-brand-500/20 animate-glow-pulse">⚡</div>
      <div>
        <span className="text-xl font-extrabold bg-gradient-to-r from-brand-500 to-brand-400 bg-clip-text text-transparent tracking-tight block leading-tight">AXIS</span>
        <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider block mt-0.5">Student Portal</span>
      </div>
    </div>

    {/* Nav */}
    <nav className="flex-1 space-y-0.5 overflow-y-auto">
      {navItems.map(group => (
        <div key={group.section}>
          <p className="px-3 pt-5 pb-2 text-[10px] font-bold uppercase tracking-[1.5px] text-surface-400 dark:text-surface-500">{group.section}</p>
          {group.items.map(item => (
            <button key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-glow w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group
                ${activeTab === item.id
                  ? 'bg-brand-500/10 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold'
                  : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100/80 dark:hover:bg-surface-800/50 hover:text-surface-700 dark:hover:text-surface-200'
                }`}
            >
              {activeTab === item.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-brand-500 rounded-r-full shadow-sm shadow-brand-500/50" />
              )}
              <span className="text-base transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
              {item.label}
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      ))}
    </nav>
  </aside>
);

/* ═══════════════════════════════════════════════
   NOTIFICATION BELL DROPDOWN
   ═══════════════════════════════════════════════ */
const NotificationBell = ({ notifications, unreadCount, onMarkRead, onMarkAll, onViewAll }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const typeIcon = (type) => ({ EVENT_ALERT: '📅', DEADLINE: '⏰', ANNOUNCEMENT: '📣', SYSTEM: '⚙️', CLUB: '🏛️' }[type] || '🔔');
  const typeColor = (type) => ({ EVENT_ALERT: 'text-brand-500', DEADLINE: 'text-red-500', ANNOUNCEMENT: 'text-emerald-500', SYSTEM: 'text-amber-500', CLUB: 'text-purple-500' }[type] || 'text-surface-400');

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl border border-surface-200/60 dark:border-surface-700/50 bg-white/50 dark:bg-surface-800/30 flex items-center justify-center text-sm hover:bg-brand-500/10 hover:border-brand-400/50 hover:scale-105 transition-all duration-200"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white dark:bg-surface-900 border border-surface-200/60 dark:border-surface-800/50 rounded-2xl shadow-xl shadow-black/10 dark:shadow-black/40 overflow-hidden z-50 animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-100 dark:border-surface-800">
            <span className="font-bold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={onMarkAll} className="text-[11px] font-semibold text-brand-500 hover:text-brand-400 transition">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-surface-100 dark:divide-surface-800">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-xs text-surface-400">You're all caught up!</p>
              </div>
            ) : notifications.slice(0, 8).map(n => (
              <div key={n.id}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50 transition ${!n.is_read ? 'bg-brand-500/3' : ''}`}
                onClick={() => { onMarkRead(n.id); setOpen(false); onViewAll(); }}
              >
                <span className={`text-lg shrink-0 mt-0.5 ${typeColor(n.type)}`}>{typeIcon(n.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${!n.is_read ? 'text-surface-900 dark:text-surface-100' : 'text-surface-500'}`}>{n.title}</p>
                  <p className="text-xs text-surface-400 mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-surface-400 mt-1">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-2" />}
              </div>
            ))}
          </div>

          {notifications.length > 0 && (
            <button onClick={() => { setOpen(false); onViewAll(); }} className="w-full py-2.5 text-xs font-bold text-brand-500 hover:bg-brand-500/5 transition border-t border-surface-100 dark:border-surface-800">
              View all notifications →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   TOP BAR
   ═══════════════════════════════════════════════ */
const TopBar = ({ isDark, toggleTheme, onLogout, userName, userRole, points, notifications, onMarkRead, onMarkAll, onOpenSettings, clubMemberships = [] }) => {
  const unread = notifications.filter(n => !n.is_read).length;
  return (
    <header className="fixed top-0 left-60 right-0 h-16 bg-white/60 dark:bg-surface-900/60 backdrop-blur-2xl border-b border-surface-200/40 dark:border-surface-800/40 flex items-center justify-between px-8 z-40">
      <p className="text-sm text-surface-400 dark:text-surface-500">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
      <div className="flex items-center gap-3">
        {/* Points */}
        <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-500/10 to-brand-400/10 text-brand-500 dark:text-brand-400 text-xs font-bold border border-brand-500/10 cursor-help">
          🔥 {points} PTS
        </div>

        {/* Notification bell */}
        <NotificationBell
          notifications={notifications}
          unreadCount={unread}
          onMarkRead={onMarkRead}
          onMarkAll={onMarkAll}
          onViewAll={() => onOpenSettings('notifications')}
        />

        <button onClick={toggleTheme} className="w-9 h-9 rounded-xl border border-surface-200/60 dark:border-surface-700/50 bg-white/50 dark:bg-surface-800/30 flex items-center justify-center text-sm hover:bg-brand-500/10 hover:border-brand-400/50 hover:scale-105 hover:rotate-12 transition-all duration-300">
          {isDark ? '☀️' : '🌙'}
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-surface-200/50 dark:bg-surface-700/50 mx-1.5" />

        {/* Avatar — click opens Settings > Profile */}
        <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => onOpenSettings('profile')}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-brand-500/20 group-hover:shadow-lg group-hover:shadow-brand-500/30 group-hover:scale-105 transition-all duration-300 ring-2 ring-transparent group-hover:ring-brand-400/50">
            {(userName || 'S').charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-tight whitespace-nowrap">{userName || 'Student'}</p>
            <p className="text-[11px] font-bold text-brand-500 uppercase whitespace-nowrap">{userRole ? userRole.replace('_', ' ') : 'STUDENT'}</p>
          </div>
        </div>

        {/* Portal Switch — Only if user has club admin/member status */}
        {clubMemberships && clubMemberships.length > 0 && (
          <button onClick={() => {
            const session = JSON.parse(localStorage.getItem('axisUser') || '{}');
            session.active_role = 'CLUB_ADMIN';
            localStorage.setItem('axisUser', JSON.stringify(session));
            window.location.reload();
          }} className="btn-outline-brand !py-1.5 !px-3 text-xs mr-2">Club Portal →</button>
        )}

        <button onClick={onLogout} className="ml-2 text-xs font-semibold text-surface-400 hover:text-red-400 uppercase tracking-wider transition-all duration-200 hover:translate-x-0.5">Sign Out</button>
      </div>
    </header>
  );
};

/* ═══════════════════════════════════════════════
   STUDENT DASHBOARD
   ═══════════════════════════════════════════════ */
export const StudentDashboard = ({ userId, userName, userEmail, userPhone, userBranch, userSection, userProgram, userYear, userAdmissionYear, userUsername, userRole, isDark, toggleTheme, onLogout, clubMemberships = [] }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [profile, setProfile] = useState({
    full_name: userName || '',
    username: userUsername || '',
    email: userEmail || '',
    phone: userPhone || '',
    section: userSection || '',
    branch: userBranch || '',
    program: userProgram || 'BTECH',
    year: userYear || '1st Year',
    admission_year: userAdmissionYear,
    bio: '',
  });
  const [notifPrefs, setNotifPrefs] = useState({
    emailEvents: true, emailDeadlines: true, emailAnnouncements: false,
    inAppAll: true, inAppDeadlines: true,
  });
  const [appearance, setAppearance] = useState({ theme: isDark ? 'dark' : 'light', compact: false });
  const [security, setSecurity] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [notifSubTab, setNotifSubTab] = useState('ALL');
  const activeStudentId = userId || '00000000-0000-0000-0000-000000000000';

  const { data: events = [], isLoading: eventsLoading } = useGetEventsQuery();
  const { data: clubs = [], isLoading: clubsLoading } = useGetClubsQuery();
  const { data: myRegistrations = [], isLoading: regsLoading } = useGetStudentRegistrationsQuery(activeStudentId);
  const { data: notifications = [], refetch: refetchNotifs } = useGetStudentNotificationsQuery(activeStudentId, {
    pollingInterval: 30000  // poll every 30s for live updates
  });
  const [registerForEvent] = useRegisterForEventMutation();
  const [payForTicket] = usePayForTicketMutation();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [applyToClub] = useApplyToClubMutation();
  const [requestTermination] = useRequestTerminationMutation();

  const [applicationModal, setApplicationModal] = useState({ show: false, club: null, board: '', position: '' });
  const [clubsSubTab, setClubsSubTab] = useState('mine');

  // Load profile from API on mount
  useEffect(() => {
    if (!userId) return;
    fetch(`${API}/student/profile/${userId}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setProfile(p => ({
        ...p,
        full_name: d.full_name || p.full_name,
        email: d.email || p.email,
        phone: d.phone || p.phone,
        section: d.section || p.section,
        branch: d.branch || p.branch,
        program: d.program || p.program,
        gender: d.gender || p.gender,
        year: d.year || p.year,
        admission_year: d.admission_year || p.admission_year,
        bio: d.bio || '',
        username: d.username || p.username,
      })))
      .catch(() => {});
  }, [userId]);

  // Evaluate user academic year strictly matching User.js virtual logic
  const getAcademicYear = () => {
    if (!profile.admission_year) return '1st Year'; // Fallback
    const now = new Date();
    const currentYear = now.getFullYear();
    const academicYearDelta = now.getMonth() >= 6 ? 1 : 0;
    const diff = currentYear - profile.admission_year + academicYearDelta;
    if (profile.program === 'MTECH') return diff <= 1 ? '1st Year' : (diff === 2 ? '2nd Year' : 'Alumni');
    return diff <= 1 ? '1st Year' : diff === 2 ? '2nd Year' : diff === 3 ? '3rd Year' : diff === 4 ? '4th Year' : 'Alumni';
  };
  const academicYear = getAcademicYear();

  const getAvailableBoard = () => {
    if (academicYear === '1st Year') return 'Member Board';
    if (academicYear === '2nd Year') return 'Assistant Board';
    if (academicYear === '3rd Year') return 'Main Board';
    if (academicYear === '4th Year') return 'Mentor Board';
    return 'Member Board';
  };

  const currentBoard = getAvailableBoard();

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      await applyToClub({
        clubId: applicationModal.club.id,
        user_id: activeStudentId,
        board: applicationModal.board,
        position: applicationModal.position
      }).unwrap();
      alert(`Application to ${applicationModal.board} submitted successfully!`);
      setApplicationModal({ show: false, club: null, board: '', position: '' });
    } catch (err) {
      alert('Error applying: ' + (err.data?.message || err.message));
    }
  };

  const handleChangePassword = async () => {
    setPwError(''); setPwSuccess('');
    if (!security.oldPassword || !security.newPassword) return setPwError('All fields are required.');
    if (security.newPassword !== security.confirmPassword) return setPwError('Passwords do not match.');
    if (security.newPassword.length < 6) return setPwError('Min 6 characters required.');
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: activeStudentId, old_password: security.oldPassword, new_password: security.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPwSuccess('Password changed successfully!');
      setSecurity({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setPwError(err.message || 'Failed to change password.'); }
  };

  const attended = myRegistrations.filter(r => r.check_in_status).length;
  const points = attended * 150;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Demo notifications if backend returns empty
  const demoNotifications = [
    { id: 'n1', title: 'AI Hackathon – Registration Deadline', body: 'Only 3 days left to register for the AI Hackathon 2026. Secure your spot now!', type: 'DEADLINE', is_read: false, createdAt: new Date().toISOString(), sender_role: 'CLUB_ADMIN' },
    { id: 'n2', title: 'Cultural Night: Resonance – Launched!', body: 'The annual Cultural Night has been launched. Early bird tickets available at ₹99.', type: 'EVENT_ALERT', is_read: false, createdAt: new Date(Date.now() - 3600000).toISOString(), sender_role: 'CLUB_ADMIN' },
    { id: 'n3', title: 'Welcome to AXIS Portal', body: 'Your account has been approved. Explore events, earn points, and connect with clubs.', type: 'SYSTEM', is_read: true, createdAt: new Date(Date.now() - 86400000).toISOString(), sender_role: 'SYSTEM' },
  ];
  const displayNotifications = notifications.length > 0 ? notifications : demoNotifications;
  const displayUnread = displayNotifications.filter(n => !n.is_read).length;

  const handleRegister = async (eventId) => {
    try { await registerForEvent({ eventId, payload: { userId: activeStudentId } }).unwrap(); alert('Registered!'); }
    catch { alert('Failed.'); }
  };
  const handlePay = async (id) => {
    try { await payForTicket({ registration_id: id }).unwrap(); alert('Payment Success! Ticket sent to email.'); }
    catch { alert('Payment failed.'); }
  };
  const handleFeedback = (eventId) => {
    const c = prompt('Leave your feedback:');
    if (c) fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/student/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: activeStudentId, event_id: eventId, rating: 5, comment: c }) }).then(() => alert('Thanks!'));
  };
  const followClub = (clubId) => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/student/follow`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: activeStudentId, club_id: clubId }) }).then(() => alert('Following!'));
  };
  const handleMarkRead = async (id) => {
    try { await markRead(id).unwrap(); } catch { /* demo mode */ }
  };
  const handleMarkAll = async () => {
    try { await markAllRead(activeStudentId).unwrap(); } catch { /* demo mode */ }
  };
  const openSettings = (tab = 'profile') => {
    setActiveTab('settings');
    setSettingsTab(tab);
  };
  const handleSaveProfile = () => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/student/profile/${activeStudentId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile)
    }).then(() => alert('Profile updated!')).catch(() => alert('Saved locally.'));
  };


  const typeIcon = (t) => ({ EVENT_ALERT: '📅', DEADLINE: '⏰', ANNOUNCEMENT: '📣', SYSTEM: '⚙️', CLUB: '🏛️' }[t] || '🔔');
  const typeBadge = (t) => ({ EVENT_ALERT: 'bg-brand-500/10 text-brand-500', DEADLINE: 'bg-red-500/10 text-red-500', ANNOUNCEMENT: 'bg-emerald-500/10 text-emerald-500', SYSTEM: 'bg-amber-500/10 text-amber-500', CLUB: 'bg-purple-500/10 text-purple-500' }[t] || 'bg-surface-200/60 text-surface-500');

  return (
    <div className="min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); if (t === 'settings') setSettingsTab('profile'); }} unreadCount={displayUnread} />
      <TopBar
        isDark={isDark} toggleTheme={toggleTheme} onLogout={onLogout}
        userName={userName} userRole={userRole} points={points}
        notifications={displayNotifications}
        onMarkRead={handleMarkRead} onMarkAll={handleMarkAll}
        onOpenSettings={openSettings}
        clubMemberships={clubMemberships}
      />

      <main className="ml-60 mt-16 p-8">

        {/* ───────── DASHBOARD ───────── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold">Welcome back, <span className="bg-gradient-to-r from-brand-500 to-brand-400 bg-clip-text text-transparent">{userName || 'Explorer'}</span></h1>
              <p className="text-surface-400 text-sm mt-1">Here's what's happening on campus today.</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {[
                { icon: '🎫', color: 'from-brand-500/10 to-brand-400/5', border: 'border-brand-500/10', value: myRegistrations.length, label: 'Registrations', onClick: () => setActiveTab('tickets') },
                { icon: '📜', color: 'from-emerald-500/10 to-emerald-400/5', border: 'border-emerald-500/10', value: attended, label: 'Certificates Earned', onClick: () => setActiveTab('certificates') },
                { icon: '🏛️', color: 'from-amber-500/10 to-amber-400/5', border: 'border-amber-500/10', value: clubs.length, label: 'Organizations', onClick: () => setActiveTab('clubs') },
                { icon: '🔔', color: 'from-red-500/10 to-red-400/5', border: 'border-red-500/10', value: displayUnread, label: 'New Alerts', onClick: () => setActiveTab('notifications') },
              ].map((s, i) => (
                <div key={i} onClick={s.onClick} className={`animate-slide-up stagger-${i+1} flex items-center gap-4 p-5 bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border ${s.border} dark:border-surface-800/50 rounded-2xl hover-lift ${s.onClick ? 'cursor-pointer' : 'cursor-default'} group`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>{s.icon}</div>
                  <div>
                    <p className="text-2xl font-extrabold">{s.value}</p>
                    <p className="text-xs text-surface-400 font-medium">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Notifications preview on dashboard */}
            {displayUnread > 0 && (
              <div className="animate-slide-up stagger-3 bg-gradient-to-r from-brand-500/5 to-purple-500/5 border border-brand-500/15 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold flex items-center gap-2">🔔 <span>Unread Alerts</span> <span className="badge-pill bg-red-500/10 text-red-500">{displayUnread} new</span></h2>
                  <button onClick={() => setActiveTab('notifications')} className="text-sm font-medium text-brand-500 hover:text-brand-400 transition">View all →</button>
                </div>
                <div className="space-y-2">
                  {displayNotifications.filter(n => !n.is_read).slice(0, 3).map(n => (
                    <div key={n.id} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-surface-800/40 rounded-xl border border-surface-200/40 dark:border-surface-700/30">
                      <span className="text-lg shrink-0">{typeIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{n.title}</p>
                        <p className="text-xs text-surface-400 truncate">{n.body}</p>
                      </div>
                      <span className={`badge-pill ${typeBadge(n.type)} shrink-0 text-[10px]`}>{n.type?.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Registrations */}
            <div className="animate-slide-up stagger-4 bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">Recent Registrations</h2>
                <button onClick={() => setActiveTab('tickets')} className="text-sm font-medium text-brand-500 hover:text-brand-400 transition-all duration-200 hover:translate-x-0.5">View All →</button>
              </div>
              {regsLoading ? <p className="text-surface-400 text-sm">Loading...</p> : myRegistrations.length === 0 ? (
                <p className="text-surface-400 text-sm py-4">No registrations yet. Explore events to get started!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-surface-200/50 dark:border-surface-800/50">
                      {['Event', 'Status', 'Payment', 'Action'].map(h => <th key={h} className="text-left py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-surface-400">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {myRegistrations.slice(0, 5).map(reg => (
                        <tr key={reg.id} className="border-b border-surface-100/50 dark:border-surface-800/30 hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-all duration-200">
                          <td className="py-3 px-4 font-semibold">{reg.event?.title || 'Event'}</td>
                          <td className="py-3 px-4"><span className={`badge-pill ${reg.check_in_status ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-500/10 text-brand-500'}`}>{reg.check_in_status ? 'Attended' : 'Upcoming'}</span></td>
                          <td className="py-3 px-4"><span className={`badge-pill ${reg.is_paid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{reg.is_paid ? 'Paid' : 'Pending'}</span></td>
                          <td className="py-3 px-4">
                            {!reg.is_paid && <button onClick={() => handlePay(reg.id)} className="btn-brand !py-1.5 !px-3 text-xs">Pay Now</button>}
                            {reg.is_paid && !reg.check_in_status && <span className="text-xs text-surface-400">Ready ✓</span>}
                            {reg.check_in_status && <button onClick={() => handleFeedback(reg.event_id)} className="text-xs font-medium text-brand-500 hover:text-brand-400 transition">Feedback</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ───────── EXPLORE EVENTS ───────── */}
        {activeTab === 'discovery' && (
          <div className="space-y-6">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold">Explore Events</h1>
              <p className="text-surface-400 text-sm mt-1">Discover and register for upcoming campus events.</p>
            </div>
            <div className="flex flex-wrap gap-2 animate-fade-in stagger-1">
              {['All Events', 'Free', 'Premium', 'This Week'].map((t, i) => (
                <button key={t} className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 hover:scale-105
                  ${i === 0 ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20' : 'border-surface-200/60 dark:border-surface-700/50 text-surface-500 hover:border-brand-400 hover:text-brand-500'}`}>
                  {t}
                </button>
              ))}
            </div>
            {eventsLoading ? <p className="text-surface-400 text-sm">Loading events...</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, i) => (
                  <div key={event.id} className={`animate-slide-up stagger-${Math.min(i+1, 6)} bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl overflow-hidden hover-lift group`}>
                    <div className="h-44 bg-gradient-to-br from-brand-600 via-purple-600 to-pink-500 relative overflow-hidden">
                      {event.poster_url && <img src={event.poster_url} alt="" className="w-full h-full object-cover" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-all duration-500" />
                      {event.end_time && new Date(event.end_time) < new Date(Date.now() + 86400000 * 3) && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg">⏰ Deadline Soon</div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="badge-pill bg-brand-500/10 text-brand-500">Featured</span>
                        <span className={`text-sm font-bold ${event.price > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{event.price > 0 ? `₹${event.price}` : 'FREE'}</span>
                      </div>
                      <h3 className="text-base font-bold mb-1 group-hover:text-brand-500 transition-colors duration-200">{event.title}</h3>
                      <p className="text-xs text-surface-400 mb-5">{new Date(event.start_time).toLocaleDateString()} · {event.location || 'Main Campus'}</p>
                      <button onClick={() => handleRegister(event.id)} className="btn-brand w-full">Register</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ───────── DIGITAL WALLET ───────── */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold">Digital Wallet</h1>
              <p className="text-surface-400 text-sm mt-1">Your tickets and QR codes for event check-in.</p>
            </div>
            {regsLoading ? <p className="text-surface-400 text-sm">Loading...</p> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myRegistrations.length === 0 && (
                  <div className="col-span-full animate-scale-in bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-12 text-center">
                    <p className="text-4xl mb-3 animate-float">🎫</p>
                    <p className="text-surface-400 mb-5">Your wallet is empty. Explore events to get started!</p>
                    <button onClick={() => setActiveTab('discovery')} className="btn-brand">Browse Events</button>
                  </div>
                )}
                {myRegistrations.map((reg, i) => (
                  <div key={reg.id} className={`animate-slide-up stagger-${Math.min(i+1, 6)} bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl overflow-hidden hover-lift`}>
                    <div className="p-5 border-b border-surface-200/50 dark:border-surface-800/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-bold mb-1">{reg.event?.title || 'Event'}</h3>
                        <span className={`badge-pill ${reg.check_in_status ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-500/10 text-brand-500'}`}>{reg.check_in_status ? 'Attended' : 'Upcoming'}</span>
                      </div>
                      <span className={`badge-pill ${reg.is_paid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>{reg.is_paid ? 'Paid' : 'Unpaid'}</span>
                    </div>
                    <div className="p-6 flex flex-col items-center">
                      {!reg.is_paid ? (
                        <div className="text-center w-full">
                          <p className="text-xs text-surface-400 mb-4">Complete payment to unlock your QR ticket.</p>
                          <button onClick={() => handlePay(reg.id)} className="btn-brand w-full">Pay — ₹{reg.event?.price || 15}</button>
                        </div>
                      ) : (
                        <>
                          <div className="bg-white p-4 rounded-xl shadow-sm mb-3 animate-scale-in">
                            <QRCode value={reg.qr_hash} size={120} />
                          </div>
                          <code className="text-[11px] text-surface-400 bg-surface-100/80 dark:bg-surface-800/50 px-3 py-1.5 rounded-md tracking-widest">{reg.qr_hash.substring(0, 22)}…</code>
                          {reg.check_in_status && (
                            <button onClick={() => handleFeedback(reg.event_id)} className="btn-outline-brand w-full mt-5">Leave Feedback</button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* ───────── ORGANIZATIONS (unified) ───────── */}
        {activeTab === 'clubs' && (
          <div className="space-y-5">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold">Campus Organizations</h1>
              <p className="text-surface-400 text-sm mt-1">Manage your memberships and discover new clubs.</p>
            </div>

            {/* Sub-tab switcher */}
            <div className="flex gap-2">
              {[{ k:'mine', l:'My Memberships' }, { k:'explore', l:'Explore All' }].map(t => (
                <button key={t.k} onClick={() => setClubsSubTab(t.k)}
                  className={`px-5 py-2 rounded-full text-xs font-bold border transition-all duration-200 hover:scale-105
                    ${clubsSubTab === t.k ? 'bg-brand-500 text-white border-brand-500 shadow-md shadow-brand-500/20' : 'border-surface-200/60 dark:border-surface-700/50 text-surface-500 hover:border-brand-400 hover:text-brand-500'}`}>
                  {t.l}{t.k === 'mine' && clubMemberships.length > 0 ? ` (${clubMemberships.length})` : ''}
                </button>
              ))}
            </div>

            {/* My Memberships sub-tab */}
            {clubsSubTab === 'mine' && (
              <div className="animate-fade-in">
                {clubMemberships && clubMemberships.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clubMemberships.map((membership, i) => (
                      <div key={i} className={`animate-slide-up stagger-${Math.min(i+1,6)} bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-brand-500/20 rounded-2xl p-6 hover-lift`}>
                        <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center text-xl mb-4">🏛️</div>
                        <h3 className="font-bold text-lg mb-1">{membership.club?.name || membership.club_name || 'Club'}</h3>
                        <p className="text-sm text-surface-400 mb-4">{membership.club?.category || membership.club_category || 'General'}</p>
                        <div className="flex items-center justify-between">
                          <span className="badge-pill bg-brand-500/10 text-brand-500">{(membership.club_role || 'MEMBER').replace('_', ' ')}</span>
                          <button onClick={() => { const s = JSON.parse(localStorage.getItem('axisUser')||'{}'); s.active_role='CLUB_ADMIN'; localStorage.setItem('axisUser',JSON.stringify(s)); window.location.reload(); }} className="btn-outline-brand !py-1.5 !px-3 text-xs">Club Portal →</button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-12 text-center">
                    <p className="text-4xl mb-4">🌍</p>
                    <h3 className="text-lg font-bold mb-2">Not in any club yet</h3>
                    <p className="text-surface-400 text-sm mb-6">Switch to Explore to find and apply for clubs.</p>
                    <button onClick={() => setClubsSubTab('explore')} className="btn-brand">Explore Organizations →</button>
                  </div>
                )}
              </div>
            )}

            {/* Explore All sub-tab */}
            {clubsSubTab === 'explore' && (
              <div className="animate-fade-in space-y-4">
                <p className="text-sm text-surface-400">Based on your academic standing (<span className="text-brand-500 font-bold">{academicYear}</span>), you are eligible for the <span className="text-brand-500 font-bold">{currentBoard}</span>.</p>
                {clubsLoading ? <p className="text-surface-400 text-sm">Loading...</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clubs.map((club, i) => {
                      const myMembership = clubMemberships.find(m => m.club_id === club.id);
                      return (
                        <div key={club.id} className={`animate-slide-up stagger-${Math.min(i+1,6)} bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border ${myMembership ? 'border-brand-500/30' : 'border-surface-200/50 dark:border-surface-800/50'} rounded-2xl p-6 hover-lift group`}>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center text-lg transition-transform duration-300 group-hover:scale-110">💡</div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base leading-tight group-hover:text-brand-500 transition-colors truncate">{club.name}</h3>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {club.category && <span className="badge-pill bg-surface-200/50 dark:bg-surface-800/40 text-surface-500 text-[10px]">{club.category}</span>}
                                {myMembership && <span className="badge-pill bg-brand-500/10 text-brand-500 text-[10px]">✓ Member</span>}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-surface-400 mb-5 leading-relaxed line-clamp-3">{club.mission_statement || club.description || 'Join this exciting campus organization.'}</p>
                          {myMembership ? (
                            <div className="flex gap-2">
                              <span className="badge-pill bg-brand-500/10 text-brand-500 flex-1 justify-center py-2">{myMembership.club_role}</span>
                              <button onClick={() => { const s = JSON.parse(localStorage.getItem('axisUser')||'{}'); s.active_role='CLUB_ADMIN'; localStorage.setItem('axisUser',JSON.stringify(s)); window.location.reload(); }} className="btn-outline-brand !py-2 !px-3 text-xs">Club Portal →</button>
                            </div>
                          ) : (
                            <button onClick={() => setApplicationModal({ show: true, club, board: currentBoard, position: '' })} className="btn-outline-brand w-full !py-2 text-xs">Apply for {currentBoard}</button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}



        {/* ───────── NOTIFICATIONS TAB ───────── */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="animate-fade-in flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Notifications</h1>
                <p className="text-surface-400 text-sm mt-1">Stay updated on events, deadlines, and campus alerts.</p>
              </div>
              {displayUnread > 0 && (
                <button onClick={handleMarkAll} className="btn-outline-brand !py-2">✓ Mark all read</button>
              )}
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2 animate-fade-in stagger-1">
              {['All', 'Unread', 'EVENT_ALERT', 'DEADLINE', 'ANNOUNCEMENT', 'SYSTEM'].map((f, i) => (
                <button key={f} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105
                  ${i === 0 ? 'bg-brand-500 text-white border-brand-500' : 'border-surface-200/60 dark:border-surface-700/50 text-surface-500 hover:border-brand-400 hover:text-brand-500'}`}>
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {displayNotifications.map((n, i) => (
                <div key={n.id}
                  className={`animate-slide-up stagger-${Math.min(i+1,6)} flex items-start gap-4 p-5 bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border rounded-2xl hover-lift transition-all
                    ${!n.is_read ? 'border-brand-500/20 dark:border-brand-500/15 bg-brand-500/3' : 'border-surface-200/50 dark:border-surface-800/50'}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${typeBadge(n.type)} bg-opacity-10`}>
                    {typeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 justify-between mb-1">
                      <h3 className={`font-bold text-sm ${!n.is_read ? '' : 'text-surface-500'}`}>{n.title}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`badge-pill ${typeBadge(n.type)}`}>{n.type?.replace('_', ' ')}</span>
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                      </div>
                    </div>
                    <p className="text-sm text-surface-400 leading-relaxed mb-2">{n.body}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-[11px] text-surface-400">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      {n.sender_role && <span className="text-[10px] font-bold uppercase tracking-wider text-surface-400">via {n.sender_role.replace('_', ' ')}</span>}
                    </div>
                  </div>
                  {!n.is_read && (
                    <button onClick={() => handleMarkRead(n.id)} className="text-xs font-semibold text-brand-500 hover:text-brand-400 transition shrink-0 mt-1">Mark read</button>
                  )}
                </div>
              ))}
              {displayNotifications.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-5xl mb-4">🔔</p>
                  <p className="text-surface-400">No notifications yet. You'll be notified about events and deadlines here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ───────── NOTIFICATIONS CENTER ───────── */}
        {activeTab === 'notifications' && (() => {
          const filteredNotifications = displayNotifications.filter(n => {
            if (notifSubTab === 'UNREAD') return !n.is_read;
            if (notifSubTab === 'ANNOUNCEMENTS') return n.type === 'ANNOUNCEMENT' || n.type === 'SYSTEM';
            if (notifSubTab === 'EVENTS') return n.type === 'EVENT_ALERT' || n.type === 'DEADLINE';
            return true;
          });
          return (
          <div className="space-y-6">
            <div className="animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Notification Center</h1>
                  <p className="text-surface-400 text-sm mt-1">Manage your updates and alerts.</p>
                </div>
                <button onClick={handleMarkAll} className="text-sm font-semibold text-brand-500 hover:text-brand-400 transition">Mark all as read</button>
              </div>
              {/* Horizontal Tabs */}
              <div className="flex gap-2 mt-5">
                 {['ALL', 'UNREAD', 'ANNOUNCEMENTS', 'EVENTS'].map(tab => (
                   <button 
                     key={tab} 
                     onClick={() => setNotifSubTab(tab)}
                     className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${notifSubTab === tab ? 'bg-brand-500 text-white' : 'bg-surface-200/50 dark:bg-surface-800/50 text-surface-500 hover:bg-brand-500/10 hover:text-brand-500'}`}
                   >
                     {tab}
                   </button>
                 ))}
              </div>
            </div>
            <div className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl overflow-hidden animate-slide-up stagger-1">
              <div className="divide-y divide-surface-100 dark:divide-surface-800/50">
                {filteredNotifications.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-4xl mb-4">🔔</p>
                    <p className="text-surface-400">No {notifSubTab.toLowerCase()} notifications found!</p>
                  </div>
                ) : filteredNotifications.map(n => (
                   <div key={n.id} className={`flex items-start gap-4 p-5 hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition-colors duration-200 ${!n.is_read ? 'bg-brand-500/5' : ''}`}>
                    <span className={`text-2xl shrink-0 mt-0.5 ${typeBadge(n.type).split(' ')[1]}`}>{typeIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`text-sm font-bold ${!n.is_read ? '' : 'text-surface-500'}`}>{n.title}</h3>
                        <div className="flex items-center gap-3">
                          <span className={`badge-pill ${typeBadge(n.type)} text-[10px]`}>{n.type?.replace('_', ' ')}</span>
                          <span className="text-[11px] text-surface-400">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour:'2-digit', minute:'2-digit' })}</span>
                        </div>
                      </div>
                      <p className="text-sm text-surface-400 leading-relaxed mb-2 pr-8">{n.body}</p>
                      <div className="flex items-center justify-between">
                        {n.sender_role ? <p className="text-[10px] font-bold uppercase tracking-wider text-surface-400">Source: {n.sender_role.replace('_', ' ')}</p> : <div />}
                        {!n.is_read && <button onClick={() => handleMarkRead(n.id)} className="text-xs font-semibold text-brand-500 hover:text-brand-400 transition">Mark as read</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
        })()}

        {/* ───────── CERTIFICATES ───────── */}
        {activeTab === 'certificates' && (
          <div className="space-y-6">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold">Certificates</h1>
              <p className="text-surface-400 text-sm mt-1">Your earned certificates from attended events.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRegistrations.filter(r => r.check_in_status).length === 0 ? (
                <div className="col-span-full animate-scale-in bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-12 text-center">
                  <p className="text-4xl mb-3 animate-float">📜</p>
                  <p className="text-surface-400">Attend events to unlock certificates.</p>
                </div>
              ) : myRegistrations.filter(r => r.check_in_status).map((r, i) => (
                <div key={i} className={`animate-slide-up stagger-${Math.min(i+1, 6)} bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border-2 border-amber-400/30 dark:border-amber-400/20 rounded-2xl p-6 text-center hover-lift`}>
                  <p className="text-3xl mb-2">🏅</p>
                  <h3 className="font-bold mb-1">Certificate of Participation</h3>
                  <p className="text-xs text-surface-400 mb-2">Awarded for completing</p>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-brand-500 to-brand-400 bg-clip-text text-transparent mb-5">{r.event?.title}</h2>
                  <button onClick={() => alert('Downloading PDF...')} className="btn-brand">Download PDF</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ───────── LEADERBOARD ───────── */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <p className="text-surface-400 text-sm mt-1">Campus-wide engagement rankings.</p>
            </div>
            <div className="animate-slide-up stagger-1 bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-surface-200/50 dark:border-surface-800/50">
                  {['Rank', 'Student', 'Events', 'Points'].map(h => <th key={h} className="text-left py-3 px-4 text-[11px] font-bold uppercase tracking-wider text-surface-400">{h}</th>)}
                </tr></thead>
                <tbody>
                  <tr className="bg-amber-500/5 border-b border-surface-200/50 dark:border-surface-800/50 hover:bg-amber-500/10 transition-all duration-200">
                    <td className="py-3.5 px-4 font-extrabold text-amber-500">#1</td>
                    <td className="py-3.5 px-4 font-semibold">Elite Architect</td>
                    <td className="py-3.5 px-4 text-surface-400">12</td>
                    <td className="py-3.5 px-4"><span className="badge-pill bg-amber-500/10 text-amber-500">4,500 PTS</span></td>
                  </tr>
                  <tr className="border-b border-surface-200/50 dark:border-surface-800/50 hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-all duration-200">
                    <td className="py-3.5 px-4 font-extrabold text-surface-400">#2</td>
                    <td className="py-3.5 px-4 font-semibold">John Doe</td>
                    <td className="py-3.5 px-4 text-surface-400">9</td>
                    <td className="py-3.5 px-4"><span className="badge-pill bg-surface-200/50 dark:bg-surface-800/50 text-surface-500">3,100 PTS</span></td>
                  </tr>
                  <tr className="bg-brand-500/5 hover:bg-brand-500/10 transition-all duration-200">
                    <td className="py-3.5 px-4 font-extrabold text-brand-500">#3</td>
                    <td className="py-3.5 px-4 font-semibold text-brand-500">You ({userName})</td>
                    <td className="py-3.5 px-4 text-surface-400">{attended}</td>
                    <td className="py-3.5 px-4"><span className="badge-pill bg-brand-500/10 text-brand-500">{points} PTS</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}


        {/* ───────── SETTINGS ───────── */}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="animate-fade-in">
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-surface-400 text-sm mt-1">Manage your profile, notifications, appearance, and security.</p>
            </div>

            <div className="animate-slide-up stagger-1 flex gap-8">
              {/* Settings Sidebar */}
              <div className="w-56 shrink-0">
                <nav className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-3 space-y-1 sticky top-24">
                  {[
                    { id: 'profile',       icon: '👤', label: 'Profile' },
                    { id: 'notifications', icon: '🔔', label: 'Notifications' },
                    { id: 'appearance',    icon: '🎨', label: 'Appearance' },
                    { id: 'security',      icon: '🔒', label: 'Security' },
                    { id: 'data',          icon: '📊', label: 'My Data' },
                  ].map(s => (
                    <button key={s.id} onClick={() => setSettingsTab(s.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 
                        ${settingsTab === s.id
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                          : 'text-surface-500 hover:bg-surface-100/80 dark:hover:bg-surface-800/50'}`}>
                      <span>{s.icon}</span> {s.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Settings Content */}
              <div className="flex-1 min-w-0">

                {/* Profile */}
                {settingsTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6">
                      <h2 className="text-lg font-bold mb-6">Profile Information</h2>
                      {/* Avatar section */}
                      <div className="flex items-center gap-5 mb-8 p-4 bg-surface-50/50 dark:bg-surface-800/30 rounded-xl border border-surface-200/40 dark:border-surface-700/30">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-500/20">
                          {(profile.full_name || 'S').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{profile.full_name}</h3>
                          <p className="text-sm text-surface-400">{profile.program} · {profile.branch}</p>
                          <p className="text-xs text-surface-400 mt-1">{profile.year}</p>
                        </div>
                        <button className="ml-auto btn-outline-brand text-xs">Change Photo</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {[
                          { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Your full name' },
                          { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@college.edu' },
                          { label: 'PRN (User ID)', key: 'username', type: 'text', placeholder: 'e.g. 235100xx', disabled: true },
                          { label: 'Department/Branch', key: 'branch', type: 'text', placeholder: 'e.g. Computer Science' },
                          { label: 'Academic Year', key: 'year', type: 'text', placeholder: 'e.g. Second Year', disabled: true },
                          { label: 'Section', key: 'section', type: 'text', placeholder: 'e.g. Aided' },
                          { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '+91 9XXXXXXXXX' },
                          { label: 'Program', key: 'program', type: 'text', placeholder: 'e.g. BTECH', disabled: true },
                        ].map(f => (
                          <div key={f.key}>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1.5">{f.label}</label>
                            <input type={f.type} value={profile[f.key] || ''} placeholder={f.placeholder} disabled={f.disabled}
                              onChange={e => !f.disabled && setProfile({ ...profile, [f.key]: e.target.value })}
                              className={`input-soft ${f.disabled ? 'opacity-60 cursor-not-allowed bg-surface-100/10' : ''}`} />
                          </div>
                        ))}
                      </div>
                      <div className="mt-5">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1.5">Bio</label>
                        <textarea value={profile.bio || ''} placeholder="Tell us about yourself..."
                          onChange={e => setProfile({ ...profile, bio: e.target.value })}
                          className="input-soft resize-none" rows={3} />
                      </div>
                      <button onClick={handleSaveProfile} className="btn-brand w-full !py-3 mt-6">Save Profile</button>
                    </div>
                  </div>
                )}

                {/* Notifications settings */}
                {settingsTab === 'notifications' && (
                  <div className="space-y-5">
                    <div className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6">
                      <h2 className="text-lg font-bold mb-6">Notification Preferences</h2>
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-3">📧 Email Notifications</p>
                        {[
                          { key: 'emailEvents', label: 'New event announcements', desc: 'Get notified when clubs launch new events' },
                          { key: 'emailDeadlines', label: 'Registration deadlines', desc: 'Reminder emails 24h before deadlines' },
                          { key: 'emailAnnouncements', label: 'General announcements', desc: 'Campus-wide notices and updates' },
                        ].map(p => (
                          <div key={p.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition">
                            <div>
                              <p className="text-sm font-semibold">{p.label}</p>
                              <p className="text-xs text-surface-400">{p.desc}</p>
                            </div>
                            <button onClick={() => setNotifPrefs({ ...notifPrefs, [p.key]: !notifPrefs[p.key] })}
                              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${notifPrefs[p.key] ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-700'}`}>
                              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${notifPrefs[p.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                          </div>
                        ))}
                        <p className="text-xs font-bold uppercase tracking-wider text-surface-400 mt-5 mb-3">🔔 In-App Notifications</p>
                        {[
                          { key: 'inAppAll', label: 'All in-app notifications', desc: 'Show all notification types in the bell' },
                          { key: 'inAppDeadlines', label: 'Deadline urgency banners', desc: 'Show banner alerts for upcoming deadlines' },
                        ].map(p => (
                          <div key={p.key} className="flex items-center justify-between p-4 rounded-xl hover:bg-surface-50/50 dark:hover:bg-surface-800/30 transition">
                            <div>
                              <p className="text-sm font-semibold">{p.label}</p>
                              <p className="text-xs text-surface-400">{p.desc}</p>
                            </div>
                            <button onClick={() => setNotifPrefs({ ...notifPrefs, [p.key]: !notifPrefs[p.key] })}
                              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${notifPrefs[p.key] ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-700'}`}>
                              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${notifPrefs[p.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => alert('Notification preferences saved!')} className="btn-brand w-full !py-3 mt-4">Save Preferences</button>
                    </div>

                    {/* Recent notifications inline */}
                    <div className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Recent Notifications</h2>
                        <button onClick={handleMarkAll} className="text-xs font-semibold text-brand-500 hover:text-brand-400 transition">Mark all read</button>
                      </div>
                      <div className="space-y-3">
                        {displayNotifications.slice(0, 5).map(n => (
                          <div key={n.id} className={`flex items-start gap-3 p-3 rounded-xl transition ${!n.is_read ? 'bg-brand-500/5 border border-brand-500/10' : 'bg-surface-50/50 dark:bg-surface-800/30'}`}>
                            <span className="text-lg shrink-0">{typeIcon(n.type)}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-semibold ${!n.is_read ? '' : 'text-surface-500'}`}>{n.title}</p>
                              <p className="text-xs text-surface-400 truncate">{n.body}</p>
                            </div>
                            {!n.is_read && (
                              <button onClick={() => handleMarkRead(n.id)} className="text-[10px] font-bold text-brand-500 shrink-0">✓</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Appearance */}
                {settingsTab === 'appearance' && (
                  <div className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-bold">Appearance</h2>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-surface-400 mb-3">Theme</p>
                      <div className="grid grid-cols-3 gap-3">
                        {[{ id: 'dark', label: 'Dark', icon: '🌙' }, { id: 'light', label: 'Light', icon: '☀️' }, { id: 'system', label: 'System', icon: '💻' }].map(t => (
                          <button key={t.id} onClick={() => { setAppearance({ ...appearance, theme: t.id }); if (t.id === 'dark') { document.documentElement.classList.add('dark'); } else if (t.id === 'light') { document.documentElement.classList.remove('dark'); } else { toggleTheme(); } }}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${appearance.theme === t.id ? 'border-brand-500 bg-brand-500/5' : 'border-surface-200/50 dark:border-surface-700/50 hover:border-brand-400/50'}`}>
                            <p className="text-2xl mb-2">{t.icon}</p>
                            <p className="text-sm font-semibold">{t.label}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-50/50 dark:bg-surface-800/30">
                      <div>
                        <p className="text-sm font-semibold">Compact Mode</p>
                        <p className="text-xs text-surface-400">Reduce spacing for more content density</p>
                      </div>
                      <button onClick={() => setAppearance({ ...appearance, compact: !appearance.compact })}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${appearance.compact ? 'bg-brand-500' : 'bg-surface-300 dark:bg-surface-700'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${appearance.compact ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                    <button onClick={() => alert('Appearance saved!')} className="btn-brand w-full !py-3">Save Appearance</button>
                  </div>
                )}

                {/* Security */}
                {settingsTab === 'security' && (
                  <div className="space-y-5">
                    <div className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6">
                      <h2 className="text-lg font-bold mb-6">Change Password</h2>
                      {pwError && <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs">{pwError}</div>}
                      {pwSuccess && <div className="mb-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs">{pwSuccess}</div>}
                      <div className="space-y-4 max-w-md">
                        {[
                          { label: 'Current Password', key: 'oldPassword', placeholder: 'Your current password' },
                          { label: 'New Password', key: 'newPassword', placeholder: 'Minimum 8 characters' },
                          { label: 'Confirm New Password', key: 'confirmPassword', placeholder: 'Repeat new password' },
                        ].map(f => (
                          <div key={f.key}>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1.5">{f.label}</label>
                            <input type="password" value={security[f.key]} placeholder={f.placeholder}
                              onChange={e => { setSecurity({ ...security, [f.key]: e.target.value }); setPwError(''); setPwSuccess(''); }}
                              className="input-soft" />
                          </div>
                        ))}
                        <button onClick={handleChangePassword} className="btn-brand w-full !py-3 mt-2">Update Password</button>
                      </div>
                    </div>
                    <div className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6">
                      <h2 className="text-lg font-bold mb-4">Active Sessions</h2>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-50/50 dark:bg-surface-800/30">
                        <span className="text-xl">💻</span>
                        <div>
                          <p className="text-sm font-semibold">Current Session</p>
                          <p className="text-xs text-surface-400">Chrome on Windows · Active now</p>
                        </div>
                        <span className="ml-auto badge-pill bg-emerald-500/10 text-emerald-500">Active</span>
                      </div>
                    </div>
                    <div className="bg-red-500/5 border border-red-500/15 rounded-2xl p-6">
                      <h2 className="text-lg font-bold text-red-500 mb-2">Account Termination</h2>
                      <p className="text-sm text-surface-400 mb-4">Request account deactivation. Super Admin approval is required. Once approved, you cannot login again and must contact Super Admin to restore access.</p>
                      <button onClick={async () => { 
                        if (window.confirm('Request account termination? This requires Super Admin approval.')) {
                          try {
                            await requestTermination(activeStudentId).unwrap();
                            alert('Termination request submitted successfully.');
                          } catch (err) {
                            alert('Error: ' + (err.data?.message || 'Failed to submit request.'));
                          }
                        }
                      }} className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-500 text-sm font-semibold hover:bg-red-500 hover:text-white transition-all duration-200">
                        Request Termination
                      </button>
                    </div>
                  </div>
                )}

                {/* My Data */}
                {settingsTab === 'data' && (
                  <div className="bg-white/70 dark:bg-surface-900/60 backdrop-blur-sm border border-surface-200/50 dark:border-surface-800/50 rounded-2xl p-6 space-y-6">
                    <h2 className="text-lg font-bold">My Data & Privacy</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: 'Events Registered', value: myRegistrations.length, icon: '🎫' },
                        { label: 'Events Attended', value: attended, icon: '✅' },
                        { label: 'Clubs Followed', value: 0, icon: '🏛️' },
                        { label: 'Points Earned', value: points, icon: '🔥' },
                      ].map((s, i) => (
                        <div key={i} className="p-4 rounded-xl bg-surface-50/50 dark:bg-surface-800/30 text-center">
                          <p className="text-2xl mb-1">{s.icon}</p>
                          <p className="text-xl font-extrabold">{s.value}</p>
                          <p className="text-xs text-surface-400">{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <button onClick={() => alert('Exporting data...')} className="btn-outline-brand w-full !py-3">📥 Download My Data (JSON)</button>
                      <button onClick={() => alert('Your data has been anonymized and is not shared with third parties.')} className="btn-outline-brand w-full !py-3">🛡️ View Privacy Policy</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Application Modal */}
      {applicationModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white dark:bg-surface-900 border border-surface-200/50 dark:border-surface-800/50 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-surface-100 dark:border-surface-800">
              <h2 className="font-bold">Apply to {applicationModal.club?.name}</h2>
              <button className="text-surface-400 hover:text-surface-900 dark:hover:text-white" onClick={() => setApplicationModal({ show: false, club: null, board: '', position: '' })}>✕</button>
            </div>
            <form onSubmit={handleApplySubmit} className="p-5 space-y-4">
              <div className="bg-brand-500/5 border border-brand-500/20 p-4 rounded-xl text-sm">
                <p className="text-brand-600 dark:text-brand-400 font-semibold mb-1">Eligible Board: {currentBoard}</p>
                <p className="text-surface-500 text-xs">Based on your academic standing ({academicYear}), you are applying for the {currentBoard}.</p>
              </div>
              
              {(currentBoard === 'Assistant Board' || currentBoard === 'Main Board') && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-surface-500 mb-1.5">Position (Optional)</label>
                  <input type="text" placeholder={currentBoard === 'Main Board' ? "e.g. Vice President, Event Lead" : "e.g. Secretary, Technical Assistant"} 
                    value={applicationModal.position} onChange={e => setApplicationModal({ ...applicationModal, position: e.target.value })} 
                    className="input-soft w-full" />
                </div>
              )}
              
              <p className="text-xs text-surface-400 pt-2">By applying, your profile will be shared with the club's leadership board for review. You may be scheduled for an aptitude test or interview.</p>
              
              <div className="pt-2 flex gap-3">
                <button type="submit" className="btn-brand flex-1">Submit Application</button>
                <button type="button" onClick={() => setApplicationModal({ show: false, club: null, board: '', position: '' })} className="btn-outline-brand flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
