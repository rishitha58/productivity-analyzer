// ─── Check if currently in DnD hours ───
export const isInDndHours = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.sleepSchedule) return false;

  const { sleepTime, wakeTime } = user.sleepSchedule;
  if (!sleepTime || !wakeTime) return false;

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();

  const [sh, sm] = sleepTime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);

  const sleepMins = sh * 60 + sm;
  const wakeMins = wh * 60 + wm;

  // Sleep crosses midnight (e.g., 22:00 → 06:00)
  if (sleepMins > wakeMins) {
    return currentMins >= sleepMins || currentMins < wakeMins;
  }
  return currentMins >= sleepMins && currentMins < wakeMins;
};

// ─── Get sleep schedule info ───
export const getSleepInfo = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.sleepSchedule || null;
};

// ─── Check if today is first login of day ───
export const isFirstLoginToday = () => {
  const today = new Date().toISOString().split("T")[0];
  const lastJournal = localStorage.getItem("lastJournalDate");
  return lastJournal !== today;
};