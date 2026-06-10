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

// Preloader Animation
window.addEventListener("load", () => {
    // Disable scrolling during preloader
    lenis.stop();

    const tl = gsap.timeline({
        onComplete: () => {
            lenis.start();
        }
    });

    // Reveal preloader text
    tl.to(".preloader-text", {
        y: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out"
    })
    // Hide preloader text
    .to(".preloader-text", {
        y: "-100%",
        duration: 0.8,
        stagger: 0.1,
        ease: "power4.in",
        delay: 0.6
    })
    // Slide preloader up
    .to(".preloader", {
        y: "-100%",
        duration: 1.2,
        ease: "power4.inOut"
    }, "-=0.4")
    // Trigger entrance animations for first section
    .call(initEntranceAnimation, null, "-=0.6");
});

// Entrance Animation for Section 1 (About Me)
function initEntranceAnimation() {
    const tl = gsap.timeline();
    
    tl.fromTo("#about .text-reveal", 
        { y: 120, opacity: 0, rotate: 2 },
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
});
