const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Notification = require('../models/Notification');

router.use(auth);

router.put('/schedule', async (req, res) => {
  try {
    const { bedtime, wakeTime, minSleepHours, alarmEnabled } = req.body;
    await User.findByIdAndUpdate(req.user._id, {
      sleepSchedule: { bedtime, wakeTime, minSleepHours: minSleepHours || 7, alarmEnabled }
    });

    // Schedule wake alarm
    if (alarmEnabled && wakeTime) {
      const [hours, minutes] = wakeTime.split(':').map(Number);
      const alarmTime = new Date();
      alarmTime.setHours(hours, minutes, 0, 0);
      if (alarmTime < new Date()) alarmTime.setDate(alarmTime.getDate() + 1);

      await Notification.create({
        userId: req.user._id,
        type: 'sleep-alarm',
        title: '⏰ Good Morning!',
        message: 'Time to wake up! Have a productive day!',
        scheduledFor: alarmTime
      });
    }

    res.json({ message: 'Sleep schedule updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/schedule', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('sleepSchedule');
    res.json(user.sleepSchedule);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;