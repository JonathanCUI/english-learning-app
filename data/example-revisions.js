// Visual review, 2026-10-07. Each row: word | simple example | Chinese | visible cue.
// Scope-specific entries preserve different senses (e.g. sweet / show) and pictures.
(function (root) {
  const revisions = {
    'grade3|上学期|welcome': `be|I want to be your friend.|我想成为你的朋友。|微笑着指向自己的孩子
am|I am happy.|我很高兴。|微笑的男孩
is|This is a cat.|这是一只猫。|男孩身边的猫
my|This is my book.|这是我的书。|男孩抱着书
goodbye|Goodbye, my friend!|再见，我的朋友！|两个孩子挥手告别
have|I have a book.|我有一本书。|男孩拿着书
open|Open the door, please.|请打开门。|男孩开门
point|Point to the ball.|指一指球。|男孩指向红球`,
    'grade3|上学期|unit1': `let us|Let us play together.|让我们一起玩吧。|孩子们邀请同伴
friend|He is my friend.|他是我的朋友。|两个男孩搭肩
new|This is my new book.|这是我的新书。|一本蓝色的书
do|What do you make?|你在做什么？|男孩搭积木
nine|I can see nine apples.|我能看见九个苹果。|九个苹果
she|She can run.|她会跑步。|跑步的女孩
too|I can play too.|我也会玩。|一起玩积木的孩子
from|I walk home from school.|我从学校走回家。|男孩沿箭头离开学校
the|Look at the red ball.|看那个红色的球。|男孩指向三个球中的红球
twin|She has a twin sister.|她有一个双胞胎姐妹。|两个穿着相同的女孩
oh|Oh, what is it?|哦，那是什么？|惊讶的男孩
together|Let's play together.|我们一起玩吧。|两个孩子玩积木
dear|I love my dear mum.|我爱我亲爱的妈妈。|妈妈拥抱孩子
our|This is our classroom.|这是我们的教室。|孩子们在教室里
with|I walk with my friend.|我和朋友一起走。|两个背书包的孩子一起走路`,
    'grade3|上学期|unit2': `pencil case|My pencil case is red.|我的笔袋是红色的。|红色笔袋
ruler|This is my ruler.|这是我的尺子。|木色尺子
this|This is my school.|这是我的学校。|男孩指着学校
in|The ball is in the box.|球在箱子里。|箱子里的红球
not|No, I do not want it.|不，我不想要它。|男孩双臂交叉拒绝
that|That is my book.|那是我的书。|男孩指着书
yes|Yes, I can do it.|是的，我能做到。|男孩竖起拇指
guess|Guess what is under the cloth.|猜猜布下面是什么。|布盖着物品和疑问气泡
find|I find my toy bear.|我找到了我的玩具熊。|女孩找到椅子旁的玩具熊
there|My book is there.|我的书在那里。|女孩指向远处桌上的书
look|Look at the blackboard.|看黑板。|男孩面向黑板
look at|Look at the blackboard.|看黑板。|孩子指着黑板`,
    'grade3|上学期|unit3': `colourful|The flowers are colourful.|这些花五颜六色。|彩色花朵和蝴蝶
umbrella|My umbrella is yellow.|我的雨伞是黄色的。|黄色雨伞
clothes|Look at my clothes.|看看我的衣服。|黄色上衣蓝色短裤和袜子
pink|This crayon is pink.|这支蜡笔是粉红色的。|粉色蜡笔和色块
green|The grass is green.|草是绿色的。|绿色的草
orange|This crayon is orange.|这支蜡笔是橙色的。|橙色蜡笔和色块
blue|The sky is blue.|天空是蓝色的。|蓝天白云
purple|This crayon is purple.|这支蜡笔是紫色的。|紫色蜡笔和色块
want|I want a toy bear.|我想要一个玩具熊。|孩子伸手要玩具熊
can|I can swim.|我会游泳。|游泳的孩子
first|I am first.|我是第一个。|队伍最前面的男孩
black|My hair is black.|我的头发是黑色的。|黑发男孩
so|So many apples!|这么多苹果！|一篮苹果
many|I can see many children.|我能看见许多孩子。|一群孩子
paint|Let's paint a flower.|我们画一朵花吧。|女孩在画花和太阳`,
    'grade3|上学期|unit4': `count|Let's count the blocks.|我们数一数积木吧。|孩子在数积木
how|How tall is the giraffe?|长颈鹿有多高？|女孩看着大小长颈鹿
one|I can see one apple.|我能看见一个苹果。|一个苹果
two|I can see two birds.|我能看见两只鸟。|两只鸟
three|I can see three pigs.|我能看见三只小猪。|三只小猪
four|I can see four balloons.|我能看见四个气球。|四个气球
five|I have five fingers.|我有五根手指。|伸出的五根手指
six|I can see six stars.|我能看见六颗星星。|六颗星星
seven|There are seven days in a week.|一周有七天。|七张日历页
eight|I can see eight apples.|我能看见八个苹果。|八个苹果
ten|I can see ten stars.|我能看见十颗星星。|十颗星星
eleven|It is eleven o'clock.|现在是十一点。|十一点的钟和穿睡衣的孩子
twelve|There are twelve months in a year.|一年有十二个月。|十二个月的圆形图标
who|Who is that?|那是谁？|人物剪影和疑问气泡
make|Let's make a cake.|我们做一个蛋糕吧。|女孩做蛋糕
beautiful|The flowers are beautiful.|这些花很美丽。|花园里的花
only|There is only one apple.|只有一个苹果。|篮子里只有一个苹果
hungry|I am hungry.|我饿了。|男孩端着食物
us|Come and play with us.|来和我们一起玩吧。|一群孩子
all around|Flowers are all around.|周围到处都是花。|女孩被花围绕
big|The elephant is big.|大象很大。|大象
little|This toy bear is little.|这只玩具熊很小。|一大一小两只玩具熊`,
    'grade3|上学期|unit5': `but|I like apples but not oranges.|我喜欢苹果，但不喜欢橙子。|孩子在苹果和橙子之间选择
on|The apple is on the table.|苹果在桌子上。|桌上的苹果
where|Where is my toy?|我的玩具在哪里？|孩子在玩具箱里找东西
box|This is an empty box.|这是一个空箱子。|打开的空纸箱`,
    'grade3|上学期|unit6': `living room|This is our living room.|这是我们的客厅。|没有人物的客厅
kitchen|This is our kitchen.|这是我们的厨房。|没有人物的厨房
dining room|This is our dining room.|这是我们的餐厅。|没有人物的餐厅
think|Let me think.|让我想一想。|男孩托腮思考
table|The food is on the table.|食物在桌子上。|桌上的饭菜
ball|My ball is colourful.|我的球是彩色的。|红黄蓝绿的球
their|These are their toys.|这些是他们的玩具。|两个孩子抱着玩具箱`,
    'grade1|上学期|unit1': `meet|Nice to meet you!|很高兴认识你！|两个孩子握手
play|Let's play with a ball.|我们一起玩球吧。|两个孩子抛球`,
    'grade1|上学期|unit2': `two|I can see two birds.|我能看见两只鸟。|两只鸟
three|I can see three pigs.|我能看见三只小猪。|三只小猪
four|I can see four balloons.|我能看见四个气球。|四个气球
five|I have five fingers.|我有五根手指。|伸出的五根手指
six|I can see six stars.|我能看见六颗星星。|六颗星星
seven|There are seven days in a week.|一周有七天。|七张日历页`,
    'grade1|上学期|unit3': `and|My dad and I are happy.|爸爸和我都很高兴。|爸爸和孩子
sister|This is my sister.|这是我的姐姐。|单独站着的女孩`,
    'grade1|上学期|unit4': `a|I have a book.|我有一本书。|女孩抱着一本书`,
    'grade1|上学期|unit5': `here you are|Here you are. This is for you.|给你。这是送给你的。|两个孩子递礼物`,
    'grade1|下学期|unit2': `from|I walk home from school.|我从学校走回家。|男孩沿箭头离开学校`,
    'grade1|下学期|unit3': `now|Let's play now.|我们现在玩吧。|孩子看着手表踢球`,
    'grade1|下学期|unit4': `rock|Let's rock to the music!|让我们随着音乐摇摆吧！|孩子跟着音符舞动
move|I can move my body.|我能活动身体。|走动的孩子
head|This is my head.|这是我的头。|孩子指向头
her|This is her toy bear.|这是她的玩具熊。|女孩抱着玩具熊
part|My arm is part of my body.|我的手臂是身体的一部分。|孩子指着手臂（改用 arm 的插图）
strong|The boy is strong.|这个男孩很强壮。|男孩展示手臂肌肉`,
    'grade1|下学期|unit5': `live|I live in this house.|我住在这所房子里。|孩子站在房子前`,
    'grade1|下学期|unit6': `nine|I can see nine apples.|我能看见九个苹果。|九个苹果
ten|I can see ten stars.|我能看见十颗星星。|十颗星星
eleven|It is eleven o'clock.|现在是十一点。|十一点的钟
twelve|There are twelve months in a year.|一年有十二个月。|十二个月的图标
lunch|This is my lunch.|这是我的午餐。|孩子吃午餐
yet|I am not done yet.|我还没做完。|孩子仍在书写作业`,
    'grade2|上学期|unit2': `banana|This banana is yellow.|这根香蕉是黄色的。|一根黄色香蕉
noodle|I like noodles.|我喜欢面条。|一碗面条
bread|I like bread.|我喜欢面包。|切片面包
us|Come and play with us.|来和我们一起玩吧。|一群孩子
sweet|The sweets are sweet.|这些糖果很甜。|几颗糖果`,
    'grade2|上学期|unit3': `sonwy|It is snowy today.|今天下雪了。|雪中穿冬装的孩子`,
    'grade2|上学期|unit4': `spring|The flowers bloom in spring.|花儿在春天开放。|春天的花
hat|This is a warm hat.|这是一顶暖和的帽子。|毛线帽`,
    'grade2|上学期|unit5': `favourite|This is my favourite toy.|这是我最喜欢的玩具。|男孩抱着玩具熊`,
    'grade2|上学期|unit6': `kite|I can fly a kite.|我会放风筝。|一个孩子放风筝`,
    'grade2|下学期|unit2': `farmer|The farmer has some carrots.|农民有一些胡萝卜。|农民抱着一篮胡萝卜
doctor|The doctor helps the boy.|医生帮助这个男孩。|医生给男孩检查
nurse|The nurse helps the girl.|护士帮助这个女孩。|护士给女孩检查`,
    'grade2|下学期|unit5': `sing|I can sing a song.|我会唱一首歌。|一个孩子唱歌`,
    'grade2|下学期|unit6': `Monday|I go to school on Monday.|我星期一去上学。|背书包的孩子走向学校
Wednesday|I am happy on Wednesday.|我星期三很高兴。|高兴的男孩
Thursday|I paint on Thursday.|我星期四画画。|男孩面前的颜料
Friday|I play football on Friday.|我星期五踢足球。|孩子和足球
Sunday|I am with my family on Sunday.|星期日我和家人在一起。|一家人野餐`
  };
  function apply(vocabulary) {
    const changes = [];
    Object.keys(revisions).forEach(scope => {
      const [grade, semester, unit] = scope.split('|');
      const words = vocabulary[grade][semester][unit];
      revisions[scope].split('\n').forEach(line => {
        const [english, example, exampleChinese, visualCue] = line.split('|');
        const word = words.find(item => item.english === english || (english === 'sonwy' && item.english === 'snowy'));
        if (!word) throw new Error('Unknown example revision: ' + scope + '/' + english);
        changes.push({ scope, english: english === 'sonwy' ? 'snowy' : english,
          previousExample: word.example, previousChinese: word.exampleChinese, example, exampleChinese, visualCue });
        word.example = example;
        word.exampleChinese = exampleChinese;
        // Correct the obvious textbook-entry typo along with its example.
        if (english === 'sonwy') word.english = 'snowy';
      });
    });
    return changes;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { apply, revisions };
  else root.ExampleRevisions = { apply, revisions };
})(typeof globalThis !== 'undefined' ? globalThis : this);
