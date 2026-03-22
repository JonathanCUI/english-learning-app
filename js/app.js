// Main application controller
class EnglishLearningApp {
    constructor() {
        this.vocabManager = new VocabularyManager();
        this.quizManager = new QuizManager(this.vocabManager);
        this.speechManager = new SpeechManager();
        this.currentMode = null; // 'learn' or 'quiz'
        this.currentWordIndex = 0;
        this.showingChinese = false;
        this.showingPhonetic = false;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showSelectionScreen();
        console.log('English Learning App initialized');
    }

    setupEventListeners() {
        // Grade selection
        document.querySelectorAll('.btn-grade1, .btn-grade2').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectGrade(e.target.textContent.includes('1年级') ? 'grade1' : 'grade2');
            });
        });

        // Semester selection
        document.querySelectorAll('.btn-semester1, .btn-semester2').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectSemester(e.target.textContent.includes('上') ? '上学期' : '下学期');
            });
        });

        // Unit selection - handle all 6 units
        document.querySelectorAll('.btn-unit1, .btn-unit2, .btn-unit3, .btn-unit4, .btn-unit5, .btn-unit6').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const unitText = e.target.textContent;
                let unit = 'unit1';
                if (unitText.includes('2')) unit = 'unit2';
                else if (unitText.includes('3')) unit = 'unit3';
                else if (unitText.includes('4')) unit = 'unit4';
                else if (unitText.includes('5')) unit = 'unit5';
                else if (unitText.includes('6')) unit = 'unit6';
                this.selectUnit(unit);
            });
        });

        // Mode selection
        document.querySelectorAll('.btn-learn, .btn-quiz').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.textContent.includes('学习') ? 'learn' : 'quiz';
                this.selectMode(mode);
            });
        });
    }

    selectGrade(grade) {
        this.vocabManager.setCurrentGrade(grade);
        document.querySelectorAll('.btn-grade1, .btn-grade2').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
        this.enableSemesterButtons();
    }

    selectSemester(semester) {
        this.vocabManager.setCurrentSemester(semester);
        document.querySelectorAll('.btn-semester1, .btn-semester2').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
        this.enableUnitButtons();
        console.log('Selected semester:', semester, 'Grade:', this.vocabManager.currentGrade);
        const testWords = this.vocabManager.getCurrentWords();
        console.log('Words in current selection:', testWords.length);
    }

    selectUnit(unit) {
        this.vocabManager.setCurrentUnit(unit);
        document.querySelectorAll('.btn-unit1, .btn-unit2, .btn-unit3, .btn-unit4, .btn-unit5, .btn-unit6').forEach(btn => {
            btn.classList.remove('selected');
        });
        event.target.classList.add('selected');
    }

    selectMode(mode) {
        const grade = this.vocabManager.currentGrade;
        const semester = this.vocabManager.currentSemester;
        const unit = this.vocabManager.currentUnit;

        if (!grade || !semester || !unit) {
            alert('请先选择年级、学期和单元！');
            return;
        }

        this.currentMode = mode;
        this.hideSelectionScreen();

        if (mode === 'learn') {
            this.startLearning();
        } else {
            this.startQuiz();
        }
    }

    startLearning() {
        const words = this.vocabManager.getCurrentWords();
        if (words.length === 0) {
            alert('当前单元没有单词！');
            return;
        }

        this.currentWordIndex = 0;
        this.showingChinese = false;
        this.displayWord();
        this.showLearningInterface();
    }

    displayWord() {
        const words = this.vocabManager.getCurrentWords();
        if (this.currentWordIndex >= words.length) {
            this.currentWordIndex = 0; // Loop back to start
        }

        const word = words[this.currentWordIndex];
        const flashcard = document.getElementById('flashcard');

        // Hide phonetic and emoji initially
        flashcard.innerHTML = `
            <div class="word-emoji hidden" id="word-emoji">${word.emoji}</div>
            <div class="word-text">${word.english}</div>
            <div class="pronunciation hidden" id="pronunciation">/${word.pronunciation}/</div>
            <div class="word-chinese hidden" id="chinese-meaning">${word.chinese}</div>
        `;

        // Reset visibility states
        this.showingChinese = false;
        this.showingPhonetic = false;

        // Setup pronunciation button - now reveals info AND speaks
        document.getElementById('pronounce-btn').onclick = () => {
            this.togglePronunciationAndVisuals(word);
        };

        // Setup next button
        document.getElementById('next-btn').onclick = () => {
            this.nextWord();
        };

        // Setup previous button
        document.getElementById('prev-btn').onclick = () => {
            this.prevWord();
        };

        // Setup show/hide Chinese button
        document.getElementById('toggle-chinese-btn').onclick = () => {
            this.toggleChinese();
        };

        // Update progress
        this.updateLearningProgress();
    }

    togglePronunciationAndVisuals(word) {
        // Reveal phonetic and emoji if not shown
        if (!this.showingPhonetic) {
            document.getElementById('pronunciation').classList.remove('hidden');
            document.getElementById('word-emoji').classList.remove('hidden');
            document.getElementById('pronounce-btn').textContent = '🔊 再次发音';
            this.showingPhonetic = true;
        }

        // Speak the word
        this.speechManager.speak(word.english);
    }

    toggleChinese() {
        const chineseElement = document.getElementById('chinese-meaning');
        if (!chineseElement) {
            console.error('Chinese meaning element not found!');
            return;
        }

        this.showingChinese = !this.showingChinese;

        if (this.showingChinese) {
            chineseElement.classList.remove('hidden');
            document.getElementById('toggle-chinese-btn').textContent = '隐藏中文';
        } else {
            chineseElement.classList.add('hidden');
            document.getElementById('toggle-chinese-btn').textContent = '显示中文';
        }
        console.log('Toggle Chinese:', this.showingChinese);
    }

    nextWord() {
        this.currentWordIndex++;
        // Reset Chinese visibility when changing words
        this.showingChinese = false;
        this.displayWord();
    }

    prevWord() {
        this.currentWordIndex = Math.max(0, this.currentWordIndex - 1);
        // Reset Chinese visibility when changing words
        this.showingChinese = false;
        this.displayWord();
    }

    updateLearningProgress() {
        const words = this.vocabManager.getCurrentWords();
        const progress = ((this.currentWordIndex + 1) / words.length) * 100;
        document.getElementById('learning-progress').style.width = progress + '%';
        document.getElementById('learning-progress').textContent = `${Math.round(progress)}%`;
    }

    startQuiz() {
        const quizType = Math.random() > 0.5 ? 'chinese-to-english' : 'mixed';
        if (!this.quizManager.generateQuiz(quizType)) {
            return;
        }

        this.showQuizInterface();
        this.displayQuizQuestion();
    }

    displayQuizQuestion() {
        const question = this.quizManager.getCurrentQuestion();
        if (!question) {
            this.finishQuiz();
            return;
        }

        const quizType = this.quizManager.quizType;
        let questionText = '';
        let options = [];

        switch(quizType) {
            case 'chinese-to-english':
                questionText = `What's the English word for "${question.chinese}"?`;
                options = this.quizManager.generateOptions(question);
                break;
            case 'mixed':
            default:
                const random = Math.random();
                if (random > 0.5) {
                    questionText = `What's the English word for "${question.chinese}"?`;
                    options = this.quizManager.generateOptions(question);
                } else {
                    questionText = `What's the Chinese meaning of "${question.english}"?`;
                    options = this.quizManager.generateOptions(question);
                }
                break;
        }

        document.getElementById('quiz-question-text').textContent = questionText;
        document.getElementById('quiz-emoji').textContent = question.emoji;

        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';

        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'quiz-option';
            button.textContent = quizType === 'english-to-chinese' ? option.chinese : option.english;
            button.onclick = () => this.checkQuizAnswer(option, button);
            optionsContainer.appendChild(button);
        });

        // Update progress
        this.updateQuizProgress();
    }

    checkQuizAnswer(selectedOption, buttonElement) {
        const currentQuestion = this.quizManager.getCurrentQuestion();
        const isCorrect = this.quizManager.checkAnswer(selectedOption);

        // Disable all buttons during feedback
        document.querySelectorAll('.quiz-option').forEach(btn => {
            btn.disabled = true;
        });

        if (isCorrect) {
            buttonElement.classList.add('correct');
            this.createCelebration();
        } else {
            buttonElement.classList.add('incorrect');
            // Find and highlight correct answer
            const options = document.querySelectorAll('.quiz-option');
            options.forEach(btn => {
                const btnText = btn.textContent.toLowerCase().trim();
                const correctAnswer = currentQuestion.english.toLowerCase();
                if (btnText === correctAnswer) {
                    btn.classList.add('correct');
                    btn.textContent = '✅ ' + btn.textContent;
                }
            });
        }

        // Update score display
        this.updateScoreDisplay();

        // Wait then proceed to next question or finish
        setTimeout(() => {
            document.querySelectorAll('.quiz-option').forEach(btn => {
                btn.disabled = false;
            });

            if (this.quizManager.nextQuestion()) {
                this.displayQuizQuestion();
            } else {
                this.finishQuiz();
            }
        }, 2000);
    }

    updateScoreDisplay() {
        const score = this.quizManager.getScore();
        const scoreDisplay = document.getElementById('score-display');
        if (scoreDisplay) {
            scoreDisplay.textContent = `得分: ${score.correct}`;
        }
    }

    finishQuiz() {
        const score = this.quizManager.getScore();
        const percentage = score.percentage;

        let message = `测验完成！你答对了 ${score.correct} / ${score.total} 题 (${percentage}%)`;

        if (percentage >= 90) {
            message += '\n太棒了！你是英语小达人！🎉';
        } else if (percentage >= 70) {
            message += '\n做得很好！继续加油！👏';
        } else if (percentage >= 50) {
            message += '\n不错！多练习会更好！💪';
        } else {
            message += '\n没关系，多练习就会进步！📚';
        }

        alert(message);

        // Reset quiz
        this.quizManager.reset();
        this.backToSelection();
    }

    updateQuizProgress() {
        const quizProgress = ((this.quizManager.currentQuestionIndex + 1) / this.quizManager.currentQuiz.length) * 100;
        document.getElementById('quiz-progress').style.width = quizProgress + '%';
        document.getElementById('quiz-progress').textContent = `第 ${this.quizManager.currentQuestionIndex + 1} / ${this.quizManager.currentQuiz.length} 题`;
    }

    createCelebration() {
        const celebration = document.createElement('div');
        celebration.className = 'celebration';

        for (let i = 0; i < 20; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = `hsl(${Math.random() * 360}, 70%, 50%)`;
            confetti.style.animationDelay = Math.random() * 2 + 's';
            celebration.appendChild(confetti);
        }

        document.body.appendChild(celebration);

        setTimeout(() => {
            celebration.remove();
        }, 3000);
    }

    showSelectionScreen() {
        document.getElementById('selection-screen').classList.remove('hidden');
        document.getElementById('learning-mode').classList.add('hidden');
        document.getElementById('quiz-mode').classList.add('hidden');
    }

    hideSelectionScreen() {
        document.getElementById('selection-screen').classList.add('hidden');
    }

    showLearningInterface() {
        document.getElementById('learning-mode').classList.remove('hidden');
        document.getElementById('quiz-mode').classList.add('hidden');
    }

    showQuizInterface() {
        document.getElementById('quiz-mode').classList.remove('hidden');
        document.getElementById('learning-mode').classList.add('hidden');
    }

    enableSemesterButtons() {
        document.querySelectorAll('.btn-semester1, .btn-semester2').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }

    enableUnitButtons() {
        document.querySelectorAll('.btn-unit1, .btn-unit2, .btn-unit3, .btn-unit4, .btn-unit5, .btn-unit6').forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
    }

    backToSelection() {
        this.showSelectionScreen();
        this.currentMode = null;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new EnglishLearningApp();
});

// Add back button functionality
document.addEventListener('DOMContentLoaded', () => {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (window.app) {
                window.app.backToSelection();
            }
        });
    }
});