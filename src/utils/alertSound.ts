class AlertSoundManager {
  private audioContext: AudioContext | null = null;
  private isMuted: boolean = false;
  private isPlaying: boolean = false;
  private alarmInterval: NodeJS.Timeout | null = null;
  private autoStopTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize audio context on first user interaction
    this.initializeAudioContext();
  }

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Failed to resume audio context:', error);
      }
    }
  }

  private createBeepSound(frequency: number = 800, duration: number = 200) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  async playAlert() {
    if (this.isMuted) return;
    
    // If already playing, don't start another loop
    if (this.isPlaying) return;

    try {
      await this.resumeAudioContext();
      this.isPlaying = true;

      // Start continuous alarm loop
      this.startAlarmLoop();

      // Set auto-stop timer for 1 minute
      this.autoStopTimeout = setTimeout(() => {
        console.log('Auto-stopping alarm after 1 minute');
        this.stopAlarm();
        this.isMuted = true; // Auto-mute to prevent immediate restart
      }, 60000); // 60 seconds
    } catch (error) {
      console.warn('Failed to play alert sound:', error);
      this.isPlaying = false;
    }
  }

  private startAlarmLoop() {
    // Clear any existing interval
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
    }

    // Play initial alarm sequence
    this.playAlarmSequence();

    // Set up continuous loop every 2 seconds
    this.alarmInterval = setInterval(() => {
      if (this.isMuted) {
        this.stopAlarm();
        return;
      }
      this.playAlarmSequence();
    }, 2000);
  }

  private playAlarmSequence() {
    if (this.isMuted || !this.audioContext) return;

    // Play a sequence of beeps
    this.createBeepSound(800, 200);
    setTimeout(() => {
      if (!this.isMuted) this.createBeepSound(1000, 200);
    }, 300);
    setTimeout(() => {
      if (!this.isMuted) this.createBeepSound(800, 200);
    }, 600);
  }

  private stopAlarm() {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (this.autoStopTimeout) {
      clearTimeout(this.autoStopTimeout);
      this.autoStopTimeout = null;
    }
    this.isPlaying = false;
  }

  mute() {
    this.isMuted = true;
    this.stopAlarm();
  }

  unmute() {
    this.isMuted = false;
  }

  resetMuteStatus() {
    this.isMuted = false;
  }

  getMuteStatus() {
    return this.isMuted;
  }

  isMutedState() {
    return this.isMuted;
  }

  isCurrentlyPlaying() {
    return this.isPlaying;
  }
}

// Export singleton instance
export const alertSoundManager = new AlertSoundManager();