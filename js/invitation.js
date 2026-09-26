// ================================================================
//   invitation.js — Wedding Invitation Page Script
// ================================================================

document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // 1. PAGE FADE-IN
    // ============================================================
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            document.body.classList.remove('fade-in');
        });
    });

    // ============================================================
    // 2. SCROLL REVEAL (IntersectionObserver)
    // ============================================================
    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll(".scroll-reveal").forEach(el => revealObserver.observe(el));


    // ============================================================
    // 3. LIVE COUNTDOWN (inside invitation page)
    // ============================================================
    const weddingDate = new Date("March 9, 2028 13:00:00").getTime();
    const els = {
        days:    document.getElementById('i-days'),
        hours:   document.getElementById('i-hours'),
        minutes: document.getElementById('i-minutes'),
        seconds: document.getElementById('i-seconds'),
    };

    function pad(n) { return String(n).padStart(2, '0'); }

    function tickCountdown() {
        const dist = weddingDate - Date.now();
        if (dist <= 0 || !els.days) return;
        els.days.textContent    = Math.floor(dist / 86400000);
        els.hours.textContent   = pad(Math.floor((dist % 86400000) / 3600000));
        els.minutes.textContent = pad(Math.floor((dist % 3600000)  / 60000));
        els.seconds.textContent = pad(Math.floor((dist % 60000)    / 1000));
    }
    tickCountdown();
    setInterval(tickCountdown, 1000);


    // ============================================================
    // 4. FLOATING PETALS on HEADER
    // ============================================================
    (function initHeaderPetals() {
        const canvas = document.getElementById('header-petals');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let W, H, petals = [];
        const COUNT = 20;

        function resize() {
            const parent = canvas.parentElement;
            W = canvas.width  = parent.offsetWidth;
            H = canvas.height = parent.offsetHeight;
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        const COLORS = ['rgba(255,255,255,0.6)', 'rgba(232,201,122,0.5)', 'rgba(255,220,200,0.55)'];

        function mkPetal() {
            return {
                x: Math.random() * W,
                y: -20 - Math.random() * 60,
                size: 3 + Math.random() * 7,
                vy: 0.5 + Math.random() * 1.1,
                vx: (Math.random() - 0.5) * 0.7,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.05,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: 0.02 + Math.random() * 0.02,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            };
        }

        for (let i = 0; i < COUNT; i++) {
            const p = mkPetal();
            p.y = Math.random() * H;
            petals.push(p);
        }

        function draw() {
            ctx.clearRect(0, 0, W, H);
            petals.forEach((p, i) => {
                p.wobble += p.wobbleSpeed;
                p.x += p.vx + Math.sin(p.wobble) * 0.5;
                p.y += p.vy;
                p.angle += p.spin;
                if (p.y > H + 20) petals[i] = mkPetal();

                ctx.save();
                ctx.globalAlpha = 0.85;
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.ellipse(0, 0, p.size * 0.45, p.size, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
            requestAnimationFrame(draw);
        }
        draw();
    })();


    // ============================================================
    // 5. GALLERY CAROUSEL (continuous + manual)
    // ============================================================
    const photoGrid = document.querySelector('.photo-grid');
    if (photoGrid) {
        // Clone for seamless loop
        Array.from(photoGrid.children).forEach(img => {
            const clone = img.cloneNode(true);
            photoGrid.appendChild(clone);
        });

        const carousel = photoGrid.closest('.gallery-carousel');
        const nextBtn  = carousel.querySelector('.gallery-next');
        const prevBtn  = carousel.querySelector('.gallery-prev');

        let rafId, pos = 0;
        const SPEED = 0.75;

        function getImgW() {
            return (photoGrid.firstElementChild?.offsetWidth || 300) + 15;
        }

        function autoScroll() {
            pos -= SPEED;
            const imgW = getImgW();
            if (Math.abs(pos) >= imgW) {
                photoGrid.appendChild(photoGrid.firstElementChild);
                pos += imgW;
            }
            photoGrid.style.transform = `translateX(${pos}px)`;
            rafId = requestAnimationFrame(autoScroll);
        }

        const stop  = () => { if (rafId) cancelAnimationFrame(rafId); };
        const start = () => { stop(); rafId = requestAnimationFrame(autoScroll); };

        nextBtn.addEventListener('click', () => {
            photoGrid.appendChild(photoGrid.firstElementChild);
        });
        prevBtn.addEventListener('click', () => {
            photoGrid.insertBefore(photoGrid.lastElementChild, photoGrid.firstElementChild);
        });

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);

        // Touch support
        let touchStartX = 0;
        carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; stop(); }, { passive: true });
        carousel.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 40) {
                if (dx < 0) photoGrid.appendChild(photoGrid.firstElementChild);
                else photoGrid.insertBefore(photoGrid.lastElementChild, photoGrid.firstElementChild);
            }
            start();
        }, { passive: true });

        start();
    }


    // ============================================================
    // 6. LIGHTBOX with PREV / NEXT navigation
    // ============================================================
    const lightbox = document.getElementById('lightbox');
    const lbImage  = lightbox?.querySelector('.lightbox-image');
    const lbClose  = lightbox?.querySelector('.lightbox-close');
    const lbSpinner = lightbox?.querySelector('.lightbox-spinner');
    const lbPrev   = lightbox?.querySelector('.lightbox-prev');
    const lbNext   = lightbox?.querySelector('.lightbox-next');

    // Collect all lightbox-target images (excluding clones)
    let lbImages  = [];
    let lbCurrent = 0;

    function refreshImages() {
        lbImages = Array.from(
            document.querySelectorAll('section img.lightbox-target, .story-image img.lightbox-target')
        );
    }
    refreshImages();

    function loadImage(src, alt) {
        if (!lbImage) return;
        if (lbSpinner) lbSpinner.style.display = 'block';
        lbImage.style.display = 'none';

        const img = new Image();
        img.onload = () => {
            lbImage.src = img.src;
            lbImage.alt = alt || '';
            lbImage.style.display = 'block';
            if (lbSpinner) lbSpinner.style.display = 'none';
        };
        img.onerror = () => {
            if (lbSpinner) lbSpinner.style.display = 'none';
            lbImage.style.display = 'block';
            lbImage.alt = 'Image failed to load';
        };
        img.src = src;
    }

    function openLightbox(src, alt, index) {
        if (!lightbox) return;
        lbCurrent = index ?? lbImages.findIndex(i => i.src.endsWith(src.split('/').pop()));
        if (lbCurrent < 0) lbCurrent = 0;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        loadImage(src, alt);
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        if (lbImage) lbImage.src = '';
        if (lbSpinner) lbSpinner.style.display = 'none';
        document.body.style.overflow = '';
    }

    function navigateLightbox(direction) {
        lbCurrent = (lbCurrent + direction + lbImages.length) % lbImages.length;
        const img = lbImages[lbCurrent];
        if (img) loadImage(img.src, img.alt);
    }

    // Click delegation (supports gallery clones via original src)
    document.body.addEventListener('click', e => {
        const img = e.target.closest('img.lightbox-target');
        if (img && !img.closest('.lightbox')) {
            refreshImages();
            const src = img.getAttribute('src');
            const idx = lbImages.findIndex(i => i.getAttribute('src') === src);
            openLightbox(src, img.getAttribute('alt'), idx);
        }
    });

    if (lbClose)   lbClose.addEventListener('click', closeLightbox);
    if (lbPrev)    lbPrev.addEventListener('click', () => navigateLightbox(-1));
    if (lbNext)    lbNext.addEventListener('click', () => navigateLightbox(1));

    lightbox?.addEventListener('click', e => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-overlay')) closeLightbox();
    });

    document.addEventListener('keydown', e => {
        if (!lightbox?.classList.contains('open')) return;
        if (e.key === 'Escape')      closeLightbox();
        if (e.key === 'ArrowRight')  navigateLightbox(1);
        if (e.key === 'ArrowLeft')   navigateLightbox(-1);
    });


    // ============================================================
    // 7. MUSIC PLAYER TOGGLE
    // ============================================================
    const audio       = document.getElementById('bg-music');
    const musicBtn    = document.getElementById('music-toggle');
    const musicIcon   = musicBtn?.querySelector('i');

    if (musicBtn && audio) {
        // Only show if audio source exists
        const hasSrc = audio.querySelector('source') || audio.src;
        if (!hasSrc) {
            document.getElementById('music-player')?.style.setProperty('display', 'none');
        }

        let playing = false;

        musicBtn.addEventListener('click', () => {
            if (playing) {
                audio.pause();
                playing = false;
                musicBtn.classList.remove('playing');
                musicIcon.className = 'fa-solid fa-music';
                musicBtn.setAttribute('aria-label', 'Play background music');
            } else {
                audio.volume = 0.35;
                audio.play().then(() => {
                    playing = true;
                    musicBtn.classList.add('playing');
                    musicIcon.className = 'fa-solid fa-pause';
                    musicBtn.setAttribute('aria-label', 'Pause background music');
                }).catch(() => {
                    // Autoplay blocked — show a toast
                    showToast('Tap Play to enable music 🎵');
                });
            }
        });
    }


    // ============================================================
    // 8. SIMPLE TOAST HELPER
    // ============================================================
    function showToast(message, duration = 3000) {
        const t = document.createElement('div');
        t.textContent = message;
        Object.assign(t.style, {
            position: 'fixed',
            bottom: '90px',
            right: '28px',
            background: 'rgba(42,42,42,0.9)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '50px',
            fontFamily: "'Poppins', sans-serif",
            fontSize: '14px',
            zIndex: 600,
            opacity: '0',
            transition: 'opacity 0.3s ease',
        });
        document.body.appendChild(t);
        requestAnimationFrame(() => t.style.opacity = '1');
        setTimeout(() => {
            t.style.opacity = '0';
            t.addEventListener('transitionend', () => t.remove());
        }, duration);
    }

});