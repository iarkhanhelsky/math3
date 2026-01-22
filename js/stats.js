const Stats = {
    // Calculate star rating (0-3) based on correctness and speed
    calculateStarRating(correct, incorrect, totalTime) {
        const correctnessRate = (correct / 100) * 100;
        
        // Must have >= 90% correct to earn any stars
        if (correctnessRate < 90) {
            return 0;
        }

        // Calculate adjusted time (add 1 second penalty per wrong answer)
        const penaltyTime = incorrect * 1000; // 1 second = 1000ms
        const adjustedTime = totalTime + penaltyTime;
        
        // Convert to seconds for easier threshold calculation
        const adjustedSeconds = adjustedTime / 1000;
        
        // Time thresholds (calibrated for reasonable performance)
        // These can be adjusted based on actual performance data
        // Assuming average good performance is around 2-3 seconds per exercise
        // 100 exercises * 2.5s = 250s = ~4 minutes for good performance
        // 100 exercises * 3.5s = 350s = ~6 minutes for acceptable performance
        
        if (adjustedSeconds <= 250) {
            // Excellent: <= 250 seconds (2.5s per exercise average)
            return 3;
        } else if (adjustedSeconds <= 350) {
            // Good: <= 350 seconds (3.5s per exercise average)
            return 2;
        } else {
            // Acceptable: > 350 seconds but >= 90% correct
            return 1;
        }
    },

    // Calculate round statistics
    calculateRoundStats(exerciseHistory) {
        if (!exerciseHistory || exerciseHistory.length === 0) {
            return {
                total: 0,
                correct: 0,
                incorrect: 0,
                correctnessRate: 0,
                totalTime: 0,
                avgTime: 0,
                adjustedTime: 0,
                starRating: 0
            };
        }

        const total = exerciseHistory.length;
        let correct = 0;
        let incorrect = 0;
        let totalTime = 0;

        exerciseHistory.forEach(ex => {
            if (ex.correct) {
                correct++;
            } else {
                incorrect++;
            }
            totalTime += ex.time;
        });

        const correctnessRate = (correct / total) * 100;
        const avgTime = totalTime / total;
        const penaltyTime = incorrect * 1000; // 1 second per wrong answer
        const adjustedTime = totalTime + penaltyTime;
        const starRating = this.calculateStarRating(correct, incorrect, totalTime);

        return {
            total: total,
            correct: correct,
            incorrect: incorrect,
            correctnessRate: correctnessRate,
            totalTime: totalTime,
            avgTime: avgTime,
            adjustedTime: adjustedTime,
            starRating: starRating
        };
    },

    // Calculate all-time statistics
    calculateAllTimeStats() {
        const roundHistory = Storage.getRoundHistory();
        const exerciseHistory = Storage.getExerciseHistory();

        if (roundHistory.length === 0) {
            return {
                totalRounds: 0,
                totalExercises: 0,
                totalTime: 0,
                avgTimePerExercise: 0,
                avgCorrectnessRate: 0,
                avgStarRating: 0,
                totalCorrect: 0,
                totalIncorrect: 0
            };
        }

        let totalRounds = roundHistory.length;
        let totalExercises = 0;
        let totalTime = 0;
        let totalCorrect = 0;
        let totalIncorrect = 0;
        let totalStarRating = 0;

        roundHistory.forEach(round => {
            totalTime += round.totalTime;
            totalCorrect += round.correct;
            totalIncorrect += round.incorrect;
            totalStarRating += round.starRating;
            totalExercises += (round.correct + round.incorrect);
        });

        const avgTimePerExercise = totalExercises > 0 ? totalTime / totalExercises : 0;
        const avgCorrectnessRate = totalRounds > 0 
            ? roundHistory.reduce((sum, r) => sum + r.correctnessRate, 0) / totalRounds 
            : 0;
        const avgStarRating = totalRounds > 0 ? totalStarRating / totalRounds : 0;

        return {
            totalRounds: totalRounds,
            totalExercises: totalExercises,
            totalTime: totalTime,
            avgTimePerExercise: avgTimePerExercise,
            avgCorrectnessRate: avgCorrectnessRate,
            avgStarRating: avgStarRating,
            totalCorrect: totalCorrect,
            totalIncorrect: totalIncorrect
        };
    },

    // Get streak info
    getStreakInfo() {
        return Storage.getStreakInfo();
    }
};
