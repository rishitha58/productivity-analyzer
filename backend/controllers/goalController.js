const Goal = require('../models/Goal');
const Task = require('../models/Task');
const axios = require('axios');

exports.createGoal = async (req, res) => {
  try {
    const { title, description, targetDate, category, dailyTimeRequired } = req.body;

    // Generate roadmap using Grok AI
    let roadmap = '';
    let phases = [];
    try {
      const grokResponse = await axios.post(
        'https://api.x.ai/v1/chat/completions',
        {
          model: 'grok-beta',
          messages: [
            {
              role: 'system',
              content: 'You are a goal planning expert. Generate a structured roadmap in JSON format.'
            },
            {
              role: 'user',
              content: `Create a detailed roadmap for this goal: "${title}"
              Target: ${targetDate}
              Category: ${category}
              Daily time available: ${dailyTimeRequired || 60} minutes
              
              Return JSON with phases array:
              {
                "roadmap": "Brief overview text",
                "phases": [{
                  "title": "Phase name",
                  "description": "What to achieve",
                  "startDate": "ISO date",
                  "endDate": "ISO date",
                  "milestones": [{
                    "title": "Milestone name",
                    "description": "Specific achievement",
                    "targetDate": "ISO date"
                  }]
                }]
              }`
            }
          ],
          max_tokens: 2000
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const content = grokResponse.data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        roadmap = parsed.roadmap;
        phases = parsed.phases || [];
      }
    } catch (e) {
      console.error('Goal AI generation failed:', e.message);
      roadmap = `Work towards: ${title}`;
      phases = [{ title: 'Getting Started', description: 'Initial phase', milestones: [] }];
    }

    const goal = await Goal.create({
      userId: req.user._id,
      title,
      description,
      targetDate,
      category,
      dailyTimeRequired,
      roadmap,
      phases,
      aiGenerated: true
    });

    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateGoalProgress = async (req, res) => {
  try {
    const { progress, phaseIndex, milestoneIndex } = req.body;
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    if (phaseIndex !== undefined && milestoneIndex !== undefined) {
      goal.phases[phaseIndex].milestones[milestoneIndex].completed = true;
      goal.phases[phaseIndex].milestones[milestoneIndex].completedAt = new Date();
    }

    goal.progress = progress;
    if (progress >= 100) goal.status = 'completed';
    await goal.save();

    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};