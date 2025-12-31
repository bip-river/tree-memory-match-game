import { createBoard, initializeBoard } from './board.js';
import { setMoveCounter, updateDifficultyLabel, updateStatusMessage, updateTimerLabel, updateTimerValue } from './ui.js';
import { DIFFICULTY } from './config.js';
import { resetFlippedCards } from './cards.js';

class Game {
    constructor() {
        this.difficulty = 'medium';
        this.moves = 0;
        this.matchedCards = 0;
        this.timerId = null;
        this.previewTimeoutId = null;
        this.isLocked = false;
        this.isPreviewActive = false;
        this.timerStarted = false;
        this.timeLeft = 0;
        this.timeElapsed = 0;
    }

    startTimerOnce() {
        if (this.timerId || this.timerStarted) {
            return;
        }
        this.timerStarted = true;
        const config = this.getDifficultyConfig();
        if (config.timeLimitSec === null) {
            this.timerId = setInterval(() => {
                this.timeElapsed++;
                updateTimerValue(this.timeElapsed);
            }, 1000);
            return;
        }
        this.timerId = setInterval(() => {
            this.timeLeft--;
            updateTimerValue(this.timeLeft);
            if (this.timeLeft <= 0) {
                clearInterval(this.timerId);
                this.timerId = null;
                this.endGame(false);
            }
        }, 1000);
    }
    
    init() {
        document.getElementById('reset-button').addEventListener('click', () => {
            this.resetGame();
        });
        const difficultySelect = document.getElementById('difficulty-select');
        difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.resetGame();
        });
        initializeBoard();
        this.resetGame();
    }

    getDifficultyConfig() {
        return DIFFICULTY[this.difficulty];
    }

    getMismatchDelayMs() {
        return this.getDifficultyConfig().mismatchDelayMs;
    }

    isInteractionLocked() {
        return this.isLocked;
    }

    lockInteractions(locked) {
        this.isLocked = locked;
    }

    handlePlayerAction() {
        const config = this.getDifficultyConfig();
        if (config.timerStart === 'onFirstFlip' && !this.isPreviewActive) {
            this.startTimerOnce();
        }
    }

    incrementMoves() {
        this.moves++;
        setMoveCounter(this.moves);
    }

    handleMatch() {
        this.matchedCards += 2;
        const totalCards = document.querySelectorAll('.game-board__card').length;
        if (this.matchedCards === totalCards) {
            this.endGame(true);
        }
    }

    endGame(didWin) {
        this.stopTimer();
        const message = didWin ? 'You won! 🎉' : 'Time’s up! Try again!';
        updateStatusMessage(message);
        this.lockInteractions(true);
        // Disable all cards to prevent further interaction
        const cards = document.querySelectorAll('.game-board__card');
        cards.forEach(card => card.classList.add('game-board__card--disabled'));
    }
    
    resetGame() {
        this.stopTimer();
        this.clearPreviewTimeout();
        this.moves = 0;
        this.matchedCards = 0;
        setMoveCounter(this.moves);
        updateStatusMessage('');
        resetFlippedCards();
        const config = this.getDifficultyConfig();
        createBoard({ rows: config.rows, cols: config.cols });
        updateDifficultyLabel(config.label);
        this.setupTimer(config);
        this.startPreview(config);
    }

    setupTimer(config) {
        this.timeLeft = config.timeLimitSec ?? 0;
        this.timeElapsed = 0;
        this.timerStarted = false;
        if (config.timeLimitSec === null) {
            updateTimerLabel('Time Elapsed');
            updateTimerValue(this.timeElapsed);
        } else {
            updateTimerLabel('Time Left');
            updateTimerValue(this.timeLeft);
        }
    }

    startPreview(config) {
        this.isPreviewActive = true;
        this.lockInteractions(true);
        const cards = document.querySelectorAll('.game-board__card');
        cards.forEach(card => {
            card.classList.add('game-board__card--flipped');
            card.textContent = card.dataset.symbol;
            card.classList.remove('game-board__card--disabled');
        });
        this.previewTimeoutId = setTimeout(() => {
            cards.forEach(card => {
                card.classList.remove('game-board__card--flipped');
                card.textContent = '';
            });
            this.isPreviewActive = false;
            this.lockInteractions(false);
            if (config.timerStart === 'afterPreview') {
                this.startTimerOnce();
            }
            this.previewTimeoutId = null;
        }, config.previewMs);
    }

    clearPreviewTimeout() {
        if (this.previewTimeoutId) {
            clearTimeout(this.previewTimeoutId);
            this.previewTimeoutId = null;
        }
        this.isPreviewActive = false;
    }

    stopTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
        this.timerStarted = false;
    }
}

const game = new Game();
game.init();

export default game;
