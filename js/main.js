/* ==========================================================================
   个人作品集网站 · 交互脚本
   功能：
   1. 预加载动画
   2. 主题切换（深色 / 浅色）
   3. 导航栏（滚动状态、移动端菜单、滚动高亮）
   4. 打字机动画
   5. 滚动进入动画（reveal）
   6. 技能条 & 数字统计动画
   7. 作品筛选
   8. 自定义光标
   9. 回到顶部
   10. 联系表单校验
   11. 页脚年份 & 简历下载
   ========================================================================== */

(function () {
  'use strict';

  // 标记 JS 可用（用于 reveal 动画的渐进增强，无 JS 时内容保持可见）
  document.documentElement.classList.add('js');

  /* ---------- 1. 预加载动画 ---------- */
  const preloader = document.getElementById('preloader');
  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add('hidden');
    setTimeout(() => preloader.remove(), 700);
  }

  /* ---------- 2. 主题切换 ---------- */
  const THEME_KEY = 'portfolio-theme';
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('i') : null;

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) { /* 忽略隐私模式异常 */ }
  }

  function initTheme() {
    let theme = 'light';
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved) {
        theme = saved;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
      }
    } catch (e) { /* 忽略 */ }
    applyTheme(theme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }

  /* ---------- 3. 导航栏 ---------- */
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const backToTop = document.getElementById('backToTop');
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    backToTop.classList.toggle('show', y > 500);

    // 滚动监听高亮（scrollspy）
    let currentId = '';
    sections.forEach((sec) => {
      const top = sec.getBoundingClientRect().top + window.scrollY;
      if (y >= top - 120) currentId = sec.id;
    });
    navLinkEls.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + currentId);
    });
  }

  function closeMenu() {
    if (!hamburger || !navLinks) return;
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.classList.remove('menu-open');
  }

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      document.body.classList.toggle('menu-open', isOpen);
    });
    navLinks.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeMenu);
    });
  }

  /* ---------- 4. 打字机动画 ---------- */
  const typedEl = document.getElementById('typedText');
  const PHRASES = ['前端开发工程师', 'UI 设计爱好者', '开源项目贡献者', '终身学习者'];
  if (typedEl) {
    let phraseIdx = 0;
    let charIdx = 0;
    let deleting = false;

    function type() {
      const current = PHRASES[phraseIdx];
      charIdx += deleting ? -1 : 1;
      typedEl.textContent = current.slice(0, charIdx);

      let delay = deleting ? 60 : 110;
      if (!deleting && charIdx === current.length) {
        delay = 1600;
        deleting = true;
      } else if (deleting && charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % PHRASES.length;
        delay = 300;
      }
      setTimeout(type, delay);
    }
    setTimeout(type, 600);
  }

  /* ---------- 5. 滚动进入动画（reveal） ---------- */
  let revealInitialized = false;
  function initReveal() {
    if (revealInitialized) return;
    revealInitialized = true;

    const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    if (!('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('revealed'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- 5.1 作品卡片懒加载（级联入场） ---------- */
  function initLazyCards() {
    const cards = document.querySelectorAll('.project-card.lazy-card');
    if (!cards.length) return;

    if (!('IntersectionObserver' in window)) {
      cards.forEach((c) => c.classList.add('lazy-in'));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        // 当前可见且未入场的卡片，按出现顺序级联延迟
        const pending = Array.from(cards).filter(
          (c) => !c.classList.contains('hide') && !c.classList.contains('lazy-in')
        );
        const idx = pending.indexOf(target);
        target.style.animationDelay = (idx > 0 ? idx * 0.12 : 0) + 's';
        target.classList.add('lazy-in');
        io.unobserve(target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    cards.forEach((c) => io.observe(c));
  }

  /* ---------- 6. 技能条 & 数字统计 ---------- */
  function initSkillBarsAndCounters() {
    const bars = document.querySelectorAll('.skill-bar');
    const counters = document.querySelectorAll('.stat-num[data-count]');

    if (!('IntersectionObserver' in window)) {
      bars.forEach((b) => b.classList.add('in-view'));
      counters.forEach((c) => { c.textContent = c.getAttribute('data-count'); });
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        if (target.classList.contains('skill-bar')) {
          target.classList.add('in-view');
        } else {
          animateCounter(target);
        }
        io.unobserve(target);
      });
    }, { threshold: 0.4 });

    bars.forEach((b) => io.observe(b));
    counters.forEach((c) => io.observe(c));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ---------- 7. 作品筛选 ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      projectCards.forEach((card) => {
        const match = filter === 'all' || card.getAttribute('data-cat') === filter;
        card.classList.toggle('hide', !match);
      });
    });
  });

  /* ---------- 8. 自定义光标 ---------- */
  const cursorDot = document.getElementById('cursorDot');
  if (cursorDot) {
    let mx = -100;
    let my = -100;
    let cx = -100;
    let cy = -100;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
    });

    function loop() {
      cx += (mx - cx) * 0.18;
      cy += (my - cy) * 0.18;
      cursorDot.style.left = cx + 'px';
      cursorDot.style.top = cy + 'px';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // 悬停可交互元素时放大光点
    const hoverTargets = 'a, button, input, textarea, .icon-card, .project-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) cursorDot.classList.add('grow');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) cursorDot.classList.remove('grow');
    });
  }

  /* ---------- 9. 回到顶部 ---------- */
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 10. 联系表单校验 ---------- */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validateForm(form)) {
        const success = document.getElementById('formSuccess');
        if (success) success.classList.add('show');
        form.reset();
        setTimeout(() => success && success.classList.remove('show'), 4000);
      }
    });

    // 输入时清除错误状态
    form.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => {
        field.closest('.form-group').classList.remove('invalid');
      });
    });
  }

  function validateForm(form) {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const fields = [
      { el: form.querySelector('#name'), test: (v) => v.trim().length > 0 },
      { el: form.querySelector('#email'), test: (v) => emailRe.test(v.trim()) },
      { el: form.querySelector('#subject'), test: (v) => v.trim().length > 0 },
      { el: form.querySelector('#message'), test: (v) => v.trim().length > 0 },
    ];

    let valid = true;
    fields.forEach(({ el, test }) => {
      const ok = el ? test(el.value) : false;
      const group = el.closest('.form-group');
      group.classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });
    return valid;
  }

  /* ---------- 11. 页脚年份 & 简历下载 ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const downloadCV = document.getElementById('downloadCV');
  if (downloadCV) {
    downloadCV.addEventListener('click', (e) => {
      e.preventDefault();
      const content = [
        '张三 · 前端开发工程师',
        '--------------------------------',
        '邮箱：hello@zhangsan.dev',
        '电话：+86 138 0000 0000',
        '城市：中国 · 上海',
        '',
        '【技能】HTML/CSS · JavaScript · Vue/React · Node.js',
        '',
        '【经历】',
        '2023 — 至今   高级前端开发工程师 · 某科技公司',
        '2021 — 2023   前端开发工程师 · 某互联网公司',
        '',
        '【教育】',
        '2017 — 2021   计算机科学与技术 · 本科',
      ].join('\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '张三-简历.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });
  }

  /* ---------- 初始化 ---------- */
  function init() {
    initTheme();
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    initSkillBarsAndCounters();
    initLazyCards();

    // 预加载动画结束后再触发首屏 reveal，保证入场节奏
    window.addEventListener('load', () => {
      hidePreloader();
      setTimeout(initReveal, 150);
    });
    // 兜底：若脚本执行时页面已加载完成（如缓存命中）
    if (document.readyState === 'complete') {
      hidePreloader();
      setTimeout(initReveal, 150);
    }
  }

  init();
})();
