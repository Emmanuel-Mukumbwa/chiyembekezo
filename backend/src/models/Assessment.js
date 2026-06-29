// backend/src/models/Assessment.js

const assessmentConfig = {
  phq9: {
    name: 'PHQ-9',
    maxScore: 27,
    levels: [
      { min: 0, max: 4, label: 'Minimal', description: 'You are doing well. Keep up your healthy habits.' },
      { min: 5, max: 9, label: 'Mild', description: 'You may benefit from some self-care and monitoring.' },
      { min: 10, max: 14, label: 'Moderate', description: 'Consider speaking with a counselor or trying mood tracking.' },
      { min: 15, max: 19, label: 'Moderately Severe', description: 'We strongly recommend you seek professional support.' },
      { min: 20, max: 27, label: 'Severe', description: 'Please reach out to a mental health professional immediately.' }
    ],
    questions: [
      'Little interest or pleasure in doing things?',
      'Feeling down, depressed, or hopeless?',
      'Trouble falling/staying asleep, or sleeping too much?',
      'Feeling tired or having little energy?',
      'Poor appetite or overeating?',
      'Feeling bad about yourself—or that you are a failure?',
      'Trouble concentrating on things?',
      'Moving or speaking so slowly that others could notice? Or the opposite?',
      'Thoughts that you would be better off dead, or of hurting yourself?'
    ]
  },
  gad7: {
    name: 'GAD-7',
    maxScore: 21,
    levels: [
      { min: 0, max: 4, label: 'Minimal', description: 'Good. Keep managing stress with healthy habits.' },
      { min: 5, max: 9, label: 'Mild', description: 'You may want to try relaxation techniques.' },
      { min: 10, max: 14, label: 'Moderate', description: 'Consider speaking with a counselor.' },
      { min: 15, max: 21, label: 'Severe', description: 'We strongly recommend professional support.' }
    ],
    questions: [
      'Feeling nervous, anxious, or on edge?',
      'Not being able to stop or control worrying?',
      'Worrying too much about different things?',
      'Trouble relaxing?',
      'Being so restless that it is hard to sit still?',
      'Becoming easily annoyed or irritable?',
      'Feeling afraid as if something awful might happen?'
    ]
  }
  // add more assessments later
};

function getAssessment(type) {
  return assessmentConfig[type];
}

function computeScore(answers) {
  return answers.reduce((sum, val) => sum + val, 0);
}

function getLevel(type, score) {
  const config = getAssessment(type);
  if (!config) return null;
  const levels = config.levels;
  for (let level of levels) {
    if (score >= level.min && score <= level.max) {
      return level;
    }
  }
  return levels[levels.length - 1]; // fallback
}

function getRecommendations(type, levelLabel) {
  // simple rule-based recommendations
  const base = ['Practice daily journaling', 'Try breathing exercises', 'Talk to someone you trust'];
  if (levelLabel === 'Moderate' || levelLabel === 'Moderately Severe' || levelLabel === 'Severe') {
    return [...base, 'Speak with a counselor', 'Take a self-care break'];
  }
  if (levelLabel === 'Mild') {
    return [...base, 'Read our articles on stress management'];
  }
  return base;
}

module.exports = {
  getAssessment,
  computeScore,
  getLevel,
  getRecommendations
};