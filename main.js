/* Shared behaviour: nav/footer injection, animations, transitions */
(() => {
  const GITHUB_USER = 'Tejaskolathapully';
  const PAGES = [
    ['index.html', 'Home'], ['about.html', 'About'], ['projects.html', 'Projects'],
    ['certificates.html', 'Certificates'], ['github.html', 'GitHub'], ['contact.html', 'Contact']
  ];
  const here = (location.pathname.split('/').pop() || 'index.html');
  const group = here.startsWith('project-') ? 'projects.html' : here;

  // theme
  const saved = (() => { try { return localStorage.getItem('theme'); } catch (e) { return null; } })();
  if (saved) document.documentElement.dataset.theme = saved;

  // chrome: background, progress, cursor, curtain
  document.body.insertAdjacentHTML('afterbegin', `
    <canvas id="bg-canvas"></canvas><div class="noise"></div><div id="progress"></div>
    <div class="cursor-glow"></div>
    <div id="curtain"><i></i><i></i><i></i><i></i><i></i></div>
    <nav class="top">
      <a class="logo" href="index.html"><b>TK</b>.dev</a>
      <button id="burger" aria-label="menu">☰</button>
      <div class="links">
        ${PAGES.map(([h, n]) => `<a class="l ${h === group ? 'active' : ''}" href="${h}">${n}</a>`).join('')}
        <button id="theme" title="Toggle theme">◐</button>
      </div>
    </nav>`);
  document.body.insertAdjacentHTML('beforeend', `
    <footer>
      <div class="soc">
        <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noopener">GitHub</a>
        <a href="mailto:tejaskolathapully@gmail.com">Email</a>
        <a href="assets/Kolathapully_Tejas_resume.pdf" target="_blank">Résumé</a>
      </div>
      Designed &amp; coded by Tejas Kolathapully · ${new Date().getFullYear()} 
    </footer><div class="toast" id="toast"></div>`);

  const toast = (m) => { const t = document.getElementById('toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2600); };

  // curtain reveal on load
  const curtain = document.getElementById('curtain');
  requestAnimationFrame(() => setTimeout(() => curtain.classList.add('out'), 60));
  addEventListener('pageshow', e => { if (e.persisted) { curtain.classList.remove('in'); curtain.classList.add('out'); } });
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey) return;
    const u = new URL(a.href, location.href);
    if (u.origin !== location.origin || (u.pathname === location.pathname && u.hash) || a.hasAttribute('download')) return;
    if (!/\.html?$|\/$/.test(u.pathname)) return;
    e.preventDefault(); curtain.classList.remove('out'); curtain.classList.add('in');
    setTimeout(() => location.href = a.href, 650);
  });

  // nav
  const nav = document.querySelector('nav.top');
  document.getElementById('burger').onclick = () => nav.classList.toggle('open');
  document.getElementById('theme').onclick = () => {
    const n = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = n; try { localStorage.setItem('theme', n); } catch (e) {}
  };

  // scroll progress
  const prog = document.getElementById('progress');
  addEventListener('scroll', () => {
    const h = document.documentElement; prog.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1) * 100) + '%';
  }, { passive: true });

  // cursor
  const glow = document.querySelector('.cursor-glow');
  addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px';
  });

  // click sparks
  const cols = ['#6ef3d6', '#8b7bff', '#ff7ab8', '#ffd166'];
  addEventListener('click', e => {
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('i'); s.className = 'spark';
      const a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 50;
      s.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;background:${cols[i % 4]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px`;
      document.body.appendChild(s); setTimeout(() => s.remove(), 800);
    }
  });

  // card spotlight + tilt + magnetic
  document.addEventListener('mousemove', e => {
    document.querySelectorAll('.card').forEach(c => {
      const r = c.getBoundingClientRect();
      if (e.clientX > r.left - 50 && e.clientX < r.right + 50 && e.clientY > r.top - 50 && e.clientY < r.bottom + 50) {
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }
    });
  });
  const bindTilt = () => document.querySelectorAll('.tilt:not([data-b])').forEach(el => {
    el.dataset.b = 1;
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(6px)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = '');
  });
  document.querySelectorAll('.btn').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px,${(e.clientY - r.top - r.height / 2) * .25}px)`; });
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });

  // reveal, counters, skill bars, bar charts
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return; const el = en.target; io.unobserve(el);
    el.classList.add('show');
    if (el.dataset.count) {
      const end = +el.dataset.count, suf = el.dataset.suffix || '', dec = el.dataset.dec || 0, t0 = performance.now();
      const tick = t => { const p = Math.min((t - t0) / 1400, 1), v = end * (1 - Math.pow(1 - p, 3)); el.textContent = v.toFixed(dec) + suf; if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }
    if (el.dataset.w) el.style.width = el.dataset.w + '%';
  }), { threshold: .15 });
  const observeAll = () => document.querySelectorAll('.reveal,[data-count],.bar i,.bars').forEach(el => { if (!el.dataset.o) { el.dataset.o = 1; io.observe(el); } });
  observeAll(); bindTilt();

  // typed text
  const tp = document.querySelector('[data-typed]');
  if (tp) {
    const words = tp.dataset.typed.split('|'); let w = 0, c = 0, del = false;
    (function loop() {
      const word = words[w]; tp.textContent = word.slice(0, c);
      if (!del && c === word.length) { del = true; return setTimeout(loop, 1400); }
      if (del && c === 0) { del = false; w = (w + 1) % words.length; }
      c += del ? -1 : 1; setTimeout(loop, del ? 35 : 75);
    })();
  }

  // network canvas
  const cv = document.getElementById('bg-canvas'), ctx = cv.getContext('2d');
  let W, H, pts = [], mouse = { x: -999, y: -999 };
  const resize = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; pts = Array.from({ length: Math.min(90, Math.floor(W * H / 16000)) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4 })); };
  addEventListener('resize', resize); resize();
  addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    const light = document.documentElement.dataset.theme === 'light', rgb = light ? '91,73,232' : '139,123,255';
    pts.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
      const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 140) { p.x += (p.x - mouse.x) * .01; p.y += (p.y - mouse.y) * .01; }
      ctx.fillStyle = `rgba(${rgb},.7)`; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 7); ctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 130) { ctx.strokeStyle = `rgba(${rgb},${(1 - d / 130) * .25})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      if (dm < 170) { ctx.strokeStyle = `rgba(110,243,214,${(1 - dm / 170) * .5})`; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    });
    requestAnimationFrame(draw);
  };
  if (!matchMedia('(prefers-reduced-motion:reduce)').matches) draw();

  // certificates: filter + lightbox
  const lb = document.createElement('div'); lb.id = 'lightbox'; lb.innerHTML = '<img alt=""><p></p>'; document.body.appendChild(lb);
  lb.onclick = () => lb.classList.remove('open');
  addEventListener('keydown', e => { if (e.key === 'Escape') lb.classList.remove('open'); });
  document.querySelectorAll('.cert').forEach(c => c.addEventListener('click', () => {
    lb.querySelector('img').src = c.dataset.full; lb.querySelector('p').textContent = c.querySelector('h3').textContent + ' — click anywhere to close'; lb.classList.add('open');
  }));
  document.querySelectorAll('.filters button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach(x => x.classList.remove('on')); b.classList.add('on');
    document.querySelectorAll('.cert').forEach(c => c.classList.toggle('hide', b.dataset.f !== 'all' && c.dataset.cat !== b.dataset.f));
  }));

  // live GitHub repos
  const box = document.getElementById('repos');
  if (box) {
    const fallback = [
      ['PRODIGY_WD_04', '', 'HTML'], ['projects', '', 'Python'], ['project', 'web development', 'CSS'],
      ['prime-tutorials', 'Fork of Jaydev56/prime-tutorials', 'CSS'], ['PRODIGY_WD_01', '', 'CSS'], ['Prodigy_WD_02', '', 'CSS']
    ].map(([name, description, language]) => ({ name, description, language, html_url: `https://github.com/${GITHUB_USER}/${name}`, stargazers_count: 0, forks_count: 0 }));
    const render = (list, live) => {
      box.innerHTML = list.map((r, i) => `
        <a class="card repo tilt reveal" style="transition-delay:${i * 60}ms" href="${r.html_url}" target="_blank" rel="noopener">
          <h3>${r.name}</h3><p class="muted">${r.description || 'No description yet — open the repo to explore the code.'}</p>
          <div class="meta"><span><i class="dot"></i>${r.language || 'Code'}</span><span>★ ${r.stargazers_count}</span><span>⑂ ${r.forks_count}</span></div>
        </a>`).join('');
      document.getElementById('repo-status').textContent = live ? `Live from GitHub · ${list.length} repositories` : 'Showing saved snapshot (GitHub API unreachable)';
      observeAll(); bindTilt();
    };
    fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`)
      .then(r => { if (!r.ok) throw 0; return r.json(); })
      .then(d => render(d, true)).catch(() => render(fallback, false));
  }

  // contact form -> mailto
  const f = document.querySelector('form.contact');
  if (f) f.addEventListener('submit', e => {
    e.preventDefault(); const d = new FormData(f);
    location.href = `mailto:tejaskolathapully@gmail.com?subject=${encodeURIComponent('Portfolio message from ' + d.get('name'))}&body=${encodeURIComponent(d.get('msg') + '\n\n— ' + d.get('name') + ' (' + d.get('email') + ')')}`;
    toast('Opening your mail app…');
  });

  // Konami easter egg
  const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']; let k = 0;
  addEventListener('keydown', e => {
    k = (e.key === code[k] || e.key.toLowerCase() === code[k]) ? k + 1 : 0;
    if (k === code.length) {
      k = 0; toast('🎮 Cheat code unlocked: party mode!');
      let n = 0; const iv = setInterval(() => { document.documentElement.style.filter = `hue-rotate(${(n += 25) % 360}deg)`; if (n > 1440) { clearInterval(iv); document.documentElement.style.filter = ''; } }, 40);
    }
  });
  console.log('%cHey recruiter 👋  Thanks for peeking under the hood. tejaskolathapully@gmail.com', 'color:#6ef3d6;font-size:14px');
})();
