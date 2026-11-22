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
  bgmLoop: boolean;
}

type Listener = (snapshot: AudioEngineSnapshot) => void;

const DUCK_MULTIPLIER = 0.22;
const FADE_OUT_MS = 1200;

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
  private listeners = new Set<Listener>();
  private fadeTimer: number | null = null;
  private duckTimer: number | null = null;

  private state: AudioEngineSnapshot = {
    bgm: emptyChannel(),
    sfx: emptyChannel(),
    bgmVolume: 0.9,
    sfxVolume: 1.0,
    autoDuck: true,
    isDucking: false,
    isFadingOut: false,
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
      if (channel === 'sfx' && this.state.autoDuck && this.state.bgm.status === 'playing') {
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
    if (this.fadeTimer !== null) {
      window.clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
    if (this.state.isFadingOut) {
      this.state = { ...this.state, isFadingOut: false };
    }
  }

  private applyDuck(duck: boolean) {
    if (this.duckTimer !== null) {
      window.clearInterval(this.duckTimer);
      this.duckTimer = null;
    }
    if (this.state.isFadingOut) return;

    const target = duck ? this.state.bgmVolume * DUCK_MULTIPLIER : this.state.bgmVolume;
    this.state = { ...this.state, isDucking: duck };

    const startVol = this.bgmAudio.volume;
    const steps = 10;
    let step = 0;
    this.duckTimer = window.setInterval(() => {
      step++;
      const ratio = step / steps;
      const next = startVol + (target - startVol) * ratio;
      this.bgmAudio.volume = Math.max(0, Math.min(1, next));
      if (step >= steps) {
        if (this.duckTimer !== null) {
          window.clearInterval(this.duckTimer);
          this.duckTimer = null;
        }
      }
    }, 22);

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
    const channel = forceChannel ?? track.channel;
    const el = channel === 'bgm' ? this.bgmAudio : this.sfxAudio;

    if (channel === 'bgm') {
      this.cancelFade();
      el.volume = this.state.isDucking
        ? this.state.bgmVolume * DUCK_MULTIPLIER
        : this.state.bgmVolume;
      el.loop = this.state.bgmLoop;
    } else {
      el.volume = this.state.sfxVolume;
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
    if (this.state.bgm.status === 'playing') {
      this.cancelFade();
      this.bgmAudio.pause();
    } else {
      this.cancelFade();
      this.bgmAudio.volume = this.state.isDucking
        ? this.state.bgmVolume * DUCK_MULTIPLIER
        : this.state.bgmVolume;
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
    this.updateChannel('sfx', { status: 'idle', currentTime: 0 });
    this.applyDuck(false);
  }

  stopAll() {
    this.cancelFade();
    if (this.duckTimer !== null) {
      window.clearInterval(this.duckTimer);
      this.duckTimer = null;
    }
    this.bgmAudio.pause();
    this.bgmAudio.currentTime = 0;
    this.bgmAudio.volume = this.state.bgmVolume;

    this.sfxAudio.pause();
    this.sfxAudio.currentTime = 0;
    this.sfxAudio.volume = this.state.sfxVolume;

    this.state = {
      ...this.state,
      isDucking: false,
      isFadingOut: false,
      bgm: { ...this.state.bgm, status: 'idle', currentTime: 0 },
      sfx: { ...this.state.sfx, status: 'idle', currentTime: 0 },
    };
    this.emit();
  }

  fadeOutBgm() {
    if (this.state.bgm.status !== 'playing') {
      if (this.state.sfx.status === 'playing') this.stopSfx();
      return;
    }
    this.cancelFade();
    this.state = { ...this.state, isFadingOut: true };
    this.emit();

    const startVol = this.bgmAudio.volume;
    const steps = 24;
    const stepMs = FADE_OUT_MS / steps;
    let step = 0;

    this.fadeTimer = window.setInterval(() => {
      step++;
      const t = step / steps;
      const eased = (1 - t) * (1 - t);
      this.bgmAudio.volume = Math.max(0, startVol * eased);

      if (step >= steps) {
        this.cancelFade();
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
        this.bgmAudio.volume = this.state.bgmVolume;
        this.state = {
          ...this.state,
          isFadingOut: false,
          bgm: { ...this.state.bgm, status: 'idle', currentTime: 0 },
        };
        this.emit();
      }
    }, stepMs);
  }

  setBgmVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.state = { ...this.state, bgmVolume: clamped };
    if (!this.state.isFadingOut) {
      this.bgmAudio.volume = this.state.isDucking ? clamped * DUCK_MULTIPLIER : clamped;
    }
    this.emit();
  }

  setSfxVolume(vol: number) {
    const clamped = Math.max(0, Math.min(1, vol));
    this.state = { ...this.state, sfxVolume: clamped };
    this.sfxAudio.volume = clamped;
    this.emit();
  }

  setAutoDuck(enabled: boolean) {
    this.state = { ...this.state, autoDuck: enabled };
    if (!enabled && this.state.isDucking) {
      this.applyDuck(false);
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
    const cache = await caches.open('vsound-audio-v1');
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
  const cache = await caches.open('vsound-audio-v1');
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
