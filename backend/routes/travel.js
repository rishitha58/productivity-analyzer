import express from "express";
import Travel from "../models/Travel.js";
import Journal from "../models/Journal.js";
import { protect } from "../middleware/auth.js";
import {
  geocodeLocation,
  calculateTravel,
  calculateLeaveByTime,
} from "../services/travelService.js";

const router = express.Router();

// GET all travels
router.get("/", protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const travels = await Travel.find({
      userId: req.user._id,
      meetingDate: { $gte: today },
    }).sort({ meetingDate: 1, meetingTime: 1 });
    res.json(travels);
  } catch (e) {
    console.error("❌ Get travels error:", e);
    res.status(500).json({ error: e.message });
  }
});

// GET today
router.get("/today", protect, async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const travels = await Travel.find({
      userId: req.user._id,
      meetingDate: today,
    }).sort({ meetingTime: 1 });
    res.json(travels);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// AUTO-EXTRACT
router.post("/auto-extract", protect, async (req, res) => {
  try {
    const { fromLocation } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const journal = await Journal.findOne({ userId: req.user._id, date: today });
    if (!journal?.tasks) {
      return res.json({ extracted: 0, travels: [] });
    }

    let fromCoords = null;
    if (fromLocation) {
      fromCoords = await geocodeLocation(fromLocation);
    }

    const newTravels = [];

    for (const task of journal.tasks) {
      if (!task.location) continue;

      const exists = await Travel.findOne({
        userId: req.user._id,
        meetingDate: today,
        destination: task.location,
      });
      if (exists) continue;

      const toCoords = await geocodeLocation(task.location);
      if (!toCoords) continue;

      let travelData = { durationMins: 30, distanceKm: 0 };

      if (fromCoords) {
        const calc = await calculateTravel(fromCoords, toCoords);
        if (calc) travelData = calc;
      }

      const leaveBy = task.time
        ? calculateLeaveByTime(task.time, travelData.durationMins)
        : null;

      const travel = await Travel.create({
        userId: req.user._id,
        taskId: task._id?.toString(),
        taskTitle: task.title,
        destination: task.location,
        coordinates: toCoords,
        meetingTime: task.time,
        meetingDate: today,
        travelDurationMins: travelData.durationMins,
        distanceKm: travelData.distanceKm,
        leaveByTime: leaveBy,
      });

      newTravels.push(travel);
    }

    res.json({ extracted: newTravels.length, travels: newTravels });
  } catch (e) {
    console.error("❌ Auto-extract error:", e);
    res.status(500).json({ error: e.message });
  }
});

// CREATE travel
router.post("/", protect, async (req, res) => {
  try {
    console.log("📩 Create travel request:", req.body);

    const {
      destination,
      meetingTime,
      meetingDate,
      mode = "driving",
      fromLocation,
    } = req.body;

    if (!destination || !meetingDate) {
      return res.status(400).json({ error: "Destination and date required" });
    }

    // Geocode destination
    console.log("🔍 Geocoding destination:", destination);
    const toCoords = await geocodeLocation(destination);
    
    if (!toCoords) {
      // Save anyway with default values
      console.log("⚠️ Couldn't find location, saving without coordinates");
    }

    let travelData = { durationMins: 30, distanceKm: 0 };

    if (fromLocation && toCoords) {
      console.log("🔍 Geocoding from:", fromLocation);
      const fromCoords = await geocodeLocation(fromLocation);
      if (fromCoords) {
        const calc = await calculateTravel(fromCoords, toCoords, mode);
        if (calc) travelData = calc;
      }
    }

    const leaveBy = meetingTime
      ? calculateLeaveByTime(meetingTime, travelData.durationMins)
      : null;

    const travel = await Travel.create({
      userId: req.user._id,
      destination,
      coordinates: toCoords || { lat: 0, lng: 0 },
      meetingTime,
      meetingDate,
      travelDurationMins: travelData.durationMins,
      distanceKm: travelData.distanceKm,
      leaveByTime: leaveBy,
      mode,
    });

    console.log("✅ Travel created:", travel._id);
    res.json(travel);
  } catch (e) {
    console.error("❌ Create travel error:", e);
    res.status(500).json({ error: e.message });
  }
});

// UPDATE
router.patch("/:id", protect, async (req, res) => {
  try {
    const travel = await Travel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    res.json(travel);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE
router.delete("/:id", protect, async (req, res) => {
  try {
    await Travel.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;