// Simplified vocabulary management with direct embedding
const VOCABULARY = {
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
            unit3: [
                {english: "my", chinese: "我的", pronunciation: "maɪ", emoji: "👤"},
                {english: "family", chinese: "家庭", pronunciation: "ˈfæməli", emoji: "👨‍👩‍👧‍👦"},
                {english: "mum", chinese: "妈妈", pronunciation: "mʌm", emoji: "👩"},
                {english: "dad", chinese: "爸爸", pronunciation: "dæd", emoji: "👨"},
                {english: "grandpa", chinese: "祖父；外祖父", pronunciation: "ˈɡrænpɑː", emoji: "👴"},
                {english: "grandma", chinese: "祖母；外祖母", pronunciation: "ˈɡrænmɑː", emoji: "👵"},
                {english: "sister", chinese: "姐姐；妹妹", pronunciation: "ˈsɪstər", emoji: "👭"},
                {english: "and", chinese: "和，与", pronunciation: "ænd", emoji: "➕"},
                {english: "brother", chinese: "哥哥；弟弟", pronunciation: "ˈbrʌðər", emoji: "👬"},
                {english: "this", chinese: "这，这个", pronunciation: "ðɪs", emoji: "👇"},
                {english: "is", chinese: "是", pronunciation: "ɪz", emoji: "❓"},
                {english: "love", chinese: "爱，关爱", pronunciation: "lʌv", emoji: "❤️"},
                {english: "me", chinese: "我", pronunciation: "miː", emoji: "👤"}
            ],
            unit4: [
                {english: "what", chinese: "什么", pronunciation: "wɑːt", emoji: "❓"},
                {english: "open", chinese: "打开", pronunciation: "ˈoʊpən", emoji: "📂"},
                {english: "door", chinese: "门", pronunciation: "dɔːr", emoji: "🚪"},
                {english: "classroom", chinese: "教室", pronunciation: "ˈklæsruːm", emoji: "🏫"},
                {english: "blackboard", chinese: "黑板", pronunciation: "ˈblækbɔːrd", emoji: "🧱"},
                {english: "window", chinese: "窗户", pronunciation: "ˈwɪndoʊ", emoji: "🪟"},
                {english: "desk", chinese: "书桌", pronunciation: "dɛsk", emoji: "🪑"},
                {english: "chair", chinese: "椅子", pronunciation: "tʃɛr", emoji: "🪑"},
                {english: "it", chinese: "它，这，那", pronunciation: "ɪt", emoji: "👆"},
                {english: "big", chinese: "大的", pronunciation: "bɪɡ", emoji: "📏"},
                {english: "that", chinese: "那，那个", pronunciation: "ðæt", emoji: "👉"},
                {english: "teacher", chinese: "教师，老师", pronunciation: "ˈtiːtʃər", emoji: "👩‍🏫"},
                {english: "a", chinese: "一（个）", pronunciation: "ə", emoji: "1️⃣"},
                {english: "very", chinese: "非常", pronunciation: "ˈvɛri", emoji: "✨"},
                {english: "old", chinese: "年代久远的", pronunciation: "oʊld", emoji: "📜"},
                {english: "school", chinese: "学校", pronunciation: "skuːl", emoji: "🏫"},
                {english: "look", chinese: "看，望，瞧", pronunciation: "lʊk", emoji: "👀"}
            ],
            unit5: [
                {english: "schoolbag", chinese: "书包", pronunciation: "ˈskuːlbæɡ", emoji: "🎒"},
                {english: "pencil case", chinese: "笔袋；铅笔盒", pronunciation: "ˈpɛnsəl keɪs", emoji: "✏️"},
                {english: "pencil", chinese: "铅笔", pronunciation: "ˈpɛnsəl", emoji: "✏️"},
                {english: "book", chinese: "书，书籍", pronunciation: "bʊk", emoji: "📚"},
                {english: "bye", chinese: "再见；拜拜", pronunciation: "baɪ", emoji: "👋"},
                {english: "here you are", chinese: "给你", pronunciation: "hɪr juː ɑːr", emoji: "🤝"},
                {english: "read", chinese: "阅读", pronunciation: "riːd", emoji: "📖"},
                {english: "together", chinese: "一起，共同", pronunciation: "təˈɡɛðər", emoji: "👫"}
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

function getCurrentWords(grade, semester, unit) {
    if (!grade || !semester || !unit) return [];
    if (!VOCABULARY[grade] || !VOCABULARY[grade][semester]) return [];
    return VOCABULARY[grade][semester][unit] || [];
}