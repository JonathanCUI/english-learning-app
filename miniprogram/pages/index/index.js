const vocabulary = require('../../data/vocabulary.js');
const { enrichWords } = require('../../data/atlas.js');
const shopCatalog = require('../../data/shop.js');
const game = require('../../utils/game.js');
const speech = require('../../utils/speech.js');

const STORAGE = {
  coins: 'starlightCoins',
  purchased: 'purchasedShopItems',
  errors: 'englishErrorBook'
};

const GRADE_LABELS = { grade1: '一年级', grade2: '二年级' };
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

Page({
  data: {
    view: 'home',
    grades: [
      { value: 'grade1', label: '一年级', icon: '🌱' },
      { value: 'grade2', label: '二年级', icon: '🚀' }
    ],
    semesters: ['上学期', '下学期'],
    units: ['unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'unit6'],
    selectedGrade: 'grade1',
    selectedSemester: '上学期',
    selectedUnit: 'unit1',
    selectionLabel: '一年级 · 上学期 · Unit 1',
    currentWords: [],
    currentWord: {},
    currentWordIndex: 0,
    showDetails: false,
    coins: 0,
    purchasedItems: [],
    errorBook: {},
    errorEntries: [],
    errorCount: 0,
    quizQuestions: [],
    quizIndex: 0,
    quizScore: 0,
    quizPrompt: '',
    quizInstruction: '',
    quizOptions: [],
    answerLocked: false,
    answerStatus: '',
    spellingWords: [],
    spellingIndex: 0,
    spellingScore: 0,
    spellingOptions: [],
    errorPracticeWords: [],
    errorPracticeIndex: 0,
    errorPracticeScore: 0,
    completionTitle: '',
    completionScore: '',
    completionMessage: '',
    shopFilters: [
      { value: 'all', label: '全部' },
      { value: 'learning', label: '学习用品' },
      { value: 'fun', label: '趣味玩具' },
      { value: 'gear', label: '智能设备' },
      { value: 'collection', label: '收藏奖励' }
    ],
    shopCategory: 'all',
    shopItems: [],
    shopProgress: '已收藏 0 / 20'
  },

  onLoad() {
    const coins = Number(wx.getStorageSync(STORAGE.coins)) || 0;
    const purchasedItems = wx.getStorageSync(STORAGE.purchased) || [];
    const errorBook = wx.getStorageSync(STORAGE.errors) || {};
    this.setData({ coins, purchasedItems, errorBook });
    this.refreshWords();
    this.refreshErrorEntries();
    this.refreshShop('all');
  },

  onUnload() {
    speech.stop();
  },

  selectGrade(event) {
    const selectedGrade = event.currentTarget.dataset.value;
    this.setData({ selectedGrade }, () => this.refreshWords());
  },

  selectSemester(event) {
    const selectedSemester = event.currentTarget.dataset.value;
    this.setData({ selectedSemester }, () => this.refreshWords());
  },

  selectUnit(event) {
    const selectedUnit = event.currentTarget.dataset.value;
    this.setData({ selectedUnit }, () => this.refreshWords());
  },

  refreshWords() {
    const { selectedGrade, selectedSemester, selectedUnit } = this.data;
    const source = vocabulary[selectedGrade][selectedSemester][selectedUnit] || [];
    const currentWords = enrichWords(source, selectedGrade, selectedSemester, selectedUnit);
    const unitNumber = selectedUnit.replace('unit', '');
    this.setData({
      currentWords,
      selectionLabel: GRADE_LABELS[selectedGrade] + ' · ' + selectedSemester + ' · Unit ' + unitNumber
    });
  },

  goHome() {
    speech.stop();
    this.setData({ view: 'home', answerLocked: false, answerStatus: '' });
    this.refreshErrorEntries();
  },

  openLearning() {
    this.setData({ view: 'learning', currentWordIndex: 0, showDetails: false }, () => this.showLearningWord());
  },

  showLearningWord() {
    const currentWord = this.data.currentWords[this.data.currentWordIndex] || {};
    this.setData({ currentWord, showDetails: false });
  },

  previousWord() {
    const length = this.data.currentWords.length;
    const currentWordIndex = (this.data.currentWordIndex - 1 + length) % length;
    this.setData({ currentWordIndex }, () => this.showLearningWord());
  },

  nextWord() {
    const length = this.data.currentWords.length;
    const currentWordIndex = (this.data.currentWordIndex + 1) % length;
    this.setData({ currentWordIndex }, () => this.showLearningWord());
  },

  toggleDetails() {
    const showDetails = !this.data.showDetails;
    this.setData({ showDetails });
    if (showDetails) speech.speak(this.data.currentWord.chinese, 'zh_CN');
  },

  pronounceCurrent() {
    speech.speak(this.data.currentWord.english, 'en_US');
  },

  pronounceExample() {
    if (this.data.currentWord.example) speech.speak(this.data.currentWord.example, 'en_US');
  },

  startQuiz() {
    const quizQuestions = game.buildQuiz(this.data.currentWords, 10);
    this.setData({
      view: 'quiz',
      quizQuestions,
      quizIndex: 0,
      quizScore: 0,
      answerLocked: false,
      answerStatus: ''
    }, () => this.renderQuiz());
  },

  renderQuiz() {
    const question = this.data.quizQuestions[this.data.quizIndex];
    if (!question) {
      this.finishActivity('测验完成', this.data.quizScore, this.data.quizQuestions.length);
      return;
    }
    const quizPrompt = question.direction === 'en-zh' ? question.word.english : question.word.chinese;
    const quizInstruction = question.direction === 'en-zh' ? '请选择正确的中文意思' : '请选择正确的英文单词';
    const quizOptions = game.quizOptions(this.data.currentWords, question.word, question.direction, 4);
    this.setData({
      currentWord: question.word,
      quizPrompt,
      quizInstruction,
      quizOptions,
      answerLocked: false,
      answerStatus: ''
    });
  },

  async chooseQuizOption(event) {
    if (this.data.answerLocked) return;
    const selectedText = event.currentTarget.dataset.text;
    const question = this.data.quizQuestions[this.data.quizIndex];
    const answer = question.direction === 'en-zh' ? question.word.chinese : question.word.english;
    const correct = selectedText === answer;
    const quizOptions = this.data.quizOptions.map((option) => Object.assign({}, option, {
      state: option.text === answer ? 'correct' : (option.text === selectedText ? 'wrong' : '')
    }));
    const quizScore = this.data.quizScore + (correct ? 1 : 0);
    this.setData({
      answerLocked: true,
      quizOptions,
      quizScore,
      answerStatus: (correct ? '答对啦！ ' : '记住哦：') + question.word.english + ' · ' + question.word.chinese
    });
    if (correct) this.addCoins(5);
    else this.addError(question.word, '中英文测验');
    await speech.speakPair(question.word);
    await wait(450);
    this.setData({ quizIndex: this.data.quizIndex + 1 }, () => this.renderQuiz());
  },

  startSpelling() {
    const spellingWords = game.shuffle(this.data.currentWords).slice(0, Math.min(10, this.data.currentWords.length));
    this.setData({
      view: 'spelling',
      spellingWords,
      spellingIndex: 0,
      spellingScore: 0,
      answerLocked: false,
      answerStatus: ''
    }, () => this.renderSpelling());
  },

  renderSpelling() {
    const currentWord = this.data.spellingWords[this.data.spellingIndex];
    if (!currentWord) {
      this.finishActivity('拼写练习完成', this.data.spellingScore, this.data.spellingWords.length);
      return;
    }
    this.setData({
      currentWord,
      spellingOptions: game.spellingOptions(currentWord.english, 4),
      answerLocked: false,
      answerStatus: ''
    });
  },

  async chooseSpellingOption(event) {
    if (this.data.answerLocked) return;
    const selectedText = event.currentTarget.dataset.text;
    const word = this.data.currentWord;
    const correct = selectedText === word.english;
    const spellingOptions = this.data.spellingOptions.map((option) => Object.assign({}, option, {
      state: option.text === word.english ? 'correct' : (option.text === selectedText ? 'wrong' : '')
    }));
    const spellingScore = this.data.spellingScore + (correct ? 1 : 0);
    this.setData({
      answerLocked: true,
      spellingOptions,
      spellingScore,
      answerStatus: (correct ? '拼对啦！ ' : '正确拼写是：') + word.english + ' · ' + word.chinese
    });
    if (correct) this.addCoins(5);
    else this.addError(word, '拼写练习', selectedText);
    await speech.speakPair(word);
    await wait(450);
    this.setData({ spellingIndex: this.data.spellingIndex + 1 }, () => this.renderSpelling());
  },

  skipSpelling() {
    if (this.data.answerLocked) return;
    const word = this.data.currentWord;
    this.addError(word, '拼写练习', '跳过');
    this.setData({ spellingIndex: this.data.spellingIndex + 1 }, () => this.renderSpelling());
  },

  pronounceSpelling() {
    speech.speak(this.data.currentWord.english, 'en_US');
  },

  chooseSpellingLikeOption(event) {
    return this.data.view === 'spelling'
      ? this.chooseSpellingOption(event)
      : this.chooseErrorPracticeOption(event);
  },

  finishActivity(title, score, total) {
    const percentage = total ? Math.round((score / total) * 100) : 0;
    this.setData({
      view: 'complete',
      completionTitle: title,
      completionScore: score + ' / ' + total,
      completionMessage: percentage >= 80 ? '太棒了，继续保持！' : percentage >= 60 ? '进步很明显，再练一次吧！' : '每一次练习都在积累星光！',
      answerLocked: false,
      answerStatus: ''
    });
  },

  addCoins(amount) {
    const coins = this.data.coins + amount;
    this.setData({ coins });
    wx.setStorageSync(STORAGE.coins, coins);
  },

  errorKey(word) {
    return [this.data.selectedGrade, this.data.selectedSemester, this.data.selectedUnit, word.english].join('|');
  },

  addError(word, mode, wrongAnswer) {
    const errorBook = Object.assign({}, this.data.errorBook);
    const key = this.errorKey(word);
    const previous = errorBook[key] || {};
    errorBook[key] = {
      key,
      word,
      grade: this.data.selectedGrade,
      semester: this.data.selectedSemester,
      unit: this.data.selectedUnit,
      mode,
      wrongAnswer: wrongAnswer || '',
      count: (previous.count || 0) + 1
    };
    this.setData({ errorBook });
    wx.setStorageSync(STORAGE.errors, errorBook);
    this.refreshErrorEntries();
  },

  refreshErrorEntries() {
    const errorEntries = Object.keys(this.data.errorBook).map((key) => this.data.errorBook[key]);
    this.setData({ errorEntries, errorCount: errorEntries.length });
  },

  openErrorBook() {
    this.refreshErrorEntries();
    this.setData({ view: 'errors' });
  },

  clearAllErrors() {
    wx.showModal({
      title: '清空错题本？',
      content: '清空后不能恢复，确定要继续吗？',
      success: (result) => {
        if (!result.confirm) return;
        this.setData({ errorBook: {}, errorEntries: [], errorCount: 0 });
        wx.setStorageSync(STORAGE.errors, {});
      }
    });
  },

  startErrorPractice() {
    if (!this.data.errorEntries.length) return;
    const errorPracticeWords = game.shuffle(this.data.errorEntries);
    this.setData({
      view: 'errorPractice',
      errorPracticeWords,
      errorPracticeIndex: 0,
      errorPracticeScore: 0,
      answerLocked: false,
      answerStatus: ''
    }, () => this.renderErrorPractice());
  },

  renderErrorPractice() {
    const entry = this.data.errorPracticeWords[this.data.errorPracticeIndex];
    if (!entry) {
      this.finishActivity('错题复习完成', this.data.errorPracticeScore, this.data.errorPracticeWords.length);
      return;
    }
    this.setData({
      currentWord: entry.word,
      spellingOptions: game.spellingOptions(entry.word.english, 4),
      answerLocked: false,
      answerStatus: ''
    });
  },

  async chooseErrorPracticeOption(event) {
    if (this.data.answerLocked) return;
    const entry = this.data.errorPracticeWords[this.data.errorPracticeIndex];
    const selectedText = event.currentTarget.dataset.text;
    const correct = selectedText === entry.word.english;
    const spellingOptions = this.data.spellingOptions.map((option) => Object.assign({}, option, {
      state: option.text === entry.word.english ? 'correct' : (option.text === selectedText ? 'wrong' : '')
    }));
    const errorPracticeScore = this.data.errorPracticeScore + (correct ? 1 : 0);
    this.setData({
      answerLocked: true,
      spellingOptions,
      errorPracticeScore,
      answerStatus: (correct ? '已经记住啦！ ' : '再看一遍：') + entry.word.english + ' · ' + entry.word.chinese
    });
    if (correct) {
      const errorBook = Object.assign({}, this.data.errorBook);
      delete errorBook[entry.key];
      this.setData({ errorBook });
      wx.setStorageSync(STORAGE.errors, errorBook);
      this.addCoins(3);
    }
    await speech.speakPair(entry.word);
    await wait(450);
    this.setData({ errorPracticeIndex: this.data.errorPracticeIndex + 1 }, () => this.renderErrorPractice());
  },

  openShop() {
    this.refreshShop(this.data.shopCategory);
    this.setData({ view: 'shop' });
  },

  setShopCategory(event) {
    this.refreshShop(event.currentTarget.dataset.value);
  },

  refreshShop(category) {
    const shopCategory = category || 'all';
    const purchasedItems = this.data.purchasedItems;
    const shopItems = shopCatalog
      .filter((item) => shopCategory === 'all' || item.category === shopCategory)
      .map((item) => Object.assign({}, item, {
        purchased: purchasedItems.indexOf(item.name) >= 0,
        affordable: this.data.coins >= item.price
      }));
    this.setData({
      shopCategory,
      shopItems,
      shopProgress: '已收藏 ' + purchasedItems.length + ' / ' + shopCatalog.length
    });
  },

  purchaseShopItem(event) {
    const name = event.currentTarget.dataset.name;
    const item = shopCatalog.find((candidate) => candidate.name === name);
    if (!item || this.data.purchasedItems.indexOf(name) >= 0) return;
    if (this.data.coins < item.price) {
      wx.showToast({ title: '星光金币还不够哦', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '兑换 ' + item.name,
      content: '需要 ' + item.price + ' 枚星光金币，确定兑换吗？',
      success: (result) => {
        if (!result.confirm) return;
        const coins = this.data.coins - item.price;
        const purchasedItems = this.data.purchasedItems.concat(item.name);
        this.setData({ coins, purchasedItems });
        wx.setStorageSync(STORAGE.coins, coins);
        wx.setStorageSync(STORAGE.purchased, purchasedItems);
        this.refreshShop(this.data.shopCategory);
        wx.showToast({ title: '收藏成功', icon: 'success' });
      }
    });
  }
});
