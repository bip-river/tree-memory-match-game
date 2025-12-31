export const CONFIG = {
    CARD_FLIP_DELAY: 1000,
    CARD_SIZE: 100,
    GRID_MAX_WIDTH: 600,
};

export const DIFFICULTY = {
    easy: {
        rows: 3,
        cols: 4,
        previewMs: 2500,
        timeLimitSec: null,
        mismatchDelayMs: 1100,
        timerStart: 'afterPreview',
        label: 'Easy: 12 cards, long preview, no time limit.',
    },
    medium: {
        rows: 4,
        cols: 4,
        previewMs: 1500,
        timeLimitSec: 90,
        mismatchDelayMs: 900,
        timerStart: 'afterPreview',
        label: 'Medium: 16 cards, moderate preview, 90s limit.',
    },
    hard: {
        rows: 4,
        cols: 5,
        previewMs: 900,
        timeLimitSec: 75,
        mismatchDelayMs: 800,
        timerStart: 'afterPreview',
        label: 'Hard: 20 cards, short preview, 75s limit.',
    },
    expert: {
        rows: 6,
        cols: 6,
        previewMs: 300,
        timeLimitSec: 120,
        mismatchDelayMs: 650,
        timerStart: 'onFirstFlip',
        label: 'Expert: 36 cards, lightning preview, 120s limit.',
    },
};
