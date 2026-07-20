/* =========================================================================
   COMPLETE CARGO SOLUTIONS — script.js
   Vanilla ES6 + GSAP + ScrollTrigger + Three.js + Lenis + SplitType
   ========================================================================= */

gsap.registerPlugin(ScrollTrigger);

const PREFERS_REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================================
   0. UTILITIES
   ========================================================================= */
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp  = (a, b, t) => a + (b - a) * t;

/* =========================================================================
   1. PRELOADER
   ========================================================================= */
function initPreloader(onComplete){
  const bar     = document.querySelector('.preloader-bar-fill');
  const percent = document.getElementById('preloadPercent');
  const state   = { p: 0 };

  const tl = gsap.timeline();

  tl.to('.mark-ring', { strokeDashoffset: 0, duration: 1.1, ease: 'power2.out' })
    .to('.mark-path', { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' }, '-=0.7')
    .to('.mark-letters', { opacity: 1, duration: 0.5 }, '-=0.4')
    .to('.preloader-label', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
    .to(['.preloader-bar-track', '.preloader-percent'], { opacity: 1, duration: 0.4 }, '-=0.2')
    .to(state, {
      p: 100,
      duration: 1.6,
      ease: 'power1.inOut',
      onUpdate: () => {
        const v = Math.round(state.p);
        bar.style.width = v + '%';
        percent.textContent = v;
      }
    })
    .to('#preloader', {
      yPercent: -100,
      duration: 0.9,
      ease: 'power4.inOut',
      onComplete: () => {
        document.getElementById('preloader').style.display = 'none';
        onComplete();
      }
    }, '+=0.15');
}

/* =========================================================================
   2. LENIS SMOOTH SCROLL
   ========================================================================= */
let lenis;
function initLenis(){
  if (PREFERS_REDUCED_MOTION) return;
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* =========================================================================
   3. CUSTOM CURSOR
   ========================================================================= */
function initCursor(){
  if (window.matchMedia('(hover: none)').matches) return;
  const dot  = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });

  function raf(){
    rx = lerp(rx, mx, 0.16);
    ry = lerp(ry, my, 0.16);
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(raf);
  }
  raf();

  document.querySelectorAll('a, button, .service-card, input, textarea, select, .journey-node, .network-node').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
  });
}

/* =========================================================================
   4. NAVBAR + MOBILE MENU
   ========================================================================= */
function initNav(){
  const navbar = document.getElementById('navbar');
  ScrollTrigger.create({
    start: 'top -80',
    end: 99999,
    toggleClass: { targets: navbar, className: 'scrolled' }
  });

  const burger = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  burger.addEventListener('click', () => {
    burger.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open');
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
  }));

  // smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1){
        const target = document.querySelector(id);
        if (target){
          e.preventDefault();
          if (lenis) lenis.scrollTo(target, { offset: -20 });
          else target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
}

/* =========================================================================
   5. HERO TEXT REVEAL + SplitType
   ========================================================================= */
function initHeroReveal(){
  const split = new SplitType('#heroTitle .line', { types: 'lines,words' });

  gsap.set(split.words, { yPercent: 120, opacity: 0 });

  const tl = gsap.timeline({ delay: PREFERS_REDUCED_MOTION ? 0 : 0.15 });
  tl.to('.hero-eyebrow', { opacity: 1, duration: 0.6 })
    .to(split.words, { yPercent: 0, opacity: 1, duration: 1, stagger: 0.045, ease: 'power4.out' }, '-=0.3')
    .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55')
    .to('.hero-actions', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.55')
    .to('.hero-tagline', { opacity: 1, duration: 0.7 }, '-=0.5')
    .to('.hero-scroll-cue', { opacity: 1, duration: 0.6 }, '-=0.4')
    .to(['.hero-hud-left', '.hero-hud-right'], { opacity: 1, duration: 0.6, stagger: 0.1 }, '-=0.6');
}

/* =========================================================================
   6. THREE.JS HERO GLOBE + TRADE ROUTES
   ========================================================================= */
function initGlobe(){
  const canvas = document.getElementById('globeCanvas');
  const hero = document.querySelector('.hero');
  let w = hero.clientWidth, h = hero.clientHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
  camera.position.set(0, 0, 9);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);

  const globeGroup = new THREE.Group();
  globeGroup.position.set(1.6, -0.2, 0);
  scene.add(globeGroup);

  /* --- wireframe globe sphere --- */
  const sphereGeo = new THREE.SphereGeometry(2.6, 40, 40);
  const sphereMat = new THREE.MeshBasicMaterial({ color: 0x0066FF, wireframe: true, transparent: true, opacity: 0.16 });
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  globeGroup.add(sphere);

  /* --- solid inner globe for depth --- */
  const innerGeo = new THREE.SphereGeometry(2.55, 48, 48);
  const innerMat = new THREE.MeshBasicMaterial({ color: 0x001133, transparent: true, opacity: 0.55 });
  globeGroup.add(new THREE.Mesh(innerGeo, innerMat));

  /* --- particle dot-grid continents (simplified point cloud sphere) --- */
  const dotsGeo = new THREE.BufferGeometry();
  const dotCount = 1400;
  const positions = new Float32Array(dotCount * 3);
  for (let i = 0; i < dotCount; i++){
    const phi = Math.acos(-1 + (2 * i) / dotCount);
    const theta = Math.sqrt(dotCount * Math.PI) * phi;
    const r = 2.62;
    positions[i * 3]     = r * Math.cos(theta) * Math.sin(phi);
    positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  dotsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dotsMat = new THREE.PointsMaterial({ color: 0x7FA8E8, size: 0.022, transparent: true, opacity: 0.5 });
  globeGroup.add(new THREE.Points(dotsGeo, dotsMat));

  /* --- trade route arcs (great-circle style curves) --- */
  function latLngToVec3(lat, lng, radius){
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
       radius * Math.cos(phi),
       radius * Math.sin(phi) * Math.sin(theta)
    );
  }

  const routePairs = [
    [19.07, 72.87, 51.50, -0.12],   // Mumbai -> London
    [19.07, 72.87, 40.71, -74.00],  // Mumbai -> New York
    [22.30, 114.16, 34.05, -118.24],// Hong Kong -> LA
    [1.35, 103.81, -33.86, 151.20], // Singapore -> Sydney
    [25.20, 55.27, 55.75, 37.61],   // Dubai -> Moscow
    [31.23, 121.47, 19.07, 72.87],  // Shanghai -> Mumbai
  ];

  const routeLines = [];
  routePairs.forEach(([lat1, lng1, lat2, lng2], idx) => {
    const start = latLngToVec3(lat1, lng1, 2.63);
    const end   = latLngToVec3(lat2, lng2, 2.63);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(2.63 + start.distanceTo(end) * 0.35);

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(64);
    const geo = new THREE.BufferGeometry().setFromPoints(points);

    const mat = new THREE.LineBasicMaterial({ color: 0xFF6A00, transparent: true, opacity: 0 });
    const line = new THREE.Line(geo, mat);
    globeGroup.add(line);

    gsap.to(mat, { opacity: 0.75, duration: 1.2, delay: 1.4 + idx * 0.25, ease: 'power2.out' });

    // pulsing light trail dot moving along the curve
    const travelerGeo = new THREE.SphereGeometry(0.03, 8, 8);
    const travelerMat = new THREE.MeshBasicMaterial({ color: 0xFFAA55 });
    const traveler = new THREE.Mesh(travelerGeo, travelerMat);
    globeGroup.add(traveler);

    routeLines.push({ curve, traveler, offset: Math.random() });

    // origin / destination markers
    [start, end].forEach(pos => {
      const markerGeo = new THREE.SphereGeometry(0.035, 10, 10);
      const markerMat = new THREE.MeshBasicMaterial({ color: 0x0066FF });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.copy(pos);
      globeGroup.add(marker);
    });
  });

  /* --- ambient particle network (background depth) --- */
  const bgGeo = new THREE.BufferGeometry();
  const bgCount = 220;
  const bgPos = new Float32Array(bgCount * 3);
  for (let i = 0; i < bgCount; i++){
    bgPos[i*3]   = (Math.random() - 0.5) * 16;
    bgPos[i*3+1] = (Math.random() - 0.5) * 10;
    bgPos[i*3+2] = (Math.random() - 0.5) * 8 - 2;
  }
  bgGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
  const bgMat = new THREE.PointsMaterial({ color: 0x3B7CFF, size: 0.018, transparent: true, opacity: 0.35 });
  scene.add(new THREE.Points(bgGeo, bgMat));

  /* --- render loop --- */
  const clock = new THREE.Clock();
  let scrollProgress = 0;

  function animate(){
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!PREFERS_REDUCED_MOTION){
      globeGroup.rotation.y = t * 0.06 + scrollProgress * 2.4;
      globeGroup.rotation.x = Math.sin(t * 0.15) * 0.03;
    }

    routeLines.forEach(r => {
      const tt = ((t * 0.06) + r.offset) % 1;
      const pos = r.curve.getPoint(tt);
      r.traveler.position.copy(pos);
    });

    renderer.render(scene, camera);
  }
  animate();

  /* scroll-driven globe rotation */
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => { scrollProgress = self.progress; }
  });

  /* HUD coordinate readout ticking */
  const hudLat = document.getElementById('hudLat');
  const hudLng = document.getElementById('hudLng');
  const coordPairs = [
    ['19.0760° N', '72.8777° E'],
    ['51.5072° N', '00.1276° W'],
    ['40.7128° N', '74.0060° W'],
    ['22.3193° N', '114.1694° E'],
    ['25.2048° N', '55.2708° E'],
  ];
  let coordIdx = 0;
  setInterval(() => {
    coordIdx = (coordIdx + 1) % coordPairs.length;
    gsap.to([hudLat, hudLng], { opacity: 0, duration: 0.3, onComplete: () => {
      hudLat.textContent = coordPairs[coordIdx][0];
      hudLng.textContent = coordPairs[coordIdx][1];
      gsap.to([hudLat, hudLng], { opacity: 1, duration: 0.3 });
    }});
  }, 3200);

  /* resize */
  window.addEventListener('resize', () => {
    w = hero.clientWidth; h = hero.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}

/* =========================================================================
   7. CANVAS 2D STORY SCENES — Sea / Air / Customs
   ========================================================================= */
function initSeaCanvas(){
  const canvas = document.getElementById('seaCanvas');
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('sea');
  let w, h, dpr = Math.min(window.devicePixelRatio, 2);

  function resize(){
    w = section.clientWidth; h = section.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const waves = Array.from({ length: 3 }, (_, i) => ({ amp: 14 + i * 6, len: 0.006 + i * 0.002, speed: 0.4 + i * 0.15, offset: i * 200, alpha: 0.16 - i * 0.03 }));
  let shipX = -0.2;

  function draw(t){
    ctx.clearRect(0, 0, w, h);
    const baseY = h * 0.72;

    waves.forEach(wave => {
      ctx.beginPath();
      ctx.moveTo(0, baseY);
      for (let x = 0; x <= w; x += 8){
        const y = baseY + wave.offset * 0 + Math.sin(x * wave.len + t * wave.speed) * wave.amp;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      ctx.fillStyle = `rgba(0,102,255,${wave.alpha})`;
      ctx.fill();
    });

    // container ship silhouette moving slowly across
    shipX += 0.00025 * w;
    if (shipX > w + 200) shipX = -250;
    const shipY = baseY - 46 + Math.sin(t * 0.4) * 4;
    drawShip(ctx, shipX, shipY);

    requestAnimationFrame((nt) => draw(nt / 1000));
  }

  function drawShip(ctx, x, y){
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = 'rgba(234,241,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(0, 40); ctx.lineTo(220, 40); ctx.lineTo(205, 55); ctx.lineTo(15, 55); ctx.closePath();
    ctx.fill();
    const colors = ['#FF6A00', '#0066FF', '#7FA8E8', '#FF8A38'];
    for (let i = 0; i < 6; i++){
      ctx.fillStyle = colors[i % colors.length];
      ctx.globalAlpha = 0.9;
      ctx.fillRect(20 + i * 32, 14, 26, 22);
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  requestAnimationFrame((t) => draw(t / 1000));
}

function initAirCanvas(){
  const canvas = document.getElementById('airCanvas');
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('air');
  let w, h, dpr = Math.min(window.devicePixelRatio, 2);

  function resize(){
    w = section.clientWidth; h = section.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const clouds = Array.from({ length: 6 }, (_, i) => ({
    x: Math.random(), y: 0.15 + Math.random() * 0.6, s: 0.5 + Math.random() * 1.1, speed: 0.02 + Math.random() * 0.03
  }));
  let planeX = -0.15;

  function drawCloud(cx, cy, scale){
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = 'rgba(127,168,232,0.10)';
    ctx.beginPath();
    ctx.arc(0, 0, 26, 0, Math.PI * 2);
    ctx.arc(28, 6, 20, 0, Math.PI * 2);
    ctx.arc(-26, 8, 18, 0, Math.PI * 2);
    ctx.arc(8, -12, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlane(x, y){
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = 'rgba(234,241,255,0.9)';
    ctx.fillStyle = 'rgba(234,241,255,0.92)';
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(70, 4); ctx.lineTo(64, 10); ctx.lineTo(0, 8); ctx.closePath();
    ctx.fill();
    ctx.beginPath(); ctx.moveTo(20, 4); ctx.lineTo(2, -18); ctx.lineTo(10, 2); ctx.closePath();
    ctx.fillStyle = 'rgba(255,106,0,0.85)';
    ctx.fill();
    ctx.beginPath(); ctx.moveTo(24, 8); ctx.lineTo(6, 26); ctx.lineTo(14, 8); ctx.closePath();
    ctx.fillStyle = 'rgba(0,102,255,0.7)';
    ctx.fill();
    // trail
    const grad = ctx.createLinearGradient(-180, 5, 0, 5);
    grad.addColorStop(0, 'rgba(255,106,0,0)');
    grad.addColorStop(1, 'rgba(255,106,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(-180, 3, 180, 2);
    ctx.restore();
  }

  function draw(t){
    ctx.clearRect(0, 0, w, h);
    clouds.forEach(c => {
      c.x += c.speed * 0.002;
      if (c.x > 1.2) c.x = -0.3;
      drawCloud(c.x * w, c.y * h, c.s);
    });
    planeX += 0.00045;
    if (planeX > 1.3) planeX = -0.2;
    const planeY = h * 0.42 + Math.sin(t * 0.6) * 10;
    drawPlane(planeX * w, planeY);
    requestAnimationFrame((nt) => draw(nt / 1000));
  }
  requestAnimationFrame((t) => draw(t / 1000));
}

function initCustomsCanvas(){
  const canvas = document.getElementById('customsCanvas');
  const ctx = canvas.getContext('2d');
  const section = document.getElementById('customs');
  let w, h, dpr = Math.min(window.devicePixelRatio, 2);

  function resize(){
    w = section.clientWidth; h = section.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const boxX = () => w * 0.72, boxY = () => h * 0.5, boxSize = () => Math.min(w * 0.22, 260);

  function draw(t){
    ctx.clearRect(0, 0, w, h);
    const bx = boxX(), by = boxY(), bs = boxSize();

    // crate outline
    ctx.strokeStyle = 'rgba(127,168,232,0.35)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(bx - bs/2, by - bs/2, bs, bs);
    ctx.strokeStyle = 'rgba(127,168,232,0.15)';
    for (let i = 1; i < 4; i++){
      ctx.beginPath();
      ctx.moveTo(bx - bs/2, by - bs/2 + (bs/4)*i);
      ctx.lineTo(bx + bs/2, by - bs/2 + (bs/4)*i);
      ctx.stroke();
    }

    // scanning beam
    const cycle = (t * 0.35) % 1;
    const scanY = by - bs/2 + cycle * bs;
    const grad = ctx.createLinearGradient(bx - bs/2, scanY - 30, bx - bs/2, scanY + 30);
    grad.addColorStop(0, 'rgba(255,106,0,0)');
    grad.addColorStop(0.5, 'rgba(255,106,0,0.55)');
    grad.addColorStop(1, 'rgba(255,106,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(bx - bs/2, scanY - 30, bs, 60);

    ctx.strokeStyle = 'rgba(255,106,0,0.9)';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(bx - bs/2, scanY); ctx.lineTo(bx + bs/2, scanY); ctx.stroke();

    // scattered data readout dots
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.fillStyle = 'rgba(0,102,255,0.5)';
    ctx.fillText('HS 8471.30', bx - bs/2, by - bs/2 - 12);
    ctx.fillText('STATUS: CLEARING', bx - bs/2, by + bs/2 + 20);

    requestAnimationFrame((nt) => draw(nt / 1000));
  }
  requestAnimationFrame((t) => draw(t / 1000));
}

/* =========================================================================
   8. SCROLL STORY TEXT REVEALS
   ========================================================================= */
function initStoryReveals(){
  document.querySelectorAll('.story').forEach(story => {
    const inner = story.querySelectorAll('.story-eyebrow, .story-title, .story-text, .story-points li');
    gsap.set(inner, { opacity: 0, y: 30 });
    ScrollTrigger.create({
      trigger: story,
      start: 'top 65%',
      onEnter: () => gsap.to(inner, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' }),
      once: true
    });
  });
}

/* =========================================================================
   9. SERVICE CARDS — reveal + magnetic tilt
   ========================================================================= */
function initServiceCards(){
  const cards = document.querySelectorAll('.service-card');

  gsap.set(cards, { opacity: 0, y: 50 });
  ScrollTrigger.create({
    trigger: '.services-grid',
    start: 'top 78%',
    onEnter: () => gsap.to(cards, { opacity: 1, y: 0, duration: 0.8, stagger: 0.09, ease: 'power3.out' }),
    once: true
  });

  if (window.matchMedia('(hover: hover)').matches){
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const px = e.clientX - rect.left, py = e.clientY - rect.top;
        const rx = ((py / rect.height) - 0.5) * -10;
        const ry = ((px / rect.width) - 0.5) * 10;
        gsap.to(card, { rotateX: rx, rotateY: ry, transformPerspective: 800, duration: 0.4, ease: 'power2.out' });
        card.style.setProperty('--mx', px + 'px');
        card.style.setProperty('--my', py + 'px');
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
      });
    });
  }
}

/* =========================================================================
   10. STATISTICS COUNTERS
   ========================================================================= */
function initCounters(){
  const items = document.querySelectorAll('.stat-number');
  items.forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const decimals = el.dataset.decimal ? parseInt(el.dataset.decimal) : 0;
    const counter = { val: 0 };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => { el.textContent = counter.val.toFixed(decimals) + suffix; }
        });
      }
    });
  });
}

/* =========================================================================
   11. LOGISTICS JOURNEY — scroll-scrubbed timeline
   ========================================================================= */
function initJourney(){
  const track = document.querySelector('.journey-track');
  const nodes = gsap.utils.toArray('.journey-node');
  const lineFill = document.querySelector('.journey-line-fill');
  const container = document.getElementById('journeyContainer');
  if (!track || window.innerWidth < 1080) {
    nodes.forEach(n => n.classList.add('is-active'));
    return;
  }

  const totalWidth = track.clientWidth;

  ScrollTrigger.create({
    trigger: '.journey',
    start: 'top 60%',
    end: 'bottom 70%',
    scrub: 0.6,
    onUpdate: (self) => {
      const p = self.progress;
      lineFill.style.strokeDashoffset = 1200 - (1200 * p);
      container.style.left = `calc(var(--pad) + ${p * (totalWidth - 60)}px)`;

      const activeCount = Math.floor(p * nodes.length + 0.4);
      nodes.forEach((n, i) => n.classList.toggle('is-active', i < activeCount));
    }
  });
}

/* =========================================================================
   12. GLOBAL NETWORK — animated SVG world routes
   ========================================================================= */
function initNetworkMap(){
  const svg = document.getElementById('networkMap');
  const NS = 'http://www.w3.org/2000/svg';

  // simplified world dot-grid backdrop (continents suggested by dot density bands)
  const bgGroup = document.createElementNS(NS, 'g');
  bgGroup.setAttribute('opacity', '0.35');
  for (let x = 20; x < 980; x += 22){
    for (let y = 40; y < 460; y += 22){
      const n = Math.sin(x * 0.02) * Math.cos(y * 0.025);
      if (n > 0.08){
        const dot = document.createElementNS(NS, 'circle');
        dot.setAttribute('cx', x); dot.setAttribute('cy', y); dot.setAttribute('r', 1);
        dot.setAttribute('fill', 'rgba(127,168,232,0.35)');
        bgGroup.appendChild(dot);
      }
    }
  }
  svg.appendChild(bgGroup);

  const hubs = [
    { name: 'MUMBAI',    x: 660, y: 250, type: 'origin' },
    { name: 'DUBAI',     x: 600, y: 225, type: 'dest' },
    { name: 'LONDON',    x: 470, y: 140, type: 'dest' },
    { name: 'NEW YORK',  x: 260, y: 165, type: 'dest' },
    { name: 'SHANGHAI',  x: 800, y: 195, type: 'dest' },
    { name: 'SINGAPORE', x: 760, y: 290, type: 'dest' },
    { name: 'SYDNEY',    x: 870, y: 400, type: 'dest' },
    { name: 'HAMBURG',   x: 500, y: 130, type: 'dest' },
  ];

  const routesGroup = document.createElementNS(NS, 'g');
  svg.appendChild(routesGroup);
  const origin = hubs[0];
  hubs.slice(1).forEach(hub => {
    const midX = (origin.x + hub.x) / 2;
    const midY = Math.min(origin.y, hub.y) - 40 - Math.random() * 20;
    const d = `M${origin.x},${origin.y} Q${midX},${midY} ${hub.x},${hub.y}`;
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('class', 'route-path');
    routesGroup.appendChild(path);

    hub._path = path;
  });

  const nodesGroup = document.createElementNS(NS, 'g');
  svg.appendChild(nodesGroup);
  hubs.forEach(hub => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'network-node');

    const glow = document.createElementNS(NS, 'circle');
    glow.setAttribute('cx', hub.x); glow.setAttribute('cy', hub.y); glow.setAttribute('r', 10);
    glow.setAttribute('fill', hub.type === 'origin' ? 'rgba(0,102,255,0.18)' : 'rgba(255,106,0,0.15)');
    g.appendChild(glow);

    const core = document.createElementNS(NS, 'circle');
    core.setAttribute('class', 'node-core');
    core.setAttribute('cx', hub.x); core.setAttribute('cy', hub.y); core.setAttribute('r', 4.5);
    core.setAttribute('fill', hub.type === 'origin' ? '#0066FF' : '#FF6A00');
    g.appendChild(core);

    const label = document.createElementNS(NS, 'text');
    label.setAttribute('x', hub.x); label.setAttribute('y', hub.y - 14);
    label.setAttribute('text-anchor', 'middle');
    label.textContent = hub.name;
    g.appendChild(label);

    if (hub.type !== 'origin'){
      g.addEventListener('mouseenter', () => hub._path && hub._path.classList.add('is-lit'));
      g.addEventListener('mouseleave', () => hub._path && hub._path.classList.remove('is-lit'));
    }

    nodesGroup.appendChild(g);
  });

  // ambient auto-pulse cycling through routes
  let pulseIdx = 0;
  const litHubs = hubs.slice(1);
  setInterval(() => {
    litHubs.forEach(h => h._path && h._path.classList.remove('is-lit'));
    const hub = litHubs[pulseIdx % litHubs.length];
    if (hub._path) hub._path.classList.add('is-lit');
    pulseIdx++;
  }, 1800);

  // reveal on scroll
  gsap.set(svg, { opacity: 0 });
  ScrollTrigger.create({
    trigger: '.network',
    start: 'top 70%',
    once: true,
    onEnter: () => gsap.to(svg, { opacity: 1, duration: 1 })
  });
}

/* =========================================================================
   13. SECTION HEAD REVEALS (generic, used across sections)
   ========================================================================= */
function initSectionReveals(){
  document.querySelectorAll('.section-head').forEach(head => {
    const items = head.children;
    gsap.set(items, { opacity: 0, y: 24 });
    ScrollTrigger.create({
      trigger: head,
      start: 'top 82%',
      once: true,
      onEnter: () => gsap.to(items, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' })
    });
  });
}

/* =========================================================================
   14. CONTACT FORM
   ========================================================================= */
function initContactForm(){
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  const btnLabel = document.getElementById('formBtnLabel');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    btnLabel.textContent = 'Sending…';
    setTimeout(() => {
      btnLabel.textContent = 'Send Enquiry';
      successMsg.classList.add('is-shown');
      form.reset();
      setTimeout(() => successMsg.classList.remove('is-shown'), 5000);
    }, 900);
  });
}

/* =========================================================================
   15. MISC — footer year, marquee pause on hover
   ========================================================================= */
function initMisc(){
  const yearEl = document.getElementById('footerYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* =========================================================================
   BOOTSTRAP
   ========================================================================= */
function initSite(){
  initLenis();
  initCursor();
  initNav();
  initHeroReveal();
  initGlobe();
  initSeaCanvas();
  initAirCanvas();
  initCustomsCanvas();
  initStoryReveals();
  initServiceCards();
  initCounters();
  initJourney();
  initNetworkMap();
  initSectionReveals();
  initContactForm();
  initMisc();

  ScrollTrigger.refresh();
}

window.addEventListener('DOMContentLoaded', () => {
  initPreloader(initSite);
});
