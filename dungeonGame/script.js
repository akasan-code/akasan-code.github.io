// 変数
let stepNum = 0;	// 進行状態
let floorNum = 1;	// 階層数

// wait関数
async function wait(second) {
	return new Promise(resolve => setTimeout(resolve, 1000 * second));
}

// ランダム判定chance以下なら成功で返す
function randomChance(chance) {
  return Math.random() * 100 < chance;
}

// ログエリアクリックで次のメッセージを表示
log.addEventListener("click", () => {
    // クリックしたら一度クリア
    log.innerHTML = "";
});

// メッセージを追加する関数
function addMessage(message) {
  const log = document.getElementById("log");
  log.innerHTML = log.innerHTML + "> " + message + "<br>";
  log.scrollTop = log.scrollHeight; // 自動スクロール
}

// 進むボタンが押されたときの処理
async function moveForward() {
	const log = document.getElementById("log");

	// 一度メッセージをクリアしてから内容表示
	log.innerHTML = "";
	addMessage("あなたは奥へと進んだ。");
	await wait(1);
	addMessage("・・・");
	await wait(1);
	addMessage("・・");
	await wait(1);
	addMessage("・");
	await wait(2);

	// ここでイベント処理を入れる
	let hoge = await Math.random() * 100;
	addMessage(hoge);
	// ここでイベント処理を入れる

	// イベント後の処理
	await wait(3);
	// 一度メッセージをクリアしてから内容表示
	log.innerHTML = "";
	addMessage("・");
	await wait(1);
	addMessage("・");
	await wait(1);

	// 階段の出る確率：12回進むと100％超え
	let stairsChance = 5 + stepNum * 9;
	addMessage("階段の出る確率：" + stairsChance);
	if (randomChance(stairsChance)) {
		addMessage("下への階段を見つけた！");
		await wait(1);
		addMessage("あなたは階段を下り、新たな階層に進んだ。");
		await wait(1);
		stepNum = 0;
		floorNum = floorNum + 1;
		document.getElementById("floorNum").textContent = floorNum;

	} else {
		addMessage("静かな通路だ…");
		await wait(1);
		addMessage("先に進もう。");
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
