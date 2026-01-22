const Storage = {
    STORAGE_KEY: 'mathTrainerData',

    // Initialize default data structure
    getDefaultData() {
        return {
            currentState: {
                exerciseCount: 0,
                roundNumber: 1,
                currentExercise: null,
                currentInput: "",
                roundStartTime: null,
                exerciseStartTime: null,
                currentBlock: [],
                blockIndex: 0,
                currentOperation: '+',
                currentComplexity: 'both_small'
            },
            exerciseHistory: [],
            roundHistory: [],
            streak: {
                current: 0,
                lastActivity: null
            }
        };
    },

    // Load all data from localStorage
    loadData() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Error loading data:', e);
        }
        return this.getDefaultData();
    },

    // Save all data to localStorage
    saveData(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving data:', e);
            return false;
        }
    },

    // Get current state
    getState() {
        const data = this.loadData();
        return data.currentState;
    },

    // Save current state
    saveState(state) {
        const data = this.loadData();
        data.currentState = state;
        return this.saveData(data);
    },

    // Save completed exercise
    saveExercise(exercise, time, correct) {
        const data = this.loadData();
        data.exerciseHistory.push({
            exercise: exercise,
            time: time,
            correct: correct,
            timestamp: Date.now()
        });
        return this.saveData(data);
    },

    // Save completed round
    saveRound(roundData) {
        const data = this.loadData();
        data.roundHistory.push({
            roundId: data.roundHistory.length + 1,
            date: Date.now(),
            totalTime: roundData.totalTime,
            avgTime: roundData.avgTime,
            correct: roundData.correct,
            incorrect: roundData.incorrect,
            correctnessRate: roundData.correctnessRate,
            adjustedTime: roundData.adjustedTime,
            starRating: roundData.starRating
        });
        return this.saveData(data);
    },

    // Get exercise history
    getExerciseHistory() {
        const data = this.loadData();
        return data.exerciseHistory;
    },

    // Get round history
    getRoundHistory() {
        const data = this.loadData();
        return data.roundHistory;
    },

    // Update streak
    updateStreak() {
        const data = this.loadData();
        const now = new Date();
        const lastActivity = data.streak.lastActivity ? new Date(data.streak.lastActivity) : null;
        
        if (!lastActivity) {
            // First time
            data.streak.current = 1;
            data.streak.lastActivity = now.getTime();
        } else {
            const daysDiff = Math.floor((now - lastActivity) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === 0) {
                // Same day, no change
            } else if (daysDiff === 1) {
                // Consecutive day
                data.streak.current += 1;
                data.streak.lastActivity = now.getTime();
            } else if (daysDiff <= 2) {
                // Within grace period (48 hours)
                data.streak.current += 1;
                data.streak.lastActivity = now.getTime();
            } else {
                // Streak broken
                data.streak.current = 1;
                data.streak.lastActivity = now.getTime();
            }
        }
        
        return this.saveData(data);
    },

    // Get streak info
    getStreakInfo() {
        const data = this.loadData();
        return {
            current: data.streak.current,
            lastActivity: data.streak.lastActivity
        };
    },

    // Clear all data (for testing/reset)
    clearAll() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (e) {
            console.error('Error clearing data:', e);
            return false;
        }
    }
};
