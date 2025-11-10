// ログ出力用の関数
function addLog(message) {
  const log = document.getElementById("log");
  log.innerHTML += "> " + message + "<br>";
  log.scrollTop = log.scrollHeight; // 自動スクロール
}

// 進むボタンが押されたときの処理
function moveForward() {
  addLog("あなたは奥へと進んだ。");
  addLog("・・・");
  addLog("・・");
  addLog("・");
}

// 休むボタンが押されたときの処理
function rest() {
  addLog("あなたは少し休むことにした。");
  addLog("・・・");
  addLog("・・");
  addLog("・");
}
