const Timer = {
    exerciseStartTime: null,
    roundStartTime: null,

    // Start timing an exercise
    startExercise() {
        this.exerciseStartTime = Date.now();
    },

    // End timing an exercise and return the duration
    endExercise() {
        if (!this.exerciseStartTime) {
            return 0;
        }
        const duration = Date.now() - this.exerciseStartTime;
        this.exerciseStartTime = null;
        return duration;
    },

    // Start timing a round
    startRound() {
        this.roundStartTime = Date.now();
    },

    // Get current round time
    getRoundTime() {
        if (!this.roundStartTime) {
            return 0;
        }
        return Date.now() - this.roundStartTime;
    },

    // Get total time for a completed round
    getCompletedRoundTime(startTime, endTime) {
        return endTime - startTime;
    },

    // Format time in milliseconds to readable string
    formatTime(ms) {
        if (ms < 1000) {
            return `${ms}ms`;
        }
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        if (minutes > 0) {
            return `${minutes}m ${remainingSeconds}s`;
        }
        return `${seconds}s`;
    },

    // Format time to seconds with decimals
    formatTimeSeconds(ms) {
        return (ms / 1000).toFixed(2) + 's';
    }
};
