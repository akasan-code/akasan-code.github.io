//設定用
const Config = {
  //画面の解像度
  Screen: {
    Width: 256,//幅
    Height: 384,//高さ
    BackGroundColor: 0x000000,//背景色
  },
  //音量(０～１で設定)
  Volume: {
    Bgm: 1,
    Sound: 1
  }
}
//読みこむデータリスト(名前：ファイルパス)
const Resource = {
  Sound: 'assets/damage.mp3',
}

//上のリストを読み込みやすい形に変えてます
const assets = [];
for (let key in Resource) {
  assets.push(Resource[key]);
}

let core;//ゲームの基幹プログラム用の変数

//ブラウザの読み込みが完了したら実行されます
window.onload = () => {
  //設定した画面サイズでcoreを作成
  core = new Game(Config.Screen.Width, Config.Screen.Height, Config.Screen.BackGroundColor);
  
  //データのロード
  core.preload(assets);

  //読み込み完了でメインシーンに切り替わります
  core.onload = () => {
    core.replaceScene(new MainScene());
  }
}

//ゲームで使う変数(グローバル)
let layer;
let pic;
let player;
let obstacles = [];

//メインシーン
class MainScene extends Container {
  constructor(){
    super();
    this.interactive = true;//タッチできるようにする
    this.isTouching = false;//タッチチェック用
  
    this.renderTexture1 = new PIXI.RenderTexture.create({width: Config.Screen.Width, height: Config.Screen.Height});
    this.renderTexture2 = new PIXI.RenderTexture.create({width: Config.Screen.Width, height: Config.Screen.Height});
    this.renderFlip = true;

    //コンテナだけではタッチできないので空のSpriteを作ってます
    const bg = new PIXI.Sprite();
    bg.width = Config.Screen.Width;
    bg.height = Config.Screen.Height;
    this.addChild(bg);

    const radius = 32;//障害物の半径
    const max = Config.Screen.Height / (radius*2) | 0;//半径に合わせて障害物の最大数を決める
    for(let i = 0; i <= max; i++){
      obstacles[i] = new Obstacle(radius);
      obstacles[i].y = -i*radius*2 - radius;//画面の上側に重ならないように移動
      obstacles[i].x = Math.random() * Config.Screen.Width | 0;//ｘ座標はランダム
      this.addChild(obstacles[i]);
    }
    
    //プレイヤーと残像用のレイヤー
    layer = new Container();
    this.addChild(layer);
    
    //残像用スプライト
    pic = new PIXI.Sprite();
    pic.y = 1;
    pic.alpha = 0.95;
    layer.addChild(pic);

    //プレイヤー
    player = new Player();
    layer.addChild(player);

    //画面タッチイベント
    this.on('pointerdown', () => {
      this.isTouching = true;
    });
    this.on('pointerup', () => {
      this.isTouching = false;
    });


    //ボリューム設定
    core.resources[Resource.Sound].sound.volume = Config.Volume.Sound;
  }
  //更新処理
  update(delta){
    super.update(delta);   
    //プレイヤーと障害物の当たり判定
    for(let i = 0; i < obstacles.length; i++){
      const dx = player.x - obstacles[i].x; 
      const dy = player.y - obstacles[i].y; 
      if(dx * dx + dy * dy < (obstacles[i].radius + 1) * (obstacles[i].radius + 1)){
        //当たったらゲームオーバー画面を表示
        core.resources[Resource.Sound].sound.play();
        core.pushScene(new Gameover());
        return;
      }
    }

    if(this.isTouching){//押してる間は右に移動
      player.moveRight();
    }else{//押していない場合は左に移動
      player.moveLeft();
    }

    //2つのテクスチャーを交互に使う
    if(this.renderFlip = !this.renderFlip){
      core.app.renderer.render(layer, this.renderTexture1);
      pic.texture = this.renderTexture1;
    }else{
      core.app.renderer.render(layer, this.renderTexture2);
      pic.texture = this.renderTexture2;
    }
  }
}
//プレイヤーのクラス
class Player extends Graphics {
  constructor(){
    super();
    this.accel = 0.03;//左右移動の加速度
    this.vx = 0;//左右移動の速さ
    this.maxVx = 1;//左右移動の最大値
    this.position.set(128, 256);//初期位置
    this.rectFill(0, 0, 2, 2, 0xffffff);//プレイヤー(四角形)
    this.pivot.set(1, 1);//中心位置を1ドットずらしている(四角だと左上にあるので)
  }
  //右移動
  moveRight(){
    this.vx += this.accel;
    if(this.vx > this.maxVx){
      this.vx = this.maxVx;
    }
  }
  //左移動
  moveLeft(){
    this.vx -= this.accel;
    if(this.vx < -this.maxVx){
      this.vx = -this.maxVx;
    }
  }
  //更新処理
  update(delta){
    super.update(delta);
    this.x += this.vx;

    //画面端のチェック() 
    if(this.x < 0){
      this.x = 0;
      this.vx = 0;
    } 
    if(this.x > Config.Screen.Width){
      this.x = Config.Screen.Width;
      this.vx = 0;
    } 
  }
}

//障害物用のクラス
class Obstacle extends Graphics {
  constructor(radius){
    super();
    this.radius = radius;
    this.circFill(0, 0, this.radius, 0xff00ff);
    this.y = -this.radius;
    this.x = Config.Screen.Width * 0.5;
  }
  update(delta){
    super.update(delta);
    this.y++;
    //画面の下から出た場合の処理
    if(this.y > Config.Screen.Height + this.radius){
      this.y = -this.radius;//画面上に戻す
      this.x = Math.random() * Config.Screen.Width | 0;//x座標をランダムで変える
    }
  }
}

//ゲームオーバーシーン
class Gameover extends Container {
  constructor(){
    super();

    this.interactive = true;//タッチできるようにする

    //半透明のくらい背景を作る
    const back = new Graphics();
    back.rectFill(0, 0, Config.Screen.Width, Config.Screen.Height, 0x000000);
    back.alpha = 0.5;
    this.addChild(back);

    //Game Overの文字表示
    const style = new PIXI.TextStyle({
      fontFamily: 'sans-serif',//フォントの種類
      fontSize: 32,//大きさ
      fill: 0xff0000,//色
      fontWeight: 'bold',//文字の太さ
      stroke: 0xffffff,//縁取りの色
      strokeThickness: 2,//縁取りの太さ
    });
    const p = new PIXI.Text("Game Over", style);
    p.anchor.set(0.5, 0.5);//中心を文字の真ん中に
    p.position.set(Config.Screen.Width*0.5, Config.Screen.Height*0.5);//画面の真ん中に配置
    this.addChild(p);


    //リスタートの説明表示
    const style2 = new PIXI.TextStyle({
      fontFamily: 'sans-serif',//フォントの種類
      fontSize: 16,//大きさ
      fill: 0xffffff,//色
    });
    const p2 = new PIXI.Text("タッチでリスタート", style2);
    p2.anchor.set(0.5, 0.5);//中心を文字の真ん中に
    p2.position.set(Config.Screen.Width*0.5, Config.Screen.Height*0.7);
    this.addChild(p2);

    this.on('pointerdown', () => {
      //シーンを新しく作り変える(古いシーンは自動的に破棄されます)
      core.replaceScene(new MainScene());
      return;
    });
  }
}