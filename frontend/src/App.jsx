import React, { useState, useEffect } from 'react';
import { DashboardShell as AdminDashboard } from './components/DashboardShell';
import { StudentDashboard } from './components/StudentDashboard';
import { ClubAdminDashboard } from './components/ClubAdminDashboard';
import { ClubMentorDashboard } from './components/ClubMentorDashboard';
import { LoginScreen } from './components/LoginScreen';

function App() {
  const [session, setSession] = useState(null);
  const [isDark, setIsDark] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('axisTheme');
    if (savedTheme === 'light') { setIsDark(false); document.documentElement.classList.remove('dark'); }
    else { setIsDark(true); document.documentElement.classList.add('dark'); }

    const saved = localStorage.getItem('axisUser');
    if (saved) {
      try { setSession(JSON.parse(saved)); }
      catch { localStorage.removeItem('axisUser'); }
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('axisTheme', next ? 'dark' : 'light');
      return next;
    });
  };

  const handleLogin = (sessionData) => {
    localStorage.setItem('axisUser', JSON.stringify(sessionData));
    setSession(sessionData);
  };

  const handleLogout = () => {
    localStorage.removeItem('axisUser');
    localStorage.removeItem('accessToken');
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
    setSession(null);
  };

  if (!session) {
    return <LoginScreen onLogin={handleLogin} isDark={isDark} toggleTheme={toggleTheme} />;
  }

  // active_role can be switched via localStorage (e.g. club member switching to student view)
  const storedSession = (() => {
    try { return JSON.parse(localStorage.getItem('axisUser') || '{}'); } catch { return {}; }
  })();
  
  const role = storedSession.active_role || session.active_role || session.global_role || 'STUDENT';

  const shared = { isDark, toggleTheme, onLogout: handleLogout };

  // Primary club membership for CLUB_ADMIN / club member portal
  const memberships = session.club_memberships || [];
  const primaryMembership = memberships.length > 0 ? memberships[0] : null;

  return (
    <>
      {/* ── Super Admin ─────────────────────────── */}
      {role === 'SUPER_ADMIN' && (
        <AdminDashboard
          userId={session.id}
          userName={session.full_name}
          userEmail={session.email}
          userUsername={session.username}
          {...shared}
        />
      )}

      {/* ── Club Admin / Member Portal ───────────── */}
      {role === 'CLUB_ADMIN' && (
        <ClubAdminDashboard
          userId={session.id}
          userName={session.full_name}
          userEmail={session.email}
          userPhone={session.phone}
          userBranch={session.branch}
          userSection={session.section}
          userProgram={session.program}
          userGender={session.gender}
          userYear={session.year}
          userAdmissionYear={session.admission_year}
          userUsername={session.username}
          clubMemberships={memberships}
          primaryClubId={primaryMembership?.club_id || null}
          primaryClubRole={primaryMembership?.club_role || 'MEMBER'}
          primaryMembershipId={primaryMembership?.membership_id || null}
          {...shared}
        />
      )}

      {/* ── Club Mentor ─────────────────────────── */}
      {role === 'CLUB_MENTOR' && (
        <ClubMentorDashboard
          mentorId={session.id}
          userName={session.full_name}
          userEmail={session.email}
          userPhone={session.phone}
          designation={session.designation}
          department={session.department}
          userUsername={session.username}
          mentorClubIds={session.mentor_club_ids || []}
          {...shared}
        />
      )}

      {/* ── Student ─────────────────────────────── */}
      {(role === 'STUDENT' || (!['SUPER_ADMIN','CLUB_ADMIN','CLUB_MENTOR'].includes(role))) && (
        <StudentDashboard
          userId={session.id}
          userName={session.full_name}
          userEmail={session.email}
          userPhone={session.phone}
          userBranch={session.branch}
          userSection={session.section}
          userProgram={session.program}
          userGender={session.gender}
          userYear={session.year}
          userAdmissionYear={session.admission_year}
          userUsername={session.username}
          clubMemberships={memberships}
          userRole={role}
          {...shared}
        />
      )}
    </>
  );
}

export default App;
