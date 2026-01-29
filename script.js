/* ===================== DOM ELEMENTS ===================== */
const body = document.body;
const themeBtn = document.getElementById("theme-toggle");
const header = document.querySelector(".site-header");
const heroes = [...document.querySelectorAll(".hero")];
const expandBtns = [...document.querySelectorAll(".expand-btn")];
const animatedEls = [...document.querySelectorAll(".animate")];

/* ===================== THEME TOGGLE ===================== */
const setTheme = theme => {
  body.dataset.theme = theme;
  themeBtn.textContent = `Dark Mode: ${theme === "dark" ? "On" : "Off"}`;
  localStorage.setItem("theme", theme);
};

setTheme(localStorage.getItem("theme") || "dark");

themeBtn.addEventListener("click", () =>
  setTheme(body.dataset.theme === "dark" ? "light" : "dark")
);

/* ===================== PROJECT EXPAND ===================== */
expandBtns.forEach(btn => btn.addEventListener("click", () => {
  const card = btn.closest(".project-card");
  const expanded = card.classList.toggle("expanded");
  btn.textContent = expanded ? "−" : "+";
}));

/* ===================== SCROLL ANIMATION ===================== */
const observer = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.15 }
);
animatedEls.forEach(el => observer.observe(el));

/* ===================== HEADER HIDE & HERO PARALLAX ===================== */
let lastScroll = 0;
let ticking = false;
window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      header.style.top = scrollY > lastScroll ? "-100px" : "0";
      lastScroll = scrollY;

      heroes.forEach(hero => hero.style.transform = `translateY(${scrollY*0.2}px)`);

      ticking = false;
    });
    ticking = true;
  }
});

/* ===================== HERO PARTICLES ===================== */
const canvas = document.getElementById("hero-canvas");
if(canvas){
  const ctx = canvas.getContext("2d");
  let particles = [];
  const count = 50;
  const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }
  window.addEventListener("resize", resize); resize();
  for(let i=0;i<count;i++){
    particles.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,radius:Math.random()*2+1,vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3});
  }
  const animate = ()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);
      ctx.fillStyle="rgba(0,191,255,0.7)";
      ctx.fill();
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>canvas.width)p.vx*=-1;
      if(p.y<0||p.y>canvas.height)p.vy*=-1;
    });
    requestAnimationFrame(animate);
  };
  animate();
}

/* ================= CYBERPUNK NEON CURSOR TRAIL ================= */
const trailCanvas = document.createElement("canvas");
trailCanvas.id = "trail-canvas";
document.body.appendChild(trailCanvas);
const tCtx = trailCanvas.getContext("2d");

let particles = [];
const maxParticles = 50;

// Make canvas full screen
const resizeCanvas = () => {
  trailCanvas.width = window.innerWidth;
  trailCanvas.height = window.innerHeight;
};
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Cursor position
let cursorX = 0;
let cursorY = 0;

window.addEventListener("mousemove", e => {
  cursorX = e.clientX;
  cursorY = e.clientY;

  // Spawn trailing particles at cursor
  particles.push({
    x: cursorX,
    y: cursorY,
    radius: Math.random() * 4 + 2, // 2-6px
    alpha: 1,
    color: ['#00BFFF','#8B5CF6','#FF3EFF'][Math.floor(Math.random()*3)],
    vx: (Math.random() - 0.5) * 0.5, // tiny drift
    vy: (Math.random() - 0.5) * 0.5
  });

  if (particles.length > maxParticles) particles.shift();
});

// Animate
const animateTrail = () => {
  tCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);

  // Draw particles
  particles.forEach(p => {
    tCtx.beginPath();
    tCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    tCtx.fillStyle = `rgba(${hexToRgb(p.color)},${p.alpha})`;
    tCtx.shadowBlur = 12;
    tCtx.shadowColor = p.color;
    tCtx.fill();

    // Move particle slightly
    p.x += p.vx;
    p.y += p.vy;
    p.alpha -= 0.02; // fade out
  });

  // Remove faded particles
  particles = particles.filter(p => p.alpha > 0);

  requestAnimationFrame(animateTrail);
};

animateTrail();

// Helper: convert hex to RGB
function hexToRgb(hex) {
  hex = hex.replace('#','');
  const r = parseInt(hex.substring(0,2),16);
  const g = parseInt(hex.substring(2,4),16);
  const b = parseInt(hex.substring(4,6),16);
  return `${r},${g},${b}`;
}

/* ===================== FLYING SHIPS WITH COLLISIONS ===================== */

const ships = [];
const shipCount = 10;
const deathStar_Count = 2;
const shipSize = "35px";

// Create ships flying left → right
for (let i = 0; i < shipCount; i++) {
  const ship = document.createElement("img");
  ship.src = "imgs/ship.svg";
  ship.classList.add("ship");
  ship.style.position = "absolute";
  ship.style.top = Math.random() * 60 + "%";
  ship.style.left = "-10%";
  ship.style.width = shipSize;
  ship.style.height = shipSize;
  document.body.appendChild(ship);
  ships.push({ el: ship, speed: 0.1 + Math.random() * 0.2, direction: 1 }); // direction 1 = right
}

// Create ships flying right → left
for (let i = 0; i < shipCount; i++) {
  const ship = document.createElement("img");
  ship.src = "imgs/ship2.svg";
  ship.classList.add("ship");
  ship.style.position = "absolute";
  ship.style.top = Math.random() * 60 + "%";
  ship.style.left = "110%";
  ship.style.width = shipSize;
  ship.style.height = shipSize;
  ship.style.transform = "rotate(270deg)";
  document.body.appendChild(ship);
  ships.push({ el: ship, speed: 0.1 + Math.random() * 0.2, direction: -1 }); // direction -1 = left
}

// Death Star
for (let i = 0; i < deathStar_Count; i++) {
  const ship = document.createElement("img");
  ship.src = "imgs/deathStar.svg";
  ship.classList.add("ship");
  ship.style.position = "absolute";
  ship.style.top = Math.random() * 60 + "%";
  ship.style.left = "110%";
  ship.style.width = "150px";
  ship.style.height = "150px"
  document.body.appendChild(ship);
  ships.push({ el: ship, speed: 0.01 + Math.random() * 0.1, direction: 1 });
}

// Explosion effect
function explode(x, y) {
  const explosion = document.createElement("div");
  explosion.style.position = "absolute";
  explosion.style.left = x + "px";
  explosion.style.top = y + "px";
  explosion.style.width = "50px";
  explosion.style.height = "50px";
  explosion.style.borderRadius = "50%";
  explosion.style.background = "radial-gradient(circle, rgba(255,200,0,1) 0%, rgba(255,0,0,0) 70%)";
  explosion.style.pointerEvents = "none";
  document.body.appendChild(explosion);
  setTimeout(() => explosion.remove(), 400);
}

// Animate ships and check collisions
function animateShips() {
  ships.forEach(s => {
    // Move ship
    let left = parseFloat(s.el.style.left);
    left += s.speed * s.direction;
    s.el.style.left = left + "%";

    // Reset if off-screen
    if (s.direction === 1 && left > 110) s.el.style.left = "-10%";
    if (s.direction === -1 && left < -10) s.el.style.left = "110%";
  });

  // Check collisions
  for (let i = 0; i < ships.length; i++) {
    for (let j = i + 1; j < ships.length; j++) {
      const rect1 = ships[i].el.getBoundingClientRect();
      const rect2 = ships[j].el.getBoundingClientRect();

      const collision = !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
      );

      if (collision) {
        // Explosion at midpoint
        explode((rect1.left + rect2.left) / 2, (rect1.top + rect2.top) / 2);
        ships[i].el.style.display = "none";
        ships[j].el.style.display = "none";
        // Remove from array so they don't keep checking
        ships.splice(j, 1);
        ships.splice(i, 1);
        i--; // adjust outer loop after removal
        break;
      }
    }
  }

  requestAnimationFrame(animateShips);
}

animateShips();

// ===================== CONTACT PARTICLES =====================
const contactCanvas = document.getElementById("contact-particles");
const cCtx = contactCanvas.getContext("2d");

contactCanvas.width = contactCanvas.offsetWidth;
contactCanvas.height = contactCanvas.offsetHeight;

let cParticles = [];
const cCount = 30;

// Initialize particles
for(let i=0;i<cCount;i++){
  cParticles.push({
    x: Math.random()*contactCanvas.width,
    y: Math.random()*contactCanvas.height,
    r: Math.random()*2+1,
    speedY: 0.2 + Math.random()*0.3,
    alpha: 0.2 + Math.random()*0.3
  });
}

function animateContactParticles(){
  cCtx.clearRect(0,0,contactCanvas.width, contactCanvas.height);
  cParticles.forEach(p=>{
    cCtx.beginPath();
    cCtx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    cCtx.fillStyle = `rgba(88,200,255,${p.alpha})`;
    cCtx.fill();
    p.y -= p.speedY;
    if(p.y < -5) p.y = contactCanvas.height + 5;
  });
  requestAnimationFrame(animateContactParticles);
}
animateContactParticles();

// ===================== BD-1 ORB =====================
const bdOrb = document.querySelector(".bd1-orb");
const contactCard = document.querySelector(".contact-card");
const buttons = document.querySelectorAll(".contact-btn");

let angle = 0;
let orbRadius = 100; // orbital radius
let orbX = 0;
let orbY = 0;

function animateOrb() {
  const cx = contactCard.offsetWidth / 2;
  const cy = contactCard.offsetHeight / 2;

  orbX = cx + orbRadius * Math.cos(angle);
  orbY = cy + orbRadius * Math.sin(angle);
  angle += 0.02;

  bdOrb.style.transform = `translate(${orbX - bdOrb.offsetWidth/2}px, ${orbY - bdOrb.offsetHeight/2}px)`;

  requestAnimationFrame(animateOrb);
}
animateOrb();

// ===================== ORB BUTTON INTERACTION =====================
buttons.forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    bdOrb.style.boxShadow = "0 0 28px rgba(88,200,255,1), 0 0 56px rgba(88,200,255,0.6)";
    bdOrb.style.transform += " scale(1.7)";
  });
  btn.addEventListener("mouseleave", () => {
    bdOrb.style.boxShadow = "0 0 20px rgba(88,200,255,0.6), 0 0 40px rgba(88,200,255,0.3)";
    bdOrb.style.transform = bdOrb.style.transform.replace(" scale(1.7)", "");
  });
});

// Smooth scroll for About Me link
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", function(e){
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if(target){
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});

/* ===================== TERMINAL TYPE EFFECT ===================== */
const terminalText = document.getElementById("terminal-text");

const subtitle = "Cybersecurity & Network Systems Administration Student";
let index = 0;

const typeTerminal = () => {
  if (index < subtitle.length) {
    terminalText.textContent += subtitle.charAt(index);
    index++;
    setTimeout(typeTerminal, 40); // typing speed
  }
};

window.addEventListener("load", () => {
  setTimeout(typeTerminal, 600); // delay after title reveal
});

document.querySelector(".cursor").style.display = "none";

/* ===================== SYSTEM BOOT ===================== */
document.addEventListener("DOMContentLoaded", () => {

  const bootOverlay = document.getElementById("boot-sequence");
  const bootText = document.getElementById("boot-text");

  function sysBoot() {

    // If no boot UI on this page → do nothing
    if (!bootOverlay || !bootText) return;

    // Already booted this session → skip instantly
    if (sessionStorage.getItem("booted") === "true") {
      bootOverlay.style.display = "none";
      return;
    }

    const bootLines = [
      "Initializing system kernel...",
      "Loading neural interface modules...",
      "Mounting encrypted storage...",
      "Establishing secure uplink...",
      "Syncing user profile: CAM GARRISON",
      "",
      "SYSTEM STATUS: ONLINE"
    ];

    let line = 0;
    let char = 0;
    bootText.textContent = "";

    function typeBoot() {
      if (line < bootLines.length) {
        if (char < bootLines[line].length) {
          bootText.textContent += bootLines[line][char++];
          setTimeout(typeBoot, 35);
        } else {
          bootText.textContent += "\n";
          line++;
          char = 0;
          setTimeout(typeBoot, 300);
        }
      } else {
        // Mark session as booted ONLY when finished
        sessionStorage.setItem("booted", "true");

        setTimeout(() => {
          bootOverlay.classList.add("hidden");
        }, 700);
      }
    }

    typeBoot();
  }

  sysBoot();


  /* ===================== REBOOT BUTTON ===================== */
  document.querySelectorAll("#reboot-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      console.log("System rebooting...");
      sessionStorage.removeItem("booted");
      location.reload();
    });
  });

});


const hudStatus = document.getElementById("hud-status");

//HUD Section Status
const sections = [
  { id: "hero", status: "Boot Interface Active" },
  { id: "about", status: "User Profile Loaded" },
  { id: "projects", status: "Deployments Indexed" },
  { id: "contact", status: "Secure Channel Open" }
];

window.addEventListener("scroll", () => {
  let current = "Idle";

  sections.forEach(section => {
    const el = document.getElementById(section.id);
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 2) {
      current = section.status;
    }
  });

  hudStatus.textContent = current;
});

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

setInterval(() => {
  document.getElementById("cpu-usage").textContent = randomRange(8, 38) + "%";
  document.getElementById("ram-usage").textContent = randomRange(32, 68) + "%";
}, 2500);

const navToggle = document.getElementById("nav-toggle");
const navHolo = document.querySelector(".nav-holo");

navToggle.addEventListener("click", () => {
  navHolo.classList.toggle("show");
});

/* ===================== AUTO NEW BADGE ===================== */

(function () {
  const NEW_DAYS = 14;
  const now = new Date();

  document.querySelectorAll("[data-date]").forEach(card => {
    const dateStr = card.getAttribute("data-date");
    if (!dateStr) return;

    const postDate = new Date(dateStr);
    if (isNaN(postDate)) return;

    const diffDays = (now - postDate) / (1000 * 60 * 60 * 24);

    if (diffDays <= NEW_DAYS) {
      const title = card.querySelector("h3");
      if (!title) return;

      const badge = document.createElement("span");
      badge.className = "new-badge";
      badge.textContent = "NEW";

      title.appendChild(badge);
    }
  });
})();
