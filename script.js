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

    // --- Personal Guess My Number game setup ---
    let personalTarget = null;
    const guessInput = document.getElementById('guessInput');
    const guessButton = document.getElementById('guessButton');
    const guessMessage = document.getElementById('guessMessage');

    function resetPersonalGame() {
        personalTarget = Math.floor(Math.random() * 20) + 1;
        if (guessInput) guessInput.value = '';
        if (guessMessage) guessMessage.textContent = 'Good luck!';
        console.log('Personal game target set to', personalTarget);
    }

    if (guessButton) {
        guessButton.addEventListener('click', () => {
            const raw = guessInput?.value;
            const val = Number(raw);
            if (!val || val < 1 || val > 20) {
                guessMessage.textContent = 'Please enter a number between 1 and 20.';
                return;
            }

            if (val === personalTarget) {
                guessMessage.textContent = `Correct — the number was ${personalTarget}! Nice job.`;
                setTimeout(resetPersonalGame, 1500);
            } else if (val < personalTarget) {
                guessMessage.textContent = 'Too low — try a higher number.';
            } else {
                guessMessage.textContent = 'Too high — try a lower number.';
            }
        });
    }

    // Initialize the personal game once DOM elements exist
    resetPersonalGame();
});
