import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Loader2,
  AlertCircle,
  ExternalLink,
  Clock,
  Compass,
  Car,
} from 'lucide-react';

const MapView = ({
  origin,
  destination,
  apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  height = '400px',
  showInfo = true,
  travelMode = 'DRIVING',
}) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [directionsService, setDirectionsService] = useState(null);
  const [directionsRenderer, setDirectionsRenderer] = useState(null);
  const [travelInfo, setTravelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is missing');
      setLoading(false);
      return;
    }

    // Check if script already loaded
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    script.onerror = () => {
      setError('Failed to load Google Maps');
      setLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
    };
  }, [apiKey]);

  // Initialize map
  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    try {
      // Pastel-themed map style
      const mapStyles = [
        {
          elementType: 'geometry',
          stylers: [{ color: '#F5F0FB' }],
        },
        {
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6B7280' }],
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#FFFFFF' }],
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#FFFFFF' }],
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#FFD5B8' }],
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#B8D8F8' }],
        },
        {
          featureType: 'landscape',
          elementType: 'geometry',
          stylers: [{ color: '#E8DCF5' }],
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#B5EAD7' }],
        },
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ];

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: 0, lng: 0 },
        styles: mapStyles,
        disableDefaultUI: true,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });

      const dService = new window.google.maps.DirectionsService();
      const dRenderer = new window.google.maps.DirectionsRenderer({
        map: mapInstance,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#C3B1E1',
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });

      setMap(mapInstance);
      setDirectionsService(dService);
      setDirectionsRenderer(dRenderer);
      setLoading(false);

      // If origin and destination provided, calculate route
      if (origin && destination) {
        calculateRoute(dService, dRenderer, origin, destination);
      }
    } catch (err) {
      setError('Failed to initialize map');
      setLoading(false);
    }
  };

  // Recalculate route when origin/destination changes
  useEffect(() => {
    if (directionsService && directionsRenderer && origin && destination) {
      calculateRoute(directionsService, directionsRenderer, origin, destination);
    }
  }, [origin, destination, travelMode]);

  // Calculate route
  const calculateRoute = (service, renderer, from, to) => {
    service.route(
      {
        origin: from,
        destination: to,
        travelMode: window.google.maps.TravelMode[travelMode],
      },
      (result, status) => {
        if (status === 'OK') {
          renderer.setDirections(result);
          const leg = result.routes[0].legs[0];
          setTravelInfo({
            distance: leg.distance.text,
            duration: leg.duration.text,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
          });
        } else {
          setError('Could not find a route');
        }
      }
    );
  };

  // Open in Google Maps
  const openInGoogleMaps = () => {
    if (origin && destination) {
      const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
        origin
      )}&destination=${encodeURIComponent(destination)}&travelmode=${travelMode.toLowerCase()}`;
      window.open(url, '_blank');
    }
  };

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-3xl p-8 shadow-soft border border-blush-200"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-blush-100 flex items-center justify-center">
            <AlertCircle size={28} className="text-blush-500" />
          </div>
          <h3 className="font-display font-bold text-gray-800 mb-2">
            Map Unavailable
          </h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          {!apiKey && (
            <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">
              💡 Add <code className="bg-lavender-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to your
              .env file
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Map container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-white rounded-3xl overflow-hidden shadow-soft border border-lavender-100"
        style={{ height }}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-gradient-to-br from-lavender-50 via-babyBlue-50 to-mint-50">
            <div className="text-center">
              <Loader2
                size={36}
                className="mx-auto text-lavender-400 animate-spin mb-2"
              />
              <p className="text-sm text-gray-500">Loading map...</p>
            </div>
          </div>
        )}

        {/* Map */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Open in Google Maps button */}
        {!loading && origin && destination && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openInGoogleMaps}
            className="absolute top-4 right-4 px-3 py-2 bg-white/90 backdrop-blur-md text-gray-700 text-xs font-medium rounded-xl shadow-medium hover:bg-white transition-all flex items-center gap-1.5 z-10"
          >
            <ExternalLink size={12} />
            Open in Maps
          </motion.button>
        )}
      </motion.div>

      {/* Travel info card */}
      {showInfo && travelInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-4 shadow-soft border border-lavender-100"
        >
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-babyBlue-200 to-lavender-200 flex items-center justify-center">
                <Clock size={16} className="text-babyBlue-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Duration
                </p>
                <p className="font-bold text-gray-800">{travelInfo.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-mint-200 to-softGreen-200 flex items-center justify-center">
                <Compass size={16} className="text-mint-500" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                  Distance
                </p>
                <p className="font-bold text-gray-800">{travelInfo.distance}</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-lavender-100 space-y-1.5">
            <div className="flex items-start gap-2 text-xs">
              <MapPin size={12} className="text-mint-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600 line-clamp-1">
                <span className="font-semibold">From:</span> {travelInfo.startAddress}
              </p>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <Navigation size={12} className="text-blush-500 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600 line-clamp-1">
                <span className="font-semibold">To:</span> {travelInfo.endAddress}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ============ Simple location picker (without API for testing) ============
export const LocationPickerCard = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const popularLocations = [
    { name: 'Home', icon: '🏠', address: 'Home Address' },
    { name: 'Office', icon: '🏢', address: 'Office Address' },
    { name: 'Gym', icon: '💪', address: 'Gym Address' },
    { name: 'University', icon: '🎓', address: 'University Address' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-5 shadow-soft border border-lavender-100"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-babyBlue-300 to-lavender-300 flex items-center justify-center">
          <MapPin className="text-white" size={18} />
        </div>
        <h3 className="font-display font-bold text-gray-800">Select Location</h3>
      </div>

      <div className="relative mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a place..."
          className="input-field"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 mb-2">
          Saved Places
        </p>
        {popularLocations.map((loc, idx) => (
          <motion.button
            key={idx}
            whileHover={{ scale: 1.01, x: 4 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onLocationSelect?.(loc)}
            className="w-full p-3 bg-lavender-50 hover:bg-lavender-100 rounded-xl flex items-center gap-3 transition-all text-left"
          >
            <span className="text-2xl">{loc.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{loc.name}</p>
              <p className="text-xs text-gray-500">{loc.address}</p>
            </div>
            <Navigation size={14} className="text-lavender-400" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default MapView;