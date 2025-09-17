const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let drawing=false, lastPos=null;

let color=document.getElementById("color").value;
let brush=document.getElementById("brush").value;
let glow=document.getElementById("glow").value;
let symmetry=document.getElementById("symmetry").value;
let mirror=document.getElementById("mirror").checked;
let rainbow=document.getElementById("rainbow").checked;
let smooth=document.getElementById("smooth").checked;

function resizeCanvas(){
  canvas.width=window.innerWidth;
  canvas.height=window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function getCoords(e){
  const rect=canvas.getBoundingClientRect();
  if(e.touches) return {x:e.touches[0].clientX-rect.left, y:e.touches[0].clientY-rect.top};
  return {x:e.clientX-rect.left, y:e.clientY-rect.top};
}

function draw(e){
  const {x,y}=getCoords(e);
  if(!lastPos) lastPos={x,y};

  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  for(let i=0;i<symmetry;i++){
    ctx.rotate((2*Math.PI)/symmetry);
    drawLine(lastPos.x-canvas.width/2,lastPos.y-canvas.height/2,x-canvas.width/2,y-canvas.height/2);
    if(mirror){
      ctx.scale(1,-1);
      drawLine(lastPos.x-canvas.width/2,lastPos.y-canvas.height/2,x-canvas.width/2,y-canvas.height/2);
      ctx.scale(1,-1);
    }
  }
  ctx.restore();
  lastPos={x,y};
}

function drawLine(x1,y1,x2,y2){
  ctx.beginPath();
  ctx.moveTo(x1,y1);
  ctx.lineTo(x2,y2);
  ctx.lineWidth=brush;
  ctx.lineCap="round";
  ctx.lineJoin="round";
  ctx.strokeStyle=rainbow?`hsl(${(Date.now()/10)%360},100%,50%)`:color;
  ctx.shadowBlur=glow;
  ctx.shadowColor=ctx.strokeStyle;
  ctx.stroke();

  const dx=x2-x1, dy=y2-y1, dist=Math.hypot(dx,dy);
  for(let i=0;i<dist;i+=15){
    const px=x1+dx*i/dist;
    const py=y1+dy*i/dist;
    ctx.beginPath();
    ctx.arc(px,py,Math.max(1,brush/5),0,Math.PI*2);
    ctx.fillStyle=rainbow?`hsl(${(Date.now()/10+i)%360},100%,50%)`:color;
    ctx.fill();
  }
}

// Drawing events
canvas.addEventListener("mousedown",e=>{drawing=true; lastPos=getCoords(e);});
canvas.addEventListener("mouseup",()=>{drawing=false; lastPos=null;});
canvas.addEventListener("mousemove",e=>{if(drawing) draw(e);});
canvas.addEventListener("touchstart",e=>{e.preventDefault();drawing=true; lastPos=getCoords(e);},{passive:false});
canvas.addEventListener("touchend",()=>{drawing=false; lastPos=null;});
canvas.addEventListener("touchmove",e=>{e.preventDefault();if(drawing) draw(e);},{passive:false});

// Controls
document.getElementById("color").oninput=e=>color=e.target.value;
document.getElementById("brush").oninput=e=>brush=e.target.value;
document.getElementById("glow").oninput=e=>glow=e.target.value;
document.getElementById("symmetry").oninput=e=>symmetry=e.target.value;
document.getElementById("mirror").onchange=e=>mirror=e.target.checked;
document.getElementById("rainbow").onchange=e=>rainbow=e.target.checked;
document.getElementById("smooth").onchange=e=>smooth=e.target.checked;
document.getElementById("bg").onchange=e=>{
  if(e.target.value==="black") document.body.style.background="black";
  else if(e.target.value==="white") document.body.style.background="white";
  else document.body.style.background="linear-gradient(135deg,#000,#444)";
};

// Randomize button fix
document.getElementById("random").onclick = () => {
  const h = Math.floor(Math.random() * 360);
  color = `hsl(${h},100%,50%)`;
  document.getElementById("color").value = '#' + hslToHex(h,100,50);
};
function hslToHex(h,s,l){
  l/=100;
  const a=s*Math.min(l,1-l)/100;
  const f=n=>{
    const k=(n+h/30)%12;
    const color=l-a*Math.max(Math.min(k-3,9-k,1),-1);
    return Math.round(255*color).toString(16).padStart(2,'0');
  }
  return f(0)+f(8)+f(4);
}

document.getElementById("undo").onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);};
document.getElementById("clear").onclick=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);};
document.getElementById("save").onclick=()=>{
  const link=document.createElement("a");
  link.download="silk.png";
  link.href=canvas.toDataURL();
  link.click();
};
document.getElementById("fullscreen").onclick=()=>{
  if(!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};

// Hamburger toggle
const hamburger=document.getElementById("hamburger");
const menu=document.getElementById("menu");
hamburger.onclick=()=>{
  menu.classList.toggle("show");
  hamburger.classList.toggle("active");
};

// Footer rainbow animation
let hue=0;
setInterval(()=>{hue=(hue+2)%360;document.getElementById("footer").style.color=`hsl(${hue},100%,70%)`;},50);
