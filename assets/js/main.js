(() => {

// ===== SCROLL REVEAL =====
const io = new IntersectionObserver(e => {
  e.forEach(x => { if (x.isIntersecting) x.target.classList.add('vis'); });
}, { threshold: 0.07, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-up').forEach(el => io.observe(el));

// ===== COUNTERS =====
const fmt = (n, target) => target >= 1000
  ? (target >= 500000 ? Math.round(n/1000)+'K' : Math.round(n/100)*100 >= 1000 ? (n/1000).toFixed(1)+'K' : Math.round(n).toString())
  : Math.round(n).toString();
const cio = new IntersectionObserver(e => {
  e.forEach(el => {
    if (!el.isIntersecting || el.target._done) return;
    el.target._done = true;
    const target = +el.target.dataset.target;
    const start = performance.now();
    const dur = 1600;
    const tick = now => {
      const t = Math.min((now-start)/dur, 1);
      const ease = 1 - Math.pow(1-t, 3);
      el.target.textContent = fmt(ease*target, target);
      if (t < 1) requestAnimationFrame(tick);
      else el.target.textContent = fmt(target, target);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => cio.observe(el));

// ===== IOC TABS =====
document.querySelectorAll('.itab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.itab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.ipane').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const pane = document.getElementById('tab-' + tab.dataset.tab);
    if (pane) pane.classList.add('active');
  });
});

// ===== COPY IOCs =====
window.copyIOC = (type) => {
  const pane = document.getElementById('tab-' + type);
  if (!pane) return;
  const vals = Array.from(pane.querySelectorAll('td:first-child code')).map(c => c.textContent.trim());
  navigator.clipboard.writeText(vals.join('\n')).then(() => {
    const btn = pane.querySelector('.copybtn');
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '✓ Copied';
    setTimeout(() => btn.textContent = orig, 1600);
  });
};

// ===== SCROLL SPY =====
const sections = document.querySelectorAll('section[id], header[id]');
const navLinks = document.querySelectorAll('.nav__links a');
window.addEventListener('scroll', () => {
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 80) cur = s.id; });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));
}, { passive: true });

// ===== ATTACK CHAIN CANVAS =====
const canvas = document.getElementById('attackCanvas');
if (!canvas) return;
const ctx = canvas.getContext('2d');
const W = canvas.width, H = canvas.height;

// Responsive scaling
function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const s = Math.min(1, (rect.width - 32) / W);
  canvas.style.width  = (W * s) + 'px';
  canvas.style.height = (H * s) + 'px';
}
resize();
window.addEventListener('resize', resize);

// Color palette from the image / site
const C = {
  red:    '#ff1a3c',
  purple: '#b44dff',
  amber:  '#ffd60a',
  green:  '#00ff6e',
  cyan:   '#38c8ff',
  blue:   '#4361ee',
};

// Nodes: id, label, sub, x, y, color
const NODES = [
  { id:'react', label:'React2Shell',    sub:'CVE-2025-55182\nDec 2025',         x:65,  y:280, c:C.red    },
  { id:'trivy', label:'Trivy Action',   sub:'Mar 19 · 75/76 tags\nCVE-2026-33634', x:230, y:130, c:C.red    },
  { id:'kics',  label:'KICS Docker',    sub:'Mar 23 · Apr 22\n35 tags hijacked', x:230, y:420, c:C.red    },
  { id:'devA',  label:'Token Harvest',  sub:'npm + PyPI + AWS\nSSH + K8s + GitHub', x:420, y:210, c:C.amber  },
  { id:'bwci',  label:'Bitwarden CI',   sub:'OIDC exfil\nApr 22–23',            x:420, y:400, c:C.amber  },
  { id:'worm',  label:'CanisterWorm',   sub:'66+ npm packages\nMar 20 · ICP C2', x:590, y:75,  c:C.purple },
  { id:'llm',   label:'LiteLLM',        sub:'PyPI · .pth persist\nMar 24',       x:590, y:195, c:C.blue   },
  { id:'telnyx',label:'Telnyx',         sub:'WAV stego\nMar 27',                x:590, y:310, c:C.blue   },
  { id:'xinf',  label:'Xinference',     sub:'AI inference\nApr 22 · Denied',    x:590, y:425, c:C.blue   },
  { id:'bw',    label:'@bitwarden/cli', sub:'npm · Apr 23\naudit.checkmarx.cx', x:770, y:340, c:C.blue   },
  { id:'devB',  label:'SAP Dev Machine',sub:'Claude Code active\ninfected host', x:800, y:450, c:C.amber  },
  { id:'capjs', label:'SAP cap-js',     sub:'4 packages · Apr 29\nClaude Code pivot', x:980, y:450, c:C.blue },
  { id:'icp',   label:'ICP Canister',   sub:'tdtqy-oyaaa-...\nNo takedown',      x:820, y:90,  c:C.green  },
  { id:'light', label:'lightning',      sub:'PyPI · 2.6.2/2.6.3\nApr 30',        x:1080, y:120, c:C.blue   },
  { id:'intc',   label:'intercom-client', sub:'npm · 7.0.4\nGitHub token',          x:1240, y:245, c:C.blue   },
  { id:'intphp', label:'intercom-php',    sub:'Packagist · 5.0.2\nComposer plugin', x:1240, y:400, c:C.cyan   },
  { id:'jenkins',label:'CX Jenkins',      sub:'May 9 · 2026.5.09\ncreds never rotated', x:700, y:510, c:C.red    },
  { id:'tanstack',label:'TanStack Wave',  sub:'172 pkgs · SLSA bypass\nMay 11 · OIDC cache', x:1450, y:300, c:C.purple },
];
const NM = Object.fromEntries(NODES.map(n => [n.id, n]));

const EDGES = [
  { f:'react',  t:'trivy',  label:'',                        dash:true  },
  { f:'trivy',  t:'devA',   label:'npm tokens stolen'                   },
  { f:'kics',   t:'devA',   label:'creds harvested'                     },
  { f:'kics',   t:'bwci',   label:'KICS Docker → Bitwarden CI'          },
  { f:'devA',   t:'worm',   label:'worm propagation'                    },
  { f:'devA',   t:'llm',    label:'PYPI_PUBLISH_PASSWORD'               },
  { f:'llm',    t:'telnyx', label:'same C2 infra'                       },
  { f:'devA',   t:'xinf',   label:''                                    },
  { f:'llm',    t:'icp',    label:'',                         dash:true  },
  { f:'worm',   t:'icp',    label:'',                         dash:true  },
  { f:'bwci',   t:'bw',     label:'stolen OIDC token'                   },
  { f:'bw',     t:'devB',   label:'infects SAP dev'                     },
  { f:'devB',   t:'capjs',  label:'claude@github\nno token needed'      },
  { f:'capjs',  t:'light',  label:'same actor\nApr 30',                  dash:true  },
  { f:'light',  t:'intc',   label:'GitHub token stolen'                             },
  { f:'intc',   t:'intphp',  label:'worm propagation'                                         },
  { f:'kics',   t:'jenkins', label:'creds never rotated\nMay 9',          dash:true            },
  { f:'intc',   t:'tanstack',label:'worm continues\nMay 11',              dash:true            },
];

// Particles
const PARTICLES = [];
EDGES.filter(e => !e.dash).forEach(e => {
  for (let i = 0; i < 3; i++) {
    PARTICLES.push({ e, t: Math.random(), speed: 0.0025 + Math.random() * 0.003 });
  }
});

let frame = 0;

function drawBG() {
  ctx.fillStyle = '#0e0015';
  ctx.fillRect(0, 0, W, H);
  // Grid
  ctx.strokeStyle = 'rgba(90,0,160,0.06)';
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 60) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += 60) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  // Halftone dots
  ctx.fillStyle = 'rgba(180,77,255,0.04)';
  for (let x = 14; x < W; x += 28)
    for (let y = 14; y < H; y += 28) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI*2); ctx.fill();
    }
}

function drawPhaseLabel(label, x, color) {
  ctx.fillStyle = color + '18';
  ctx.strokeStyle = color + '35';
  ctx.lineWidth = 1;
  const w = 130, h = 28, rx = x - w/2, ry = 8;
  ctx.beginPath();
  ctx.roundRect(rx, ry, w, h, 4);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = '8px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  label.split('\n').forEach((l, i) => ctx.fillText(l, x, ry + 11 + i * 10));
}

function drawEdge(e) {
  const s = NM[e.f], d = NM[e.t];
  if (!s || !d) return;
  const dx = d.x - s.x, dy = d.y - s.y;
  const len = Math.sqrt(dx*dx + dy*dy);
  const nx = dx/len, ny = dy/len;
  const r = 30;
  const sx = s.x + nx*r, sy = s.y + ny*r;
  const ex = d.x - nx*r, ey = d.y - ny*r;

  ctx.beginPath();
  if (e.dash) ctx.setLineDash([5,5]);
  else ctx.setLineDash([]);
  ctx.moveTo(sx, sy); ctx.lineTo(ex, ey);
  ctx.strokeStyle = s.c + '55';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrow
  const ang = Math.atan2(ey-sy, ex-sx);
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - 8*Math.cos(ang-.4), ey - 8*Math.sin(ang-.4));
  ctx.lineTo(ex - 8*Math.cos(ang+.4), ey - 8*Math.sin(ang+.4));
  ctx.closePath();
  ctx.fillStyle = s.c + '70';
  ctx.fill();

  // Label
  if (e.label) {
    const mx = (sx+ex)/2, my = (sy+ey)/2 - 8;
    ctx.fillStyle = '#555070';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    e.label.split('\n').forEach((l, i) => ctx.fillText(l, mx, my + i*11));
  }
}

function drawNode(n) {
  const glow = 0.12 + 0.06 * Math.sin(frame * 0.04 + n.x * 0.01);
  // Glow aura
  ctx.beginPath(); ctx.arc(n.x, n.y, 38, 0, Math.PI*2);
  ctx.fillStyle = n.c + Math.round(glow*255).toString(16).padStart(2,'0');
  ctx.fill();
  // Body
  ctx.beginPath(); ctx.arc(n.x, n.y, 30, 0, Math.PI*2);
  const g = ctx.createRadialGradient(n.x-8, n.y-8, 2, n.x, n.y, 30);
  g.addColorStop(0, n.c + '40');
  g.addColorStop(1, n.c + '15');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = n.c;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  // Crosshair ticks
  ctx.strokeStyle = n.c + '70'; ctx.lineWidth = 1;
  [[n.x, n.y-34, n.x, n.y-26],[n.x, n.y+26, n.x, n.y+34],
   [n.x-34, n.y, n.x-26, n.y],[n.x+26, n.y, n.x+34, n.y]].forEach(([x1,y1,x2,y2]) => {
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  });
  // Label
  ctx.fillStyle = '#ede0ff';
  ctx.font = 'bold 10.5px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(n.label, n.x, n.y + 3.5);
  // Sub
  if (n.sub) {
    ctx.fillStyle = '#5c4070';
    ctx.font = '8.5px "JetBrains Mono", monospace';
    n.sub.split('\n').forEach((line, i) => ctx.fillText(line, n.x, n.y + 42 + i*10));
  }
}

function drawParticle(p) {
  const s = NM[p.e.f], d = NM[p.e.t];
  if (!s || !d) return;
  const x = s.x + (d.x - s.x) * p.t;
  const y = s.y + (d.y - s.y) * p.t;
  ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2);
  ctx.fillStyle = s.c;
  ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI*2);
  ctx.fillStyle = s.c + '28';
  ctx.fill();
  p.t += p.speed;
  if (p.t > 1) p.t = 0;
}

function render() {
  frame++;
  drawBG();
  drawPhaseLabel('PHASE 0\nPre-Campaign', 65, C.red);
  drawPhaseLabel('PHASE 1\nInitial Access', 230, C.red);
  drawPhaseLabel('PHASE 2\nHarvest', 420, C.amber);
  drawPhaseLabel('PHASE 3\nDeploy', 700, C.blue);
  drawPhaseLabel('PHASE 4\nCross-Ecosystem', 1180, C.purple);
  drawPhaseLabel('PHASE 5\nMay 2026',        1450, C.red);
  EDGES.forEach(drawEdge);
  PARTICLES.forEach(drawParticle);
  NODES.forEach(drawNode);
  requestAnimationFrame(render);
}
render();

})();
