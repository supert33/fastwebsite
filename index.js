// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis smooth scroll
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

// Sync Lenis with GSAP ScrollTrigger
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Smooth scrolling for Anchor Links via Lenis
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            lenis.scrollTo(target, { 
                offset: 0, 
                duration: 1.5, 
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) 
            });
        }
    });
});

// Preloader Animation (Portal)
const portalRing = document.getElementById('portal-ring');
const skyBg = document.getElementById('sky-bg');
const preloader = document.getElementById('portal-preloader');

window.addEventListener("load", () => {
    // Disable scrolling during preloader
    lenis.stop();

    if(portalRing) {
        portalRing.addEventListener('click', () => {
            // Warp the sky
            skyBg.classList.add('warp');
            
            // Scale up the portal massively
            gsap.to(portalRing, {
                scale: 50,
                opacity: 0,
                filter: 'blur(10px)',
                duration: 1.5,
                ease: "power2.inOut",
                onComplete: () => {
                    gsap.to(preloader, {
                        opacity: 0,
                        duration: 0.8,
                        onComplete: () => {
                            preloader.style.display = 'none';
                            lenis.start();
                            initEntranceAnimation();
                        }
                    });
                }
            });
        });
    } else {
        lenis.start();
        initEntranceAnimation();
    }
});

// Entrance Animation for Section 1 (About Me)
function initEntranceAnimation() {
    const tl = gsap.timeline();
    
    tl.fromTo("#about .text-reveal", 
        { y: -120, opacity: 0, rotate: -2 }, // Drops from the top down
        { y: 0, opacity: 1, rotate: 0, duration: 1.5, ease: "power4.out" }
    )
    .to("#about .image-reveal", {
        opacity: 1,
        scale: 1,
        duration: 1.5,
        ease: "power4.out"
    }, "-=1.2")
    .to("#about .quote-reveal", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out"
    }, "-=1")
    .to("#about .body-reveal", {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.1,
        ease: "power3.out"
    }, "-=0.8");
}

// Scroll Animations for panels
document.addEventListener("DOMContentLoaded", () => {
    
    // Animate all panels except the first one (handled by preloader entrance)
    const panels = gsap.utils.toArray('.panel:not(#about)');
    
    panels.forEach(panel => {
        
        // Text reveal (Headings)
        const textReveal = panel.querySelectorAll('.text-reveal');
        if(textReveal.length) {
            gsap.fromTo(textReveal, 
                { y: 100, opacity: 0, rotate: 2 },
                {
                    scrollTrigger: {
                        trigger: panel,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    },
                    y: 0,
                    opacity: 1,
                    rotate: 0,
                    duration: 1.4,
                    ease: "power4.out"
                }
            );
        }
        
        // Image & Card reveal
        const imageReveal = panel.querySelectorAll('.image-reveal');
        if(imageReveal.length) {
            gsap.fromTo(imageReveal,
                { opacity: 0, scale: 0.9, y: 50 },
                {
                    scrollTrigger: {
                        trigger: panel,
                        start: "top 75%",
                        toggleActions: "play none none reverse"
                    },
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 1.4,
                    ease: "power3.out"
                }
            );
        }

        // Body content reveal (staggered)
        const bodyReveal = panel.querySelectorAll('.body-reveal, .media-card');
        if(bodyReveal.length) {
            gsap.fromTo(bodyReveal,
                { opacity: 0, y: 40 },
                {
                    scrollTrigger: {
                        trigger: panel,
                        start: "top 70%",
                        toggleActions: "play none none reverse"
                    },
                    opacity: 1,
                    y: 0,
                    stagger: 0.15,
                    duration: 1.2,
                    ease: "power3.out"
                }
            );
        }
    });

    // Custom Interactive Hover Effect for the Main Quote
    const quotes = document.querySelectorAll('.quote-text');
    quotes.forEach(quote => {
        quote.addEventListener('mouseenter', () => {
            gsap.to(quote, { 
                scale: 1.01, 
                x: 15,
                color: "#ffffff",
                duration: 0.5, 
                ease: "power2.out" 
            });
        });
        quote.addEventListener('mouseleave', () => {
            gsap.to(quote, { 
                scale: 1, 
                x: 0,
                color: "#9ca3af",
                duration: 0.5, 
                ease: "power2.out" 
            });
        });
    });

    // Magnetic "Kinetic" Hover effect for paragraphs and headings
    const kineticElements = document.querySelectorAll('#reflection1 p, #reflection2 p, .interactive-heading');
    kineticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            // Calculate mouse position relative to the center of the element
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(el, {
                x: x * 0.05,
                y: y * 0.05,
                rotation: x * 0.01,
                color: "#ffffff",
                duration: 0.6,
                ease: "power3.out"
            });
        });
        
        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                rotation: 0,
                color: "", // Resets to original CSS color
                duration: 1,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // --- Carousel Modal Logic ---
    const modalData = {
        games: [
            { title: "Hearts of Iron IV", img: "https://images.igdb.com/igdb/image/upload/t_1080p/co1vce.jpg" },
            { title: "Chess", img: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=1920" },
            { title: "Call of Duty Warzone", img: "https://images.igdb.com/igdb/image/upload/t_1080p/co2ojs.jpg" },
            { title: "Elden Ring", img: "https://images.igdb.com/igdb/image/upload/t_1080p/co4jni.jpg" },
            { title: "Age of Empires IV", img: "https://images.igdb.com/igdb/image/upload/t_1080p/co3tzh.jpg" }
        ],
        novels: [
            { title: "Reverend Insanity", img: "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=1920" },
            { title: "Lord of the Mysteries", img: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&q=80&w=1920" },
            { title: "That Time I Got Reincarnated as a Slime", img: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=1920" }
        ]
    };

    let currentArray = [];
    let currentIndex = 0;

    const modal = document.getElementById('carousel-modal');
    const modalCard = document.getElementById('modal-card');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const carouselImage = document.getElementById('carousel-image');
    const carouselTitle = document.getElementById('carousel-title');
    const btnNext = document.getElementById('carousel-next');
    const btnPrev = document.getElementById('carousel-prev');
    const btnClose = document.getElementById('modal-close');
    const triggers = document.querySelectorAll('.modal-trigger');

    function openModal(type) {
        currentArray = modalData[type];
        currentIndex = 0;
        updateCarouselContent(0, false);

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        lenis.stop(); // Stop scroll when modal open

        // Improved entrance animation
        gsap.to(modal, { opacity: 1, duration: 0.4, ease: "power2.out" });
        gsap.fromTo(modalCard, 
            { scale: 0.8, y: 50, rotationX: 15, opacity: 0, transformPerspective: 1000 },
            { scale: 1, y: 0, rotationX: 0, opacity: 1, duration: 0.6, ease: "back.out(1.2)", delay: 0.1 }
        );
    }

    function closeModal() {
        gsap.to(modalCard, { scale: 0.9, y: 30, opacity: 0, duration: 0.3, ease: "power2.in" });
        gsap.to(modal, { opacity: 0, duration: 0.3, ease: "power2.in", delay: 0.1, onComplete: () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            lenis.start();
        }});
    }

    function updateCarouselContent(direction = 1, animate = true) {
        const item = currentArray[currentIndex];
        
        if (animate) {
            // Animate out
            const outX = direction === 1 ? -100 : 100;
            const inX = direction === 1 ? 100 : -100;
            
            gsap.to(carouselImage, { opacity: 0, x: outX, duration: 0.3, ease: "power2.in", onComplete: () => {
                carouselImage.src = item.img;
                carouselTitle.innerText = item.title;
                
                // Animate in
                gsap.fromTo(carouselImage, 
                    { x: inX, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
                );
            }});
        } else {
            carouselImage.src = item.img;
            carouselTitle.innerText = item.title;
            gsap.set(carouselImage, { x: 0 });
            gsap.to(carouselImage, { opacity: 1, duration: 0.6, delay: 0.2, ease: "power2.out" });
        }
    }

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const type = e.target.getAttribute('data-type');
            if(type) openModal(type);
        });
    });

    btnClose.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    btnNext.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % currentArray.length;
        updateCarouselContent(1);
    });

    btnPrev.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + currentArray.length) % currentArray.length;
        updateCarouselContent(-1);
    });

});
