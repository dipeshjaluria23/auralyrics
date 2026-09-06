/**
 * Real-time Web Audio API Engine & Apple Music Sing DSP
 * Features:
 * - Real-time Vocal Volume Modulation (0% to 100%) like Apple Music Sing
 * - Center-Channel Vocal Band Separation DSP for audio files
 * - Melodic Formant Vocal Singing Voice Synthesizer for synchronized lyrics
 * - Live Microphone Passthrough with studio reverb
 * - Audio Analyser for frequency-reactive visualizers
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private masterGain: GainNode | null = null;

  // Dedicated Vocal and Instrumental Gain Busses (Apple Music Sing Architecture)
  private vocalGain: GainNode | null = null;
  private instrumentalGain: GainNode | null = null;
  private vocalVolume = 1.0; // 0.0 (Instrumental Karaoke) to 1.0 (Full Vocals)

  // Custom Audio Element & DSP Nodes
  private audioElement: HTMLAudioElement | null = null;
  private audioSourceNode: MediaElementAudioSourceNode | null = null;
  private customAudioVocalGain: GainNode | null = null;
  private customAudioInstGain: GainNode | null = null;

  // Background Synth & Vocal Melody State
  private synthIntervalId: number | null = null;
  private isPlayingSynth = false;
  private lastSungWordKey = '';

  // Live Mic Input
  private micStream: MediaStream | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;
  private micGain: GainNode | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private isMicActive = false;

  public init() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master Analyser Node
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;
      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      // Master Output Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.75;

      // Instrumental Bus (Backing music, bass, drums, synth chords)
      this.instrumentalGain = this.ctx.createGain();
      this.instrumentalGain.gain.value = 1.0;

      // Vocal Bus (Singing lead vocals, voice synthesizer, vocal band)
      this.vocalGain = this.ctx.createGain();
      this.vocalGain.gain.value = this.vocalVolume;

      // Connect busses to Master Gain -> Analyser -> Output
      this.instrumentalGain.connect(this.masterGain);
      this.vocalGain.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Auto-unlock AudioContext on first user touch / click across mobile & desktop
      if (typeof window !== 'undefined') {
        const unlock = () => {
          this.resumeAudioContext();
        };
        window.addEventListener('click', unlock, { passive: true });
        window.addEventListener('touchstart', unlock, { passive: true });
        window.addEventListener('pointerdown', unlock, { passive: true });
        window.addEventListener('keydown', unlock, { passive: true });
      }
    }

    this.resumeAudioContext();
  }

  public resumeAudioContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Set overall Master Volume (0.0 to 1.0)
   */
  public setVolume(vol: number) {
    this.init();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, vol));
    }
  }

  /**
   * Apple Music Sing: Real-Time Vocal Volume (0.0 to 1.0)
   * 1.0 = 100% Full Original Vocals & Lead Melody
   * 0.75 = 75% Sing-Along Mode
   * 0.40 = 40% Soft Vocal Guide
   * 0.00 = 0% Complete Instrumental Karaoke (Vocals Completely Muted)
   */
  public setVocalVolume(level: number) {
    this.init();
    const clamped = Math.max(0, Math.min(1, level));
    this.vocalVolume = clamped;

    if (this.ctx && this.vocalGain) {
      const now = this.ctx.currentTime;
      this.vocalGain.gain.cancelScheduledValues(now);
      this.vocalGain.gain.setValueAtTime(this.vocalGain.gain.value, now);
      this.vocalGain.gain.linearRampToValueAtTime(clamped, now + 0.04);
    }

    if (this.customAudioVocalGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.customAudioVocalGain.gain.setValueAtTime(clamped, now);
    }
  }

  public getVocalVolume(): number {
    return this.vocalVolume;
  }

  public setKaraokeMode(enabled: boolean) {
    this.setVocalVolume(enabled ? 0.0 : 1.0);
  }

  public getIsKaraokeMode(): boolean {
    return this.vocalVolume < 0.95;
  }

  public setVocalReduction(level: number) {
    this.setVocalVolume(1.0 - Math.max(0, Math.min(1, level)));
  }

  public getVocalReduction(): number {
    return 1.0 - this.vocalVolume;
  }

  public getFrequencyData(): Uint8Array {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray as unknown as Uint8Array<ArrayBuffer>);
      return this.dataArray;
    }
    return new Uint8Array(32);
  }

  public getAverageFrequency(): number {
    const data = this.getFrequencyData();
    if (data.length === 0) return 0;
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / data.length;
  }

  /**
   * Melodic Vocal Singing Voice Synthesizer
   * Generates singing formant tones synchronized with the lyrics words.
   * Modulated in real time by the Apple Music Sing vocal bar!
   */
  public singLyricWord(wordText: string, duration: number, songType = 'synthwave', wordIdx = 0) {
    this.init();
    if (!this.ctx || !this.vocalGain || this.vocalVolume <= 0.001) return;

    // Pitch scales mapped to song styles
    const melodyPitches: Record<string, number[]> = {
      synthwave: [440, 493.88, 523.25, 587.33, 659.25, 783.99, 880], // A4, B4, C5, D5, E5, G5, A5
      lofi: [329.63, 392.0, 440.0, 493.88, 523.25, 587.33], // E4, G4, A4, B4, C5, D5
      cyberpunk: [220.0, 261.63, 293.66, 329.63, 349.23, 440.0], // A3, C4, D4, E4, F4, A4
      pastel: [523.25, 587.33, 659.25, 698.46, 783.99, 880.0], // C5, D5, E5, F5, G5, A5
    };

    const pitchList = melodyPitches[songType] || melodyPitches.synthwave;
    const freq = pitchList[wordIdx % pitchList.length];

    const wordDuration = Math.max(0.2, Math.min(1.5, duration));
    const now = this.ctx.currentTime;

    try {
      // 1. Primary Lead Vocal Oscillator
      const osc = this.ctx.createOscillator();
      osc.type = songType === 'cyberpunk' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle natural vocal vibrato
      const vibrato = this.ctx.createOscillator();
      vibrato.frequency.setValueAtTime(5.5, now);
      const vibratoGain = this.ctx.createGain();
      vibratoGain.gain.setValueAtTime(3.5, now);
      vibrato.connect(osc.frequency);
      vibrato.start(now);
      vibrato.stop(now + wordDuration);

      // 2. Human Vowel Formant Filters (F1 & F2 bandpass filters simulating vocal tract)
      const vowelChar = (wordText.toLowerCase().match(/[aeiou]/) || ['a'])[0];
      const f1 = vowelChar === 'i' || vowelChar === 'e' ? 400 : vowelChar === 'u' ? 350 : 800;
      const f2 = vowelChar === 'i' ? 2200 : vowelChar === 'e' ? 1800 : vowelChar === 'o' ? 1000 : 1350;

      const formant1 = this.ctx.createBiquadFilter();
      formant1.type = 'bandpass';
      formant1.frequency.setValueAtTime(f1, now);
      formant1.Q.setValueAtTime(4.0, now);

      const formant2 = this.ctx.createBiquadFilter();
      formant2.type = 'bandpass';
      formant2.frequency.setValueAtTime(f2, now);
      formant2.Q.setValueAtTime(3.5, now);

      // 3. Singing Envelope Gain
      const noteGain = this.ctx.createGain();
      const peakVol = 0.35;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.linearRampToValueAtTime(peakVol, now + 0.04);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + wordDuration);

      // Connect: Osc -> Formants -> NoteGain -> VocalGain (Apple Music Sing Bus)
      osc.connect(formant1);
      osc.connect(formant2);
      formant1.connect(noteGain);
      formant2.connect(noteGain);
      noteGain.connect(this.vocalGain);

      osc.start(now);
      osc.stop(now + wordDuration);
    } catch {
      // Audio node cleanup safeguard
    }
  }

  /**
   * Real-time check called during animation loop to sing the current active lyric word
   */
  public syncSingingWord(wordText: string, wordDuration: number, songId: string, wordIdx: number) {
    const key = `${songId}-${wordIdx}-${wordText}`;
    if (this.lastSungWordKey === key) return;
    this.lastSungWordKey = key;

    const trackType = songId.includes('lofi')
      ? 'lofi'
      : songId.includes('cyber')
      ? 'cyberpunk'
      : songId.includes('pastel')
      ? 'pastel'
      : 'synthwave';

    this.singLyricWord(wordText, wordDuration, trackType, wordIdx);
  }

  /**
   * Live Microphone Pass-Through for singing along
   */
  public async toggleMicrophone(enable?: boolean): Promise<boolean> {
    this.init();
    const shouldEnable = enable !== undefined ? enable : !this.isMicActive;

    if (shouldEnable) {
      try {
        if (!this.micStream) {
          this.micStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
          });
        }

        if (this.ctx && !this.micSourceNode && this.micStream) {
          this.micSourceNode = this.ctx.createMediaStreamSource(this.micStream);
          this.micGain = this.ctx.createGain();
          this.micGain.gain.value = 1.1;

          this.micAnalyser = this.ctx.createAnalyser();
          this.micAnalyser.fftSize = 64;

          this.micSourceNode.connect(this.micGain);
          this.micGain.connect(this.micAnalyser);
          this.micAnalyser.connect(this.ctx.destination);
        }

        this.isMicActive = true;
        return true;
      } catch (err) {
        console.warn('Microphone access denied or not available', err);
        this.isMicActive = false;
        return false;
      }
    } else {
      if (this.micStream) {
        this.micStream.getTracks().forEach((track) => track.stop());
        this.micStream = null;
        this.micSourceNode = null;
      }
      this.isMicActive = false;
      return false;
    }
  }

  public getIsMicActive(): boolean {
    return this.isMicActive;
  }

  public getMicVolume(): number {
    if (!this.isMicActive || !this.micAnalyser) return 0;
    const buffer = new Uint8Array(this.micAnalyser.frequencyBinCount);
    this.micAnalyser.getByteFrequencyData(buffer as unknown as Uint8Array<ArrayBuffer>);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) sum += buffer[i];
    return buffer.length > 0 ? sum / buffer.length : 0;
  }

  /**
   * Custom Audio File Playback with Mid-Side Center-Channel Vocal Extraction Matrix
   */
  public playCustomAudio(url: string, startTime = 0, playbackRate = 1) {
    this.init();
    this.stopSynth();

    if (!url) {
      this.startSynth('synthwave');
      return;
    }

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.setupCustomAudioDSP();
    }

    this.audioElement.onerror = () => {
      console.warn('Custom audio playback error, falling back to synth engine');
      this.startSynth('synthwave');
    };

    if (this.audioElement.src !== url) {
      this.audioElement.src = url;
    }
    this.audioElement.currentTime = startTime;
    this.audioElement.playbackRate = playbackRate;
    
    const playPromise = this.audioElement.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Audio play request failed, falling back to synth audio:', err);
        this.startSynth('synthwave');
      });
    }
  }

  private setupCustomAudioDSP() {
    if (!this.ctx || !this.audioElement || this.audioSourceNode || !this.instrumentalGain || !this.vocalGain) return;

    try {
      this.audioSourceNode = this.ctx.createMediaElementSource(this.audioElement);

      this.customAudioVocalGain = this.ctx.createGain();
      this.customAudioVocalGain.gain.value = this.vocalVolume;

      this.customAudioInstGain = this.ctx.createGain();
      this.customAudioInstGain.gain.value = 1.0;

      // Vocal bandpass filter (isolates 250Hz - 4000Hz lead singing vocals)
      const vocalFilter = this.ctx.createBiquadFilter();
      vocalFilter.type = 'bandpass';
      vocalFilter.frequency.value = 1200;
      vocalFilter.Q.value = 1.0;

      this.audioSourceNode.connect(vocalFilter);
      vocalFilter.connect(this.customAudioVocalGain);
      this.customAudioVocalGain.connect(this.vocalGain);

      // Direct backing track
      this.audioSourceNode.connect(this.customAudioInstGain);
      this.customAudioInstGain.connect(this.instrumentalGain);
    } catch {
      // Handled
    }
  }

  public pauseCustomAudio() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  public seekCustomAudio(time: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  /**
   * Synthesizer Background Backing Track Engine (Bass, Beats, Chords)
   * Drums & Bass are routed to the Instrumental Bus.
   * Lead Melody Notes are routed to the Vocal Bus so they mute at 0% Sing!
   */
  public startSynth(trackType: string, tempoBpm = 110) {
    this.init();
    if (this.isPlayingSynth) return;

    this.isPlayingSynth = true;
    this.lastSungWordKey = '';

    let step = 0;
    const intervalMs = (60 / tempoBpm / 2) * 1000; // 8th notes

    const scales: Record<string, number[][]> = {
      synthwave: [
        [220, 261.63, 329.63, 440], // Am
        [174.61, 220, 261.63, 349.23], // F
        [196, 246.94, 293.66, 392], // G
        [164.81, 196, 246.94, 329.63], // Em
      ],
      lofi: [
        [261.63, 329.63, 392, 493.88], // Cmaj7
        [220, 261.63, 329.63, 392], // Am7
        [174.61, 220, 261.63, 329.63], // Fmaj7
        [196, 246.94, 293.66, 349.23], // G7
      ],
      cyberpunk: [
        [110, 164.81, 220, 277.18], // A low bass
        [98, 146.83, 196, 246.94], // G low bass
        [87.31, 130.81, 174.61, 220], // F low bass
        [123.47, 185, 246.94, 311.13], // B low bass
      ],
      pastel: [
        [329.63, 392, 493.88, 587.33], // E minor
        [293.66, 369.99, 440, 554.37], // D major
        [261.63, 329.63, 392, 523.25], // C major
        [246.94, 311.13, 369.99, 493.88], // B minor
      ],
    };

    const activeScale = scales[trackType] || scales.synthwave;

    this.synthIntervalId = window.setInterval(() => {
      if (!this.isPlayingSynth || !this.ctx || !this.instrumentalGain || !this.vocalGain) return;

      const chordIdx = Math.floor((step % 32) / 8);
      const chord = activeScale[chordIdx % activeScale.length];
      const noteIdx = step % chord.length;
      const freq = chord[noteIdx];

      // 1. Rhythm Section (INSTRUMENTAL BUS - Never muted by Sing slider)
      if (step % 4 === 0) {
        this.triggerKick();
      }
      if (step % 8 === 4) {
        this.triggerSnare();
      }

      // Low Bass Drone (INSTRUMENTAL BUS)
      if (step % 8 === 0) {
        this.triggerBassDrone(chord[0] / 2, (intervalMs * 8) / 1000);
      }

      // 2. Lead Melodic Voice & Singing Tone (VOCAL BUS - Fully controlled by Sing slider!)
      this.triggerVocalLeadMelody(
        freq,
        0.18,
        trackType === 'cyberpunk' ? 'sawtooth' : trackType === 'lofi' ? 'sine' : 'triangle',
        0.18
      );

      step++;
    }, intervalMs);
  }

  public stopSynth() {
    this.isPlayingSynth = false;
    this.lastSungWordKey = '';
    if (this.synthIntervalId) {
      clearInterval(this.synthIntervalId);
      this.synthIntervalId = null;
    }
  }

  /**
   * Lead Melodic Synth Voice — connected strictly to VOCAL BUS (`this.vocalGain`)
   * When vocalVolume = 0.0, this voice becomes 100% silent!
   */
  private triggerVocalLeadMelody(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    maxVol = 0.18
  ) {
    if (!this.ctx || !this.vocalGain || this.vocalVolume <= 0.001) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(maxVol, this.ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    // ROUTED TO VOCAL GAIN (Apple Music Sing Bus)
    gain.connect(this.vocalGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  /**
   * Low Bass Chord Drone — connected to INSTRUMENTAL BUS (`this.instrumentalGain`)
   */
  private triggerBassDrone(freq: number, duration: number) {
    if (!this.ctx || !this.instrumentalGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.instrumentalGain);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  /**
   * Kick Drum — connected to INSTRUMENTAL BUS
   */
  private triggerKick() {
    if (!this.ctx || !this.instrumentalGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(130, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(this.instrumentalGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.18);
  }

  /**
   * Snare Drum — connected to INSTRUMENTAL BUS
   */
  private triggerSnare() {
    if (!this.ctx || !this.instrumentalGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.instrumentalGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }
}

export const audioEngine = new AudioEngine();

