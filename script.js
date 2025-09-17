const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let lastPos = null;

let color = document.getElementById("color").value;
let brush = parseInt(document.getElementById("brush").value);
let glow = parseInt(document.getElementById("glow").value);
let symmetry = parseInt(document.getElementById("symmetry").value);
let mirror = document.getElementById("mirror").checked;
let rainbow = document.getElementById("rainbow").checked;

// Resize canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Get coordinates
function getCoords(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) {
    return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
  } else {
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
}

// Draw line
function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = brush;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = rainbow ? `hsl(${(Date.now() / 10) % 360},100%,50%)` : color;
  ctx.shadowBlur = glow;
  ctx.shadowColor = ctx.strokeStyle;
  ctx.stroke();
}

// Draw symmetry
function draw(e) {
  const { x, y } = getCoords(e);
  if (!lastPos) lastPos = { x, y };

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  for (let i = 0; i < symmetry; i++) {
    ctx.rotate((2 * Math.PI) / symmetry);
    drawLine(lastPos.x - canvas.width / 2, lastPos.y - canvas.height / 2, x - canvas.width / 2, y - canvas.height / 2);
    if (mirror) {
      ctx.scale(1, -1);
      drawLine(lastPos.x - canvas.width / 2, lastPos.y - canvas.height / 2, x - canvas.width / 2, y - canvas.height / 2);
      ctx.scale(1, -1);
    }
  }

  ctx.restore();
  lastPos = { x, y };
}

// Events
canvas.addEventListener("mousedown", e => { drawing = true; lastPos = getCoords(e); });
canvas.addEventListener("mouseup", () => { drawing = false; lastPos = null; });
canvas.addEventListener("mousemove", e => { if (drawing) draw(e); });
canvas.addEventListener("touchstart", e => { e.preventDefault(); drawing = true; lastPos = getCoords(e); }, { passive: false });
canvas.addEventListener("touchend", () => { drawing = false; lastPos = null; });
canvas.addEventListener("touchmove", e => { e.preventDefault(); if (drawing) draw(e); }, { passive: false });

// Controls
document.getElementById("color").oninput = e => color = e.target.value;
document.getElementById("brush").oninput = e => brush = parseInt(e.target.value);
document.getElementById("glow").oninput = e => glow = parseInt(e.target.value);
document.getElementById("symmetry").oninput = e => symmetry = parseInt(e.target.value);
document.getElementById("mirror").onchange = e => mirror = e.target.checked;
document.getElementById("rainbow").onchange = e => rainbow = e.target.checked;
document.getElementById("bg").onchange = e => {
  if (e.target.value === "black") document.body.style.background = "black";
  else if (e.target.value === "white") document.body.style.background = "white";
  else document.body.style.background = "linear-gradient(135deg,#000,#444)";
};

// Buttons
document.getElementById("clear").onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
document.getElementById("undo").onclick = () => ctx.clearRect(0, 0, canvas.width, canvas.height);
document.getElementById("save").onclick = () => { const a = document.createElement("a"); a.download = "silk.png"; a.href = canvas.toDataURL(); a.click(); };
document.getElementById("fullscreen").onclick = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
};

// Randomize All
document.getElementById("random").onclick = () => {
  const h = Math.floor(Math.random() * 360);
  color = `hsl(${h},100%,50%)`;
  document.getElementById("color").value = '#' + hslToHex(h, 100, 50);
  brush = Math.floor(Math.random() * 45) + 1;
  glow = Math.floor(Math.random() * 50);
  symmetry = Math.floor(Math.random() * 22) + 2;
  mirror = Math.random() < 0.5;
  rainbow = Math.random() < 0.5;
  document.getElementById("brush").value = brush;
  document.getElementById("glow").value = glow;
  document.getElementById("symmetry").value = symmetry;
  document.getElementById("mirror").checked = mirror;
  document.getElementById("rainbow").checked = rainbow;
};

// HSL to HEX
function hslToHex(h,s,l){l/=100;const a=s*Math.min(l,1-l)/100;const f=n=>{const k=(n+h/30)%12;const c=l-a*Math.max(Math.min(k-3,9-k,1),-1);return Math.round(255*c).toString(16).padStart(2,'0');};return f(0)+f(8)+f(4);}

// Hamburger toggle
const hamburger = document.getElementById("hamburger");
const menu = document.getElementById("menu");
hamburger.onclick = () => { menu.classList.toggle("show"); hamburger.classList.toggle("active"); };

// Footer rainbow animation
let hue = 0;
setInterval(() => { hue = (hue + 2) % 360; document.getElementById("footer").style.color = `hsl(${hue},100%,70%)`; }, 50);
