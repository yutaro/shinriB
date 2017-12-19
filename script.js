let vm = new Vue({
  el : '#app',
  data : {
    oppState : 0,
    state : 0,
    really : true
  }
});

class MyCursor{
	constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.visco = 1;
  }
  
  draw(){
  	if(this.visco == 1){
    	this.x = mouseX;
      this.y = mouseY;
    }else{
      this.x += (mouseX - this.x) * 0.1 / this.visco;
      this.y += (mouseY - this.y) * 0.1 / this.visco;
    }
  
  	fill(255);
    stroke(0);
    strokeWeight(0.4);
    ellipse(this.x,this.y,this.r*2, this.r*2);
    noStroke();
    fill(210,8,13);
    ellipse(this.x,this.y,this.r*1.3, this.r*1.3);
  }
}

class Area{
	constructor(cx, cy, wid, hig, visco, color, soundName, soundRate){
    this.x = cx - wid/2;
    this.y = cy - hig/2;
    this.wid = wid;
    this.hig = hig;
    this.visco = visco;//viscocity: 粘度 の意
    this.color = color;
    this.sound = loadSound(soundName);
    this.soundRate = soundRate;
  }
  
  mouseover(x, y){
  	return (x > this.x && x < this.x + this.wid && y > this.y && y < this.y + this.hig);
  }
  draw(){
    noStroke();
  	fill(this.color);
  	rect(this.x,this.y,this.wid,this.hig);
  }
  
}

var state = 0;
var soundDampable;

var areas =[];
var myCursor;
var touching = 0;
var playingSound;
var playingRate;

//状態のあれ
function changeState(nextState){
  console.log("state: "+state+" -> "+nextState);
  state = nextState;
  stateWakeup();
  console.log(areas);
}

var count;
function stateWakeup(){
  switch(state){
  case 0://準備
    count = 0;
  case 1://準備
    soundDampable = false;

    break;

  case 2://実験１回目
    areas.shift();
    break;

  case 3://準備
    soundDampable = !soundDampable;

    playingSound.stop();
    playingSound.play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1, pan: 0 });//
    areas.unshift(new Area(0, 0, width*2, height*2, 1, color(130, 80), "sound_100.mp3", 1));
    break;

  case 4://実験２回目
    areas.shift();
    break;
  case 5://終了
    areas.unshift(new Area(0, 0, width*2, height*2, 1, color(130, 80), "sound_100.mp3", 1));
    break;
  }

  vm.state = state;
  vm.really = really;
}

var really = false;
var reallyTime = 0;

function stateUpdate(){
  count++;
  if(playingSound == undefined)return;
  textSize(32);
  textAlign(CENTER);
  fill(255);


  switch(state){
    case 0:
      if(count > 20)text("画面内をクリックすると 次のステップへと進みます。", width/2, height/6);
      else text("準備中...", width/2, height/6);
      break;
    case 1:
    case 3:
      playingSound.play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: -1, pan: 0 });
      text("数秒間待つと 実験が開始されます。", width/2, height/6);
      if(playingSound.position > 3000/ playingRate){
        changeState(state+1);
      }
      break;

    case 5:
      text("実験は以上です お疲れ様でした。\n画面内クリックで音声のon/off", width/2, height/8);
      break;

    default:
      if(playingSound.position > 6000 / playingRate){
        fill(130);
        if(really == false){
          reallyTime = 0;
          text("画面下部のアンケートのお答えください\n画面内をクリックすると 次のステップへと進みます。", width/2, height/8);
        }
        else{
          reallyTime++;
          if(!areas[areas.length-1].mouseover(mouseX, mouseY))really = false;
          fill(200, 120, 120);
          if(reallyTime > 90) text("アンケートの記入は完了しましたか？\nもう一度画面内をクリックすると \n次のステップへと進みます。", width/2, height/10);
          else                text("アンケートの記入は完了しましたか？\n 時間をおいて もう一度画面内をクリックすると \n次のステップへと進みます。", width/2, height/10);
        }
      }
      break;
  }
}

function mouseClicked(){
  if(state == 0 && count > 20){
    if(areas[areas.length-1].mouseover(mouseX, mouseY))changeState(1);
  }
  if(state == 2 || state == 4){
    if(playingSound.position > 6000 / playingRate){
      if(really == false){really = true;}
      else{
        if(areas[areas.length-1].mouseover(mouseX, mouseY) && reallyTime > 90){
          changeState(state+1);really=false;
        }
      }
      
    }
  }
  if(state == 5){
    
    if(areas[areas.length-1].mouseover(mouseX, mouseY))playingSound.paused = !playingSound.paused;
  }
}

function setup() {
  let canvas = createCanvas(1080, 720);
  canvas.parent("display");
  myCursor = new MyCursor(0,0,6.5);
  noCursor();
  
}

window.onload = function () {
  playingSound = loadSound("sound_100.mp3");
  playingRate = 1;

  //areas[]はマウスオーバーの優先度順(降順)にソート
  areas.push(new Area(width/2, height/2, width, height, 1, color(130, 150), "sound_100.mp3", 1));
  areas.push(new Area(width/4, height/2, width/3, height/2, 1.2, color(200, 230, 180), "sound_70.mp3", 0.7));
  areas.push(new Area(width*3/4, height/2, width/3, height/2, 3, color(130, 120, 170), "sound_45.mp3", 0.45));
  areas.push(new Area(width/2, height/2, width, height, 1, color(250,250,250), "sound_100.mp3", 1));
  changeState(0);//init state
}

function draw() {
  background(255);
  
  
  //マウスオーバーの検出、処理
	for(let i=0; i<areas.length; i++){//順走査
  	if(areas[i].mouseover(myCursor.x, myCursor.y)){
      touching = i;
      myCursor.visco = areas[i].visco;
      if(soundDampable)
      if(playingSound!=areas[i].sound)changeSound(playingSound, playingRate, areas[i].sound, areas[i].soundRate);
      break;
    }
  }

  //描画
  for(let i=areas.length-1; i>=0; i--) areas[i].draw();//逆走査

  stateUpdate();

  myCursor.draw();
}


//音声の再生に関するいくつか

function loadSound(name){//ファイル読み込み
  createjs.Sound.registerSound(name);
  return createjs.Sound.createInstance(name);
}

function changeSound(current, currentRate, next, nextRate){//
  if(current == undefined)return;
  let nextPos = current.position * (currentRate / nextRate);
  console.log(current, currentRate, next, nextRate);
  current.stop();
  next.play({ interrupt: createjs.Sound.INTERRUPT_ANY, offset:nextPos, loop: -1, pan: 0 });
  playingSound = next;
  playingRate = nextRate;
}

function stopSound() {
  // IDを使って停止します。
  playingSound.stop();
  document.js.bpmBox.disabled = "";
  playButton = document.getElementById("playButton").textContent = "楽曲を再生する";
}

function playSound(pass, loop_ = 1, pan_ = 0.5) {
  createjs.Sound.createInstance(pass).play({ interrupt: createjs.Sound.INTERRUPT_ANY, loop: loop_, pan: pan_ });//playは重
}