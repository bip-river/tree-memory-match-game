const STORAGE_KEY = 'treeMemory.audio.enabled';

class AudioManager {
    constructor() {
        this.enabled = false;
        this.context = null;
        this.masterGain = null;
    }

    loadPreference() {
        this.enabled = localStorage.getItem(STORAGE_KEY) === 'true';
        return this.enabled;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        localStorage.setItem(STORAGE_KEY, String(enabled));
        if (enabled) {
            this.ensureContext();
        }
    }

    ensureContext() {
        if (!this.context) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            this.context = new AudioContext();
            this.masterGain = this.context.createGain();
            this.masterGain.gain.value = 0.12;
            this.masterGain.connect(this.context.destination);
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    playTone({ frequency, duration = 0.18, type = 'sine' }) {
        if (!this.enabled) return;
        this.ensureContext();
        if (!this.context || !this.masterGain) return;
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, this.context.currentTime);
        gain.gain.linearRampToValueAtTime(0.8, this.context.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + duration);
        oscillator.connect(gain);
        gain.connect(this.masterGain);
        oscillator.start();
        oscillator.stop(this.context.currentTime + duration);
    }

    playMatch() {
        this.playTone({ frequency: 620, duration: 0.2, type: 'triangle' });
    }

    playMismatch() {
        this.playTone({ frequency: 220, duration: 0.22, type: 'square' });
    }

    playWin() {
        if (!this.enabled) return;
        this.ensureContext();
        if (!this.context || !this.masterGain) return;
        const now = this.context.currentTime;
        const notes = [440, 554, 659];
        notes.forEach((frequency, index) => {
            const oscillator = this.context.createOscillator();
            const gain = this.context.createGain();
            oscillator.type = 'triangle';
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0.001, now + index * 0.08);
            gain.gain.linearRampToValueAtTime(0.7, now + index * 0.08 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.3);
            oscillator.connect(gain);
            gain.connect(this.masterGain);
            oscillator.start(now + index * 0.08);
            oscillator.stop(now + index * 0.08 + 0.3);
        });
    }
}

export const audioManager = new AudioManager();
