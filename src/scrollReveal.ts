// Scroll reveal functionality
export const initScrollReveal = () => {
  // Create intersection observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add reveal class when element is in view
        entry.target.classList.add('revealed');
        
        // Stop observing this element after it's revealed
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1, // Trigger when 10% of the element is visible
    rootMargin: '0px 0px -50px 0px' // Start revealing a bit before element enters view
  });

  // Select all elements that should be revealed on scroll
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  // Observe each element
  revealElements.forEach(element => {
    observer.observe(element);
  });
};