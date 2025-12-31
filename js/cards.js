import game from './game.js';
import { CONFIG } from './config.js';

let flippedCards = [];
let isClickLocked = false;

export function flipCard(card) {
    if (
        isClickLocked ||
        card.classList.contains('game-board__card--flipped') ||
        card.classList.contains('game-board__card--matched') ||
        flippedCards.length === 2
    ) {
        return;
    }

    game.startTimerOnce();
    card.classList.add('game-board__card--flipped');
    card.textContent = card.dataset.symbol;
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        isClickLocked = true;
        game.incrementMoves();
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    if (card1.dataset.symbol === card2.dataset.symbol) {
        markAsMatched(card1, card2);
        isClickLocked = false;
    } else {
        unflipCards(card1, card2);
    }
}

function markAsMatched(card1, card2) {
    card1.classList.add('game-board__card--matched', 'game-board__card--disabled');
    card2.classList.add('game-board__card--matched', 'game-board__card--disabled');
    flippedCards = [];
    game.handleMatch();
}

function unflipCards(card1, card2) {
    setTimeout(() => {
        card1.classList.remove('game-board__card--flipped');
        card2.classList.remove('game-board__card--flipped');
        card1.textContent = '';
        card2.textContent = '';
        flippedCards = [];
        isClickLocked = false;
    }, CONFIG.CARD_FLIP_DELAY);
}

export function resetFlippedCards() {
    flippedCards = [];
}
