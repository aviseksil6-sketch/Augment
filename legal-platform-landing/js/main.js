// Initialize GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    initHeroAnimations();
    initMagneticButtons();
    initScrollAnimations();
    initNetworkCanvas();
    initCounterAnimations();
});

function initHeroAnimations() {
    const tl = gsap.timeline();

    tl.fromTo(".fade-up", 
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0.2 }
    );

    // Mouse Parallax for Hero Cards
    const heroVisual = document.querySelector('.hero-visual');
    const card1 = document.querySelector('.card-1');
    const card2 = document.querySelector('.card-2');
    const mainImg = document.querySelector('.hero-img');

    if (heroVisual) {
        heroVisual.addEventListener('mousemove', (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(mainImg, { rotationY: x * 5, rotationX: -y * 5, ease: "power2.out", duration: 0.5 });
            gsap.to(card1, { x: x * 30, y: y * 30, ease: "power2.out", duration: 0.5 });
            gsap.to(card2, { x: -x * 40, y: -y * 40, ease: "power2.out", duration: 0.5 });
        });

        heroVisual.addEventListener('mouseleave', () => {
            gsap.to([mainImg, card1, card2], { rotationY: 0, rotationX: 0, x: 0, y: 0, ease: "power3.out", duration: 1 });
        });
    }
}

function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnetic');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        btn.addEventListener('mouseleave', function() {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });
}

function initScrollAnimations() {
    // Feature Rows Stagger Reveal
    const featureRows = document.querySelectorAll('.feature-row');
    
    featureRows.forEach((row, i) => {
        const text = row.querySelector('.feature-text');
        const visual = row.querySelector('.feature-visual');
        const isReverse = row.classList.contains('reverse');

        gsap.fromTo(text, 
            { opacity: 0, x: isReverse ? 50 : -50 },
            { 
                opacity: 1, 
                x: 0, 
                duration: 1, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: row,
                    start: "top 80%",
                }
            }
        );

        gsap.fromTo(visual, 
            { opacity: 0, scale: 0.95 },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 1.2, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: row,
                    start: "top 80%",
                }
            }
        );

        // Subtle Parallax on images
        const img = visual.querySelector('img');
        if(img) {
            gsap.to(img, {
                yPercent: 15,
                ease: "none",
                scrollTrigger: {
                    trigger: row,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        }
    });

    // Differentiator Cards
    gsap.fromTo(".diff-card", 
        { y: 50, opacity: 0 },
        { 
            y: 0, 
            opacity: 1, 
            duration: 0.8, 
            stagger: 0.2, 
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".differentiator",
                start: "top 75%"
            }
        }
    );
}

function initNetworkCanvas() {
    const canvas = document.getElementById('networkCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let nodes = [];
    const connectionDistance = 150;

    function resize() {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }
    }

    for (let i = 0; i < 80; i++) {
        nodes.push(new Node());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        nodes.forEach(node => {
            node.update();
            node.draw();
        });

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    const alpha = 1 - (distance / connectionDistance);
                    ctx.strokeStyle = `rgba(124, 58, 237, ${alpha * 0.4})`; // Violet connection lines
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    // Only animate when in view
    ScrollTrigger.create({
        trigger: ".storytelling",
        start: "top bottom",
        end: "bottom top",
        onEnter: () => animate(),
        // We could pause requestAnimationFrame onLeave for performance, but skipping for simplicity
    });
}

function initCounterAnimations() {
    const numbers = document.querySelectorAll('.metric-number');
    
    numbers.forEach(num => {
        const target = parseFloat(num.getAttribute('data-target'));
        const isFloat = target % 1 !== 0;

        ScrollTrigger.create({
            trigger: ".metrics",
            start: "top 80%",
            once: true,
            onEnter: () => {
                gsap.to(num, {
                    innerHTML: target,
                    duration: 2.5,
                    ease: "power3.out",
                    snap: { innerHTML: isFloat ? 0.1 : 1 },
                    onUpdate: function() {
                        if(isFloat) {
                            num.innerHTML = parseFloat(this.targets()[0].innerHTML).toFixed(1);
                        }
                    }
                });
            }
        });
    });
}
