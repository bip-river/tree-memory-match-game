import game from './game.js';

let flippedCards = [];
let isClickLocked = false;
let mismatchTimeoutId = null;

export function flipCard(card) {
    if (
        game.isInteractionLocked() ||
        isClickLocked ||
        card.classList.contains('game-board__card--flipped') ||
        card.classList.contains('game-board__card--matched') ||
        flippedCards.length === 2
    ) {
        return;
    }

    game.handlePlayerAction();
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
    animateCard(card1, 'matched-animate');
    animateCard(card2, 'matched-animate');
    flippedCards = [];
    game.handleMatch();
}

function unflipCards(card1, card2) {
    animateCard(card1, 'mismatch-animate');
    animateCard(card2, 'mismatch-animate');
    game.handleMismatch();
    const delay = game.getMismatchDelayMs();
    mismatchTimeoutId = setTimeout(() => {
        card1.classList.remove('game-board__card--flipped');
        card2.classList.remove('game-board__card--flipped');
        card1.textContent = '';
        card2.textContent = '';
        flippedCards = [];
        isClickLocked = false;
        mismatchTimeoutId = null;
    }, delay);
}

function animateCard(card, className) {
    card.classList.remove(className);
    void card.offsetWidth;
    card.classList.add(className);
    const removeAnimation = () => card.classList.remove(className);
    card.addEventListener('animationend', removeAnimation, { once: true });
    setTimeout(removeAnimation, 300);
}

export function resetFlippedCards() {
    flippedCards = [];
    isClickLocked = false;
    if (mismatchTimeoutId) {
        clearTimeout(mismatchTimeoutId);
        mismatchTimeoutId = null;
    }
}
