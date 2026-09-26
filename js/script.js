// =============================================
//   Landing Page Script — script.js
// =============================================

// --- COUNTDOWN TIMER ---
const weddingDate = new Date("March 9, 2028 13:00:00").getTime();

function pad(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
    const now  = Date.now();
    const dist = weddingDate - now;

    if (dist <= 0) {
        document.getElementById("countdown").innerHTML =
            '<p style="font-size:24px;letter-spacing:2px;">🎉 Today is the Day!</p>';
        return;
    }

    document.getElementById("days").textContent    = Math.floor(dist / 86400000);
    document.getElementById("hours").textContent   = pad(Math.floor((dist % 86400000) / 3600000));
    document.getElementById("minutes").textContent = pad(Math.floor((dist % 3600000)  / 60000));
    document.getElementById("seconds").textContent = pad(Math.floor((dist % 60000)    / 1000));
}

updateCountdown();
setInterval(updateCountdown, 1000);


// --- PARALLAX HERO BACKGROUND ---
const heroBg = document.getElementById('hero-bg');
window.addEventListener('scroll', () => {
    if (heroBg) {
        const scrollY = window.scrollY;
        heroBg.style.transform = `scale(1.1) translateY(${scrollY * 0.3}px)`;
    }
}, { passive: true });


// --- FLOATING PETALS CANVAS ---
(function () {
    const canvas  = document.getElementById('petal-canvas');
    if (!canvas) return;
    const ctx     = canvas.getContext('2d');
    let W, H, petals = [];
    const PETAL_COUNT = 28;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const COLORS = ['#f9d5d3', '#fceacc', '#f7c3c3', '#ffe0b2', '#ffffff'];

    function createPetal() {
        return {
            x:      Math.random() * W,
            y:      -20 - Math.random() * 80,
            size:   4 + Math.random() * 8,
            speedY: 0.6 + Math.random() * 1.2,
            speedX: (Math.random() - 0.5) * 0.8,
            angle:  Math.random() * Math.PI * 2,
            spin:   (Math.random() - 0.5) * 0.04,
            alpha:  0.5 + Math.random() * 0.5,
            color:  COLORS[Math.floor(Math.random() * COLORS.length)],
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: 0.02 + Math.random() * 0.02,
        };
    }

    for (let i = 0; i < PETAL_COUNT; i++) {
        const p = createPetal();
        p.y = Math.random() * H; // spread initial positions
        petals.push(p);
    }

    function drawPetal(p) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function animate() {
        ctx.clearRect(0, 0, W, H);
        petals.forEach((p, i) => {
            p.wobble += p.wobbleSpeed;
            p.x += p.speedX + Math.sin(p.wobble) * 0.5;
            p.y += p.speedY;
            p.angle += p.spin;
            if (p.y > H + 20) {
                petals[i] = createPetal();
            }
            drawPetal(p);
        });
        requestAnimationFrame(animate);
    }
    animate();
})();


// --- OPEN INVITATION BUTTON ---
document.getElementById("openInvitation").addEventListener("click", () => {
    document.body.classList.add('fade-out');
    setTimeout(() => {
        window.location.href = "invitation.html";
    }, 500);
});