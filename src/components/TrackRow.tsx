import type { AudioEngineSnapshot } from '../audio/engine';
import type { AudioChannel, SoundTrack } from '../data/catalog';
import { CheckIcon, PadGridIcon, PauseIcon, PlayIcon, StarIcon } from './Icons';

interface TrackRowProps {
  track: SoundTrack;
  audio: AudioEngineSnapshot;
  isFavorite: boolean;
  isInQuickPad: boolean;
  isOfflineCached: boolean;
  onPlay: (track: SoundTrack, forceChannel?: AudioChannel) => void;
  onToggleFavorite: (trackId: string) => void;
  onToggleQuickPad: (trackId: string) => void;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TrackRow({
  track,
  audio,
  isFavorite,
  isInQuickPad,
  isOfflineCached,
  onPlay,
  onToggleFavorite,
  onToggleQuickPad,
}: TrackRowProps) {
  const activeOnBgm = audio.bgm.track?.id === track.id;
  const activeOnSfx = audio.sfx.track?.id === track.id;
  const activeChannel = activeOnSfx ? audio.sfx : activeOnBgm ? audio.bgm : null;

  const isPlaying = activeChannel?.status === 'playing';
  const isLoading = activeChannel?.status === 'loading';
  const isError = activeChannel?.status === 'error';

  const progressPct =
    activeChannel && activeChannel.duration > 0 && (isPlaying || activeChannel.status === 'paused')
      ? Math.min(100, (activeChannel.currentTime / activeChannel.duration) * 100)
      : 0;

  return (
    <article
      className={`track-row ${isPlaying ? 'is-playing' : ''} ${isError ? 'is-error' : ''}`}
      data-channel={track.channel}
    >
      <button
        type="button"
        className={`track-play-btn ${isPlaying ? 'is-active' : ''}`}
        onClick={() => onPlay(track)}
        aria-label={`${isPlaying ? 'Jeda' : 'Putar'} ${track.title}`}
        aria-pressed={isPlaying}
      >
        {isLoading ? (
          <span className="spinner-dot" aria-hidden="true" />
        ) : isPlaying && track.channel === 'bgm' ? (
          <PauseIcon size={18} />
        ) : (
          <PlayIcon size={18} />
        )}
      </button>

      <div className="track-row__body">
        <button
          type="button"
          className="track-row__trigger"
          onClick={() => onPlay(track)}
        >
          <span className="track-row__title">{track.title}</span>
          <span className="track-row__meta">
            <span className={`channel-tag ${track.channel === 'sfx' ? 'is-sfx' : 'is-bgm'}`}>
              {track.channel.toUpperCase()}
            </span>
            <span className="track-row__sub">{track.subtitle}</span>
            <span className="meta-sep" aria-hidden="true">/</span>
            <span className="mono-num track-row__size">{formatBytes(track.sizeBytes)}</span>
            {track.shortcut && (
              <span className="desktop-kbd-meta">
                <span className="meta-sep" aria-hidden="true">/</span>
                <kbd className="inline-kbd">{track.shortcut}</kbd>
              </span>
            )}
          </span>
        </button>

        {isError && activeChannel?.error && (
          <div className="track-row__error" role="alert">
            <span>{activeChannel.error}</span>
            <button type="button" className="btn-link-retry" onClick={() => onPlay(track)}>
              Coba Ulang
            </button>
          </div>
        )}

        {progressPct > 0 && (
          <div className="track-row__progress" aria-hidden="true">
            <div className="track-row__progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        )}
      </div>

      <div className="track-row__actions">
        {isOfflineCached && (
          <span className="offline-mark" title="Tersimpan di cache offline perangkat">
            <CheckIcon size={13} />
          </span>
        )}

        <button
          type="button"
          className={`icon-btn pad-pin-btn ${isInQuickPad ? 'is-pinned' : ''}`}
          onClick={() => onToggleQuickPad(track.id)}
          aria-label={
            isInQuickPad
              ? `Hapus ${track.title} dari Quick Pad`
              : `Tambahkan ${track.title} ke Quick Pad`
          }
          aria-pressed={isInQuickPad}
          title={isInQuickPad ? 'Terpasang di Quick Pad (ketuk untuk hapus)' : 'Tambahkan ke Quick Pad'}
        >
          <PadGridIcon size={17} />
        </button>

        <button
          type="button"
          className={`icon-btn fav-btn ${isFavorite ? 'is-fav' : ''}`}
          onClick={() => onToggleFavorite(track.id)}
          aria-label={isFavorite ? `Hapus ${track.title} dari favorit` : `Tambahkan ${track.title} ke favorit`}
          aria-pressed={isFavorite}
          title={isFavorite ? 'Hapus dari Favorit' : 'Tambahkan ke Favorit'}
        >
          <StarIcon size={18} filled={isFavorite} />
        </button>
      </div>
    </article>
  );
}
