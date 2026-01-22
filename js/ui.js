const UI = {
    currentInput: '',
    currentExercise: null,
    autoSubmitTimeout: null,

    // Initialize UI
    init() {
        this.setupEventListeners();
    },

    // Setup event listeners
    setupEventListeners() {
        // Keypad buttons
        document.querySelectorAll('.keypad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const digit = e.target.getAttribute('data-digit');
                const action = e.target.getAttribute('data-action');
                
                if (digit !== null) {
                    this.handleKeypadInput(parseInt(digit));
                } else if (action === 'clear') {
                    this.clearInput();
                }
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key >= '0' && e.key <= '9') {
                this.handleKeypadInput(parseInt(e.key));
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                this.clearInput();
            }
        });

        // Navigation buttons
        const backToGameBtn = document.getElementById('back-to-game-btn');
        if (backToGameBtn) {
            backToGameBtn.addEventListener('click', () => {
                this.switchToGameScreen();
            });
        }

        const newRoundBtn = document.getElementById('new-round-btn');
        if (newRoundBtn) {
            newRoundBtn.addEventListener('click', () => {
                if (window.MathTrainer) {
                    window.MathTrainer.startNewRound();
                }
            });
        }

        const viewStatsBtn = document.getElementById('view-stats-btn');
        if (viewStatsBtn) {
            viewStatsBtn.addEventListener('click', () => {
                this.switchToStatsScreen();
            });
        }

        const viewStatsGameBtn = document.getElementById('view-stats-game-btn');
        if (viewStatsGameBtn) {
            viewStatsGameBtn.addEventListener('click', () => {
                this.switchToStatsScreen();
            });
        }
    },

    // Render exercise
    renderExercise(exercise) {
        // Clear any pending auto-submit timeout
        if (this.autoSubmitTimeout) {
            clearTimeout(this.autoSubmitTimeout);
            this.autoSubmitTimeout = null;
        }
        
        const questionCard = document.getElementById('question-card');
        
        // Exit animation
        if (questionCard && this.currentExercise) {
            questionCard.classList.add('exiting');
            setTimeout(() => {
                questionCard.classList.remove('exiting');
                
                // Update exercise
                this.currentExercise = exercise;
                this.currentInput = '';
                
                document.getElementById('number-a').textContent = exercise.a;
                document.getElementById('operation').textContent = exercise.operation;
                document.getElementById('number-b').textContent = exercise.b;
                this.updateAnswerDisplay();
                
                // Enter animation
                questionCard.classList.add('entering');
                setTimeout(() => {
                    questionCard.classList.remove('entering');
                }, 200);
            }, 150);
        } else {
            // First exercise - no exit animation
            this.currentExercise = exercise;
            this.currentInput = '';
            
            document.getElementById('number-a').textContent = exercise.a;
            document.getElementById('operation').textContent = exercise.operation;
            document.getElementById('number-b').textContent = exercise.b;
            this.updateAnswerDisplay();
            
            if (questionCard) {
                questionCard.classList.add('entering');
                setTimeout(() => {
                    questionCard.classList.remove('entering');
                }, 200);
            }
        }
    },

    // Update answer display
    updateAnswerDisplay() {
        const answerInput = document.getElementById('answer-input');
        if (this.currentInput === '') {
            answerInput.textContent = '_';
        } else {
            answerInput.textContent = this.currentInput;
        }
    },

    // Handle keypad input
    handleKeypadInput(digit) {
        // Play button sound
        if (typeof Sounds !== 'undefined') {
            Sounds.playButtonSound();
        }
        
        if (this.currentInput.length < 3) { // Max 3 digits (answers < 100)
            // Clear any pending auto-submit timeout
            if (this.autoSubmitTimeout) {
                clearTimeout(this.autoSubmitTimeout);
                this.autoSubmitTimeout = null;
            }
            
            this.currentInput += digit.toString();
            this.updateAnswerDisplay();
            
            // Auto-submit when answer is complete (if it's a valid answer)
            const answer = parseInt(this.currentInput);
            if (answer >= 0 && answer < 100) {
                // Check if answer is correct and submit immediately
                if (this.currentExercise && answer === this.currentExercise.answer) {
                    // Correct answer - submit immediately
                    setTimeout(() => {
                        if (window.MathTrainer && this.currentInput === answer.toString()) {
                            window.MathTrainer.submitAnswer(answer);
                        }
                    }, 100); // Small delay to show the input
                } else {
                    // Wrong answer or incomplete - wait for user to stop typing (10 seconds delay)
                    this.autoSubmitTimeout = setTimeout(() => {
                        if (window.MathTrainer && this.currentInput === answer.toString()) {
                            window.MathTrainer.submitAnswer(answer);
                        }
                        this.autoSubmitTimeout = null;
                    }, 10000);
                }
            }
        }
    },

    // Clear input
    clearInput() {
        // Clear any pending auto-submit timeout
        if (this.autoSubmitTimeout) {
            clearTimeout(this.autoSubmitTimeout);
            this.autoSubmitTimeout = null;
        }
        this.currentInput = '';
        this.updateAnswerDisplay();
    },

    // Update progress bar and star system
    updateProgressBar(exerciseCount) {
        const percentage = (exerciseCount / 100) * 100;
        const progressBar = document.getElementById('progress-bar');
        
        if (progressBar) {
            progressBar.style.width = percentage + '%';
        }

        // Update milestone markers
        const milestones = [25, 50, 75, 100];
        milestones.forEach(milestone => {
            const marker = document.querySelector(`[data-milestone="${milestone}"]`);
            if (marker && exerciseCount >= milestone) {
                marker.classList.add('reached');
            }
        });
        
        // Update star progress (10 stars, one per 10 exercises)
        this.updateStarProgress(exerciseCount);
    },
    
    // Update star progress system
    updateStarProgress(exerciseCount) {
        const starProgress = document.getElementById('star-progress');
        if (!starProgress) return;
        
        const totalStars = 10;
        const filledStars = Math.floor(exerciseCount / 10);
        const partialStar = (exerciseCount % 10) / 10;
        
        // Always show at least one star (progress illusion - never show empty)
        const starsToShow = Math.max(1, Math.min(totalStars, filledStars + (partialStar > 0 ? 1 : 0) + 1));
        
        starProgress.innerHTML = '';
        
        for (let i = 0; i < starsToShow; i++) {
            const star = document.createElement('span');
            star.className = 'star';
            star.innerHTML = '<i class="fas fa-star"></i>';
            
            if (i < filledStars) {
                star.classList.add('filled');
            } else if (i === filledStars && partialStar > 0) {
                // Partially filled star (progress illusion)
                star.style.opacity = 0.3 + (partialStar * 0.7);
                star.style.transform = 'scale(0.8)';
            } else {
                // Show empty star for "almost there" effect (progress illusion)
                star.style.opacity = 0.2;
            }
            
            starProgress.appendChild(star);
        }
        
        // Show encouraging message at milestones (every 5 exercises)
        if (exerciseCount > 0 && exerciseCount % 5 === 0) {
            this.showProgressMessage(exerciseCount);
        }
    },
    
    // Show progress encouragement message
    showProgressMessage(exerciseCount) {
        const messages = [
            "Keep going!",
            "You're doing great!",
            "Almost there!",
            "2 more to level up!",
            "You're a math explorer!"
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        const feedbackMessage = document.getElementById('feedback-message');
        
        if (feedbackMessage) {
            feedbackMessage.textContent = message;
            feedbackMessage.className = 'feedback-message correct show';
            setTimeout(() => {
                feedbackMessage.classList.remove('show');
            }, 1500);
        }
    },

    // Show milestone celebration
    showMilestone(milestoneType, count) {
        Animations.celebrateMilestone(milestoneType, count);
    },

    // Switch to game screen
    switchToGameScreen() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('game-screen').classList.add('active');
        
        // Initialize star progress if not already done
        if (window.MathTrainer) {
            this.updateStarProgress(window.MathTrainer.exerciseCount || 0);
        }
    },

    // Switch to stats screen
    switchToStatsScreen() {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('stats-screen').classList.add('active');
        this.renderStatsScreen();
    },

    // Show round results
    showRoundResults(roundData) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('results-screen').classList.add('active');

        // Update results display
        document.getElementById('results-correct').textContent = roundData.correct;
        document.getElementById('results-incorrect').textContent = roundData.incorrect;
        document.getElementById('results-avg-speed').textContent = Timer.formatTimeSeconds(roundData.avgTime);
        document.getElementById('results-total-time').textContent = Timer.formatTime(roundData.totalTime);
        document.getElementById('results-adjusted-time').textContent = Timer.formatTime(roundData.adjustedTime);

        // Animate star rating
        const stars = roundData.starRating;
        const starElements = document.querySelectorAll('#star-rating .star');
        starElements.forEach(star => star.classList.remove('earned'));
        
        setTimeout(() => {
            Animations.animateStarRating(stars);
        }, 500);
    },

    // Render stats screen
    renderStatsScreen() {
        const roundHistory = Storage.getRoundHistory();
        const allTimeStats = Stats.calculateAllTimeStats();
        const streakInfo = Stats.getStreakInfo();

        // Update streak
        const streakCountEl = document.getElementById('streak-count');
        if (streakCountEl) {
            streakCountEl.textContent = streakInfo.current;
        }

        // Render round history
        const roundHistoryEl = document.getElementById('round-history');
        if (roundHistoryEl) {
            if (roundHistory.length === 0) {
                roundHistoryEl.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No rounds completed yet. Complete your first round to see stats here!</p>';
            } else {
                roundHistoryEl.innerHTML = roundHistory.slice().reverse().map(round => {
                    const date = new Date(round.date);
                    const filledStars = '<i class="fas fa-star"></i>'.repeat(round.starRating);
                    const emptyStars = '<i class="far fa-star"></i>'.repeat(3 - round.starRating);
                    const stars = filledStars + emptyStars;
                    
                    return `
                        <div class="round-item">
                            <div class="round-number">Round ${round.roundId}</div>
                            <div class="round-date">${date.toLocaleDateString()}</div>
                            <div class="round-stars">${stars}</div>
                            <div class="round-stats">
                                ${round.correct}/${round.correct + round.incorrect} correct<br>
                                ${Timer.formatTimeSeconds(round.avgTime)} avg
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // Render all-time stats
        const allTimeStatsEl = document.getElementById('all-time-stats');
        if (allTimeStatsEl) {
            allTimeStatsEl.innerHTML = `
                <div class="stat-card">
                    <div class="stat-label">Total Rounds</div>
                    <div class="stat-value">${allTimeStats.totalRounds}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Exercises</div>
                    <div class="stat-value">${allTimeStats.totalExercises}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Avg Star Rating</div>
                    <div class="stat-value">${allTimeStats.avgStarRating.toFixed(1)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Avg Correctness</div>
                    <div class="stat-value">${allTimeStats.avgCorrectnessRate.toFixed(1)}%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Total Time</div>
                    <div class="stat-value">${Timer.formatTime(allTimeStats.totalTime)}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Avg Time/Exercise</div>
                    <div class="stat-value">${Timer.formatTimeSeconds(allTimeStats.avgTimePerExercise)}</div>
                </div>
            `;
        }
    }
};
