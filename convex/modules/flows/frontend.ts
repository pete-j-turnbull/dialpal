import { type Token } from "@packages/video-templates";

export const estimateWordDuration = (word: string): number => {
  // Clean the word - remove punctuation and convert to lowercase
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, "");

  // Handle empty or very short words
  if (cleanWord.length === 0) return 100;
  if (cleanWord.length === 1) return 200;

  // Count syllables using a heuristic approach
  const countSyllables = (word: string): number => {
    // Remove silent 'e' at the end
    const syllableWord = word.replace(/e$/, "");

    // Count vowel groups (consecutive vowels count as one syllable)
    const vowelGroups = syllableWord.match(/[aeiouy]+/g);
    let syllableCount = vowelGroups ? vowelGroups.length : 0;

    // Handle special cases
    if (syllableCount === 0) syllableCount = 1; // Every word has at least one syllable

    // Adjust for common patterns
    if (word.endsWith("le") && word.length > 2) {
      const beforeLe = word[word.length - 3];
      if (beforeLe && !"aeiou".includes(beforeLe)) {
        syllableCount += 1; // Words like "table", "simple"
      }
    }

    // Handle 'ed' endings
    if (word.endsWith("ed")) {
      const beforeEd = word[word.length - 3];
      if (beforeEd && "td".includes(beforeEd)) {
        syllableCount += 1; // Words like "wanted", "landed"
      }
    }

    return Math.max(1, syllableCount);
  };

  const syllables = countSyllables(cleanWord);

  // Base duration per syllable (average speaking rate is ~4-5 syllables per second)
  const baseDurationPerSyllable = 220; // seconds (approximately 4.5 syllables/second)

  // Adjust for word complexity and length
  let durationMultiplier = 1;

  // Longer words tend to be spoken slightly slower
  if (cleanWord.length > 8) {
    durationMultiplier += 0.1;
  } else if (cleanWord.length > 12) {
    durationMultiplier += 0.2;
  }

  // Words with many consonant clusters are harder to pronounce
  const consonantClusters = cleanWord.match(/[bcdfghjklmnpqrstvwxz]{2,}/g);
  if (consonantClusters && consonantClusters.length > 0) {
    durationMultiplier += consonantClusters.length * 0.05;
  }

  // Very short common words are spoken faster
  if (
    cleanWord.length <= 3 &&
    [
      "a",
      "an",
      "the",
      "and",
      "or",
      "but",
      "is",
      "it",
      "to",
      "of",
      "in",
      "on",
      "at",
      "by",
      "for",
    ].includes(cleanWord)
  ) {
    durationMultiplier = 0.7;
  }

  // Calculate final duration
  const duration = syllables * baseDurationPerSyllable * durationMultiplier;

  // Add small pause for punctuation
  if (word.match(/[.!?]$/)) {
    return duration + 300; // Longer pause for sentence endings
  } else if (word.match(/[,;:]$/)) {
    return duration + 150; // Shorter pause for commas/semicolons
  }

  return Math.max(100, Math.round(duration)); // Minimum duration of 0.1 seconds
};

export const tokenizeScript = (script: string): Token[] => {
  const words = script.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) return [];

  // Create tokens with duration
  const _tokens = words.map((word, index) => ({
    id: `t${index}`,
    index,
    value: word,
    duration: estimateWordDuration(word),
  }));

  // Convert duration to start/end times
  let cumulativeTime = 0;
  const tokens = _tokens.map(({ duration, ...tokenWithoutDuration }) => {
    const start = cumulativeTime;
    const end = start + duration;
    cumulativeTime = end;

    return {
      ...tokenWithoutDuration,
      start,
      end,
    };
  });

  return tokens;
};

const hashText = (text: string): string => {
  let hash = 0;
  if (text.length === 0) return hash.toString();
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
};

export const hashObject = (obj: Record<string, unknown>): string => {
  const keys = Object.keys(obj);
  const sortedKeys = keys.sort();
  const sortedObj = sortedKeys.reduce((acc, key) => {
    acc[key] = obj[key];
    return acc;
  }, {} as Record<string, unknown>);
  const json = JSON.stringify(sortedObj);
  return hashText(json);
};
