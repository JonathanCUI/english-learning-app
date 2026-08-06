function shuffle(list) {
  const result = list.slice();
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const value = result[index];
    result[index] = result[swapIndex];
    result[swapIndex] = value;
  }
  return result;
}

function unique(list) {
  return list.filter((value, index) => list.indexOf(value) === index);
}

function changeAt(word, index, replacement) {
  return word.slice(0, index) + replacement + word.slice(index + 1);
}

function spellingDistractors(answer, count) {
  const source = String(answer || '').trim();
  if (!source) return [];
  const lower = source.toLowerCase();
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const variants = [];

  for (let index = 0; index < lower.length - 1; index += 1) {
    if (lower[index] !== ' ' && lower[index + 1] !== ' ') {
      variants.push(lower.slice(0, index) + lower[index + 1] + lower[index] + lower.slice(index + 2));
    }
  }

  for (let index = 0; index < lower.length; index += 1) {
    const letter = lower[index];
    if (letter === ' ') continue;
    variants.push(lower.slice(0, index) + lower.slice(index + 1));
    variants.push(lower.slice(0, index) + letter + lower.slice(index));
    const replacement = letters[(letters.indexOf(letter) + 1 + Math.floor(Math.random() * 5)) % letters.length];
    variants.push(changeAt(lower, index, replacement));
  }

  if (lower.indexOf(' ') >= 0) {
    variants.push(lower.replace(' ', ''));
    variants.push(lower.replace(' ', '-'));
  }

  const vowels = { a: 'e', e: 'i', i: 'e', o: 'u', u: 'o' };
  Object.keys(vowels).forEach((vowel) => {
    const index = lower.indexOf(vowel);
    if (index >= 0) variants.push(changeAt(lower, index, vowels[vowel]));
  });

  const clean = shuffle(unique(variants).filter((value) => value && value !== lower));
  const fallbackLetters = ['e', 'a', 'i', 'o', 'u', 'n', 'r', 's'];
  let fallbackIndex = 0;
  while (clean.length < count) {
    const letter = fallbackLetters[fallbackIndex % fallbackLetters.length];
    const mode = fallbackIndex % 3;
    const middle = Math.floor(lower.length / 2);
    const candidate = mode === 0
      ? lower + letter
      : (mode === 1 ? letter + lower : lower.slice(0, middle) + letter + lower.slice(middle));
    if (candidate !== lower && clean.indexOf(candidate) < 0) clean.push(candidate);
    fallbackIndex += 1;
  }
  return clean.slice(0, count);
}

function spellingOptions(answer, count) {
  const total = count || 4;
  return shuffle([answer].concat(spellingDistractors(answer, total - 1))).map((text, index) => ({
    id: index + '-' + text,
    label: ['A', 'B', 'C', 'D'][index] || String(index + 1),
    text,
    state: ''
  }));
}

function quizOptions(words, target, direction, count) {
  const answer = direction === 'en-zh' ? target.chinese : target.english;
  const pool = shuffle(words.filter((word) => word.english !== target.english));
  const values = [answer];
  pool.forEach((word) => {
    const candidate = direction === 'en-zh' ? word.chinese : word.english;
    if (values.indexOf(candidate) < 0 && values.length < (count || 4)) values.push(candidate);
  });
  return shuffle(values).map((text, index) => ({
    id: index + '-' + text,
    label: ['A', 'B', 'C', 'D'][index] || String(index + 1),
    text,
    state: ''
  }));
}

function buildQuiz(words, maximum) {
  return shuffle(words).slice(0, Math.min(maximum || 10, words.length)).map((word, index) => ({
    id: index + '-' + word.english,
    word,
    direction: Math.random() > 0.5 ? 'en-zh' : 'zh-en'
  }));
}

module.exports = {
  shuffle,
  spellingDistractors,
  spellingOptions,
  quizOptions,
  buildQuiz
};
