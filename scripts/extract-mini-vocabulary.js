const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'Final_English_Learning_App.html');
const outputPath = path.join(root, 'miniprogram', 'data', 'vocabulary.js');
const html = fs.readFileSync(sourcePath, 'utf8');
const match = html.match(/const VOCABULARY = ([\s\S]*?);\s*\n\s*function getCurrentWords/);

if (!match) {
  throw new Error('无法从 Final_English_Learning_App.html 提取 VOCABULARY');
}

const vocabulary = Function('"use strict"; return (' + match[1] + ');')();
const semesters = ['上学期', '下学期'];
let wordCount = 0;

['grade1', 'grade2'].forEach((grade) => {
  semesters.forEach((semester) => {
    for (let unit = 1; unit <= 6; unit += 1) {
      const words = vocabulary[grade] && vocabulary[grade][semester] && vocabulary[grade][semester]['unit' + unit];
      if (!Array.isArray(words) || words.length === 0) {
        throw new Error(grade + ' / ' + semester + ' / unit' + unit + ' 缺少词汇数据');
      }
      wordCount += words.length;
    }
  });
});

const output = [
  '// 此文件由 scripts/extract-mini-vocabulary.js 从网页版自动生成，请勿手工修改。',
  'module.exports = ' + JSON.stringify(vocabulary, null, 2) + ';',
  ''
].join('\n');

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, output, 'utf8');
console.log('已生成小程序词库：' + wordCount + ' 个单词');
