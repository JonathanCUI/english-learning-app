// Vocabulary data management
class VocabularyManager {
    constructor() {
        this.vocabulary = {};
        this.currentGrade = null;
        this.currentSemester = null;
        this.currentUnit = null;
        this.loadVocabulary();
    }

    async loadVocabulary() {
        try {
            console.log('Attempting to load vocabulary.json...');
            const response = await fetch('vocabulary.json');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            this.vocabulary = await response.json();
            console.log('✅ Vocabulary loaded successfully!');
            console.log('📚 Vocabulary structure:', {
                grades: Object.keys(this.vocabulary),
                grade1Semesters: Object.keys(this.vocabulary.grade1 || {}),
                unit1Count: this.vocabulary.grade1?.['上学期']?.unit1?.length || 0,
                unit2Count: this.vocabulary.grade1?.['上学期']?.unit2?.length || 0,
                unit6Count: this.vocabulary.grade1?.['上学期']?.unit6?.length || 0
            });

            // Validate structure
            if (!this.vocabulary.grade1 || !this.vocabulary.grade1['上学期']) {
                throw new Error('Invalid vocabulary structure - missing grade1 or 上学期');
            }

        } catch (error) {
            console.error('❌ Failed to load vocabulary:', error);

            // Check if vocabulary.json exists but might be cached
            try {
                const cacheBuster = '?t=' + new Date().getTime();
                const retryResponse = await fetch('vocabulary.json' + cacheBuster);
                if (retryResponse.ok) {
                    this.vocabulary = await retryResponse.json();
                    console.log('✅ Retry successful after cache bypass');
                    return;
                }
            } catch (retryError) {
                console.error('Retry also failed:', retryError);
            }

            // Embed the correct vocabulary directly as last resort
            this.vocabulary = {
                grade1: {
                    "上学期": {
                        unit1: [
                            {english: "hello", chinese: "喂，你好", pronunciation: "həˈloʊ", emoji: "👋"},
                            {english: "nice", chinese: "令人愉快的", pronunciation: "naɪs", emoji: "😊"},
                            {english: "meet", chinese: "认识，结识", pronunciation: "miːt", emoji: "🤝"},
                            {english: "you", chinese: "你", pronunciation: "juː", emoji: "👤"},
                            {english: "let's", chinese: "让我们", pronunciation: "lets", emoji: "👫"},
                            {english: "play", chinese: "玩，玩耍", pronunciation: "pleɪ", emoji: "🎮"},
                            {english: "I", chinese: "我", pronunciation: "aɪ", emoji: "👤"},
                            {english: "am", chinese: "是", pronunciation: "æm", emoji: "❓"},
                            {english: "too", chinese: "也，还", pronunciation: "tuː", emoji: "➕"},
                            {english: "photo", chinese: "照片，相片", pronunciation: "ˈfoʊtoʊ", emoji: "📸"},
                            {english: "how", chinese: "怎样，如何", pronunciation: "haʊ", emoji: "❓"},
                            {english: "say", chinese: "说", pronunciation: "seɪ", emoji: "💬"}
                        ],
                        unit2: [
                            {english: "one", chinese: "一", pronunciation: "wʌn", emoji: "1️⃣"},
                            {english: "two", chinese: "二", pronunciation: "tuː", emoji: "2️⃣"},
                            {english: "three", chinese: "三", pronunciation: "θriː", emoji: "3️⃣"},
                            {english: "four", chinese: "四", pronunciation: "fɔːr", emoji: "4️⃣"},
                            {english: "five", chinese: "五", pronunciation: "faɪv", emoji: "5️⃣"},
                            {english: "six", chinese: "六", pronunciation: "sɪks", emoji: "6️⃣"},
                            {english: "seven", chinese: "七", pronunciation: "ˈsɛvən", emoji: "7️⃣"},
                            {english: "balloon", chinese: "气球", pronunciation: "bəˈluːn", emoji: "🎈"},
                            {english: "thank", chinese: "感谢，向...表示谢意", pronunciation: "θæŋk", emoji: "🙏"},
                            {english: "please", chinese: "请，好吗", pronunciation: "pliːz", emoji: "🙏"},
                            {english: "number", chinese: "数，数字", pronunciation: "ˈnʌmər", emoji: "🔢"}
                        ],
                        unit6: [
                            {english: "red", chinese: "红色", pronunciation: "rɛd", emoji: "🔴"},
                            {english: "green", chinese: "绿色", pronunciation: "ɡriːn", emoji: "🟢"},
                            {english: "blue", chinese: "蓝色", pronunciation: "bluː", emoji: "🔵"},
                            {english: "black", chinese: "黑色", pronunciation: "blæk", emoji: "⚫"},
                            {english: "white", chinese: "白色", pronunciation: "waɪt", emoji: "⚪"},
                            {english: "yellow", chinese: "黄色", pronunciation: "ˈjɛloʊ", emoji: "🟡"},
                            {english: "colour", chinese: "颜色", pronunciation: "ˈkʌlər", emoji: "🎨"},
                            {english: "so", chinese: "这么，如此", pronunciation: "soʊ", emoji: "💫"},
                            {english: "many", chinese: "许多；大量", pronunciation: "ˈmɛni", emoji: "🌟"},
                            {english: "happy", chinese: "快乐的", pronunciation: "ˈhæpi", emoji: "😊"},
                            {english: "Chinese New Year", chinese: "春节", pronunciation: "ˈtʃaɪniːz nuː jɪr", emoji: "🧧"},
                            {english: "stop", chinese: "停止，终止", pronunciation: "stɑːp", emoji: "🛑"},
                            {english: "go", chinese: "走", pronunciation: "ɡoʊ", emoji: "🚶"},
                            {english: "slow", chinese: "慢下来，减速", pronunciation: "sloʊ", emoji: "🐢"}
                        ]
                    },
                    "下学期": {}
                },
                grade2: {
                    "上学期": {},
                    "下学期": {}
                }
            };
            console.log('✅ Using embedded vocabulary data');
        }
    }

    setCurrentGrade(grade) {
        this.currentGrade = grade;
        return this;
    }

    setCurrentSemester(semester) {
        this.currentSemester = semester;
        return this;
    }

    setCurrentUnit(unit) {
        this.currentUnit = unit;
        return this;
    }

    getCurrentWords() {
        if (!this.currentGrade || !this.currentSemester || !this.currentUnit) {
            console.log('Missing selection:', {grade: this.currentGrade, semester: this.currentSemester, unit: this.currentUnit});
            return [];
        }

        console.log('Looking for words in:', this.currentGrade, this.currentSemester, this.currentUnit);

        if (!this.vocabulary[this.currentGrade]) {
            console.error('Grade not found in vocabulary:', this.currentGrade);
            return [];
        }

        if (!this.vocabulary[this.currentGrade][this.currentSemester]) {
            console.error('Semester not found:', this.currentSemester);
            return [];
        }

        const words = this.vocabulary[this.currentGrade][this.currentSemester][this.currentUnit] || [];
        console.log('Found words:', words.length, words.map(w => w.english));
        return words;
    }

    getAllWords() {
        const words = [];
        for (const grade in this.vocabulary) {
            for (const semester in this.vocabulary[grade]) {
                for (const unit in this.vocabulary[grade][semester]) {
                    words.push(...this.vocabulary[grade][semester][unit]);
                }
            }
        }
        return words;
    }

    getWordsByGrade(grade) {
        const words = [];
        if (this.vocabulary[grade]) {
            for (const semester in this.vocabulary[grade]) {
                for (const unit in this.vocabulary[grade][semester]) {
                    words.push(...this.vocabulary[grade][semester][unit]);
                }
            }
        }
        return words;
    }
}