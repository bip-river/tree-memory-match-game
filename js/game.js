import { createBoard, initializeBoard } from './board.js';
import {
    setMoveCounter,
    updateDifficultyLabel,
    updateScore,
    updateStatusMessage,
    updateStreak,
    updateTimerLabel,
    updateTimerValue,
    setAudioToggle,
} from './ui.js';
import { CONFIG, DIFFICULTY } from './config.js';
import { resetFlippedCards } from './cards.js';
import { audioManager } from './audio.js';

class Game {
    constructor() {
        this.difficulty = 'medium';
        this.moves = 0;
        this.matchedCards = 0;
        this.matches = 0;
        this.mismatches = 0;
        this.timerId = null;
        this.previewTimeoutId = null;
        this.isLocked = false;
        this.isPreviewActive = false;
        this.timerStarted = false;
        this.timeLeft = 0;
        this.timeElapsed = 0;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.summaryModal = document.getElementById('summary-modal');
        this.summaryRestartButton = document.getElementById('summary-restart');
        this.summaryDifficultyLink = document.getElementById('summary-difficulty-link');
        this.audioToggle = document.getElementById('audio-toggle');
        this.lastFocusedElement = null;
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
        this.summaryRestartButton.addEventListener('click', () => {
            this.closeSummary();
            this.resetGame();
        });
        this.summaryDifficultyLink.addEventListener('click', () => {
            this.closeSummary();
            difficultySelect.focus();
        });
        this.summaryModal.addEventListener('click', (event) => {
            if (event.target.matches('[data-modal-close]')) {
                this.closeSummary();
            }
        });
        this.summaryModal.addEventListener('keydown', (event) => this.handleModalKeydown(event));
        const audioEnabled = audioManager.loadPreference();
        setAudioToggle(audioEnabled);
        this.audioToggle.addEventListener('change', (event) => {
            audioManager.setEnabled(event.target.checked);
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
        this.matches += 1;
        this.streak += 1;
        this.maxStreak = Math.max(this.maxStreak, this.streak);
        const multiplier = this.getStreakMultiplier();
        this.addScore(CONFIG.SCORE_MATCH * multiplier);
        updateStreak(this.streak);
        audioManager.playMatch();
        const totalCards = document.querySelectorAll('.game-board__card').length;
        if (this.matchedCards === totalCards) {
            this.endGame(true);
        }
    }

    handleMismatch() {
        this.mismatches += 1;
        this.streak = 0;
        updateStreak(this.streak);
        this.addScore(-CONFIG.SCORE_MISMATCH_PENALTY);
        audioManager.playMismatch();
    }

    getStreakMultiplier() {
        const index = Math.min(this.streak - 1, CONFIG.STREAK_MULTIPLIERS.length - 1);
        return CONFIG.STREAK_MULTIPLIERS[index] ?? 1;
    }

    addScore(value) {
        this.score = Math.max(0, Math.round(this.score + value));
        updateScore(this.score);
    }

    endGame(didWin) {
        this.stopTimer();
        const message = didWin ? 'You won! 🎉' : 'Time’s up! Try again!';
        updateStatusMessage(message);
        this.lockInteractions(true);
        // Disable all cards to prevent further interaction
        const cards = document.querySelectorAll('.game-board__card');
        cards.forEach(card => card.classList.add('game-board__card--disabled'));
        if (didWin) {
            audioManager.playWin();
        }
        this.openSummary(didWin);
    }
    
    resetGame() {
        this.stopTimer();
        this.clearPreviewTimeout();
        this.closeSummary();
        this.moves = 0;
        this.matchedCards = 0;
        this.matches = 0;
        this.mismatches = 0;
        this.score = 0;
        this.streak = 0;
        this.maxStreak = 0;
        setMoveCounter(this.moves);
        updateScore(this.score);
        updateStreak(this.streak);
        updateStatusMessage('');
        resetFlippedCards();
        const config = this.getDifficultyConfig();
        createBoard({ rows: config.rows, cols: config.cols });
        updateDifficultyLabel(config.label);
        this.setupTimer(config);
        this.startPreview(config);
        this.lockInteractions(false);
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

    getElapsedTime(config) {
        if (config.timeLimitSec === null) {
            return this.timeElapsed;
        }
        return Math.max(config.timeLimitSec - this.timeLeft, 0);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins === 0) {
            return `${secs}s`;
        }
        return `${mins}m ${secs}s`;
    }

    getBestKey() {
        return `treeMemory.best.${this.difficulty}`;
    }

    loadBestStats() {
        const saved = localStorage.getItem(this.getBestKey());
        if (!saved) {
            return {
                bestScore: 0,
                bestTime: null,
                bestMoves: null,
                bestStreak: 0,
                gamesPlayed: 0,
            };
        }
        try {
            return JSON.parse(saved);
        } catch (error) {
            return {
                bestScore: 0,
                bestTime: null,
                bestMoves: null,
                bestStreak: 0,
                gamesPlayed: 0,
            };
        }
    }

    saveBestStats(stats) {
        localStorage.setItem(this.getBestKey(), JSON.stringify(stats));
    }

    updateBestStats({ didWin, elapsedTime }) {
        const stats = this.loadBestStats();
        stats.gamesPlayed += 1;
        if (this.score > stats.bestScore) {
            stats.bestScore = this.score;
        }
        if (this.maxStreak > stats.bestStreak) {
            stats.bestStreak = this.maxStreak;
        }
        if (didWin) {
            if (stats.bestMoves === null || this.moves < stats.bestMoves) {
                stats.bestMoves = this.moves;
            }
            if (stats.bestTime === null || elapsedTime < stats.bestTime) {
                stats.bestTime = elapsedTime;
            }
        }
        this.saveBestStats(stats);
        return stats;
    }

    openSummary(didWin) {
        const config = this.getDifficultyConfig();
        const elapsedTime = this.getElapsedTime(config);
        const timeLabel = config.timeLimitSec === null ? 'Time Elapsed' : 'Time Left';
        const timeValue = config.timeLimitSec === null
            ? elapsedTime
            : Math.max(this.timeLeft, 0);
        const accuracy = this.moves === 0 ? 0 : Math.round((this.matches / this.moves) * 100);
        const stats = this.updateBestStats({ didWin, elapsedTime });
        document.getElementById('summary-result').textContent = didWin ? 'You Win! 🌟' : 'Time’s Up!';
        document.getElementById('summary-difficulty').textContent = config.label.split(':')[0];
        document.getElementById('summary-score').textContent = this.score;
        document.getElementById('summary-time-label').textContent = timeLabel;
        document.getElementById('summary-time').textContent = this.formatTime(timeValue);
        document.getElementById('summary-moves').textContent = this.moves;
        document.getElementById('summary-accuracy').textContent = `${accuracy}%`;
        document.getElementById('summary-max-streak').textContent = this.maxStreak;
        document.getElementById('best-score').textContent = stats.bestScore;
        document.getElementById('best-time').textContent = stats.bestTime === null ? '--' : this.formatTime(stats.bestTime);
        document.getElementById('best-moves').textContent = stats.bestMoves === null ? '--' : stats.bestMoves;
        document.getElementById('best-streak').textContent = stats.bestStreak;
        this.renderBadges({ didWin, elapsedTime, config });
        this.lastFocusedElement = document.activeElement;
        this.summaryModal.classList.remove('modal--hidden');
        this.summaryModal.setAttribute('aria-hidden', 'false');
        this.summaryRestartButton.focus();
    }

    closeSummary() {
        this.summaryModal.classList.add('modal--hidden');
        this.summaryModal.setAttribute('aria-hidden', 'true');
        if (this.lastFocusedElement && this.lastFocusedElement.focus) {
            this.lastFocusedElement.focus();
        }
    }

    renderBadges({ didWin, elapsedTime, config }) {
        const badges = [];
        if (didWin && elapsedTime <= config.parTimeSec) {
            badges.push({ label: 'Beat par time', className: 'badge badge--par' });
        }
        if (didWin && this.mismatches === 0) {
            badges.push({ label: 'Perfect (0 mismatches)', className: 'badge badge--perfect' });
        }
        if (this.maxStreak >= config.streakBadge) {
            badges.push({ label: 'Streak Master', className: 'badge badge--streak' });
        }
        const container = document.getElementById('summary-badges');
        container.innerHTML = '';
        badges.forEach((badge) => {
            const span = document.createElement('span');
            span.className = badge.className;
            span.textContent = badge.label;
            container.appendChild(span);
        });
    }

    handleModalKeydown(event) {
        if (event.key === 'Escape') {
            event.preventDefault();
            this.closeSummary();
            return;
        }
        if (event.key !== 'Tab') return;
        const focusable = this.summaryModal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
}

const game = new Game();
game.init();

export default game;
