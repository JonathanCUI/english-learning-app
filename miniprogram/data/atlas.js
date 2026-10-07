const layouts = [
  ['grade1', '上学期', 'unit1', 4, 3, '/assets/vocab/g1-s1-u1.jpg'],
  ['grade1', '上学期', 'unit2', 4, 3, '/assets/vocab/g1-s1-u2.jpg'],
  ['grade1', '上学期', 'unit3', 4, 4, '/assets/vocab/g1-s1-u3.jpg'],
  ['grade1', '上学期', 'unit4', 5, 4, '/assets/vocab/g1-s1-u4.jpg'],
  ['grade1', '上学期', 'unit5', 4, 3, '/assets/vocab/g1-s1-u5.jpg'],
  ['grade1', '上学期', 'unit6', 4, 4, '/assets/vocab/g1-s1-u6.jpg'],
  ['grade1', '下学期', 'unit1', 4, 3, '/assets/vocab/g1-s2-u1.jpg'],
  ['grade1', '下学期', 'unit2', 4, 3, '/assets/vocab/g1-s2-u2.jpg'],
  ['grade1', '下学期', 'unit3', 5, 4, '/assets/vocab/g1-s2-u3.jpg'],
  ['grade1', '下学期', 'unit4', 6, 5, '/assets/vocab/g1-s2-u4.jpg'],
  ['grade1', '下学期', 'unit5', 4, 4, '/assets/vocab/g1-s2-u5.jpg'],
  ['grade1', '下学期', 'unit6', 4, 4, '/assets/vocab/g1-s2-u6.jpg'],
  ['grade2', '上学期', 'unit1', 4, 4, '/assets/vocab/g2-s1-u1.jpg'],
  ['grade2', '上学期', 'unit2', 4, 4, '/assets/vocab/g2-s1-u2.jpg'],
  ['grade2', '上学期', 'unit3', 4, 3, '/assets/vocab/g2-s1-u3.jpg'],
  ['grade2', '上学期', 'unit4', 4, 3, '/assets/vocab/g2-s1-u4.jpg'],
  ['grade2', '上学期', 'unit5', 4, 3, '/assets/vocab/g2-s1-u5.jpg'],
  ['grade2', '上学期', 'unit6', 4, 3, '/assets/vocab/g2-s1-u6.jpg'],
  ['grade2', '下学期', 'unit1', 4, 3, '/assets/vocab/g2-s2-u1.jpg'],
  ['grade2', '下学期', 'unit2', 4, 3, '/assets/vocab/g2-s2-u2.jpg'],
  ['grade2', '下学期', 'unit3', 4, 3, '/assets/vocab/g2-s2-u3.jpg'],
  ['grade2', '下学期', 'unit4', 4, 4, '/assets/vocab/g2-s2-u4.jpg'],
  ['grade2', '下学期', 'unit5', 4, 3, '/assets/vocab/g2-s2-u5.jpg'],
  ['grade2', '下学期', 'unit6', 4, 3, '/assets/vocab/g2-s2-u6.jpg']
];

function findLayout(grade, semester, unit) {
  return layouts.find((item) => item[0] === grade && item[1] === semester && item[2] === unit);
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function buildVisualStyles(columns, rows, column, row, maxWidth, maxHeight) {
  const cellRatio = rows / columns;
  const width = round(Math.min(maxWidth, maxHeight * cellRatio));
  const height = round(width / cellRatio);
  return {
    frame: 'width:' + width + 'rpx;height:' + height + 'rpx;',
    image: [
      'width:' + round(width * columns) + 'rpx',
      'height:' + round(height * rows) + 'rpx',
      'left:-' + round(width * column) + 'rpx',
      'top:-' + round(height * row) + 'rpx'
    ].join(';') + ';'
  };
}

function enrichWords(words, grade, semester, unit) {
  const corrections = require('./image-corrections.js');
  if (words.some((word) => corrections.words.includes(word.english) || (corrections.reuse || {})[word.english])) {
    return words.map((word) => {
      const reuse = (corrections.reuse || {})[word.english];
      if (reuse) {
        const source = require('./vocabulary.js')[reuse.grade][reuse.semester][reuse.unit];
        const original = enrichOriginalWords(source, reuse.grade, reuse.semester, reuse.unit, 0).find(entry => entry.english === reuse.english);
        return Object.assign({}, word, {
          visualSrc: original.visualSrc, visualFrameStyle: original.visualFrameStyle, visualImageStyle: original.visualImageStyle,
          miniVisualFrameStyle: original.miniVisualFrameStyle, miniVisualImageStyle: original.miniVisualImageStyle
        });
      }
      const index = corrections.words.indexOf(word.english);
      if (index < 0) return enrichOriginalWords([word], grade, semester, unit, words.indexOf(word))[0];
      const column = index % corrections.columns;
      const row = Math.floor(index / corrections.columns);
      const large = buildVisualStyles(corrections.columns, corrections.rows, column, row, 440, 520);
      const small = buildVisualStyles(corrections.columns, corrections.rows, column, row, 250, 300);
      return Object.assign({}, word, {
        visualSrc: '/assets/vocab/' + corrections.name + '.jpg',
        visualFrameStyle: large.frame, visualImageStyle: large.image,
        miniVisualFrameStyle: small.frame, miniVisualImageStyle: small.image
      });
    });
  }
  return enrichOriginalWords(words, grade, semester, unit, 0);
}

function enrichOriginalWords(words, grade, semester, unit, indexOffset) {
  const layout = findLayout(grade, semester, unit);
  if (!layout) {
    // 仅复用拼写与首个释义一致的旧词插图，避免 orange 等多义词误配。
    const vocabulary = require('./vocabulary.js');
    const meaning = (value) => String(value).split(/[，,；;（(]/)[0].trim();
    return words.map((word) => {
      const plan = grade === 'grade3' && semester === '上学期'
        ? require('./grade3-images.js').find((entry) => entry.unit === unit && entry.words.indexOf(word.english) >= 0) : null;
      const imageIndex = plan ? plan.words.indexOf(word.english) : -1;
      if (imageIndex >= 0) {
        const column = imageIndex % plan.columns;
        const row = Math.floor(imageIndex / plan.columns);
        const large = buildVisualStyles(plan.columns, plan.rows, column, row, 440, 520);
        const small = buildVisualStyles(plan.columns, plan.rows, column, row, 250, 300);
        return Object.assign({}, word, {
          visualSrc: '/assets/vocab/' + plan.name + '.jpg',
          visualFrameStyle: large.frame, visualImageStyle: large.image,
          miniVisualFrameStyle: small.frame, miniVisualImageStyle: small.image
        });
      }
      for (const candidate of layouts) {
        const source = vocabulary[candidate[0]][candidate[1]][candidate[2]];
        const index = source.findIndex((entry) => entry.english === word.english && meaning(entry.chinese) === meaning(word.chinese));
        if (index < 0) continue;
        const visual = enrichWords(source, candidate[0], candidate[1], candidate[2])[index];
        return Object.assign({}, word, {
          visualSrc: visual.visualSrc,
          visualFrameStyle: visual.visualFrameStyle,
          visualImageStyle: visual.visualImageStyle,
          miniVisualFrameStyle: visual.miniVisualFrameStyle,
          miniVisualImageStyle: visual.miniVisualImageStyle
        });
      }
      return Object.assign({}, word, { visualPlaceholder: true });
    });
  }
  const columns = layout[3];
  const rows = layout[4];
  const src = layout[5];
  return words.map((word, index) => {
    index += indexOffset;
    const column = index % columns;
    const row = Math.floor(index / columns);
    const learningVisual = buildVisualStyles(columns, rows, column, row, 440, 520);
    const miniVisual = buildVisualStyles(columns, rows, column, row, 250, 300);
    return Object.assign({}, word, {
      visualSrc: src,
      visualFrameStyle: learningVisual.frame,
      visualImageStyle: learningVisual.image,
      miniVisualFrameStyle: miniVisual.frame,
      miniVisualImageStyle: miniVisual.image
    });
  });
}

module.exports = { layouts, enrichWords };
