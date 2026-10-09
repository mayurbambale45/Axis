const db = require('../models');
const { Op } = require('sequelize');

/* GET /super-admin/stats */
exports.getGlobalStats = async (req, res) => {
  try {
    const [totalClubs, totalUsers, pendingCount, totalEvents, totalRegistrations] = await Promise.all([
      db.Club.count({ where: { status: 'ACTIVE' } }),
      db.User.count({ where: { account_status: 'APPROVED' } }),
      db.User.count({ where: { account_status: { [Op.in]: ['PENDING', 'TERMINATION_REQUESTED'] } } }),
      db.Event.count(),
      db.EventRegistration.count(),
    ]);

    let totalRevenue = 0;
    try {
      totalRevenue = (await db.Payment.sum('amount')) || 0;
    } catch (e) { /* Payment model may not have records */ }

    res.json({ totalClubs, totalUsers, pendingCount, totalEvents, totalRegistrations, totalRevenue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET /super-admin/clubs/pending */
exports.getPendingClubs = async (req, res) => {
  try {
    const clubs = await db.Club.findAll({ where: { approval_status: 'PENDING' } });
    res.json(clubs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* PUT /super-admin/clubs/:id/status */
exports.updateClubStatus = async (req, res) => {
  try {
    const club = await db.Club.findByPk(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found' });
    club.approval_status = req.body.status;
    await club.save();
    res.json({ message: `Club ${club.approval_status}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET /super-admin/users */
exports.getUsers = async (req, res) => {
  try {
    const users = await db.User.findAll({
      attributes: ['id', 'full_name', 'email', 'global_role', 'account_status', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 200
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* PUT /super-admin/users/:id/role */
exports.updateUserRole = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.global_role = req.body.role;
    await user.save();
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET /super-admin/transactions */
exports.getTransactions = async (req, res) => {
  try {
    const payments = await db.Payment.findAll({
      include: [
        { model: db.User, attributes: ['full_name'], required: false },
        { model: db.Event, attributes: ['title'], required: false }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    res.json(payments);
  } catch (error) {
    // Return empty array if Payment table is empty or doesn't exist yet
    res.json([]);
  }
};

/* DELETE /super-admin/events/:id */
exports.deleteEvent = async (req, res) => {
  try {
    await db.Event.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Event successfully taken down' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
