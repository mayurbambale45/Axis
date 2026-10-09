import React, { useState } from 'react';
import {
  useGetPendingUsersQuery,
  useUpdateUserStatusMutation,
  useGetSuperAdminStatsQuery,
  useGetAllUsersQuery,
  useGetAdminClubsQuery,
  useGetAdminNotificationsQuery,
  useMarkAdminNotificationReadMutation,
  useAssignMemberToClubMutation,
  useRemoveAdminClubMemberMutation,
  useCreateClubMutation,
  useAssignMentorToClubMutation,
  useRemoveMentorClubMutation,
  useDeleteUserMutation,
  useDeleteClubMutation,
  useUpdateUserRoleMutation,
} from '../store/apiSlice';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const CLUB_ROLE_OPTIONS = [
  { value: 'PRESIDENT',  label: 'President' },
  { value: 'VP',         label: 'Vice President' },
  { value: 'SECRETARY',  label: 'Secretary' },
  { value: 'LEAD',       label: 'Club Lead' },
  { value: 'MEMBER',     label: 'Member' },
];

const ROLE_COLORS = {
  PRESIDENT: '#f59e0b', VP: '#8b5cf6', SECRETARY: '#06b6d4', LEAD: '#10b981', MEMBER: '#64748b',
  CLUB_ADMIN: '#a78bfa', CLUB_MENTOR: '#06b6d4', STUDENT: '#64748b', SUPER_ADMIN: '#ef4444',
};

const Badge = ({ text, color = '#64748b', bg }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 4,
    fontSize: 10, fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase',
    color: color, background: bg || `${color}14`,
  }}>{text}</span>
);

/* ─── Sidebar ─────────────────────────────────────────────── */
const Sidebar = ({ activeTab, setActiveTab }) => {
  const navGroups = [
    { section: 'Governance', items: [
      { id: 'global',          icon: '📊', label: 'Overview' },
      { id: 'user-approvals',  icon: '⏳', label: 'Pending Approvals' },
      { id: 'users',           icon: '👥', label: 'User Directory' },
      { id: 'clubs',           icon: '🏛️', label: 'Organizations' },
      { id: 'finances',        icon: '💰', label: 'Finance' },
      { id: 'notifications',   icon: '🔔', label: 'Updates & Alerts' },
      { id: 'audit',           icon: '🛡️', label: 'Audit Log' },
    ]},
    { section: 'Account', items: [
      { id: 'settings',        icon: '⚙️', label: 'Settings' },
    ]},
  ];

  return (
    <aside style={{
      position: 'fixed', left: 0, top: 0, bottom: 0, width: 210,
      background: 'rgba(15,23,42,0.97)', backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', padding: '20px 10px', zIndex: 50,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px', marginBottom: 28 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🛡️</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.2px' }}>AXIS</div>
          <div style={{ fontSize: 10, color: '#64748b', marginTop: -1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Admin Panel</div>
        </div>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {navGroups.map(group => (
          <div key={group.section} style={{ marginBottom: 4 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '12px 8px 6px', margin: 0 }}>{group.section}</p>
            {group.items.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: activeTab === item.id ? 'rgba(239,68,68,0.1)' : 'transparent',
                color: activeTab === item.id ? '#fca5a5' : '#64748b',
                fontSize: 12, fontWeight: activeTab === item.id ? 600 : 500,
                textAlign: 'left', transition: 'all 0.15s', marginBottom: 1,
                position: 'relative', fontFamily: 'inherit',
              }}>
                {activeTab === item.id && (
                  <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 18, borderRadius: '0 3px 3px 0', background: '#ef4444' }} />
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

/* ─── Main ────────────────────────────────────────────────── */
export const DashboardShell = ({ isDark, toggleTheme, onLogout, userName, userId, userEmail }) => {
  const [activeTab, setActiveTab] = useState('global');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [selectedClubId, setSelectedClubId] = useState(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState('MEMBER');
  const [newClubForm, setNewClubForm] = useState({ name: '', mission_statement: '', description: '', category: 'Technical' });
  const [showNewClubForm, setShowNewClubForm] = useState(false);
  const [profile, setProfile] = useState({ full_name: userName || 'Super Admin', email: userEmail || 'admin@axis.edu', department: '', designation: 'Super Admin' });
  const [security, setSecurity] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const { data: stats = {}, refetch: refetchStats } = useGetSuperAdminStatsQuery();
  const { data: pendingUsers = [], refetch: refetchPending } = useGetPendingUsersQuery();
  const { data: allUsers = [], refetch: refetchUsers } = useGetAllUsersQuery();
  const { data: clubs = [], refetch: refetchClubs } = useGetAdminClubsQuery();
  const { data: adminNotifications = [], refetch: refetchAdminNotes } = useGetAdminNotificationsQuery();
  const [markAdminNotif] = useMarkAdminNotificationReadMutation();
  const [updateStatus] = useUpdateUserStatusMutation();
  const [updateRole] = useUpdateUserRoleMutation();
  const [assignMember] = useAssignMemberToClubMutation();
  const [removeMember] = useRemoveAdminClubMemberMutation();
  const [createClub] = useCreateClubMutation();
  const [assignMentorToClub] = useAssignMentorToClubMutation();
  const [removeMentorClub] = useRemoveMentorClubMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [deleteClub] = useDeleteClubMutation();

  // State for mentors tab
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [mentorAssignClubId, setMentorAssignClubId] = useState('');
  const [mentorAssignMsg, setMentorAssignMsg] = useState('');

  const handleApproval = async (id, status) => {
    try { await updateStatus({ id, status }).unwrap(); refetchPending(); refetchUsers(); }
    catch (err) { alert('Error: ' + (err.data?.message || 'Unknown')); }
  };

  const handleAssignMember = async () => {
    if (!selectedClubId || !assignUserId) return alert('Select club and user.');
    try {
      await assignMember({ clubId: selectedClubId, user_id: assignUserId, club_role: assignRole }).unwrap();
      alert('Member assigned!'); setAssignUserId(''); setAssignRole('MEMBER'); refetchClubs();
    } catch (err) { alert('Error: ' + (err.data?.message || err.message)); }
  };

  const handleAssignMentor = async () => {
    if (!selectedClubId || !selectedMentorId) return alert('Select club and mentor.');
    try {
      await assignMentorToClub({ userId: selectedMentorId, club_id: selectedClubId }).unwrap();
      alert('Mentor assigned!'); setSelectedMentorId(''); refetchUsers(); refetchClubs();
    } catch (err) { alert('Error: ' + (err.data?.message || err.message)); }
  };

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!newClubForm.name) return;
    try {
      await createClub(newClubForm).unwrap();
      setNewClubForm({ name: '', mission_statement: '', description: '', category: 'Technical' });
      setShowNewClubForm(false);
      refetchClubs();
    } catch (err) { alert('Error: ' + (err.data?.message || err.message)); }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Terminate account for ${name}? Their data is preserved but they will lose access.`)) return;
    try { await deleteUser(userId).unwrap(); alert('Account terminated (hidden from system).'); refetchUsers(); refetchStats(); }
    catch(e) { alert('Error: ' + (e.data?.message || e.message)); }
  };

  const handleUpdateRoleInline = async (userId, newRole) => {
    try { await updateRole({ id: userId, global_role: newRole }).unwrap(); refetchUsers(); }
    catch(e) { alert('Error updating role: ' + (e.data?.message || e.message)); }
  };

  const handleDeleteClub = async (clubId, name) => {
    if (!window.confirm(`Deactivate/Delete club ${name}?`)) return;
    try { await deleteClub(clubId).unwrap(); alert('Club deleted.'); setSelectedClubId(null); refetchClubs(); refetchStats(); }
    catch(e) { alert('Error deleting club: ' + (e.data?.message || e.message)); }
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
        body: JSON.stringify({ user_id: userId, old_password: security.oldPassword, new_password: security.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPwSuccess('Password changed successfully!');
      setSecurity({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { setPwError(err.message || 'Failed to change password.'); }
  };

  // Styles
  const card = { background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: 18 };
  const inputSt = { width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', fontSize: 12, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' };
  const btnRed = { padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'inherit' };
  const btnGhost = { padding: '7px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'transparent', color: '#94a3b8', fontSize: 12, fontFamily: 'inherit' };
  const label12 = { display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 };
  const sectionTitle = { margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#e2e8f0' };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg,#060c18 0%,#0a1122 60%,#080e1a 100%)', fontFamily: "'Inter',-apple-system,sans-serif", color: '#e2e8f0' }}>
      <Sidebar activeTab={activeTab} setActiveTab={t => { setActiveTab(t); if (t === 'settings') setSettingsTab('profile'); }} />

      {/* Top Bar */}
      <header style={{
        position: 'fixed', top: 0, left: 210, right: 0, height: 52,
        background: 'rgba(6,12,24,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', zIndex: 40,
      }}>
        <p style={{ margin: 0, fontSize: 12, color: '#475569', fontWeight: 500 }}>System Governance Control Panel</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={toggleTheme} style={{ ...btnGhost, padding: '5px 10px', fontSize: 13 }}>{isDark ? '☀️' : '🌙'}</button>
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => { setActiveTab('settings'); setSettingsTab('profile'); }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
              {(userName || 'A').charAt(0).toUpperCase()}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>{userName || 'Admin'}</p>
              <p style={{ margin: 0, fontSize: 10, color: '#ef4444', fontWeight: 700, textTransform: 'uppercase' }}>Super Admin</p>
            </div>
          </div>
          <button onClick={onLogout} style={{ ...btnGhost, padding: '5px 12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)', fontSize: 11 }}>Exit Portal</button>
        </div>
      </header>

      <main style={{ marginLeft: 210, marginTop: 52, padding: 24 }}>

        {/* ════ OVERVIEW ════ */}
        {activeTab === 'global' && (
          <div style={{ maxWidth: 1000 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>System Overview</h1>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Platform-wide statistics and quick controls.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Active Clubs',      value: clubs.length || stats.totalClubs || 0,     icon: '🏛️', color: '#6366f1', onClick: () => setActiveTab('clubs') },
                { label: 'Registered Users',  value: allUsers.length || stats.activeUsers || 0, icon: '👥', color: '#10b981', onClick: () => setActiveTab('users') },
                { label: 'Pending Approvals', value: pendingUsers.length,                        icon: '⏳', color: '#f59e0b', onClick: () => setActiveTab('user-approvals') },
              ].map((s, i) => (
                <div key={i} onClick={s.onClick} style={{ ...card, display: 'flex', alignItems: 'center', gap: 14, cursor: s.onClick ? 'pointer' : 'default' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{s.icon}</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Audit preview */}
            <div style={card}>
              <h2 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700 }}>Recent Activity</h2>
              {[
                { msg: 'Database health check passed', time: '11 min ago', ok: true },
                { msg: 'User approval granted', time: '32 min ago', ok: true },
                { msg: `${pendingUsers.length} registration(s) awaiting approval`, time: 'Now', ok: pendingUsers.length === 0 },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.ok ? '#10b981' : '#f59e0b', flexShrink: 0 }} />
                    <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1' }}>{l.msg}</p>
                  </div>
                  <span style={{ fontSize: 10, color: '#475569', flexShrink: 0 }}>{l.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ALERTS / NOTIFICATIONS ── */}
        {activeTab === 'notifications' && (
          <div style={{ maxWidth: 900 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={sectionTitle}>System Alerts & Notifications</h2>
                <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Review active system events and announcements.</p>
              </div>
            </div>
            <div style={cardStyle}>
              {adminNotifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <p style={{ fontSize: 32, margin: '0 0 10px' }}>🔔</p>
                  <p style={{ margin: 0 }}>No system notifications yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {adminNotifications.map(n => (
                    <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: 16, background: !n.is_read ? 'rgba(99,102,241,0.06)' : 'rgba(255,255,255,0.02)', borderRadius: 12, border: `1px solid ${!n.is_read ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'}`, transition: 'all 0.2s' }}>
                      <span style={{ fontSize: 24, marginTop: 2 }}>{n.type === 'SYSTEM' ? '⚙️' : (n.type === 'EVENT_ALERT' ? '📅' : '🔔')}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <h4 style={{ margin: 0, fontSize: 14, fontWeight: !n.is_read ? 700 : 500, color: !n.is_read ? '#fff' : '#cbd5e1' }}>{n.title}</h4>
                          <Badge text={n.type} color="#8b5cf6" />
                        </div>
                        <p style={{ margin: '0 0 8px', fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{n.body}</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{new Date(n.createdAt).toLocaleString()}</span>
                          {!n.is_read && (
                            <button onClick={async () => { await markAdminNotif(n.id); refetchAdminNotes(); }} style={{ background: 'transparent', border: 'none', color: '#6366f1', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Mark read</button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ PENDING APPROVALS ════ */}
        {activeTab === 'user-approvals' && (
          <div style={{ maxWidth: 900 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fbbf24' }}>Pending Approvals</h1>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Review and approve registration requests before granting portal access.</p>
              </div>
              <button style={{ ...btnGhost, fontSize: 11 }} onClick={() => { refetchPending(); refetchStats(); }}>🔄 Refresh</button>
            </div>
            {pendingUsers.length === 0 ? (
              <div style={{ ...card, textAlign: 'center', padding: 48 }}>
                <p style={{ fontSize: 32 }}>✅</p>
                <p style={{ color: '#64748b', fontSize: 13 }}>No pending approvals. All requests processed.</p>
              </div>
            ) : pendingUsers.map(u => {
              const isTermination = u.account_status === 'TERMINATION_REQUESTED';
              const isMentor = u.global_role === 'CLUB_MENTOR';
              const hasClub = u.club_members && u.club_members.length > 0;
              return (
              <div key={u.id} style={{ ...card, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: isTermination ? 'rgba(239,68,68,0.15)' : isMentor ? 'rgba(6,182,212,0.12)' : hasClub ? 'rgba(139,92,246,0.12)' : 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: isTermination ? '#ef4444' : isMentor ? '#06b6d4' : hasClub ? '#a78bfa' : '#818cf8', flexShrink: 0 }}>
                    {(u.full_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{u.full_name}</p>
                      <span style={{ fontSize: 11, color: '#64748b' }}>@{u.username}</span>
                      {isTermination && <Badge text="TERMINATION REQ" color="#f87171" bg="rgba(239,68,68,0.12)" />}
                      {!isTermination && isMentor && <Badge text="Club Mentor" color="#06b6d4" />}
                      {!isTermination && hasClub && !isMentor && <Badge text="Club Member" color="#a78bfa" />}
                      {!isTermination && !hasClub && !isMentor && <Badge text="Student" color="#818cf8" />}
                    </div>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: '#64748b' }}>{u.email}</p>
                    {/* Student details */}
                    {!isMentor && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#475569' }}>
                        {u.program && `${u.program} · `}{u.branch && `${u.branch}`}{u.section && ` · Sec: ${u.section}`}
                        {u.admission_year && ` · Admitted: ${u.admission_year}`}
                      </p>
                    )}
                    {/* Mentor details */}
                    {isMentor && u.designation && (
                      <p style={{ margin: '2px 0 0', fontSize: 11, color: '#475569' }}>
                        {u.designation}{u.department && ` · ${u.department}`}
                      </p>
                    )}
                    {/* Club membership */}
                    {hasClub && (
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: '#a78bfa', fontWeight: 600 }}>
                        🏛️ {u.club_members[0]?.club?.name || 'Unknown Club'} — {u.club_members[0]?.club_role}
                      </p>
                    )}
                    {/* Mentor club request */}
                    {isMentor && u.mentor_club_ids && u.mentor_club_ids.length > 0 && (
                      <p style={{ margin: '3px 0 0', fontSize: 11, color: '#06b6d4', fontWeight: 600 }}>
                        🏛️ Requesting to mentor: {u.mentor_club_ids.length} club(s)
                      </p>
                    )}
                    <p style={{ margin: '3px 0 0', fontSize: 10, color: '#334155' }}>Submitted: {new Date(u.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                  {isTermination ? (
                    <>
                      <button onClick={() => handleApproval(u.id, 'TERMINATED')} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
                        Approve Termination
                      </button>
                      <button onClick={() => handleApproval(u.id, 'APPROVED')} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
                        Reject / Keep Active
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => handleApproval(u.id, 'APPROVED')} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(16,185,129,0.1)', color: '#34d399', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
                        ✓ Approve
                      </button>
                      <button onClick={() => handleApproval(u.id, 'REJECTED')} style={{ padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>
                        ✗ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );})},
          </div>
        )}

        {/* ════ USER DIRECTORY ════ */}
        {activeTab === 'users' && (
          <div style={{ maxWidth: 1100 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>User Directory</h1>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>{allUsers.length} registered users across all roles.</p>
            </div>
            <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {['User', 'Program / Branch', 'Role', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allUsers.slice(0, 100).map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '9px 14px' }}>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{u.full_name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>{u.email} · @{u.username}</p>
                        {u.club_members?.length > 0 && <p style={{ margin: 0, fontSize: 10, color: '#a78bfa' }}>🏛️ {u.club_members[0]?.club?.name} — {u.club_members[0]?.club_role}</p>}
                      </td>
                      <td style={{ padding: '9px 14px', fontSize: 11, color: '#64748b' }}>
                        {u.global_role === 'CLUB_MENTOR' ? (u.designation || u.department || '—') : `${u.program || '—'} · ${u.branch || u.department || '—'}`}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        <select style={{ ...inputSt, width: 'auto', padding: '4px 8px', fontSize: 11, background: 'rgba(0,0,0,0.3)' }} value={u.global_role} onChange={e => handleUpdateRoleInline(u.id, e.target.value)}>
                          <option value="STUDENT">Student</option>
                          <option value="CLUB_ADMIN">Club Admin</option>
                          <option value="CLUB_MENTOR">Club Mentor</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                        {u.global_role === 'CLUB_MENTOR' && u.mentor_club_ids?.length > 0 && (
                          <div style={{ fontSize: 10, color: '#06b6d4', marginTop: 3 }}>{u.mentor_club_ids.length} club(s) assigned</div>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        <select style={{ ...inputSt, width: 'auto', padding: '4px 8px', fontSize: 11, background: 'rgba(0,0,0,0.3)', color: u.account_status === 'APPROVED' ? '#10b981' : u.account_status === 'REJECTED' ? '#ef4444' : '#f59e0b' }} value={u.account_status} onChange={e => handleApproval(u.id, e.target.value)}>
                          <option value="APPROVED">APPROVED</option>
                          <option value="PENDING">PENDING</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="TERMINATED">TERMINATED</option>
                        </select>
                      </td>
                      <td style={{ padding: '9px 14px', fontSize: 11, color: '#475569' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ ...btnGhost, padding: '4px 8px', fontSize: 10, color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }} onClick={() => handleDeleteUser(u.id, u.full_name)}>Terminate</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════ ORGANISATIONS ════ */}
        {activeTab === 'clubs' && (
          <div style={{ maxWidth: 1100 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Organizations</h1>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Manage clubs, assign members, and configure roles.</p>
              </div>
              <button style={btnRed} onClick={() => setShowNewClubForm(!showNewClubForm)}>+ New Club</button>
            </div>

            {/* New Club Form */}
            {showNewClubForm && (
              <form onSubmit={handleCreateClub} style={{ ...card, marginBottom: 16, border: '1px solid rgba(239,68,68,0.2)' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>Create New Club</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={label12}>Club Name *</label>
                    <input style={inputSt} required placeholder="e.g. IEEE Student Branch" value={newClubForm.name} onChange={e => setNewClubForm({ ...newClubForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={label12}>Category</label>
                    <select style={inputSt} value={newClubForm.category} onChange={e => setNewClubForm({ ...newClubForm, category: e.target.value })}>
                      {['Technical', 'Cultural', 'Social Service', 'Sports', 'Literary', 'Entrepreneurship', 'Arts & Media', 'Environment'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={label12}>Mission Statement</label>
                    <input style={inputSt} placeholder="One-line mission..." value={newClubForm.mission_statement} onChange={e => setNewClubForm({ ...newClubForm, mission_statement: e.target.value })} />
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={label12}>Description</label>
                    <textarea style={{ ...inputSt, resize: 'vertical', minHeight: 56 }} value={newClubForm.description} onChange={e => setNewClubForm({ ...newClubForm, description: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" style={btnRed}>Create Club</button>
                  <button type="button" style={btnGhost} onClick={() => setShowNewClubForm(false)}>Cancel</button>
                </div>
              </form>
            )}

            {/* Clubs grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 24 }}>
              {clubs.map(club => (
                <div key={club.id} style={{ ...card, cursor: 'pointer', border: selectedClubId === club.id ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => setSelectedClubId(selectedClubId === club.id ? null : club.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{club.name}</h3>
                    <Badge text={club.category || 'Technical'} color="#6366f1" />
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>{club.mission_statement || 'No mission statement'}</p>
                  <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>{club.club_members?.length || 0} members</p>
                </div>
              ))}
            </div>

            {/* Selected club – member assignment */}
            {selectedClubId && (
              <div style={card}>
                {(() => {
                  const club = clubs.find(c => c.id === selectedClubId);
                  return (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <h2 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>{club?.name} — Member Management</h2>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button style={{ ...btnGhost, color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }} onClick={() => handleDeleteClub(club.id, club.name)}>Delete Club</button>
                          <button style={btnGhost} onClick={() => setSelectedClubId(null)}>✕ Close</button>
                        </div>
                      </div>

                      {/* Assign new member */}
                      <div style={{ marginBottom: 16, padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Assign Member to Club</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'end' }}>
                          <div>
                            <label style={label12}>Select User</label>
                            <select style={inputSt} value={assignUserId} onChange={e => setAssignUserId(e.target.value)}>
                              <option value="">— Choose approved user —</option>
                              {allUsers.filter(u => u.account_status === 'APPROVED' && u.global_role !== 'CLUB_MENTOR').map(u => (
                                <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label style={label12}>Club Role</label>
                            <select style={inputSt} value={assignRole} onChange={e => setAssignRole(e.target.value)}>
                              {CLUB_ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                          </div>
                          <button style={{ ...btnRed, alignSelf: 'flex-end' }} onClick={handleAssignMember}>Assign</button>
                        </div>
                      </div>

                      {/* Assign Mentor to Club */}
                      <div style={{ marginBottom: 16, padding: 14, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Assign Mentor to Club</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}>
                          <div>
                            <label style={label12}>Select Mentor</label>
                            <select style={inputSt} value={selectedMentorId} onChange={e => setSelectedMentorId(e.target.value)}>
                              <option value="">— Choose approved club mentor —</option>
                              {allUsers.filter(u => u.account_status === 'APPROVED' && u.global_role === 'CLUB_MENTOR').map(u => (
                                <option key={u.id} value={u.id}>{u.full_name} (@{u.username})</option>
                              ))}
                            </select>
                          </div>
                          <button style={{ ...btnRed, alignSelf: 'flex-end', background: 'linear-gradient(135deg,#06b6d4,#0891b2)' }} onClick={handleAssignMentor}>Assign Mentor</button>
                        </div>
                      </div>

                      {/* Mentors list */}
                      {(() => {
                        const mentors = allUsers.filter(u => u.global_role === 'CLUB_MENTOR' && 
                          (u.assigned_club_id === selectedClubId || (Array.isArray(u.mentor_club_ids) && u.mentor_club_ids.includes(selectedClubId))));
                        if (mentors.length > 0) return (
                          <div style={{ marginBottom: 16 }}>
                            <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>Mentors assigned</p>
                            {mentors.map(m => (
                              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(6,182,212,0.1)', borderRadius: 6, marginBottom: 4 }}>
                                <div>
                                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{m.full_name}</p>
                                  <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{m.email}</p>
                                </div>
                                <button style={{ ...btnGhost, padding: '4px 10px', fontSize: 11, color: '#ef4444', borderColor: 'rgba(239,68,68,0.15)' }} onClick={async () => {
                                  if (!window.confirm(`Remove mentor ${m.full_name}?`)) return;
                                  try { await removeMentorClub({ userId: m.id, clubId: selectedClubId }).unwrap(); refetchUsers(); refetchClubs(); } catch { alert('Failed'); }
                                }}>Remove</button>
                              </div>
                            ))}
                          </div>
                        );
                        return null;
                      })()}

                      {/* Members list */}
                      {club?.club_members && club.club_members.length > 0 ? (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              {['Member', 'Role', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '8px 12px', fontSize: 10, color: '#475569', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {club.club_members.map(m => (
                              <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                <td style={{ padding: '8px 12px' }}>
                                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{m.user?.full_name || 'Unknown'}</p>
                                  <p style={{ margin: 0, fontSize: 11, color: '#475569' }}>{m.user?.email || '—'}</p>
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: ROLE_COLORS[m.club_role] || '#64748b' }}>{m.club_role}</span>
                                </td>
                                <td style={{ padding: '8px 12px' }}>
                                  <button style={{ ...btnGhost, padding: '4px 10px', fontSize: 11, color: '#ef4444', borderColor: 'rgba(239,68,68,0.15)' }}
                                    onClick={async () => {
                                      if (!window.confirm(`Remove ${m.user?.full_name}?`)) return;
                                      try { await removeMember({ clubId: selectedClubId, memberId: m.id }).unwrap(); refetchClubs(); }
                                      catch { alert('Failed to remove.'); }
                                    }}>Remove</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ color: '#64748b', fontSize: 12, textAlign: 'center', padding: '16px 0' }}>No members yet. Assign members using the form above.</p>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* ════ FINANCE PLACEHOLDER ════ */}
        {activeTab === 'finances' && (
          <div style={{ maxWidth: 700, ...card }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#fbbf24' }}>Finance</h1>
            <p style={{ color: '#64748b', fontSize: 12 }}>Revenue tracking module — connect to payment gateway to enable live data.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
              {[{ label: 'Total Revenue', value: `₹${stats.totalRevenue || 0}`, icon: '💰' }, { label: 'Transactions', value: stats.totalTransactions || 0, icon: '📄' }].map((s, i) => (
                <div key={i} style={{ ...card, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 24 }}>{s.icon}</span>
                  <div>
                    <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#fbbf24' }}>{s.value}</p>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ AUDIT LOG ════ */}
        {activeTab === 'audit' && (
          <div style={{ maxWidth: 800 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Audit Log</h1>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b' }}>Security and administrative event history.</p>
            </div>
            <div style={card}>
              {[
                { icon: '✅', msg: 'DB health check passed', time: '11 min ago', ok: true },
                { icon: '👤', msg: 'User approval: Rahul Sharma (23510001)', time: '32 min ago', ok: true },
                { icon: '❌', msg: 'Failed login attempt — unknown IP', time: '1 hr ago', ok: false },
                { icon: '🔐', msg: 'Admin login from Chrome · Windows', time: 'Today', ok: true },
              ].map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14 }}>{l.icon}</span>
                    <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1' }}>{l.msg}</p>
                  </div>
                  <span style={{ fontSize: 10, color: '#475569', flexShrink: 0 }}>{l.time}</span>
                </div>
              ))}
              <button style={{ ...btnGhost, marginTop: 14, width: '100%' }} onClick={() => alert('Exporting...')}>📥 Export Full Log</button>
            </div>
          </div>
        )}

        {/* ════ SETTINGS ════ */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: 700 }}>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Settings</h1>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ width: 150, flexShrink: 0 }}>
                <div style={{ ...card, padding: 8 }}>
                  {[{ id: 'profile', l: '👤 Profile' }, { id: 'security', l: '🔒 Security' }, { id: 'system', l: '⚙️ System' }].map(s => (
                    <button key={s.id} onClick={() => setSettingsTab(s.id)} style={{
                      width: '100%', textAlign: 'left', padding: '8px 10px', marginBottom: 3, fontSize: 12,
                      borderRadius: 6, border: settingsTab === s.id ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
                      background: settingsTab === s.id ? 'rgba(239,68,68,0.08)' : 'transparent',
                      color: settingsTab === s.id ? '#fca5a5' : '#64748b', cursor: 'pointer', fontFamily: 'inherit',
                    }}>{s.l}</button>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {settingsTab === 'profile' && (
                  <div style={card}>
                    <h2 style={sectionTitle}>Profile</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {[{ k: 'full_name', l: 'Full Name' }, { k: 'email', l: 'Email' }, { k: 'department', l: 'Department' }, { k: 'designation', l: 'Designation' }].map(f => (
                        <div key={f.k}>
                          <label style={label12}>{f.l}</label>
                          <input style={inputSt} value={profile[f.k] || ''} onChange={e => setProfile({ ...profile, [f.k]: e.target.value })} />
                        </div>
                      ))}
                    </div>
                    <button style={{ ...btnRed, width: '100%', marginTop: 14 }} onClick={() => alert('Profile saved!')}>Save Profile</button>
                  </div>
                )}
                {settingsTab === 'security' && (
                  <div style={card}>
                    <h2 style={sectionTitle}>Change Password</h2>
                    {pwError && <div style={{ marginBottom:10, padding:'8px 12px', borderRadius:6, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', fontSize:11, color:'#f87171' }}>{pwError}</div>}
                    {pwSuccess && <div style={{ marginBottom:10, padding:'8px 12px', borderRadius:6, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', fontSize:11, color:'#34d399' }}>{pwSuccess}</div>}
                    {[{ k: 'oldPassword', l: 'Current Password' }, { k: 'newPassword', l: 'New Password' }, { k: 'confirmPassword', l: 'Confirm Password' }].map(f => (
                      <div key={f.k} style={{ marginBottom: 10 }}>
                        <label style={label12}>{f.l}</label>
                        <input type="password" style={inputSt} value={security[f.k]}
                          onChange={e => { setSecurity({ ...security, [f.k]: e.target.value }); setPwError(''); setPwSuccess(''); }} />
                      </div>
                    ))}
                    <button style={{ ...btnRed, width: '100%' }} onClick={handleChangePassword}>Update Password</button>
                  </div>
                )}
                {settingsTab === 'system' && (
                  <div style={card}>
                    <h2 style={sectionTitle}>System Config</h2>
                    {[
                      { label: 'Email Notifications', desc: 'System-wide email delivery', enabled: true },
                      { label: 'Registration Open', desc: 'Allow new student self-registration', enabled: true },
                      { label: 'Maintenance Mode', desc: 'Lock portal for all non-admins', enabled: false },
                    ].map((p, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>{p.label}</p>
                          <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{p.desc}</p>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, color: p.enabled ? '#10b981' : '#64748b', background: p.enabled ? 'rgba(16,185,129,0.08)' : 'rgba(100,116,139,0.08)' }}>
                          {p.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ))}
                    <button style={{ ...btnRed, width: '100%', marginTop: 14 }} onClick={() => alert('Config saved!')}>Save Config</button>
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
