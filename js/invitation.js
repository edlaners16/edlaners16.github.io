document.addEventListener("DOMContentLoaded", () => {

    // Trigger page fade-in effect
    document.body.classList.remove('fade-in');
    
    const revealElements = document.querySelectorAll(".scroll-reveal");

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Trigger when 10% of the element is visible
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // --- CONTINUOUS & MANUAL GALLERY CAROUSEL ---
    const photoGrid = document.querySelector('.photo-grid');
    if (photoGrid) {
        // 1. Duplicate images for a seamless loop
        const images = Array.from(photoGrid.children);
        images.forEach(image => {
            const clone = image.cloneNode(true);
            clone.classList.remove('scroll-reveal', 'visible');
            photoGrid.appendChild(clone);
        });

        const carousel = photoGrid.closest('.gallery-carousel');
        const nextBtn = carousel.querySelector('.gallery-next');
        const prevBtn = carousel.querySelector('.gallery-prev');

        let animationFrameId;
        let currentPosition = 0;
        const scrollSpeed = 0.8; // Adjust for speed. Higher is faster.

        // 2. The main animation loop for continuous scroll
        const autoScroll = () => {
            currentPosition -= scrollSpeed;
            const imageWidth = photoGrid.firstElementChild.offsetWidth + 15; // width + gap

            // If we've scrolled past one full image, reset the position
            // and move the first image to the end of the grid.
            if (Math.abs(currentPosition) >= imageWidth) {
                photoGrid.appendChild(photoGrid.firstElementChild);
                currentPosition += imageWidth;
            }

            photoGrid.style.transform = `translateX(${currentPosition}px)`;
            animationFrameId = requestAnimationFrame(autoScroll);
        };

        const stopAutoScroll = () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };

        const startAutoScroll = () => {
            stopAutoScroll(); // Prevent multiple loops
            animationFrameId = requestAnimationFrame(autoScroll);
        };

        // 3. Manual navigation handlers
        nextBtn.addEventListener('click', () => {
            photoGrid.appendChild(photoGrid.firstElementChild);
        });

        prevBtn.addEventListener('click', () => {
            photoGrid.insertBefore(photoGrid.lastElementChild, photoGrid.firstElementChild);
        });

        // 4. Pause on hover, resume on leave
        carousel.addEventListener('mouseenter', stopAutoScroll);
        carousel.addEventListener('mouseleave', startAutoScroll);

        // 5. Start the carousel
        startAutoScroll();
    }

    // --- GALLERY & LIGHTBOX SETUP ---
    const lightbox = document.getElementById('lightbox');
    const lbImage = lightbox && lightbox.querySelector('.lightbox-image');
    const lbClose = lightbox && lightbox.querySelector('.lightbox-close');
    const lbSpinner = lightbox && lightbox.querySelector('.lightbox-spinner');

    function openLightbox(src, alt) {
        if (!lightbox || !lbImage) return;
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

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

    function closeLightbox() {
        if (!lightbox || !lbImage) return;
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        lbImage.src = '';
        if (lbSpinner) lbSpinner.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Use event delegation for lightbox targets to support dynamically added clones
    document.body.addEventListener('click', (e) => {
        const targetImage = e.target.closest('img.lightbox-target');
        if (targetImage && !targetImage.closest('.lightbox')) {
            openLightbox(targetImage.getAttribute('src'), targetImage.getAttribute('alt'));
        }
    });

    // Close interactions
    if (lbClose) lbClose.addEventListener('click', closeLightbox);

    if (lightbox) lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-overlay')) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (lightbox.classList.contains('open') && e.key === 'Escape') {
            closeLightbox();
        }
    });
});