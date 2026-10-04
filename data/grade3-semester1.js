// 按三年级上学期课本第 86–88 页逐项录入；括号中的同义形式拆为独立练习项。
// 每行：英文 | 中文 | 美式音标 | 例句 | 例句中文。
(function (root) {
  const source = {
    welcome: `welcome|欢迎|ˈwelkəm|Welcome to our school!|欢迎来到我们的学校！
to|向，到，往|tuː|Let's go to school.|我们去上学吧。
school|学校|skuːl|This is my school.|这是我的学校。
hi|嘿，喂，你好|haɪ|Hi, Tom!|你好，汤姆！
I|我|aɪ|I am happy.|我很高兴。
be|是|biː|Let's be friends.|我们做朋友吧。
am|是（与 I 连用）|æm|I am nine.|我九岁。
is|是（用于第三人称单数）|ɪz|She is my friend.|她是我的朋友。
are|是（与 you、we、they 等连用）|ɑːr|We are friends.|我们是朋友。
what|什么|wʌt|What is your name?|你叫什么名字？
your|你的，你们的|jʊr|Is this your book?|这是你的书吗？
name|名字|neɪm|My name is Tom.|我的名字是汤姆。
hello|喂，哈啰，你好|həˈloʊ|Hello, my friend!|你好，我的朋友！
my|我的|maɪ|This is my bag.|这是我的包。
goodbye|再见|ˌɡʊdˈbaɪ|Goodbye, Miss Li!|再见，李老师！
have|有，拥有|hæv|I have a pencil.|我有一支铅笔。
a|一（个，用于辅音音素前）|ə|I have a book.|我有一本书。
an|一（个，用于元音音素前）|ən|I have an apple.|我有一个苹果。
nice|令人愉快的|naɪs|Have a nice day!|祝你度过愉快的一天！
day|一天|deɪ|It is a nice day.|这是美好的一天。
good|好的|ɡʊd|This is a good book.|这是一本好书。
morning|早晨，上午|ˈmɔːrnɪŋ|Good morning!|早上好！
Ms|女士|mɪz|Good morning, Ms Li!|早上好，李女士！
stand|站立|stænd|Please stand here.|请站在这里。
stand up|站起来|stænd ʌp|Please stand up.|请站起来。
sit|坐|sɪt|Please sit here.|请坐在这里。
sit down|坐下|sɪt daʊn|Please sit down.|请坐下。
open|打开|ˈoʊpən|Open your book.|打开你的书。
book|书|bʊk|This is my book.|这是我的书。
close|合上|kloʊz|Close your book.|合上你的书。
point|指|pɔɪnt|Point to the door.|指一指门。
say|说|seɪ|Say hello to Tom.|向汤姆问好。
read|阅读|riːd|Let's read a book.|我们读一本书吧。
listen|听|ˈlɪsən|Listen to the song.|听这首歌。
write|写|raɪt|Write your name.|写下你的名字。`,
    unit1: `let's|让我们（let us 的缩写）|lets|Let's play together.|我们一起玩吧。
let us|让我们|let ʌs|Let us sing a song.|让我们唱一首歌。
friend|朋友|frend|She is my friend.|她是我的朋友。
meet|认识，结识|miːt|Nice to meet you!|很高兴认识你！
you|你，你们|juː|You are my friend.|你是我的朋友。
play|玩，玩耍|pleɪ|Let's play a game.|我们玩一个游戏吧。
happy|高兴的，快乐的|ˈhæpi|I am happy today.|我今天很高兴。
new|新的|nuː|This is my new bag.|这是我的新包。
do|构成疑问句或否定句；做|duː|Do you like apples?|你喜欢苹果吗？
they|他们|ðeɪ|They are my friends.|他们是我的朋友。
everyone|每个人，人人|ˈevriwʌn|Hello, everyone!|大家好！
nine|九|naɪn|I am nine.|我九岁。
she|她|ʃiː|She is my sister.|她是我的姐姐。
too|也|tuː|I am happy too.|我也很高兴。
we|我们|wiː|We are friends.|我们是朋友。
from|从|frʌm|I am from China.|我来自中国。
the|用于特指已提到、已知或独一无二的人或物|ðə|Open the door, please.|请打开门。
twin|双胞胎中的一个|twɪn|I have a twin brother.|我有一个双胞胎兄弟。
he|他|hiː|He is my brother.|他是我的哥哥。
come|来，来到|kʌm|Come here, please.|请到这里来。
and|然后，接着；和|ænd|Tom and I are friends.|汤姆和我是朋友。
oh|噢|oʊ|Oh, a rainbow!|噢，一道彩虹！
no|不，不行|noʊ|No, thank you.|不了，谢谢。
help|帮助，帮忙|help|Let me help you.|让我帮你。
here|在这里|hɪr|My book is here.|我的书在这里。
here you are|给你|hɪr juː ɑːr|Here you are, Tom.|给你，汤姆。
thank|感谢，向……表示谢意|θæŋk|Thank you for your help.|谢谢你的帮助。
together|一起，一块儿|təˈɡeðər|Let's sing together.|我们一起唱歌吧。
OK|行，可以|ˌoʊˈkeɪ|OK, let's go!|好的，我们走吧！
great|极棒的，极好的|ɡreɪt|That is great!|那太棒了！
age|年龄|eɪdʒ|What is your age?|你多大了？
song|歌曲|sɔːŋ|This is a nice song.|这是一首好听的歌。
dear|亲爱的|dɪr|Hello, my dear friend!|你好，我亲爱的朋友！
sing|唱，歌唱|sɪŋ|Let's sing a song.|我们唱首歌吧。
now|现在|naʊ|Let's play now.|我们现在玩吧。
know|认识；知道，了解|noʊ|I know your name.|我知道你的名字。
our|我们的|aʊr|This is our school.|这是我们的学校。
everybody|每个人，人人|ˈevribɑːdi|Good morning, everybody!|大家早上好！
with|和……一起|wɪð|Play with me.|和我一起玩。
me|我（宾格）|miː|Look at me.|看看我。`,
    unit2: `thing|东西|θɪŋ|What is this thing?|这是什么东西？
pack|收拾好|pæk|Pack your schoolbag.|收拾好你的书包。
pen|钢笔|pen|This is my pen.|这是我的钢笔。
pencil|铅笔|ˈpensəl|I have a pencil.|我有一支铅笔。
pencil case|笔袋；铅笔盒|ˈpensəl keɪs|My pen is in my pencil case.|我的钢笔在我的笔袋里。
bag|袋，包|bæɡ|This is a blue bag.|这是一个蓝色的包。
for|为了|fɔːr|This is for you.|这是给你的。
ruler|尺子，直尺|ˈruːlər|My ruler is green.|我的尺子是绿色的。
eraser|橡皮|ɪˈreɪsər|I have an eraser.|我有一块橡皮。
this|这，这个|ðɪs|This is my book.|这是我的书。
in|在……里|ɪn|The pen is in the bag.|钢笔在包里。
schoolbag|书包|ˈskuːlbæɡ|My schoolbag is new.|我的书包是新的。
it|它|ɪt|It is a cat.|它是一只猫。
not|不，不是|nɑːt|It is not my bag.|它不是我的包。
that|那，那个|ðæt|That is my school.|那是我的学校。
yes|是，对|jes|Yes, it is my book.|是的，它是我的书。
guess|猜，猜测|ɡes|Guess my age.|猜猜我的年龄。
find|发现，找到|faɪnd|I can find my pen.|我能找到我的钢笔。
lost and found|失物招领|lɔːst ənd faʊnd|My bag is at the lost and found.|我的包在失物招领处。
bye|再见，拜拜|baɪ|Bye, my friend!|再见，我的朋友！
kid|小孩，儿童|kɪd|He is a happy kid.|他是一个快乐的孩子。
take care of|照看，照料|teɪk ker əv|Take care of your little sister.|照顾好你的小妹妹。
there|在那里|ðer|My bag is there.|我的包在那里。
please|请|pliːz|Sit down, please.|请坐。
back|回到原处|bæk|Put the book back.|把书放回原处。
come back|回来|kʌm bæk|Come back, please.|请回来。
look|看，瞧，望|lʊk|Look! A bird!|看！一只鸟！
look at|看|lʊk æt|Look at the picture.|看这幅画。`,
    unit3: `colourful|颜色鲜艳的，色彩丰富的|ˈkʌlərfəl|This is a colourful picture.|这是一幅色彩丰富的画。
world|世界|wɜːrld|We love our world.|我们爱我们的世界。
hooray|好哇|hʊˈreɪ|Hooray! Let's play!|好哇！我们玩吧！
umbrella|伞，雨伞|ʌmˈbrelə|I have a red umbrella.|我有一把红色的雨伞。
clothes|衣服|kloʊðz|My clothes are blue.|我的衣服是蓝色的。
red|红色（的）|red|The apple is red.|这个苹果是红色的。
pink|粉红色（的）|pɪŋk|My bag is pink.|我的包是粉红色的。
green|绿色（的）|ɡriːn|The ruler is green.|这把尺子是绿色的。
yellow|黄色（的）|ˈjeloʊ|The sun is yellow.|太阳是黄色的。
orange|橙色（的）|ˈɔːrɪndʒ|The balloon is orange.|这个气球是橙色的。
blue|蓝色（的）|bluː|My pen is blue.|我的钢笔是蓝色的。
purple|紫色（的）|ˈpɜːrpəl|This is a purple umbrella.|这是一把紫色的雨伞。
rainbow|彩虹|ˈreɪnboʊ|I can see a rainbow.|我能看见一道彩虹。
want|想要|wɑːnt|I want a balloon.|我想要一个气球。
balloon|气球|bəˈluːn|This balloon is red.|这个气球是红色的。
colour|颜色|ˈkʌlər|What colour is it?|它是什么颜色的？
can|能，会|kæn|I can sing.|我会唱歌。
see|看见，看到|siː|I can see a bird.|我能看见一只鸟。
right|正确的，对的|raɪt|You are right.|你是对的。
first|第一的|fɜːrst|This is my first book.|这是我的第一本书。
magical|神奇的，有魔力的|ˈmædʒɪkəl|This is a magical world.|这是一个神奇的世界。
fun|有趣的，逗乐的|fʌn|This is a fun game.|这是一个有趣的游戏。
black|黑色（的）|blæk|The cat is black.|这只猫是黑色的。
so|这么，如此|soʊ|The bird is so little.|这只鸟真小。
many|许多，大量|ˈmeni|I have many books.|我有许多书。
picture|画，图画|ˈpɪktʃər|Look at this picture.|看这幅画。
today|今天|təˈdeɪ|I am happy today.|我今天很高兴。
paint|画，作画|peɪnt|Let's paint a rainbow.|我们画一道彩虹吧。`,
    unit4: `number|数，数字|ˈnʌmbər|What number is this?|这是数字几？
count|数数|kaʊnt|Let's count the birds.|我们数一数鸟吧。
how|多少；怎样，如何|haʊ|How old are you?|你多大了？
bird|鸟|bɜːrd|I can see a bird.|我能看见一只鸟。
one|一|wʌn|I have one pen.|我有一支钢笔。
two|二|tuː|I have two books.|我有两本书。
three|三|θriː|I can see three birds.|我能看见三只鸟。
four|四|fɔːr|I have four pencils.|我有四支铅笔。
five|五|faɪv|I can see five apples.|我能看见五个苹果。
six|六|sɪks|I have six books.|我有六本书。
seven|七|ˈsevən|I can see seven birds.|我能看见七只鸟。
eight|八|eɪt|I have eight pens.|我有八支钢笔。
ten|十|ten|I have ten pencils.|我有十支铅笔。
eleven|十一|ɪˈlevən|I can see eleven birds.|我能看见十一只鸟。
twelve|十二|twelv|I have twelve books.|我有十二本书。
rope|绳|roʊp|This is a long rope.|这是一根长绳。
who|谁，什么人|huː|Who is she?|她是谁？
make|制作|meɪk|Let's make a toy.|我们做一个玩具吧。
Chinese knot|中国结|ˌtʃaɪˈniːz nɑːt|This Chinese knot is red.|这个中国结是红色的。
beautiful|美丽的|ˈbjuːtɪfəl|The rainbow is beautiful.|这道彩虹很美丽。
only|仅仅|ˈoʊnli|I have only one pen.|我只有一支钢笔。
show|给……看|ʃoʊ|Show me your picture.|给我看看你的画。
baby|幼崽，雏鸟|ˈbeɪbi|Look at the baby bird.|看那只雏鸟。
cheep|吱吱（或唧唧）的叫声|tʃiːp|The little bird goes cheep.|小鸟唧唧叫。
egg|蛋|eɡ|This is an egg.|这是一个蛋。
hungry|饥饿的|ˈhʌŋɡri|The cat is hungry.|这只猫饿了。
around|环绕，在……周围|əˈraʊnd|We sit around the table.|我们围坐在桌子旁。
us|我们（宾格）|ʌs|Come with us.|和我们一起来。
all|全部，所有|ɔːl|We are all happy.|我们都很高兴。
all around|处处，到处|ɔːl əˈraʊnd|Birds are all around.|到处都是鸟。
big|大的|bɪɡ|This is a big box.|这是一个大箱子。
little|小的|ˈlɪtəl|This is a little bird.|这是一只小鸟。
everywhere|在各个地方，处处|ˈevriwer|I can see flowers everywhere.|我到处都能看见花。`,
    unit5: `family|家庭，家人|ˈfæməli|I love my family.|我爱我的家人。
dad|爸爸|dæd|This is my dad.|这是我的爸爸。
father|爸爸|ˈfɑːðər|My father is tall.|我的爸爸很高。
mum|妈妈|mʌm|This is my mum.|这是我的妈妈。
mother|妈妈|ˈmʌðər|My mother is happy.|我的妈妈很高兴。
brother|哥哥，弟弟|ˈbrʌðər|He is my brother.|他是我的哥哥。
sister|姐姐，妹妹|ˈsɪstər|She is my sister.|她是我的姐姐。
grandpa|祖父，外祖父|ˈɡrænpɑː|I love my grandpa.|我爱我的爷爷。
grandfather|祖父，外祖父|ˈɡrænfɑːðər|This is my grandfather.|这是我的爷爷。
grandma|祖母，外祖母|ˈɡrænmɑː|I love my grandma.|我爱我的奶奶。
grandmother|祖母，外祖母|ˈɡrænmʌðər|This is my grandmother.|这是我的奶奶。
but|但是，然而|bʌt|The box is big but the ball is little.|箱子很大，但是球很小。
people|人，人们|ˈpiːpəl|I can see many people.|我能看见许多人。
story|故事|ˈstɔːri|This is a funny story.|这是一个有趣的故事。
cap|帽子|kæp|My cap is blue.|我的帽子是蓝色的。
worry|担心|ˈwɜːri|Do not worry.|别担心。
on|在……上面|ɑːn|The book is on the table.|书在桌子上。
come on|快点，加油|kʌm ɑːn|Come on, Tom!|加油，汤姆！
photo|照片，相片|ˈfoʊtoʊ|This is a photo of my family.|这是一张我的全家福。
love|爱，关爱|lʌv|I love my mum.|我爱我的妈妈。
daddy|爸爸|ˈdædi|Hello, Daddy!|你好，爸爸！
mummy|妈妈|ˈmʌmi|Hello, Mummy!|你好，妈妈！
where|在哪里|wer|Where is my book?|我的书在哪里？
dog|狗|dɔːɡ|This is my dog.|这是我的狗。
box|盒，箱|bɑːks|The toy is in the box.|玩具在箱子里。`,
    unit6: `sweet|甜蜜的|swiːt|Home, sweet home!|家，甜蜜的家！
home|家|hoʊm|Welcome to my home!|欢迎来到我家！
game|游戏|ɡeɪm|Let's play a game.|我们玩一个游戏吧。
room|房间|ruːm|This is my room.|这是我的房间。
living room|客厅|ˈlɪvɪŋ ruːm|Dad is in the living room.|爸爸在客厅里。
bedroom|卧室|ˈbedruːm|This is my bedroom.|这是我的卧室。
bathroom|浴室，卫生间|ˈbæθruːm|The bathroom is small.|卫生间很小。
kitchen|厨房|ˈkɪtʃən|Mum is in the kitchen.|妈妈在厨房里。
dining room|餐厅|ˈdaɪnɪŋ ruːm|We eat in the dining room.|我们在餐厅里吃饭。
door|门|dɔːr|Open the door, please.|请打开门。
chair|椅子|tʃer|This is my chair.|这是我的椅子。
think|想，认为|θɪŋk|I think it is a cat.|我认为它是一只猫。
under|在……下面，在……底下|ˈʌndər|The ball is under the bed.|球在床下面。
bed|床|bed|This is my bed.|这是我的床。
toy|玩具|tɔɪ|I have a new toy.|我有一个新玩具。
miaow|咪，喵（猫叫声）|miˈaʊ|The cat goes miaow.|猫喵喵叫。
table|桌子|ˈteɪbəl|The apple is on the table.|苹果在桌子上。
cat|猫|kæt|This is my cat.|这是我的猫。
ball|球|bɔːl|My ball is red.|我的球是红色的。
their|他们的|ðer|This is their home.|这是他们的家。
apple|苹果|ˈæpəl|I have a red apple.|我有一个红苹果。
share|共用，分享|ʃer|Let's share the toys.|我们一起分享玩具吧。
put|放|pʊt|Put the book on the table.|把书放在桌子上。
cooking|做饭|ˈkʊkɪŋ|Dad is cooking.|爸爸正在做饭。
sun|太阳|sʌn|The sun is in the sky.|太阳在天空中。
like|喜欢|laɪk|I like apples.|我喜欢苹果。
run|跑|rʌn|I can run.|我会跑。
lucky|幸运的|ˈlʌki|You are lucky!|你真幸运！`
  };
  const units = {};
  Object.keys(source).forEach((unit) => {
    units[unit] = source[unit].split('\n').map((line) => {
      const [english, chinese, pronunciation, example, exampleChinese] = line.split('|');
      return { english, chinese, pronunciation, example, exampleChinese, emoji: '📖' };
    });
  });
  const result = { '上学期': units };
  if (typeof module !== 'undefined' && module.exports) module.exports = result;
  else root.GRADE3_VOCABULARY = result;
})(typeof globalThis !== 'undefined' ? globalThis : this);
