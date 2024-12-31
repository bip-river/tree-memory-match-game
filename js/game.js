import { createBoard, initializeBoard } from './board.js';
import { setMoveCounter, updateStatusMessage } from './ui.js';
import { CONFIG } from './config.js';

class Game {
    constructor() {
        this.moves = 0;
        this.matchedCards = 0;
    }

    init() {
        document.getElementById('reset-button').addEventListener('click', () => {
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
            updateStatusMessage('You won! 🎉');
        }
    }

    resetGame() {
        this.moves = 0;
        this.matchedCards = 0;
        setMoveCounter(this.moves);
        updateStatusMessage('');
        createBoard();
    }
}

const game = new Game();
game.init();

export default game;
