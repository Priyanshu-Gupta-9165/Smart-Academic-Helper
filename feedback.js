document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const feedbackForm = document.querySelector('.feedback-form');
    const feedbackText = document.getElementById('feedback-text');
    const submitFeedbackBtn = document.getElementById('submit-feedback');
    const modal = document.getElementById('feedback-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const userInfoModal = document.getElementById('user-info-modal');
    const userInfoForm = document.getElementById('user-info-form');
    const userInfoSubmitBtn = document.getElementById('user-info-submit');
    const userInfoCancelBtn = document.getElementById('user-info-cancel');
    
    // Star rating functionality
    const starRating = document.querySelector('.star-rating');
    const stars = starRating.querySelectorAll('i');
    let selectedRating = 0;
    
    // Store feedback text temporarily
    let tempFeedbackText = '';
    
    // Initialize EmailJS
    function initEmailJS() {
        emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your actual EmailJS public key
    }
    
    // Initialize EmailJS when the page loads
    initEmailJS();
    
    // Star rating event listeners
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            selectedRating = rating;
            updateStars();
        });
        
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            highlightStars(rating);
        });
        
        star.addEventListener('mouseout', () => {
            highlightStars(selectedRating);
        });
    });
    
    // Update stars based on selected rating
    function updateStars() {
        stars.forEach(star => {
            const rating = parseInt(star.getAttribute('data-rating'));
            if (rating <= selectedRating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }
    
    // Highlight stars on hover
    function highlightStars(rating) {
        stars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            if (starRating <= rating) {
                star.classList.remove('far');
                star.classList.add('fas');
            } else {
                star.classList.remove('fas');
                star.classList.add('far');
            }
        });
    }
    
    // Submit feedback button click event
    submitFeedbackBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Validate rating and feedback text
        if (selectedRating === 0) {
            alert('Please select a rating');
            return;
        }
        
        if (!feedbackText.value.trim()) {
            alert('Please share your thoughts with us');
            return;
        }
        
        // Store feedback text temporarily
        tempFeedbackText = feedbackText.value.trim();
        
        // Show user info modal
        showUserInfoModal();
    });
    
    // Show user info modal
    function showUserInfoModal() {
        userInfoModal.classList.add('show');
        modalOverlay.classList.add('show');
    }
    
    // Hide user info modal
    function hideUserInfoModal() {
        userInfoModal.classList.remove('show');
        modalOverlay.classList.remove('show');
    }
    
    // Show success modal
    function showSuccessModal() {
        modal.classList.add('show');
        modalOverlay.classList.add('show');
    }
    
    // Hide success modal
    function closeModal() {
        modal.classList.remove('show');
        modalOverlay.classList.remove('show');
    }
    
    // Create confetti effect
    function createConfetti() {
        const colors = ['#6366f1', '#10b981', '#3b82f6', '#ec4899'];
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 3000);
        }
    }
    
    // User info form submit event
    userInfoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const name = document.getElementById('user-name').value.trim();
        const email = document.getElementById('user-email').value.trim();
        
        // Validate form data
        if (!name) {
            alert('Please enter your name');
            return;
        }
        
        if (!email) {
            alert('Please enter your email');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        // Send feedback via EmailJS
        sendFeedbackEmail(name, email, selectedRating, tempFeedbackText);
    });
    
    // Cancel button click event
    userInfoCancelBtn.addEventListener('click', () => {
        hideUserInfoModal();
    });
    
    // Send feedback email using EmailJS
    function sendFeedbackEmail(name, email, rating, feedback) {
        // Prepare template parameters
        const templateParams = {
            to_email: 'roshanpriyaash@gmail.com',
            from_name: name,
            from_email: email,
            rating: rating,
            feedback: feedback
        };
        
        // Send email using EmailJS
        emailjs.send('default_service', 'template_feedback', templateParams)
            .then(() => {
                // Hide user info modal
                hideUserInfoModal();
                
                // Show success modal with confetti
                showSuccessModal();
                createConfetti();
                
                // Reset form
                selectedRating = 0;
                updateStars();
                feedbackText.value = '';
                userInfoForm.reset();
            })
            .catch((error) => {
                console.error('Error sending feedback:', error);
                alert('Failed to send feedback. Please try again later.');
            });
    }
    
    // Expose closeModal function globally
    window.closeModal = closeModal;
});