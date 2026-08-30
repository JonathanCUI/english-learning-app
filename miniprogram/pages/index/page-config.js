const vocabulary = require('../../data/vocabulary.js');
const { enrichWords } = require('../../data/atlas.js');
const shopCatalog = require('../../data/shop.js');
const game = require('../../utils/game.js');
const speech = require('../../utils/speech.js');

const STORAGE = {
  economy: 'starlightEconomyV1',
  coins: 'starlightCoins',
  purchased: 'purchasedShopItems',
  errors: 'englishErrorBook',
  pendingView: 'starlightPendingMainView',
  activityLaunch: 'starlightActivityLaunch'
};

const GRADE_LABELS = { grade1: '一年级', grade2: '二年级' };
const SEMESTERS = ['上学期', '下学期'];
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const ERROR_SESSION = 'starlightErrorPracticeSession';

function audioRoot(grade, semester, unit) {
  const gradeNumber = grade === 'grade2' ? '2' : '1';
  const semesterNumber = semester === '下学期' ? '2' : '1';
  const unitNumber = String(unit || 'unit1').replace('unit', '');
  return 'audio-g' + gradeNumber + 's' + semesterNumber + 'u' + unitNumber;
}

function currentRoute() {
  const pages = getCurrentPages();
  return pages.length ? pages[pages.length - 1].route : '';
}

function isAudioPage() {
  return currentRoute().indexOf('audio-g') === 0;
}

function activityUrl(activity, grade, semester, unit) {
  return '/' + audioRoot(grade, semester, unit) + '/pages/index/index?activity=' + encodeURIComponent(activity)
    + '&grade=' + encodeURIComponent(grade)
    + '&semester=' + encodeURIComponent(semester)
    + '&unit=' + encodeURIComponent(unit);
}

function decoded(value) {
  const text = String(value || '');
  try {
    return decodeURIComponent(text);
  } catch (error) {
    return text;
  }
}

function normalizedSelection(grade, semester, unit) {
  const cleanGrade = GRADE_LABELS[grade] ? grade : '';
  const cleanSemester = SEMESTERS.indexOf(decoded(semester)) >= 0 ? decoded(semester) : '';
  const cleanUnit = /^unit[1-6]$/.test(String(unit || '')) ? String(unit) : '';
  return { grade: cleanGrade, semester: cleanSemester, unit: cleanUnit };
}

function shareSelection(data) {
  return normalizedSelection(data.selectedGrade, data.selectedSemester, data.selectedUnit);
}

function shareQuery(data) {
  const selection = shareSelection(data);
  if (!selection.grade || !selection.semester || !selection.unit) return '';
  return '?grade=' + encodeURIComponent(selection.grade)
    + '&semester=' + encodeURIComponent(selection.semester)
    + '&unit=' + encodeURIComponent(selection.unit);
}

function shareTitle(data) {
  const selection = shareSelection(data);
  if (!selection.grade || !selection.semester || !selection.unit) return '星光英语小助手｜每天学会一个新单词';
  return '和我一起学英语｜' + GRADE_LABELS[selection.grade] + ' · ' + selection.semester + ' · ' + selection.unit.replace('unit', 'Unit ');
}

function normalizedCoins(value) {
  const coins = Number(value);
  return Number.isFinite(coins) && coins > 0 ? Math.floor(coins) : 0;
}

function normalizedPurchases(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((name, index) => (
    typeof name === 'string'
    && value.indexOf(name) === index
    && shopCatalog.some((item) => item.name === name)
  ));
}

function loadEconomy() {
  const saved = wx.getStorageSync(STORAGE.economy);
  if (saved && typeof saved === 'object') {
    return {
      coins: normalizedCoins(saved.coins),
      purchasedItems: normalizedPurchases(saved.purchasedItems)
    };
  }
  return {
    coins: normalizedCoins(wx.getStorageSync(STORAGE.coins)),
    purchasedItems: normalizedPurchases(wx.getStorageSync(STORAGE.purchased))
  };
}

function saveEconomy(coins, purchasedItems) {
  const economy = {
    coins: normalizedCoins(coins),
    purchasedItems: normalizedPurchases(purchasedItems)
  };
  wx.setStorageSync(STORAGE.economy, economy);
  wx.setStorageSync(STORAGE.coins, economy.coins);
  wx.setStorageSync(STORAGE.purchased, economy.purchasedItems);
  return economy;
}

function createPageConfig() {
  return {
  data: {
    view: 'home',
    grades: [
      { value: 'grade1', label: '一年级', icon: '🌱' },
      { value: 'grade2', label: '二年级', icon: '🚀' }
    ],
    semesters: SEMESTERS,
    units: ['unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'unit6'],
    selectedGrade: '',
    selectedSemester: '',
    selectedUnit: '',
    selectionLabel: '请先选择年级、学期和单元',
    currentWords: [],
    currentWord: {},
    currentWordIndex: 0,
    wordImageFailed: false,
    showDetails: false,
    coins: 0,
    purchasedItems: [],
    purchasePending: false,
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

  onLoad(options) {
    const storedLaunch = isAudioPage() ? (wx.getStorageSync(STORAGE.activityLaunch) || {}) : {};
    const launchOptions = Object.assign({}, options || {}, storedLaunch);
    if (isAudioPage()) wx.removeStorageSync(STORAGE.activityLaunch);
    const economy = loadEconomy();
    const coins = economy.coins;
    const purchasedItems = economy.purchasedItems;
    const errorBook = wx.getStorageSync(STORAGE.errors) || {};
    const selection = normalizedSelection(launchOptions.grade, launchOptions.semester, launchOptions.unit);
    const selectedGrade = selection.grade;
    const selectedSemester = selection.semester;
    const selectedUnit = selection.unit;
    this.setData({ coins, purchasedItems, errorBook, selectedGrade, selectedSemester, selectedUnit }, () => {
      this.refreshErrorEntries();
      this.refreshShop('all');
      this.refreshWords(() => {
        if (launchOptions.activity && !this.data.currentWords.length) {
          wx.showModal({
            title: '选择信息失效',
            content: '请返回首页，重新选择年级、学期和单元。',
            showCancel: false,
            confirmText: '返回选择',
            success: () => {
              if (isAudioPage()) wx.navigateBack({ delta: 1 });
            }
          });
          return;
        }
        if (launchOptions.activity === 'learning') this.beginLearning();
        else if (launchOptions.activity === 'quiz') this.beginQuiz();
        else if (launchOptions.activity === 'spelling') this.beginSpelling();
        else if (launchOptions.activity === 'errorPractice') this.restoreErrorPractice();
      });
    });
  },

  onShow() {
    const economy = loadEconomy();
    const errorBook = wx.getStorageSync(STORAGE.errors) || {};
    this.setData({
      coins: economy.coins,
      purchasedItems: economy.purchasedItems,
      errorBook
    }, () => {
      this.refreshErrorEntries();
      this.refreshShop(this.data.shopCategory);
      if (!isAudioPage() && wx.getStorageSync(STORAGE.pendingView) === 'shop') {
        wx.removeStorageSync(STORAGE.pendingView);
        this.setData({ view: 'shop' });
      }
    });
  },

  onUnload() {
    speech.stop();
  },

  onShareAppMessage() {
    return {
      title: shareTitle(this.data),
      path: '/pages/index/index' + shareQuery(this.data),
      imageUrl: '/assets/branding/avatar-144.png'
    };
  },

  onShareTimeline() {
    return {
      title: shareTitle(this.data),
      query: shareQuery(this.data).replace(/^\?/, ''),
      imageUrl: '/assets/branding/avatar-144.png'
    };
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

  refreshWords(afterRefresh) {
    const { selectedGrade, selectedSemester, selectedUnit } = this.data;
    const gradeWords = vocabulary[selectedGrade];
    const semesterWords = gradeWords && gradeWords[selectedSemester];
    const source = semesterWords && semesterWords[selectedUnit];
    if (!selectedGrade || !selectedSemester || !selectedUnit || !Array.isArray(source)) {
      const selection = normalizedSelection(selectedGrade, selectedSemester, selectedUnit);
      this.setData({
        selectedGrade: selection.grade,
        selectedSemester: selection.semester,
        selectedUnit: selection.unit,
        currentWords: [],
        selectionLabel: '请先选择年级、学期和单元'
      }, typeof afterRefresh === 'function' ? afterRefresh : undefined);
      speech.setScope('', '', '');
      return;
    }
    const currentWords = enrichWords(source, selectedGrade, selectedSemester, selectedUnit);
    const unitNumber = selectedUnit.replace('unit', '');
    this.setData({
      currentWords,
      selectionLabel: GRADE_LABELS[selectedGrade] + ' · ' + selectedSemester + ' · Unit ' + unitNumber
    }, typeof afterRefresh === 'function' ? afterRefresh : undefined);
    speech.setScope(selectedGrade, selectedSemester, selectedUnit);
  },

  goHome() {
    speech.stop();
    if (isAudioPage()) {
      wx.navigateBack({ delta: 1 });
      return;
    }
    this.setData({ view: 'home', answerLocked: false, answerStatus: '' });
    this.refreshErrorEntries();
  },

  enterAudioActivity(activity) {
    const { selectedGrade, selectedSemester, selectedUnit } = this.data;
    const gradeWords = vocabulary[selectedGrade];
    const semesterWords = gradeWords && gradeWords[selectedSemester];
    const source = semesterWords && semesterWords[selectedUnit];
    if (!Array.isArray(source) || !source.length) {
      wx.showModal({
        title: '还没选完哦',
        content: '请先选择年级、学期和单元，再开始学习。',
        showCancel: false,
        confirmText: '去选择'
      });
      return true;
    }
    if (currentRoute().indexOf(audioRoot(selectedGrade, selectedSemester, selectedUnit) + '/') === 0) return false;
    wx.setStorageSync(STORAGE.activityLaunch, {
      activity,
      grade: selectedGrade,
      semester: selectedSemester,
      unit: selectedUnit
    });
    wx.navigateTo({ url: activityUrl(activity, selectedGrade, selectedSemester, selectedUnit) });
    return true;
  },

  openLearning() {
    if (this.enterAudioActivity('learning')) return;
    this.beginLearning();
  },

  beginLearning() {
    this.setData({ view: 'learning', currentWordIndex: 0, showDetails: false }, () => this.showLearningWord());
  },

  showLearningWord() {
    const currentWord = this.data.currentWords[this.data.currentWordIndex] || {};
    this.setData({ currentWord, showDetails: false, wordImageFailed: false });
  },

  handleWordImageError(event) {
    const detail = event && event.detail ? event.detail : {};
    console.warn('单词图片加载失败', this.data.currentWord.visualSrc || '', detail.errMsg || '');
    this.setData({ wordImageFailed: true });
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
    if (showDetails) speech.speak(this.data.currentWord.chinese, 'zh_CN', 'meaning-zh');
  },

  pronounceCurrent() {
    speech.speak(this.data.currentWord.english, 'en_US', 'word-en');
  },

  pronounceExample() {
    if (this.data.currentWord.example) speech.speak(this.data.currentWord.example, 'en_US', 'example-en');
  },

  startQuiz() {
    if (this.enterAudioActivity('quiz')) return;
    this.beginQuiz();
  },

  beginQuiz() {
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
      answerStatus: '',
      wordImageFailed: false
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
      answerStatus: (correct ? '答对啦！+1 星光币 · ' : '记住哦：') + question.word.english + ' · ' + question.word.chinese
    });
    if (correct) this.addCoins(1);
    else this.addError(question.word, '中英文测验');
    await speech.speakPair(question.word);
    await wait(450);
    this.setData({ quizIndex: this.data.quizIndex + 1 }, () => this.renderQuiz());
  },

  startSpelling() {
    if (this.enterAudioActivity('spelling')) return;
    this.beginSpelling();
  },

  beginSpelling() {
    // Every word in the selected unit should be reviewed, including units with more than ten words.
    const spellingWords = game.shuffle(this.data.currentWords);
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
      answerStatus: '',
      wordImageFailed: false
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
      answerStatus: (correct ? '拼对啦！+1 星光币 · ' : '正确拼写是：') + word.english + ' · ' + word.chinese
    });
    if (correct) this.addCoins(1);
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
    speech.speak(this.data.currentWord.english, 'en_US', 'word-en');
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
    const reward = Math.max(0, Math.floor(Number(amount) || 0));
    if (!reward) return false;
    const economy = loadEconomy();
    try {
      const saved = saveEconomy(economy.coins + reward, economy.purchasedItems);
      this.setData({ coins: saved.coins, purchasedItems: saved.purchasedItems });
      return true;
    } catch (error) {
      console.error('星光币保存失败', error);
      wx.showToast({ title: '星光币保存失败，请重试', icon: 'none' });
      return false;
    }
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
    wx.setStorageSync(ERROR_SESSION, { entries: errorPracticeWords, index: 0, score: 0 });
    const first = errorPracticeWords[0];
    wx.setStorageSync(STORAGE.activityLaunch, {
      activity: 'errorPractice',
      grade: first.grade,
      semester: first.semester,
      unit: first.unit
    });
    wx.navigateTo({ url: activityUrl('errorPractice', first.grade, first.semester, first.unit) });
  },

  restoreErrorPractice() {
    const session = wx.getStorageSync(ERROR_SESSION) || {};
    const errorPracticeWords = Array.isArray(session.entries) ? session.entries : [];
    const errorPracticeIndex = Number(session.index) || 0;
    const errorPracticeScore = Number(session.score) || 0;
    this.setData({
      view: 'errorPractice',
      errorPracticeWords,
      errorPracticeIndex,
      errorPracticeScore,
      answerLocked: false,
      answerStatus: ''
    }, () => this.renderErrorPractice());
  },

  renderErrorPractice() {
    const entry = this.data.errorPracticeWords[this.data.errorPracticeIndex];
    if (!entry) {
      wx.removeStorageSync(ERROR_SESSION);
      this.finishActivity('错题复习完成', this.data.errorPracticeScore, this.data.errorPracticeWords.length);
      return;
    }
    if (entry.grade !== this.data.selectedGrade || entry.semester !== this.data.selectedSemester || entry.unit !== this.data.selectedUnit) {
      wx.setStorageSync(STORAGE.activityLaunch, {
        activity: 'errorPractice',
        grade: entry.grade,
        semester: entry.semester,
        unit: entry.unit
      });
      wx.redirectTo({ url: activityUrl('errorPractice', entry.grade, entry.semester, entry.unit) });
      return;
    }
    speech.setScope(entry.grade, entry.semester, entry.unit);
    this.setData({
      currentWord: entry.word,
      spellingOptions: game.spellingOptions(entry.word.english, 4),
      answerLocked: false,
      answerStatus: '',
      wordImageFailed: false
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
    const errorPracticeIndex = this.data.errorPracticeIndex + 1;
    wx.setStorageSync(ERROR_SESSION, {
      entries: this.data.errorPracticeWords,
      index: errorPracticeIndex,
      score: errorPracticeScore
    });
    this.setData({ errorPracticeIndex }, () => this.renderErrorPractice());
  },

  openShop() {
    if (isAudioPage()) {
      wx.setStorageSync(STORAGE.pendingView, 'shop');
      wx.navigateBack({ delta: 1 });
      return;
    }
    const economy = loadEconomy();
    this.setData({
      coins: economy.coins,
      purchasedItems: economy.purchasedItems,
      view: 'shop'
    }, () => this.refreshShop(this.data.shopCategory));
  },

  setShopCategory(event) {
    this.refreshShop(event.currentTarget.dataset.value);
  },

  refreshShop(category) {
    const shopCategory = category || 'all';
    const purchasedItems = normalizedPurchases(this.data.purchasedItems);
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
    if (!item || this.data.purchasePending) return;
    const economy = loadEconomy();
    if (economy.purchasedItems.indexOf(name) >= 0) {
      wx.showToast({ title: '已经收藏过啦', icon: 'none' });
      return;
    }
    if (economy.coins < item.price) {
      wx.showToast({ title: '星光金币还不够哦', icon: 'none' });
      return;
    }
    this.setData({ purchasePending: true });
    wx.showModal({
      title: '兑换 ' + item.name,
      content: '需要 ' + item.price + ' 枚星光金币，确定兑换吗？',
      success: (result) => {
        if (!result.confirm) return;
        const latest = loadEconomy();
        if (latest.purchasedItems.indexOf(name) >= 0) return;
        if (latest.coins < item.price) {
          wx.showToast({ title: '星光金币还不够哦', icon: 'none' });
          return;
        }
        try {
          const saved = saveEconomy(latest.coins - item.price, latest.purchasedItems.concat(name));
          this.setData({ coins: saved.coins, purchasedItems: saved.purchasedItems }, () => {
            this.refreshShop(this.data.shopCategory);
          });
          wx.showToast({ title: '收藏成功', icon: 'success' });
        } catch (error) {
          console.error('商品收藏保存失败', error);
          wx.showToast({ title: '收藏失败，请重试', icon: 'none' });
        }
      },
      complete: () => this.setData({ purchasePending: false })
    });
  }
  };
}

module.exports = createPageConfig;
