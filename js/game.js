import { createBoard, initializeBoard } from './board.js';
import { setMoveCounter, updateStatusMessage } from './ui.js';
import { DIFFICULTIES } from './config.js';

class Game {
    constructor() {
        this.difficulty = 'medium';
        this.moves = 0;
        this.matchedCards = 0;
        this.timerId = null; // Timer interval ID
        this.timeLeft = DIFFICULTIES[this.difficulty].time; // Time left in seconds
    }

    startTimerOnce() {
        if (this.timerId) {
            return;
        }
        this.timerId = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            if (this.timeLeft <= 0) {
                clearInterval(this.timerId);
                this.timerId = null;
                this.endGame(false); // End game if timer runs out
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

    incrementMoves() {
        this.moves++;
        setMoveCounter(this.moves);
    }

    handleMatch() {
        this.matchedCards += 2;
        const totalCards = document.querySelectorAll('.game-board__card').length;
        if (this.matchedCards === totalCards) {
            clearInterval(this.timerId); // Stop the timer
            this.timerId = null;
            updateStatusMessage('You won! 🎉');
        }
    }

    endGame(didWin) {
        clearInterval(this.timerId); // Stop the timer
        this.timerId = null;
        const message = didWin ? 'You won! 🎉' : 'Time’s up! Try again!';
        updateStatusMessage(message);
        // Disable all cards to prevent further interaction
        const cards = document.querySelectorAll('.game-board__card');
        cards.forEach(card => card.classList.add('game-board__card--disabled'));
    }
    
    resetGame() {
        clearInterval(this.timerId); // Stop any running timer
        this.timerId = null;
        this.moves = 0;
        this.matchedCards = 0;
        setMoveCounter(this.moves);
        updateStatusMessage('');
        createBoard(DIFFICULTIES[this.difficulty].pairs);
        this.timeLeft = DIFFICULTIES[this.difficulty].time;
        document.getElementById('timer').textContent = this.timeLeft;
    }
}

const game = new Game();
game.init();

export default game;
