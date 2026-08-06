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
  const layout = findLayout(grade, semester, unit);
  if (!layout) return words;
  const columns = layout[3];
  const rows = layout[4];
  const src = layout[5];
  return words.map((word, index) => {
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
