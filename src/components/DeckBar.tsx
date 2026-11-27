import { useEffect } from 'react';
import type { AudioEngineSnapshot } from '../audio/engine';
import {
  CloseIcon,
  DownloadIcon,
  FadeOutIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  SlidersIcon,
  StopIcon,
  VolumeIcon,
} from './Icons';

interface DeckBarProps {
  audio: AudioEngineSnapshot;
  mixerOpen: boolean;
  hideMobileBar?: boolean;
  onToggleMixer: () => void;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
  onFadeOut: () => void;
  onStopAll: () => void;
  onStopSfx: () => void;
  onBgmVolume: (vol: number) => void;
  onSfxVolume: (vol: number) => void;
  onFadeDuration: (seconds: number) => void;
  onToggleLoop: (enabled: boolean) => void;
  onToggleAutoDuck: (enabled: boolean) => void;
  cachedCount: number;
  totalCount: number;
  cachingProgress: { done: number; total: number } | null;
  onCacheAllOffline: () => void;
}

function formatTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return '00:00';
  const total = Math.floor(sec);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function DeckBar({
  audio,
  mixerOpen,
  hideMobileBar = false,
  onToggleMixer,
  onTogglePlayPause,
  onSeek,
  onFadeOut,
  onStopAll,
  onStopSfx,
  onBgmVolume,
  onSfxVolume,
  onFadeDuration,
  onToggleLoop,
  onToggleAutoDuck,
  cachedCount,
  totalCount,
  cachingProgress,
  onCacheAllOffline,
}: DeckBarProps) {
  useEffect(() => {
    if (!mixerOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onToggleMixer();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mixerOpen, onToggleMixer]);

  const bgm = audio.bgm;
  const sfx = audio.sfx;
  const hasActiveAudio =
    bgm.status === 'playing' ||
    bgm.status === 'loading' ||
    sfx.status === 'playing' ||
    sfx.status === 'loading';

  const hasTrackOrActive = Boolean(bgm.track) || hasActiveAudio;
  const duration = bgm.duration > 0 ? bgm.duration : 0;

  return (
    <div
      className={`deck-shell ${hideMobileBar ? 'is-mobile-hidden' : ''} ${!hasTrackOrActive ? 'is-mobile-idle' : ''} ${mixerOpen ? 'has-mixer' : ''}`}
      role="region"
      aria-label="Kontrol pemutar audio pertandingan"
    >
      {mixerOpen && (
        <div className="mixer-drawer" role="dialog" aria-label="Pengaturan mixer dan offline cache">
          <div className="mixer-drawer__head">
            <h3 className="mixer-drawer__title">Mixer Audio & Offline</h3>
            <button
              type="button"
              className="icon-btn"
              onClick={onToggleMixer}
              aria-label="Tutup panel mixer"
            >
              <CloseIcon size={18} />
            </button>
          </div>

          <div className="mixer-sliders">
            <div className="mixer-row">
              <label htmlFor="bgm-vol-slider" className="mixer-row__label">
                <VolumeIcon size={15} />
                <span>Volume BGM</span>
                {audio.isDucking && <span className="duck-tag">Ducking</span>}
              </label>
              <div className="mixer-row__control">
                <input
                  id="bgm-vol-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(audio.bgmVolume * 100)}
                  onChange={(e) => onBgmVolume(Number(e.target.value) / 100)}
                />
                <span className="mono-num mixer-val">{Math.round(audio.bgmVolume * 100)}%</span>
              </div>
            </div>

            <div className="mixer-row">
              <label htmlFor="sfx-vol-slider" className="mixer-row__label">
                <VolumeIcon size={15} />
                <span>Volume SFX</span>
              </label>
              <div className="mixer-row__control">
                <input
                  id="sfx-vol-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(audio.sfxVolume * 100)}
                  onChange={(e) => onSfxVolume(Number(e.target.value) / 100)}
                />
                <span className="mono-num mixer-val">{Math.round(audio.sfxVolume * 100)}%</span>
              </div>
            </div>
          </div>

          <div className="mixer-toggles">
            <button
              type="button"
              role="switch"
              aria-checked={audio.autoDuck}
              className={`toggle-chip ${audio.autoDuck ? 'is-on' : ''}`}
              onClick={() => onToggleAutoDuck(!audio.autoDuck)}
            >
              Auto-Duck BGM saat SFX: {audio.autoDuck ? 'Aktif' : 'Nonaktif'}
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={audio.bgmLoop}
              className={`toggle-chip ${audio.bgmLoop ? 'is-on' : ''}`}
              onClick={() => onToggleLoop(!audio.bgmLoop)}
            >
              <RepeatIcon size={14} />
              <span>Loop BGM: {audio.bgmLoop ? 'Aktif' : 'Nonaktif'}</span>
            </button>

            <div className="fade-dur-group" role="group" aria-label="Durasi transisi Fade Out">
              <span className="fade-dur-label">Fade Out:</span>
              {[1.5, 3, 5].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  className={`fade-dur-btn mono-num ${audio.fadeDurationSec === sec ? 'is-active' : ''}`}
                  aria-pressed={audio.fadeDurationSec === sec}
                  onClick={() => onFadeDuration(sec)}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          <div className="offline-box">
            <div className="offline-box__info">
              <span className="offline-box__title">Penyimpanan Offline HP</span>
              <span className="offline-box__meta mono-num">
                {cachingProgress
                  ? `Menyimpan ${cachingProgress.done} / ${cachingProgress.total} file...`
                  : `${cachedCount} / ${totalCount} file siap tanpa internet`}
              </span>
            </div>
            <button
              type="button"
              className="btn-secondary"
              disabled={cachingProgress !== null || cachedCount === totalCount}
              onClick={onCacheAllOffline}
            >
              <DownloadIcon size={15} />
              <span>
                {cachedCount === totalCount
                  ? 'Semua Tersimpan'
                  : cachingProgress
                    ? 'Menyimpan...'
                    : 'Simpan Offline'}
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="deck-bar">
        <div className="deck-bar__left">
          <button
            type="button"
            className={`deck-play-btn ${bgm.status === 'playing' ? 'is-playing' : ''}`}
            onClick={onTogglePlayPause}
            disabled={!bgm.track}
            aria-label={bgm.status === 'playing' ? 'Jeda musik latar' : 'Putar musik latar'}
          >
            {bgm.status === 'playing' ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>

          <div className="deck-track-info">
            <div className="deck-track-info__top">
              <span className="deck-track-title">
                {bgm.track ? bgm.track.title : 'Deck BGM siap dipakai'}
              </span>
              {sfx.status === 'playing' && sfx.track && (
                <button
                  type="button"
                  className="sfx-pill"
                  onClick={onStopSfx}
                  title="Ketuk untuk menghentikan SFX"
                >
                  <span>SFX: {sfx.track.quickPadLabel ?? sfx.track.title}</span>
                  <StopIcon size={11} />
                </button>
              )}
            </div>

            <div className="deck-scrub-row">
              <span className="mono-num deck-time">{formatTime(bgm.currentTime)}</span>
              <span className="mono-num deck-time-sep" aria-hidden="true">/</span>
              <input
                type="range"
                className="deck-scrubber"
                aria-label="Posisi putar track BGM"
                min={0}
                max={duration || 100}
                step={0.5}
                value={duration ? Math.min(bgm.currentTime, duration) : 0}
                disabled={!bgm.track || duration === 0}
                onChange={(e) => onSeek(Number(e.target.value))}
              />
              <span className="mono-num deck-time">{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="deck-bar__controls">
          <button
            type="button"
            className={`icon-btn ${mixerOpen ? 'is-active' : ''}`}
            onClick={onToggleMixer}
            aria-label="Buka pengaturan mixer dan cache offline"
            aria-expanded={mixerOpen}
          >
            <SlidersIcon size={18} />
          </button>

          <button
            type="button"
            className={`btn-fade ${audio.isFadingOut ? 'is-fading' : ''}`}
            onClick={onFadeOut}
            disabled={!hasActiveAudio || audio.isFadingOut}
            title={`Turunkan volume semua audio perlahan ke mati (${audio.fadeDurationSec} detik)`}
          >
            <FadeOutIcon size={16} />
            <span className="hide-xs">{audio.isFadingOut ? 'Fading...' : 'Fade Out'}</span>
          </button>

          <button
            type="button"
            className={`btn-stop-all ${hasActiveAudio ? 'is-armed' : ''}`}
            onClick={onStopAll}
            disabled={!hasActiveAudio}
            aria-label="Hentikan semua audio segera"
          >
            <StopIcon size={15} />
            <span>STOP</span>
          </button>
        </div>
      </div>
    </div>
  );
}
