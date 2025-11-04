let score = 0;

window.onload = () => {
  const screen = document.getElementById("screen");
  const scoreText = document.getElementById("score");

  screen.addEventListener("pointerdown", () => {
    score++;
    scoreText.textContent = score;
  });
};

screen.on("pointerdown", () => {
  //ここに処理を書く
  console.log("タップされました");
});
