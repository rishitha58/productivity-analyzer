// 📅 Date & Time Helper Functions

// Format date as "Mon, Jan 15"
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

// Format date as "January 15, 2025"
export const formatFullDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Format time as "3:45 PM"
export const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// Format time as "15:45" (24-hour)
export const formatTime24 = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

// Format date & time together
export const formatDateTime = (date) => {
  if (!date) return '';
  return `${formatDate(date)} at ${formatTime(date)}`;
};

// Get relative time: "5 mins ago", "2 hours ago"
export const getRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(date);
};

// Get greeting based on time of day
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
};

// Get emoji for time of day
export const getTimeEmoji = () => {
  const hour = new Date().getHours();
  if (hour < 6) return '🌙';
  if (hour < 12) return '🌅';
  if (hour < 17) return '☀️';
  if (hour < 21) return '🌆';
  return '🌙';
};

// Get current day name
export const getDayName = (date = new Date()) => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
};

// Check if date is today
export const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

// Check if date is tomorrow
export const isTomorrow = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    d.getDate() === tomorrow.getDate() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getFullYear() === tomorrow.getFullYear()
  );
};

// Check if date is yesterday
export const isYesterday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  );
};

// Get smart date label: "Today", "Tomorrow", "Yesterday", or full date
export const getSmartDateLabel = (date) => {
  if (!date) return '';
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';
  return formatDate(date);
};

// Add days to a date
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Get start of day
export const startOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Get end of day
export const endOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Get start of week (Sunday)
export const startOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return startOfDay(d);
};

// Get all days of current week
export const getCurrentWeek = () => {
  const start = startOfWeek();
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

// Calculate duration between two times (in minutes)
export const getDurationInMinutes = (start, end) => {
  return Math.floor((new Date(end) - new Date(start)) / 60000);
};

// Convert minutes to "1h 30m" format
export const formatDuration = (minutes) => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// Convert HH:MM to total minutes
export const timeToMinutes = (time) => {
  const [hours, mins] = time.split(':').map(Number);
  return hours * 60 + mins;
};

// Convert total minutes back to HH:MM
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Calculate sleep duration in hours (handles overnight times)
export const calculateSleepHours = (bedtime, wakeupTime) => {
  const bed = timeToMinutes(bedtime);
  let wake = timeToMinutes(wakeupTime);

  // If wake time is before bed time (overnight), add 24 hours
  if (wake < bed) wake += 24 * 60;

  return Math.round(((wake - bed) / 60) * 10) / 10; // 1 decimal place
};

// Check if sleep duration is sufficient (min 5 hours as per requirement)
export const isSleepSufficient = (bedtime, wakeupTime, minHours = 5) => {
  return calculateSleepHours(bedtime, wakeupTime) >= minHours;
};

// Get current time as HH:MM
export const getCurrentTime = () => {
  const now = new Date();
  return formatTime24(now);
};

// Get current date as YYYY-MM-DD
export const getCurrentDateString = () => {
  return new Date().toISOString().split('T')[0];
};

// Compare two dates (ignore time)
export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

// Get days until a target date
export const getDaysUntil = (targetDate) => {
  const today = startOfDay();
  const target = startOfDay(new Date(targetDate));
  const diff = target - today;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};