# Tree Memory Match Game

**Tree Memory Match Game** is a fun and interactive browser-based game where players match pairs of tree-themed cards. It's an engaging way to test your memory while enjoying a nature-inspired design.

🎮 **Play it now**: [Tree Memory Match Game](https://bip-river.github.io/tree-memory-match-game/)
---

## Features

- **Interactive Gameplay**: Match pairs of cards to win.
- **Dynamic Scoring**: Track your moves as you play.
- **Four Difficulty Levels**: Choose from Easy, Medium, Hard, or Expert.
- **Responsive Design**: Looks great on any screen size.
- **Tree Theme**: Cards feature delightful tree symbols like 🌲 and 🌳.

---

## How to Play

1. Select a difficulty level from the dropdown.
2. Click on a card to reveal its symbol.
3. Click on another card to find its match.
4. Match all pairs to complete the game.
5. Restart at any time with the "Restart Game" button.

---

## Difficulty Definitions (Single Source of Truth)

Difficulty settings live in `js/config.js` under the `DIFFICULTY` object. Each entry controls the board size, preview length, timer mode, and mismatch delay.

| Difficulty | Rows x Cols | Cards | Preview | Timer | Mismatch Delay |
| --- | --- | --- | --- | --- | --- |
| Easy | 3x4 | 12 | 2.5s | No limit (elapsed) | 1.1s |
| Medium | 4x4 | 16 | 1.5s | 90s limit | 0.9s |
| Hard | 4x5 | 20 | 0.9s | 75s limit | 0.8s |
| Expert | 6x6 | 36 | 0.3s | 120s limit (starts on first flip) | 0.65s |

### Tuning Difficulty

Adjust only the values in `DIFFICULTY` to change gameplay. The board uses `rows * cols`, and must remain even so cards can pair.

---

---

## Development Setup

To run the game locally, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/bip-river/tree-memory-match-game.git
    ```
2. Navigate to the project folder:
    ```bash
    cd tree-memory-match-game
    ```
3. Open `index.html` in your favorite browser.

---

## QA Checklist

### Gameplay
- Each difficulty produces the correct number of cards and pairs.
- Preview works (cards flip up then down) and blocks input.
- Timer starts after preview ends (or on first flip for Expert).
- Restart clears timers and timeouts; no stacked intervals.
- Win condition works for all difficulties.
- Loss condition works for timed difficulties.

### UI
- Board displays correctly for each difficulty.
- No horizontal overflow on mobile.
- No console errors.

### Edge Cases
- Restart during preview.
- Change difficulty during preview.
- Rapid tapping during mismatch delay.

---

## Code Highlights

Here’s an example of the code that shuffles the card symbols:

```javascript
export function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
```

---

## Screenshot

![Game Screenshot](./Screenshot.png)

---

## Contributing

Contributions are welcome! Feel free to fork the repository and submit a pull request with your improvements or suggestions.

---

## About the Author

Created by *Jack River*, a passionate forester who loves combining technology with nature.

---

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
