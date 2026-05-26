const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { calculateTravel, setTravelNotification, getTravelHistory } = require('../controllers/travelController');

router.use(auth);
router.post('/calculate', calculateTravel);
router.post('/notify', setTravelNotification);
router.get('/history', getTravelHistory);

module.exports = router;