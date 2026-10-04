// 三年级补充插图：每张图集按行从左到右排列，不包含英文标签。
(function (root) {
  const plans = [
    ['welcome', 4, 4, ['to', 'hi', 'be', 'are', 'goodbye', 'an', 'morning', 'Ms', 'stand', 'stand up', 'close', 'point', 'listen', 'write']],
    ['unit1', 3, 3, ['let us', 'happy', 'do', 'they', 'everyone', 'from', 'the', 'come', 'and'], 'unit1a'],
    ['unit1', 4, 3, ['oh', 'no', 'here', 'great', 'age', 'song', 'dear', 'know', 'everybody', 'with'], 'unit1b'],
    ['unit2', 4, 4, ['thing', 'pack', 'bag', 'ruler', 'eraser', 'in', 'guess', 'find', 'lost and found', 'kid', 'take care of', 'there', 'back', 'come back']],
    ['unit3', 4, 4, ['colourful', 'world', 'hooray', 'pink', 'orange', 'purple', 'rainbow', 'see', 'right', 'first', 'magical', 'today', 'paint']],
    ['unit4', 4, 4, ['count', 'how', 'rope', 'who', 'Chinese knot', 'beautiful', 'only', 'show', 'baby', 'cheep', 'around', 'all around', 'little', 'everywhere']],
    ['unit5', 4, 4, ['father', 'mother', 'grandfather', 'grandmother', 'people', 'story', 'cap', 'on', 'come on', 'daddy', 'mummy', 'where']],
    ['unit6', 4, 4, ['sweet', 'game', 'living room', 'bedroom', 'bathroom', 'kitchen', 'dining room', 'think', 'under', 'miaow', 'ball', 'their', 'share', 'cooking', 'sun', 'lucky']]
  ].map(([unit, columns, rows, words, assetUnit]) => ({ unit, columns, rows, words, name: 'g3-s1-' + (assetUnit || unit) + '-extra' }));
  if (typeof module !== 'undefined' && module.exports) module.exports = plans;
  else root.GRADE3_IMAGE_PLANS = plans;
})(typeof globalThis !== 'undefined' ? globalThis : this);
