import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, Clock, Navigation, Plus, X, Loader2,
  Sparkles, Car, Bike, PersonStanding, Trash2, AlertCircle,
  Bell, Save, Map as MapIcon
} from "lucide-react";
import {
  getAllTravels,
  autoExtractTravels,
  createTravel,
  deleteTravel,
  updateTravel,
} from "../services/aiService";

const TravelPage = () => {
  const navigate = useNavigate();
  const [travels, setTravels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    destination: "",
    meetingTime: "",
    meetingDate: new Date().toISOString().split("T")[0],
    mode: "driving",
    fromLocation: localStorage.getItem("homeLocation") || "",
  });

  useEffect(() => {
    loadTravels();
  }, []);

  const loadTravels = async () => {
    try {
      const data = await getAllTravels();
      setTravels(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoExtract = async () => {
    const home = form.fromLocation || prompt("Enter your starting location (e.g., Home, Hyderabad):");
    if (!home) return;

    localStorage.setItem("homeLocation", home);
    setExtracting(true);
    try {
      const result = await autoExtractTravels(home);
      alert(`✅ Found ${result.extracted} travel plan(s) from your tasks!`);
      await loadTravels();
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setExtracting(false);
    }
  };

  const handleCreate = async () => {
    if (!form.destination.trim()) {
      alert("Please enter a destination");
      return;
    }

    setCreating(true);
    try {
      await createTravel(form);
      localStorage.setItem("homeLocation", form.fromLocation);
      setShowCreate(false);
      setForm({
        destination: "",
        meetingTime: "",
        meetingDate: new Date().toISOString().split("T")[0],
        mode: "driving",
        fromLocation: form.fromLocation,
      });
      await loadTravels();
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this travel plan?")) return;
    await deleteTravel(id);
    await loadTravels();
  };

  const handleMarkComplete = async (travel) => {
    await updateTravel(travel._id, { completed: !travel.completed });
    await loadTravels();
  };

  const groupedTravels = travels.reduce((acc, t) => {
    if (!acc[t.meetingDate]) acc[t.meetingDate] = [];
    acc[t.meetingDate].push(t);
    return acc;
  }, {});

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
    
    if (dateStr === today) return "Today";
    if (dateStr === tomorrow) return "Tomorrow";
    return date.toLocaleDateString("en", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getModeIcon = (mode) => {
    if (mode === "walking") return PersonStanding;
    if (mode === "cycling") return Bike;
    return Car;
  };

  const getTimeUntil = (date, time) => {
    if (!time) return null;
    const now = new Date();
    const [h, m] = time.split(":").map(Number);
    const target = new Date(date);
    target.setHours(h, m, 0, 0);
    
    const diff = (target - now) / (1000 * 60);
    
    if (diff < 0) return { text: "Passed", color: "text-gray-400" };
    if (diff < 60) return { text: `${Math.round(diff)} mins`, color: "text-blush-500" };
    if (diff < 1440) return { text: `${Math.round(diff / 60)} hours`, color: "text-peach-500" };
    return { text: `${Math.round(diff / 1440)} days`, color: "text-mint-500" };
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* HEADER */}
      <header className="bg-white border-b border-lavender-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-700 font-display">
                🗺️ Travel Planner
              </h1>
              <p className="text-xs text-gray-400">
                {travels.length} upcoming trip{travels.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleAutoExtract}
              disabled={extracting}
              className="px-4 py-2 bg-mint-300 text-gray-700 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-soft"
            >
              {extracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Extract from Tasks
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowCreate(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-gradient-ocean"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center">
              <MapIcon className="w-6 h-6 text-babyBlue-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700">
                📍 Smart Travel Planning
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Auto-detects locations. Calculates travel time. Reminds you when to leave!
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-lavender-400 animate-spin" />
          </div>
        ) : travels.length === 0 ? (
          <div className="card text-center py-16">
            <MapPin className="w-16 h-16 mx-auto text-lavender-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 font-display mb-2">
              No travel plans yet
            </h3>
            <p className="text-gray-500 mb-6">
              Add a trip manually or extract from your tasks
            </p>
            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={handleAutoExtract}
                className="px-5 py-2 bg-mint-300 text-gray-700 rounded-xl font-semibold flex items-center gap-2 shadow-soft"
              >
                <Sparkles className="w-4 h-4" />
                Extract from Tasks
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setShowCreate(true)}
                className="btn-primary"
              >
                + Manual Entry
              </motion.button>
            </div>
          </div>
        ) : (
          Object.entries(groupedTravels).map(([date, dayTravels]) => (
            <div key={date} className="space-y-3">
              <h2 className="text-base font-bold text-gray-700 font-display flex items-center gap-2">
                📅 {formatDate(date)}
                <span className="text-xs text-gray-400 font-normal">
                  ({dayTravels.length} trip{dayTravels.length !== 1 ? "s" : ""})
                </span>
              </h2>

              {dayTravels.map((travel, i) => {
                const ModeIcon = getModeIcon(travel.mode);
                const timeUntil = getTimeUntil(travel.meetingDate, travel.meetingTime);
                
                return (
                  <motion.div
                    key={travel._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`card ${travel.completed ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-6 h-6 text-white" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            {travel.taskTitle && (
                              <p className="text-xs text-gray-500 mb-1">
                                Task: {travel.taskTitle}
                              </p>
                            )}
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-lavender-500" />
                              {travel.destination}
                            </h3>
                          </div>

                          {timeUntil && (
                            <span className={`badge ${
                              timeUntil.color === "text-blush-500" ? "bg-blush-100 text-blush-500" :
                              timeUntil.color === "text-peach-500" ? "bg-peach-100 text-peach-500" :
                              "bg-mint-100 text-mint-500"
                            }`}>
                              ⏰ in {timeUntil.text}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          {travel.meetingTime && (
                            <div className="bg-lavender-50 rounded-xl p-3">
                              <p className="text-xs text-gray-400">Meeting Time</p>
                              <p className="text-sm font-bold text-gray-700 mt-1">
                                🕐 {travel.meetingTime}
                              </p>
                            </div>
                          )}
                          
                          {travel.leaveByTime && (
                            <div className="bg-blush-50 rounded-xl p-3">
                              <p className="text-xs text-gray-400">Leave By</p>
                              <p className="text-sm font-bold text-blush-500 mt-1">
                                🚗 {travel.leaveByTime}
                              </p>
                            </div>
                          )}

                          {travel.travelDurationMins && (
                            <div className="bg-peach-50 rounded-xl p-3">
                              <p className="text-xs text-gray-400">Travel Time</p>
                              <p className="text-sm font-bold text-gray-700 mt-1">
                                ⏱ {travel.travelDurationMins} mins
                              </p>
                            </div>
                          )}

                          {travel.distanceKm > 0 && (
                            <div className="bg-mint-50 rounded-xl p-3">
                              <p className="text-xs text-gray-400">Distance</p>
                              <p className="text-sm font-bold text-gray-700 mt-1">
                                📏 {travel.distanceKm} km
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Map Preview */}
                        {travel.coordinates?.lat && (
                          <div className="rounded-xl overflow-hidden border border-lavender-100 mb-3">
                            <iframe
                              width="100%"
                              height="200"
                              frameBorder="0"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${travel.coordinates.lng - 0.01},${travel.coordinates.lat - 0.01},${travel.coordinates.lng + 0.01},${travel.coordinates.lat + 0.01}&layer=mapnik&marker=${travel.coordinates.lat},${travel.coordinates.lng}`}
                              title={`Map of ${travel.destination}`}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <ModeIcon className="w-4 h-4" />
                            <span className="capitalize">{travel.mode}</span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMarkComplete(travel)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${
                                travel.completed
                                  ? "bg-mint-200 text-mint-500"
                                  : "bg-lavender-100 text-lavender-500"
                              }`}
                            >
                              {travel.completed ? "✓ Completed" : "Mark Done"}
                            </button>
                            <button
                              onClick={() => handleDelete(travel._id)}
                              className="p-1.5 text-blush-500 hover:bg-blush-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))
        )}
      </main>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-700 font-display">
                  🗺️ New Trip
                </h2>
                <button onClick={() => setShowCreate(false)} className="btn-icon">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">From (Your Location)</label>
                  <input
                    type="text"
                    placeholder="e.g., Home, Hyderabad"
                    value={form.fromLocation}
                    onChange={(e) => setForm({ ...form, fromLocation: e.target.value })}
                    className="input"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    💡 Saved for next time
                  </p>
                </div>

                <div>
                  <label className="label">Destination *</label>
                  <input
                    type="text"
                    placeholder="e.g., Connaught Place, Delhi"
                    value={form.destination}
                    onChange={(e) => setForm({ ...form, destination: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Date</label>
                    <input
                      type="date"
                      value={form.meetingDate}
                      onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Time</label>
                    <input
                      type="time"
                      value={form.meetingTime}
                      onChange={(e) => setForm({ ...form, meetingTime: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Mode of Transport</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "driving", label: "Driving", icon: Car },
                      { id: "cycling", label: "Cycling", icon: Bike },
                      { id: "walking", label: "Walking", icon: PersonStanding },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setForm({ ...form, mode: m.id })}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          form.mode === m.id
                            ? "border-lavender-300 bg-lavender-50"
                            : "border-lavender-100"
                        }`}
                      >
                        <m.icon className="w-5 h-5 mx-auto mb-1 text-lavender-500" />
                        <p className="text-xs font-semibold">{m.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  onClick={handleCreate}
                  disabled={creating || !form.destination.trim()}
                  className={`w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 ${
                    !creating && form.destination.trim()
                      ? "bg-lavender-300 text-white hover:bg-lavender-400 shadow-soft"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Create Trip
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TravelPage;