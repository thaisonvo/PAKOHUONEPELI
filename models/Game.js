class Game {
    constructor(escapeRoom, player) {
        this.player = player;
        this.escapeRoom = escapeRoom;
        this.questions = this.escapeRoom.problems;
        this.progress = 0;
        this.hintsLeft = 3;
        this.startTime = null;
        this.endTime = null;
        this.endTimeMs = null;
        this.active = true;
    }
    
    startGame() {
        this.startTime = Date.now();
        return { started: true };
    }

    checkTime() {
        const timePassed = Math.floor((Date.now() - this.startTime) / 1000);
        const timeLeft = (60 * 90) - timePassed;

        if (timeLeft <= 0) {
            return { timeIsUp: true };
        } else {
            return { timeIsUp: false, timeLeft: timeLeft };
        }
    }

    getIntroduction() {
        return {
            title: this.escapeRoom.title,
            description: this.escapeRoom.description,
            video: this.escapeRoom.videoLink
        };
    }

    getQuestion() {
        const question = this.questions[this.progress];
        return {
            title: question.title,
            description: question.description,
            video: question.videoLink
        };
    }

    getHint() {
        if (this.hintsLeft > 0) {
            this.hintsLeft--;
            const hint = this.questions[this.progress].hint;
            return { hint: hint };
        } else {
            return { hint: "Ei vihjeitä jäljellä! " };
        }
    }

    getHintCount() {
        return { hintsLeft: this.hintsLeft };
    }

    checkAnswer(userAnswer) {
        const correctAns = this.questions[this.progress].correctAnswer.replace(/\s/g, "").toLowerCase();
        const userAns = userAnswer.replace(/\s/g, "").toLowerCase();

        if (userAns !== correctAns) {
            return { correct: false };
        }

        this.progress++;

        if (this.progress === this.questions.length) {
            return this.endGame();
        }

        return { correct: true };
    }

    endGame() {
        this.active = false;
        this.endTimeMs = Date.now() - this.startTime;

        const seconds = Math.floor((this.endTimeMs / 1000) % 60);
        const minutes = Math.floor((this.endTimeMs / (1000 * 60)) % 60);
        const hours = Math.floor((this.endTimeMs / (1000 * 60 * 60)) % 24);

        const elapsedTimeString = [hours, minutes, seconds]
        .map(unit => unit.toString().padStart(2, '0'))
        .join(':');
        this.endTime = elapsedTimeString;
        return { finished: true, escapeRoom: this.escapeRoom.title };
    }
}

module.exports = Game;