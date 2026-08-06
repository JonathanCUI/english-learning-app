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

function enrichWords(words, grade, semester, unit) {
  const layout = findLayout(grade, semester, unit);
  if (!layout) return words;
  const columns = layout[3];
  const rows = layout[4];
  const src = layout[5];
  return words.map((word, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const positionX = columns === 1 ? 0 : (column / (columns - 1)) * 100;
    const positionY = rows === 1 ? 0 : (row / (rows - 1)) * 100;
    return Object.assign({}, word, {
      visualStyle: 'background-image:url(' + src + ');background-size:' + (columns * 100) + '% ' + (rows * 100) + '%;background-position:' + positionX + '% ' + positionY + '%;aspect-ratio:' + rows + '/' + columns + ';',
      visualLabel: /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)$/i.test(word.english) ? word.english.toUpperCase() : ''
    });
  });
}

module.exports = { layouts, enrichWords };
