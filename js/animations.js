const Animations = {
    // Create particle effect for celebrations
    createParticleEffect(particleCount = 50, intensity = 'normal') {
        const overlay = document.getElementById('celebration-overlay');
        if (!overlay) return;

        // Clear any existing particles
        overlay.innerHTML = '';

        const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#95E1D3'];
        const size = intensity === 'major' ? 15 : 10;
        const duration = intensity === 'major' ? 3000 : 2000;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random position along window edges
            const side = Math.floor(Math.random() * 4);
            let left, top;
            
            if (side === 0) { // Top
                left = Math.random() * 100;
                top = 0;
            } else if (side === 1) { // Right
                left = 100;
                top = Math.random() * 100;
            } else if (side === 2) { // Bottom
                left = Math.random() * 100;
                top = 100;
            } else { // Left
                left = 0;
                top = Math.random() * 100;
            }
            
            particle.style.left = left + '%';
            particle.style.top = top + '%';
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.animationDuration = (duration + Math.random() * 1000) + 'ms';
            
            // Random direction
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 100;
            const endX = Math.cos(angle) * distance;
            const endY = Math.sin(angle) * distance;
            
            particle.style.setProperty('--end-x', endX + 'px');
            particle.style.setProperty('--end-y', endY + 'px');
            
            overlay.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, duration + 1000);
        }
    },

    // Celebrate milestone
    celebrateMilestone(type, count) {
        let particleCount, intensity;
        
        if (count === 5) {
            // Minor milestone
            particleCount = 30;
            intensity = 'normal';
        } else if (count === 25) {
            // Major milestone
            particleCount = 80;
            intensity = 'major';
        } else if (count === 100) {
            // Completion milestone
            particleCount = 100;
            intensity = 'major';
        } else {
            particleCount = 30;
            intensity = 'normal';
        }

        this.createParticleEffect(particleCount, intensity);
    },

    // Animate star rating reveal
    animateStarRating(stars) {
        const starElements = document.querySelectorAll('#star-rating .star');
        
        starElements.forEach((star, index) => {
            setTimeout(() => {
                if (index < stars) {
                    star.classList.add('earned');
                }
            }, index * 300);
        });
    },

    // Show immediate feedback for answer
    showAnswerFeedback(correct, isVariableReward = false) {
        const questionCard = document.getElementById('question-card');
        const feedbackMessage = document.getElementById('feedback-message');
        
        if (!questionCard || !feedbackMessage) return;

        // Identity reinforcement messages
        const correctMessages = [
            "Great job!",
            "Nice thinking!",
            "Awesome!",
            "You're a math explorer!",
            "Excellent!",
            "You're getting really good at this!"
        ];
        
        const wrongMessages = [
            "Nice try!",
            "You're getting closer!",
            "Try again!",
            "Keep going!",
            "You're learning!"
        ];

        if (correct) {
            // Visual reward: sparkles/confetti
            this.createSparkles(questionCard);
            
            // Positive text message
            const message = isVariableReward 
                ? '<i class="fas fa-star"></i> Amazing! <i class="fas fa-star"></i>' 
                : correctMessages[Math.floor(Math.random() * correctMessages.length)];
            
            feedbackMessage.innerHTML = message;
            feedbackMessage.className = 'feedback-message correct show';
            
            // Mascot reaction (handled separately via Mascot.reactToAnswer)
            
            // Hide message after 1.5 seconds
            setTimeout(() => {
                feedbackMessage.classList.remove('show');
            }, 1500);
        } else {
            // Gentle wiggle on question card
            questionCard.classList.add('wiggle');
            
            // Encouraging message
            const message = wrongMessages[Math.floor(Math.random() * wrongMessages.length)];
            feedbackMessage.textContent = message;
            feedbackMessage.className = 'feedback-message wrong show';
            
            // Remove wiggle after animation
            setTimeout(() => {
                questionCard.classList.remove('wiggle');
            }, 300);
            
            // Hide message after 1.5 seconds
            setTimeout(() => {
                feedbackMessage.classList.remove('show');
            }, 1500);
        }
    },

    // Create sparkles around element
    createSparkles(element) {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const sparkleCount = 12;
        
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            
            const angle = (Math.PI * 2 * i) / sparkleCount;
            const distance = 40 + Math.random() * 30;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            sparkle.style.left = centerX + 'px';
            sparkle.style.top = centerY + 'px';
            sparkle.style.setProperty('--sparkle-x', x + 'px');
            sparkle.style.setProperty('--sparkle-y', y + 'px');
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                if (sparkle.parentNode) {
                    sparkle.parentNode.removeChild(sparkle);
                }
            }, 1000);
        }
    }
};
