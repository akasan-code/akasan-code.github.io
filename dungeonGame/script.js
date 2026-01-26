// ====================
// 基本DOM
// ====================
const logW = document.getElementById("log");
const gameW = document.getElementById("game");
const commandW = document.getElementById("commands");
const eventWindow = document.getElementById("eventWindow");
const eventImage  = document.getElementById("eventImage");

// ====================
// enum定義
// ====================
const UI_MODE = Object.freeze({
  NORMAL: "NORMAL",
  ETERNAL: "ETERNAL",
  BATTLE: "BATTLE",
  NONE: "NONE"
});
const BATTLE_RESULT = Object.freeze({
  WIN: "WIN",
  LOSE: "LOSE"
});

// ====================
// ゲーム状態
// ====================
const initialGameState = {
  floor: 1,
  step: 0,
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
    exp: 0
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
  return new Promise(r => setTimeout(r, sec * 1000));
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
function showNormalCommands() {
  clearCommands();
  addCommand("進む", moveForward);
  addCommand("休む", rest);
}
function showEternalUpgradeCommands() {
  clearCommands();
  commandW.style.display = "block";

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

  addCommand("今回は強化しない", async () => {
    await handleEternalUpgrade("skip");
  });
}
function setUIMode(mode) {
  if (mode === UI_MODE.NORMAL) {
    showNormalCommands();
  }
  if (mode === UI_MODE.ETERNAL) {
    showEternalUpgradeCommands();
  }
  if (mode === UI_MODE.BATTLE || mode === UI_MODE.NONE) {
    clearCommands();
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
}

// ====================
// クリック待ち処理
// ====================
function waitForClick() {
  return new Promise(resolve => {
    const handler = () => {
      logW.removeEventListener("click", handler);
      resolve();
    };
    logW.addEventListener("click", handler);
  });
}

// ====================
// 前進処理
// ====================
async function moveForward() {
  commandW.style.display = "none"; // commandボタンを消す

  logW.innerHTML = "";
  addMessage("あなたは奥へと進んだ。");

  await changeBackground(
    randomChance(50) ? "dungeon_back1.png" : "dungeon_back2.png"
  );

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
  } else {
//    addMessage("何も起こらなかった。");
//    await wait(1);
  }

  // 階段判定
  const stairsChance = 5 + gameState.step * 9;
  if (randomChance(stairsChance)) {
    await changeBackground("dungeon_stairs.jpg");
    addMessage("下への階段を見つけた！");
    await wait(1);
    addMessage("あなたは階段を下りた。");

    eternalState.exp += gameState.floor * 10    // 恒久経験値をゲット
    saveEternalState();                         // ストレージ保存
    gameState.floor++;
    updateStatus();
    gameState.step = 0;
    document.getElementById("floorNum").textContent = gameState.floor;

    await changeBackground("dungeon_entrance.png");
  } else {
    gameState.step++;
    addMessage("まだ奥へ続いている…");
  }
  // ここで command 解禁
  commandW.style.display = "block";
}

// ====================
// 休憩
// ====================
async function rest() {
  commandW.style.display = "none"; // コマンドを消す

  logW.innerHTML = "";
  addMessage("あなたは休息を取った。");
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
  commandW.style.display = "block"; // command 解禁
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

  addMessage(`${enemy.name}が現れた！`);
  await wait(1);

  const player = gameState.player;

  while (player.hp > 0 && enemy.hp > 0) {
    // プレイヤー攻撃
    const dmg = calcDamage(player, enemy);
    enemy.hp -= dmg;
    addMessage(`あなたの攻撃！ ${dmg}ダメージ`);
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
    await handleDrop(enemy);
    return BATTLE_RESULT.WIN;
  } else {
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
  p.nextExp = 10 * p.level * p.level + 10;

  const hpUp = 5;
  const atkUp = 2;
  const defUp = 1;

  p.maxHp += hpUp;
  p.baseAtk += atkUp;
  p.baseDef += defUp;
  p.hp = p.maxHp;

  addMessage(`レベルアップした！ Lv.${p.level}`);
//  addMessage(`HP +${hpUp} / 攻撃 +${atkUp} / 防御 +${defUp}`);
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
// 開始イベント
// ====================
async function startGame() {
  logW.innerHTML = "";
//  commandW.style.display = "none"; // 念のため
  setUIMode(UI_MODE.NONE); // 操作不能

  applyEternalBonus();            // 恒久ボーナスを適用

  updateStatus();
  await changeBackground("dungeon_entrance.png");

  addMessage("・・・");
  await wait(1);
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
  addMessage("君は迷宮へ足を踏み入れる選択肢しか無いように思える。");
  await wait(1);
  addMessage("（クリックして冒険を始める）");

  await waitForClick();   // ← ここで完全に止まる

  logW.innerHTML = "";
  addMessage("あなたは迷宮へ足を踏み入れた。");
  await wait(1);

  setUIMode(UI_MODE.NORMAL); // 通常commandに変更

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
  addMessage("キミは力尽きた。");
  await wait(2);
  addMessage("すべてが闇に沈んでいく。。。");
  await wait(2);
  addMessage("（クリックして最初から?やり直す）");

  await waitForClick();

  // 状態リセット
  gameState = structuredClone(initialGameState);

  enterEternalUpgrade();
 /*

  // 表示リセット
  updateStatus();

  await startGame();
*/
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
  } else {
//    addMessage("しかし何も落ちなかった。");
  }

  return {
    name: "スケルトン",
    hp: 10 + base * 5,
    atk: 3 + base * 2 + addAtk,
    def: 1 + base + addDef,
    // 倒した時に落とす候補
    dropItem: drop,
    exp: 3 + base * 2
  };
}

// ====================
// 装備ライブラリ
// ====================
const weapons = {
  ironLowQuality: { type: "weapon", name: "粗悪な鉄剣", atk: 1 },
  ironMidQuality: { type: "weapon", name: "普通な鉄剣", atk: 4 },
  ironHighQuality: { type: "weapon", name: "上等な鉄剣", atk: 6 },
};

const shields = {
  woodLowQuality: { type: "shield", name: "粗悪な木盾", def: 1 },
  woodMidQuality: { type: "shield", name: "普通な木盾", def: 2 },
  woodHighQuality: { type: "shield", name: "上等な木盾", def: 3 }
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
function equipItem(item) {
  const p = gameState.player;

  if (item.type === "weapon" && p.weapon.atk < item.atk) {
    p.weapon = item;
    addMessage(`${item.name}を装備した。`);
  }

  if (item.type === "shield" && p.shield.def < item.def) {
    p.shield = item;
    addMessage(`${item.name}を装備した。`);
  }

  updateStatus();
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

  addMessage("魂は迷宮に刻まれた。");
  addMessage("恒久的な力を得ることができる。");
  addMessage("（強化を選択する）");

  setUIMode(UI_MODE.ETERNAL);
}

async function handleEternalUpgrade(type) {
  clearCommands();

  if (type === "skip") {
    addMessage("あなたは力を温存した。");
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
  addMessage("魂に新たな力が刻まれた。");
  startGame();
}

// ★====================
// ゲーム開始
// ★====================
setUIMode(UI_MODE.NONE); // 最初は非表示

startGame();



