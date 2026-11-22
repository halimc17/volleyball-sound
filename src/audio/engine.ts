import type { AudioChannel, SoundTrack } from '../data/catalog';

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface ChannelState {
  track: SoundTrack | null;
  status: PlaybackStatus;
  currentTime: number;
  duration: number;
  error: string | null;
}

export interface AudioEngineSnapshot {
  bgm: ChannelState;
  sfx: ChannelState;
  bgmVolume: number;
  sfxVolume: number;
  autoDuck: boolean;
  isDucking: boolean;
  isFadingOut: boolean;
  fadeDurationSec: number;
  bgmLoop: boolean;
}

type Listener = (snapshot: AudioEngineSnapshot) => void;

const DUCK_MULTIPLIER = 0.16;
const FADE_STORAGE_KEY = 'volleybeats-fade-sec-v1';
const LEGACY_FADE_STORAGE_KEY = 'vsound-fade-sec-v1';
const DUCK_STORAGE_KEY = 'volleybeats-autoduck-v1';
const AUDIO_CACHE_NAME = 'volleybeats-audio-v1';

function loadAutoDuck(): boolean {
  try {
    const raw = localStorage.getItem(DUCK_STORAGE_KEY);
    if (raw === 'false') return false;
    if (raw === 'true') return true;
  } catch {
    // Ignore storage read errors.
  }
  return true;
}

// Cosine-taper fader curve: smooth onset, even mid decay, silent zero landing without clicks.
function buildFadeCurve(startGain: number, samples = 128): Float32Array {
  const curve = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    const weight = Math.pow(Math.cos(t * Math.PI * 0.5), 2.2);
    curve[i] = i === samples - 1 ? 0 : Math.max(0, startGain * weight);
  }
  return curve;
}

function loadFadeDuration(): number {
  try {
    const raw = Number(
      localStorage.getItem(FADE_STORAGE_KEY) ?? localStorage.getItem(LEGACY_FADE_STORAGE_KEY)
    );
    if (raw === 1.5 || raw === 3 || raw === 5) return raw;
  } catch {
    // Ignore storage read errors.
  }
  return 3;
}

function emptyChannel(): ChannelState {
  return {
    track: null,
    status: 'idle',
    currentTime: 0,
    duration: 0,
    error: null,
  };
}

class MatchAudioEngine {
  private bgmAudio: HTMLAudioElement;
  private sfxAudio: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private webAudioReady = false;

  private listeners = new Set<Listener>();
  private fadeTimeout: number | null = null;
  private fadeRaf: number | null = null;
  private duckRaf: number | null = null;

  private state: AudioEngineSnapshot = {
    bgm: emptyChannel(),
    sfx: emptyChannel(),
    bgmVolume: 0.9,
    sfxVolume: 1.0,
    autoDuck: loadAutoDuck(),
    isDucking: false,
    isFadingOut: false,
    fadeDurationSec: loadFadeDuration(),
    bgmLoop: false,
  };

  constructor() {
    this.bgmAudio = new Audio();
    this.bgmAudio.preload = 'metadata';
    this.bgmAudio.volume = this.state.bgmVolume;

    this.sfxAudio = new Audio();
    this.sfxAudio.preload = 'auto';
    this.sfxAudio.volume = this.state.sfxVolume;

    this.bindAudioEvents(this.bgmAudio, 'bgm');
    this.bindAudioEvents(this.sfxAudio, 'sfx');
  }

  // Lazy-init Web Audio GainNodes inside a user gesture so fades work smoothly on iOS/Android/Desktop.
  private ensureWebAudio() {
    if (this.webAudioReady && this.audioCtx) {
      if (this.audioCtx.state === 'suspended') {
        void this.audioCtx.resume();
      }
      return true;
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return false;

    try {
      const ctx = new AudioCtx();
      const bgmSrc = ctx.createMediaElementSource(this.bgmAudio);
      const sfxSrc = ctx.createMediaElementSource(this.sfxAudio);
      const bgmGain = ctx.createGain();
      const sfxGain = ctx.createGain();

      bgmGain.gain.setValueAtTime(this.state.bgmVolume, ctx.currentTime);
      sfxGain.gain.setValueAtTime(this.state.sfxVolume, ctx.currentTime);

      bgmSrc.connect(bgmGain).connect(ctx.destination);
      sfxSrc.connect(sfxGain).connect(ctx.destination);

      // Keep native element volume at 1.0 so GainNode owns the full dynamic range.
      this.bgmAudio.volume = 1;
      this.sfxAudio.volume = 1;

      this.audioCtx = ctx;
      this.bgmGain = bgmGain;
      this.sfxGain = sfxGain;
      this.webAudioReady = true;

      if (ctx.state === 'suspended') {
        void ctx.resume();
      }
      return true;
    } catch {
      return false;
    }
  }

  private setChannelGain(channel: AudioChannel, value: number, rampSec = 0.03) {
    const clamped = Math.max(0, Math.min(1, value));
    const gainNode = channel === 'bgm' ? this.bgmGain : this.sfxGain;
    if (this.webAudioReady && this.audioCtx && gainNode) {
      const now = this.audioCtx.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      if (rampSec <= 0) {
        gainNode.gain.setValueAtTime(clamped, now);
      } else {
        gainNode.gain.linearRampToValueAtTime(clamped, now + rampSec);
      }
    } else {
      const el = channel === 'bgm' ? this.bgmAudio : this.sfxAudio;
      el.volume = clamped;
    }
  }

  private bindAudioEvents(el: HTMLAudioElement, channel: AudioChannel) {
    el.addEventListener('loadstart', () => {
      if (this.state[channel].track) {
        this.updateChannel(channel, { status: 'loading', error: null });
      }
    });

    el.addEventListener('loadedmetadata', () => {
      this.updateChannel(channel, {
        duration: Number.isFinite(el.duration) ? el.duration : 0,
      });
    });

    el.addEventListener('playing', () => {
      this.updateChannel(channel, {
        status: 'playing',
        duration: Number.isFinite(el.duration) ? el.duration : this.state[channel].duration,
        error: null,
      });
      if (channel === 'sfx' && this.state.autoDuck && this.state.bgm.status === 'playing' && !this.state.isFadingOut) {
        this.applyDuck(true);
      }
    });

    el.addEventListener('pause', () => {
      if (el.ended) return;
      if (this.state[channel].track && this.state[channel].status !== 'idle') {
        this.updateChannel(channel, { status: 'paused' });
      }
      if (channel === 'sfx') {
        this.applyDuck(false);
      }
    });

    el.addEventListener('ended', () => {
      this.updateChannel(channel, {
        status: 'idle',
        currentTime: 0,
      });
      if (channel === 'sfx') {
        this.applyDuck(false);
      }
    });

    el.addEventListener('timeupdate', () => {
      this.updateChannel(channel, {
        currentTime: el.currentTime,
        duration: Number.isFinite(el.duration) ? el.duration : this.state[channel].duration,
      });
    });

    el.addEventListener('error', () => {
      if (!this.state[channel].track) return;
      this.updateChannel(channel, {
        status: 'error',
        error: 'Gagal memuat file audio. Periksa koneksi atau coba putar ulang.',
      });
      if (channel === 'sfx') {
        this.applyDuck(false);
      }
    });
  }

  private emit() {
    const snap: AudioEngineSnapshot = {
      ...this.state,
      bgm: { ...this.state.bgm },
      sfx: { ...this.state.sfx },
    };
    this.listeners.forEach((fn) => fn(snap));
  }

  private updateChannel(channel: AudioChannel, patch: Partial<ChannelState>) {
    this.state = {
      ...this.state,
      [channel]: { ...this.state[channel], ...patch },
    };
    this.emit();
  }

  private cancelFade() {
    if (this.fadeTimeout !== null) {
      window.clearTimeout(this.fadeTimeout);
      this.fadeTimeout = null;
    }
    if (this.fadeRaf !== null) {
      window.cancelAnimationFrame(this.fadeRaf);
      this.fadeRaf = null;
    }
    if (this.webAudioReady && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.bgmGain?.gain.cancelScheduledValues(now);
      this.sfxGain?.gain.cancelScheduledValues(now);
    }
    if (this.state.isFadingOut) {
      this.state = { ...this.state, isFadingOut: false };
    }
  }

  private applyDuck(duck: boolean) {
    if (this.duckRaf !== null) {
      window.cancelAnimationFrame(this.duckRaf);
      this.duckRaf = null;
    }
    if (this.state.isFadingOut) return;

    const target = duck ? this.state.bgmVolume * DUCK_MULTIPLIER : this.state.bgmVolume;
    this.state = { ...this.state, isDucking: duck };

    if (this.webAudioReady && this.audioCtx && this.bgmGain) {
      const now = this.audioCtx.currentTime;
      const rampSec = duck ? 0.18 : 0.45;
      this.bgmGain.gain.cancelScheduledValues(now);
      this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
      this.bgmGain.gain.linearRampToValueAtTime(target, now + rampSec);
    } else {
      const startVol = this.bgmAudio.volume;
      const durationMs = duck ? 180 : 450;
      const startTime = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - startTime) / durationMs);
        this.bgmAudio.volume = Math.max(0, Math.min(1, startVol + (target - startVol) * t));
        if (t < 1) this.duckRaf = window.requestAnimationFrame(tick);
      };
      this.duckRaf = window.requestAnimationFrame(tick);
    }

    this.emit();
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  getSnapshot(): AudioEngineSnapshot {
    return {
      ...this.state,
      bgm: { ...this.state.bgm },
      sfx: { ...this.state.sfx },
    };
  }

  playTrack(track: SoundTrack, forceChannel?: AudioChannel) {
    this.ensureWebAudio();
    const channel = forceChannel ?? track.channel;
    const el = channel === 'bgm' ? this.bgmAudio : this.sfxAudio;

    if (this.state.isFadingOut) {
      this.cancelFade();
    }

    if (channel === 'bgm') {
      const target = this.state.isDucking
        ? this.state.bgmVolume * DUCK_MULTIPLIER
        : this.state.bgmVolume;
      this.setChannelGain('bgm', target, 0.04);
      el.loop = this.state.bgmLoop;
    } else {
      this.setChannelGain('sfx', this.state.sfxVolume, 0.02);
      if (this.state.autoDuck && this.state.bgm.status === 'playing') {
        this.applyDuck(true);
      }
    }

    const isSameTrack = this.state[channel].track?.id === track.id;

    // For SFX, tapping an already-playing cue restarts it immediately for rapid match moments.
    if (channel === 'sfx') {
      if (!isSameTrack || el.src !== new URL(track.src, window.location.origin).href) {
        el.src = track.src;
      }
      el.currentTime = 0;
      this.updateChannel('sfx', {
        track,
        status: 'loading',
        currentTime: 0,
        error: null,
      });
      void el.play().catch(() => {
        this.updateChannel('sfx', {
          status: 'error',
          error: 'Browser memblokir pemutaran otomatis. Tekan tombol lagi untuk memutar.',
        });
      });
      return;
    }

    // For BGM, tapping the active playing track toggles pause/resume.
    if (isSameTrack && this.state.bgm.status === 'playing') {
      el.pause();
      return;
    }

    if (isSameTrack && this.state.bgm.status === 'paused') {
      void el.play().catch(() => {
        this.updateChannel('bgm', {
          status: 'error',
          error: 'Gagal melanjutkan audio. Tekan putar ulang.',
        });
      });
      return;
    }

    el.src = track.src;
    el.currentTime = 0;
    this.updateChannel('bgm', {
      track,
      status: 'loading',
      currentTime: 0,
      duration: 0,
      error: null,
    });
    void el.play().catch(() => {
      this.updateChannel('bgm', {
        status: 'error',
        error: 'Gagal memulai audio. Tekan tombol putar kembali.',
      });
    });
  }

  toggleBgmPlayPause() {
    if (!this.state.bgm.track) return;
    this.ensureWebAudio();
    if (this.state.bgm.status === 'playing') {
      this.cancelFade();
      this.bgmAudio.pause();
    } else {
      this.cancelFade();
      const target = this.state.isDucking
        ? this.state.bgmVolume * DUCK_MULTIPLIER
        : this.state.bgmVolume;
      this.setChannelGain('bgm', target, 0.04);
      void this.bgmAudio.play().catch(() => {
        this.updateChannel('bgm', {
          status: 'error',
          error: 'Gagal memutar ulang track.',
        });
      });
    }
  }

  seekBgm(timeSeconds: number) {
    if (!this.state.bgm.track || !Number.isFinite(this.bgmAudio.duration)) return;
    const clamped = Math.max(0, Math.min(this.bgmAudio.duration, timeSeconds));
    this.bgmAudio.currentTime = clamped;
    this.updateChannel('bgm', { currentTime: clamped });
  }

  stopSfx() {
    this.sfxAudio.pause();
    this.sfxAudio.currentTime = 0;
    this.setChannelGain('sfx', this.state.sfxVolume, 0);
    this.updateChannel('sfx', { status: 'idle', currentTime: 0 });
    this.applyDuck(false);
  }

  stopAll() {
    this.cancelFade();
    if (this.duckRaf !== null) {
      window.cancelAnimationFrame(this.duckRaf);
      this.duckRaf = null;
    }
    this.bgmAudio.pause();
    this.bgmAudio.currentTime = 0;
    this.sfxAudio.pause();
    this.sfxAudio.currentTime = 0;

    this.setChannelGain('bgm', this.state.bgmVolume, 0);
    this.setChannelGain('sfx', this.state.sfxVolume, 0);

    this.state = {
      ...this.state,
      isDucking: false,
      isFadingOut: false,
      bgm: { ...this.state.bgm, status: 'idle', currentTime: 0 },
      sfx: { ...this.state.sfx, status: 'idle', currentTime: 0 },
    };
    this.emit();
  }

  // Perceptually smooth logarithmic fade-out across all active channels (BGM and SFX).
  fadeOutAll() {
    const bgmActive = this.state.bgm.status === 'playing';
    const sfxActive = this.state.sfx.status === 'playing';
    if (!bgmActive && !sfxActive) return;

    this.ensureWebAudio();
    this.cancelFade();
    if (this.duckRaf !== null) {
      window.cancelAnimationFrame(this.duckRaf);
      this.duckRaf = null;
    }

    const fadeSec = this.state.fadeDurationSec;
    this.state = { ...this.state, isFadingOut: true, isDucking: false };
    this.emit();

    const finishFade = () => {
      this.fadeTimeout = null;
      this.fadeRaf = null;

      if (bgmActive) {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      }
      if (sfxActive) {
        this.sfxAudio.pause();
        this.sfxAudio.currentTime = 0;
      }

      // Restore channel gain cleanly while paused so the next track plays at full set volume.
      this.setChannelGain('bgm', this.state.bgmVolume, 0);
      this.setChannelGain('sfx', this.state.sfxVolume, 0);

      this.state = {
        ...this.state,
        isFadingOut: false,
        isDucking: false,
        bgm: bgmActive ? { ...this.state.bgm, status: 'idle', currentTime: 0 } : this.state.bgm,
        sfx: sfxActive ? { ...this.state.sfx, status: 'idle', currentTime: 0 } : this.state.sfx,
      };
      this.emit();
    };

    if (this.webAudioReady && this.audioCtx && this.bgmGain && this.sfxGain) {
      const now = this.audioCtx.currentTime;

      const scheduleNode = (node: GainNode) => {
        const current = Math.max(0, Math.min(1, node.gain.value));
        node.gain.cancelScheduledValues(now);
        node.gain.setValueCurveAtTime(buildFadeCurve(current), now, fadeSec);
      };

      if (bgmActive) scheduleNode(this.bgmGain);
      if (sfxActive) scheduleNode(this.sfxGain);

      this.fadeTimeout = window.setTimeout(finishFade, Math.round(fadeSec * 1000) + 50);
      return;
    }

    // Fallback when Web Audio API is unavailable: same studio cosine-taper curve via rAF.
    const startBgm = this.bgmAudio.volume;
    const startSfx = this.sfxAudio.volume;
    const durationMs = fadeSec * 1000;
    const startTime = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      const curve = t >= 1 ? 0 : Math.pow(Math.cos(t * Math.PI * 0.5), 2.2);
      if (bgmActive) this.bgmAudio.volume = Math.max(0, startBgm * curve);
      if (sfxActive) this.sfxAudio.volume = Math.max(0, startSfx * curve);

      if (t < 1) {
        this.fadeRaf = window.requestAnimationFrame(step);
      } else {
        finishFade();
      }
    };

    this.fadeRaf = window.requestAnimationFrame(step);
  }

  setBgmVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.state = { ...this.state, bgmVolume: clamped };
    if (!this.state.isFadingOut) {
      const target = this.state.isDucking ? clamped * DUCK_MULTIPLIER : clamped;
      this.setChannelGain('bgm', target, 0.03);
    }
    this.emit();
  }

  setSfxVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.state = { ...this.state, sfxVolume: clamped };
    if (!this.state.isFadingOut) {
      this.setChannelGain('sfx', clamped, 0.03);
    }
    this.emit();
  }

  setFadeDuration(seconds: number) {
    const clamped = Math.max(0.5, Math.min(8, seconds));
    this.state = { ...this.state, fadeDurationSec: clamped };
    try {
      localStorage.setItem(FADE_STORAGE_KEY, String(clamped));
    } catch {
      // Ignore storage write errors.
    }
    this.emit();
  }

  setAutoDuck(enabled: boolean) {
    this.state = { ...this.state, autoDuck: enabled };
    try {
      localStorage.setItem(DUCK_STORAGE_KEY, String(enabled));
    } catch {
      // Ignore storage write errors.
    }
    if (!enabled && this.state.isDucking) {
      this.applyDuck(false);
    } else if (
      enabled &&
      this.state.sfx.status === 'playing' &&
      this.state.bgm.status === 'playing'
    ) {
      this.applyDuck(true);
    } else {
      this.emit();
    }
  }

  setBgmLoop(enabled: boolean) {
    this.bgmAudio.loop = enabled;
    this.state = { ...this.state, bgmLoop: enabled };
    this.emit();
  }
}

export const audioEngine = new MatchAudioEngine();

export async function getCachedAudioUrls(): Promise<Set<string>> {
  if (!('caches' in window)) return new Set();
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const keys = await cache.keys();
    return new Set(keys.map((req) => new URL(req.url).pathname));
  } catch {
    return new Set();
  }
}

export async function cacheTracksOffline(
  tracks: SoundTrack[],
  onProgress: (done: number, total: number) => void
): Promise<{ cached: number; failed: number }> {
  if (!('caches' in window)) {
    return { cached: 0, failed: tracks.length };
  }
  const cache = await caches.open(AUDIO_CACHE_NAME);
  let done = 0;
  let cached = 0;
  let failed = 0;

  // Batch in groups of 4 so mobile browsers stay responsive.
  const batchSize = 4;
  for (let i = 0; i < tracks.length; i += batchSize) {
    const slice = tracks.slice(i, i + batchSize);
    await Promise.all(
      slice.map(async (track) => {
        try {
          const existing = await cache.match(track.src);
          if (!existing) {
            const res = await fetch(track.src);
            if (!res.ok) throw new Error('HTTP error');
            await cache.put(track.src, res);
          }
          cached++;
        } catch {
          failed++;
        } finally {
          done++;
          onProgress(done, tracks.length);
        }
      })
    );
  }
  return { cached, failed };
}
