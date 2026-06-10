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
const skyBg = document.getElementById('sky-bg'); // Might be null now, that's fine
const preloader = document.getElementById('portal-preloader');
const shaderContainer = document.getElementById('shader-container');

// --- Three.js GLSL Shader Logic (Radial Warp) ---
let shaderApp = null;
if (shaderContainer && window.THREE) {
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = "Anonymous";
    
    shaderApp = {
        scene: new THREE.Scene(),
        camera: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
        renderer: new THREE.WebGLRenderer({ alpha: true, antialias: true }),
        uniforms: {
            u_time: { value: 0.0 },
            u_resolution: { value: new THREE.Vector2() },
            u_tex: { value: null },
            u_warpAmount: { value: 1.0 } // 1.0 means active warp, animated up on click
        },
        init: function() {
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(shaderContainer.clientWidth, shaderContainer.clientHeight);
            shaderContainer.appendChild(this.renderer.domElement);

            this.uniforms.u_resolution.value.set(
                shaderContainer.clientWidth * window.devicePixelRatio, 
                shaderContainer.clientHeight * window.devicePixelRatio
            );

            // Load the sky background texture
            textureLoader.load("https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?q=80&w=2000&auto=format&fit=crop", (tex) => {
                this.uniforms.u_tex.value = tex;
            });

            const geometry = new THREE.PlaneGeometry(2, 2);
            const material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                transparent: true,
                vertexShader: `
                    void main() {
                        gl_Position = vec4(position, 1.0);
                    }
                `,
                fragmentShader: `
                    uniform float u_time;
                    uniform vec2 u_resolution;
                    uniform sampler2D u_tex;
                    uniform float u_warpAmount;

                    void main() {
                        // Normalize coordinates and fix aspect ratio
                        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                        vec2 center = vec2(0.5, 0.5);
                        vec2 p = uv - center;
                        p.x *= u_resolution.x / u_resolution.y;
                        
                        float dist = length(p);
                        
                        // 1. THE RADIAL STREAK (No swirl)
                        // Pulls the image aggressively toward the center to create the warped sky
                        float lensPull = 0.15 * u_warpAmount / (dist + 0.1); 
                        vec2 dir = normalize(p);
                        vec2 warpedUV = center + dir * (dist - lensPull) * (u_resolution.y / u_resolution.x);
                        // Quick fallback for Y axis aspect ratio normalization on warped UV
                        warpedUV.y = center.y + dir.y * (dist - lensPull);
                        warpedUV.x = center.x + dir.x * (dist - lensPull) * (u_resolution.y / u_resolution.x);

                        vec4 texColor = texture2D(u_tex, warpedUV);
                        
                        // 2. THE BLACK HOLE
                        // Increase this radius (0.22) if the hole is too small for your text
                        float holeRadius = 0.22; 
                        
                        // 3. THE "PLASTIC" GLASSY RIM
                        // Creates the thick, bright refracted edge around the black hole
                        float rimEdge = smoothstep(holeRadius, holeRadius + 0.08, dist);
                        float rimGlow = (1.0 - rimEdge) * 1.5; 
                        vec4 rimColor = vec4(0.8, 0.9, 1.0, 1.0) * rimGlow; 
                        
                        // Sharp cutoff for the void
                        float eventHorizon = smoothstep(holeRadius - 0.005, holeRadius + 0.005, dist);
                        
                        // Mix the void, the rim, and the warped sky
                        vec4 finalColor = mix(vec4(0.0, 0.0, 0.0, 1.0), texColor + rimColor, eventHorizon);
                        
                        gl_FragColor = vec4(finalColor.rgb, 1.0);
                    }
                `
            });

            this.mesh = new THREE.Mesh(geometry, material);
            this.scene.add(this.mesh);

            window.addEventListener('resize', this.onResize.bind(this));
            this.animate();
        },
        onResize: function() {
            if (!shaderContainer) return;
            this.renderer.setSize(shaderContainer.clientWidth, shaderContainer.clientHeight);
            this.uniforms.u_resolution.value.set(
                shaderContainer.clientWidth * window.devicePixelRatio, 
                shaderContainer.clientHeight * window.devicePixelRatio
            );
        },
        animate: function() {
            requestAnimationFrame(this.animate.bind(this));
            this.uniforms.u_time.value += 0.02;
            this.renderer.render(this.scene, this.camera);
        }
    };
    
    // Slight delay to ensure layout is ready
    setTimeout(() => shaderApp.init(), 100);
}

window.addEventListener("load", () => {
    // Disable scrolling during preloader
    lenis.stop();

    if(portalRing) {
        portalRing.addEventListener('click', () => {
            // Intensify the radial warp effect on click
            if(shaderApp && shaderApp.uniforms) {
                gsap.to(shaderApp.uniforms.u_warpAmount, {
                    value: 4.0, // Aggressive pull
                    duration: 1.5,
                    ease: "power2.in"
                });
            }
            
            // Fade out only the surrounding text
            gsap.to('.portal-text', {
                opacity: 0,
                duration: 1.0,
                ease: "power2.inOut"
            });

            // Zoom the black hole TOWARDS the user by scaling up the entire shader canvas
            gsap.to('#shader-container', {
                scale: 15,
                opacity: 0,
                duration: 2.0,
                ease: "power2.in",
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
            { title: "Hearts of Iron IV", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcsPoe1LSmx-r3coFqAKSJI8SMo_hG6hEYUTLsf1Rjt7_NaMljCRzSUsuupB3MjmFeP3_avg&s=10" },
            { title: "Chess", img: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&q=80&w=1920" },
            { title: "Call of Duty Warzone", img: "https://i.ytimg.com/vi/hcClQ5wYUjU/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAxvSgVTRLPbu2IcZrGI7PE7Z2SQw" },
            { title: "Elden Ring", img: "https://m.media-amazon.com/images/M/MV5BZGQxMjYyOTUtNjYyMC00NzdmLWI4YmYtMDhiODU3Njc5ZDJkXkEyXkFqcGc@._V1_QL75_UX190_CR0,2,190,281_.jpg" },
            { title: "Age of Empires IV", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsbDV7CfSkDk9ioIxBsKOQNLqLAjvJTh94NLgGmcdkhisKsGoPcFMbqzu3HM754xQ5skdC&s=10" }
        ],
        novels: [
            { title: "Reverend Insanity", img: "reverend_insanity.jpg" },
            { title: "Lord of the Mysteries", img: "https://static0.srcdn.com/wordpress/wp-content/uploads/2025/06/lord-of-mysteries-poster.jpg?w=1200&h=675&fit=crop" },
            { title: "That Time I Got Reincarnated as a Slime", img: "slime.png" }
        ],
        cooking: [
            { title: "Chilli Chicken", img: "assets/chilli_chicken.jpg" },
            { title: "Mango Mousse Chocolate Cake", img: "assets/mango_mousse.jpg" },
            { title: "Pizza", img: "assets/pizza.jpg" },
            { title: "Caramel Chocolate Vanilla Cheesecake", img: "assets/caramel_cheesecake.jpg" }
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
        gsap.to(modal, { opacity: 1, duration: 0.5, ease: "power2.inOut" });
        gsap.fromTo(modalCard, 
            { scale: 0.85, y: 30, rotationX: 10, opacity: 0, transformPerspective: 1200 },
            { scale: 1, y: 0, rotationX: 0, opacity: 1, duration: 0.8, ease: "expo.out", delay: 0.1 }
        );
    }

    function closeModal() {
        gsap.to(modalCard, { scale: 0.95, y: -20, opacity: 0, duration: 0.4, ease: "expo.in" });
        gsap.to(modal, { opacity: 0, duration: 0.4, ease: "power2.inOut", delay: 0.1, onComplete: () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            lenis.start();
        }});
    }

    function updateCarouselContent(direction = 1, animate = true) {
        const item = currentArray[currentIndex];
        
        if (animate) {
            // Animate out
            const outX = direction === 1 ? -150 : 150;
            const inX = direction === 1 ? 150 : -150;
            
            gsap.to(carouselImage, { opacity: 0, x: outX, duration: 0.4, ease: "expo.in", onComplete: () => {
                carouselImage.src = item.img;
                carouselTitle.innerText = item.title;
                
                // Animate in
                gsap.fromTo(carouselImage, 
                    { x: inX, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.6, ease: "expo.out" }
                );
            }});
        } else {
            carouselImage.src = item.img;
            carouselTitle.innerText = item.title;
            gsap.set(carouselImage, { x: 0 });
            gsap.to(carouselImage, { opacity: 1, duration: 0.8, delay: 0.2, ease: "expo.out" });
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
