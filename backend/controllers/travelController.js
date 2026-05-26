// backend/controllers/travelController.js
const axios = require('axios');
const Travel = require('../models/Travel');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc Process travel request
exports.processTravelRequest = async (req, res, next) => {
  try {
    const {
      destination,
      wantsNotification,
      hasLocation,
      manualNotifyTime,
      departureTime,
      journalId,
    } = req.body;

    const user = await User.findById(req.user._id);

    // Check if location was previously visited
    const isKnownLocation = user.visitedLocations?.some(
      (loc) => loc.name.toLowerCase() === destination?.toLowerCase()
    );

    let travelInfo = {
      userId: req.user._id,
      destination,
      journalId,
      wantsNotification,
      isKnownLocation,
    };

    if (wantsNotification && hasLocation && destination) {
      // Calculate travel time using Google Maps
      try {
        const travelData = await calculateTravelTime(destination, user.homeLocation);

        travelInfo = {
          ...travelInfo,
          estimatedTravelTime: travelData.duration,
          distance: travelData.distance,
          route: travelData.route,
          departureRecommendation: calculateDepartureTime(
            departureTime,
            travelData.duration
          ),
          coordinates: travelData.destinationCoords,
        };

        // Schedule notification
        const notifyAt = new Date(travelInfo.departureRecommendation);
        notifyAt.setMinutes(notifyAt.getMinutes() - 30); // 30 min before recommended departure

        await Notification.create({
          userId: req.user._id,
          title: `🚗 Travel Reminder: ${destination}`,
          message: `Time to leave for ${destination}! Estimated travel time: ${travelData.duration}. Recommended departure: ${travelInfo.departureRecommendation}`,
          type: 'travel-alert',
          priority: 'high',
          scheduledFor: notifyAt,
          metadata: {
            travelDestination: destination,
            action: 'travel-alert',
          },
        });

        // Save to visited locations if new
        if (!isKnownLocation) {
          await User.findByIdAndUpdate(req.user._id, {
            $push: {
              visitedLocations: {
                name: destination,
                coordinates: travelData.destinationCoords,
                visitedAt: new Date(),
              },
            },
          });
        }
      } catch (mapsError) {
        console.error('Maps API error:', mapsError.message);
        travelInfo.mapsError = true;
      }
    } else if (wantsNotification && !hasLocation && manualNotifyTime) {
      // Schedule notification at user-specified time
      await Notification.create({
        userId: req.user._id,
        title: `🚗 Travel Reminder: ${destination || 'Your destination'}`,
        message: `Time to start preparing for your travel to ${destination || 'your destination'}!`,
        type: 'travel-alert',
        priority: 'high',
        scheduledFor: new Date(manualNotifyTime),
        metadata: {
          travelDestination: destination,
          action: 'travel-alert',
        },
      });
    }

    res.json({
      success: true,
      travelInfo,
      isKnownLocation,
      message: wantsNotification
        ? 'Travel notification scheduled'
        : 'Travel info saved',
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get route information
exports.getRoute = async (req, res, next) => {
  try {
    const { origin, destination } = req.query;

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params: {
          origin,
          destination,
          key: process.env.GOOGLE_MAPS_API_KEY,
          alternatives: true,
        },
      }
    );

    if (response.data.status !== 'OK') {
      return res.status(400).json({
        success: false,
        message: 'Could not fetch route',
      });
    }

    const route = response.data.routes[0];
    res.json({
      success: true,
      route: {
        distance: route.legs[0].distance.text,
        duration: route.legs[0].duration.text,
        steps: route.legs[0].steps.map((s) => ({
          instruction: s.html_instructions.replace(/<[^>]*>/g, ''),
          distance: s.distance.text,
          duration: s.duration.text,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Calculate travel time
async function calculateTravelTime(destination, origin = 'current location') {
  const response = await axios.get(
    'https://maps.googleapis.com/maps/api/distancematrix/json',
    {
      params: {
        origins: origin,
        destinations: destination,
        key: process.env.GOOGLE_MAPS_API_KEY,
        mode: 'driving',
      },
    }
  );

  const element = response.data.rows[0].elements[0];
  return {
    duration: element.duration.text,
    durationSeconds: element.duration.value,
    distance: element.distance.text,
    destinationCoords: null, // Would use Geocoding API in production
  };
}

// Helper: Calculate departure time
function calculateDepartureTime(eventTime, travelDuration) {
  if (!eventTime) return new Date().toISOString();
  const eventDate = new Date(eventTime);
  // Parse duration (e.g., "30 mins" -> 30)
  const durationMatch = travelDuration.match(/(\d+)\s*min/);
  const minutes = durationMatch ? parseInt(durationMatch[1]) : 30;
  eventDate.setMinutes(eventDate.getMinutes() - minutes - 15); // Extra 15 min buffer
  return eventDate.toISOString();
}