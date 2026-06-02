import { createContext, useContext, useState, useEffect, useRef } from 'react';

const StudyModeContext = createContext();

export const StudyModeProvider = ({ children }) => {
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentMusic, setCurrentMusic] = useState('lofi');
  const [musicVolume, setMusicVolume] = useState(0.5);
  
  //  Global audio
  const audioRef = useRef(null);
  const [currentTrackUrl, setCurrentTrackUrl] = useState(null);
  
  const [currentTask, setCurrentTask] = useState(null);
  
  // Focus Timer
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionCount, setSessionCount] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  
  const [doubtsAsked, setDoubtsAsked] = useState(0);
  const [studyStartTime, setStudyStartTime] = useState(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);

  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
      audioRef.current.volume = musicVolume;
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isMusicPlaying && currentTrackUrl) {
      audioRef.current.play().catch((err) => {
        console.log('Audio play failed:', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isMusicPlaying, currentTrackUrl]);

  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  
  const playTrack = (trackUrl) => {
    if (!audioRef.current) return;
    
    if (currentTrackUrl !== trackUrl) {
      audioRef.current.src = trackUrl;
      setCurrentTrackUrl(trackUrl);
    }
    setIsMusicPlaying(true);
  };

  // Restore session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('studySession');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.isStudyMode && data.currentTask) {
          const now = Date.now();
          const elapsed = Math.floor((now - data.savedAt) / 1000);
          
          if (elapsed < 7200) {
            setIsStudyMode(true);
            setCurrentTask(data.currentTask);
            setTimerDuration(data.timerDuration);
            setSessionCount(data.sessionCount || 0);
            setIsBreak(data.isBreak || false);
            setDoubtsAsked(data.doubtsAsked || 0);
            setStudyStartTime(data.studyStartTime);
            
            if (data.timerActive) {
              const newTimeLeft = Math.max(0, data.timeLeft - elapsed);
              setTimeLeft(newTimeLeft);
              if (newTimeLeft > 0) setTimerActive(true);
            } else {
              setTimeLeft(data.timeLeft);
            }
          } else {
            localStorage.removeItem('studySession');
          }
        }
      } catch (e) {
        console.error('Failed to restore study session:', e);
        localStorage.removeItem('studySession');
      }
    }
  }, []);

  // Save session
  useEffect(() => {
    if (isStudyMode && currentTask) {
      const data = {
        isStudyMode, currentTask, timerActive, timerDuration, timeLeft,
        sessionCount, isBreak, doubtsAsked, studyStartTime,
        savedAt: Date.now(),
      };
      localStorage.setItem('studySession', JSON.stringify(data));
    }
  }, [isStudyMode, currentTask, timerActive, timerDuration, timeLeft, sessionCount, isBreak, doubtsAsked, studyStartTime]);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const enterStudyMode = (task = null) => {
    if (isStudyMode) {
      if (task) setCurrentTask(task);
      return;
    }
    setIsStudyMode(true);
    setCurrentTask(task);
    setStudyStartTime(Date.now());
    setDoubtsAsked(0);
  };

  const exitStudyMode = () => {
    if (studyStartTime) {
      const sessionDuration = Math.floor((Date.now() - studyStartTime) / 1000);
      setTotalStudyTime((prev) => prev + sessionDuration);
    }
    setIsStudyMode(false);
    setCurrentTask(null);
    setIsMusicPlaying(false);
    setTimerActive(false);
    setStudyStartTime(null);
    setDoubtsAsked(0);
    localStorage.removeItem('studySession');
  };

  const toggleMusic = () => setIsMusicPlaying((prev) => !prev);
  const changeMusic = (type) => setCurrentMusic(type);
  const changeVolume = (vol) => setMusicVolume(vol);

  const startTimer = (minutes = 25, force = false) => {
    if (timerActive && !force) return;
    const seconds = minutes * 60;
    setTimerDuration(seconds);
    setTimeLeft(seconds);
    setTimerActive(true);
    setIsBreak(false);
  };

  const setFocusDuration = (minutes) => {
    const seconds = minutes * 60;
    setTimerDuration(seconds);
    setTimeLeft(seconds);
    setTimerActive(false);
    setIsBreak(false);
  };

  const setBreakDuration = (minutes) => {
    const seconds = minutes * 60;
    setTimerDuration(seconds);
    setTimeLeft(seconds);
    setTimerActive(false);
    setIsBreak(true);
  };

  const pauseTimer = () => setTimerActive(false);
  const resumeTimer = () => setTimerActive(true);
  const toggleTimer = () => setTimerActive((prev) => !prev);
  
  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(timerDuration);
  };

  const skipSession = () => {
    setTimerActive(false);
    if (isBreak) {
      setIsBreak(false);
      setTimerDuration(25 * 60);
      setTimeLeft(25 * 60);
    } else {
      setIsBreak(true);
      const breakTime = sessionCount % 4 === 3 ? 15 * 60 : 5 * 60;
      setTimerDuration(breakTime);
      setTimeLeft(breakTime);
    }
  };

  const incrementDoubts = () => setDoubtsAsked((prev) => prev + 1);

  const handleTimerComplete = () => {
    setTimerActive(false);
    setSessionCount((prev) => prev + 1);
    
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    } catch (e) {}

    if (!isBreak) {
      const breakTime = sessionCount % 4 === 3 ? 15 * 60 : 5 * 60;
      setTimerDuration(breakTime);
      setTimeLeft(breakTime);
      setIsBreak(true);
    } else {
      setIsBreak(false);
      setTimerDuration(25 * 60);
      setTimeLeft(25 * 60);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const value = {
    isStudyMode, enterStudyMode, exitStudyMode, currentTask, setCurrentTask,
    isMusicPlaying, currentMusic, musicVolume, toggleMusic, changeMusic, changeVolume,
    currentTrackUrl, playTrack,  
    timerActive, timerDuration, timeLeft, sessionCount, isBreak,
    startTimer, pauseTimer, resumeTimer, toggleTimer, resetTimer, skipSession, formatTime,
    setFocusDuration, setBreakDuration,
    doubtsAsked, incrementDoubts,
    totalStudyTime, studyStartTime,
  };

  return (
    <StudyModeContext.Provider value={value}>
      {children}
    </StudyModeContext.Provider>
  );
};

export const useStudyMode = () => {
  const context = useContext(StudyModeContext);
  if (!context) {
    throw new Error('useStudyMode must be used within StudyModeProvider');
  }
  return context;
};