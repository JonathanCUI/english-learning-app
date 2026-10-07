// Spoken aliases only: never change the word shown to learners or audio lookup keys.
(function (root) {
  function englishSpeechText(text) {
    return String(text || '').replace(/\b(Mrs|Mr|Ms)\b\.?/g, function (_, title) {
      return { Ms: 'miz', Mr: 'mister', Mrs: 'missus' }[title];
    });
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = englishSpeechText;
  else root.englishSpeechText = englishSpeechText;
})(typeof globalThis !== 'undefined' ? globalThis : this);
