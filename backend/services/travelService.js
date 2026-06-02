import axios from "axios";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OSRM_URL = "https://router.project-osrm.org/route/v1";

export const geocodeLocation = async (locationName) => {
  try {
    const response = await axios.get(NOMINATIM_URL, {
      params: {
        q: locationName,
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": "ProductivityAnalyzer/1.0",
      },
    });

    if (response.data.length === 0) {
      return null;
    }

    const place = response.data[0];
    return {
      lat: parseFloat(place.lat),
      lng: parseFloat(place.lon),
      displayName: place.display_name,
    };
  } catch (error) {
    console.error("❌ Geocoding error:", error.message);
    return null;
  }
};

export const calculateTravel = async (fromCoords, toCoords, mode = "driving") => {
  try {
    const osrmMode = mode === "walking" ? "foot" : mode === "cycling" ? "bike" : "car";
    const url = `${OSRM_URL}/${osrmMode}/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}`;
    
    const response = await axios.get(url, {
      params: { overview: "false" },
    });

    if (!response.data.routes || response.data.routes.length === 0) {
      return null;
    }

    const route = response.data.routes[0];
    return {
      durationMins: Math.round(route.duration / 60),
      distanceKm: parseFloat((route.distance / 1000).toFixed(2)),
    };
  } catch (error) {
    console.error("❌ Routing error:", error.message);
    const distance = haversineDistance(fromCoords, toCoords);
    return {
      durationMins: Math.round(distance / (mode === "walking" ? 5 : mode === "cycling" ? 15 : 40) * 60),
      distanceKm: parseFloat(distance.toFixed(2)),
      estimated: true,
    };
  }
};

function haversineDistance(p1, p2) {
  const R = 6371;
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const calculateLeaveByTime = (meetingTime, travelDurationMins, bufferMins = 10) => {
  const [hour, min] = meetingTime.split(":").map(Number);
  const meetingMinutes = hour * 60 + min;
  const leaveMinutes = meetingMinutes - travelDurationMins - bufferMins;

  if (leaveMinutes < 0) return "00:00";

  const leaveHour = Math.floor(leaveMinutes / 60);
  const leaveMin = leaveMinutes % 60;
  return `${leaveHour.toString().padStart(2, "0")}:${leaveMin.toString().padStart(2, "0")}`;
};