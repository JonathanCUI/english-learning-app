// Quiz functionality
class QuizManager {
    constructor(vocabularyManager) {
        this.vocabManager = vocabularyManager;
        this.currentQuiz = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.quizType = null; // 'english-to-chinese' or 'chinese-to-english' or 'audio-to-english'
    }

    generateQuiz(type = 'mixed') {
        this.quizType = type;
        const words = this.vocabManager.getCurrentWords();

        if (words.length === 0) {
            alert('当前单元没有单词，请先选择年级和单元！');
            return false;
        }

        // Shuffle words and select 5-10 for quiz
        const shuffled = [...words].sort(() => Math.random() - 0.5);
        this.currentQuiz = shuffled.slice(0, Math.min(8, shuffled.length));
        this.currentQuestionIndex = 0;
        this.score = 0;

        return true;
    }

    getCurrentQuestion() {
        if (this.currentQuiz.length === 0 || this.currentQuestionIndex >= this.currentQuiz.length) {
            return null;
        }
        return this.currentQuiz[this.currentQuestionIndex];
    }

    generateOptions(correctAnswer) {
        const allWords = this.vocabManager.getAllWords();
        const options = [correctAnswer];

        // Remove the correct answer from the pool of wrong options
        const wrongWords = allWords.filter(word =>
            word.english !== correctAnswer.english || word.chinese !== correctAnswer.chinese
        );

        // Randomly select 3 wrong options
        const shuffledWrong = [...wrongWords].sort(() => Math.random() - 0.5);
        const wrongOptions = shuffledWrong.slice(0, 3);

        options.push(...wrongOptions);
        return options.sort(() => Math.random() - 0.5);
    }

    checkAnswer(answer) {
        const currentQuestion = this.getCurrentQuestion();
        if (!currentQuestion) return false;

        let isCorrect = false;

        switch(this.quizType) {
            case 'english-to-chinese':
                isCorrect = answer.toLowerCase().trim() === currentQuestion.chinese.toLowerCase().trim();
                break;
            case 'chinese-to-english':
            case 'mixed':
            default:
                isCorrect = answer.toLowerCase().trim() === currentQuestion.english.toLowerCase().trim();
                break;
        }

        if (isCorrect) {
            this.score++;
            return true;
        }
        return false;
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex >= this.currentQuiz.length) {
            return false; // Quiz finished
        }
        return true;
    }

    getScore() {
        return {
            correct: this.score,
            total: this.currentQuiz.length,
            percentage: Math.round((this.score / this.currentQuiz.length) * 100)
        };
    }

    reset() {
        this.currentQuiz = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.quizType = null;
    }
}

// Speech synthesis for pronunciation
class SpeechManager {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voice = null;
        this.init();
    }

    init() {
        if (this.synthesis) {
            // Try to set a good English voice
            const voices = this.synthesis.getVoices();
            const englishVoice = voices.find(voice =>
                voice.lang.includes('en-US') || voice.lang.includes('en-GB')
            );
            this.voice = englishVoice || voices[0];
        }
    }

    speak(text) {
        if (!this.synthesis) {
            alert('您的浏览器不支持语音功能，请尝试使用Chrome或Safari浏览器！');
            return;
        }

        this.synthesis.cancel(); // Stop any ongoing speech

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) {
            utterance.voice = this.voice;
        }
        utterance.lang = 'en-US';
        utterance.rate = 0.8; // Slightly slower for clarity
        utterance.pitch = 1.1; // Slightly higher pitch for kid-friendly tone

        this.synthesis.speak(utterance);
    }
}