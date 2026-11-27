import type { AudioEngineSnapshot } from '../audio/engine';
import { FadeOutIcon, PauseIcon, PlayIcon, SlidersIcon, StopIcon } from './Icons';

interface MobileHeroDeckProps {
  audio: AudioEngineSnapshot;
  mixerOpen: boolean;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
  onFadeOut: () => void;
  onStopAll: () => void;
  onStopSfx: () => void;
  onToggleMixer: () => void;
}

const DOT_COUNT = 24;

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '00:00';
  const total = Math.floor(sec);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function MobileHeroDeck({
  audio,
  mixerOpen,
  onTogglePlayPause,
  onSeek,
  onFadeOut,
  onStopAll,
  onStopSfx,
  onToggleMixer,
}: MobileHeroDeckProps) {
  const { bgm, sfx } = audio;
  const isPlaying = bgm.status === 'playing';
  const isAnyPlaying =
    bgm.status === 'playing' ||
    bgm.status === 'loading' ||
    sfx.status === 'playing' ||
    sfx.status === 'loading';

  const duration = bgm.duration > 0 ? bgm.duration : 0;
  const ratio = duration > 0 ? Math.min(1, Math.max(0, bgm.currentTime / duration)) : 0;
  const litDots = Math.round(ratio * DOT_COUNT);

  return (
    <section className="hero-deck" aria-label="Konsol pemutar audio utama">
      <div className="hero-deck__top">
        <div className="hero-deck__status">
          {isAnyPlaying && <span className="hero-deck__dot" aria-hidden="true" />}
          <span>{isAnyPlaying ? 'LIVE DECK' : 'BGM DECK'}</span>
        </div>

        {sfx.status === 'playing' && sfx.track ? (
          <button
            type="button"
            className="hero-deck__sfx-pill"
            onClick={onStopSfx}
            title="Ketuk untuk menghentikan SFX"
          >
            <span>SFX: {sfx.track.quickPadLabel ?? sfx.track.title}</span>
            <StopIcon size={11} />
          </button>
        ) : (
          <span className="hero-deck__fade-badge mono-num">FADE {audio.fadeDurationSec}s</span>
        )}
      </div>

      <div className="hero-deck__body">
        <div className="hero-deck__title">
          {bgm.track ? bgm.track.title : 'Siap memutar audio'}
        </div>

        <div className="hero-deck__time mono-num">
          <span className="hero-deck__time-now">{formatTime(bgm.currentTime)}</span>
          <span className="hero-deck__time-total"> / {formatTime(duration)}</span>
        </div>

        <div className="hero-deck__matrix-wrap">
          <div className="hero-deck__matrix" aria-hidden="true">
            {Array.from({ length: DOT_COUNT }, (_, idx) => (
              <span
                key={idx}
                className={`hero-deck__matrix-dot ${idx < litDots ? 'is-lit' : ''}`}
              />
            ))}
          </div>
          <input
            type="range"
            className="hero-deck__scrubber"
            aria-label="Posisi putar track BGM"
            min={0}
            max={duration || 100}
            step={0.5}
            value={duration ? Math.min(bgm.currentTime, duration) : 0}
            disabled={!bgm.track || duration === 0}
            onChange={(e) => onSeek(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="hero-deck__actions">
        <button
          type="button"
          className={`hero-deck__play ${isPlaying ? 'is-playing' : ''}`}
          onClick={onTogglePlayPause}
          disabled={!bgm.track}
          aria-label={isPlaying ? 'Jeda musik latar' : 'Putar musik latar'}
        >
          {isPlaying ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
        </button>

        <button
          type="button"
          className={`hero-deck__btn ${audio.isFadingOut ? 'is-fading' : ''}`}
          onClick={onFadeOut}
          disabled={!isAnyPlaying || audio.isFadingOut}
          title={`Turunkan volume semua audio perlahan ke mati (${audio.fadeDurationSec} detik)`}
        >
          <FadeOutIcon size={15} />
          <span>{audio.isFadingOut ? 'Fading...' : 'Fade Out'}</span>
        </button>

        <button
          type="button"
          className={`hero-deck__icon-btn ${mixerOpen ? 'is-active' : ''}`}
          onClick={onToggleMixer}
          aria-label="Buka pengaturan mixer dan cache offline"
          aria-expanded={mixerOpen}
        >
          <SlidersIcon size={17} />
        </button>

        <button
          type="button"
          className={`hero-deck__stop ${isAnyPlaying ? 'is-armed' : ''}`}
          onClick={onStopAll}
          disabled={!isAnyPlaying}
          aria-label="Hentikan semua audio segera"
        >
          <StopIcon size={14} />
          <span>STOP</span>
        </button>
      </div>
    </section>
  );
}
