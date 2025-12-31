import { shuffle } from './utils.js';
import { flipCard } from './cards.js';
import { CONFIG } from './config.js';

const trees = [
    '🌲',
    '🌳',
    '🌴',
    '🎄',
    '🍁',
    '🍂',
    '🌱',
    '🍃',
    '🌿',
    '🌵',
    '🍀',
    '🍄',
    '🪴',
    '🌾',
    '🌺',
    '🌸',
    '🌼',
    '🍇',
];

export function createBoard({ rows, cols }) {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    const totalCards = rows * cols;
    if (totalCards % 2 !== 0) {
        throw new Error(`Board must have an even number of cards. Received ${totalCards}.`);
    }
    const pairCount = totalCards / 2;
    if (pairCount > trees.length) {
        throw new Error(`Not enough symbols for ${pairCount} pairs. Add more tree icons.`);
    }
    const selectedTrees = trees.slice(0, pairCount);
    const symbols = shuffle([...selectedTrees, ...selectedTrees]);
    setGridColumns(board, cols, rows);

    symbols.forEach((symbol, index) => {
        const card = document.createElement('div');
        card.classList.add('game-board__card');
        card.dataset.symbol = symbol;
        card.dataset.index = index;
        board.appendChild(card);
    });
}

function setGridColumns(board, columns, rows) {
    board.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
    board.style.gridTemplateRows = `repeat(${rows}, minmax(0, 1fr))`;
    board.style.maxWidth = `${CONFIG.GRID_MAX_WIDTH}px`;
}

function updateCSSVariables() {
    document.documentElement.style.setProperty('--card-size', `${CONFIG.CARD_SIZE}px`);
    document.documentElement.style.setProperty('--grid-max-width', `${CONFIG.GRID_MAX_WIDTH}px`);
}

export function initializeBoard() {
    updateCSSVariables();
    const board = document.getElementById('game-board');
    board.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) {
            return;
        }
        const card = event.target.closest('.game-board__card');
        if (card) flipCard(card);
    });
}

export function resetBoard({ rows, cols }) {
    createBoard({ rows, cols });
}
