const adjectives = ['Hopeful', 'Quiet', 'Brave', 'Kind', 'Gentle', 'Strong', 'Wise', 'Calm', 'Bright', 'Caring', 'Resilient', 'Peaceful', 'Joyful', 'Thoughtful', 'Patient'];
const nouns = ['Sun', 'Moon', 'Star', 'Cloud', 'Rain', 'Tree', 'River', 'Mountain', 'Ocean', 'Breeze', 'Flower', 'Bird', 'Light', 'Shadow', 'Dream'];

const generateAnonymousName = () => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${number}`;
};

module.exports = { generateAnonymousName };