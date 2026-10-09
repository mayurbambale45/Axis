const express = require('express');
const router = express.Router();
const db = require('../models');
const Event = db.Event;
const EventRegistration = db.EventRegistration;
const qrService = require('../services/qrService');

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.findAll({
      order: [['start_time', 'ASC']]
    });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register for an event
router.post('/:id/register', async (req, res) => {
  try {
    const eventId = req.params.id;
    // Assuming hardcoded user for demo purposes if not using JWT
    const userId = req.body.userId || '00000000-0000-0000-0000-000000000000'; // Or any valid user ID
    
    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Generate unique QR hash
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
});

router.post('/check-in', async (req, res) => {
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
});

module.exports = router;
