/* ==========================================================================
   ANISHA GUPTA - GAME DEVELOPER PORTFOLIO
   Interactive Script Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initNavbar();
  initScrollSpy();
  initModals();
  initContactForm();
  initSnakeGame();
  initQrGenerator();
});

/* ==========================================================================
   1. PARTICLES CANVAS BACKGROUND
   ========================================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width * 0.05), 60);

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? 'rgba(255, 235, 151, ' : 'rgba(240, 180, 41, ',
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Render particles
    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color + '0.8)';
      ctx.fill();

      // Connect nearby particles with subtle lines
      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(255, 235, 151, ${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* ==========================================================================
   2. NAVBAR & MOBILE NAVIGATION
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  // Sticky header class toggle
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile menu toggle
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      const icon = navToggle.querySelector('i');
      if (icon) {
        if (navLinks.classList.contains('active')) {
          icon.className = 'fas fa-times';
        } else {
          icon.className = 'fas fa-bars';
        }
      }
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = navToggle.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
      });
    });
  }
}

/* ==========================================================================
   3. SCROLLSPY (ACTIVE NAV LINK HIGHLIGHT)
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  function spy() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', spy);
}

/* ==========================================================================
   4. MODALS MANAGEMENT
   ========================================================================== */
function initModals() {
  const modalTriggers = document.querySelectorAll('[data-modal]');
  const closeBtns = document.querySelectorAll('.modal-close-btn');
  const backdrops = document.querySelectorAll('.modal-backdrop');

  modalTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-modal');
      const modal = document.getElementById(targetId);
      if (modal) {
        modal.classList.add('active');
        if (targetId === 'snake-modal' && window.resetSnakeGame) {
          window.resetSnakeGame();
        }
      }
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      backdrops.forEach(modal => modal.classList.remove('active'));
    });
  });

  backdrops.forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
      }
    });
  });
}

/* ==========================================================================
   5. PLAYABLE SNAKE GAME
   ========================================================================== */
function initSnakeGame() {
  const canvas = document.getElementById('snake-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const scoreElem = document.getElementById('snake-score');
  const restartBtn = document.getElementById('snake-restart');

  const gridSize = 20;
  const tileCount = canvas.width / gridSize;

  let snake = [{ x: 10, y: 10 }];
  let food = { x: 15, y: 15 };
  let dx = 0;
  let dy = 0;
  let score = 0;
  let gameInterval = null;
  let gameRunning = false;

  function placeFood() {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  }

  function gameLoop() {
    if (!gameRunning) return;

    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
      gameOver();
      return;
    }

    // Self collision
    for (let i = 0; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        gameOver();
        return;
      }
    }

    snake.unshift(head);

    // Food collision
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      if (scoreElem) scoreElem.textContent = score;
      placeFood();
    } else {
      snake.pop();
    }

    // Render
    ctx.fillStyle = '#0d081e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render food
    ctx.fillStyle = '#f0b429';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#f0b429';
    ctx.fillRect(food.x * gridSize + 1, food.y * gridSize + 1, gridSize - 2, gridSize - 2);

    // Render snake
    for (let i = 0; i < snake.length; i++) {
      ctx.fillStyle = i === 0 ? '#ffeb97' : '#d9a21b';
      ctx.shadowBlur = i === 0 ? 15 : 5;
      ctx.shadowColor = '#d9a21b';
      ctx.fillRect(snake[i].x * gridSize + 1, snake[i].y * gridSize + 1, gridSize - 2, gridSize - 2);
    }
  }

  function startGame() {
    snake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    dx = 0;
    dy = -1;
    score = 0;
    if (scoreElem) scoreElem.textContent = score;
    placeFood();
    gameRunning = true;
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 120);
  }

  function gameOver() {
    gameRunning = false;
    clearInterval(gameInterval);
    ctx.fillStyle = 'rgba(10, 7, 23, 0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '20px Orbitron';
    ctx.fillStyle = '#f59e0b';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '14px Outfit';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('Press Restart to play again', canvas.width / 2, canvas.height / 2 + 20);
  }

  window.resetSnakeGame = startGame;

  if (restartBtn) restartBtn.addEventListener('click', startGame);

  // Keyboard navigation
  window.addEventListener('keydown', e => {
    if (!gameRunning) return;
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        if (dy !== 1) { dx = 0; dy = -1; }
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        if (dy !== -1) { dx = 0; dy = 1; }
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        if (dx !== 1) { dx = -1; dy = 0; }
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        if (dx !== -1) { dx = 1; dy = 0; }
        break;
    }
  });

  // Mobile D-Pad listeners
  document.querySelectorAll('[data-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.getAttribute('data-dir');
      if (dir === 'up' && dy !== 1) { dx = 0; dy = -1; }
      if (dir === 'down' && dy !== -1) { dx = 0; dy = 1; }
      if (dir === 'left' && dx !== 1) { dx = -1; dy = 0; }
      if (dir === 'right' && dx !== -1) { dx = 1; dy = 0; }
    });
  });
}

/* ==========================================================================
   6. QR CODE GENERATOR INTERACTIVE TOOL
   ========================================================================== */
function initQrGenerator() {
  const qrInput = document.getElementById('qr-text-input');
  const qrBtn = document.getElementById('generate-qr-btn');
  const qrImg = document.getElementById('qr-code-img');

  if (qrBtn && qrInput && qrImg) {
    qrBtn.addEventListener('click', () => {
      const val = qrInput.value.trim() || 'https://github.com';
      const encoded = encodeURIComponent(val);
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encoded}&color=ffeb97&bgcolor=ffffff`;
      showToast('QR Code Generated Successfully! 📱');
    });
  }
}

/* ==========================================================================
   7. CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = form.querySelector('#name');
    const emailInput = form.querySelector('#email');
    const messageInput = form.querySelector('#message');
    const btn = form.querySelector('button[type="submit"]');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !email || !message) {
      showToast('Please fill in all fields before sending. ⚠️');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address. ⚠️');
      return;
    }

    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SENDING...';

    const subject = encodeURIComponent(`Portfolio Contact - ${name}`);
    const body = encodeURIComponent(
      `Hi Anisha,\n\nYou have a new message from your portfolio contact form:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent via Anisha Gupta Portfolio`
    );
    const mailtoUrl = `mailto:anishgupta8108@gmail.com?subject=${subject}&body=${body}`;

    setTimeout(() => {
      window.open(mailtoUrl, '_blank');
      btn.disabled = false;
      btn.innerHTML = originalText;
      form.reset();
      showToast('Message opened in your email client! 🚀');
    }, 1000);
  });
}

/* ==========================================================================
   8. TOAST NOTIFICATION UTILITY
   ========================================================================== */
function showToast(message) {
  let toast = document.getElementById('toast-notification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `<i class="fas fa-check-circle accent-purple"></i> <span>${message}</span>`;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
