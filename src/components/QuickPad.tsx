import type { AudioEngineSnapshot } from '../audio/engine';
import type { SoundTrack } from '../data/catalog';
import { QUICK_PAD_TRACKS } from '../data/catalog';
import { PlayIcon, StopIcon } from './Icons';

interface QuickPadProps {
  audio: AudioEngineSnapshot;
  onTrigger: (track: SoundTrack) => void;
  onStopSfx: () => void;
  onToggleAutoDuck: (enabled: boolean) => void;
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
  audio,
  onTrigger,
  onStopSfx,
  onToggleAutoDuck,
  compact = false,
}: QuickPadProps) {
  return (
    <section className={`quick-pad ${compact ? 'quick-pad--compact' : ''}`} aria-labelledby="quick-pad-heading">
      <div className="section-head">
        <div>
          <h2 id="quick-pad-heading" className="section-title">Quick Pad SFX</h2>
          <p className="section-sub">Ketuk langsung untuk efek momen pertandingan.</p>
        </div>

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
          <span className="duck-switch__label">Auto-Duck</span>
        </button>
      </div>

      <div className="pad-grid">
        {QUICK_PAD_TRACKS.map((track) => {
          const channelState = track.channel === 'sfx' ? audio.sfx : audio.bgm;
          const isCurrent = channelState.track?.id === track.id;
          const isPlaying = isCurrent && channelState.status === 'playing';
          const isLoading = isCurrent && channelState.status === 'loading';
          const progress =
            isPlaying && channelState.duration > 0
              ? Math.min(100, (channelState.currentTime / channelState.duration) * 100)
              : 0;

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
              <span className="pad-btn__label">{track.quickPadLabel ?? track.title}</span>
              <span className="pad-btn__meta">
                {isLoading
                  ? 'Memuat...'
                  : isPlaying
                    ? 'Sedang bunyi'
                    : (track.quickPadLabel && PAD_HINTS[track.quickPadLabel]) || track.subtitle}
              </span>
              <span className="pad-btn__bar" aria-hidden="true">
                <span className="pad-btn__bar-fill" style={{ width: `${progress}%` }} />
              </span>
            </button>
          );
        })}
      </div>

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
