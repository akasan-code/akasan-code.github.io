// 変数
const logW = document.getElementById("log");
const gameW = document.getElementById("game");
let stepNum = 0;		// 進行状態
let floorNum = 1;		// 階層数
let inBattle = false;	// 戦闘中かどうかのフラグ

// wait関数
async function wait(second) {
	return new Promise(resolve => setTimeout(resolve, 1000 * second));
}

// ランダム判定chance以下なら成功で返す
function randomChance(chance) {
  return Math.random() * 100 < chance;
}

// 背景を一旦、暗転させてから入れ替える
async function changeBackground(picPath) {
	gameW.style.background = "black";
	await wait(1);
	gameW.style.backgroundSize = "cover";  		// 背景画像をウィンドウに合わせて拡大縮小
	gameW.style.backgroundPosition = "center";
	gameW.style.backgroundImage = "url(" + picPath + ")";
	return
}

// ログエリアクリックで次のメッセージを表示
logW.addEventListener("click", () => {
    // クリックしたら一度クリア
    logW.innerHTML = "";
});

// メッセージを追加する関数
function addMessage(message) {
  logW.innerHTML = logW.innerHTML + "> " + message + "<br>";
  logW.scrollTop = logW.scrollHeight; // 自動スクロール
}

// 進むボタンが押されたときの処理
async function moveForward() {
	if (inBattle) return; // バトル中は無効にする

	logW.innerHTML = "";
	addMessage("あなたは奥へと進んだ。");
	// 背景画像を入れ替えて進んだ風にする
	if (randomChance(50)) {
		changeBackground('dungeon_back1.png')
	} else {
		changeBackground('dungeon_back2.png')
	}
	await wait(1);
	addMessage("・・・");
	await wait(1);
	addMessage("・・");
	await wait(1);
	addMessage("・");

	// ここでイベント処理を入れる
	const actionRoll = Math.random() * 100
	if (actionRoll < 10) {
		// 宝箱
//	} else if (actionRoll < 30) {
		// 何もなし
//	} else if (actionRoll < 60) {
		// イベント
	} else if (actionRoll < 90) {
		// 敵を出す
		startBattle("敵");
	} else {
		// 敵を出す強敵
	}
	// イベント処理終わり

	// イベント後の処理
//	await wait(3);
	// 一度メッセージをクリアしてから内容表示
	logW.innerHTML = "";
	addMessage("・");
	await wait(1);
	addMessage("・");
	await wait(1);

	// 階段の出る確率：12回進むと100％超え
	let stairsChance = 5 + stepNum * 9;
//	addMessage("階段の出る確率：" + stairsChance);
	if (randomChance(stairsChance)) {
		changeBackground('dungeon_stairs.jpg')
		addMessage("下への階段を見つけた！");
		await wait(1);
		addMessage("あなたは階段を下り、新たな階層に進んだ。");
		await wait(1);
		changeBackground('dungeon_entrance.png')
		stepNum = 0;
		floorNum = floorNum + 1;
		document.getElementById("floorNum").textContent = floorNum;

	} else {
		addMessage("まだ奥へ続いている…");
		await wait(1);
		addMessage("先に進もうか。");
		stepNum = stepNum + 1;
	}
}

// 休むボタンが押されたときの処理
async function rest() {
	addMessage("あなたは少し休むことにした。");
	await wait(1);
	addMessage("・・・");
	await wait(1);
	addMessage("・・");
	await wait(1);
	addMessage("・");
	await wait(2);
}

// ======== タップ式バトル関数 ========
async function startBattle(enemyName) {
	inBattle = true;
	// パラメータ設定
	const D0 = 150;      // 円の初期直径(px)
	let s_min = 0.3;    // 成功範囲下限（小さいほど縮小）
	let s_max = 0.5;    // 成功範囲上限
	let T = 1500;        // 1サイクル時間（ms）

	logW.innerHTML = "";
  addMessage(`${enemyName}が現れた！`);
  await wait(1);
  addMessage("攻撃タイミングを狙え！");

  // タイミングゾーン生成
  const timingDiv = document.createElement("div");
  timingDiv.style.position = "absolute";
  timingDiv.style.left = "50%";
  timingDiv.style.top = "50%";
  timingDiv.style.transform = "translate(-50%, -50%)";
  timingDiv.style.width = D0 + "px";
  timingDiv.style.height = D0 + "px";
  timingDiv.style.border = "3px solid red";
  timingDiv.style.borderRadius = "50%";
  timingDiv.style.transition = "all 1.5s linear";
  gameW.appendChild(timingDiv);

  // ======== 成功範囲の可視化（薄い緑の円） ========
  const successZone = document.createElement("div");
  successZone.style.position = "absolute";
  successZone.style.left = "50%";
  successZone.style.top = "50%";
  successZone.style.transform = "translate(-50%, -50%) scale(0.2)";
    const D_outer = D0 * s_max;
    const D_inner = D0 * s_min;
    successZone.style.width = D_outer + "px";
    successZone.style.height = D_outer + "px";
	successZone.style.borderRadius = "50%";
  successZone.style.background = "rgba(0,255,0,0.15)"; // うっすら緑
  successZone.style.pointerEvents = "none"; // クリック判定を邪魔しない
  timingDiv.appendChild(successZone);
	
  // 移動する円の描写
  const inner = document.createElement("div");
  inner.style.width = "100%";
  inner.style.height = "100%";
  inner.style.background = "rgba(255,0,0,0.2)";
  inner.style.borderRadius = "50%";
  timingDiv.appendChild(inner);

  // 無限ループで縮小・拡大を繰り返す
  let loop = true;
  async function pulse() {
    while (loop) {
      inner.style.transition = "all 1.5s linear";
      inner.style.transform = "scale(0)";
      await wait(1.5);
      inner.style.transition = "all 0s"; // 戻す瞬間は即座に
      inner.style.transform = "scale(1)";
      await wait(0.1);
    }
  }
  pulse(); // 開始

  // クリック判定
  timingDiv.addEventListener("click", () => {
    const transformValue = inner.style.transform;
    const currentScale = parseFloat(transformValue.replace("scale(", "").replace(")", "")) || 1;

		if (currentScale < s_max && currentScale > s_min) {
			addMessage("会心の一撃！");
	//		playSE("hit.mp3");
			loop = false;
		    // クリーンアップ
		    gameW.removeChild(timingDiv);
//		    gameW.removeChild(successZone);
			inBattle = false;
	    } else {
			addMessage("攻撃を外した！");
	//		playSE("miss.mp3");
		    // クリーンアップ
		    gameW.removeChild(timingDiv);
//		    gameW.removeChild(successZone);
			inBattle = false;
	    }
	});
}
