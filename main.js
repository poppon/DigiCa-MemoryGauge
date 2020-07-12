var canvas = document.getElementById('field');
var ctx = canvas.getContext('2d');

const FPS = 60;                   // フレームレート
const SCREEN_HEIGHT = document.documentElement.clientHeight;          // 画面サイズ
const SCREEN_WIDTH = document.documentElement.clientWidth;
const OffsetX = SCREEN_WIDTH/2;
const OffsetY = SCREEN_HEIGHT/2;
const TAMER_SIZE = SCREEN_HEIGHT/6;
const MEMORY_GAUGE_HEIGHT = SCREEN_HEIGHT*0.8;
const MEMORY_GAUGE_WIDTH = SCREEN_WIDTH-TAMER_SIZE*4;
const MEMORY_GAUGE_LINE_WIDTH = MEMORY_GAUGE_HEIGHT/16;
const MEMORY_CIRCLE_RADIUS = MEMORY_GAUGE_LINE_WIDTH*1.5;
const LINE_LENGTH = (6/4) * MEMORY_GAUGE_HEIGHT/2 * Math.PI + (MEMORY_GAUGE_WIDTH - MEMORY_GAUGE_HEIGHT/2) * 3
const BG = new Image();
BG.src='BG.png';

let text = '';
let turn = 'black';
let memory = 0;
let destination = 0;
let count = 0;
let vel = 0.1;
let mouse = {x:0,y:0};
let isDrag = false;
let toggleRed = false;
let toggleBlue = false;
let blue = 3;
let red = -3;
let preserve = 100;
let borrow = 0;
let c = 100;
let pos = {x:0, y:0};


window.onload = function() {
    /* 初期化 */
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;
    canvas.addEventListener('mousemove', mouseMove, true);
  	canvas.addEventListener('mousedown', mouseDown, true);
    canvas.addEventListener('mouseup', mouseUp, true);
    document.addEventListener("touchmove", (e)=>{e.preventDefault();}, { passive: false });
    init();

    /* ループ開始 */
    setInterval(_loop, 1000/FPS);
}

const init = () => {
  text = '';
  turn = 'black';
  memory = 0;
  destination = 0;
  count = 0;
  vel = 1/10;
  mouse = {x:0,y:0};
  isDrag = false;
  toggleRed = false;
  toggleBlue = false;
  blue = 3;
  red = -3;
  preserve = 100;
  borrow = 0;
  c = 100;
  pos = {x:0, y:0}
};

const _loop = () => {
  draw();
  move();
};

const draw = () => {
  //console.log(SCREEN_WIDTH+':'+SCREEN_WIDTH);
  ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT); // 画面をクリア
  ctx.drawImage(
    BG,
    0,
    0,
    SCREEN_WIDTH,
    SCREEN_HEIGHT
  );

//人型(赤)
  ctx.beginPath();
  ctx.arc(
    TAMER_SIZE/2,
    TAMER_SIZE*2,
    TAMER_SIZE/2,
    0, Math.PI * 2, false
  );
  ctx.arc(
    TAMER_SIZE/2,
    TAMER_SIZE,
    TAMER_SIZE/2,
    0, Math.PI * 2, false
  );
  ctx.rect(
    0,
    0,
    TAMER_SIZE,
    TAMER_SIZE
  );
  ctx.closePath();
  ctx.fillStyle = 'white';
  ctx.fill();

//人型(青)
  ctx.beginPath();
  ctx.arc(
    SCREEN_WIDTH-TAMER_SIZE/2,
    SCREEN_HEIGHT-TAMER_SIZE*2,
    TAMER_SIZE/2,
    0, Math.PI * 2, false
  );
  ctx.arc(
    SCREEN_WIDTH-TAMER_SIZE/2,
    SCREEN_HEIGHT-TAMER_SIZE,
    TAMER_SIZE/2,
    0, Math.PI * 2, false
  );
  ctx.rect(
    SCREEN_WIDTH-TAMER_SIZE,
    SCREEN_HEIGHT-TAMER_SIZE,
    TAMER_SIZE,
    TAMER_SIZE
  );
  ctx.closePath();
  ctx.fillStyle = 'white';
  ctx.fill();


//ライン
  ctx.lineWidth = MEMORY_GAUGE_LINE_WIDTH;
  ctx.beginPath();
  ctx.arc(
    SCREEN_WIDTH/2 + MEMORY_GAUGE_WIDTH/2 - MEMORY_GAUGE_HEIGHT/4,
    SCREEN_HEIGHT/2 - MEMORY_GAUGE_HEIGHT/4,
    MEMORY_GAUGE_HEIGHT/4,
    0, Math.PI*3/2, true
  );
  ctx.lineTo(SCREEN_WIDTH/2 - MEMORY_GAUGE_WIDTH/2 + MEMORY_GAUGE_HEIGHT/4, SCREEN_HEIGHT/2 - MEMORY_GAUGE_HEIGHT/2)
  ctx.arc(
    SCREEN_WIDTH/2 - MEMORY_GAUGE_WIDTH/2 + MEMORY_GAUGE_HEIGHT/4,
    SCREEN_HEIGHT/2 - MEMORY_GAUGE_HEIGHT/4,
    MEMORY_GAUGE_HEIGHT/4,
    Math.PI*3/2, Math.PI/2, true
  );
  ctx.lineTo(SCREEN_WIDTH/2 + MEMORY_GAUGE_WIDTH/2 - MEMORY_GAUGE_HEIGHT/4, SCREEN_HEIGHT/2)
  ctx.arc(
    SCREEN_WIDTH/2 + MEMORY_GAUGE_WIDTH/2 - MEMORY_GAUGE_HEIGHT/4,
    SCREEN_HEIGHT/2 + MEMORY_GAUGE_HEIGHT/4,
    MEMORY_GAUGE_HEIGHT/4,
    Math.PI*3/2, Math.PI/2, false
  );
  ctx.lineTo(SCREEN_WIDTH/2 - MEMORY_GAUGE_WIDTH/2 + MEMORY_GAUGE_HEIGHT/4, SCREEN_HEIGHT/2 + MEMORY_GAUGE_HEIGHT/2)
  ctx.arc(
    SCREEN_WIDTH/2 - MEMORY_GAUGE_WIDTH/2 + MEMORY_GAUGE_HEIGHT/4,
    SCREEN_HEIGHT/2 + MEMORY_GAUGE_HEIGHT/4,
    MEMORY_GAUGE_HEIGHT/4,
    Math.PI/2, Math.PI, false
  );
  //ctx.closePath();
  ctx.strokeStyle = 'white';
  ctx.stroke();


  if(isDrag && preserve<=10 && preserve>=-10){
    ctx.lineWidth = MEMORY_GAUGE_LINE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(memoryToPos(preserve).x ,memoryToPos(preserve).y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.strokeStyle = 'yellow';
    ctx.stroke();
  }
/*
  //マーカー
    ctx.beginPath();
    pos = memoryToPos(destination);
    ctx.arc(
      pos.x,
      pos.y,
      MEMORY_CIRCLE_RADIUS*1.1,
      0, Math.PI * 2, false
    );
    ctx.fillStyle = 'red';
    ctx.fill();
*/
//マーカー
  ctx.beginPath();
  pos = memoryToPos(memory);
  ctx.arc(
    pos.x,
    pos.y,
    MEMORY_CIRCLE_RADIUS*1.1,
    0, Math.PI * 2, false
  );
  ctx.fillStyle = 'yellow';
  ctx.fill();

// メモリー円
  ctx.beginPath();
  for(i = -10; i < 11; i++){
    let pos = memoryToPos(i);
    ctx.arc(
      pos.x,
      pos.y,
      MEMORY_CIRCLE_RADIUS,
      0, Math.PI * 2, false
    );

    // パスをいったん閉じる
    ctx.closePath();
  };

  ctx.fillStyle = 'white';
  ctx.fill();

//目盛り
    ctx.font = "50px 'Orbitron'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.beginPath();
    for(i = -10; i < 11; i++){
      //塗りつぶしのテキストを、座標(20, 75)の位置に最大幅200で描画する
      if (i==0) {
        let pos = memoryToPos(0);

        ctx.fillStyle = turn;
        ctx.fillText("0", pos.x, pos.y, MEMORY_CIRCLE_RADIUS*3);
        ctx.closePath();
      }else if(i<0){
        let pos = memoryToPos(-i);
        ctx.save();
        ctx.rotate(Math.PI);

        ctx.fillStyle = "black";
        ctx.fillText((-i)+'', pos.x+5-SCREEN_WIDTH, pos.y+5-SCREEN_HEIGHT, MEMORY_CIRCLE_RADIUS*3);
        ctx.closePath();

        ctx.fillStyle = "red";
        ctx.fillText((-i)+'', pos.x-SCREEN_WIDTH, pos.y-SCREEN_HEIGHT, MEMORY_CIRCLE_RADIUS*3);
        ctx.closePath();
        ctx.restore();
      }else{
        let pos = memoryToPos(i);
        ctx.fillStyle = "black";
        ctx.fillText(""+Math.abs(i), pos.x+5, pos.y+5, MEMORY_CIRCLE_RADIUS*3);
        ctx.closePath();

        ctx.fillStyle = "blue";
        ctx.fillText(""+Math.abs(i), pos.x, pos.y, MEMORY_CIRCLE_RADIUS*3);
        ctx.closePath();
      };

    };


    ctx.font = "50px 'Orbitron'";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "white";
    ctx.fillText(text, OffsetX, OffsetY + MEMORY_CIRCLE_RADIUS*2, MEMORY_CIRCLE_RADIUS*3);
    ctx.closePath();

    ctx.save();
    ctx.rotate(Math.PI);
    ctx.fillText(text, OffsetX-SCREEN_WIDTH, OffsetY + MEMORY_CIRCLE_RADIUS*2-SCREEN_HEIGHT, MEMORY_CIRCLE_RADIUS*3);
    ctx.closePath();
    ctx.restore();

    if(toggleRed){
      ctx.save();
      ctx.rotate(Math.PI);
      ctx.fillStyle = "black";
      ctx.fillText(3, -TAMER_SIZE/2, -TAMER_SIZE*2, MEMORY_CIRCLE_RADIUS*3);
      ctx.closePath();
      ctx.restore();
    }

    if(toggleBlue){
      ctx.fillStyle = "black";
      ctx.fillText(3, SCREEN_WIDTH-TAMER_SIZE/2, SCREEN_HEIGHT-TAMER_SIZE*2, MEMORY_CIRCLE_RADIUS*3);
      ctx.closePath();
    }


};



const move = () => {
  //text = 'm: '+memory+', d:'+destination+', b:'+borrow;
  //console.log('m: '+memory+', d:'+destination+', b:'+borrow);
  if(destination>=10){
    destination = 10;
  }else if (destination<=-10) {
    destination = -10;
  }
  if(memory>10){
    memory = 10;
  }else if (memory<-10) {
    memory = -10;
  }

  if(toggleRed && turn=='blue' && destination>red && destination<0 ){
    destination = red;
  }else if(toggleBlue && turn=='red' && destination>0 && destination<blue ){
    destination = blue;
  }

  if((turn=='blue' && destination<-0 && borrow>0)||(turn=='red' && destination>0 && borrow<-0)){
    //console.log('d:'+destination+' b: '+borrow);
    destination = destination - borrow;
    //console.log('= '+destination);
    borrow = 0;
  }

  if(Math.abs(destination-memory)<0.1){
    memory = destination;
  }else if(destination-memory>0){
    memory += vel;
  }else if (destination-memory<0) {
    memory -= vel;
  }

  if(memory>0.3){
    turn = 'blue';
  }else if (memory<-0.3) {
    turn = 'red';
  }
};

const memoryToPos = (i) => {
  let res = {};
  res.x = 0;
  res.y = 0;
  let axisX = (LINE_LENGTH/2) * (i / 10);  //0~20
  const qC = MEMORY_GAUGE_HEIGHT*Math.PI/8; //四半円長
  const mL = MEMORY_GAUGE_WIDTH - (MEMORY_GAUGE_HEIGHT/2);  //横ライン長さ
  if (axisX<(-2*qC-3*mL/2)) { //第一円弧
    res.x = (MEMORY_GAUGE_HEIGHT/4)*(-1)*Math.sin((Math.PI/2)*(axisX+3*mL/2+2*qC)/qC) + SCREEN_WIDTH/2 + mL/2;
    res.y = (MEMORY_GAUGE_HEIGHT/4)*(-1)*Math.cos((Math.PI/2)*(axisX+3*mL/2+2*qC)/qC) + SCREEN_HEIGHT/2 - MEMORY_GAUGE_HEIGHT/4;
  }else if (axisX<(-2*qC-mL/2)) { //第一直線
    res.x = SCREEN_WIDTH/2 - (axisX+(mL+2*qC));
    res.y = SCREEN_HEIGHT/2 - MEMORY_GAUGE_HEIGHT/2;
  }else if (axisX<(-1*mL/2)) { //第二円弧
    res.x = (MEMORY_GAUGE_HEIGHT/4)*Math.sin((Math.PI/2)*(axisX+mL/2)/qC) + SCREEN_WIDTH/2 - mL/2;
    res.y = (MEMORY_GAUGE_HEIGHT/4)*Math.cos((Math.PI/2)*(axisX+mL/2)/qC) + SCREEN_HEIGHT/2 - MEMORY_GAUGE_HEIGHT/4;
  }else if (axisX<(mL/2)) { //第二直線
    res.x = SCREEN_WIDTH/2 + axisX;
    res.y = SCREEN_HEIGHT/2;
  }else if (axisX<(mL/2+2*qC)) { //第三円弧
    res.x = (MEMORY_GAUGE_HEIGHT/4)*Math.sin((Math.PI/2)*(axisX-mL/2)/qC) + SCREEN_WIDTH/2 + mL/2;
    res.y = (MEMORY_GAUGE_HEIGHT/4)*(-1)*Math.cos((Math.PI/2)*(axisX-mL/2)/qC) + SCREEN_HEIGHT/2 + MEMORY_GAUGE_HEIGHT/4;
  }else if (axisX<(2*qC+3*mL/2)) { //第三直線
    res.x = SCREEN_WIDTH/2 - (axisX-(mL+2*qC));
    res.y = SCREEN_HEIGHT/2 + MEMORY_GAUGE_HEIGHT/2;
  }else { //第四円弧
    res.x = (MEMORY_GAUGE_HEIGHT/4)*(-1)*Math.sin((Math.PI/2)*(axisX-3*mL/2-2*qC)/qC) + SCREEN_WIDTH/2 - mL/2;
    res.y = (MEMORY_GAUGE_HEIGHT/4)*Math.cos((Math.PI/2)*(axisX-3*mL/2-2*qC)/qC) + SCREEN_HEIGHT/2 + MEMORY_GAUGE_HEIGHT/4;
  };

  return res;
};

const checkDistance = (x,y) => {
  for(i = -10; i < 11; i++){
    let pos = memoryToPos(i);
    if((pos.x - x)*(pos.x - x) + (pos.y - y)*(pos.y - y) <= MEMORY_CIRCLE_RADIUS*MEMORY_CIRCLE_RADIUS*2){
      return i;
    };

  }
  return 100;
};

const checkHuman = (x, y) => {
  if(x<TAMER_SIZE*1.2 && y<2.5*1.2*TAMER_SIZE){
    return -1;
  }else if(x>SCREEN_WIDTH-TAMER_SIZE*1.2 && y>SCREEN_HEIGHT-2.5*1.2*TAMER_SIZE) {
    return 1;
  }
  return 0;
}

// - event --------------------------------------------------------------------
function mouseMove(event){
    // マウスカーソル座標の更新
    mouse.x = event.clientX - canvas.offsetLeft;
    mouse.y = event.clientY - canvas.offsetTop;
}
function mouseDown(event){
  mouseMove(event);
    // フラグを立てる
    isDrag = true;
    switch (checkHuman(mouse.x,mouse.y)) {
      case -1 : toggleRed  = !toggleRed;
        break;
      case 1  : toggleBlue = !toggleBlue;
        break;
      default:
    }
    let c = checkDistance(mouse.x,mouse.y)
    if(c<=10 && c>=-10){
      //destination = c;
      text = Math.abs(memory-c);
      if(c==memory){
        preserve = c;
      }else{
        preserve = 100;
      }
    }
}

function mouseUp(event){
  mouseMove(event);
    isDrag = false;
    let c = checkDistance(mouse.x,mouse.y)
    if(preserve<=10 && preserve>=-10 && c<=10 && c>=-10){
      borrow += c - preserve;
      console.log(borrow);
    }
    preserve = 0;
    if(c<=10&&c>=-10){destination = c;}
}
