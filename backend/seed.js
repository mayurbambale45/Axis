/**
 * AXIS SEED SCRIPT
 * Run from: d:\PROJECTS\AXIS\backend
 * Command:  node seed.js
 */

const bcrypt = require('bcryptjs');
const db = require('./src/models');

const SALT = 8;

async function seed() {
  try {
    // Sync models without force (keep existing data)
    await db.sequelize.sync({ alter: true });
    console.log('✅ Database synced');

    const adminHash = bcrypt.hashSync('admin', SALT);

    /* ════════════ 1. SUPER ADMIN ════════════ */
    // admin - admin
    const [admin, adminCreated] = await db.User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        full_name:      'System Administrator',
        email:          'admin@axis.edu',
        password_hash:  adminHash,
        global_role:    'SUPER_ADMIN',
        account_status: 'APPROVED',
        program:        'BTECH',
        admission_year: 2020,
        branch:         'CSE',
        gender:         'Male',
      }
    });

    if (!adminCreated) {
      await admin.update({ password_hash: adminHash }); // Ensure the password is 'admin'
    }
    console.log('👤 Super Admin: admin - admin');

    /* ════════════ 2. CLUBS ════════════ */
    const clubsData = [
      { name: 'Google Developer Groups',       slug: 'gdg',   category: 'Technical',        mission_statement: 'Google Developer Groups on campus' },
      { name: 'Techno Club',                 slug: 'techno-club', category: 'Technical',        mission_statement: 'Technical innovations and robotics' },
      { name: 'ISTE Student Chapter',        slug: 'iste-student-chapter',   category: 'Technical',        mission_statement: 'Fostering technical excellence and innovation among engineering students' },
      { name: 'IEEE Student Branch',         slug: 'ieee-student-branch',    category: 'Technical',        mission_statement: 'Advancing technology for the benefit of humanity' },
    ];

    const clubs = {};
    for (const c of clubsData) {
      const [club] = await db.Club.findOrCreate({
        where: { slug: c.slug },
        defaults: { ...c, status: 'ACTIVE', is_active: true }
      });
      clubs[c.slug] = club;
      console.log('🏛️  Club:', club.name);
    }

    /* ════════════ 3. SPECIFIC USERS ════════════ */
    const usersData = [
      // Student Only (23510014 - 23510014)
      {
        username: '23510014', full_name: 'Student Demo',
        email: '23510014@students.axis.edu',
        password_hash: bcrypt.hashSync('23510014', SALT),
        global_role: 'STUDENT', branch: 'CSE', program: 'BTECH',
        admission_year: 2023, gender: 'Male', account_status: 'APPROVED',
      },
      // GDG President (23510013 - 23510013)
      {
        username: '23510013', full_name: 'GDG President',
        email: '23510013@students.axis.edu',
        password_hash: bcrypt.hashSync('23510013', SALT),
        global_role: 'CLUB_ADMIN', branch: 'CSE', program: 'BTECH',
        admission_year: 2023, gender: 'Male', account_status: 'APPROVED',
        _clubSlug: 'gdg', _clubRole: 'PRESIDENT'
      },
      // GDG VP (23510010 - 23510010)
      {
        username: '23510010', full_name: 'GDG Vice President',
        email: '23510010@students.axis.edu',
        password_hash: bcrypt.hashSync('23510010', SALT),
        global_role: 'CLUB_ADMIN', branch: 'CSE', program: 'BTECH',
        admission_year: 2023, gender: 'Female', account_status: 'APPROVED',
        _clubSlug: 'gdg', _clubRole: 'VP'
      },
      // GDG Secretary (23510011 - 23510011)
      {
        username: '23510011', full_name: 'GDG Secretary',
        email: '23510011@students.axis.edu',
        password_hash: bcrypt.hashSync('23510011', SALT),
        global_role: 'CLUB_ADMIN', branch: 'CSE', program: 'BTECH',
        admission_year: 2023, gender: 'Female', account_status: 'APPROVED',
        _clubSlug: 'gdg', _clubRole: 'SECRETARY'
      },
      // Mentor (1001 - abpatil) - Techno Club
      {
        username: '1001', full_name: 'Dr. A.B. Patil',
        email: 'abpatil@axis.edu',
        password_hash: bcrypt.hashSync('abpatil', SALT),
        global_role: 'CLUB_MENTOR', designation: 'Professor',
        department: 'Computer Engineering', account_status: 'APPROVED',
        program: 'BTECH', branch: 'CSE', admission_year: 2000,
        _mentorClubIds: ['techno-club']
      },
    ];

    for (const u of usersData) {
      const { _clubSlug, _clubRole, _mentorClubIds, ...userData } = u;
      
      let [user, created] = await db.User.findOrCreate({
        where: { username: u.username },
        defaults: userData
      });

      // Update password hash and properties if previously existed
      if (!created) {
        await user.update(userData);
      }
      console.log(`👤 Seeded user: ${user.username} (${user.full_name})`);

      // Assign to club if specified
      if (_clubSlug && clubs[_clubSlug]) {
        const [member, mc] = await db.ClubMember.findOrCreate({
          where: { user_id: user.id, club_id: clubs[_clubSlug].id },
          defaults: { club_role: _clubRole }
        });
        
        // Ensure role is accurate if previously different
        if (!mc && member.club_role !== _clubRole) {
           await member.update({ club_role: _clubRole });
        }
        console.log(`   ↳ Assigned to ${clubs[_clubSlug].name} as ${_clubRole}`);
      }

      // Assign mentor clubs
      if (_mentorClubIds) {
        const ids = _mentorClubIds.map(slug => clubs[slug]?.id).filter(id => id);
        await user.update({ mentor_club_ids: ids });
        console.log(`   ↳ Assigned as Mentor to: ${_mentorClubIds.join(', ')}`);
      }
    }

    console.log('\n🎉 Seed complete! Everything is updated.');
    console.log('━'.repeat(50));
    console.log('USERNAME => PASSWORD  [ROLE]');
    console.log('━'.repeat(50));
    console.log('admin    => admin     [Super Admin]');
    console.log('23510014 => 23510014  [Student]');
    console.log('23510013 => 23510013  [Club Admin - GDG President]');
    console.log('23510010 => 23510010  [Club Admin - GDG VP]');
    console.log('23510011 => 23510011  [Club Admin - GDG Secretary]');
    console.log('1001     => abpatil   [Club Mentor - Techno Club]');
    console.log('━'.repeat(50));
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();
