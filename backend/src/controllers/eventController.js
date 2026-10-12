const db = require('../models');
const Event = db.Event;
const EventRegistration = db.EventRegistration;
const User = db.User;
const qrService = require('../services/qrService');
const analyticsService = require('../services/analyticsService');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['start_time', 'ASC']]
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.userId; // Pulled from JWT via authMiddleware
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. JWT required." });
    }

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const existing = await EventRegistration.findOne({ where: { event_id: eventId, user_id: userId } });
    if (existing) {
      return res.status(400).json({ message: "Already registered for this event." });
    }

    const qrHash = qrService.generateQRHash(`reg-${Date.now()}`);

    const registration = await EventRegistration.create({
      event_id: eventId,
      user_id: userId,
      qr_hash: qrHash,
      check_in_status: false
    });

    res.status(201).json({ message: "Successfully registered", registration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.checkInEvent = async (req, res) => {
  try {
    const { qr_hash } = req.body;
    if (!qr_hash) return res.status(400).json({ message: "QR hash required" });

    const registration = await EventRegistration.findOne({ where: { qr_hash } });
    if (!registration) return res.status(404).json({ message: "Invalid QR Code" });

    if (registration.check_in_status) return res.status(400).json({ message: "Already checked in" });

    registration.check_in_status = true;
    registration.check_in_time = new Date();
    await registration.save();

    res.json({ message: "Check-in successful", registration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEventTracker = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized." });

    const registrations = await EventRegistration.findAll({
       where: { user_id: userId },
       include: [{ model: Event }]
    });

    const now = new Date();
    const live = [];
    const upcoming = [];
    const completed = [];

    registrations.forEach(reg => {
       const event = reg.Event;
       if (!event) return;

       const isPastStart = now >= new Date(event.start_time);
       const isPastEnd = now >= new Date(event.end_time);

       if (isPastEnd || event.status === 'COMPLETED') {
         completed.push(event);
       } else if (isPastStart && !isPastEnd || event.status === 'LIVE') {
         live.push(event);
       } else {
         upcoming.push(event);
       }
    });

    res.json({ live, upcoming, completed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.exportEventRoster = async (req, res) => {
  try {
    const eventId = req.params.id;
    const roster = await EventRegistration.findAll({
       where: { event_id: eventId },
       include: [{ model: User, attributes: ['full_name', 'email', 'branch'] }]
    });

    if (!roster || roster.length === 0) {
       return res.status(404).json({ message: "No registrations found for this event." });
    }

    const data = roster.map(r => ({
       RegistrationId: r.id,
       FullName: r.User ? r.User.full_name : 'N/A',
       Email: r.User ? r.User.email : 'N/A',
       Branch: r.User ? r.User.branch : 'N/A',
       CheckedIn: r.check_in_status ? 'Yes' : 'No',
       CheckInTime: r.check_in_time ? r.check_in_time.toISOString() : 'N/A'
    }));

    const csv = analyticsService.exportToCSV(data);
    
    if (!csv) {
      return res.status(500).json({ message: "Failed to generate CSV." });
    }

    res.header('Content-Type', 'text/csv');
    res.attachment(`event-${eventId}-roster.csv`);
    return res.send(csv);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
