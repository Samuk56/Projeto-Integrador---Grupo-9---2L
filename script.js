/**
 * SENSOR LDR — GLASSMORPHISM INTERACTIVE
 * JavaScript com animações e interações modernas
 */

(function() {
  'use strict';

  // ========== UTILS ==========
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const fmtR = v => v >= 1e6 ? (v / 1e6).toFixed(2) + 'MΩ' : v >= 1e3 ? (v / 1e3).toFixed(2) + 'kΩ' : v.toFixed(0) + 'Ω';

  // ========== STATE DO SIMULADOR ==========
  const S = {
    luz: 75,      // 0–100%
    rL: 10000,    // resistência LDR
    analog: 0,    // leitura 0–1023
    vout: 0,      // tensão no divisor
    modo: true    // true=HIGH acende, false=LOW acende
  };

  // ========== CURVA LDR (aproximada) ==========
  function calcRL(luz) {
    const n = luz / 100;
    if (n <= 0.01) return 1e6;
    if (n >= 0.99) return 200;
    // curva exponencial invertida
    return 200 + (1e6 - 200) * Math.exp(-4.5 * n);
  }

  // ========== ATUALIZA SIMULADOR ==========
  function updateSim() {
    S.rL = calcRL(S.luz);
    const Rfix = 10000;
    const Vin = 5;
    
    if (S.modo) {
      // LDR no topo, Rfix embaixo → Vout sobe com mais luz
      S.vout = Vin * Rfix / (S.rL + Rfix);
    } else {
      // Rfix no topo, LDR embaixo → Vout desce com mais luz
      S.vout = Vin * S.rL / (S.rL + Rfix);
    }
    
    S.analog = Math.round((S.vout / Vin) * 1023);
    
    // Atualiza UI da bancada
    $('#benchLuz').textContent = S.luz + '%';
    $('#benchRL').textContent = fmtR(S.rL);
    $('#benchVout').textContent = S.vout.toFixed(2) + 'V';
    
    // LED state
    const led = $('.led-dot');
    const threshold = 500;
    let on = S.modo ? S.analog > threshold : S.analog < threshold;
    led.classList.toggle('on', on);
    
    // Atualiza SVG do circuito (se existir)
    updateCircuitSVG();
  }

  function updateCircuitSVG() {
    const svg = $('#circuitSvg');
    if (!svg) return;
    
    // Animação de elétrons (opcional)
    const electrons = $$('.electron');
    const speed = 0.5 + (S.vout / 5) * 2;
    electrons.forEach((el, i) => {
      el.style.animationDuration = (2.5 / speed) + 's';
      el.style.animationDelay = (i * 0.3) + 's';
    });
  }

  // ========== EVENT LISTENERS DO SLIDER ==========
  function initBenchSlider() {
    const slider = $('#benchSlider');
    if (!slider) return;
    
    slider.addEventListener('input', e => {
      S.luz = parseInt(e.target.value, 10);
      updateSim();
    });
    
    slider.addEventListener('change', () => {
      // Efeito de "snap" ao soltar
      slider.parentElement.classList.add('snapped');
      setTimeout(() => slider.parentElement.classList.remove('snapped'), 200);
    });
  }

  // ========== REVEAL ON SCROLL ==========
  function initReveal() {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          // Opcional: parar de observar após revelar
          // observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    $$('.rv').forEach(el => observer.observe(el));
  }

  // ========== PROGRESS BAR DE SCROLL ==========
  function initProgress() {
    const bar = $('#progress');
    if (!bar) return;
    
    function update() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      bar.style.width = scrollPercent + '%';
    }
    
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ========== HEADER SCROLL EFFECT ==========
  function initHeaderScroll() {
    const header = $('header');
    if (!header) return;
    
    function update() {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
    
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ========== TORCH EFFECT (MOUSE FOLLOWER) ==========
  function initTorch() {
    const torch = $('#torch');
    if (!torch) return;
    
    let timeout;
    document.addEventListener('mousemove', e => {
      torch.style.left = e.clientX + 'px';
      torch.style.top = e.clientY + 'px';
      torch.style.opacity = '1';
      
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        torch.style.opacity = '0';
      }, 1500);
    }, { passive: true });
  }

  // ========== TABS DE CÓDIGO ==========
  function initCodeTabs() {
    $$('.codetab').forEach(tab => {
      tab.addEventListener('click', () => {
        const group = tab.closest('.codewrap');
        if (!group) return;
        
        // Remove active state
        $$('.codetab', group).forEach(t => t.classList.remove('on'));
        $$('.codewrap pre', group).forEach(p => p.classList.remove('on'));
        
        // Add active state
        tab.classList.add('on');
        $('#' + tab.dataset.t)?.classList.add('on');
      });
    });
  }

  // ========== COPY BUTTON ==========
  function initCopyBtn() {
    const btn = $('#copyBtn');
    if (!btn) return;
    
    btn.addEventListener('click', function() {
      const code = $('.codewrap pre.on')?.innerText || '';
      
      const done = () => {
        this.textContent = 'COPIADO ✔';
        setTimeout(() => {
          this.textContent = 'COPIAR';
        }, 1600);
      };
      
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code).then(done);
      } else {
        // Fallback para browsers antigos
        const textarea = document.createElement('textarea');
        textarea.value = code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        done();
      }
    });
  }

  // ========== MONITOR SERIAL ==========
  function initSerialMonitor() {
    const serialOut = $('#serialOut');
    const serialBtn = $('#serialBtn');
    if (!serialOut || !serialBtn) return;
    
    let serialTimer = null;
    let firstLine = true;
    
    function serialLine() {
      if (firstLine) {
        serialOut.textContent = '';
        firstLine = false;
      }
      
      const t = new Date();
      const hh = String(t.getHours()).padStart(2, '0');
      const mm = String(t.getMinutes()).padStart(2, '0');
      const ss = String(t.getSeconds()).padStart(2, '0');
      const ms = String(t.getMilliseconds()).padStart(3, '0');
      
      const ledTxt = S.modo 
        ? (S.analog < 500 ? 'LED=ACESO' : 'led=off')
        : (S.analog > 500 ? 'LED=ACESO' : 'led=off');
      
      const line = document.createElement('span');
      line.innerHTML = `\n<span class="t">[${hh}:${mm}:${ss}.${ms}]</span> leitura=<b>${S.analog}</b>  V=${S.vout.toFixed(2)}V  R≈${fmtR(S.rL)}  ${ledTxt}`;
      serialOut.appendChild(line);
      
      // Manter apenas as últimas 26 linhas
      while (serialOut.childNodes.length > 26) {
        serialOut.removeChild(serialOut.firstChild);
      }
      
      serialOut.scrollTop = serialOut.scrollHeight;
    }
    
    serialBtn.addEventListener('click', () => {
      if (serialTimer) {
        clearInterval(serialTimer);
        serialTimer = null;
        serialBtn.textContent = '▶ Iniciar';
        serialBtn.classList.remove('active');
      } else {
        serialTimer = setInterval(serialLine, 650);
        serialBtn.textContent = '⏸ Pausar';
        serialBtn.classList.add('active');
        serialLine();
      }
    });
  }

  // ========== ACORDEÃO ==========
  function initAccordion() {
    $$('.acc-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.parentElement;
        const open = item.classList.contains('open');
        
        // Fecha todos
        $$('.acc').forEach(acc => {
          acc.classList.remove('open');
          acc.querySelector('.acc-btn')?.setAttribute('aria-expanded', 'false');
        });
        
        // Abre o clicado se não estava aberto
        if (!open) {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          
          // Adiciona efeito de ripple
          createRipple(btn, event);
        }
      });
    });
  }

  // ========== LIGHTBOX ==========
  function initLightbox() {
    const lb = $('#lightbox');
    const lbImg = $('#lbImg');
    const lbCap = $('#lbCap');
    const lbX = $('#lbX');
    
    if (!lb || !lbImg) return;
    
    $$('.pc').forEach(pc => {
      pc.addEventListener('click', () => {
        const img = pc.querySelector('img');
        if (!img) return;
        
        // Carrega imagem em alta resolução
        lbImg.src = img.src.replace(/\/700\/520$/, '/1200/800');
        lbImg.alt = img.alt;
        lbCap.textContent = pc.querySelector('figcaption')?.textContent || '';
        
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    
    function closeLb() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
    }
    
    lb.addEventListener('click', e => {
      if (e.target !== lbImg) closeLb();
    });
    
    lbX?.addEventListener('click', closeLb);
    
    window.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeLb();
    });
  }

  // ========== MOBILE NAV ==========
  function initMobileNav() {
    const navBtn = $('#navBtn');
    const navMobile = $('.nav-mobile');
    
    if (!navBtn || !navMobile) return;
    
    navBtn.addEventListener('click', () => {
      navMobile.classList.toggle('open');
      navBtn.setAttribute('aria-expanded', navMobile.classList.contains('open'));
    });
    
    // Fecha ao clicar em um link
    $$('.nav-mobile a').forEach(link => {
      link.addEventListener('click', () => {
        navMobile.classList.remove('open');
        navBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ========== NAV ACTIVE STATE ==========
  function initNavActive() {
    const sections = $$('section[id]');
    const navLinks = $$('nav a[href^="#"]');
    
    if (!sections.length || !navLinks.length) return;
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-100px 0px -50% 0px'
    });
    
    sections.forEach(section => observer.observe(section));
  }

  // ========== RIPPLE EFFECT ==========
  function createRipple(element, event) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (event.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (event.clientY - rect.top - size / 2) + 'px';
    
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 1000);
  }

  // ========== BOTÕES COM RIPPLE ==========
  function initButtonRipples() {
    $$('.btn, .sim-btn, #copyBtn, #serialBtn').forEach(btn => {
      btn.addEventListener('click', e => {
        createRipple(btn, e);
      });
    });
  }

  // ========== ANIMAÇÃO DE NÚMEROS ==========
  function initNumberAnimations() {
    const numbers = $$('.value[data-animate]');
    
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseFloat(el.dataset.animate);
          const duration = 1500;
          const start = performance.now();
          
          function animate(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quart
            const ease = 1 - Math.pow(1 - progress, 4);
            
            const current = target * ease;
            el.textContent = current.toFixed(2);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          }
          
          requestAnimationFrame(animate);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    
    numbers.forEach(el => observer.observe(el));
  }

  // ========== PARTICLE BACKGROUND (OPCIONAL) ==========
  function initParticles() {
    const container = $('#particles');
    if (!container) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      const size = Math.random() * 4 + 2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 20 + 10;
      const delay = Math.random() * 5;
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 181, 74, ${Math.random() * 0.3 + 0.1});
        border-radius: 50%;
        left: ${x}%;
        top: ${y}%;
        animation: float ${duration}s ease-in-out ${delay}s infinite;
        pointer-events: none;
      `;
      
      container.appendChild(particle);
    }
  }

  // ========== TILT EFFECT EM CARDS ==========
  function initTiltEffect() {
    const cards = $$('.card, .bench, .sim-container');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  // ========== SMOOTH SCROLL PARA LINKS INTERNOS ==========
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = $(href);
        if (!target) return;
        
        e.preventDefault();
        
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Fecha menu mobile se estiver aberto
        const navMobile = $('.nav-mobile');
        if (navMobile?.classList.contains('open')) {
          navMobile.classList.remove('open');
        }
      });
    });
  }

  // ========== LAZY LOADING PARA IMAGENS ==========
  function initLazyLoading() {
    const images = $$('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '50px 0px' });
    
    images.forEach(img => imageObserver.observe(img));
  }


  // ========== ANIMAÇÕES DE FUNDO ==========
  function initBackgroundAnimations() {
    // Cria container de animação se não existir
    let container = document.getElementById('bgAnimation');
    if (!container) {
      container = document.createElement('div');
      container.id = 'bgAnimation';
      container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden;';
      document.body.insertBefore(container, document.body.firstChild);
    }

    // Animação de ondas/luzes suaves
    createWaves(container);
    
    // Partículas flutuantes
    createFloatingParticles(container);
    
    // Pulsos de luz
    createLightPulses(container);
  }

  function createWaves(container) {
    const waveCount = 5;
    for (let i = 0; i < waveCount; i++) {
      const wave = document.createElement('div');
      const size = Math.random() * 600 + 400;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 15 + 20;
      const colors = [
        'rgba(255, 181, 74, 0.08)',
        'rgba(92, 232, 197, 0.06)',
        'rgba(255, 139, 31, 0.05)',
        'rgba(148, 170, 200, 0.04)'
      ];
      
      wave.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(ellipse, ${colors[i % colors.length]}, transparent 70%);
        border-radius: 50%;
        left: ${x}%;
        top: ${y}%;
        animation: waveFloat ${duration}s ease-in-out ${i * 3}s infinite;
        opacity: ${Math.random() * 0.5 + 0.3};
      `;
      
      container.appendChild(wave);
    }
  }

  function createFloatingParticles(container) {
    const particleCount = 40;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      const size = Math.random() * 5 + 2;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 25 + 15;
      const delay = Math.random() * 10;
      const brightness = Math.random() * 0.5 + 0.2;
      
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(255, 181, 74, ${brightness}), transparent 70%);
        border-radius: 50%;
        left: ${x}%;
        top: ${y}%;
        animation: particleFloat ${duration}s ease-in-out ${delay}s infinite;
        box-shadow: 0 0 ${size * 2}px rgba(255, 181, 74, ${brightness});
      `;
      
      container.appendChild(particle);
    }
  }

  function createLightPulses(container) {
    const pulseCount = 8;
    for (let i = 0; i < pulseCount; i++) {
      const pulse = document.createElement('div');
      const size = Math.random() * 200 + 100;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 8 + 6;
      const delay = Math.random() * 4;
      const colors = ['rgba(92, 232, 197, 0.1)', 'rgba(255, 181, 74, 0.08)'];
      
      pulse.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, ${colors[i % colors.length]}, transparent 70%);
        border-radius: 50%;
        left: ${x}%;
        top: ${y}%;
        animation: lightPulse ${duration}s ease-in-out ${delay}s infinite;
      `;
      
      container.appendChild(pulse);
    }
  }

  // Adiciona keyframes dinâmicos
  (function addKeyframes() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes waveFloat {
        0%, 100% { transform: translate(0, 0) scale(1); }
        25% { transform: translate(5%, 8%) scale(1.1); }
        50% { transform: translate(-3%, -5%) scale(0.95); }
        75% { transform: translate(-7%, 3%) scale(1.05); }
      }
      @keyframes particleFloat {
        0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.4; }
        25% { transform: translate(10%, -15%) rotate(90deg); opacity: 0.8; }
        50% { transform: translate(-5%, -25%) rotate(180deg); opacity: 0.5; }
        75% { transform: translate(-12%, -8%) rotate(270deg); opacity: 0.7; }
      }
      @keyframes lightPulse {
        0%, 100% { transform: scale(0.8); opacity: 0.3; }
        50% { transform: scale(1.3); opacity: 0.7; }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
  })();

  // ========== INICIALIZAÇÃO ==========
  function init() {
    // Aguarda DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    // Inicializa todas as funcionalidades
    initBenchSlider();
    initReveal();
    initProgress();
    initHeaderScroll();
    // initTorch(); // Efeito de tocha removido
    initBackgroundAnimations(); // Nova animação de fundo
    initCodeTabs();
    initCopyBtn();
    initSerialMonitor();
    initAccordion();
    initLightbox();
    initMobileNav();
    initNavActive();
    initButtonRipples();
    initSmoothScroll();
    initLazyLoading();

    // Efeitos visuais opcionais
    // initTiltEffect();
    // initParticles();
    // initNumberAnimations();

    // Atualiza simulador inicial
    updateSim();

    console.log('%c🔆 SENSOR LDR — Animações de Fundo', 'color: #ffb54a; font-size: 16px; font-weight: bold;');
    console.log('%cSite carregado com sucesso!', 'color: #5ce8c5;');
  }

  // Inicia
  init();
})();
