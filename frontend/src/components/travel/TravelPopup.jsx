import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Clock,
  Navigation,
  Bell,
  Car,
  Bike,
  PersonStanding,
  Bus,
  Sparkles,
  Loader2,
  Check,
  X,
  Calendar,
  ArrowRight,
  Compass,
} from 'lucide-react';
import Modal from '../common/Modal';
import { travelService } from '../../services/travelService';
import { useNotifications } from '../../hooks/useNotifications';

const TravelPopup = ({ isOpen, onClose, destination, eventTime, isReturnVisit = false }) => {
  const [step, setStep] = useState(1); // 1: Ask notify, 2: Get location, 3: Show route
  const [wantsNotification, setWantsNotification] = useState(null);
  const [hasLocation, setHasLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('');
  const [transportMode, setTransportMode] = useState('driving');
  const [customNotifyTime, setCustomNotifyTime] = useState('15');
  const [travelInfo, setTravelInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const { scheduleTravelReminder, showToast } = useNotifications();

  const transportModes = [
    { id: 'driving', label: 'Drive', icon: Car, color: 'babyBlue' },
    { id: 'transit', label: 'Transit', icon: Bus, color: 'mint' },
    { id: 'bicycling', label: 'Bike', icon: Bike, color: 'peach' },
    { id: 'walking', label: 'Walk', icon: PersonStanding, color: 'lavender' },
  ];

  const notifyTimes = [
    { value: '10', label: '10 min before' },
    { value: '15', label: '15 min before' },
    { value: '30', label: '30 min before' },
    { value: '60', label: '1 hour before' },
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset on close
      setTimeout(() => {
        setStep(1);
        setWantsNotification(null);
        setHasLocation(null);
        setCurrentLocation('');
        setTransportMode('driving');
        setCustomNotifyTime('15');
        setTravelInfo(null);
      }, 300);
    }
  }, [isOpen]);

  // Step 1: Handle notify choice
  const handleNotifyChoice = (choice) => {
    setWantsNotification(choice);
    if (!choice) {
      // User said no - close popup
      showToast('No notifications scheduled', 'info');
      onClose();
      return;
    }

    // If return visit, skip to scheduling directly
    if (isReturnVisit) {
      handleCalculateRoute('saved');
    } else {
      setStep(2);
    }
  };

  // Step 2: Handle location choice
  const handleLocationChoice = async (provideLocation) => {
    setHasLocation(provideLocation);

    if (!provideLocation) {
      // User doesn't want to share location - just set reminder time
      setStep(3);
    } else {
      // Get current location
      setLoading(true);
      try {
        const location = await travelService.getCurrentLocation();
        setCurrentLocation(`${location.lat}, ${location.lng}`);
        await handleCalculateRoute(location);
      } catch (err) {
        showToast('Could not get your location', 'error');
        setHasLocation(false);
      }
      setLoading(false);
    }
  };

  // Calculate route & travel time
  const handleCalculateRoute = async (origin) => {
    setLoading(true);

    // Mock travel info (replace with real API call)
    const mockInfo = {
      duration: '25 mins',
      distance: '12.5 km',
      arrivalTime: eventTime || '5:30 PM',
      departureTime: '5:05 PM',
      route: 'via Main Street and Highway 101',
    };

    setTimeout(() => {
      setTravelInfo(mockInfo);
      setStep(3);
      setLoading(false);
    }, 1200);
  };

  // Step 3: Schedule notification
  const handleSchedule = () => {
    const time = hasLocation && travelInfo
      ? travelInfo.departureTime
      : `${customNotifyTime} min before`;

    scheduleTravelReminder(time, destination);
    showToast(`Travel reminder set! 🚗`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={true}
      title=""
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-babyBlue-300 to-lavender-300 flex items-center justify-center shadow-soft"
        >
          <MapPin className="text-white" size={28} />
        </motion.div>
        <h2 className="text-2xl font-display font-bold text-gradient-cool">
          Travel Detected
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Heading to{' '}
          <span className="font-semibold text-gray-700">{destination}</span>
        </p>
        {eventTime && (
          <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
            <Clock size={12} />
            Arrival: {eventTime}
          </p>
        )}
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all ${
              s === step
                ? 'w-8 bg-gradient-to-r from-babyBlue-400 to-lavender-400'
                : s < step
                ? 'w-1.5 bg-mint-400'
                : 'w-1.5 bg-gray-200'
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ============ STEP 1: Want notification? ============ */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h3 className="font-display font-bold text-gray-800 mb-2">
                Should I notify you before you leave? 🔔
              </h3>
              <p className="text-sm text-gray-500">
                {isReturnVisit
                  ? "You've been here before. Want a reminder this time?"
                  : "I can remind you so you don't miss your appointment"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <motion.button
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNotifyChoice(true)}
                className="p-5 bg-gradient-to-br from-mint-100 to-softGreen-100 hover:from-mint-200 hover:to-softGreen-200 rounded-2xl border-2 border-mint-200 hover:border-mint-300 transition-all"
              >
                <Bell className="mx-auto text-mint-500 mb-2" size={28} />
                <p className="font-semibold text-gray-800">Yes, notify me</p>
                <p className="text-xs text-gray-500 mt-1">Recommended ✨</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNotifyChoice(false)}
                className="p-5 bg-white hover:bg-gray-50 rounded-2xl border-2 border-gray-200 hover:border-gray-300 transition-all"
              >
                <X className="mx-auto text-gray-400 mb-2" size={28} />
                <p className="font-semibold text-gray-600">No, thanks</p>
                <p className="text-xs text-gray-400 mt-1">I got this</p>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ============ STEP 2: Provide location? ============ */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            <div className="text-center">
              <h3 className="font-display font-bold text-gray-800 mb-2">
                Share your location? 📍
              </h3>
              <p className="text-sm text-gray-500">
                I can calculate exact travel time and best route
              </p>
            </div>

            <div className="space-y-2 mt-5">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleLocationChoice(true)}
                disabled={loading}
                className="w-full p-4 bg-gradient-to-r from-babyBlue-100 to-lavender-100 hover:from-babyBlue-200 hover:to-lavender-200 rounded-2xl border-2 border-babyBlue-200 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-babyBlue-300 to-lavender-300 flex items-center justify-center flex-shrink-0">
                  {loading ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                  ) : (
                    <Navigation size={20} className="text-white" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">Yes, use my location</p>
                  <p className="text-xs text-gray-500">
                    Get precise travel time & route
                  </p>
                </div>
                <ArrowRight size={18} className="text-babyBlue-500" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleLocationChoice(false)}
                className="w-full p-4 bg-white hover:bg-gray-50 rounded-2xl border-2 border-gray-200 transition-all flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-gray-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">
                    Just set a reminder time
                  </p>
                  <p className="text-xs text-gray-500">
                    No location needed
                  </p>
                </div>
                <ArrowRight size={18} className="text-gray-400" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ============ STEP 3: Confirm & Schedule ============ */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="space-y-4"
          >
            {/* With Location - Show route info */}
            {hasLocation && travelInfo ? (
              <>
                <div className="text-center mb-4">
                  <h3 className="font-display font-bold text-gray-800 mb-1">
                    Your Travel Plan 🚗
                  </h3>
                  <p className="text-sm text-gray-500">Choose your mode</p>
                </div>

                {/* Transport modes */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {transportModes.map((mode) => (
                    <motion.button
                      key={mode.id}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTransportMode(mode.id)}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        transportMode === mode.id
                          ? `bg-${mode.color}-100 border-${mode.color}-400 shadow-soft`
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <mode.icon
                        size={20}
                        className={
                          transportMode === mode.id
                            ? `text-${mode.color}-500`
                            : 'text-gray-400'
                        }
                      />
                      <span
                        className={`text-xs font-medium ${
                          transportMode === mode.id ? 'text-gray-800' : 'text-gray-500'
                        }`}
                      >
                        {mode.label}
                      </span>
                    </motion.button>
                  ))}
                </div>

                {/* Travel info card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden bg-gradient-to-br from-babyBlue-100 via-lavender-100 to-mint-100 rounded-2xl p-5 border border-babyBlue-200"
                >
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">⏱️ Duration</p>
                      <p className="text-xl font-display font-bold text-gray-800">
                        {travelInfo.duration}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">📏 Distance</p>
                      <p className="text-xl font-display font-bold text-gray-800">
                        {travelInfo.distance}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-babyBlue-300/40 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Bell size={14} className="text-peach-500" />
                        Leave at:
                      </span>
                      <span className="font-bold text-peach-500">
                        {travelInfo.departureTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1.5">
                        <Check size={14} className="text-mint-500" />
                        Arrive by:
                      </span>
                      <span className="font-bold text-mint-500">
                        {travelInfo.arrivalTime}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mt-3 flex items-center gap-1">
                    <Compass size={11} />
                    {travelInfo.route}
                  </p>
                </motion.div>
              </>
            ) : (
              /* Without Location - Just choose notify time */
              <>
                <div className="text-center mb-4">
                  <h3 className="font-display font-bold text-gray-800 mb-1">
                    When should I remind you? ⏰
                  </h3>
                  <p className="text-sm text-gray-500">
                    Pick how early you want the alert
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {notifyTimes.map((t) => (
                    <motion.button
                      key={t.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCustomNotifyTime(t.value)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        customNotifyTime === t.value
                          ? 'bg-gradient-to-r from-babyBlue-100 to-lavender-100 border-babyBlue-400 shadow-soft'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <p
                        className={`text-sm font-semibold ${
                          customNotifyTime === t.value
                            ? 'text-gray-800'
                            : 'text-gray-600'
                        }`}
                      >
                        {t.label}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mt-6 pt-5 border-t border-lavender-100">
              <button onClick={onClose} className="btn-outline flex-1">
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSchedule}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <Bell size={16} />
                Set Reminder
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

export default TravelPopup;