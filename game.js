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

/* ---------- 二、配置对象：密码线索 / 道具 / 小游戏 ---------- */

/* 密码线索（数字按密码 0317 的位置排列） */
const CLUES = {
  "clue-0": { id: "clue-0", digit: "0", position: 0 },
  "clue-3": { id: "clue-3", digit: "3", position: 1 },
  "clue-1": { id: "clue-1", digit: "1", position: 2 },
  "clue-7": { id: "clue-7", digit: "7", position: 3 },
};
const CLUE_IDS = ["clue-0", "clue-3", "clue-1", "clue-7"];
const VENDING_CODE = "0317";

/* 道具（与对应小游戏的映射） */
const itemConfig = {
  "old-ticket": { id: "old-ticket", name: "旧游乐园门票", icon: "🎫", miniGame: "memoryMatch" },
  "orange-cap":  { id: "orange-cap",  name: "橙色汽水瓶盖", icon: "🥤", miniGame: "vendingCode" },
  "wet-note":    { id: "wet-note",    name: "湿掉的寻人纸条", icon: "📜", miniGame: "noteArrange" },
};

/* 小游戏（三种不同的交互方式：翻牌 / 密码输入 / 拖拽排序） */
const MINI_GAMES = {
  memoryMatch: {
    id: "memoryMatch",
    title: "记忆翻牌",
    prompt: "翻开卡片，找出所有相同的图案。",
    wrong: "这段记忆还没有拼完整。",
    itemId: "old-ticket",
    symbols: ["🕒", "🥤", "🎫"], // 3 对图案
  },
  vendingCode: {
    id: "vendingCode",
    title: "自动售货机密码",
    prompt: "输入正确的密码",
    wrong: "这个数字不属于今天。",
    itemId: "orange-cap",
  },
  noteArrange: {
    id: "noteArrange",
    title: "纸条复原",
    prompt: "拖拽文字卡片，还原这句话。",
    wrong: "字迹还没有恢复。",
    itemId: "wet-note",
    fragments: ["如果你看到他，", "请告诉他", "我已经", "回家了。"],
  },
};

/* ---------- 三、剧情文案（独立配置对象，便于修改） ---------- */
const storyText = {
  // 精神降维后，各场景偶尔出现的碎语
  occasional: [
    "请不要再寻找不存在的人。",
    "你已经重复了很多次。",
    "这一次也不会有不同。",
  ],

  start: {
    first: ["欢迎回来。", "我们是不是已经来过这里了？"],
    revisit: "这里…好像和上次不太一样。",
  },

  vendingMachine: {
    click: "机器里还有东西在运转。",
    anomaly: "再点要散架了",
    anomalySub: "它和我一样，只是还没有承认自己坏了。",
    reenter: "刚才售货机里，真的有声音吗？",
    refuse: ["售货机拒绝回应。", "你还不知道它在等待哪个时间。"],
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

  clues: {
    "clue-0": "停在午夜之后。",
    "clue-3": "牌子背面刻着：第三个数字。",
    "clue-1": "水退去以后，地上留下了一个数字。",
    "clue-7": "最后一个数字藏在闭园时间里。",
    allFound: ["所有数字终于拼在了一起。", "0317——那天游乐园停止营业的时间。"],
  },

  items: {
    "old-ticket": ["门票上有两个名字。", "其中一个被水泡开了。", "背面写着：闭园前请牵好身边的人。", "我当时没有牵住。"],
    "orange-cap": ["售货机里没有汽水。", "只有一个被遗忘的瓶盖。", "那天他想喝橙色汽水。", "我说，离开的时候再买。"],
    "wet-note": ["如果你看到他，请告诉他我已经回家了。", "落款的名字，是我的。"],
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
  discoveredClues: [],
  vendingCode: "",
  hasKeyItem: false,
  ending: null,
  gameOver: false
};

/* ---------- 五、场景与热点（对象管理） ---------- */
/* 热点坐标：基于颜色分析 + 构图估算。
   可用右下角「显示热区」按钮在浏览器里核对位置，再回到这里微调。 */
const SCENES = {
  start: {
    name: "start",
    image: IMAGE_PATHS.start,
    back: null,
    hotspots: [
      { rect: { left: "5%", top: "32%", width: "27%", height: "55%" }, go: "vendingMachine" },
      { rect: { left: "36%", top: "32%", width: "27%", height: "55%" }, go: "plasticBall" },
      { rect: { left: "67%", top: "32%", width: "27%", height: "55%" }, go: "playgroundSlide" },
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
      { rect: { left: "6%", top: "74%", width: "20%", height: "16%" }, action: "water-mark" },
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
      { rect: { left: "2%", top: "2%", width: "18%", height: "18%" }, action: "clue-7-corner" },
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
let endingSteps = [];        // 结局步骤序列
let endingStepIndex = -1;    // 当前结局步骤
let mentalPromptShown = false; // 精神降维提示是否已显示
let messageTimer = null;     // 字幕自动隐藏计时器
let doorTriggered = false;   // 出口门是否已点击
let seqToken = 0;            // 字幕序列令牌（切换场景后中止旧序列）

// 新增：小游戏与线索相关运行时状态
let activeMiniGame = null;   // 当前打开的小游戏 id（null 表示关闭）
let duckRevealed = false;    // 小黄鸭是否已点击过（用于揭示角落线索）
let noteRevealed = false;    // 塑料球下的纸条是否已翻开
let vendingInput = "";       // 售货机密码输入
// 记忆翻牌
let matchCards = [];         // [{ value, matched }]，共 6 张
let matchFlipped = [];       // 当前翻开的两张卡的索引
let matchBusy = false;       // 翻回动画期间锁住交互
// 纸条拖拽
let noteOrder = [];          // 当前顺序（片段原始索引数组）
let dragIndex = null;        // 正在拖拽的卡片槽位

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
const backButton = $("back-button");
const restartButton = $("restart-button");
const soundButton = $("sound-button");
const debugButton = $("debug-button");
const inventoryIndicator = $("inventory-indicator");
const cluesIndicator = $("clues-indicator");
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

/* ============================================================
   九、核心游戏逻辑
   ============================================================ */

/* 进入场景 */
function enterScene(sceneName) {
  if (!SCENES[sceneName]) return;

  seqToken++; // 使旧的字幕序列失效
  gameState.previousScene = gameState.currentScene;
  gameState.currentScene = sceneName;

  gameState.visitCount[sceneName] = (gameState.visitCount[sceneName] || 0) + 1;

  renderScene();
  onSceneEnter(sceneName);
}

/* 渲染当前场景 */
function renderScene() {
  const scene = SCENES[gameState.currentScene];

  sceneImage.src = scene.image;
  sceneImage.alt = scene.name;
  sceneImage.onerror = () => {
    showMessage(storyText.imageError + scene.image, { duration: 6000 });
  };

  // 淡入
  sceneContainer.classList.remove("hidden");
  sceneContainer.classList.remove("visible");
  void sceneContainer.offsetWidth;
  sceneContainer.classList.add("visible");

  addHotspots(scene);

  if (scene.back) {
    backButton.classList.remove("hidden");
  } else {
    backButton.classList.add("hidden");
  }

  updateInventory();
  updateCluesIndicator();
  updateShadowExtra();

  subtitle.classList.remove("visible");
  subtitleSub.classList.remove("visible");
  glitchTextEl.classList.remove("active");
}

/* 生成透明热点 */
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
      if (activeMiniGame) return; // 小游戏打开时暂停普通场景热点
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

/* 热点动作分发 */
function handleAction(sceneName, action) {
  switch (action) {
    case "vending": {
      // 已通关：不再回应
      if (gameState.completedMiniGames.includes("vendingCode")) {
        showMessage(storyText.vendingMachine.solved);
        break;
      }
      // 已触发异常：进入密码阶段
      if (gameState.triggeredAnomalies.includes("vending-machine")) {
        if (hasAllClues()) {
          openMiniGame("vendingCode");
        } else {
          showSequence(storyText.vendingMachine.refuse, { interval: 1700, duration: 1600 });
        }
        break;
      }
      // 首次点击：保留原有异常
      showSequence(
        [storyText.vendingMachine.click],
        {
          interval: 1700,
          duration: 1600,
          onDone: () => {
            if (triggerAnomaly("vending-machine", storyText.vendingMachine.anomaly, { sub: storyText.vendingMachine.anomalySub })) {
              shakeScreen("hard");
              playVendingBeep();
            }
          },
        }
      );
      break;
    }

    case "exit-sign": {
      // 已获得线索：不再响应
      if (gameState.discoveredClues.includes("clue-3")) break;
      // 第二次点击：获得线索
      if (gameState.triggeredAnomalies.includes("exit-sign")) {
        discoverClue("clue-3");
        break;
      }
      // 第一次点击：异常
      shakeScreen("light");
      flashGlitchText("故障");
      showSequence(
        [storyText.plasticBall.click],
        {
          interval: 1700,
          duration: 1600,
          onDone: () => {
            triggerAnomaly("exit-sign", storyText.plasticBall.anomaly);
          },
        }
      );
      break;
    }

    case "pool":
      playNavSound();
      showSequence(
        [storyText.playgroundSlide.pool],
        { interval: 1900, duration: 1800, onDone: () => enterScene("poolSlide") }
      );
      break;

    case "slide":
      if (triggerAnomaly("pool-slide", storyText.poolSlide.slideAnomaly, { sub: storyText.poolSlide.slideSub })) {
        shakeScreen("light");
        playAnomalySound();
      }
      break;

    case "poolside":
      if (gameState.completedMiniGames.includes("memoryMatch")) {
        showMessage(storyText.poolSlide.poolsideDone);
        break;
      }
      openMiniGame("memoryMatch");
      break;

    case "paper":
      if (gameState.completedMiniGames.includes("noteArrange")) {
        showMessage(storyText.plasticBall.paperDone);
        break;
      }
      if (!noteRevealed) {
        noteRevealed = true;
        showSequence(storyText.plasticBall.paperFirst, { interval: 2000, duration: 1900 });
      } else {
        openMiniGame("noteArrange");
      }
      break;

    case "clock":
      playClick();
      discoverClue("clue-0");
      break;

    case "water-mark":
      playClick();
      discoverClue("clue-1");
      break;

    case "duck":
      playNavSound();
      if (duckRevealed) {
        enterScene("exit");
      } else {
        duckRevealed = true;
        showSequence(storyText.yellowDuck.duck, { interval: 1500, duration: 1400 });
      }
      break;

    case "clue-7-corner":
      if (!duckRevealed) break; // 未点过小黄鸭，角落无反应
      discoverClue("clue-7");
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

/* 场景进入时的额外逻辑（进入次数、剧情、额外异常） */
function onSceneEnter(sceneName) {
  const visits = gameState.visitCount[sceneName] || 0;

  switch (sceneName) {
    case "start":
      if (visits === 1) {
        showSequence(storyText.start.first, { interval: 2600, duration: 2500 });
      } else if (visits >= 2) {
        triggerAnomaly("start-revisit", storyText.start.revisit, { count: false });
      }
      break;

    case "vendingMachine":
      if (visits >= 2) {
        showMessage(storyText.vendingMachine.reenter);
      }
      break;

    case "plasticBall":
      if (visits >= 2) {
        showMessage(storyText.plasticBall.reenter, { duration: 1800 });
      }
      break;

    case "playgroundSlide":
      if (visits >= 2 && triggerAnomaly("playground-slide", storyText.playgroundSlide.anomaly)) {
        playAnomalySound();
      }
      break;

    case "yellowDuck":
      if (visits === 1) {
        showMessage(storyText.yellowDuck.first);
      } else if (visits >= 2) {
        if (triggerAnomaly("yellow-duck", storyText.yellowDuck.anomaly, { sub: storyText.yellowDuck.anomalySub })) {
          playAnomalySound();
        }
        triggerExtraShadow();
      }
      break;

    case "exit":
      if (visits === 1) {
        showSequence(storyText.exit.enter, { interval: 2400, duration: 2300 });
      }
      break;

    default:
      break;
  }

  maybeOccasionalLine();
}

/* 触发异常：一次性、去重、计数可选、可带小字 */
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

/* 底部字幕（支持一行小字，自动隐藏） */
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

/* 顺序播放多条字幕，可带结束回调；切换场景后自动中止 */
function showSequence(messages, options = {}) {
  const { interval = 1500, duration = 1400, onDone = null } = options;
  const token = seqToken;
  let i = 0;

  const step = () => {
    if (token !== seqToken) return; // 场景已切换，中止
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

/* 精神降维后，偶尔出现的碎语 */
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

/* 短暂故障文字 */
function flashGlitchText(text) {
  glitchTextEl.textContent = text;
  glitchTextEl.classList.add("active");
  clearTimeout(flashGlitchText._timer);
  flashGlitchText._timer = setTimeout(() => {
    glitchTextEl.classList.remove("active");
  }, 1200);
}

/* 画面晃动 */
function shakeScreen(intensity) {
  sceneContainer.classList.remove("shake", "shake-hard");
  void sceneContainer.offsetWidth;
  sceneContainer.classList.add(intensity === "hard" ? "shake-hard" : "shake");
  setTimeout(() => {
    sceneContainer.classList.remove("shake", "shake-hard");
  }, 700);
}

/* 精神降维提示：anomalyCount 第一次达到上限 */
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

/* 额外异常：小黄鸭场景角落「多出来的影子」 */
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
   十、密码线索 / 道具 / 小游戏系统
   ============================================================ */

/* 发现一条密码线索（同一线索只能获得一次，不增加 anomalyCount） */
function discoverClue(clueId) {
  const clue = CLUES[clueId];
  if (!clue) return;
  if (gameState.discoveredClues.includes(clueId)) return;

  gameState.discoveredClues.push(clueId);
  updateCluesIndicator();

  if (hasAllClues()) {
    gameState.vendingCode = VENDING_CODE;
    showSequence(
      [storyText.clues[clueId], ...storyText.clues.allFound],
      { interval: 2400, duration: 2300 }
    );
  } else {
    showMessage(storyText.clues[clueId], { duration: 2800 });
  }
}

/* 是否集齐四条密码线索 */
function hasAllClues() {
  return CLUE_IDS.every((id) => gameState.discoveredClues.includes(id));
}

/* 获得道具（只能获得一次） */
function collectItem(itemId) {
  const item = itemConfig[itemId];
  if (!item) return;
  if (gameState.inventory.includes(itemId)) return;

  gameState.inventory.push(itemId);
  if (itemId === "old-ticket") gameState.hasKeyItem = true; // 兼容旧字段
  updateInventory();
  playItemSound();
  showSequence(storyText.items[itemId], { interval: 2000, duration: 1900 });
}

/* true end 所需三件道具 + 三个小游戏 + 四条线索是否全部完成 */
function hasAllTrueEndItems() {
  return (
    gameState.inventory.includes("old-ticket") &&
    gameState.inventory.includes("orange-cap") &&
    gameState.inventory.includes("wet-note") &&
    gameState.completedMiniGames.includes("memoryMatch") &&
    gameState.completedMiniGames.includes("vendingCode") &&
    gameState.completedMiniGames.includes("noteArrange") &&
    hasAllClues()
  );
}

/* 更新左下角道具显示 */
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

/* 更新左下角密码线索显示（未发现的显示 ?） */
function updateCluesIndicator() {
  const slots = ["?", "?", "?", "?"];
  Object.values(CLUES).forEach((c) => {
    if (gameState.discoveredClues.includes(c.id)) slots[c.position] = c.digit;
  });
  cluesIndicator.textContent = "密码线索：" + slots.join(" ");
  cluesIndicator.classList.toggle("hidden", gameState.discoveredClues.length === 0);
}

/* ---------- 小游戏开关 ---------- */
function openMiniGame(gameId) {
  if (!MINI_GAMES[gameId]) return;
  // vendingCode 必须要求线索齐全
  if (gameId === "vendingCode" && !hasAllClues()) return;

  activeMiniGame = gameId;
  renderMiniGame(gameId);
  miniGameOverlay.classList.remove("hidden");
}

function closeMiniGame() {
  activeMiniGame = null;
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

  if (gameId === "memoryMatch") renderMemoryMatch();
  else if (gameId === "vendingCode") renderVendingCode();
  else if (gameId === "noteArrange") renderNoteArrange();
}

/* ---------- 小游戏：自动售货机密码（数字键盘输入） ---------- */
function renderVendingCode() {
  vendingInput = "";
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
}

function handleVendingKey(k) {
  if (k === "清除") {
    vendingInput = "";
  } else if (k === "确认") {
    if (vendingInput === gameState.vendingCode) {
      completeMiniGame("vendingCode");
      closeMiniGame();
      collectItem("orange-cap");
      return;
    } else {
      showMiniGameMessage(MINI_GAMES.vendingCode.wrong);
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

/* ---------- 小游戏：记忆翻牌 ---------- */
function renderMemoryMatch() {
  const g = MINI_GAMES.memoryMatch;
  // 生成 3 对共 6 张牌并洗牌
  const deck = [];
  g.symbols.forEach((_, v) => { deck.push(v); deck.push(v); });
  const order = shuffle(deck);
  matchCards = order.map((v) => ({ value: v, matched: false }));
  matchFlipped = [];
  matchBusy = false;

  miniGameBody.innerHTML = "";
  const grid = document.createElement("div");
  grid.className = "match-grid";

  matchCards.forEach((card, i) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "match-card";
    el.dataset.index = i;
    el.textContent = "?";
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      flipMatchCard(i);
    });
    grid.appendChild(el);
  });
  miniGameBody.appendChild(grid);

  // 重新开始（不能跳过）
  const restart = document.createElement("button");
  restart.type = "button";
  restart.className = "mini-restart";
  restart.textContent = "重新开始";
  restart.addEventListener("click", (e) => {
    e.stopPropagation();
    renderMemoryMatch();
  });
  miniGameBody.appendChild(restart);
}

function flipMatchCard(i) {
  if (matchBusy) return;
  const card = matchCards[i];
  if (card.matched) return;
  if (matchFlipped.includes(i)) return;
  if (matchFlipped.length >= 2) return;

  matchFlipped.push(i);
  updateMatchCard(i);

  if (matchFlipped.length === 2) {
    const [a, b] = matchFlipped;
    if (matchCards[a].value === matchCards[b].value) {
      // 配对成功
      matchCards[a].matched = true;
      matchCards[b].matched = true;
      matchFlipped = [];
      updateMatchCard(a);
      updateMatchCard(b);
      if (matchCards.every((c) => c.matched)) {
        completeMiniGame("memoryMatch");
        closeMiniGame();
        collectItem("old-ticket");
      }
    } else {
      // 翻牌失败：翻回
      matchBusy = true;
      showMiniGameMessage(MINI_GAMES.memoryMatch.wrong);
      setTimeout(() => {
        matchFlipped = [];
        matchBusy = false;
        updateMatchCard(a);
        updateMatchCard(b);
      }, 700);
    }
  }
}

function updateMatchCard(i) {
  const el = miniGameBody.querySelector('.match-card[data-index="' + i + '"]');
  if (!el) return;
  const card = matchCards[i];
  if (card.matched) {
    el.classList.add("matched");
    el.classList.remove("flipped");
    el.textContent = MINI_GAMES.memoryMatch.symbols[card.value];
  } else if (matchFlipped.includes(i)) {
    el.classList.add("flipped");
    el.classList.remove("matched");
    el.textContent = MINI_GAMES.memoryMatch.symbols[card.value];
  } else {
    el.classList.remove("flipped", "matched");
    el.textContent = "?";
  }
}

/* ---------- 小游戏：湿掉的寻人纸条（拖拽排序） ---------- */
function renderNoteArrange() {
  const g = MINI_GAMES.noteArrange;
  noteOrder = shuffle([0, 1, 2, 3]);
  dragIndex = null;

  miniGameBody.innerHTML = "";
  const list = document.createElement("div");
  list.className = "note-list";

  noteOrder.forEach((origIndex, slot) => {
    const el = document.createElement("div");
    el.className = "note-card";
    el.draggable = true;
    el.dataset.slot = slot;
    el.textContent = g.fragments[origIndex];

    el.addEventListener("dragstart", (e) => {
      dragIndex = slot;
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", String(slot)); } catch (err) {}
      el.classList.add("dragging");
    });
    el.addEventListener("dragend", () => {
      dragIndex = null;
      list.querySelectorAll(".note-card").forEach((c) => c.classList.remove("dragging", "drag-over"));
    });
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      el.classList.add("drag-over");
    });
    el.addEventListener("dragleave", () => {
      el.classList.remove("drag-over");
    });
    el.addEventListener("drop", (e) => {
      e.preventDefault();
      el.classList.remove("drag-over");
      const target = parseInt(el.dataset.slot, 10);
      if (dragIndex === null || dragIndex === target) return;
      // 交换两卡
      [noteOrder[dragIndex], noteOrder[target]] = [noteOrder[target], noteOrder[dragIndex]];
      dragIndex = null;
      renderNoteArrange();
    });

    list.appendChild(el);
  });
  miniGameBody.appendChild(list);

  // 确认按钮
  const confirm = document.createElement("button");
  confirm.type = "button";
  confirm.className = "mini-confirm";
  confirm.textContent = "确认";
  confirm.addEventListener("click", (e) => {
    e.stopPropagation();
    checkNoteArrange();
  });
  miniGameBody.appendChild(confirm);
}

function checkNoteArrange() {
  if (noteOrder.every((orig, slot) => orig === slot)) {
    completeMiniGame("noteArrange");
    closeMiniGame();
    collectItem("wet-note");
  } else {
    showMiniGameMessage(MINI_GAMES.noteArrange.wrong);
  }
}

/* ---------- 洗牌工具 ---------- */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // 避免排序类小游戏初始即为正确顺序
  if (a.length > 1 && a.every((v, i) => v === i)) {
    [a[0], a[1]] = [a[1], a[0]];
  }
  return a;
}

/* ============================================================
   十一、结局流程
   ============================================================ */

/* 判断结局（不改动判定逻辑，仅扩展 good 结局的 true end 分支） */
function checkEnding() {
  if (gameState.gameOver || gameState.ending) return;

  const E = storyText.endings;

  if (gameState.anomalyCount >= gameState.anomalyLimit) {
    gameState.ending = "bad";
    beginEndingSequence([
      { type: "text", lines: E.bad.pre },
      { type: "text", lines: [E.bad.english], english: true },
      { type: "image", image: IMAGE_PATHS.badEnding, caption: E.bad.caption },
      { type: "final", lines: E.bad.final },
    ]);
  } else if (gameState.inventory.includes("old-ticket")) {
    gameState.ending = "good";
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
        { type: "final", title: E.good.trueEndTitle, lines: E.good.trueEnd3 }
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
    beginEndingSequence([
      { type: "text", lines: E.normal.pre },
      { type: "text", lines: [E.normal.english], english: true },
      { type: "image", image: IMAGE_PATHS.normalEnding, caption: E.normal.caption },
      { type: "final", lines: E.normal.final },
    ]);
  }
}

/* 开始结局序列 */
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

/* 渲染当前结局步骤 */
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

/* 推进结局步骤 */
function advanceEnding() {
  endingStepIndex++;
  if (endingStepIndex >= endingSteps.length) {
    setGameOver();
    return;
  }
  renderEndingStep();
}

/* 游戏结束 */
function setGameOver() {
  gameState.gameOver = true;
  gameOverBadge.classList.remove("hidden");
}

/* 返回上一场景 */
function goBack() {
  if (gameState.gameOver) return;
  const scene = SCENES[gameState.currentScene];
  if (scene && scene.back) {
    enterScene(scene.back);
  }
}

/* 重新开始 */
function restartGame() {
  gameState.currentScene = "start";
  gameState.previousScene = null;
  gameState.visitCount = {};
  gameState.anomalyCount = 0;
  gameState.triggeredAnomalies = [];
  gameState.inventory = [];
  gameState.completedMiniGames = [];
  gameState.discoveredClues = [];
  gameState.vendingCode = "";
  gameState.hasKeyItem = false;
  gameState.ending = null;
  gameState.gameOver = false;

  endingSteps = [];
  endingStepIndex = -1;
  mentalPromptShown = false;
  doorTriggered = false;

  activeMiniGame = null;
  duckRevealed = false;
  noteRevealed = false;
  vendingInput = "";
  matchCards = [];
  matchFlipped = [];
  matchBusy = false;
  noteOrder = [];
  dragIndex = null;

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
  closeMiniGame();

  updateInventory();
  updateCluesIndicator();

  enterScene("start");
}

/* ============================================================
   十二、音频实现
   ============================================================ */

/* 首次用户交互时初始化音频（满足浏览器自动播放策略） */
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

/* 搭建音频节点图 */
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

/* 生成混响脉冲响应（衰减噪声） */
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

/* 开始背景音乐 */
function startMusic() {
  if (!audio.ctx || audio.musicOn) return;
  audio.musicOn = true;

  startDrone();
  scheduleChord(0);
  scheduleArp();
  scheduleCrackle();
}

/* 停止背景音乐 */
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

/* 低频持续低鸣 */
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

/* 缓慢的垫底和弦 */
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

/* 梦幻的琶音旋律 */
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

/* 黑胶底噪（细微噼啪声） */
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

/* 通用振荡器音 */
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

/* 通用噪声 */
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

/* 按钮/UI 点击音 */
function playClick() {
  playTone({ freq: 1600, type: "triangle", duration: 0.07, gain: 0.06 });
  playTone({ freq: 2400, type: "sine", duration: 0.04, gain: 0.03 });
}

/* 进入场景音 */
function playNavSound() {
  playTone({ freq: 880, type: "sine", duration: 0.12, gain: 0.06 });
  playTone({ freq: 1320, type: "sine", duration: 0.1, gain: 0.04 });
}

/* 异常音（不和谐、滑落） */
function playAnomalySound() {
  playTone({ freq: 300, type: "sawtooth", duration: 0.4, gain: 0.06, glideTo: 120 });
  playTone({ freq: 305, type: "square", duration: 0.35, gain: 0.03, glideTo: 125 });
  playNoise({ duration: 0.15, gain: 0.03, filterFreq: 800 });
}

/* 售货机提示音 */
function playVendingBeep() {
  playTone({ freq: 200, type: "square", duration: 0.25, gain: 0.08 });
}

/* 获得道具音（上行双音） */
function playItemSound() {
  playTone({ freq: 523.25, type: "sine", duration: 0.3, gain: 0.08 });
  setTimeout(() => playTone({ freq: 783.99, type: "sine", duration: 0.35, gain: 0.08 }), 120);
}

/* 声音开关 */
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
   十三、事件绑定与初始化
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

  // 结局层：点击推进结局
  overlay.addEventListener("click", () => {
    if (gameState.ending && !gameState.gameOver) {
      playClick();
      advanceEnding();
    }
  });

  // 小游戏弹层：阻止点击穿透；关闭按钮
  miniGameOverlay.addEventListener("click", (e) => e.stopPropagation());
  miniGameClose.addEventListener("click", (e) => {
    e.stopPropagation();
    closeMiniGame();
  });

  // 首次交互时初始化音频（自动播放策略）
  document.addEventListener("pointerdown", function once() {
    ensureAudio();
    document.removeEventListener("pointerdown", once);
  });

  // 阻止图片被拖拽
  sceneImage.addEventListener("dragstart", (e) => e.preventDefault());
  overlayImage.addEventListener("dragstart", (e) => e.preventDefault());

  updateInventory();
  updateCluesIndicator();
  enterScene("start");
}

init();
