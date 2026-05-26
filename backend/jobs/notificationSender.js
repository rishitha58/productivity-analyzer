const cron = require('node-cron');
const Notification = require('../models/Notification');

// Run every minute
cron.schedule('* * * * *', async () => {
  try {
    const now = new Date();
    const pending = await Notification.find({
      scheduledFor: { $lte: now },
      sent: false
    });

    for (const notif of pending) {
      await Notification.findByIdAndUpdate(notif._id, {
        sent: true,
        sentAt: now
      });
      // In production, emit via socket.io or push notification
      console.log(`Notification sent to ${notif.userId}: ${notif.title}`);
    }
  } catch (err) {
    console.error('Notification sender error:', err);
  }
});