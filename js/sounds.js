const Sounds = {
    muted: false,
    audioContext: null,
    sounds: {},

    // Initialize sound system
    init() {
        // Check if muted preference is stored
        const mutedPref = localStorage.getItem('mathTrainerMuted');
        if (mutedPref === 'true') {
            this.muted = true;
            this.updateMuteButton();
        }

        // Initialize Web Audio API (graceful degradation)
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Web Audio API not supported');
        }

        this.setupMuteButton();
    },

    // Setup mute toggle button
    setupMuteButton() {
        const muteBtn = document.getElementById('mute-toggle-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                this.toggleMute();
            });
        }
    },

    // Toggle mute state
    toggleMute() {
        this.muted = !this.muted;
        localStorage.setItem('mathTrainerMuted', this.muted.toString());
        this.updateMuteButton();
    },

    // Update mute button appearance
    updateMuteButton() {
        const muteBtn = document.getElementById('mute-toggle-btn');
        if (muteBtn) {
            muteBtn.innerHTML = this.muted 
                ? '<i class="fas fa-volume-mute"></i>' 
                : '<i class="fas fa-volume-up"></i>';
            muteBtn.classList.toggle('muted', this.muted);
        }
    },

    // Play sound using Web Audio API
    playTone(frequency, duration, type = 'sine') {
        if (this.muted || !this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;

            // Envelope for smooth sound
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.log('Sound playback failed:', e);
        }
    },

    // Button tap sound
    playButtonSound() {
        if (this.muted) return;
        this.playTone(400, 0.1, 'sine');
    },

    // Correct answer sound (chime)
    playCorrectSound() {
        if (this.muted) return;
        // Play a pleasant chime (two tones)
        this.playTone(523, 0.2, 'sine'); // C5
        setTimeout(() => {
            this.playTone(659, 0.2, 'sine'); // E5
        }, 100);
    },

    // Wrong answer sound (neutral boop)
    playWrongSound() {
        if (this.muted) return;
        // Gentle, neutral tone
        this.playTone(300, 0.15, 'sine');
    },

    // Milestone celebration sound
    playCelebrationSound() {
        if (this.muted) return;
        // Play a cheerful sequence
        const notes = [523, 659, 784]; // C5, E5, G5
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, 0.2, 'sine');
            }, index * 100);
        });
    }
};
