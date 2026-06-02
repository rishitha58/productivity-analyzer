import { createContext, useContext, useState, useEffect, useRef } from 'react';

const StudyModeContext = createContext();

export const StudyModeProvider = ({ children }) => {
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [currentMusic, setCurrentMusic] = useState('lofi');
  const [musicVolume, setMusicVolume] = useState(0.5);
  
  // Current task being studied
  const [currentTask, setCurrentTask] = useState(null);
  
  // Focus Timer
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(25 * 60);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessionCount, setSessionCount] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  
  // Doubt counter
  const [doubtsAsked, setDoubtsAsked] = useState(0);
  
  // Study session tracking
  const [studyStartTime, setStudyStartTime] = useState(null);
  const [totalStudyTime, setTotalStudyTime] = useState(0);

  // ─── Restore session from localStorage on mount ───
  useEffect(() => {
    const saved = localStorage.getItem('studySession');
    console.log('🔄 Checking for saved session:', saved ? 'found' : 'none');
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.isStudyMode && data.currentTask) {
          const now = Date.now();
          const elapsed = Math.floor((now - data.savedAt) / 1000);
          
          if (elapsed < 7200) {
            console.log('✅ Restoring session, elapsed:', elapsed, 'seconds');
            
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
              if (newTimeLeft > 0) {
                setTimerActive(true);
                console.log('⏱️ Timer resumed at:', newTimeLeft);
              }
            } else {
              setTimeLeft(data.timeLeft);
              console.log('⏸ Timer was paused at:', data.timeLeft);
            }
          } else {
            console.log('⏰ Session too old, clearing');
            localStorage.removeItem('studySession');
          }
        }
      } catch (e) {
        console.error('Failed to restore study session:', e);
        localStorage.removeItem('studySession');
      }
    }
  }, []);

  // ─── Save session to localStorage when active ───
  useEffect(() => {
    if (isStudyMode && currentTask) {
      const data = {
        isStudyMode,
        currentTask,
        timerActive,
        timerDuration,
        timeLeft,
        sessionCount,
        isBreak,
        doubtsAsked,
        studyStartTime,
        savedAt: Date.now(),
      };
      localStorage.setItem('studySession', JSON.stringify(data));
    }
  }, [isStudyMode, currentTask, timerActive, timerDuration, timeLeft, sessionCount, isBreak, doubtsAsked, studyStartTime]);

  // ─── Timer countdown logic ───
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

  // ─── Enter study mode (idempotent) ───
  const enterStudyMode = (task = null) => {
    if (isStudyMode) {
      if (task) setCurrentTask(task);
      console.log("📚 Already in study mode, not resetting");
      return;
    }
    
    console.log("🎯 Starting fresh study session");
    setIsStudyMode(true);
    setCurrentTask(task);
    setStudyStartTime(Date.now());
    setDoubtsAsked(0);
  };

  // ─── Exit study mode ───
  const exitStudyMode = () => {
    console.log('🛑 Exiting study mode');
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

  // ─── Music controls ───
  const toggleMusic = () => setIsMusicPlaying((prev) => !prev);
  const changeMusic = (type) => setCurrentMusic(type);
  const changeVolume = (vol) => setMusicVolume(vol);


  // ─── Timer controls ───
  const startTimer = (minutes = 25, force = false) => {
    if (timerActive && !force) {
      console.log("⏱️ Timer already running, not restarting");
      return;
    }
    
    console.log(`⏱️ Starting timer for ${minutes} minutes`);
    const seconds = minutes * 60;
    setTimerDuration(seconds);
    setTimeLeft(seconds);
    setTimerActive(true);
    setIsBreak(false);
  };

  // ⭐ Set custom focus duration (without starting)
  const setFocusDuration = (minutes) => {
    const seconds = minutes * 60;
    setTimerDuration(seconds);
    setTimeLeft(seconds);
    setTimerActive(false);
    setIsBreak(false);
    console.log(`⏱️ Focus duration set to ${minutes} minutes`);
  };

  // ⭐ Set custom break duration (without starting)
  const setBreakDuration = (minutes) => {
    const seconds = minutes * 60;
    setTimerDuration(seconds);
    setTimeLeft(seconds);
    setTimerActive(false);
    setIsBreak(true);
    console.log(`☕ Break duration set to ${minutes} minutes`);
  };

  const pauseTimer = () => setTimerActive(false);
  const resumeTimer = () => setTimerActive(true);
  const toggleTimer = () => setTimerActive((prev) => !prev);
  
  const resetTimer = () => {
    setTimerActive(false);
    setTimeLeft(timerDuration);
  };

  // Skip to next session/break
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

  // Increment doubt counter
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

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── Context value (ALL functions defined above) ───
  const value = {
    // Study Mode
    isStudyMode,
    enterStudyMode,
    exitStudyMode,
    currentTask,
    setCurrentTask,
    
    // Music
    isMusicPlaying,
    currentMusic,
    musicVolume,
    toggleMusic,
    changeMusic,
    changeVolume,
    
    // Timer
    timerActive,
    timerDuration,
    timeLeft,
    sessionCount,
    isBreak,
    startTimer,
    pauseTimer,
    resumeTimer,
    toggleTimer,
    resetTimer,
    skipSession,
    formatTime,
    setFocusDuration,    // ⭐ NEW
    setBreakDuration,    // ⭐ NEW
    
    // Doubts
    doubtsAsked,
    incrementDoubts,
    
    // Stats
    totalStudyTime,
    studyStartTime,
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