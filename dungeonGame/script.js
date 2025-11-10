// wait関数
async function wait(second) {
	return new Promise(resolve => setTimeout(resolve, 1000 * second));
}

// ログエリアクリックで次のメッセージを表示
log.addEventListener("click", () => {
    // クリックしたら一度クリア
    log.innerHTML = "";
});

// メッセージを追加する関数
function addMessage(message) {
  const log = document.getElementById("log");
  log.innerHTML = "> " + message + "<br>";
}

// ログ出力用の関数
function addLog(message) {
  const log = document.getElementById("log");
  log.innerHTML += "> " + message + "<br>";
  log.scrollTop = log.scrollHeight; // 自動スクロール
}

// 進むボタンが押されたときの処理
async function moveForward() {
	addMessage("あなたは奥へと進んだ。");
	await wait(1);
	addMessage("・・・");
	await wait(1);
	addMessage("・・");
	await wait(1);
	addMessage("・");
}

// 休むボタンが押されたときの処理
function rest() {
  addMessage("あなたは少し休むことにした。");
  addMessage("・・・");
  addMessage("・・");
  addMessage("・");
}
