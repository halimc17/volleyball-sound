import { useId, useState } from 'react';
import type { AudioEngineSnapshot } from '../audio/engine';
import type { SoundTrack } from '../data/catalog';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CloseIcon,
  PlayIcon,
  PlusIcon,
  ResetIcon,
  StopIcon,
} from './Icons';

interface QuickPadProps {
  tracks: SoundTrack[];
  audio: AudioEngineSnapshot;
  isCustomized: boolean;
  onTrigger: (track: SoundTrack) => void;
  onStopSfx: () => void;
  onToggleAutoDuck: (enabled: boolean) => void;
  onRemoveTrack: (trackId: string) => void;
  onMoveTrack: (trackId: string, direction: -1 | 1) => void;
  onResetDefault: () => void;
  onGoAddSound: () => void;
  compact?: boolean;
}

const PAD_HINTS: Record<string, string> = {
  'Service Ace': 'Official Ace Cue',
  'Boom Spike': 'Here Comes The Boom 16s',
  'Monster Block': 'Block Impact 19s',
  FireBall: 'FireBall Hit 18s',
  'Great Rally': 'This Is Volleyball',
  'Match Point': 'Stand Up Clap',
  'Check Pos': 'Left Right Cue',
  'Time Out': 'Official PBVSI 30s',
};

export function QuickPad({
  tracks,
  audio,
  isCustomized,
  onTrigger,
  onStopSfx,
  onToggleAutoDuck,
  onRemoveTrack,
  onMoveTrack,
  onResetDefault,
  onGoAddSound,
  compact = false,
}: QuickPadProps) {
  const uid = useId();
  const [editMode, setEditMode] = useState(false);

  return (
    <section
      className={`quick-pad ${compact ? 'quick-pad--compact' : ''}`}
      aria-labelledby={`${uid}-heading`}
    >
      <div className="section-head">
        <div>
          <h2 id={`${uid}-heading`} className="section-title">Quick Pad SFX</h2>
          <p className="section-sub">
            {editMode
              ? 'Atur urutan atau hapus sound dari Quick Pad.'
              : 'Ketuk langsung untuk efek momen pertandingan.'}
          </p>
        </div>

        <button
          type="button"
          className={`btn-secondary btn-compact ${editMode ? 'is-editing' : ''}`}
          aria-expanded={editMode}
          onClick={() => setEditMode((v) => !v)}
        >
          {editMode ? 'Selesai' : 'Atur Pad'}
        </button>
      </div>

      <div className="pad-toolbar">
        <button
          type="button"
          role="switch"
          aria-checked={audio.autoDuck}
          className={`duck-switch ${audio.autoDuck ? 'is-on' : ''}`}
          onClick={() => onToggleAutoDuck(!audio.autoDuck)}
          title="Otomatis mengecilkan volume BGM saat SFX diputar"
        >
          <span className="duck-switch__track" aria-hidden="true">
            <span className="duck-switch__thumb" />
          </span>
          <span className="duck-switch__label">Auto-Duck BGM</span>
        </button>

        <span className="count-pill mono-num">{tracks.length} pad</span>
      </div>

      {editMode && (
        <div className="pad-edit-bar">
          <button type="button" className="btn-primary btn-compact" onClick={onGoAddSound}>
            <PlusIcon size={15} />
            <span>Tambah dari Library</span>
          </button>
          {isCustomized && (
            <button
              type="button"
              className="btn-secondary btn-compact"
              onClick={onResetDefault}
            >
              <ResetIcon size={14} />
              <span>Reset Default</span>
            </button>
          )}
        </div>
      )}

      {tracks.length === 0 ? (
        <div className="empty-state" role="status">
          <h3 className="empty-state__title">Quick Pad masih kosong</h3>
          <p className="empty-state__desc">
            Tambahkan sound favorit dari tab Library dengan menekan ikon kotak Quick Pad pada baris lagu, atau kembalikan 8 pad bawaan.
          </p>
          <div className="empty-state__actions">
            <button type="button" className="btn-primary" onClick={onGoAddSound}>
              <PlusIcon size={15} />
              <span>Pilih dari Library</span>
            </button>
            <button type="button" className="btn-secondary" onClick={onResetDefault}>
              <ResetIcon size={15} />
              <span>Reset Default</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="pad-grid">
          {tracks.map((track, idx) => {
            const channelState = track.channel === 'sfx' ? audio.sfx : audio.bgm;
            const isCurrent = channelState.track?.id === track.id;
            const isPlaying = isCurrent && channelState.status === 'playing';
            const isLoading = isCurrent && channelState.status === 'loading';
            const progress =
              isPlaying && channelState.duration > 0
                ? Math.min(100, (channelState.currentTime / channelState.duration) * 100)
                : 0;
            const label = track.quickPadLabel ?? track.title;
            const hint =
              (track.quickPadLabel && PAD_HINTS[track.quickPadLabel]) || track.subtitle;

            if (editMode) {
              return (
                <div key={track.id} className="pad-card-edit">
                  <div className="pad-btn__top">
                    <span className="pad-btn__channel">{track.channel.toUpperCase()}</span>
                    <span className="mono-num pad-order-num">#{idx + 1}</span>
                  </div>
                  <div className="pad-btn__label pad-label-clamp">{label}</div>
                  <div className="pad-edit-controls">
                    <button
                      type="button"
                      className="pad-ctrl-btn"
                      disabled={idx === 0}
                      onClick={() => onMoveTrack(track.id, -1)}
                      aria-label={`Geser ${label} ke posisi sebelumnya`}
                      title="Geser kiri / naik"
                    >
                      <ArrowLeftIcon size={16} />
                    </button>
                    <button
                      type="button"
                      className="pad-ctrl-btn"
                      disabled={idx === tracks.length - 1}
                      onClick={() => onMoveTrack(track.id, 1)}
                      aria-label={`Geser ${label} ke posisi berikutnya`}
                      title="Geser kanan / turun"
                    >
                      <ArrowRightIcon size={16} />
                    </button>
                    <button
                      type="button"
                      className="pad-ctrl-btn is-danger"
                      onClick={() => onRemoveTrack(track.id)}
                      aria-label={`Hapus ${label} dari Quick Pad`}
                      title="Hapus dari Quick Pad"
                    >
                      <CloseIcon size={16} />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={track.id}
                type="button"
                className={`pad-btn ${isPlaying ? 'is-playing' : ''} ${track.channel === 'bgm' ? 'is-bgm' : ''}`}
                onClick={() => onTrigger(track)}
                aria-pressed={isPlaying}
              >
                <span className="pad-btn__top">
                  <span className="pad-btn__channel">{track.channel.toUpperCase()}</span>
                  {track.shortcut && <kbd className="pad-btn__kbd">{track.shortcut}</kbd>}
                </span>
                <span className="pad-btn__label pad-label-clamp">{label}</span>
                <span className="pad-btn__meta">
                  {isLoading ? 'Memuat...' : isPlaying ? 'Sedang bunyi' : hint}
                </span>
                <span className="pad-btn__bar" aria-hidden="true">
                  <span className="pad-btn__bar-fill" style={{ width: `${progress}%` }} />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {audio.sfx.status === 'playing' && audio.sfx.track && (
        <div className="sfx-live-strip" role="status" aria-live="polite">
          <div className="sfx-live-strip__info">
            <PlayIcon size={14} />
            <span className="sfx-live-strip__name">{audio.sfx.track.title}</span>
          </div>
          <button type="button" className="btn-ghost-danger" onClick={onStopSfx}>
            <StopIcon size={14} />
            <span>Hentikan SFX</span>
          </button>
        </div>
      )}
    </section>
  );
}
