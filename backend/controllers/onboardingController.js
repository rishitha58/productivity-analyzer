// backend/controllers/onboardingController.js
const User = require('../models/User');
const Goal = require('../models/Goal');
const aiService = require('../services/aiService');
const notificationService = require('../services/notificationService');

// @desc Complete onboarding
exports.completeOnboarding = async (req, res, next) => {
  try {
    const {
      isStudent,
      studyField,
      hasLongTermGoal,
      longTermGoal,
      goalDuration,
      goalDurationUnit,
      sleepSchedule,
      foodPreferences,
    } = req.body;

    // Update user with onboarding data
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          isOnboarded: true,
          onboardingData: {
            isStudent,
            studyField,
            hasLongTermGoal,
            longTermGoal,
            goalDuration,
            goalDurationUnit,
          },
          sleepSchedule: sleepSchedule || {
            bedtime: '23:00',
            wakeTime: '07:00',
            minimumSleep: 7,
            alarmEnabled: true,
          },
          foodPreferences: foodPreferences || {},
        },
      },
      { new: true }
    ).select('-password');

    let createdGoal = null;

    // If user has long-term goal, generate roadmap
    if (hasLongTermGoal && longTermGoal) {
      const targetDate = new Date();
      const durationValue = parseInt(goalDuration);

      switch (goalDurationUnit) {
        case 'days':
          targetDate.setDate(targetDate.getDate() + durationValue);
          break;
        case 'weeks':
          targetDate.setDate(targetDate.getDate() + durationValue * 7);
          break;
        case 'months':
          targetDate.setMonth(targetDate.getMonth() + durationValue);
          break;
        case 'years':
          targetDate.setFullYear(targetDate.getFullYear() + durationValue);
          break;
        default:
          targetDate.setMonth(targetDate.getMonth() + durationValue);
      }

      // Generate AI roadmap for the goal
      const roadmap = await aiService.generateGoalRoadmap(
        longTermGoal,
        goalDuration,
        goalDurationUnit,
        isStudent,
        studyField
      );

      createdGoal = await Goal.create({
        userId: req.user._id,
        title: longTermGoal,
        description: `Goal set during onboarding: ${longTermGoal}`,
        category: isStudent ? 'education' : 'career',
        startDate: new Date(),
        targetDate,
        duration: {
          value: durationValue,
          unit: goalDurationUnit,
        },
        phases: roadmap.phases,
        isFromOnboarding: true,
        aiGeneratedRoadmap: true,
        dailyTimeCommitment: roadmap.dailyTimeCommitment,
      });
    }

    // Schedule sleep alarm notification
    if (sleepSchedule?.alarmEnabled && sleepSchedule?.wakeTime) {
      await notificationService.scheduleSleepAlarm(
        req.user._id,
        sleepSchedule.wakeTime
      );
    }

    // Schedule daily journal reminder
    await notificationService.scheduleJournalReminder(req.user._id);

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      user,
      goal: createdGoal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get onboarding status
exports.getOnboardingStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('isOnboarded onboardingData');
    res.json({ success: true, ...user.toObject() });
  } catch (error) {
    next(error);
  }
};