// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Navigation initialized');
    // Get all navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    // Ensure navigation is visible by adding active class to first link if none is active
    if (!document.querySelector('.nav-link.active')) {
        navLinks[0]?.classList.add('active');
    }
    
    // Function to handle page transitions
    const handlePageTransition = (e) => {
        e.preventDefault();
        
        const targetPage = e.currentTarget.getAttribute('data-page');
        const targetSection = document.getElementById(targetPage);
        
        if (!targetSection) return;
        
        // Get current active section
        const currentActive = document.querySelector('.content-section.active');
        
        // Don't do anything if clicking the current active section
        if (currentActive === targetSection) return;
        
        // Remove active class from all nav links
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Add active class to clicked link
        e.currentTarget.classList.add('active');
        
        // Add exit animation to current section
        if (currentActive) {
            currentActive.classList.add('fade-out');
            currentActive.addEventListener('animationend', function handler() {
                currentActive.classList.remove('active', 'fade-out');
                currentActive.removeEventListener('animationend', handler);
                
                // After current section exits, bring in new section
                targetSection.classList.add('active', 'fade-in');
                targetSection.addEventListener('animationend', function handler() {
                    targetSection.classList.remove('fade-in');
                    targetSection.removeEventListener('animationend', handler);
                }, { once: true });
            }, { once: true });
        } else {
            // If no current active section, just fade in the target
            targetSection.classList.add('active', 'fade-in');
            targetSection.addEventListener('animationend', () => {
                targetSection.classList.remove('fade-in');
            }, { once: true });
        }
    };
    
    // Add click event listeners to all nav links
    navLinks.forEach(link => {
        link.addEventListener('click', handlePageTransition);
    });
});
