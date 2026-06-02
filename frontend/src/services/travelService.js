import api from './api';

export const travelService = {
  // Extract location from text (uses NLP backend)
  extractLocation: async (text) => {
    try {
      const response = await api.post('/travel/extract-location', { text });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to extract location',
      };
    }
  },

  // Calculate travel time using Google Maps API
  calculateTravelTime: async (origin, destination, mode = 'driving') => {
    try {
      const response = await api.post('/travel/calculate-time', {
        origin,
        destination,
        mode,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to calculate travel time',
      };
    }
  },

  // Get suggested departure time
  getSuggestedDepartureTime: async (destination, arrivalTime, mode = 'driving') => {
    try {
      const response = await api.post('/travel/departure-time', {
        destination,
        arrivalTime,
        mode,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get departure time',
      };
    }
  },

  // Get route directions
  getRoute: async (origin, destination, mode = 'driving') => {
    try {
      const response = await api.post('/travel/route', {
        origin,
        destination,
        mode,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get route',
      };
    }
  },

  // Save a location (so user doesn't have to enter again)
  saveLocation: async (locationData) => {
    try {
      const response = await api.post('/travel/locations', locationData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to save location',
      };
    }
  },

  // Get saved locations
  getSavedLocations: async () => {
    try {
      const response = await api.get('/travel/locations');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch locations',
      };
    }
  },

  // Check if location was visited before
  isLocationVisited: async (locationName) => {
    try {
      const response = await api.get(`/travel/visited?name=${encodeURIComponent(locationName)}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to check location',
      };
    }
  },

  // Create travel notification
  createTravelNotification: async (notificationData) => {
    try {
      const response = await api.post('/travel/notifications', notificationData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create notification',
      };
    }
  },

  // Get user's current location (browser API)
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          let message = 'Failed to get location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = 'Location access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              message = 'Location unavailable';
              break;
            case error.TIMEOUT:
              message = 'Location request timed out';
              break;
            default:
              message = 'Unknown error';
          }
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  },
};

export default travelService;