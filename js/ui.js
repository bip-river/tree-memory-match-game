export function setMoveCounter(count) {
    document.getElementById('move-counter').textContent = count;
}

export function updateTimerLabel(label) {
    document.getElementById('timer-label').textContent = label;
}

export function updateTimerValue(value) {
    document.getElementById('timer').textContent = value;
}

export function updateDifficultyLabel(text) {
    document.getElementById('difficulty-detail').textContent = text;
}

export function updateStatusMessage(message) {
    document.getElementById('status-message').textContent = message;
}

export function updateScore(value) {
    document.getElementById('score-counter').textContent = value;
}

export function updateStreak(value) {
    document.getElementById('streak-counter').textContent = value;
}

export function setAudioToggle(checked) {
    document.getElementById('audio-toggle').checked = checked;
}
