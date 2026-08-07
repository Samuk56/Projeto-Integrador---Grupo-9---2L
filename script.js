/* ============================================
   JAVASCRIPT - PROJETO INTEGRADOR CEP
   Sistema Inteligente de Aquecimento
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
    // Inicialização
    initParticles();
    initNavbar();
    initScrollReveal();
    initLDRSimulator();
    initDaySimulation();
    initNewtonDisk();
    initCameraObscura();
    initCodeCopy();
    initFAQ();
    initStatsCounter();
    initAccessibility();
    initBackToTop();
    initMenuToggle();
});

// ============================================
// PARTÍCULAS DE FUNDO
// ============================================
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// ============================================
// NAVBAR INTELIGENTE
// ============================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// ============================================
// MENU MOBILE
// ============================================
function initMenuToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ============================================
// SCROLL REVEAL
// ============================================
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');

    const revealOnScroll = () => {
        revealElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight - 100) {
                element.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on load
}

// ============================================
// SCROLL SUAVE PARA SEÇÕES
// ============================================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ============================================
// SIMULADOR LDR
// ============================================
function initLDRSimulator() {
    const lightSlider = document.getElementById('lightSlider');
    const lightValue = document.getElementById('lightValue');
    const luminosityValue = document.getElementById('luminosityValue');
    const resistanceValue = document.getElementById('resistanceValue');
    const energyValue = document.getElementById('energyValue');
    const energyFill = document.getElementById('energyFill');
    const simSun = document.getElementById('simSun');
    const simPanel = document.getElementById('simPanel');
    const simLdr = document.getElementById('simLdr');
    const simLed = document.getElementById('simLed');
    const ledLight = document.querySelector('.led-light');
    const canvas = document.getElementById('ldrGraph');
    const ctx = canvas.getContext('2d');

    function updateSimulator(value) {
        const percentage = value;
        
        // Atualizar valores de texto
        lightValue.textContent = percentage + '%';
        luminosityValue.textContent = percentage + '%';

        // Calcular resistência (inversamente proporcional à luz)
        let resistance;
        if (percentage < 30) {
            resistance = 'Alta';
        } else if (percentage < 70) {
            resistance = 'Média';
        } else {
            resistance = 'Baixa';
        }
        resistanceValue.textContent = resistance;

        // Calcular energia produzida
        let energy;
        if (percentage < 30) {
            energy = 'Baixa';
        } else if (percentage < 70) {
            energy = 'Média';
        } else {
            energy = 'Alta';
        }
        energyValue.textContent = energy;

        // Atualizar barra de energia
        energyFill.style.width = percentage + '%';

        // Atualizar aparência do sol
        const brightness = 0.3 + (percentage / 100) * 0.7;
        simSun.style.filter = `brightness(${brightness})`;
        simSun.style.boxShadow = `0 0 ${30 + percentage * 0.6}px rgba(255, 215, 0, ${0.4 + percentage / 200})`;

        // Atualizar painel solar
        simPanel.style.opacity = 0.3 + (percentage / 100) * 0.7;

        // Atualizar LDR (muda de cor baseado na luz)
        const ldrBrightness = 100 + (percentage * 1.5);
        simLdr.style.background = `rgb(${ldrBrightness}, ${ldrBrightness * 0.6}, ${ldrBrightness * 0.2})`;

        // Atualizar LED (acende com mais luz)
        if (percentage > 50) {
            ledLight.style.opacity = (percentage - 50) / 50;
        } else {
            ledLight.style.opacity = 0;
        }

        // Atualizar gráfico
        drawGraph(ctx, canvas.width, canvas.height, percentage);
    }

    function drawGraph(ctx, width, height, percentage) {
        ctx.clearRect(0, 0, width, height);

        // Desenhar eixos
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(40, 10);
        ctx.lineTo(40, height - 30);
        ctx.lineTo(width - 10, height - 30);
        ctx.stroke();

        // Desenhar curva de resistência vs luz
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(50, height - 40);

        for (let x = 50; x < width - 20; x += 5) {
            const xPercent = (x - 50) / (width - 70);
            const resistance = 100 - (xPercent * 100);
            const y = height - 40 - ((resistance / 100) * (height - 50));
            
            if (x === 50) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Desenhar ponto atual
        const currentX = 50 + ((percentage / 100) * (width - 70));
        const currentResistance = 100 - percentage;
        const currentY = height - 40 - ((currentResistance / 100) * (height - 50));

        ctx.fillStyle = '#3B82F6';
        ctx.beginPath();
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '12px Arial';
        ctx.fillText('Luz', width - 40, height - 10);
        ctx.fillText('Resistência', 5, 20);
    }

    lightSlider.addEventListener('input', (e) => {
        updateSimulator(parseInt(e.target.value));
    });

    // Inicializar
    updateSimulator(50);
}

// ============================================
// SIMULAÇÃO DO DIA
// ============================================
function initDaySimulation() {
    const simulateBtn = document.getElementById('simulateDayBtn');
    const cyclePhase = document.getElementById('cyclePhase');
    const skyVisual = document.getElementById('skyVisual');
    const skySun = document.getElementById('skySun');
    const skyMoon = document.getElementById('skyMoon');
    const stars = document.getElementById('stars');
    const sysLuminosity = document.getElementById('sysLuminosity');
    const sysPanel = document.getElementById('sysPanel');
    const sysLdr = document.getElementById('sysLdr');
    const sysHeating = document.getElementById('sysHeating');
    const sysTemp = document.getElementById('sysTemp');
    const simResults = document.getElementById('simResults');

    // Criar estrelas
    for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 2 + 's';
        stars.appendChild(star);
    }

    function setPhase(phase) {
        switch(phase) {
            case 'manha':
                cyclePhase.textContent = 'Manhã ☀️';
                skyVisual.style.background = 'linear-gradient(180deg, #FF7E5F 0%, #FEB47B 100%)';
                skySun.style.top = '80px';
                skySun.style.opacity = '1';
                skyMoon.style.opacity = '0';
                stars.style.opacity = '0';
                sysLuminosity.textContent = '40%';
                sysPanel.textContent = 'Ativo';
                sysLdr.textContent = 'Detectando';
                sysHeating.textContent = 'Ligando...';
                sysTemp.textContent = '29°C';
                break;
            case 'tarde':
                cyclePhase.textContent = 'Tarde ☀️';
                skyVisual.style.background = 'linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)';
                skySun.style.top = '20px';
                skySun.style.opacity = '1';
                skyMoon.style.opacity = '0';
                stars.style.opacity = '0';
                sysLuminosity.textContent = '95%';
                sysPanel.textContent = 'Máximo';
                sysLdr.textContent = 'Alta Luz';
                sysHeating.textContent = 'Ligado ✔';
                sysTemp.textContent = '32°C';
                break;
            case 'noite':
                cyclePhase.textContent = 'Noite 🌙';
                skyVisual.style.background = 'linear-gradient(180deg, #0f0c29 0%, #302b63 100%)';
                skySun.style.opacity = '0';
                skyMoon.style.opacity = '1';
                skyMoon.style.top = '30px';
                stars.style.opacity = '1';
                sysLuminosity.textContent = '5%';
                sysPanel.textContent = 'Inativo';
                sysLdr.textContent = 'Baixa Luz';
                sysHeating.textContent = 'Desligado';
                sysTemp.textContent = '30°C';
                break;
        }
    }

    simulateBtn.addEventListener('click', async () => {
        simResults.classList.remove('show');
        simulateBtn.disabled = true;

        // Manhã
        setPhase('manha');
        await sleep(2000);

        // Tarde
        setPhase('tarde');
        await sleep(2000);

        // Noite
        setPhase('noite');
        await sleep(1000);

        // Mostrar resultados
        simResults.classList.add('show');
        simulateBtn.disabled = false;
    });

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ============================================
// DISCO DE NEWTON
// ============================================
function initNewtonDisk() {
    const spinBtn = document.getElementById('spinDiskBtn');
    const newtonDisk = document.getElementById('newtonDisk');
    let isSpinning = false;

    spinBtn.addEventListener('click', () => {
        if (!isSpinning) {
            newtonDisk.classList.add('spinning');
            spinBtn.textContent = '⏹ Parar Disco';
            isSpinning = true;
        } else {
            newtonDisk.classList.remove('spinning');
            spinBtn.textContent = '🌀 Girar Disco';
            isSpinning = false;
        }
    });
}

// ============================================
// CÂMARA ESCURA
// ============================================
function initCameraObscura() {
    const cameraSlider = document.getElementById('cameraSlider');
    const cameraObject = document.getElementById('cameraObject');

    cameraSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const translateX = (value - 50) * 3;
        cameraObject.style.transform = `translateX(${translateX}px)`;
    });
}

// ============================================
// COPIAR CÓDIGO
// ============================================
function initCodeCopy() {
    const copyBtn = document.getElementById('copyCodeBtn');
    const codeElement = document.getElementById('arduinoCode');

    copyBtn.addEventListener('click', async () => {
        const codeText = codeElement.textContent;
        
        try {
            await navigator.clipboard.writeText(codeText);
            copyBtn.textContent = '✅ Copiado!';
            setTimeout(() => {
                copyBtn.textContent = '📋 Copiar Código';
            }, 2000);
        } catch (err) {
            copyBtn.textContent = '❌ Erro';
            setTimeout(() => {
                copyBtn.textContent = '📋 Copiar Código';
            }, 2000);
        }
    });
}

// ============================================
// FAQ ACCORDION
// ============================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Fechar todos
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Abrir o clicado se não estava aberto
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

// ============================================
// CONTADORES ANIMADOS
// ============================================
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    let started = false;

    function startCounting() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    stat.textContent = target;
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(current);
                }
            }, 16);
        });
    }

    const statsSection = document.querySelector('.stats-grid');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                started = true;
                startCounting();
            }
        });
    }, { threshold: 0.5 });

    if (statsSection) {
        observer.observe(statsSection);
    }
}

// ============================================
// ACESSIBILIDADE
// ============================================
function initAccessibility() {
    const contrastBtn = document.getElementById('contrastBtn');
    const increaseFontBtn = document.getElementById('increaseFontBtn');
    const decreaseFontBtn = document.getElementById('decreaseFontBtn');
    let fontSize = 16;
    let isHighContrast = false;

    contrastBtn.addEventListener('click', () => {
        isHighContrast = !isHighContrast;
        if (isHighContrast) {
            document.body.classList.add('high-contrast');
            contrastBtn.textContent = '🔲 Modo Normal';
        } else {
            document.body.classList.remove('high-contrast');
            contrastBtn.textContent = '🔲 Modo Alto Contraste';
        }
    });

    increaseFontBtn.addEventListener('click', () => {
        if (fontSize < 24) {
            fontSize += 2;
            document.documentElement.style.fontSize = fontSize + 'px';
        }
    });

    decreaseFontBtn.addEventListener('click', () => {
        if (fontSize > 12) {
            fontSize -= 2;
            document.documentElement.style.fontSize = fontSize + 'px';
        }
    });
}

// ============================================
// VOLTAR AO TOPO
// ============================================
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============================================
// RIPPLE EFFECT NOS BOTÕES
// ============================================
document.querySelectorAll('.ripple-btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        this.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// ============================================
// SUPORTE PARA TECLADO NO FAQ
// ============================================
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            question.click();
        }
    });
});

// ============================================
// MICROANIMAÇÕES HOVER
// ============================================
document.querySelectorAll('.glass-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Exportar função para escopo global
window.scrollToSection = scrollToSection;