// Metronome utility class using Web Audio API
export class Metronome {
  constructor() {
    this.audioContext = null;
    this.nextNoteTime = 0.0;
    this.timerID = null;
    this.isPlaying = false;
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playTone() {
    if (!this.audioContext) this.init();

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    osc.frequency.value = 800;
    gainNode.gain.value = 0.1;

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.05);
  }

  playBeep() {
    if (!this.audioContext) this.init();

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    osc.type = 'triangle';
    osc.frequency.value = 440;
    gainNode.gain.value = 0.05;

    osc.start();
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  playPop() {
    if (!this.audioContext) this.init();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

    osc.connect(gain).connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  playZap() {
    if (!this.audioContext) this.init();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1500, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);

    osc.connect(gain).connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.15);
  }

  playPowerUp() {
    if (!this.audioContext) this.init();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1000, this.audioContext.currentTime + 0.3);

    gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);

    osc.connect(gain).connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  playHover() {
    if (!this.audioContext) this.init();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.value = 600;

    gain.gain.setValueAtTime(0.02, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);

    osc.connect(gain).connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.05);
  }

  playBuzz() {
    if (!this.audioContext) this.init();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = 120;

    gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25);

    osc.connect(gain).connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.25);
  }

  playChime() {
    if (!this.audioContext) this.init();

    const now = this.audioContext.currentTime;

    [523, 784].forEach((freq, i) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.type = 'triangle';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.06, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15);

      osc.connect(gain).connect(this.audioContext.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.15);
    });
  }

  playTick() {
    if (!this.audioContext) this.init();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'square';
    osc.frequency.value = 1200;

    gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.02);

    osc.connect(gain).connect(this.audioContext.destination);
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.02);
  }

}

export const metronome = new Metronome();
