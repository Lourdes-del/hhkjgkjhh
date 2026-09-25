/* ============================================================
   梦核游乐园 · 点击探索
   纯原生 HTML / CSS / JavaScript，无框架、无第三方库
   背景音乐与音效均由 Web Audio API 实时合成
   ============================================================ */

/* ---------- 一、集中管理图片路径（如路径不存在，改这里即可） ---------- */
const IMAGE_PATHS = {
  start:           "Dreamcore场景/开局界面.jpg",
  vendingMachine:  "Dreamcore场景/游乐园售货机.jpg",
  plasticBall:     "Dreamcore场景/游乐园塑料球.jpg",
  playgroundSlide: "Dreamcore场景/池核系列/游乐园滑梯.jpg",
  poolSlide:       "Dreamcore场景/池核系列/池核滑梯.jpg",
  yellowDuck:      "Dreamcore场景/池核系列/池核小黄鸭.jpg",
  exit:            "Dreamcore场景/结局/出口.jpg",
  badEnding:       "Dreamcore场景/结局/出口坏结局.jpg",
  goodEnding:      "Dreamcore场景/结局/出口好结局.jpg",
  normalEnding:    "Dreamcore场景/结局/出口普通结局.jpg",
};

/* ---------- 二、配置对象：密码 / 道具 / 小游戏 / 彩蛋 ---------- */

/* 售货机密码固定为 0317 */
const VENDING_CODE = "0317";

/* 道具（与对应小游戏的映射） */
const itemConfig = {
  "wet-note":    { id: "wet-note",    name: "湿掉的寻人纸条", icon: "📜", miniGame: "paperMaze" },
  "old-ticket":  { id: "old-ticket",  name: "旧游乐园门票",   icon: "🎫", miniGame: "ticketOrder" },
  "orange-cap":  { id: "orange-cap",  name: "橙色汽水瓶盖",   icon: "🥤", miniGame: "machineMemory" },
};

/* 小游戏（三种不同交互：迷宫 / 排序 / 反应记忆） */
const MINI_GAMES = {
  paperMaze: {
    id: "paperMaze",
    title: "湿掉的寻人纸条",
    prompt: "控制光点从入口走到出口。",
    wrong: "这条路通向已经发生的事情。",
    itemId: "wet-note",
  },
  ticketOrder: {
    id: "ticketOrder",
    title: "记忆排序",
    prompt: "点击两张卡片交换，排出正确顺序。",
    wrong: "记忆的顺序不对。",
    itemId: "old-ticket",
    fragments: ["我们买了门票。", "闭园铃响了。", "我松开了他的手。", "我没有回头。"],
  },
  machineMemory: {
    id: "machineMemory",
    title: "售货机记忆",
    prompt: "记住符号闪烁的顺序，然后重复。",
    wrong: "你没有跟上那天的声音。",
    itemId: "orange-cap",
    symbols: ["🟠", "🔵", "🟢", "🟡"],
  },
};

/* 迷宫布局：0 = 通路，1 = 墙；起点 (0,0)，终点 (20,20)
   递归回溯生成的「完美迷宫」：无环路，任意两点间仅一条路径 */
const MAZE = [
  [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  [1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
  [0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0],
  [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0],
  [0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0],
  [0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0],
  [0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
];

/* 五个彩蛋（地图图标 + 透明点击区域 + 独立 id） */
const EASTER_EGGS = {
  "egg-clock": {
    id: "egg-clock", name: "停摆的钟", scene: "start", icon: "🕰️",
    left: "20%", top: "6%",
    text: ["时间不是向前流逝。", "只是我们无法回到它原来的位置。"],
  },
  "egg-frame": {
    id: "egg-frame", name: "空照片框", scene: "vendingMachine", icon: "🖼️",
    left: "22%", top: "16%",
    text: ["如果记忆必须被看见，", "那么没有人记得的事情，是否真的发生过？"],
  },
  "egg-speaker": {
    id: "egg-speaker", name: "广播喇叭", scene: "plasticBall", icon: "📢",
    left: "72%", top: "14%",
    text: ["广播每天重复同一句话。", "重复得足够久，谎言也会获得现实的形状。"],
  },
  "egg-water": {
    id: "egg-water", name: "没有倒影的水面", scene: "poolSlide", icon: "◯",
    left: "40%", top: "72%",
    text: ["倒影证明不了真实。", "它只能证明，有什么东西正在看着水面。"],
  },
  "egg-bench": {
    id: "egg-bench", name: "空长椅", scene: "yellowDuck", icon: "🪑",
    left: "12%", top: "62%",
    text: ["等待不是一种动作。", "等待是把自己变成一个不会离开的人。"],
  },
};

/* ---------- 三、剧情文案（独立配置对象，便于修改） ---------- */
const storyText = {
  occasional: [
    "请不要再寻找不存在的人。",
    "你已经重复了很多次。",
    "这一次也不会有不同。",
  ],

  start: {
    first: ["欢迎回来。", "我们是不是已经来过这里了？"],
    revisit: "这里…好像和上次不太一样。",
    clockFirst: "它停在我们走散的那一分钟。",
    clockSecond: ["不应该过去的时间，过去了。", "03:17，这是售货机一直等待的时间。"],
  },

  vendingMachine: {
    click: "机器里还有东西在运转。",
    anomaly: "再点要散架了",
    anomalySub: "它和我一样，只是还没有承认自己坏了。",
    reenter: "刚才售货机里，真的有声音吗？",
    refuse: ["售货机拒绝回应。", "它还在等待那个时间。"],
    solved: "售货机不再回应了。",
  },

  plasticBall: {
    click: "安全出口并不通往外面。",
    anomaly: "如果出口一直都在，为什么没有人离开？",
    reenter: "我记得它以前指向你。",
    paperFirst: ["球下面压着一张纸。", "纸上的字已经被水浸开了。"],
    paperDone: "球下面什么也没有了。",
  },

  playgroundSlide: {
    anomaly: "这里少了一段下午。",
    pool: "水面下面，好像还留着那天没有说完的话。",
  },

  poolSlide: {
    slideAnomaly: "你游玩了一次滑梯，真是个贪玩的",
    slideSub: "你总是这样，假装只要再玩一次，事情就会变回原来的样子。",
    poolsideDone: "水面很平静。",
  },

  yellowDuck: {
    first: "水面很平静，像什么都没有发生过。",
    anomaly: "鸭子的位置变了。",
    anomalySub: "它一直在看向出口。",
    duck: ["它没有眼睛。", "但它知道我会来。"],
  },

  exit: {
    enter: ["出口不是离开梦境的地方。", "出口只是梦境决定不再需要你的地方。"],
    doorWithKey: ["你终于想起自己为什么回来。", "门后面没有那个人，只有你没有说完的话。"],
    doorWithoutKey: ["你想不起来要找什么。", "所以你决定把一切都当成梦。"],
  },

  mental: {
    alert: "你似乎感觉哪里不一样了",
    after: ["不是世界变了。", "是你终于发现，自己一直没有在世界里面。"],
  },

  items: {
    "wet-note": ["如果你看到他，请告诉他我已经回家了。", "落款的名字，是我的。"],
    "old-ticket": ["门票上有两个名字。", "其中一个被水泡开了。", "背面写着：闭园前请牵好身边的人。", "我当时没有牵住。"],
    "orange-cap": ["售货机里没有汽水。", "只有一个被遗忘的瓶盖。", "那天他想喝橙色汽水。", "我说，离开的时候再买。"],
  },

  password: {
    title: "自动售货机",
    prompt: "输入密码",
    wrong: "这个数字不属于今天。",
  },

  easterEggs: {
    known: "你已经知道这里了。",
    allFound: ["你寻找的不是隐藏物。", "你只是需要一些证据，证明自己曾经来过。"],
  },

  /* 轻度幽默：轻微、短暂、反差式，语调像「绝望的人在开玩笑」 */
  humor: {
    startFirst: "今天的游乐园，宣传语是：「来玩吧，别太在意为什么会想起你。」",
    startReturn: "这座园子总是熟悉得让我想起某个该死的结局。",
    clockFirst: "时间终于对上了。很高兴见到你，虽然我们也没见过。",
    clockSecond: "现在知道为什么它不走了吗？因为它也在等一个没来的客人。",

    vendingBefore: "本机仅接受不想被记住的货币。",
    vendingAnomaly: "这不是故障，这是「营业方式」。",
    vendingBeforePassword: "它不卖饮料，它卖的是回忆的去留。",
    vendingAfterPassword: "机器终于愿意吐出一个被遗忘的东西。真是有点可惜。",
    capAfter: "瓶盖是免费的，遗憾不是。",

    ballFirst: "这个球看起来很安全，像一个人愿意装作没事。",
    ballAnomaly: "出口牌真可爱，怎么一看就像在说：「别走，真的别走。」",
    mazeFail: "你碰到了墙。这个地方真的很有自己的想法。",
    noteAfter: "你终于拿回了一张纸。它看起来像是从一场失踪里捞出来的。",

    slidePool: "为什么这里的水看起来像在藏东西？我只是想问一句：你也想藏起来吗？",
    slideAnomaly: "很遗憾，下午从来不谈价钱。",
    sortFail: "记忆会嘲笑你，像一个老朋友在你拖着脚步时指着门。",

    slideFirst: "当然，我也一样。人总要找几个借口来解释自己为什么不肯离开。",
    beforeDuck: "你终于进了池子。没什么比一张小黄鸭更能让人放下戒心。",
    sortAfter: "门票终于找到了。你看，记忆也会捡东西。",

    duckFirst: "这只鸭子看起来很友善，像一个从未失去过朋友的人。",
    duckAnomaly: "鸭子位置改变了。它显然也不想被你困住。",
    benchEgg: "长椅空着，像是某个人刚刚离开，又突然觉得很像自己。",
    nearExit: "这张脸我认识，但我不知道是因为我在看它，还是它在看我。",

    eggFrame: "照片不见了。好像它终于决定不再替你保存什么。",
    eggBroadcast: ["广播：「欢迎回到闭园前的记忆。」", "广播：「顺便提醒，你仍然是最后一个在这里的人。」"],
    eggWater: "它没有倒影。大概就是因为做梦的人，不能被镜子看见。",
    eggBench: "这张椅子看起来很累，像是等了太久，又什么都没等到。",

    badBefore: "系统已经开始清理你了。真是礼貌。",
    goodBefore: "你终于记起了事情，像一个人终于承认自己确实需要一张门票。",
    normalBefore: "如果一切都没发生，那恭喜你，真的活在了一个很安静的梦里。",
    trueEndAfter: "你醒来了。谢谢你愿意陪这个梦走完最后一里。",

    random: [
      "这里的风都在假装自己很忙。",
      "如果你觉得哪里不对劲，说明你终于开始认真看了。",
      "欢迎光临。请把来路留在门口。",
      "别担心，这里的一切会在你想起来之前结束。",
    ],
  },

  endings: {
    bad: {
      pre: ["系统无法继续保存一个已经醒来的人。"],
      english: "unfortunately,you have been deleted from the world.",
      caption: ["这里从来没有你。"],
      final: ["但梦还在继续。"],
    },
    good: {
      pre: ["你终于承认，那个人没有在等你。", "你也终于允许自己离开。"],
      english: "you had a dream of yesteryear,you woke up.",
      caption: ["有些人不是被遗忘后才消失。", "而是在被记住太久以后，终于可以离开。"],
      trueEntry: ["你已经想起了那一天。", "现在可以真正醒来了。"],
      trueEnd1: ["你醒来了。", "窗外没有游乐园。", "手里也没有门票。"],
      trueEnd2: ["你终于记起，那天不是他走丢了。", "是你先松开了手。"],
      trueEnd3: ["记住不是为了回到过去。", "而是为了允许自己离开。"],
      trueEndTitle: "true end",
      incomplete: ["门开了，但你还没有想起全部事情。", "有些记忆已经找回，但故事仍然缺少最后一页。"],
      incompleteFinal: ["你醒来了。", "但梦还没有真正结束。"],
    },
    normal: {
      pre: ["没有异常，没有出口，也没有需要解释的事情。", "这样就很好。"],
      english: "nothing ever happens,it's just a dream,right?",
      caption: ["只要不去确认，梦就不会结束。"],
      final: ["明天还会醒来。", "也许吧。"],
    },
  },

  imageError: "图片加载失败：",
};

/* ---------- 四、游戏状态 ---------- */
const gameState = {
  currentScene: "start",
  previousScene: null,
  visitCount: {},
  anomalyCount: 0,
  anomalyLimit: 4,
  triggeredAnomalies: [],
  inventory: [],
  completedMiniGames: [],
  clockClicks: 0,            // 开局时钟点击次数
  passwordSolved: false,     // 售货机密码是否已输入正确
  discoveredEasterEggs: [],  // 已发现彩蛋 id
  ending: null,
  gameOver: false
};

/* ---------- 五、场景与热点（对象管理） ---------- */
const SCENES = {
  start: {
    name: "start",
    image: IMAGE_PATHS.start,
    back: null,
    hotspots: [
      { rect: { left: "7%", top: "46%", width: "16%", height: "12%" }, go: "vendingMachine" },
      { rect: { left: "29%", top: "46%", width: "16%", height: "12%" }, go: "plasticBall" },
      { rect: { left: "52%", top: "46%", width: "16%", height: "12%" }, go: "playgroundSlide" },
      { rect: { left: "2%", top: "4%", width: "14%", height: "18%" }, action: "clock" },
    ],
  },

  vendingMachine: {
    name: "vendingMachine",
    image: IMAGE_PATHS.vendingMachine,
    back: "start",
    hotspots: [
      { rect: { left: "58%", top: "30%", width: "34%", height: "50%" }, action: "vending" },
    ],
  },

  plasticBall: {
    name: "plasticBall",
    image: IMAGE_PATHS.plasticBall,
    back: "start",
    hotspots: [
      { rect: { left: "46%", top: "12%", width: "20%", height: "18%" }, action: "exit-sign" },
      { rect: { left: "30%", top: "70%", width: "32%", height: "20%" }, action: "paper" },
    ],
  },

  playgroundSlide: {
    name: "playgroundSlide",
    image: IMAGE_PATHS.playgroundSlide,
    back: "start",
    hotspots: [
      { rect: { left: "30%", top: "45%", width: "45%", height: "45%" }, action: "pool" },
    ],
  },

  poolSlide: {
    name: "poolSlide",
    image: IMAGE_PATHS.poolSlide,
    back: "playgroundSlide",
    hotspots: [
      { rect: { left: "8%", top: "20%", width: "28%", height: "55%" }, action: "slide" },
      { rect: { left: "38%", top: "30%", width: "28%", height: "40%" }, go: "yellowDuck" },
      { rect: { left: "72%", top: "25%", width: "22%", height: "50%" }, action: "poolside" },
    ],
  },

  yellowDuck: {
    name: "yellowDuck",
    image: IMAGE_PATHS.yellowDuck,
    back: "poolSlide",
    hotspots: [
      { rect: { left: "36%", top: "35%", width: "30%", height: "35%" }, action: "duck" },
    ],
  },

  exit: {
    name: "exit",
    image: IMAGE_PATHS.exit,
    back: null,
    hotspots: [
      { rect: { left: "38%", top: "28%", width: "28%", height: "50%" }, action: "door" },
    ],
  },
};

/* ---------- 六、模块级运行时状态（不入 gameState） ---------- */
let endingSteps = [];
let endingStepIndex = -1;
let mentalPromptShown = false;
let messageTimer = null;
let doorTriggered = false;
let seqToken = 0;

// 密码输入与小游戏状态
let activeMiniGame = null;   // 当前小游戏 id
let passwordMode = false;    // 是否处于密码输入模式
let vendingInput = "";       // 密码输入
let noteRevealed = false;    // 塑料球下的纸条是否已翻开
// 迷宫
let mazePos = { r: 0, c: 0 };
// 记忆排序
let ticketOrder = [];
let ticketSelected = null;
// 反应记忆
let machineSequence = [];
let machineStep = 0;
let machinePhase = "watch";  // "watch" 闪烁中 | "repeat" 玩家重复中
let machineTimer = null;
let humorTimer = null;       // 幽默小字自动隐藏计时器
let poolHumorShown = false;  // 滑梯水池幽默是否已显示

/* ---------- 七、音频系统（Web Audio 实时合成） ---------- */
const audio = {
  ctx: null,
  master: null,
  sfxGain: null,
  musicGain: null,
  musicFilter: null,
  musicBus: null,
  reverb: null,
  reverbWet: null,
  reverbSend: null,
  musicOn: false,
  droneNodes: [],
  padTimer: null,
  arpTimer: null,
  crackleTimer: null,
  chordIndex: 0,
  currentChord: [],
};

// 梦核风和弦进行（小调 / add9 / 大七，缓慢漂浮）
const CHORDS = [
  [110.00, 164.81, 261.63, 329.63, 493.88], // Am(add9)
  [87.31, 174.61, 220.00, 261.63, 440.00],  // Fmaj7
  [130.81, 196.00, 261.63, 329.63, 493.88], // Cmaj7
  [98.00, 146.83, 246.94, 293.66, 440.00],  // Gsus2
];

/* ---------- 八、DOM 引用 ---------- */
const $ = (id) => document.getElementById(id);
const sceneContainer = $("scene-container");
const sceneImage = $("scene-image");
const hotspotLayer = $("hotspot-layer");
const eggLayer = $("egg-layer");
const clockDisplay = $("clock-display");
const backButton = $("back-button");
const restartButton = $("restart-button");
const soundButton = $("sound-button");
const debugButton = $("debug-button");
const inventoryIndicator = $("inventory-indicator");
const eggIndicator = $("egg-indicator");
const subtitle = $("subtitle");
const subtitleSub = $("subtitle-sub");
const overlay = $("overlay");
const overlayText = $("overlay-text");
const overlaySmall = $("overlay-small");
const overlayImage = $("overlay-image");
const overlayCaption = $("overlay-caption");
const gameOverBadge = $("game-over-badge");
const dimOverlay = $("dim-overlay");
const alertModal = $("alert-modal");
const alertText = $("alert-text");
const glitchTextEl = $("glitch-text");
const miniGameOverlay = $("mini-game-overlay");
const miniGameTitle = $("mini-game-title");
const miniGamePrompt = $("mini-game-prompt");
const miniGameBody = $("mini-game-body");
const miniGameMessage = $("mini-game-message");
const miniGameClose = $("mini-game-close");
const humorText = $("humor-text");

/* ============================================================
   九、核心游戏逻辑
   ============================================================ */

function enterScene(sceneName) {
  if (!SCENES[sceneName]) return;

  seqToken++;
  gameState.previousScene = gameState.currentScene;
  gameState.currentScene = sceneName;
  gameState.visitCount[sceneName] = (gameState.visitCount[sceneName] || 0) + 1;

  renderScene();
  onSceneEnter(sceneName);
}

function renderScene() {
  const scene = SCENES[gameState.currentScene];

  sceneImage.src = scene.image;
  sceneImage.alt = scene.name;
  sceneImage.onerror = () => {
    showMessage(storyText.imageError + scene.image, { duration: 6000 });
  };

  sceneContainer.classList.remove("hidden");
  sceneContainer.classList.remove("visible");
  void sceneContainer.offsetWidth;
  sceneContainer.classList.add("visible");

  addHotspots(scene);
  renderEggs(gameState.currentScene);

  // 时钟显示（仅开局界面）
  if (gameState.currentScene === "start") {
    clockDisplay.classList.remove("hidden");
    updateClockDisplay();
  } else {
    clockDisplay.classList.add("hidden");
  }

  if (scene.back) {
    backButton.classList.remove("hidden");
  } else {
    backButton.classList.add("hidden");
  }

  updateInventory();
  updateEggIndicator();
  updateShadowExtra();

  subtitle.classList.remove("visible");
  subtitleSub.classList.remove("visible");
  glitchTextEl.classList.remove("active");
}

function addHotspots(scene) {
  hotspotLayer.innerHTML = "";
  (scene.hotspots || []).forEach((h) => {
    const el = document.createElement("div");
    el.className = "hotspot";
    const r = h.rect;
    el.style.left = r.left;
    el.style.top = r.top;
    el.style.width = r.width;
    el.style.height = r.height;
    el.dataset.label = h.go || h.action || "";

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (activeMiniGame || passwordMode) return; // 小游戏/密码输入时暂停场景热点
      if (gameState.gameOver) return;

      if (h.go) {
        playNavSound();
        enterScene(h.go);
      } else if (h.action) {
        handleAction(scene.name, h.action);
      }
    });

    hotspotLayer.appendChild(el);
  });
}

function handleAction(sceneName, action) {
  switch (action) {
    case "clock":
      handleClock();
      break;

    case "vending": {
      if (gameState.completedMiniGames.includes("machineMemory")) {
        showMessage(storyText.vendingMachine.solved);
        break;
      }
      if (gameState.clockClicks < 2) {
        showSequence(storyText.vendingMachine.refuse, { interval: 1700, duration: 1600 });
        break;
      }
      // 时钟已两次：首次触发售货机异常，之后进入密码
      if (!gameState.triggeredAnomalies.includes("vending-machine")) {
        showHumor(storyText.humor.vendingBefore, 800);
        showSequence(
          [storyText.vendingMachine.click],
          {
            interval: 1700,
            duration: 1600,
            onDone: () => {
              if (triggerAnomaly("vending-machine", storyText.vendingMachine.anomaly, { sub: storyText.vendingMachine.anomalySub })) {
                shakeScreen("hard");
                playVendingBeep();
                showHumor(storyText.humor.vendingAnomaly, 800);
              }
            },
          }
        );
        break;
      }
      if (!gameState.passwordSolved) {
        showHumor(storyText.humor.vendingBeforePassword, 600);
        openPasswordEntry();
        break;
      }
      openMiniGame("machineMemory");
      break;
    }

    case "exit-sign":
      if (gameState.triggeredAnomalies.includes("exit-sign")) break;
      shakeScreen("light");
      flashGlitchText("故障");
      showSequence(
        [storyText.plasticBall.click],
        {
          interval: 1700,
          duration: 1600,
          onDone: () => {
            triggerAnomaly("exit-sign", storyText.plasticBall.anomaly);
            showHumor(storyText.humor.ballAnomaly, 1000);
          },
        }
      );
      break;

    case "pool":
      playNavSound();
      if (!poolHumorShown) {
        poolHumorShown = true;
        showHumor(storyText.humor.slidePool, 1000);
      }
      showSequence(
        [storyText.playgroundSlide.pool],
        { interval: 1900, duration: 1800, onDone: () => enterScene("poolSlide") }
      );
      break;

    case "slide":
      if (triggerAnomaly("pool-slide", storyText.poolSlide.slideAnomaly, { sub: storyText.poolSlide.slideSub })) {
        shakeScreen("light");
        playAnomalySound();
        showHumor(storyText.humor.slideFirst, 1200);
      }
      break;

    case "poolside":
      if (gameState.completedMiniGames.includes("ticketOrder")) {
        showMessage(storyText.poolSlide.poolsideDone);
        break;
      }
      openMiniGame("ticketOrder");
      break;

    case "paper":
      if (gameState.completedMiniGames.includes("paperMaze")) {
        showMessage(storyText.plasticBall.paperDone);
        break;
      }
      if (!noteRevealed) {
        noteRevealed = true;
        showSequence(storyText.plasticBall.paperFirst, { interval: 2000, duration: 1900 });
      } else {
        openMiniGame("paperMaze");
      }
      break;

    case "duck":
      playNavSound();
      showSequence(
        storyText.yellowDuck.duck,
        { interval: 1500, duration: 1400, onDone: () => enterScene("exit") }
      );
      break;

    case "door":
      if (doorTriggered || gameState.ending) break;
      doorTriggered = true;
      playClick();
      const doorLines = gameState.inventory.includes("old-ticket")
        ? storyText.exit.doorWithKey
        : storyText.exit.doorWithoutKey;
      showSequence(
        doorLines,
        { interval: 2000, duration: 1900, onDone: checkEnding }
      );
      break;

    default:
      break;
  }
}

function onSceneEnter(sceneName) {
  const visits = gameState.visitCount[sceneName] || 0;

  switch (sceneName) {
    case "start":
      if (visits === 1) {
        showSequence(storyText.start.first, { interval: 2600, duration: 2500 });
        showHumor(storyText.humor.startFirst, 3000);
      } else if (visits >= 2) {
        triggerAnomaly("start-revisit", storyText.start.revisit, { count: false });
        if (gameState.anomalyCount === 0) {
          showHumor(storyText.humor.startReturn, 2000);
        }
      }
      break;

    case "vendingMachine":
      if (visits >= 2) {
        showMessage(storyText.vendingMachine.reenter);
      }
      break;

    case "plasticBall":
      if (visits === 1) {
        showHumor(storyText.humor.ballFirst, 1500);
      } else if (visits >= 2) {
        showMessage(storyText.plasticBall.reenter, { duration: 1800 });
      }
      break;

    case "playgroundSlide":
      if (visits >= 2 && triggerAnomaly("playground-slide", storyText.playgroundSlide.anomaly)) {
        playAnomalySound();
        showHumor(storyText.humor.slideAnomaly, 1200);
      }
      break;

    case "poolSlide":
      if (visits === 1) {
        showHumor(storyText.humor.beforeDuck, 1500);
      }
      break;

    case "yellowDuck":
      if (visits === 1) {
        showMessage(storyText.yellowDuck.first);
        showHumor(storyText.humor.duckFirst, 1200);
      } else if (visits >= 2) {
        if (triggerAnomaly("yellow-duck", storyText.yellowDuck.anomaly, { sub: storyText.yellowDuck.anomalySub })) {
          playAnomalySound();
          showHumor(storyText.humor.duckAnomaly, 1200);
        }
        triggerExtraShadow();
      }
      break;

    case "exit":
      if (visits === 1) {
        showSequence(storyText.exit.enter, { interval: 2400, duration: 2300 });
        showHumor(storyText.humor.nearExit, 2800);
      }
      break;

    default:
      break;
  }

  maybeOccasionalLine();
  maybeRandomHumor();
}

function triggerAnomaly(anomalyId, message, options = {}) {
  const { count = true, sub = "" } = options;

  if (gameState.triggeredAnomalies.includes(anomalyId)) {
    return false;
  }
  gameState.triggeredAnomalies.push(anomalyId);

  if (count) {
    gameState.anomalyCount++;
    maybeMentalDegradation();
  }

  if (message) {
    showMessage(message, { sub, duration: 3600 });
  }

  return true;
}

function showMessage(main, opts) {
  let duration = 3200;
  let sub = "";
  if (typeof opts === "number") {
    duration = opts;
  } else if (opts && typeof opts === "object") {
    duration = opts.duration || 3200;
    sub = opts.sub || "";
  }

  subtitle.textContent = main;
  subtitleSub.textContent = sub;
  subtitle.classList.add("visible");
  if (sub) {
    subtitleSub.classList.add("visible");
  } else {
    subtitleSub.classList.remove("visible");
  }

  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => {
    subtitle.classList.remove("visible");
    subtitleSub.classList.remove("visible");
  }, duration);
}

function showSequence(messages, options = {}) {
  const { interval = 1500, duration = 1400, onDone = null } = options;
  const token = seqToken;
  let i = 0;

  const step = () => {
    if (token !== seqToken) return;
    if (i >= messages.length) {
      if (onDone) onDone();
      return;
    }
    const m = messages[i++];
    if (typeof m === "string") {
      showMessage(m, { duration });
    } else {
      showMessage(m.text || "", { sub: m.sub || "", duration });
    }
    setTimeout(step, interval);
  };

  step();
}

/* 显示右下角幽默小字（可带延迟，短暂出现后自动隐藏） */
function showHumor(text, delay = 0) {
  if (!humorText || !text) return;
  const fire = () => {
    humorText.textContent = text;
    humorText.classList.add("visible");
    clearTimeout(humorTimer);
    humorTimer = setTimeout(() => humorText.classList.remove("visible"), 4500);
  };
  if (delay > 0) {
    setTimeout(fire, delay);
  } else {
    fire();
  }
}

/* 场景进入时偶尔出现的随机一言 */
function maybeRandomHumor() {
  if (Math.random() > 0.3) return;
  const pool = storyText.humor.random;
  showHumor(pool[Math.floor(Math.random() * pool.length)], 1200);
}

function maybeOccasionalLine() {
  if (!mentalPromptShown) return;
  if (Math.random() > 0.22) return;
  const sceneAtCall = gameState.currentScene;
  const line = storyText.occasional[Math.floor(Math.random() * storyText.occasional.length)];
  setTimeout(() => {
    if (gameState.currentScene === sceneAtCall && !gameState.gameOver) {
      showMessage(line, { duration: 2200 });
    }
  }, 4200);
}

function flashGlitchText(text) {
  glitchTextEl.textContent = text;
  glitchTextEl.classList.add("active");
  clearTimeout(flashGlitchText._timer);
  flashGlitchText._timer = setTimeout(() => {
    glitchTextEl.classList.remove("active");
  }, 1200);
}

function shakeScreen(intensity) {
  sceneContainer.classList.remove("shake", "shake-hard");
  void sceneContainer.offsetWidth;
  sceneContainer.classList.add(intensity === "hard" ? "shake-hard" : "shake");
  setTimeout(() => {
    sceneContainer.classList.remove("shake", "shake-hard");
  }, 700);
}

function maybeMentalDegradation() {
  if (mentalPromptShown) return;
  if (gameState.anomalyCount !== gameState.anomalyLimit) return;

  mentalPromptShown = true;
  alertText.textContent = storyText.mental.alert;
  alertModal.classList.remove("hidden");
  dimOverlay.classList.remove("hidden");
  $("game").classList.add("glitching");

  setTimeout(() => {
    alertModal.classList.add("hidden");
    dimOverlay.classList.add("hidden");
    $("game").classList.remove("glitching");
    showSequence(storyText.mental.after, { interval: 2200, duration: 2100 });
  }, 2600);
}

function triggerExtraShadow() {
  if (gameState.triggeredAnomalies.includes("shadow-extra")) return;
  gameState.triggeredAnomalies.push("shadow-extra");
  updateShadowExtra();
}

function updateShadowExtra() {
  const el = $("shadow-extra");
  if (gameState.currentScene === "yellowDuck" && gameState.triggeredAnomalies.includes("shadow-extra")) {
    el.classList.remove("hidden");
  } else {
    el.classList.add("hidden");
  }
}

/* ============================================================
   十、时钟密码 / 彩蛋 / 道具
   ============================================================ */

/* 更新时钟显示：未点击为 03:16，点击过为 03:17 */
function updateClockDisplay() {
  if (!clockDisplay) return;
  clockDisplay.textContent = gameState.clockClicks === 0 ? "03:16" : "03:17";
}

/* 点击开局时钟 */
function handleClock() {
  playClick();
  if (gameState.clockClicks >= 2) return; // 已解锁，不再变化

  if (gameState.clockClicks === 0) {
    gameState.clockClicks = 1;
    updateClockDisplay();
    showMessage(storyText.start.clockFirst);
    showHumor(storyText.humor.clockFirst, 900);
  } else {
    gameState.clockClicks = 2;
    if (clockDisplay) clockDisplay.textContent = "03:18";
    setTimeout(() => { if (clockDisplay) clockDisplay.textContent = "03:17"; }, 900);
    triggerAnomaly("clock-time");
    showSequence(storyText.start.clockSecond, { interval: 2400, duration: 2300 });
    showHumor(storyText.humor.clockSecond, 2600);
  }
}

/* 打开售货机密码输入 */
function openPasswordEntry() {
  passwordMode = true;
  vendingInput = "";
  miniGameTitle.textContent = storyText.password.title;
  miniGamePrompt.textContent = storyText.password.prompt;
  miniGameMessage.textContent = "";
  miniGameBody.innerHTML = "";

  const display = document.createElement("div");
  display.className = "vending-display";
  display.id = "vending-display";
  miniGameBody.appendChild(display);
  updateVendingDisplay();

  const keypad = document.createElement("div");
  keypad.className = "vending-keypad";
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, "清除", 0, "确认"];
  keys.forEach((k) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "vending-key";
    btn.textContent = k;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleVendingKey(k);
    });
    keypad.appendChild(btn);
  });
  miniGameBody.appendChild(keypad);

  miniGameOverlay.classList.remove("hidden");
}

function handleVendingKey(k) {
  if (k === "清除") {
    vendingInput = "";
  } else if (k === "确认") {
    if (vendingInput === VENDING_CODE) {
      gameState.passwordSolved = true;
      closeMiniGame();
      showHumor(storyText.humor.vendingAfterPassword, 500);
      openMiniGame("machineMemory");
      return;
    } else {
      showMiniGameMessage(storyText.password.wrong);
      vendingInput = "";
    }
  } else {
    if (vendingInput.length < 4) vendingInput += String(k);
  }
  updateVendingDisplay();
}

function updateVendingDisplay() {
  const display = document.getElementById("vending-display");
  if (display) display.textContent = (vendingInput + "____").slice(0, 4);
}

/* 渲染当前场景的彩蛋 */
function renderEggs(sceneName) {
  eggLayer.innerHTML = "";
  Object.values(EASTER_EGGS).forEach((egg) => {
    if (egg.scene !== sceneName) return;
    const el = document.createElement("div");
    el.className = "egg";
    el.dataset.egg = egg.id;
    el.style.left = egg.left;
    el.style.top = egg.top;
    el.title = egg.name;

    const icon = document.createElement("span");
    icon.className = "egg-icon";
    icon.textContent = egg.icon;
    el.appendChild(icon);

    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (activeMiniGame || passwordMode) return;
      discoverEasterEgg(egg.id);
    });
    eggLayer.appendChild(el);
  });
}

/* 发现彩蛋（只能一次，不增加 anomalyCount） */
function discoverEasterEgg(eggId) {
  const egg = EASTER_EGGS[eggId];
  if (!egg) return;

  if (gameState.discoveredEasterEggs.includes(eggId)) {
    showMessage(storyText.easterEggs.known);
    return;
  }
  gameState.discoveredEasterEggs.push(eggId);
  updateEggIndicator();

  // 彩蛋幽默（右下角小字，稍后出现）
  const humor = eggHumorFor(eggId);
  if (humor) showHumor(humor, 3400);

  if (gameState.discoveredEasterEggs.length === Object.keys(EASTER_EGGS).length) {
    // 最后一个彩蛋：先显示该彩蛋文字，再显示集齐提示
    showSequence([...egg.text, ...storyText.easterEggs.allFound], { interval: 2400, duration: 2300 });
  } else {
    showSequence(egg.text, { interval: 2400, duration: 2300 });
  }
}

/* 返回某彩蛋对应的幽默文案（无则返回 null） */
function eggHumorFor(eggId) {
  switch (eggId) {
    case "egg-frame":
      return storyText.humor.eggFrame;
    case "egg-speaker":
      return storyText.humor.eggBroadcast.join(" ");
    case "egg-water":
      return storyText.humor.eggWater;
    case "egg-bench":
      return Math.random() < 0.5 ? storyText.humor.benchEgg : storyText.humor.eggBench;
    default:
      return null;
  }
}

/* 更新左下角彩蛋计数 */
function updateEggIndicator() {
  if (!eggIndicator) return;
  eggIndicator.textContent = "fragments: " + gameState.discoveredEasterEggs.length + " / " + Object.keys(EASTER_EGGS).length;
}

/* 获得道具（只能获得一次） */
function collectItem(itemId) {
  const item = itemConfig[itemId];
  if (!item) return;
  if (gameState.inventory.includes(itemId)) return;

  gameState.inventory.push(itemId);
  updateInventory();
  playItemSound();
  showSequence(storyText.items[itemId], { interval: 2000, duration: 1900 });

  // 道具获得后的幽默
  const itemHumor = {
    "wet-note": storyText.humor.noteAfter,
    "old-ticket": storyText.humor.sortAfter,
    "orange-cap": storyText.humor.capAfter,
  };
  if (itemHumor[itemId]) {
    showHumor(itemHumor[itemId], 3000);
  }
}

/* true end 条件：三道具 + 三小游戏 + 时钟两次 + 密码正确 */
function hasAllTrueEndItems() {
  return (
    gameState.inventory.includes("wet-note") &&
    gameState.inventory.includes("old-ticket") &&
    gameState.inventory.includes("orange-cap") &&
    gameState.completedMiniGames.includes("paperMaze") &&
    gameState.completedMiniGames.includes("ticketOrder") &&
    gameState.completedMiniGames.includes("machineMemory") &&
    gameState.clockClicks >= 2 &&
    gameState.passwordSolved
  );
}

function updateInventory() {
  if (!gameState.inventory.length) {
    inventoryIndicator.classList.add("hidden");
    inventoryIndicator.textContent = "";
    return;
  }
  const parts = gameState.inventory.map((id) => (itemConfig[id] ? itemConfig[id].icon + " " + itemConfig[id].name : id));
  inventoryIndicator.textContent = "道具：" + parts.join("　");
  inventoryIndicator.classList.remove("hidden");
}

/* ============================================================
   十一、小游戏系统
   ============================================================ */

function openMiniGame(gameId) {
  if (!MINI_GAMES[gameId]) return;
  // machineMemory 必须已正确输入密码
  if (gameId === "machineMemory" && !gameState.passwordSolved) return;

  activeMiniGame = gameId;
  renderMiniGame(gameId);
  miniGameOverlay.classList.remove("hidden");
}

function closeMiniGame() {
  activeMiniGame = null;
  passwordMode = false;
  clearTimeout(machineTimer);
  miniGameOverlay.classList.add("hidden");
  miniGameBody.innerHTML = "";
}

function completeMiniGame(gameId) {
  if (!gameState.completedMiniGames.includes(gameId)) {
    gameState.completedMiniGames.push(gameId);
  }
}

function showMiniGameMessage(msg) {
  miniGameMessage.textContent = msg;
  miniGameMessage.classList.add("visible");
}

function renderMiniGame(gameId) {
  const g = MINI_GAMES[gameId];
  miniGameTitle.textContent = g.title;
  miniGamePrompt.textContent = g.prompt;
  miniGameMessage.textContent = "";
  miniGameMessage.classList.remove("visible");

  if (gameId === "paperMaze") renderPaperMaze();
  else if (gameId === "ticketOrder") renderTicketOrder();
  else if (gameId === "machineMemory") renderMachineMemory();
}

/* ---------- 小游戏：迷宫（方向键 + 屏幕按钮） ---------- */
function renderPaperMaze() {
  mazePos = { r: 0, c: 0 };
  miniGameBody.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "maze-grid";
  grid.style.gridTemplateColumns = "repeat(" + MAZE[0].length + ", 1fr)";
  MAZE.forEach((row, r) => {
    row.forEach((cell, c) => {
      const el = document.createElement("div");
      el.className = "maze-cell";
      if (cell === 1) el.classList.add("wall");
      if (r === 0 && c === 0) el.classList.add("start");
      if (r === MAZE.length - 1 && c === row.length - 1) el.classList.add("end");
      el.dataset.r = r;
      el.dataset.c = c;
      grid.appendChild(el);
    });
  });
  miniGameBody.appendChild(grid);

  const pad = document.createElement("div");
  pad.className = "maze-pad";
  const dirs = [["↑", -1, 0], ["←", 0, -1], ["→", 0, 1], ["↓", 1, 0]];
  dirs.forEach(([label, dr, dc]) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "maze-btn";
    btn.textContent = label;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      moveMaze(dr, dc);
    });
    pad.appendChild(btn);
  });
  miniGameBody.appendChild(pad);

  updateMazeDot();
}

function moveMaze(dr, dc) {
  const nr = mazePos.r + dr;
  const nc = mazePos.c + dc;
  if (nr < 0 || nc < 0 || nr >= MAZE.length || nc >= MAZE[0].length) {
    showMiniGameMessage(MINI_GAMES.paperMaze.wrong);
    if (Math.random() < 0.25) showHumor(storyText.humor.mazeFail);
    return;
  }
  if (MAZE[nr][nc] === 1) {
    showMiniGameMessage(MINI_GAMES.paperMaze.wrong);
    if (Math.random() < 0.25) showHumor(storyText.humor.mazeFail);
    return;
  }
  mazePos = { r: nr, c: nc };
  updateMazeDot();

  if (nr === MAZE.length - 1 && nc === MAZE[0].length - 1) {
    completeMiniGame("paperMaze");
    closeMiniGame();
    collectItem("wet-note");
  }
}

function updateMazeDot() {
  miniGameBody.querySelectorAll(".maze-cell").forEach((el) => {
    const r = parseInt(el.dataset.r, 10);
    const c = parseInt(el.dataset.c, 10);
    el.classList.toggle("player", r === mazePos.r && c === mazePos.c);
  });
}

/* ---------- 小游戏：记忆排序（点两张卡片交换） ---------- */
function renderTicketOrder() {
  const g = MINI_GAMES.ticketOrder;
  ticketOrder = shuffle([0, 1, 2, 3]);
  ticketSelected = null;
  miniGameBody.innerHTML = "";

  const list = document.createElement("div");
  list.className = "ticket-list";
  ticketOrder.forEach((origIndex, slot) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "ticket-card";
    el.dataset.slot = slot;
    el.textContent = g.fragments[origIndex];
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      selectTicketCard(slot);
    });
    list.appendChild(el);
  });
  miniGameBody.appendChild(list);

  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = "mini-confirm";
  confirm.textContent = "确认";
  confirm.addEventListener("click", (e) => {
    e.stopPropagation();
    checkTicketOrder();
  });
  miniGameBody.appendChild(confirm);

  updateTicketCards();
}

function selectTicketCard(slot) {
  if (ticketSelected === null) {
    ticketSelected = slot;
  } else if (ticketSelected === slot) {
    ticketSelected = null;
  } else {
    [ticketOrder[ticketSelected], ticketOrder[slot]] = [ticketOrder[slot], ticketOrder[ticketSelected]];
    ticketSelected = null;
  }
  updateTicketCards();
}

function updateTicketCards() {
  miniGameBody.querySelectorAll(".ticket-card").forEach((el) => {
    const slot = parseInt(el.dataset.slot, 10);
    el.textContent = MINI_GAMES.ticketOrder.fragments[ticketOrder[slot]];
    el.classList.toggle("selected", slot === ticketSelected);
  });
}

function checkTicketOrder() {
  if (ticketOrder.every((orig, slot) => orig === slot)) {
    completeMiniGame("ticketOrder");
    closeMiniGame();
    collectItem("old-ticket");
  } else {
    showMiniGameMessage(MINI_GAMES.ticketOrder.wrong);
    showHumor(storyText.humor.sortFail);
  }
}

/* ---------- 小游戏：反应记忆（记符号顺序并重复） ---------- */
function renderMachineMemory() {
  const g = MINI_GAMES.machineMemory;
  machineSequence = shuffle([0, 1, 2, 3]);
  machineStep = 0;
  machinePhase = "watch";
  clearTimeout(machineTimer);

  miniGameBody.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "machine-grid";
  g.symbols.forEach((sym, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "machine-btn";
    btn.dataset.index = i;
    btn.textContent = sym;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleMachineClick(i);
    });
    grid.appendChild(btn);
  });
  miniGameBody.appendChild(grid);

  playMachineSequence();
}

function playMachineSequence() {
  const n = machineSequence.length;
  machineSequence.forEach((symIdx, step) => {
    setTimeout(() => highlightMachineButton(symIdx), 600 * (step + 1));
  });
  setTimeout(() => {
    clearMachineHighlights();
    machineStep = 0;
    machinePhase = "repeat";
    startMachineTimer();
  }, 600 * (n + 1));
}

function highlightMachineButton(idx) {
  miniGameBody.querySelectorAll(".machine-btn").forEach((el) => {
    el.classList.toggle("flash", parseInt(el.dataset.index, 10) === idx);
  });
}

function clearMachineHighlights() {
  miniGameBody.querySelectorAll(".machine-btn").forEach((el) => el.classList.remove("flash"));
}

function startMachineTimer() {
  clearTimeout(machineTimer);
  machineTimer = setTimeout(() => {
    // 超时
    showMiniGameMessage(MINI_GAMES.machineMemory.wrong);
    renderMachineMemory();
  }, 8000);
}

function handleMachineClick(idx) {
  if (machinePhase !== "repeat") return;
  if (machineStep >= machineSequence.length) return;

  if (idx === machineSequence[machineStep]) {
    machineStep++;
    if (machineStep === machineSequence.length) {
      clearTimeout(machineTimer);
      completeMiniGame("machineMemory");
      closeMiniGame();
      collectItem("orange-cap");
    }
  } else {
    clearTimeout(machineTimer);
    showMiniGameMessage(MINI_GAMES.machineMemory.wrong);
    renderMachineMemory();
  }
}

/* ---------- 洗牌工具 ---------- */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (a.length > 1 && a.every((v, i) => v === i)) {
    [a[0], a[1]] = [a[1], a[0]];
  }
  return a;
}

/* ============================================================
   十二、结局流程
   ============================================================ */

function checkEnding() {
  if (gameState.gameOver || gameState.ending) return;

  const E = storyText.endings;

  if (gameState.anomalyCount >= gameState.anomalyLimit) {
    gameState.ending = "bad";
    showHumor(storyText.humor.badBefore, 800);
    beginEndingSequence([
      { type: "text", lines: E.bad.pre },
      { type: "text", lines: [E.bad.english], english: true },
      { type: "image", image: IMAGE_PATHS.badEnding, caption: E.bad.caption },
      { type: "final", lines: E.bad.final },
    ]);
  } else if (gameState.inventory.includes("old-ticket")) {
    gameState.ending = "good";
    showHumor(storyText.humor.goodBefore, 800);
    const steps = [
      { type: "text", lines: E.good.pre },
      { type: "text", lines: [E.good.english], english: true },
      { type: "image", image: IMAGE_PATHS.goodEnding, caption: E.good.caption },
    ];
    if (hasAllTrueEndItems()) {
      steps.push(
        { type: "text", lines: E.good.trueEntry },
        { type: "text", lines: E.good.trueEnd1 },
        { type: "text", lines: E.good.trueEnd2 },
        { type: "final", title: E.good.trueEndTitle, lines: [...E.good.trueEnd3, storyText.humor.trueEndAfter] }
      );
    } else {
      steps.push(
        { type: "text", lines: E.good.incomplete },
        { type: "final", lines: E.good.incompleteFinal }
      );
    }
    beginEndingSequence(steps);
  } else {
    gameState.ending = "normal";
    showHumor(storyText.humor.normalBefore, 800);
    beginEndingSequence([
      { type: "text", lines: E.normal.pre },
      { type: "text", lines: [E.normal.english], english: true },
      { type: "image", image: IMAGE_PATHS.normalEnding, caption: E.normal.caption },
      { type: "final", lines: E.normal.final },
    ]);
  }
}

function beginEndingSequence(steps) {
  endingSteps = steps;
  endingStepIndex = -1;

  sceneContainer.classList.add("hidden");
  backButton.classList.add("hidden");
  subtitle.classList.remove("visible");
  subtitleSub.classList.remove("visible");
  glitchTextEl.classList.remove("active");

  overlay.classList.remove("hidden");
  advanceEnding();
}

function renderEndingStep() {
  const step = endingSteps[endingStepIndex];
  overlayText.classList.add("hidden");
  overlaySmall.classList.add("hidden");
  overlayImage.classList.add("hidden");
  overlayCaption.classList.add("hidden");

  if (step.type === "text") {
    overlayText.textContent = step.lines.join("\n");
    overlayText.classList.toggle("en", !!step.english);
    overlayText.classList.remove("hidden");
  } else if (step.type === "image") {
    overlayImage.src = step.image;
    overlayImage.onerror = () => {
      overlayText.textContent = storyText.imageError + step.image;
      overlayText.classList.remove("hidden");
      overlayImage.classList.add("hidden");
    };
    overlayImage.classList.remove("hidden");
    if (step.caption && step.caption.length) {
      overlayCaption.textContent = step.caption.join("\n");
      overlayCaption.classList.remove("hidden");
    }
  } else if (step.type === "final") {
    if (step.title) {
      overlayText.textContent = step.title;
      overlayText.classList.remove("en");
      overlayText.classList.remove("hidden");
    }
    if (step.lines && step.lines.length) {
      overlaySmall.textContent = step.lines.join("\n");
      overlaySmall.classList.remove("hidden");
    }
  }

  if (endingStepIndex === endingSteps.length - 1) {
    setGameOver();
  }
}

function advanceEnding() {
  endingStepIndex++;
  if (endingStepIndex >= endingSteps.length) {
    setGameOver();
    return;
  }
  renderEndingStep();
}

function setGameOver() {
  gameState.gameOver = true;
  gameOverBadge.classList.remove("hidden");
}

function goBack() {
  if (gameState.gameOver) return;
  const scene = SCENES[gameState.currentScene];
  if (scene && scene.back) {
    enterScene(scene.back);
  }
}

function restartGame() {
  gameState.currentScene = "start";
  gameState.previousScene = null;
  gameState.visitCount = {};
  gameState.anomalyCount = 0;
  gameState.triggeredAnomalies = [];
  gameState.inventory = [];
  gameState.completedMiniGames = [];
  gameState.clockClicks = 0;
  gameState.passwordSolved = false;
  gameState.discoveredEasterEggs = [];
  gameState.ending = null;
  gameState.gameOver = false;

  endingSteps = [];
  endingStepIndex = -1;
  mentalPromptShown = false;
  doorTriggered = false;

  activeMiniGame = null;
  passwordMode = false;
  vendingInput = "";
  noteRevealed = false;
  poolHumorShown = false;
  clearTimeout(humorTimer);
  humorTimer = null;
  if (humorText) humorText.classList.remove("visible");
  mazePos = { r: 0, c: 0 };
  ticketOrder = [];
  ticketSelected = null;
  machineSequence = [];
  machineStep = 0;
  machinePhase = "watch";
  clearTimeout(machineTimer);
  machineTimer = null;

  overlay.classList.add("hidden");
  overlayText.classList.add("hidden");
  overlaySmall.classList.add("hidden");
  overlayImage.classList.add("hidden");
  overlayCaption.classList.add("hidden");
  gameOverBadge.classList.add("hidden");
  alertModal.classList.add("hidden");
  dimOverlay.classList.add("hidden");
  $("game").classList.remove("glitching");
  sceneContainer.classList.remove("hidden", "shake", "shake-hard");
  subtitle.classList.remove("visible");
  subtitleSub.classList.remove("visible");
  glitchTextEl.classList.remove("active");
  miniGameOverlay.classList.add("hidden");
  miniGameBody.innerHTML = "";

  updateInventory();
  updateEggIndicator();

  enterScene("start");
}

/* ============================================================
   十三、音频实现
   ============================================================ */

function ensureAudio() {
  if (audio.ctx) {
    if (audio.ctx.state === "suspended") {
      audio.ctx.resume();
    }
    return;
  }

  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;

  audio.ctx = new Ctx();
  initMusicGraph();
  startMusic();
  updateSoundButton();
}

function initMusicGraph() {
  const ctx = audio.ctx;

  audio.master = ctx.createGain();
  audio.master.gain.value = 1;
  audio.master.connect(ctx.destination);

  audio.sfxGain = ctx.createGain();
  audio.sfxGain.gain.value = 1;
  audio.sfxGain.connect(audio.master);

  audio.musicGain = ctx.createGain();
  audio.musicGain.gain.value = 0.9;

  audio.musicFilter = ctx.createBiquadFilter();
  audio.musicFilter.type = "lowpass";
  audio.musicFilter.frequency.value = 3200;
  audio.musicGain.connect(audio.musicFilter);
  audio.musicFilter.connect(audio.master);

  audio.reverb = ctx.createConvolver();
  audio.reverb.buffer = createImpulse(ctx, 3.0, 2.8);
  audio.reverbWet = ctx.createGain();
  audio.reverbWet.gain.value = 0.5;
  audio.reverb.connect(audio.reverbWet);
  audio.reverbWet.connect(audio.musicGain);

  audio.reverbSend = ctx.createGain();
  audio.reverbSend.gain.value = 1;
  audio.reverbSend.connect(audio.reverb);

  audio.musicBus = ctx.createGain();
  audio.musicBus.gain.value = 1;
  audio.musicBus.connect(audio.musicGain);
}

function createImpulse(ctx, duration, decay) {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * duration);
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return impulse;
}

function startMusic() {
  if (!audio.ctx || audio.musicOn) return;
  audio.musicOn = true;

  startDrone();
  scheduleChord(0);
  scheduleArp();
  scheduleCrackle();
}

function stopMusic() {
  audio.musicOn = false;
  clearTimeout(audio.padTimer);
  clearTimeout(audio.arpTimer);
  clearTimeout(audio.crackleTimer);
  audio.droneNodes.forEach(({ osc }) => {
    try { osc.stop(); } catch (e) {}
  });
  audio.droneNodes = [];
}

function startDrone() {
  const ctx = audio.ctx;
  [[55, 0.05], [110, 0.03]].forEach(([freq, gain]) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.value = gain;
    osc.connect(g);
    g.connect(audio.musicBus);
    g.connect(audio.reverbSend);
    osc.start();
    audio.droneNodes.push({ osc, g });
  });
}

function scheduleChord(index) {
  if (!audio.musicOn) return;
  const chord = CHORDS[index % CHORDS.length];
  audio.currentChord = chord;
  playPad(chord);
  audio.chordIndex = index + 1;
  audio.padTimer = setTimeout(() => scheduleChord(index + 1), 8000);
}

function playPad(chord) {
  if (!audio.ctx) return;
  const t = audio.ctx.currentTime;
  const dur = 9;
  const voices = [0, 2, 3, 4];

  voices.forEach((idx, i) => {
    const osc = audio.ctx.createOscillator();
    const g = audio.ctx.createGain();
    const lp = audio.ctx.createBiquadFilter();

    osc.type = idx === 0 ? "sine" : "triangle";
    osc.frequency.value = chord[idx];
    osc.detune.value = i % 2 === 0 ? -4 : 4;

    lp.type = "lowpass";
    lp.frequency.value = 900;

    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.06, t + 3.5);
    g.gain.linearRampToValueAtTime(0.0001, t + dur);

    osc.connect(lp);
    lp.connect(g);
    g.connect(audio.musicBus);
    g.connect(audio.reverbSend);
    osc.start(t);
    osc.stop(t + dur + 0.1);
  });
}

function scheduleArp() {
  if (!audio.musicOn) return;
  const chord = audio.currentChord.length ? audio.currentChord : CHORDS[0];
  const note = chord[2 + Math.floor(Math.random() * (chord.length - 2))];
  playBell(note * 2);
  audio.arpTimer = setTimeout(scheduleArp, 900 + Math.random() * 1400);
}

function playBell(freq) {
  if (!audio.ctx) return;
  const t = audio.ctx.currentTime;
  const osc = audio.ctx.createOscillator();
  const osc2 = audio.ctx.createOscillator();
  const g = audio.ctx.createGain();
  const g2 = audio.ctx.createGain();

  osc.type = "sine";
  osc.frequency.value = freq;
  osc2.type = "sine";
  osc2.frequency.value = freq * 2.01;

  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.05, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
  g2.gain.value = 0.35;

  osc.connect(g);
  osc2.connect(g2);
  g2.connect(g);
  g.connect(audio.reverbSend);
  g.connect(audio.musicBus);

  osc.start(t);
  osc2.start(t);
  osc.stop(t + 2.6);
  osc2.stop(t + 2.6);
}

function scheduleCrackle() {
  if (!audio.musicOn) return;
  if (Math.random() < 0.25) {
    playCracklePop();
  }
  audio.crackleTimer = setTimeout(scheduleCrackle, 180 + Math.random() * 500);
}

function playCracklePop() {
  if (!audio.ctx) return;
  const ctx = audio.ctx;
  const dur = 0.03 + Math.random() * 0.05;
  const src = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  const bp = ctx.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 2000 + Math.random() * 3000;
  const g = ctx.createGain();
  g.gain.value = 0.02;

  src.buffer = buf;
  src.connect(bp);
  bp.connect(g);
  g.connect(audio.musicBus);
  src.start();
}

/* ---------- 音效 ---------- */

function playTone(opts = {}) {
  if (!audio.ctx) return;
  const ctx = audio.ctx;
  const t = ctx.currentTime;
  const { freq = 440, type = "sine", duration = 0.2, gain = 0.1, glideTo = null, detune = 0 } = opts;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + duration);
  osc.detune.value = detune;

  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  osc.connect(g);
  g.connect(audio.sfxGain);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

function playNoise(opts = {}) {
  if (!audio.ctx) return;
  const ctx = audio.ctx;
  const t = ctx.currentTime;
  const { duration = 0.1, gain = 0.05, filterFreq = 2000, filterType = "bandpass" } = opts;

  const src = ctx.createBufferSource();
  const len = Math.floor(ctx.sampleRate * duration);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  }
  const f = ctx.createBiquadFilter();
  f.type = filterType;
  f.frequency.value = filterFreq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);

  src.buffer = buf;
  src.connect(f);
  f.connect(g);
  g.connect(audio.sfxGain);
  src.start(t);
}

function playClick() {
  playTone({ freq: 1600, type: "triangle", duration: 0.07, gain: 0.06 });
  playTone({ freq: 2400, type: "sine", duration: 0.04, gain: 0.03 });
}

function playNavSound() {
  playTone({ freq: 880, type: "sine", duration: 0.12, gain: 0.06 });
  playTone({ freq: 1320, type: "sine", duration: 0.1, gain: 0.04 });
}

function playAnomalySound() {
  playTone({ freq: 300, type: "sawtooth", duration: 0.4, gain: 0.06, glideTo: 120 });
  playTone({ freq: 305, type: "square", duration: 0.35, gain: 0.03, glideTo: 125 });
  playNoise({ duration: 0.15, gain: 0.03, filterFreq: 800 });
}

function playVendingBeep() {
  playTone({ freq: 200, type: "square", duration: 0.25, gain: 0.08 });
}

function playItemSound() {
  playTone({ freq: 523.25, type: "sine", duration: 0.3, gain: 0.08 });
  setTimeout(() => playTone({ freq: 783.99, type: "sine", duration: 0.35, gain: 0.08 }), 120);
}

function toggleSound() {
  ensureAudio();
  if (!audio.ctx) return;
  if (audio.master.gain.value > 0.001) {
    audio.master.gain.value = 0;
  } else {
    audio.master.gain.value = 1;
  }
  updateSoundButton();
}

function updateSoundButton() {
  if (!soundButton) return;
  const muted = audio.ctx && audio.master && audio.master.gain.value <= 0.001;
  soundButton.textContent = muted ? "声音：关" : "声音：开";
}

/* ============================================================
   十四、事件绑定与初始化
   ============================================================ */

function init() {
  backButton.addEventListener("click", (e) => {
    e.stopPropagation();
    playClick();
    goBack();
  });

  restartButton.addEventListener("click", (e) => {
    e.stopPropagation();
    playClick();
    restartGame();
  });

  soundButton.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSound();
  });

  debugButton.addEventListener("click", (e) => {
    e.stopPropagation();
    playClick();
    document.body.classList.toggle("debug-mode");
  });

  overlay.addEventListener("click", () => {
    if (gameState.ending && !gameState.gameOver) {
      playClick();
      advanceEnding();
    }
  });

  miniGameOverlay.addEventListener("click", (e) => e.stopPropagation());
  miniGameClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMiniGame();
  });

  // 迷宫方向键
  document.addEventListener("keydown", (e) => {
    if (activeMiniGame !== "paperMaze") return;
    const map = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    if (map[e.key]) {
      e.preventDefault();
      moveMaze(map[e.key][0], map[e.key][1]);
    }
  });

  document.addEventListener("pointerdown", function once() {
    ensureAudio();
    document.removeEventListener("pointerdown", once);
  });

  sceneImage.addEventListener("dragstart", (e) => e.preventDefault());
  overlayImage.addEventListener("dragstart", (e) => e.preventDefault());

  updateInventory();
  updateEggIndicator();
  enterScene("start");
}

init();
