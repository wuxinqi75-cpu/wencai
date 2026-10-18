/* =========================================================
   所有文字都在这个文件里。
   想改哪句，直接改下面字符串，然后重新编译即可。
   ========================================================= */
export const NAME = '文彩';
export const AGE = 27;
/* 开场 / 顶栏显示的房间名 */
export const ROOM_TITLE = '给姐姐的房间';
/* 手里能改的总开关 */
export const CONFIG = {
    musicBeat: 0.42, // 生日歌速度（秒/拍），越大越慢
    musicVolume: 0.5,
    blowSeconds: 1.15, // 需要连续吹多久（秒）
    holdSeconds: 1.7, // 代替吹气时，按住多久（秒）
    wishSeconds: 6.5, // 许愿安静的时间
    fireworkEvery: 1500, // 烟花间隔（毫秒）
};
/* 七颗星星的话，按星星顺序排列 */
export const BLESSINGS = [
    '姐，今天你最大，许愿不用讲道理。',
    '虽然 27，但在我心里你永远 18。',
    '谢谢你这些年对我的照顾。',
    '愿你的身体永远健康。',
    '愿你想要的，都慢慢有。',
    '愿你讨厌的，都绕道走。',
    '最后一颗星，替你留着吹蜡烛的愿望。',
];
/* 吹蜡烛 */
export const BLOW = {
    title: '该吹蜡烛了',
    sub: '二十七岁，两根蜡烛。',
    ask: '对着手机下面，轻轻吹一下',
    allow: '开始吹蜡烛',
    hold: '没麦克风？按住吹',
    listen: '在听了，吹——',
    holding: '别松手，继续吹',
    denied: '麦克风没打开，那就按住吧',
    typing: '再吹久一点',
    done: '灭了。',
};
/* 许愿 */
export const WISH = {
    before: '闭上眼睛',
    sub: '慢慢许，我在旁边等',
    ready: '睁眼吧',
};
/* 切蛋糕 */
export const CUT = {
    hint: '在屏幕上划一刀，切开蛋糕',
    swipe: '横着划，随便从哪边开始',
    done: '咦，里面好像有东西',
    open: '拆开那封信',
};
/* 蛋糕里那封信 —— 吴信启自己改这一段就行 */
export const LETTER = {
    to: '给姐姐',
    body: [
        '姐：',
        '今年是你的 27 岁生日。',
        '我好像没给你过过生日，很感谢你去年送我的生日蛋糕 🎂，很好吃，今年弟弟财力有限，所以自己用最近自学的一些技术，来送一点生日蛋糕，以及生日祝福。',
        '希望姐姐可以天天开心，所愿皆所成，身体健康，平平安安。',
    ],
    sign: '最后，生日快乐！！！',
    from: '-你的弟弟（吴信启）',
};
/* 结尾 */
export const ENDING = {
    title: '二十七岁，生日快乐',
    sub: '这屋子一直留着，明年再来',
    bottleTitle: '愿望瓶',
    bottleSub: '写一个愿望，装进去，明年这天再打开',
    bottlePlaceholder: '今年想要什么？',
    bottleSave: '放进瓶子',
    bottleSaved: '收好了，明年这天再打开。',
    openBottle: '去愿望瓶',
    roam: '屋子随便逛，烟花一直放着 · 点蛋糕上的那封信能再看一遍',
    again: '再过一次生日',
    fireworks: '再放一场烟花',
    replayHint: '点一下，重新来过',
    allDoneTitle: '九个成就，全部拿到了',
    allDoneSub: '到这里就结束啦。生日快乐。',
};
/* 只有吴信启会看到的"看瓶子"面板 */
export const VAULT = {
    title: '愿望瓶 · 查看',
    empty: '瓶子是空的',
    copy: '复制全部',
    clear: '清空瓶子',
    cleared: '清空了',
    copied: '已复制',
    hint: '这页是给弟弟看的，她不会误触到这里',
};
export const ACHIEVEMENTS = [
    { id: 'enter', name: '推门而入', desc: '走进了给姐姐的房间' },
    { id: 'star3', name: '拾星人', desc: '点亮三颗星星' },
    { id: 'star7', name: '满天星', desc: '点亮全部七颗星星' },
    { id: 'blow', name: '一口气', desc: '吹灭了二十七岁的蜡烛' },
    { id: 'wish', name: '许愿家', desc: '认真闭眼许了一个愿' },
    { id: 'cut', name: '第一刀', desc: '切开了生日蛋糕' },
    { id: 'letter', name: '读完这封信', desc: '读完了蛋糕里那封信' },
    { id: 'firework', name: '放烟花的人', desc: '看完整场烟花' },
    { id: 'bottle', name: '愿望收藏家', desc: '把愿望装进了瓶子' },
];
