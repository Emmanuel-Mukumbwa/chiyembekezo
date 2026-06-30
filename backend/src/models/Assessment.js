// backend/src/models/Assessment.js

const assessmentConfig = {
  // ----- Depression (PHQ-9) -----
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
    ],
    // Options: 0-3, no reverse scoring
    maxAnswerValue: 3,
    reverseIndices: []
  },

  // ----- Anxiety (GAD-7) -----
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
    ],
    maxAnswerValue: 3,
    reverseIndices: []
  },

  // ----- Stress (PSS-10) -----
  stress: {
    name: 'PSS-10 (Perceived Stress Scale)',
    maxScore: 40,
    levels: [
      { min: 0, max: 13, label: 'Low', description: 'Your stress level is manageable. Keep up healthy habits.' },
      { min: 14, max: 26, label: 'Moderate', description: 'You may benefit from stress-reduction techniques.' },
      { min: 27, max: 40, label: 'High', description: 'We strongly recommend seeking support to manage stress.' }
    ],
    questions: [
      'In the last month, how often have you been upset because of something that happened unexpectedly?',
      'In the last month, how often have you felt that you were unable to control the important things in your life?',
      'In the last month, how often have you felt nervous and stressed?',
      'In the last month, how often have you felt confident about your ability to handle personal problems?',
      'In the last month, how often have you felt that things were going your way?',
      'In the last month, how often have you felt that you could not cope with all the things you had to do?',
      'In the last month, how often have you been able to control irritations in your life?',
      'In the last month, how often have you felt that you were on top of things?',
      'In the last month, how often have you been angered because of things that were outside of your control?',
      'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?'
    ],
    // Options: 0-4 (Never to Very Often)
    maxAnswerValue: 4,
    // Reverse-scored items: questions 4,5,7,8 (0-indexed: 3,4,6,7)
    reverseIndices: [3, 4, 6, 7]
  },

  // ----- Burnout (CBI - Copenhagen Burnout Inventory) -----
  cbi: {
    name: 'Copenhagen Burnout Inventory (Personal Burnout)',
    maxScore: 24,
    levels: [
      { min: 0, max: 8, label: 'Low', description: 'You show low signs of personal burnout. Keep up healthy habits.' },
      { min: 9, max: 16, label: 'Moderate', description: 'You may be experiencing some burnout symptoms. Consider stress management.' },
      { min: 17, max: 24, label: 'High', description: 'You are at high risk of burnout. We strongly recommend professional support.' }
    ],
    questions: [
      'How often do you feel tired?',
      'How often are you physically exhausted?',
      'How often are you emotionally exhausted?',
      'How often do you think: "I can’t take it anymore"?',
      'How often do you feel worn out?',
      'How often do you feel weak and susceptible to illness?'
    ],
    maxAnswerValue: 4,  // 0-4 (Never to Always)
    reverseIndices: []  // no reverse scoring
  },

  // ----- Sleep (ISI - Insomnia Severity Index) -----
  isi: {
    name: 'Insomnia Severity Index',
    maxScore: 28,
    levels: [
      { min: 0, max: 7, label: 'No clinically significant insomnia', description: 'Your sleep is healthy.' },
      { min: 8, max: 14, label: 'Subthreshold insomnia', description: 'You may benefit from sleep hygiene tips.' },
      { min: 15, max: 21, label: 'Moderate insomnia', description: 'Consider talking to a professional about your sleep.' },
      { min: 22, max: 28, label: 'Severe insomnia', description: 'We strongly recommend you seek professional help for your sleep.' }
    ],
    questions: [
      'Difficulty falling asleep',
      'Difficulty staying asleep',
      'Problems waking up too early',
      'How satisfied/dissatisfied are you with your current sleep pattern?',
      'How much does your sleep interfere with your daily functioning?',
      'How noticeable is your sleep problem to others?',
      'How worried/distressed are you about your current sleep problem?'
    ],
    maxAnswerValue: 4,  // 0-4 (None to Very Severe)
    reverseIndices: []  // no reverse scoring
  }
};

// ---------- Helper functions ----------

function getAssessment(type) {
  return assessmentConfig[type];
}

function getScore(type, answers) {
  const config = getAssessment(type);
  if (!config) return 0;

  const maxVal = config.maxAnswerValue;

  // Apply reverse scoring where needed
  const transformed = answers.map((val, idx) => {
    if (config.reverseIndices.includes(idx)) {
      return maxVal - val;
    }
    return val;
  });

  // Sum all transformed answers
  return transformed.reduce((sum, val) => sum + val, 0);
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
  // fallback to the last level
  return levels[levels.length - 1];
}

function getRecommendations(type, levelLabel) {
  const base = ['Practice daily journaling', 'Try breathing exercises', 'Talk to someone you trust'];
  const highRisk = ['Moderate', 'Moderately Severe', 'Severe', 'High', 'Moderate insomnia', 'Severe insomnia'];
  if (highRisk.includes(levelLabel)) {
    return [...base, 'Speak with a counselor', 'Take a self-care break'];
  }
  if (levelLabel === 'Mild' || levelLabel === 'Fair' || levelLabel === 'Subthreshold insomnia') {
    return [...base, 'Read our articles on stress management'];
  }
  return base;
}

module.exports = {
  getAssessment,
  getScore,
  getLevel,
  getRecommendations
};