// wait関数
async function wait(second) {
	return new Promise(resolve => setTimeout(resolve, 1000 * second));
}

// ランダム地
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

	let hoge = await Math.random() * 100;
	addMessage(hoge);

}

// 休むボタンが押されたときの処理
function rest() {
	addMessage("あなたは少し休むことにした。");
	await wait(1);
	addMessage("・・・");
	await wait(1);
	addMessage("・・");
	await wait(1);
	addMessage("・");
	await wait(2);
}
