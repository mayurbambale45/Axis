import React, { useState, useEffect } from 'react';
import {
  useGetEventsQuery,
  useGetClubMembersQuery,
  useRemoveClubMemberMutation,
  useUpdateClubMemberRoleMutation,
  useGetEventRosterQuery,
  useSendNotificationMutation,
  useGetClubAdminNotificationsQuery,
  useGetClubApplicationsQuery,
  useUpdateClubApplicationMutation,
} from '../store/apiSlice';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Leadership roles that can create/edit events
const LEADERSHIP = ['PRESIDENT', 'VP', 'SECRETARY', 'LEAD'];

const ROLE_LABELS = {
  PRESIDENT: { label: 'President',     color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  VP:        { label: 'Vice President', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  SECRETARY: { label: 'Secretary',      color: '#06b6d4', bg: 'rgba(6,182,212,0.1)'  },
  LEAD:      { label: 'Club Lead',      color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  MEMBER:    { label: 'Member',         color: '#64748b', bg: 'rgba(100,116,139,0.1)'},
};

const ALL_CLUB_ROLES = ['PRESIDENT', 'VP', 'SECRETARY', 'LEAD', 'MEMBER'];

/* ─── Mini components ─────────────────────────────────────── */
const Badge = ({ role }) => {
  const r = ROLE_LABELS[role] || ROLE_LABELS.MEMBER;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 4,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
      color: r.color, background: r.bg, textTransform: 'uppercase',
    }}>{r.label}</span>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    UPCOMING:  { color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
    ONGOING:   { color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    COMPLETED: { color: '#64748b', bg: 'rgba(100,116,139,0.08)' },
    CANCELLED: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)'  },
  };
  const s = map[status] || map.UPCOMING;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 4,
      fontSize: 11, fontWeight: 600, color: s.color, background: s.bg, textTransform: 'capitalize',
    }}>{status?.toLowerCase() || 'upcoming'}</span>
  );
};

/* ─── Sidebar ─────────────────────────────────────────────── */
const Sidebar = ({ activeTab, setActiveTab, clubRole }) => {
  const isLeader = LEADERSHIP.includes(clubRole);
  const navGroups = [
    { section: 'Overview', items: [
      { id: 'dashboard', icon: '⚡', label: 'Dashboard' },
      { id: 'members',   icon: '👥', label: 'Members' },
    ]},
    { section: isLeader ? 'Management' : 'Events', items: [
      { id: 'events',    icon: '📋', label: 'Events' },
      ...(isLeader ? [
        { id: 'applications', icon: '📄', label: 'Recruitment' },
        { id: 'notify',  icon: '📣', label: 'Notifications' },
        { id: 'scanner', icon: '📷', label: 'Gate Scanner' },
        { id: 'mom',     icon: '🤖', label: 'AI Meeting Notes' },
      ] : []),
    ]},
    { section: 'Account', items: [
      { id: 'settings',  icon: '⚙️', label: 'Settings' },
    ]},
  ];

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 220,
      background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', padding: '20px 12px', zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 28 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}>⚡</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.2px' }}>AXIS</div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: -1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Club Portal</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {navGroups.map(group => (
          <div key={group.section} style={{ marginBottom: 4 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '12px 8px 6px', margin: 0 }}>
              {group.section}
            </p>
            {group.items.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: activeTab === item.id ? 'rgba(139,92,246,0.12)' : 'transparent',
                color: activeTab === item.id ? '#a78bfa' : '#64748b',
                fontSize: 12, fontWeight: activeTab === item.id ? 600 : 500,
                textAlign: 'left', transition: 'all 0.15s', marginBottom: 1,
                position: 'relative', fontFamily: 'inherit',
              }}>
                {activeTab === item.id && (
                  <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: '0 3px 3px 0', background: '#8b5cf6' }} />
                )}
                <span style={{ fontSize: 13 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
};

/* ─── Main Dashboard ──────────────────────────────────────── */
export const ClubAdminDashboard = ({
  isDark, toggleTheme, onLogout,
  userName, userId, userEmail, userPhone,
  userBranch, userSection, userProgram, userGender, userYear, userAdmissionYear,
  primaryClubId, primaryClubRole, primaryMembershipId, clubMemberships = []
}) => {
  // PRESIDENT and VP can do everything; SECRETARY and LEAD can edit events but NOT remove leaders
  const isLeader   = LEADERSHIP.includes(primaryClubRole);           // can edit events
  const canManageMembers = ['PRESIDENT','VP'].includes(primaryClubRole); // can remove/change any role
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [notifications, setNotifications] = useState([]);

  // Event management
  const [eventForm, setEventForm] = useState({ title: '', description: '', price: 0, max_capacity: 50, location: '', start_time: '', end_time: '', club_id: primaryClubId });
  const [editEvent, setEditEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventCreated, setEventCreated] = useState(false);

  // Roster
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showRoster, setShowRoster] = useState(false);

  // Scanner
  const [qrHash, setQrHash] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);

  // AI MoM
  const [rawNotes, setRawNotes] = useState('');
  const [generatedMom, setGeneratedMom] = useState('');
  const [generatingMom, setGeneratingMom] = useState(false);

  // Notify
  const [notifyForm, setNotifyForm] = useState({ title: '', body: '', type: 'ANNOUNCEMENT', link: '' });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [notifSent, setNotifSent] = useState(false);

  // Profile – pre-filled from session
  const [profile, setProfile] = useState({
    full_name: userName || '', email: userEmail || '', phone: userPhone || '',
    branch: userBranch || '', section: userSection || '', program: userProgram || 'BTECH',
    gender: userGender || '', year: userYear || '', admission_year: userAdmissionYear || '',
    bio: '',
  });
  const [profileSaved, setProfileSaved] = useState(false);
  const [security, setSecurity] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  // API hooks
  const { data: events = [], refetch: refetchEvents, isLoading: eventsLoading } = useGetEventsQuery();
  const { data: members = [], isLoading: membersLoading, refetch: refetchMembers } = useGetClubMembersQuery(primaryClubId, { skip: !primaryClubId });
  const { data: roster = [] } = useGetEventRosterQuery(selectedEventId, { skip: !selectedEventId });
  const { data: sentNotifs = [] } = useGetClubAdminNotificationsQuery();
  const { data: applications = [], refetch: refetchApps } = useGetClubApplicationsQuery(primaryClubId, { skip: !primaryClubId });
  
  const [removeClubMember] = useRemoveClubMemberMutation();
  const [updateMemberRole] = useUpdateClubMemberRoleMutation();
  const [sendNotification] = useSendNotificationMutation();
  const [updateApp] = useUpdateClubApplicationMutation();

  // Load profile from API on mount
  useEffect(() => {
    if (!userId) return;
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/student/profile/${userId}`)
      .then(r => r.json())
      .then(d => setProfile(p => ({
        ...p,
        full_name: d.full_name || p.full_name,
        email: d.email || p.email,
        phone: d.phone || p.phone,
        branch: d.branch || p.branch,
        section: d.section || p.section,
        program: d.program || p.program,
        gender: d.gender || p.gender,
        year: d.year || p.year,
        admission_year: d.admission_year || p.admission_year,
        bio: d.bio || '',
      })))
      .catch(() => {});
  }, [userId]);

  // Filter events for this club
  const clubEvents = primaryClubId
    ? events.filter(e => e.club_id === primaryClubId)
    : events;

  /* ── Handlers ── */
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!isLeader) return;
    if (!primaryClubId) return alert('No club associated with your account.');
    try {
      const payload = {
        title: eventForm.title,
        description: eventForm.description || '',
        price: parseFloat(eventForm.price) || 0,
        max_capacity: parseInt(eventForm.max_capacity) || 50,
        location: eventForm.location || '',
        start_time: eventForm.start_time || null,
        end_time: eventForm.end_time || null,
        club_id: primaryClubId,
        status: 'UPCOMING',
      };
      const res = await fetch(`${API}/club-admin/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create event');
      setEventCreated(true);
      setTimeout(() => setEventCreated(false), 3000);
      setShowEventModal(false);
      setEventForm({ title: '', description: '', price: 0, max_capacity: 50, location: '', start_time: '', end_time: '' });
      refetchEvents();
    } catch (err) { alert('Failed to create event: ' + err.message); }
  };

  const handleEditEvent = async (e) => {
    e.preventDefault();
    if (!isLeader || !editEvent) return;
    try {
      const res = await fetch(`${API}/clubs/${primaryClubId}/events/${editEvent.id}`, {
        method: 'PATCH', 
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ ...editEvent, user_id: userId }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setEditEvent(null);
      refetchEvents();
    } catch (err) { alert('Failed to update event: ' + err.message); }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!isLeader || !window.confirm('Delete this event?')) return;
    try {
      await fetch(`${API}/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      refetchEvents();
    } catch { alert('Failed to delete event.'); }
  };

  const handleRemoveMember = async (memberId, name, targetRole) => {
    // Only PRESIDENT and VP can remove members
    if (!['PRESIDENT','VP'].includes(primaryClubRole)) {
      return alert('Only the President or Vice President can remove members.');
    }
    // Cannot remove yourself
    if (memberId === primaryMembershipId) return alert('You cannot remove yourself.');
    if (!window.confirm(`Remove ${name} from the club?`)) return;
    try {
      await removeClubMember({ clubId: primaryClubId, memberId }).unwrap();
      refetchMembers();
    } catch { alert('Could not remove member.'); }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`${API}/student/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: profile.full_name, phone: profile.phone, bio: profile.bio, section: profile.section }),
      });
      if (!res.ok) throw new Error();
      setProfileSaved(true); setTimeout(() => setProfileSaved(false), 2500);
    } catch { alert('Failed to save profile.'); }
  };

  const handleChangePassword = async () => {
    setPwError(''); setPwSuccess('');
    if (!security.oldPassword || !security.newPassword) return setPwError('All fields are required.');
    if (security.newPassword !== security.confirmPassword) return setPwError('New passwords do not match.');
    if (security.newPassword.length < 6) return setPwError('Password must be at least 6 characters.');
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, old_password: security.oldPassword, new_password: security.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPwSuccess('Password changed successfully!');
      setSecurity({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setPwError(err.message || 'Failed to change password.'); }
  };

  const handleUpdateRole = async (memberId, newRole) => {
    try {
      await updateMemberRole({ clubId: primaryClubId, memberId, club_role: newRole }).unwrap();
      refetchMembers();
    } catch { alert('Could not update role.'); }
  };

  const handleUpdateApp = async (appId, updates) => {
    try {
      if (updates.status === 'REJECTED' || updates.status === 'APPROVED') {
        if (!window.confirm(`Are you sure you want to mark this application as ${updates.status}?`)) return;
      }
      await updateApp({ appId, ...updates }).unwrap();
      refetchApps();
      if (updates.status === 'APPROVED') refetchMembers();
    } catch (err) { alert('Failed to update application'); }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!qrHash.trim()) return;
    setScanning(true); setScanResult(null);
    try {
      const res = await fetch(`${API}/events/check-in`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_hash: qrHash.trim() }),
      });
      const data = await res.json();
      setScanResult({ success: res.ok, message: data.message });
      if (res.ok) setQrHash('');
    } catch { setScanResult({ success: false, message: 'Server unreachable.' }); }
    setScanning(false);
  };

  const handleGenerateMom = async (e) => {
    e.preventDefault();
    if (!rawNotes.trim()) return;
    setGeneratingMom(true);
    try {
      const res = await fetch(`${API}/club-admin/generate-mom`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_notes: rawNotes }),
      });
      const data = await res.json();
      setGeneratedMom(data.structured_mom || 'Could not generate MoM.');
    } catch { setGeneratedMom('⚠️ Service unavailable.'); }
    setGeneratingMom(false);
  };

  const handleSendNotif = async (e) => {
    e.preventDefault();
    if (!notifyForm.title.trim() || !notifyForm.body.trim()) return;
    setSendingNotif(true);
    try {
      await sendNotification(notifyForm).unwrap();
      setNotifSent(true); setTimeout(() => setNotifSent(false), 3000);
      setNotifyForm({ title: '', body: '', type: 'ANNOUNCEMENT', link: '' });
    } catch { setNotifSent(true); setTimeout(() => setNotifSent(false), 2000); }
    setSendingNotif(false);
  };

  /* ── Styles ── */
  const card = {
    background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 20,
  };
  const inputSt = {
    width: '100%', padding: '7px 10px', borderRadius: 6,
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
    color: '#e2e8f0', fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
  };
  const btnPrimary = {
    padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff',
    fontSize: 12, fontWeight: 600, fontFamily: 'inherit', transition: 'opacity 0.2s',
  };
  const btnSecondary = {
    padding: '7px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
    background: 'transparent', color: '#94a3b8', fontSize: 12, fontWeight: 500,
    fontFamily: 'inherit', transition: 'all 0.2s',
  };
  const sectionTitle = { margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' };
  const label12 = { display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#060c18 0%,#0a1122 60%,#080e1a 100%)', fontFamily: "'Inter',-apple-system,sans-serif", color: '#e2e8f0' }}>
      <Sidebar activeTab={activeTab} setActiveTab={t => { setActiveTab(t); if (t === 'settings') setSettingsTab('profile'); }} clubRole={primaryClubRole} />

      {/* Top Bar */}
      <header style={{
        position: 'fixed', top: 0, left: 220, right: 0, height: 52,
        background: 'rgba(6,12,24,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', zIndex: 40,
      }}>
        <div style={{ fontSize: 12, color: '#475569' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={toggleTheme} style={{ ...btnSecondary, padding: '5px 10px', fontSize: 13 }}>{isDark ? '☀️' : '🌙'}</button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => { setActiveTab('settings'); setSettingsTab('profile'); }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {(userName || 'C').charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{userName || 'Club Member'}</p>
              <Badge role={primaryClubRole} />
            </div>
          </div>
          <button onClick={() => {
              const session = JSON.parse(localStorage.getItem('axisUser') || '{}');
              session.active_role = 'STUDENT';
              localStorage.setItem('axisUser', JSON.stringify(session));
              window.location.reload();
          }} style={{ ...btnSecondary, padding: '5px 12px', color: '#10b981', borderColor: 'rgba(16,185,129,0.2)', fontSize: 11 }}>← Student Portal</button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
          <button onClick={onLogout} style={{ ...btnSecondary, padding: '5px 12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', fontSize: 11 }}>Sign Out</button>
        </div>
      </header>

      {/* Main */}
      <main style={{ marginLeft: 220, marginTop: 52, padding: 24 }}>

        {/* ════ DASHBOARD ════ */}
        {activeTab === 'dashboard' && (
          <div style={{ maxWidth: 1100 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>Club Dashboard</h1>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>
                {isLeader ? 'You have leadership access — you can create and manage events.' : 'Member view — you can view events and member roster.'}
              </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Club Events', value: clubEvents.length, icon: '📋', color: '#6366f1' },
                { label: 'Total Members', value: members.length, icon: '👥', color: '#8b5cf6' },
                { label: 'Your Role', value: ROLE_LABELS[primaryClubRole]?.label || 'Member', icon: '🎭', color: '#06b6d4' },
                { label: 'Access Level', value: isLeader ? 'Leadership' : 'Member', icon: isLeader ? '🔓' : '👁️', color: isLeader ? '#10b981' : '#64748b' },
              ].map((s, i) => (
                <div key={i} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Role restriction notice */}
            {!isLeader && (
              <div style={{ ...card, marginBottom: 20, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', padding: '12px 16px' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#818cf8' }}>
                  ℹ️ As a <strong>Member</strong>, you can view events and member information. Event creation and editing is restricted to club leaders (President, VP, Secretary, and Leads).
                </p>
              </div>
            )}

            {/* Quick actions for leaders */}
            {isLeader && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={card}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>⚡ Quick Create Event</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input style={inputSt} placeholder="Event title" value={eventForm.title} onChange={e => setEventForm({ ...eventForm, title: e.target.value })} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input style={inputSt} type="number" placeholder="Price (₹)" min={0} value={eventForm.price} onChange={e => setEventForm({ ...eventForm, price: +e.target.value })} />
                      <input style={inputSt} type="number" placeholder="Capacity" min={1} value={eventForm.max_capacity} onChange={e => setEventForm({ ...eventForm, max_capacity: +e.target.value })} />
                    </div>
                    <input style={inputSt} placeholder="Location / Venue" value={eventForm.location} onChange={e => setEventForm({ ...eventForm, location: e.target.value })} />
                    <button style={btnPrimary} onClick={handleCreateEvent}>Create Event →</button>
                  </div>
                </div>
                <div style={card}>
                  <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>📷 Gate Scanner</h3>
                  <p style={{ margin: '0 0 12px', fontSize: 12, color: '#64748b' }}>Scan student QR hash to mark attendance.</p>
                  <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input style={{ ...inputSt, fontFamily: 'monospace', letterSpacing: '1px' }} placeholder="Paste QR hash..." value={qrHash} onChange={e => { setQrHash(e.target.value); setScanResult(null); }} />
                    <button type="submit" disabled={scanning || !qrHash.trim()} style={{ ...btnPrimary, background: '#059669', opacity: (scanning || !qrHash.trim()) ? 0.6 : 1 }}>
                      {scanning ? 'Verifying...' : '✅ Verify & Check In'}
                    </button>
                    {scanResult && (
                      <div style={{ padding: '8px 12px', borderRadius: 6, fontSize: 12, background: scanResult.success ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${scanResult.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, color: scanResult.success ? '#34d399' : '#f87171' }}>
                        {scanResult.success ? '✅' : '❌'} {scanResult.message}
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* Recent Events Preview */}
            <div style={card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Recent Club Events</h3>
                <button style={{ ...btnSecondary, padding: '4px 10px', fontSize: 11 }} onClick={() => setActiveTab('events')}>View all →</button>
              </div>
              {clubEvents.slice(0, 4).map(ev => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>📋</div>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{ev.title}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{ev.location || 'TBD'} · Cap: {ev.max_capacity}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <StatusBadge status={ev.status} />
                    {isLeader && (
                      <button style={{ ...btnSecondary, padding: '4px 8px', fontSize: 11 }} onClick={() => { setEditEvent(ev); setActiveTab('events'); }}>Edit</button>
                    )}
                  </div>
                </div>
              ))}
              {clubEvents.length === 0 && <p style={{ margin: 0, fontSize: 12, color: '#64748b', textAlign: 'center', padding: '20px 0' }}>{isLeader ? 'No events yet. Create one above!' : 'No events have been created for this club yet.'}</p>}
            </div>
          </div>
        )}

        {/* ════ EVENTS ════ */}
        {activeTab === 'events' && (
          <div style={{ maxWidth: 1000 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>Events</h1>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{isLeader ? 'Create, edit, and manage club events.' : 'View all club events.'}</p>
              </div>
              {isLeader && (
                <button style={btnPrimary} onClick={() => { setEditEvent(null); setShowEventModal(true); }}>+ New Event</button>
              )}
            </div>

            {/* Inline edit form */}
            {editEvent && isLeader && (
              <div style={{ ...card, marginBottom: 16, border: '1px solid rgba(139,92,246,0.3)' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#a78bfa' }}>✏️ Edit Event</h3>
                <form onSubmit={handleEditEvent}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={label12}>Title</label>
                      <input style={inputSt} required value={editEvent.title} onChange={e => setEditEvent({ ...editEvent, title: e.target.value })} />
                    </div>
                    <div>
                      <label style={label12}>Location</label>
                      <input style={inputSt} value={editEvent.location || ''} onChange={e => setEditEvent({ ...editEvent, location: e.target.value })} />
                    </div>
                    <div>
                      <label style={label12}>Price (₹)</label>
                      <input style={inputSt} type="number" min={0} value={editEvent.price || 0} onChange={e => setEditEvent({ ...editEvent, price: +e.target.value })} />
                    </div>
                    <div>
                      <label style={label12}>Capacity</label>
                      <input style={inputSt} type="number" min={1} value={editEvent.max_capacity || 50} onChange={e => setEditEvent({ ...editEvent, max_capacity: +e.target.value })} />
                    </div>
                    <div>
                      <label style={label12}>Start</label>
                      <input style={inputSt} type="datetime-local" value={editEvent.start_time?.slice(0, 16) || ''} onChange={e => setEditEvent({ ...editEvent, start_time: e.target.value })} />
                    </div>
                    <div>
                      <label style={label12}>Status</label>
                      <select style={inputSt} value={editEvent.status || 'UPCOMING'} onChange={e => setEditEvent({ ...editEvent, status: e.target.value })}>
                        {['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ gridColumn: '1/-1' }}>
                      <label style={label12}>Description</label>
                      <textarea style={{ ...inputSt, resize: 'vertical', minHeight: 60 }} value={editEvent.description || ''} onChange={e => setEditEvent({ ...editEvent, description: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="submit" style={btnPrimary}>Save Changes</button>
                    <button type="button" style={btnSecondary} onClick={() => setEditEvent(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Events list */}
            {eventsLoading ? (
              <p style={{ color: '#64748b', fontSize: 13 }}>Loading events...</p>
            ) : clubEvents.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: 48 }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>📋</p>
                <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>{isLeader ? 'No events yet. Create the first one!' : 'No events scheduled for this club yet.'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {clubEvents.map(ev => (
                  <div key={ev.id} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>📋</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                          <StatusBadge status={ev.status} />
                          <span style={{ fontSize: 11, color: '#64748b' }}>Cap: {ev.max_capacity}</span>
                          {ev.price > 0 && <span style={{ fontSize: 11, color: '#f59e0b' }}>₹{ev.price}</span>}
                          {ev.location && <span style={{ fontSize: 11, color: '#64748b' }}>📍 {ev.location}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {isLeader && (
                        <>
                          <button style={{ ...btnSecondary, padding: '5px 10px', fontSize: 11 }} onClick={() => setEditEvent({ ...ev })}>✏️ Edit</button>
                          <button style={{ ...btnSecondary, padding: '5px 10px', fontSize: 11, color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }} onClick={() => handleDeleteEvent(ev.id)}>Delete</button>
                        </>
                      )}
                      <button style={{ ...btnSecondary, padding: '5px 10px', fontSize: 11 }} onClick={() => { setSelectedEventId(ev.id); setShowRoster(true); }}>👥 Roster</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ MEMBERS ════ */}
        {activeTab === 'members' && (
          <div style={{ maxWidth: 900 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>Club Members</h1>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Club member roster. Members are assigned by the System Admin.</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 16 }}>
              {ALL_CLUB_ROLES.map(role => {
                const count = members.filter(m => m.club_role === role).length;
                const r = ROLE_LABELS[role];
                return (
                  <div key={role} style={{ ...card, textAlign: 'center', padding: '12px 8px' }}>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: r.color }}>{count}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{r.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Members table */}
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['Member', 'Branch / Year / Section', 'Club Role', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {membersLoading ? (
                    <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontSize: 13 }}>Loading...</td></tr>
                  ) : members.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: 32, textAlign: 'center', color: '#64748b', fontSize: 13 }}>No members found. Contact the System Admin to assign members.</td></tr>
                  ) : members.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                            {(m.user?.full_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{m.user?.full_name || 'Unknown'}</p>
                            <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>{m.user?.email || m.user?.username || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 11, color: '#64748b' }}>
                        <span>{m.user?.branch || m.user?.department || '—'}</span>
                        {m.user?.year && <span style={{ display:'block', fontSize:10, color:'#475569' }}>{m.user.year}{m.user?.section ? ` · Sec ${m.user.section}` : ''}</span>}
                      </td>
                      <td style={{ padding: '10px 14px' }}><Badge role={m.club_role} /></td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 11, color: m.user?.account_status === 'APPROVED' ? '#10b981' : '#f59e0b' }}>
                          {m.user?.account_status || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {/* Role change: only President and VP can change others' roles */}
                          {canManageMembers ? (
                            <select style={{ ...inputSt, width: 'auto', padding: '4px 8px', fontSize: 11 }} value={m.club_role}
                              onChange={e => handleUpdateRole(m.id, e.target.value)}>
                              {ALL_CLUB_ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r].label}</option>)}
                            </select>
                          ) : (
                            <Badge role={m.club_role} />
                          )}
                          {/* Remove: only President and VP */}
                          {canManageMembers && m.id !== primaryMembershipId && (
                            <button style={{ ...btnSecondary, padding: '4px 8px', fontSize: 11, color: '#ef4444', borderColor: 'rgba(239,68,68,0.15)' }}
                              onClick={() => handleRemoveMember(m.id, m.user?.full_name, m.club_role)}>Remove</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ RECRUITMENT APPLICATIONS ════ */}
        {activeTab === 'applications' && isLeader && (
          <div style={{ maxWidth: 900 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>Applications & Recruitment</h1>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Review incoming applications for your club operations boards.</p>
            </div>
            {applications.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: 48 }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>📄</p>
                <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>No applications currently pending.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {applications.map(app => (
                  <div key={app.id} style={{ ...card, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700 }}>{app.user?.full_name} <span style={{ fontSize: 12, fontWeight: 500, color: '#64748b' }}>({app.user?.year})</span></h3>
                        <p style={{ margin: 0, fontSize: 12, color: '#94a3b8' }}>{app.user?.email} • {app.user?.branch} • Applied for: <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{app.board}</span> {app.position ? `(${app.position})` : ''}</p>
                      </div>
                      <StatusBadge status={app.status === 'INTERVIEW_SCHEDULED' ? 'ONGOING' : app.status} />
                    </div>

                    {app.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ ...btnSecondary, fontSize: 11, color: '#8b5cf6', borderColor: '#8b5cf6' }} 
                          onClick={() => {
                            const date = prompt('Enter Test/Interview Date (e.g. Oct 20 at 5 PM):');
                            if (date) handleUpdateApp(app.id, { status: 'INTERVIEW_SCHEDULED', interview_date: new Date(), message_to_user: `Your interview/test is scheduled for ${date}.` });
                          }}>Schedule Test</button>
                        <button style={{ ...btnSecondary, fontSize: 11, color: '#10b981', borderColor: '#10b981' }} onClick={() => handleUpdateApp(app.id, { status: 'APPROVED', message_to_user: 'Congratulations! Your application has been approved.' })}>Approve</button>
                        <button style={{ ...btnSecondary, fontSize: 11, color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleUpdateApp(app.id, { status: 'REJECTED' })}>Reject</button>
                      </div>
                    )}
                    
                    {app.status === 'INTERVIEW_SCHEDULED' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button style={{ ...btnSecondary, fontSize: 11, color: '#10b981', borderColor: '#10b981' }} onClick={() => handleUpdateApp(app.id, { status: 'APPROVED', message_to_user: 'Congratulations! You passed the recruitment process and are now a member.' })}>Pass & Approve</button>
                        <button style={{ ...btnSecondary, fontSize: 11, color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleUpdateApp(app.id, { status: 'REJECTED', message_to_user: 'Thank you for your time. Unfortunately, we are moving forward with other candidates.' })}>Fail / Reject</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ GATE SCANNER ════ */}
        {activeTab === 'scanner' && isLeader && (
          <div style={{ maxWidth: 520 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>Gate Scanner</h1>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Verify and check in event attendees using their QR hash.</p>
            </div>
            <div style={card}>
              <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={label12}>QR Hash / Ticket Code</label>
                  <input style={{ ...inputSt, fontFamily: 'monospace', fontSize: 13, letterSpacing: '1px', textAlign: 'center' }}
                    placeholder="Paste ticket hash here..." value={qrHash} autoFocus
                    onChange={e => { setQrHash(e.target.value); setScanResult(null); }} />
                </div>
                <button type="submit" disabled={scanning || !qrHash.trim()} style={{ ...btnPrimary, padding: '10px', background: '#059669', opacity: (scanning || !qrHash.trim()) ? 0.6 : 1 }}>
                  {scanning ? '⏳ Verifying...' : '✅ Verify & Mark Attendance'}
                </button>
              </form>
              {scanResult && (
                <div style={{ marginTop: 14, padding: '12px', borderRadius: 8, background: scanResult.success ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${scanResult.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: scanResult.success ? '#34d399' : '#f87171' }}>
                    {scanResult.success ? '✅ CHECK-IN SUCCESSFUL' : '❌ INVALID TICKET'}
                  </p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>{scanResult.message}</p>
                </div>
              )}
              <div style={{ marginTop: 20, padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Instructions</p>
                {['Ask student to show their QR code', 'Paste the hash or scan the code', 'Green = check-in success', 'Each ticket is single-use'].map((s, i) => (
                  <p key={i} style={{ margin: '4px 0', fontSize: 11, color: '#64748b' }}>{i + 1}. {s}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════ AI MEETING NOTES ════ */}
        {activeTab === 'mom' && isLeader && (
          <div style={{ maxWidth: 900 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>AI Meeting Notes</h1>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Paste raw notes — AI will structure them into formal Minutes of Meeting.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={card}>
                <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>Raw Notes</h3>
                <textarea style={{ ...inputSt, resize: 'none', minHeight: 240 }} rows={12}
                  placeholder="Paste meeting notes, bullet points, or transcript..."
                  value={rawNotes} onChange={e => setRawNotes(e.target.value)} />
                <button style={{ ...btnPrimary, width: '100%', marginTop: 10, padding: '9px', opacity: (generatingMom || !rawNotes.trim()) ? 0.6 : 1 }}
                  onClick={handleGenerateMom} disabled={generatingMom || !rawNotes.trim()}>
                  {generatingMom ? '🤖 Generating...' : '🤖 Generate MoM'}
                </button>
              </div>
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>Generated MoM</h3>
                  {generatedMom && <button style={{ ...btnSecondary, padding: '4px 10px', fontSize: 11 }} onClick={() => navigator.clipboard.writeText(generatedMom)}>📋 Copy</button>}
                </div>
                {!generatedMom ? (
                  <div style={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 8 }}>
                    <p style={{ color: '#475569', fontSize: 12, textAlign: 'center' }}>MoM will appear here after generation.</p>
                  </div>
                ) : (
                  <div style={{ minHeight: 240, maxHeight: 400, overflowY: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: 12 }}>
                    <pre style={{ margin: 0, fontSize: 11, fontFamily: 'monospace', lineHeight: 1.6, color: '#cbd5e1', whiteSpace: 'pre-wrap' }}>{generatedMom}</pre>
                  </div>
                )}
                {generatedMom && <button style={{ ...btnSecondary, width: '100%', marginTop: 10, fontSize: 11 }} onClick={() => { setGeneratedMom(''); setRawNotes(''); }}>Clear & Start New</button>}
              </div>
            </div>
          </div>
        )}

        {/* ════ NOTIFICATIONS ════ */}
        {activeTab === 'notify' && isLeader && (
          <div style={{ maxWidth: 720 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>Send Notification</h1>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Broadcast alerts and announcements to all students.</p>
            </div>

            {notifSent && (
              <div style={{ ...card, background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', marginBottom: 16 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#34d399' }}>✅ Notification sent successfully!</p>
              </div>
            )}

            <form onSubmit={handleSendNotif} style={card}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={label12}>Type</label>
                  <select style={inputSt} value={notifyForm.type} onChange={e => setNotifyForm({ ...notifyForm, type: e.target.value })}>
                    <option value="ANNOUNCEMENT">📣 Announcement</option>
                    <option value="EVENT_ALERT">📋 Event Alert (+ email)</option>
                    <option value="DEADLINE">⏰ Deadline Reminder (+ email)</option>
                    <option value="CLUB">🏛️ Club Update</option>
                  </select>
                </div>
                <div>
                  <label style={label12}>Link (optional)</label>
                  <input type="url" style={inputSt} placeholder="https://..." value={notifyForm.link} onChange={e => setNotifyForm({ ...notifyForm, link: e.target.value })} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={label12}>Title</label>
                <input type="text" style={inputSt} placeholder="e.g. Hackathon – Registration Open!" required value={notifyForm.title} onChange={e => setNotifyForm({ ...notifyForm, title: e.target.value })} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={label12}>Message</label>
                <textarea style={{ ...inputSt, resize: 'vertical', minHeight: 80 }} required value={notifyForm.body} onChange={e => setNotifyForm({ ...notifyForm, body: e.target.value })} />
              </div>
              <button type="submit" disabled={sendingNotif} style={{ ...btnPrimary, padding: '10px', width: '100%', opacity: sendingNotif ? 0.7 : 1 }}>
                {sendingNotif ? 'Sending...' : '📣 Send to All Students'}
              </button>
            </form>

            {/* Sent history */}
            {sentNotifs.length > 0 && (
              <div style={{ ...card, marginTop: 16 }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700 }}>Sent History</h3>
                {sentNotifs.slice(0, 8).map(n => (
                  <div key={n.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{n.title}</p>
                      <p style={{ margin: 0, fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400 }}>{n.body}</p>
                    </div>
                    <span style={{ fontSize: 10, color: '#475569', flexShrink: 0 }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════ SETTINGS ════ */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e8f0' }}>Settings</h1>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {/* Sub-nav */}
              <div style={{ width: 160, flexShrink: 0 }}>
                <div style={{ ...card, padding: '8px' }}>
                  {[{ id: 'profile', label: '👤 Profile' }, { id: 'security', label: '🔒 Security' }, { id: 'access', label: '🛡️ My Access' }].map(s => (
                    <button key={s.id} onClick={() => setSettingsTab(s.id)} style={{
                      ...settingsTab === s.id ? btnPrimary : btnSecondary,
                      width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 4, fontSize: 12,
                      background: settingsTab === s.id ? 'rgba(139,92,246,0.12)' : 'transparent',
                      color: settingsTab === s.id ? '#a78bfa' : '#64748b',
                      border: settingsTab === s.id ? '1px solid rgba(139,92,246,0.2)' : '1px solid transparent',
                    }}>{s.label}</button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {settingsTab === 'profile' && (
                  <div style={card}>
                    <h2 style={{ ...sectionTitle, marginBottom: 16 }}>Profile Information</h2>
                    {/* Identity Card */}
                    <div style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', borderRadius:8, background:'rgba(99,102,241,0.05)', border:'1px solid rgba(99,102,241,0.12)', marginBottom:16 }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#8b5cf6,#6366f1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, color:'#fff', flexShrink:0 }}>
                        {(profile.full_name||'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin:0, fontSize:14, fontWeight:700, color:'#e2e8f0' }}>{profile.full_name}</p>
                        <p style={{ margin:0, fontSize:11, color:'#64748b' }}>{profile.email}</p>
                        <span style={{ fontSize:10, padding:'1px 6px', borderRadius:3, background:'rgba(139,92,246,0.1)', color:'#a78bfa', fontWeight:700 }}>{ROLE_LABELS[primaryClubRole]?.label || 'Member'}</span>
                      </div>
                    </div>
                    {/* Read-only academic info */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:14, padding:'12px', borderRadius:8, background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
                      {[['Branch', profile.branch],['Section', profile.section ? `Section ${profile.section}` : '—'],['Year', profile.year||'—'],['Program', profile.program],['Gender', profile.gender||'—']].map(([lbl, val]) => (
                        <div key={lbl}>
                          <p style={{ margin:0, fontSize:9, fontWeight:700, color:'#475569', textTransform:'uppercase', letterSpacing:'0.4px' }}>{lbl}</p>
                          <p style={{ margin:'2px 0 0', fontSize:12, fontWeight:600, color:'#cbd5e1' }}>{val||'—'}</p>
                        </div>
                      ))}
                    </div>
                    {/* Editable fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {[{ k: 'full_name', l: 'Full Name', editable: true }, { k: 'email', l: 'Email', editable: false }, { k: 'phone', l: 'Phone', editable: true }, { k: 'section', l: 'Section', editable: true }].map(f => (
                        <div key={f.k}>
                          <label style={label12}>{f.l} {!f.editable && <span style={{ fontSize:9, color:'#475569', textTransform:'lowercase', fontWeight:400 }}>(read-only)</span>}</label>
                          <input style={{ ...inputSt, opacity: f.editable ? 1 : 0.55, cursor: f.editable ? 'text' : 'default' }}
                            value={profile[f.k] || ''} readOnly={!f.editable}
                            onChange={e => f.editable && setProfile({ ...profile, [f.k]: e.target.value })} />
                        </div>
                      ))}
                      <div style={{ gridColumn: '1/-1' }}>
                        <label style={label12}>Bio / About</label>
                        <textarea style={{ ...inputSt, resize: 'vertical', minHeight: 60 }} value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
                      </div>
                    </div>
                    {profileSaved && <p style={{ margin:'10px 0 0', fontSize:11, color:'#34d399' }}>✅ Profile saved successfully!</p>}
                    <button style={{ ...btnPrimary, marginTop: 14, width: '100%' }} onClick={handleSaveProfile}>Save Profile</button>
                  </div>
                )}
                {settingsTab === 'security' && (
                  <div style={card}>
                    <h2 style={sectionTitle}>Change Password</h2>
                    {pwError && <div style={{ marginBottom:10, padding:'8px 12px', borderRadius:6, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', fontSize:11, color:'#f87171' }}>{pwError}</div>}
                    {pwSuccess && <div style={{ marginBottom:10, padding:'8px 12px', borderRadius:6, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', fontSize:11, color:'#34d399' }}>{pwSuccess}</div>}
                    {[{ k: 'oldPassword', l: 'Current Password' }, { k: 'newPassword', l: 'New Password' }, { k: 'confirmPassword', l: 'Confirm New Password' }].map(f => (
                      <div key={f.k} style={{ marginBottom: 10 }}>
                        <label style={label12}>{f.l}</label>
                        <input type="password" style={inputSt} value={security[f.k]}
                          onChange={e => { setSecurity({ ...security, [f.k]: e.target.value }); setPwError(''); setPwSuccess(''); }} />
                      </div>
                    ))}
                    <button style={{ ...btnPrimary, width: '100%' }} onClick={handleChangePassword}>Update Password</button>
                  </div>
                )}
                {settingsTab === 'access' && (
                  <div style={card}>
                    <h2 style={sectionTitle}>My Access Rights</h2>
                    <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                      <p style={{ margin: 0, fontSize: 12, color: '#a5b4fc' }}>
                        Role: <strong>{ROLE_LABELS[primaryClubRole]?.label || 'Member'}</strong> — {isLeader ? 'Leadership access granted.' : 'Read-only member access.'}
                      </p>
                    </div>
                    {[
                      { label: 'View Club Events', desc: 'Browse events organized by this club', granted: true },
                      { label: 'View Member Roster', desc: 'See all club members and their roles', granted: true },
                      { label: 'Create & Edit Events', desc: 'Leadership roles only (President, VP, Secretary, Lead)', granted: isLeader },
                      { label: 'Send Notifications', desc: 'Broadcast alerts to all students', granted: isLeader },
                      { label: 'Gate Scanner Access', desc: 'Check in event attendees using QR codes', granted: isLeader },
                      { label: 'AI Meeting Notes', desc: 'Generate structured MoM from raw notes', granted: isLeader },
                      { label: 'Update Member Roles', desc: 'Promote or demote club members', granted: isLeader },
                    ].map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{p.label}</p>
                          <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{p.desc}</p>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, color: p.granted ? '#10b981' : '#64748b', background: p.granted ? 'rgba(16,185,129,0.08)' : 'rgba(100,116,139,0.08)', flexShrink: 0 }}>
                          {p.granted ? '✓ Granted' : '✗ Restricted'}
                        </span>
                      </div>
                    ))}
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
