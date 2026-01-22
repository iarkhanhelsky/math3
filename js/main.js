const MathTrainer = {
    currentState: null,
    currentBlock: [],
    blockIndex: 0,
    exerciseCount: 0,
    roundStartTime: null,
    currentRoundExercises: [],

    // Initialize the app
    init() {
        this.loadState();
        UI.init();
        
        // Initialize mascot and sounds (they're loaded via script tags)
        if (typeof Mascot !== 'undefined') {
            Mascot.init();
        }
        if (typeof Sounds !== 'undefined') {
            Sounds.init();
        }
        
        // If no current exercise, start a new round
        if (!this.currentState.currentExercise && this.exerciseCount === 0) {
            this.startNewRound();
        } else {
            // Resume from saved state
            this.resumeRound();
        }
    },

    // Load state from storage
    loadState() {
        this.currentState = Storage.getState();
        this.exerciseCount = this.currentState.exerciseCount || 0;
        this.blockIndex = this.currentState.blockIndex || 0;
        this.currentBlock = this.currentState.currentBlock || [];
        
        // Get exercises from current round (last N exercises where N = exerciseCount)
        const allExercises = Storage.getExerciseHistory();
        if (this.exerciseCount > 0 && allExercises.length >= this.exerciseCount) {
            this.currentRoundExercises = allExercises.slice(-this.exerciseCount);
        } else {
            this.currentRoundExercises = [];
        }
    },

    // Save current state
    saveState() {
        this.currentState.exerciseCount = this.exerciseCount;
        this.currentState.blockIndex = this.blockIndex;
        this.currentState.currentBlock = this.currentBlock;
        this.currentState.currentInput = UI.currentInput;
        this.currentState.currentExercise = this.currentState.currentExercise;
        Storage.saveState(this.currentState);
    },

    // Start a new round
    startNewRound() {
        // Update streak
        Storage.updateStreak();

        // Reset round state
        this.exerciseCount = 0;
        this.blockIndex = 0;
        this.currentBlock = [];
        this.currentRoundExercises = [];
        this.currentState.exerciseCount = 0;
        this.currentState.blockIndex = 0;
        this.currentState.currentBlock = [];
        this.currentState.currentOperation = '+';
        this.currentState.currentComplexity = 'both_small';
        this.currentState.currentInput = '';
        
        // Start round timer
        this.roundStartTime = Date.now();
        this.currentState.roundStartTime = this.roundStartTime;
        Timer.startRound();

        // Reset progress bar and stars
        UI.updateProgressBar(0);
        document.querySelectorAll('.milestone-marker').forEach(marker => {
            marker.classList.remove('reached');
        });
        
        // Initialize star progress (show at least one star for progress illusion)
        UI.updateStarProgress(0);

        // Switch to game screen
        UI.switchToGameScreen();

        // Generate and start first exercise
        this.generateNextExercise();
    },

    // Resume a round from saved state
    resumeRound() {
        if (this.currentState.roundStartTime) {
            this.roundStartTime = this.currentState.roundStartTime;
            Timer.startRound();
        }

        if (this.currentState.currentExercise) {
            UI.renderExercise(this.currentState.currentExercise);
            UI.updateProgressBar(this.exerciseCount);
        } else {
            this.generateNextExercise();
        }

        UI.switchToGameScreen();
    },

    // Generate next exercise
    generateNextExercise() {
        // Check if we need a new block
        if (this.blockIndex >= this.currentBlock.length) {
            // Determine operation (alternating)
            const operation = this.exerciseCount === 0 
                ? '+' 
                : ExerciseGenerator.getNextOperation(this.currentState.currentOperation);
            
            // Determine complexity (progressive)
            const complexity = ExerciseGenerator.selectComplexity(this.exerciseCount + 1);
            
            // Generate new block
            this.currentBlock = ExerciseGenerator.generateBlock(operation, complexity);
            this.blockIndex = 0;
            this.currentState.currentOperation = operation;
            this.currentState.currentComplexity = complexity;
            this.currentState.currentBlock = this.currentBlock;
        }

        // Get next exercise from block
        const exercise = this.currentBlock[this.blockIndex];
        this.currentState.currentExercise = exercise;
        
        // Render exercise
        UI.renderExercise(exercise);
        
        // Start timer
        Timer.startExercise();
        this.currentState.exerciseStartTime = Date.now();
        
        // Save state
        this.saveState();
    },

    // Submit answer
    submitAnswer(userAnswer) {
        if (!this.currentState.currentExercise) {
            return;
        }

        const exercise = this.currentState.currentExercise;
        const correct = userAnswer === exercise.answer;
        
        // End timer
        const time = Timer.endExercise();
        
        // Save exercise
        Storage.saveExercise(exercise, time, correct);
        this.currentRoundExercises.push({ exercise, time, correct });

        // Variable reward system (~20-30% bigger celebrations)
        const isVariableReward = correct && Math.random() < 0.25;
        
        // Immediate feedback (all three components for correct)
        if (typeof Animations !== 'undefined') {
            Animations.showAnswerFeedback(correct, isVariableReward);
        }
        
        // Mascot reaction
        if (typeof Mascot !== 'undefined') {
            Mascot.reactToAnswer(correct, isVariableReward);
        }
        
        // Sound effects
        if (typeof Sounds !== 'undefined') {
            if (correct) {
                Sounds.playCorrectSound();
            } else {
                Sounds.playWrongSound();
            }
        }

        // Update exercise count
        this.exerciseCount++;
        this.blockIndex++;
        
        // Update progress bar
        UI.updateProgressBar(this.exerciseCount);

        // Check for milestones
        this.checkMilestones();
        
        // Check for session break suggestion (after 10-15 questions)
        this.checkSessionBreak();

        // Check if round is complete
        if (this.exerciseCount >= 100) {
            setTimeout(() => {
                this.completeRound();
            }, 2000); // Give time for feedback
        } else {
            // Move to next exercise after feedback
            setTimeout(() => {
                this.generateNextExercise();
            }, 1800); // Allow feedback to be visible
        }
    },
    
    // Check for session break suggestion
    checkSessionBreak() {
        // Suggest break after 10-15 questions
        if (this.exerciseCount === 12 && window.Mascot) {
            // This would be a good place to show a break suggestion
            // For now, we'll just track it - can be enhanced later
        }
    },

    // Check for milestones
    checkMilestones() {
        if (this.exerciseCount === 5) {
            UI.showMilestone('minor', 5);
            if (typeof Sounds !== 'undefined') {
                Sounds.playCelebrationSound();
            }
        } else if (this.exerciseCount === 25) {
            UI.showMilestone('major', 25);
            if (typeof Sounds !== 'undefined') {
                Sounds.playCelebrationSound();
            }
        }
    },

    // Complete round
    completeRound() {
        // Update streak
        Storage.updateStreak();

        // Calculate round statistics
        const roundStats = Stats.calculateRoundStats(this.currentRoundExercises);
        
        // Add round metadata
        const roundData = {
            totalTime: Timer.getRoundTime(),
            avgTime: roundStats.avgTime,
            correct: roundStats.correct,
            incorrect: roundStats.incorrect,
            correctnessRate: roundStats.correctnessRate,
            adjustedTime: roundStats.adjustedTime,
            starRating: roundStats.starRating
        };

        // Save round
        Storage.saveRound(roundData);

        // Show results
        UI.showRoundResults(roundData);

        // Celebrate completion
        Animations.celebrateMilestone('completion', 100);

        // Reset state for next round
        this.currentState.exerciseCount = 0;
        this.currentState.roundNumber = (this.currentState.roundNumber || 1) + 1;
        this.currentState.currentExercise = null;
        this.currentState.currentBlock = [];
        this.currentState.blockIndex = 0;
        this.currentRoundExercises = [];
        Storage.saveState(this.currentState);
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.MathTrainer = MathTrainer;
        MathTrainer.init();
    });
} else {
    window.MathTrainer = MathTrainer;
    MathTrainer.init();
}
