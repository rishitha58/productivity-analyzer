import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Play, Pause, Volume2, VolumeX,
  SkipForward, SkipBack, Disc3, Headphones,
} from 'lucide-react';
import { useStudyMode } from '../../context/StudyModeContext';

const tracks = [
  {
    id: 'lofi',
    name: 'Lo-Fi Beats',
    description: 'Chill study vibes',
    emoji: '🎧',
    color: 'from-lavender-300 to-babyBlue-300',
    bgColor: 'bg-lavender-100',
    url: "/music/lofi.mp3",
  },
  {
    id: 'rain',
    name: 'Rain',
    description: 'Calming rain sounds',
    emoji: '🌧️',
    color: 'from-babyBlue-300 to-mint-300',
    bgColor: 'bg-babyBlue-100',
    url: '/music/rain.mp3',
  },
  {
    id: 'forest',
    name: 'Forest Birds',
    description: 'Nature ambience',
    emoji: '🌿',
    color: 'from-mint-300 to-softGreen-300',
    bgColor: 'bg-mint-100',
    url: '/music/nature.mp3',
  },
  {
    id: 'piano',
    name: 'Soft Piano',
    description: 'Peaceful melodies',
    emoji: '🎹',
    color: 'from-yellow-300 to-peach-300',
    bgColor: 'bg-yellow-100',
    url: '/music/piano.mp3',
  },
];

const MusicPlayer = ({ compact = false }) => {
  const {
    isMusicPlaying,
    currentMusic,
    musicVolume,
    toggleMusic,
    changeMusic,
    changeVolume,
    playTrack,  
  } = useStudyMode();

  const [isExpanded, setIsExpanded] = useState(!compact);
  const [isMuted, setIsMuted] = useState(false);

  const currentTrack = tracks.find((t) => t.id === currentMusic) || tracks[0];

  
  const handleTrackSelect = (track) => {
    changeMusic(track.id);
    playTrack(track.url);  
  };

  
  const handlePlayPause = () => {
    if (!isMusicPlaying) {
      playTrack(currentTrack.url);
    } else {
      toggleMusic();
    }
  };

  const handleNext = () => {
    const currentIdx = tracks.findIndex((t) => t.id === currentMusic);
    const nextTrack = tracks[(currentIdx + 1) % tracks.length];
    handleTrackSelect(nextTrack);
  };

  const handlePrev = () => {
    const currentIdx = tracks.findIndex((t) => t.id === currentMusic);
    const prevTrack = tracks[(currentIdx - 1 + tracks.length) % tracks.length];
    handleTrackSelect(prevTrack);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-soft border border-white/40 overflow-hidden"
    >
      

      <div className="p-5">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: isMusicPlaying ? 360 : 0 }}
            transition={{
              duration: 4,
              repeat: isMusicPlaying ? Infinity : 0,
              ease: 'linear',
            }}
            className={`w-14 h-14 rounded-full bg-gradient-to-br ${currentTrack.color} flex items-center justify-center shadow-soft flex-shrink-0`}
          >
            <Disc3 size={26} className="text-white" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-gray-800 truncate">
                {currentTrack.emoji} {currentTrack.name}
              </h3>
              {isMusicPlaying && (
                <div className="flex items-end gap-0.5 h-3">
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['4px', '12px', '4px'] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.1,
                      }}
                      className="w-0.5 bg-mint-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {currentTrack.description}
            </p>
          </div>

          {compact && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl hover:bg-lavender-100 transition-colors"
            >
              <Headphones size={18} className="text-lavender-500" />
            </button>
          )}
        </div>

        {/* Main controls */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev}
            className="p-2.5 rounded-xl bg-lavender-100 hover:bg-lavender-200 transition-colors"
          >
            <SkipBack size={18} className="text-lavender-500" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            className={`p-4 rounded-2xl bg-gradient-to-br ${currentTrack.color} text-white shadow-medium hover:shadow-glow transition-all`}
          >
            {isMusicPlaying ? (
              <Pause size={22} fill="white" />
            ) : (
              <Play size={22} fill="white" />
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="p-2.5 rounded-xl bg-lavender-100 hover:bg-lavender-200 transition-colors"
          >
            <SkipForward size={18} className="text-lavender-500" />
          </motion.button>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => {
              setIsMuted(!isMuted);
              changeVolume(isMuted ? 0.5 : 0);
            }}
            className="p-1 hover:bg-lavender-100 rounded-lg transition-colors"
          >
            {isMuted || musicVolume === 0 ? (
              <VolumeX size={16} className="text-gray-500" />
            ) : (
              <Volume2 size={16} className="text-lavender-500" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : musicVolume}
            onChange={(e) => {
              setIsMuted(false);
              changeVolume(parseFloat(e.target.value));
            }}
            className="flex-1 h-1.5 bg-lavender-100 rounded-full appearance-none cursor-pointer accent-lavender-400"
            style={{
              background: `linear-gradient(to right, #C3B1E1 0%, #B8D8F8 ${
                (isMuted ? 0 : musicVolume) * 100
              }%, #E8DCF5 ${(isMuted ? 0 : musicVolume) * 100}%, #E8DCF5 100%)`,
            }}
          />

          <span className="text-xs text-gray-500 font-medium w-8 text-right">
            {Math.round((isMuted ? 0 : musicVolume) * 100)}%
          </span>
        </div>
      </div>

      {/* Track selection */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-lavender-100 overflow-hidden"
          >
            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                <Music size={12} /> Choose Your Vibe
              </p>
              <div className="grid grid-cols-2 gap-2">
                {tracks.map((track) => (
                  <motion.button
                    key={track.id}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleTrackSelect(track)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      currentMusic === track.id
                        ? `bg-gradient-to-br ${track.color} text-white shadow-soft`
                        : `${track.bgColor} hover:shadow-soft`
                    }`}
                  >
                    <div className="text-2xl mb-1">{track.emoji}</div>
                    <p
                      className={`text-xs font-semibold ${
                        currentMusic === track.id ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {track.name}
                    </p>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MusicPlayer;