const Mascot = {
    container: null,
    currentState: 'idle',
    blinkTimer: null,
    blinkInterval: null,

    // Initialize mascot
    init() {
        this.container = document.getElementById('mascot-container');
        if (!this.container) return;

        this.renderMascot();
        this.startIdleAnimation();
        this.startBlinkTimer();
    },

    // Render SVG mascot
    renderMascot() {
        if (!this.container) return;

        this.container.innerHTML = `
            <svg class="mascot-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <!-- Body (circle) -->
                <circle cx="50" cy="60" r="35" fill="#FFD93D" stroke="#FFA500" stroke-width="2"/>
                
                <!-- Head (larger circle) -->
                <circle cx="50" cy="30" r="25" fill="#FFD93D" stroke="#FFA500" stroke-width="2"/>
                
                <!-- Left Eye -->
                <circle class="mascot-eye" id="mascot-eye-left" cx="42" cy="28" r="4" fill="#333"/>
                <circle cx="42" cy="28" r="1.5" fill="white"/>
                
                <!-- Right Eye -->
                <circle class="mascot-eye" id="mascot-eye-right" cx="58" cy="28" r="4" fill="#333"/>
                <circle cx="58" cy="28" r="1.5" fill="white"/>
                
                <!-- Mouth (changes based on state) -->
                <path class="mascot-mouth" id="mascot-mouth" d="M 40 38 Q 50 42 60 38" 
                      stroke="#333" stroke-width="2" fill="none" stroke-linecap="round"/>
            </svg>
        `;
    },

    // Start idle animation
    startIdleAnimation() {
        if (!this.container) return;
        this.container.classList.remove('mascot-correct', 'mascot-wrong', 'mascot-encouraging', 'mascot-celebrating');
        this.container.classList.add('mascot-idle');
        this.currentState = 'idle';
        this.updateMouth('smile');
    },

    // Start blink timer (blink every 4-6 seconds)
    startBlinkTimer() {
        if (this.blinkInterval) clearInterval(this.blinkInterval);
        
        const blink = () => {
            const leftEye = document.getElementById('mascot-eye-left');
            const rightEye = document.getElementById('mascot-eye-right');
            
            if (leftEye && rightEye && this.currentState === 'idle') {
                leftEye.style.transform = 'scaleY(0.1)';
                rightEye.style.transform = 'scaleY(0.1)';
                
                setTimeout(() => {
                    leftEye.style.transform = 'scaleY(1)';
                    rightEye.style.transform = 'scaleY(1)';
                }, 150);
            }
        };

        // Blink every 4-6 seconds (randomized)
        const scheduleBlink = () => {
            const delay = 4000 + Math.random() * 2000; // 4-6 seconds
            this.blinkTimer = setTimeout(() => {
                blink();
                scheduleBlink();
            }, delay);
        };

        scheduleBlink();
    },

    // React to answer
    reactToAnswer(correct, isVariableReward = false) {
        if (!this.container) return;

        // Clear any existing state classes
        this.container.classList.remove('mascot-idle', 'mascot-correct', 'mascot-wrong', 
                                       'mascot-encouraging', 'mascot-celebrating');

        if (correct) {
            if (isVariableReward) {
                // Bigger celebration (~20-30% of correct answers)
                this.container.classList.add('mascot-celebrating');
                this.updateMouth('big-smile');
            } else {
                // Regular correct reaction
                this.container.classList.add('mascot-correct');
                this.updateMouth('smile');
            }
            
            // Return to idle after animation
            setTimeout(() => {
                this.startIdleAnimation();
            }, 800);
        } else {
            // Wrong answer - surprised, not sad
            this.container.classList.add('mascot-wrong');
            this.updateMouth('surprised');
            
            // After surprised, show encouraging
            setTimeout(() => {
                this.container.classList.remove('mascot-wrong');
                this.container.classList.add('mascot-encouraging');
                this.updateMouth('encouraging');
            }, 400);
            
            // Return to idle
            setTimeout(() => {
                this.startIdleAnimation();
            }, 1000);
        }
    },

    // Update mouth expression
    updateMouth(expression) {
        const mouth = document.getElementById('mascot-mouth');
        if (!mouth) return;

        switch(expression) {
            case 'smile':
                mouth.setAttribute('d', 'M 40 38 Q 50 42 60 38');
                break;
            case 'big-smile':
                mouth.setAttribute('d', 'M 38 40 Q 50 46 62 40');
                break;
            case 'surprised':
                // Circle for surprised (O shape)
                mouth.setAttribute('d', 'M 50 36 A 3 3 0 1 1 50 40 A 3 3 0 1 1 50 36');
                break;
            case 'encouraging':
                mouth.setAttribute('d', 'M 40 40 Q 50 44 60 40');
                break;
            default:
                mouth.setAttribute('d', 'M 40 38 Q 50 42 60 38');
        }
    }
};
