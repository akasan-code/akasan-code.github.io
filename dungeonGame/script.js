// ====================
// 基本DOM
// ====================
const logW = document.getElementById("log");
const gameW = document.getElementById("game");
const commandW = document.getElementById("commands");
const eventWindow = document.getElementById("eventWindow");
const eventImage  = document.getElementById("eventImage");
const fadeOverlay = document.getElementById("fadeOverlay");

// ====================
// enum定義
// ====================
const UI_MODE = Object.freeze({
  NORMAL: "NORMAL",
  ETERNAL: "ETERNAL",
  RETRY: "RETRY",
  BATTLE: "BATTLE",
  FOUNTAIN: "FOUNTAIN",
  IDLE: "IDLE",
  NONE: "NONE"
});
const BATTLE_RESULT = Object.freeze({
  WIN: "WIN",
  LOSE: "LOSE"
});
const STAGE = {
  DUNGEON: "DUNGEON",
  FOREST: "FOREST",
  RUINS: "RUINS"
};
// ====================
// ゲーム状態
// ====================
const initialGameState = {
  floor: 1,
  currentStage: STAGE.DUNGEON,
  step: 0,
  isDead: false,
  player: {
    name: "キミ",
    level: 1,
    exp: 0,
    nextExp: 10,
    hp: 20,
    maxHp: 20,
    baseAtk: 5,
    baseDef: 2,
    weapon: { name: "粗悪な鉄剣", atk: 1 },
    shield: { name: "なし", def: 0 }
  }
};
let gameState = structuredClone(initialGameState);
let eternalState = loadEternalState();

// 恒久ボーナスの読み込み処理
function loadEternalState() {
  const saved = localStorage.getItem("eternalState");

  if (saved) {
    return JSON.parse(saved);
  }

  // 初回起動時
  return {
    atkLv: 1,
    atk: 0,
    defLv: 1,
    def: 0,
    hpLv: 1,
    maxHp: 0,
    exp: 0,
    restartCount: 0
  };
}
// 恒久ボーナスの反映処理
function applyEternalBonus() {
  const p = gameState.player;

  p.baseAtk += eternalState.atk;
  p.baseDef += eternalState.def;
  p.maxHp   += eternalState.maxHp;
  p.hp      = p.maxHp;
}
// 恒久ボーナスの保存処理
function saveEternalState() {
  localStorage.setItem(
    "eternalState",
    JSON.stringify(eternalState)
  );
}
// ====================
// Utility
// ====================
function wait(sec) {
  return new Promise(r => setTimeout(r, sec * 800));
}

function randomChance(chance) {
  return Math.random() * 100 < chance;
}

function addMessage(msg) {
  logW.innerHTML = logW.innerHTML + "> " + msg + "<br>";
  logW.scrollTop = logW.scrollHeight;
}

function showEventImage(src) {
  eventImage.src = src;
  eventWindow.style.display = "flex";
}

function hideEventImage() {
  eventWindow.style.display = "none";
  eventImage.src = "";
}

function fadeToBlack(duration = 2) {
  fadeOverlay.style.transition = `opacity ${duration}s ease`;
  fadeOverlay.style.opacity = "1";
}

function fadeFromBlack(duration = 1) {
  fadeOverlay.style.transition = `opacity ${duration}s ease`;
  fadeOverlay.style.opacity = "0";
}

// ====================
// 背景変更
// ====================
async function changeBackground(picPath) {
  gameW.style.background = "black";
  await wait(0.5);
  gameW.style.backgroundSize = "cover";
  gameW.style.backgroundPosition = "center";
  gameW.style.backgroundImage = "url(" + picPath + ")";
}

// ====================
// コマンドボタンの制御
// ====================
function clearCommands() {
  commandW.innerHTML = "";
}
function addCommand(label, onClick) {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.style.margin = "6px";
  btn.onclick = onClick;
  commandW.appendChild(btn);
}
function setUIMode(mode) {
  clearCommands();

  switch (mode) {
    case UI_MODE.NORMAL:
      showNormalCommands();
      break;
    case UI_MODE.FOUNTAIN:
      showFountainCommands();
      break;
    case UI_MODE.ETERNAL:
      showEternalUpgradeCommands();
      break;
    case UI_MODE.RETRY:
      showRetryCommands();
      break;
    case UI_MODE.FRUIT:
      showFruitCommands();
      break;
    case UI_MODE.IDLE:
    default:
      commandW.style.display = "none";
  }
}

// ====================
// 画面へステータス反映
// ====================
function updateStatus() {
  document.getElementById("floorNum").textContent = gameState.floor;
  document.getElementById("hp").textContent = gameState.player.hp;
  document.getElementById("maxHp").textContent = gameState.player.maxHp;
  document.getElementById("lv").textContent = gameState.player.level;
  document.getElementById("weapon").textContent = gameState.player.weapon ? gameState.player.weapon.name : "なし";
  document.getElementById("shield").textContent = gameState.player.shield ? gameState.player.shield.name : "なし";

  document.getElementById("eternalExp").textContent = eternalState.exp;
  document.getElementById("eternalAtk").textContent = eternalState.atkLv;
  document.getElementById("eternalDef").textContent = eternalState.defLv;
  document.getElementById("eternalHp").textContent = eternalState.hpLv;
}
// クリック待ち処理
function waitForClick() {
  return new Promise(resolve => {
    const handler = () => {
      logW.removeEventListener("click", handler);
      resolve();
    };
    logW.addEventListener("click", handler);
  });
}


// ★====================
// ゲーム開始
// ★====================
setUIMode(UI_MODE.IDLE);

startGame();

// ====================
// 開始イベント
// ====================
async function startGame() {
  logW.innerHTML = "";
  setUIMode(UI_MODE.NONE);        // 操作不能

  applyEternalBonus();            // 恒久ボーナスを適用
  gameState.isDead = false;

  updateStatus();
  await changeBackground("dungeon_entrance.png");

  addMessage("・・・");
  await wait(1);
  // 死亡カウントで分岐させる
  if (eternalState.restartCount == 0) {
    addMessage("・・");
    await wait(1);
    addMessage("・");
    await wait(1);
    addMessage("ここはどこだ。。。");
    await wait(1);
    addMessage("記憶がない。");
    await wait(1);
    addMessage("・・");
    await wait(1);
    addMessage("ここは、どうやら迷宮の入り口のようだ。");
    await wait(1);
    addMessage("なぜか懐かしいような気もする。");
    await wait(1);
    addMessage("キミは迷宮へ足を踏み入れる選択肢しか無いように思える。");
  } else if (eternalState.restartCount == 1) {
    addMessage("死んだはずのキミは再び立っている。");
    await wait(1);
    addMessage("確かに死んだはずだが。。");
    await wait(1);
    addMessage("・・");
  } else if (eternalState.restartCount == 2) {
    addMessage("また始めに戻っている。");
    await wait(1);
    addMessage("・・");
  } else if (eternalState.restartCount == 3) {
    addMessage("これは呪いだろうか。");
    await wait(1);
    addMessage("進むしかない。");
    await wait(1);
    addMessage("・・");
  } else if (eternalState.restartCount > 3) {
    addMessage("何度目の再出発だろう。");
    await wait(1);
    addMessage("・・");
  }
  await wait(1);
  addMessage("（クリックして冒険を始める）");

  await waitForClick();   // ← ここで完全に止まる

  logW.innerHTML = "";
  addMessage("キミは迷宮へ足を踏み入れた。");
  await wait(1);

  await changeBackground(randomChance(50) ? "dungeon_back1.png" : "dungeon_back2.png");
  await waitForCommands();
}

// 待機状態の画面
async function waitForCommands() {
  setUIMode(UI_MODE.IDLE);            // commandなし
  switch (gameState.currentStage) {
    case STAGE.DUNGEON:
      addMessage("薄暗い迷宮がどこまでも続いている気がする。");
      break;
    case STAGE.FOREST:
      addMessage("広大な森が広がってる。");
      break;
    default:
      break;
  }

  await wait(1);

  setUIMode(UI_MODE.NORMAL); // 通常commandに変更
}

// 通常コマンド
 function showNormalCommands() {
  clearCommands();
  commandW.style.display = "block";

  addCommand("進む", moveForward);
  addCommand("休む", rest);
  if (eternalState.restartCount > 0) {
    addCommand("やり直し", enterRetry);
  }
}
// 前進処理
async function moveForward() {
  if (gameState.isDead) return;                       // 死亡時はイベントキャンセル

  logW.innerHTML = "";
  setUIMode(UI_MODE.NONE); 

  addMessage("キミは奥へと進んだ。");

//  console.log(gameState.currentStage);

  switch (gameState.currentStage) {
    case STAGE.DUNGEON:
      await changeBackground(randomChance(50) ? "dungeon_back1.png" : "dungeon_back2.png");
      break;
    case STAGE.FOREST:
      await changeBackground(randomChance(50) ? "dungeon_forest1.jpeg" : "dungeon_forest2.jpeg");
      break;
    default:
      await changeBackground(randomChance(50) ? "dungeon_back1.png" : "dungeon_back2.png");
      break;
  }

  await wait(1);
  addMessage("・・");
  await wait(1);
  addMessage("・");

  // イベント判定
  // 0-60 戦闘、61-70 ？？？
  const roll = Math.random() * 100;

  if (roll < 60) {
    // 戦闘
    const battleResult = await startBattle(createEnemy());
    if (battleResult === BATTLE_RESULT.LOSE) {
      return;
    }
    // 戦闘後の移動
    await tryGoStairs();
    return;
  } else if (roll >= 60 && roll < 70) {
      switch (gameState.currentStage) {
        case STAGE.DUNGEON:
          //    泉イベント
          await startFountainEvent();
          break;
        case STAGE.FOREST:
          //    果実イベント
          await startFruitEvent();
          break;
        default:
          break;
      }

    gameState.step++;
    return;
  } else if (roll >= 70 && roll < 80) {
//    宝箱
    await startTreasureEvent();
    gameState.step++;
    return;
  } else {
//    何もなし（移動のみ）
    await tryGoStairs();
    return;
  }

}

// 階段判定イベント
async function tryGoStairs() {
  const stairsChance = 5 + gameState.step * 9;

  if (!randomChance(stairsChance)) {
    gameState.step++;
    await waitForCommands();
    return false;
  }

  await changeBackground("dungeon_stairs.jpg");
  addMessage("下への階段を見つけた！");
  await wait(3);
  addMessage("キミは階段を下りた。");
  await wait(1);
  logW.innerHTML = "";

  eternalState.exp += gameState.floor * 10;    // 恒久経験値をゲット
  saveEternalState();                         // ストレージ保存

  gameState.floor++;
  gameState.step = 0;
  gameState.currentStage = getStageByFloor(gameState.floor);
  updateStatus();

  // ステージ変化
  if (gameState.floor === 5) {
    addMessage("ここは迷宮の中だろうか。");
    await wait(1);
    addMessage("大きな森が広がっている。");
  } 

  if (gameState.currentStage === STAGE.FOREST) {
    await changeBackground("dungeon_forest1.jpeg");
  } else {
    await changeBackground("dungeon_entrance.png");
  }

  await waitForCommands();
  return true;
}
// ステージ判定 階層からステージを
function getStageByFloor(floor) {
  if (floor <= 4) return STAGE.DUNGEON;
  if (floor >= 5 && floor <= 9) return STAGE.FOREST;
  if (floor >= 10 && floor <= 14) return STAGE.RUINS;
}
// ====================
// 休憩コマンド
// ====================
async function rest() {
  setUIMode(UI_MODE.NONE);            // コマンドを消す

  logW.innerHTML = "";
  addMessage("キミは休息を取った。");
  await wait(1);

  // イベント判定
  // 0-29 戦闘、30-100 休息
  const roll = Math.random() * 100;

  if (roll < 30) {
    // 戦闘
    await startBattle(createEnemy());
  } else {
    // 休憩
    const heal = Math.min(
      gameState.player.maxHp - gameState.player.hp,
      Math.floor(gameState.player.maxHp * 0.1)
    );
    gameState.player.hp += heal;

    addMessage(`HPが${heal}回復した。`);
    updateStatus();
  }

  await waitForCommands();
}

// ====================
// 戦闘ロジック
// ====================
// 装備込みの攻撃力を計算
function getPlayerAtk() {
  const p = gameState.player;
  return p.baseAtk + (p.weapon ? p.weapon.atk : 0);
}
// 装備込みの防御力を計算
function getPlayerDef() {
  const p = gameState.player;
  return p.baseDef + (p.shield ? p.shield.def : 0);
}
// ダメージ計算
function calcDamage(attacker, defender) {
  let atk
  let def
    
  if (attacker === gameState.player) {
    atk = getPlayerAtk();
  } else {
    atk = attacker.atk;
  }
  if (defender === gameState.player) {
    def = getPlayerDef();
  } else {
    def = defender.def;
  }
  const baseDamage = atk - def;

  console.log("atk:" + atk);
  console.log("def:" + def);
  return Math.max(1, baseDamage + Math.floor(Math.random() * 3));
}

async function startBattle(enemy) {
  logW.innerHTML = "";
  setUIMode(UI_MODE.NONE); // 操作不能

  showEventImage(enemy.image);          // 画像表示
  addMessage(`${enemy.name}が現れた！`);
  await wait(1);

  const player = gameState.player;

  while (player.hp > 0 && enemy.hp > 0) {
    // プレイヤー攻撃
    const dmg = calcDamage(player, enemy);
    enemy.hp -= dmg;
    addMessage(`キミの攻撃！ ${dmg}ダメージ`);
    updateStatus();
    await wait(1);

    if (enemy.hp <= 0) break;

    // 敵の攻撃
    const edmg = calcDamage(enemy, player);
    player.hp -= edmg;
    addMessage(`${enemy.name}の攻撃！ ${edmg}ダメージ`);
    updateStatus();
    await wait(1);
  }

  if (player.hp > 0) {
    addMessage(`${enemy.name}を倒した！`);
    gainExp(enemy.exp);
    hideEventImage();
    await handleDrop(enemy);
    return BATTLE_RESULT.WIN;
  } else {
    hideEventImage();
    // 死亡イベント
    await gameOver();
    return BATTLE_RESULT.LOSE;
  }
}
// ====================
// レベルアップ処理
// ====================
function gainExp(amount) {
  const p = gameState.player;

  addMessage(`経験値を${amount}得た。`);
  p.exp += amount;

  while (p.exp >= p.nextExp) {
    levelUp();
  }

  updateStatus();
}
function levelUp() {
  const p = gameState.player;

  p.exp -= p.nextExp;
  p.level++;
  p.nextExp = 5 + 4 * p.level * p.level;

  const hpUp = 5;
  const atkUp = 2;
  const defUp = 1;

  p.maxHp += hpUp;
  p.baseAtk += atkUp;
  p.baseDef += defUp;
  p.hp = p.maxHp;

  addMessage(`レベルアップした！ Lv.${p.level}`);

}
// ====================
// ドロップ処理
// ====================
async function handleDrop(enemy) {
  if (enemy.dropItem) {
    addMessage(`${enemy.dropItem.name}を手に入れた！`);
    await equipItem(enemy.dropItem);
  }

  updateStatus();
}

// ====================
// 死亡イベント
// ====================
async function gameOver() {
  setUIMode(UI_MODE.NONE); // 操作不能
  logW.innerHTML = "";

  addMessage("・・");
  await wait(1);
  addMessage("・");
  await wait(1);
  // ブラックアウト開始
  fadeToBlack(4);
  addMessage("キミは力尽きた。");
  await wait(2);
  addMessage("すべてが闇に沈んでいく。。。");
  await wait(2);
  addMessage("（クリックして最初から?やり直す）");

  eternalState.restartCount++; // 死亡カウントを増やす
  saveEternalState(); 

  await waitForClick();

  // 状態リセット
  gameState = structuredClone(initialGameState);

//  gameState.isDead = true;                                  // 死亡フラグ ON
  enterEternalUpgrade();

}
// ====================
// 敵生成
// ====================
function createEnemy() {
  const base = gameState.floor;
  let addAtk = 0;
  let addDef = 0;

  // ドロップ判定して、敵に装備させる
  const drop = tryDrop();
  console.log(drop);
  if (drop) {
    if (drop.type === "weapon") {
      addAtk = drop.atk;
      addDef = 0;
    } else {
      addAtk = 0;
      addDef = drop.def;
    }
  } 

  // 敵をステージによって切り替える
  let enemy
  switch (gameState.currentStage) {
    case STAGE.DUNGEON:
      enemy = {
        name: "スケルトン",
        image: "enemy_skeleton.jpeg",
        hp: 10 + base * 5,
        atk: 3 + base * 2 + addAtk,
        def: 1 + base + addDef,
        // 倒した時に落とす候補
        dropItem: drop,
        exp: 3 + base * 3
      };
      break;

    case STAGE.FOREST:
      enemy = {
        name: "オーク",
        image: "enemy_oak.jpeg",
        hp: 30 + base * 5,
        atk: 6 + base * 2 + addAtk,
        def: 3 + base + addDef,
        // 倒した時に落とす候補
        dropItem: drop,
        exp: 20 + base * 3
      };
      break;

    default:
      enemy = {
        name: "スケルトン",
        image: "enemy_skeleton.jpeg",
        hp: 10 + base * 5,
        atk: 3 + base * 2 + addAtk,
        def: 1 + base + addDef,
        // 倒した時に落とす候補
        dropItem: drop,
        exp: 3 + base * 3
      };
      break;
  }
  return {
    name: enemy.name,
    image: enemy.image,
    hp: enemy.hp,
    atk: enemy.atk,
    def: enemy.def,
    dropItem: enemy.dropItem,
    exp: enemy.exp
  };
}

// ====================
// 装備ライブラリ
// ====================
const weapons = {
  ironLowQuality: { type: "weapon", name: "粗悪な鉄剣", atk: 1, img: "item_ironMQsword.jpeg" },
  ironMidQuality: { type: "weapon", name: "普通な鉄剣", atk: 4, img: "item_ironMQsword.jpeg"  },
  ironHighQuality: { type: "weapon", name: "上等な鉄剣", atk: 6, img: "item_ironMQsword.jpeg"  },
  silverSword: { type: "weapon", name: "銀の剣", atk: 11, img: "item_ironMQsword.jpeg"  },
};

const shields = {
  woodLowQuality: { type: "shield", name: "粗悪な木盾", def: 1, img: "item_woodenMQshield.jpeg"  },
  woodMidQuality: { type: "shield", name: "普通な木盾", def: 2, img: "item_woodenMQshield.jpeg"  },
  woodHighQuality: { type: "shield", name: "上等な木盾", def: 3, img: "item_woodenMQshield.jpeg"  }
};
// ドロップテーブルの設定
const dropTables = [
  {
    minFloor: 1,
    table: [
      { item: weapons.ironLowQuality, weight: 50 },
      { item: weapons.ironMidQuality, weight: 10 },
      { item: shields.woodLowQuality,  weight: 30 },
      { item: shields.woodMidQuality,  weight: 10 }
    ]
  },
  {
    minFloor: 3,
    table: [
      { item: weapons.ironLowQuality, weight: 30 },
      { item: weapons.ironMidQuality, weight: 30 },
      { item: shields.woodLowQuality,  weight: 20 },
      { item: shields.woodMidQuality,  weight: 20 }
    ]
  },
  {
    minFloor: 5,
    table: [
      { item: weapons.ironLowQuality, weight: 10 },
      { item: weapons.ironMidQuality, weight: 45 },
      { item: weapons.ironHighQuality, weight: 5 },
      { item: shields.woodLowQuality,  weight: 5 },
      { item: shields.woodMidQuality,  weight: 30 },
      { item: shields.woodHighQuality,  weight: 5 }
    ]
  },
  {
    minFloor: 8,
    table: [
      { item: weapons.ironMidQuality, weight: 30 },
      { item: weapons.ironHighQuality, weight: 30 },
      { item: shields.woodMidQuality,  weight: 20 },
      { item: shields.woodHighQuality,  weight: 20 }
    ]
  }
];

// ★====================
// アイテムドロップ判定処理
// ★====================
// そもそも落ちるか（20%）
function tryDrop() {
  if (!randomChance(20)) return null;

  const table = getDropTable(gameState.floor);
  return weightedRandom(table);
}
// ドロップテーブルを取得
function getDropTable(floor) {
  return dropTables
    .filter(t => t.minFloor <= floor)
    .at(-1).table;
}
// アイテム抽選
function weightedRandom(table) {
  const total = table.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * total;

  for (const e of table) {
    roll -= e.weight;
    if (roll <= 0) return e.item;
  }
}

// ★====================
// アイテム装備
async function equipItem(item) {
  const p = gameState.player;

  if (item.type === "weapon" && p.weapon.atk < item.atk) {
    p.weapon = item;
    showEventImage(item.img);             // 新装備のアイテムは画像表示する
    await wait(4)
    addMessage(`${item.name}を装備した。`);
  }

  if (item.type === "shield" && p.shield.def < item.def) {
    p.shield = item;
    showEventImage(item.img);             // 新装備のアイテムは画像表示する
    await wait(4)
    addMessage(`${item.name}を装備した。`);
  }

  updateStatus();
}

// ====================
// やり直しコマンド
// ====================
function enterRetry() {
  logW.innerHTML = "";

  addMessage("今回の挑戦をあきらめるか？");
  addMessage("キミはあきらめて最初に戻ってもいいし、");
  addMessage("このまま冒険を続けてもいい。");
  addMessage("（選択する）");

  setUIMode(UI_MODE.RETRY);
}
function showRetryCommands() {
  clearCommands();
  commandW.style.display = "block";

  addCommand("挑戦をやり直す", yesRetry);
  addCommand("挑戦を続ける", noRetry);
}
// やり直しのキャンセル
function noRetry() {
  logW.innerHTML = "";

  addMessage("キミはやはり挑戦を続けることにした。");
  waitForCommands();
}
function yesRetry() {
  logW.innerHTML = "";
  gameOver();
}

// ====================
// 恒久強化コマンド
// ====================
function showEternalUpgradeCommands() {
  clearCommands();
  commandW.style.display = "block";

  fadeFromBlack(1.5);                   // 死亡の暗転から復帰

  const atkCost = getUpgradeCost("atk");
  const defCost = getUpgradeCost("def");
  const hpCost  = getUpgradeCost("hp");

  addCommand(`攻撃力 +2（${atkCost}EXP）`, async () => {
    await handleEternalUpgrade("atk");
  });

  addCommand(`防御力 +1（${defCost}EXP）`, async () => {
    await handleEternalUpgrade("def");
  });

  addCommand(`最大HP +5（${hpCost}EXP）`, async () => {
    await handleEternalUpgrade("hp");
  });

  addCommand(" 今回は強化しない", async () => {
    await handleEternalUpgrade("skip");
  });
}
// 恒久強化テーブル
function getUpgradeCost(type) {
  const config = {
    atk: { base: 10, growth: 4, lv: eternalState.atkLv },
    def: { base: 10, growth: 5, lv: eternalState.defLv },
    hp:  { base: 10, growth: 3, lv: eternalState.hpLv }
  };

  const c = config[type];
  return Math.floor(c.base * (c.growth * c.lv));
}

function enterEternalUpgrade() {
  logW.innerHTML = "";

  addMessage("魂に経験が刻まれている。");
  addMessage("キミはその経験を次に活かしてもいいし、");
  addMessage("経験を温存してもいい。");
  addMessage("（強化を選択する）");

  setUIMode(UI_MODE.ETERNAL);
}

async function handleEternalUpgrade(type) {
  clearCommands();

  if (type === "skip") {
    addMessage("キミは力を温存した。");
    startGame();
    return;
  }

  const cost = getUpgradeCost(type);

  if (eternalState.exp < cost) {
    addMessage("恒久EXPが足りない……");
    setUIMode(UI_MODE.ETERNAL); // 再表示
    return;
  }

  eternalState.exp -= cost;

  if (type === "atk") {
    eternalState.atkLv++;
    eternalState.atk += 2;
  }
  if (type === "def") {
    eternalState.defLv++;
    eternalState.def += 1;
  }
  if (type === "hp") {
    eternalState.hpLv++;
    eternalState.maxHp += 5;
  } 

  saveEternalState();
  addMessage("魂に新たな力が宿る！");
  startGame();
}

// 宝箱のイベント
async function startTreasureEvent() {
  setUIMode(UI_MODE.NONE);
  clearCommands();

  showEventImage("event_closechest.jpeg");         // 開ける前の画像

  addMessage("宝箱を見つけた！");
  await wait(2);

  const table = getDropTable(gameState.floor);
  const item = weightedRandom(table);
  // 今の所ありえないが、念のため空だった時の処理
  if (!item) {
    addMessage("中は空だった…");
    return;
  }

  showEventImage("event_openchest.jpeg");          // 開けた後の画像
  
  addMessage(`${item.name}を手に入れた！`);
  await wait(1);
  await equipItem(item);
  updateStatus();

  await endTreasureEvent();
}
async function endTreasureEvent() {
  addMessage("キミは先に進む。");
  await wait(1);
  hideEventImage();

  await waitForCommands();
  logW.innerHTML = "";
}

// 泉イベント
function showFountainCommands() {
  clearCommands();
  commandW.style.display = "block"; 

  addCommand("水を飲む", async () => {
    await drinkFromFountain();
    await endFountainEvent();
  });

  addCommand("飲まない", async () => {
    await endFountainEvent();
  });
}
async function startFountainEvent() {
  setUIMode(UI_MODE.NONE);

  showEventImage("event_fountain.jpeg");

  logW.innerHTML = "";
  addMessage("澄んだ水をたたえた泉がある。");
  await wait(1);
  addMessage("キミは泉の水を飲んでもいいし、飲まなくてもいい。");

  setUIMode(UI_MODE.FOUNTAIN);
}
async function drinkFromFountain() {
  const gainedExp = Math.floor(gameState.floor * 5);
  setUIMode(UI_MODE.NONE);

  addMessage("キミは泉の水を口にした…");
  await wait(1);

  eternalState.exp += gainedExp           // 恒久経験値をゲット
  saveEternalState();                     // ストレージ保存
  addMessage(`魂に経験が刻まれる！`);

  if (randomChance(80)) {
    // 回復（MAXの半分回復
    const heal = Math.min(
      gameState.player.maxHp - gameState.player.hp,
      Math.floor(gameState.player.maxHp * 0.5)
    );
    gameState.player.hp += heal;

    addMessage("体が癒やされていく…");
    await wait(1);
    addMessage(`HPが${heal}回復した！`);
  } else {
    // ダメージ
    const dmg = Math.floor(gameState.player.hp * 0.5);
    gameState.player.hp -= dmg;

    addMessage("水は毒だった！");
    await wait(1);
    addMessage(`${dmg}のダメージを受けた！`);

    if (gameState.player.hp <= 0) {
      await wait(1);
      await gameOver();
      return;
    }
  }

  updateStatus();
  await wait(1);
}
async function endFountainEvent() {
  setUIMode(UI_MODE.NONE);

  addMessage("キミは泉を後にした");
  await wait(2);
  hideEventImage();

  await waitForCommands();
  logW.innerHTML = "";
}

// 果物イベント
function showFruitCommands() {
  clearCommands();
  commandW.style.display = "block"; 

  addCommand("果実を食べる", async () => {
    await eatFruit();
    await endFruitEvent();
  });

  addCommand("食べない", async () => {
    await endFruitEvent();
  });
}
async function startFruitEvent() {
  setUIMode(UI_MODE.NONE);

  showEventImage("event_fruit.png");

  logW.innerHTML = "";
  addMessage("見たことのない果実が樹に生っている。");
  await wait(1);
  addMessage("キミは果実を食べてもいいし、食べなくてもいい。");

  setUIMode(UI_MODE.FRUIT);
}
async function eatFruit() {
  const gainedExp = Math.floor(gameState.floor * 5);
  setUIMode(UI_MODE.NONE);

  addMessage("キミは果実を口にした…");
  await wait(1);

  eternalState.exp += gainedExp           // 恒久経験値をゲット
  saveEternalState();                     // ストレージ保存
  addMessage(`魂に経験が刻まれる！`);

  if (randomChance(70)) {
    // HPの上昇
    const hpUp = gameState.floor;

    gameState.player.maxHp += hpUp;
    gameState.player.hp += hpUp;

    addMessage("体に力がみなぎってくる。");
    await wait(1);
    addMessage(`MAXHPが${hpUp}増加した！`);
  } else {
    // ダメージ
    const dmg = gameState.floor;
    gameState.player.maxHp -= dmg;
    gameState.player.hp -= dmg;

    addMessage("体から力が抜けるようだ…");
    await wait(1);
    addMessage(`MAXHPが${dmg}減少してしまった…`);

    if (gameState.player.hp <= 0) {
      await wait(1);
      await gameOver();
      return;
    }
  }

  updateStatus();
  await wait(1);
}
async function endFruitEvent() {
  setUIMode(UI_MODE.NONE);

  addMessage("不思議な樹の元を去った。");
  await wait(2);
  hideEventImage();

  await waitForCommands();
  logW.innerHTML = "";
}


