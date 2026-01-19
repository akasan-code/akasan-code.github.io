// ====================
// 基本DOM
// ====================
const logW = document.getElementById("log");
const gameW = document.getElementById("game");

// ====================
// ゲーム状態
// ====================
const gameState = {
  floor: 1,
  step: 0,
  inBattle: false,
  player: {
    name: "あなた",
    level: 1,
    hp: 20,
    maxHp: 20,
    atk: 5,
    def: 2
  }
};

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
  logW.innerHTML = logW.innerHTML + "> " + message + "<br>";
  logW.scrollTop = logW.scrollHeight;
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
// ゲーム開始
// ====================
startGame();


// ====================
// 前進処理
// ====================
async function moveForward() {
  if (gameState.inBattle) return;

  logW.innerHTML = "";
  addMessage("あなたは奥へと進んだ。");

  await changeBackground(
    randomChance(50) ? "dungeon_back1.png" : "dungeon_back2.png"
  );

  await wait(1);
  addMessage("・・・");
  await wait(1);
  addMessage("・・");
  await wait(1);
  addMessage("・");

  // イベント判定
  const roll = Math.random() * 100;

  if (roll < 70) {
    // 戦闘
    await startBattle(createEnemy());
  } else {
    addMessage("何も起こらなかった。");
    await wait(1);
  }

  // 階段判定
  const stairsChance = 5 + gameState.step * 9;
  if (randomChance(stairsChance)) {
    await changeBackground("dungeon_stairs.jpg");
    addMessage("下への階段を見つけた！");
    await wait(1);
    addMessage("あなたは階段を下りた。");

    gameState.floor++;
    gameState.step = 0;
    document.getElementById("floorNum").textContent = gameState.floor;

    await changeBackground("dungeon_entrance.png");
  } else {
    gameState.step++;
    addMessage("まだ奥へ続いている…");
  }
}

// ====================
// 休憩
// ====================
async function rest() {
  logW.innerHTML = "";
  addMessage("あなたは休息を取った。");
  await wait(1);

  const heal = Math.min(
    gameState.player.maxHp - gameState.player.hp,
    5
  );
  gameState.player.hp += heal;

  addMessage(`HPが${heal}回復した。`);
}

// ====================
// 戦闘ロジック
// ====================
function calcDamage(attacker, defender) {
  const base = attacker.atk - defender.def;
  return Math.max(1, base + Math.floor(Math.random() * 3));
}

async function startBattle(enemy) {
  gameState.inBattle = true;
  logW.innerHTML = "";

  addMessage(`${enemy.name}が現れた！`);
  await wait(1);

  const player = gameState.player;

  while (player.hp > 0 && enemy.hp > 0) {
    // プレイヤー攻撃
    const dmg = calcDamage(player, enemy);
    enemy.hp -= dmg;
    addMessage(`あなたの攻撃！ ${dmg}ダメージ`);
    await wait(1);

    if (enemy.hp <= 0) break;

    // 敵の攻撃
    const edmg = calcDamage(enemy, player);
    player.hp -= edmg;
    addMessage(`${enemy.name}の攻撃！ ${edmg}ダメージ`);
    await wait(1);
  }

  if (player.hp > 0) {
    addMessage(`${enemy.name}を倒した！`);
  } else {
    addMessage("あなたは倒れた……");
    // ここでゲームオーバー処理を入れられる
  }

  gameState.inBattle = false;
}

// ====================
// 開始イベント
// ====================
async function startGame() {
  logW.innerHTML = "";
  await changeBackground("dungeon_entrance.png");

  addMessage("ここは迷宮の入口だ。");
  await wait(1);
  addMessage("一歩進めば、もう戻れない。");
  await wait(1);
  addMessage("（クリックして冒険を始める）");

  waitForClick().then(() => {
    logW.innerHTML = "";
    addMessage("あなたは迷宮へ足を踏み入れた。");
  });
}


// ====================
// 敵生成
// ====================
function createEnemy() {
  const base = gameState.floor;

  return {
    name: "スケルトン",
    hp: 10 + base * 2,
    atk: 3 + base,
    def: 1 + Math.floor(base / 2)
  };
}
