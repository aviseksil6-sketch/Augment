// Parallax Scrolling Effect
const parallaxElements = document.querySelectorAll('[data-parallax]');

function handleParallax() {
  parallaxElements.forEach(element => {
    const parallaxValue = parseFloat(element.getAttribute('data-parallax'));
    const elementRect = element.getBoundingClientRect();
    const elementTop = elementRect.top;
    const windowHeight = window.innerHeight;
    
    // Calculate the offset based on scroll position
    const offset = (windowHeight - elementTop) * parallaxValue;
    
    // Apply transform only if element is in viewport
    if (elementTop < windowHeight && elementTop + elementRect.height > 0) {
      element.style.transform = `translateY(${offset * 0.5}px)`;
    }
  });
}

// Smooth scroll event listener
window.addEventListener('scroll', () => {
  handleParallax();
});

// Initial call
handleParallax();

// Intersection Observer for fade-in animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all cards and feature items
const elementsToObserve = document.querySelectorAll('.revolution-card, .feature-item, .stat-card');
elementsToObserve.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'all 0.6s ease-out';
  observer.observe(el);
});

// Smooth scroll for navigation links
const navLinks = document.querySelectorAll('.nav-menu a');
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// CTA button click animation
const ctaButtons = document.querySelectorAll('.cta-button, .primary-btn, .secondary-btn');
ctaButtons.forEach(button => {
  button.addEventListener('click', () => {
    button.style.transform = 'scale(0.98)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
    }, 100);
  });
});

// Dynamic scroll indicator visibility
const scrollIndicator = document.querySelector('.scroll-indicator');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    scrollIndicator.style.opacity = '0';
    scrollIndicator.style.pointerEvents = 'none';
  } else {
    scrollIndicator.style.opacity = '1';
    scrollIndicator.style.pointerEvents = 'auto';
  }
});

// Add transition for scroll indicator
scrollIndicator.style.transition = 'opacity 0.3s ease';

// Performance optimization: Throttle parallax on scroll
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      handleParallax();
      ticking = false;
    });
    ticking = true;
  }
});

// Add mouse over animation for cards
const cards = document.querySelectorAll('.revolution-card');
cards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.background = 'linear-gradient(135deg, rgba(0, 217, 255, 0.15), rgba(255, 0, 110, 0.1))';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.background = 'linear-gradient(135deg, rgba(26, 31, 58, 0.8), rgba(26, 31, 58, 0.4))';
  });
});

console.log('✨ Augment - The Future of Legal Tech is loaded!');
