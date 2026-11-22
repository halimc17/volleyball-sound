import { useEffect, useMemo, useRef, useState } from 'react';
import {
  audioEngine,
  cacheTracksOffline,
  getCachedAudioUrls,
  type AudioEngineSnapshot,
} from './audio/engine';
import {
  CATEGORIES,
  DEFAULT_MC_SCRIPT,
  TRACKS,
  type AudioChannel,
  type CategoryId,
  type SoundTrack,
} from './data/catalog';
import { DeckBar } from './components/DeckBar';
import {
  BrandMark,
  CloseIcon,
  DownloadIcon,
  LibraryIcon,
  MicScriptIcon,
  MoonIcon,
  PadGridIcon,
  SearchIcon,
  StarIcon,
  SunIcon,
} from './components/Icons';
import { McScriptPanel, type McScriptData } from './components/McScriptPanel';
import { QuickPad } from './components/QuickPad';
import { TrackRow } from './components/TrackRow';

type MobileTab = 'pad' | 'library' | 'favorites' | 'mc';
type DesktopRightTab = 'pad' | 'mc';
type LibraryFilter = 'all' | 'favorites' | CategoryId;
type ChannelFilter = 'all' | AudioChannel;
type ThemeMode = 'light' | 'dark';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const FAV_STORAGE_KEY = 'vsound-favorites-v1';
const THEME_STORAGE_KEY = 'vsound-theme-v1';
const MC_STORAGE_KEY = 'vsound-mc-script-v1';

function loadMcScript(): McScriptData {
  try {
    const raw = localStorage.getItem(MC_STORAGE_KEY);
    if (!raw) return DEFAULT_MC_SCRIPT;
    return { ...DEFAULT_MC_SCRIPT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_MC_SCRIPT;
  }
}

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAV_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // Ignore storage read failures.
  }
  return 'light';
}

export function App() {
  const [audio, setAudio] = useState<AudioEngineSnapshot>(() => audioEngine.getSnapshot());
  const [theme, setTheme] = useState<ThemeMode>(loadTheme);
  const [mobileTab, setMobileTab] = useState<MobileTab>('pad');
  const [desktopRightTab, setDesktopRightTab] = useState<DesktopRightTab>('pad');
  const [selectedFilter, setSelectedFilter] = useState<LibraryFilter>('all');
  const [channelFilter, setChannelFilter] = useState<ChannelFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [mcScript, setMcScript] = useState<McScriptData>(loadMcScript);
  const [mixerOpen, setMixerOpen] = useState(false);
  const [cachedUrls, setCachedUrls] = useState<Set<string>>(() => new Set());
  const [cachingProgress, setCachingProgress] = useState<{ done: number; total: number } | null>(null);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [shortcutFeedback, setShortcutFeedback] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const feedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return audioEngine.subscribe(setAudio);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'dark' ? '#0B111B' : '#0A2540');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage write failures.
    }
  }, [theme]);

  useEffect(() => {
    void getCachedAudioUrls().then(setCachedUrls);
  }, []);

  useEffect(() => {
    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
  }, []);

  // Keyboard shortcuts matching referee-pbvsi.my.id plus Time Out & Stop All.
  useEffect(() => {
    function announceShortcut(label: string) {
      setShortcutFeedback(label);
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
      feedbackTimerRef.current = window.setTimeout(() => setShortcutFeedback(null), 1600);
    }

    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (!e.shiftKey) return;

      const key = e.key.toLowerCase();
      if (key === 'x') {
        e.preventDefault();
        audioEngine.stopAll();
        announceShortcut('Stop All (Shift+X)');
        return;
      }

      let matchedShortcut: string | null = null;
      if (key === 'a') matchedShortcut = 'Shift+A';
      else if (key === 's') matchedShortcut = 'Shift+S';
      else if (key === 'b') matchedShortcut = 'Shift+B';
      else if (key === 'f') matchedShortcut = 'Shift+F';
      else if (key === 'g') matchedShortcut = 'Shift+G';
      else if (key === 'c') matchedShortcut = 'Shift+C';
      else if (key === 't') matchedShortcut = 'Shift+T';
      else if (e.code === 'Digit1') matchedShortcut = 'Shift+1';

      if (!matchedShortcut) return;
      const track = TRACKS.find((t) => t.shortcut === matchedShortcut);
      if (track) {
        e.preventDefault();
        audioEngine.playTrack(track);
        announceShortcut(`${track.quickPadLabel ?? track.title} (${matchedShortcut})`);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const favoriteSet = useMemo(() => new Set(favorites), [favorites]);

  function updateMcField<K extends keyof McScriptData>(key: K, value: string) {
    setMcScript((prev) => {
      const next = { ...prev, [key]: value };
      try {
        localStorage.setItem(MC_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage write failures.
      }
      return next;
    });
  }

  function toggleFavorite(trackId: string) {
    setFavorites((prev) => {
      const next = prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId];
      try {
        localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage write failures.
      }
      return next;
    });
  }

  function handlePlay(track: SoundTrack, forceChannel?: AudioChannel) {
    audioEngine.playTrack(track, forceChannel);
    // Refresh offline badge once the browser caches a played track via Service Worker.
    window.setTimeout(() => {
      void getCachedAudioUrls().then(setCachedUrls);
    }, 1500);
  }

  async function handleCacheAllOffline() {
    if (cachingProgress) return;
    setCachingProgress({ done: 0, total: TRACKS.length });
    await cacheTracksOffline(TRACKS, (done, total) => {
      setCachingProgress({ done, total });
    });
    const updated = await getCachedAudioUrls();
    setCachedUrls(updated);
    setCachingProgress(null);
  }

  async function handleInstallPwa() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === 'accepted') {
      setInstallEvent(null);
    }
  }

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { all: TRACKS.length, favorites: favorites.length };
    for (const cat of CATEGORIES) {
      map[cat.id] = TRACKS.filter((t) => t.categoryId === cat.id).length;
    }
    return map;
  }, [favorites.length]);

  const effectiveFilter: LibraryFilter =
    mobileTab === 'favorites' ? 'favorites' : selectedFilter;

  const filteredTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return TRACKS.filter((track) => {
      if (effectiveFilter === 'favorites' && !favoriteSet.has(track.id)) return false;
      if (
        effectiveFilter !== 'all' &&
        effectiveFilter !== 'favorites' &&
        track.categoryId !== effectiveFilter
      ) {
        return false;
      }
      if (channelFilter !== 'all' && track.channel !== channelFilter) return false;
      if (!q) return true;
      return (
        track.title.toLowerCase().includes(q) ||
        track.subtitle.toLowerCase().includes(q) ||
        (track.shortcut && track.shortcut.toLowerCase().includes(q))
      );
    });
  }, [effectiveFilter, favoriteSet, channelFilter, searchQuery]);

  const activeCategoryMeta = useMemo(() => {
    if (effectiveFilter === 'all') {
      return {
        title: 'Semua Track Pertandingan',
        description: `${TRACKS.length} audio lokal PBVSI siap putar langsung dari perangkat Anda.`,
      };
    }
    if (effectiveFilter === 'favorites') {
      return {
        title: 'Track Favorit',
        description: 'Daftar pintas audio pilihan Anda selama bertugas di lapangan.',
      };
    }
    const found = CATEGORIES.find((c) => c.id === effectiveFilter);
    return {
      title: found?.name ?? 'Library Audio',
      description: found?.description ?? '',
    };
  }, [effectiveFilter]);

  function selectDesktopCategory(filter: LibraryFilter) {
    setSelectedFilter(filter);
    if (filter === 'favorites') {
      setMobileTab('favorites');
    } else {
      setMobileTab('library');
    }
  }

  return (
    <div className="app-root">
      <a href="#main-content" className="skip-link">
        Langsung ke daftar audio
      </a>

      <header className="top-bar">
        <div className="top-bar__brand">
          <BrandMark size={30} />
          <div className="brand-text">
            <h1 className="brand-name">VSOUND</h1>
            <span className="brand-sub">Volleyball Match Audio</span>
          </div>
        </div>

        <div className="top-bar__actions">
          {shortcutFeedback && (
            <div className="shortcut-toast" role="status" aria-live="polite">
              {shortcutFeedback}
            </div>
          )}

          {installEvent && (
            <button type="button" className="btn-install" onClick={handleInstallPwa}>
              <DownloadIcon size={15} />
              <span>Install App</span>
            </button>
          )}

          <button
            type="button"
            className="icon-btn theme-btn"
            onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
            aria-label={theme === 'light' ? 'Aktifkan tema gelap Booth Console' : 'Aktifkan tema terang Arena Light'}
            title={theme === 'light' ? 'Tema Gelap' : 'Tema Terang'}
          >
            {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
          </button>
        </div>
      </header>

      <div className="console-grid">
        <aside className="desktop-rail" aria-label="Navigasi kategori audio">
          <nav className="rail-nav">
            <div className="rail-group-label">Library</div>
            <button
              type="button"
              className={`rail-item ${selectedFilter === 'all' ? 'is-current' : ''}`}
              onClick={() => selectDesktopCategory('all')}
              aria-current={selectedFilter === 'all' ? 'page' : undefined}
            >
              <span>Semua Audio</span>
              <span className="rail-count mono-num">{categoryCounts.all}</span>
            </button>
            <button
              type="button"
              className={`rail-item ${selectedFilter === 'favorites' ? 'is-current' : ''}`}
              onClick={() => selectDesktopCategory('favorites')}
              aria-current={selectedFilter === 'favorites' ? 'page' : undefined}
            >
              <span>Favorit</span>
              <span className="rail-count mono-num">{categoryCounts.favorites}</span>
            </button>

            <div className="rail-group-label">Kategori Pertandingan</div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`rail-item ${selectedFilter === cat.id ? 'is-current' : ''}`}
                onClick={() => selectDesktopCategory(cat.id)}
                aria-current={selectedFilter === cat.id ? 'page' : undefined}
              >
                <span>{cat.name}</span>
                <span className="rail-count mono-num">{categoryCounts[cat.id]}</span>
              </button>
            ))}
          </nav>

          <div className="rail-footer">
            <div className="rail-offline">
              <div className="rail-offline__head">
                <span>Cache Offline</span>
                <span className="mono-num">
                  {cachedUrls.size}/{TRACKS.length}
                </span>
              </div>
              <button
                type="button"
                className="btn-secondary btn-full"
                disabled={cachingProgress !== null || cachedUrls.size === TRACKS.length}
                onClick={handleCacheAllOffline}
              >
                <DownloadIcon size={15} />
                <span>
                  {cachedUrls.size === TRACKS.length
                    ? 'Siap Offline Penuh'
                    : cachingProgress
                      ? `Menyimpan ${cachingProgress.done}/${cachingProgress.total}`
                      : 'Simpan Semua Offline'}
                </span>
              </button>
            </div>
            <p className="rail-hint">
              Pintasan keyboard: <kbd>Shift+A/S/B/F/G/1/C/T</kbd>, <kbd>Shift+X</kbd> untuk Stop All.
            </p>
          </div>
        </aside>

        <main id="main-content" className="main-stage">
          <div className={`mobile-view ${mobileTab === 'pad' ? 'is-visible' : 'is-hidden-mobile'} only-mobile`}>
            <QuickPad
              audio={audio}
              onTrigger={(t) => handlePlay(t)}
              onStopSfx={() => audioEngine.stopSfx()}
              onToggleAutoDuck={(v) => audioEngine.setAutoDuck(v)}
            />
          </div>

          <div className={`mobile-view ${mobileTab === 'mc' ? 'is-visible' : 'is-hidden-mobile'} only-mobile`}>
            <McScriptPanel
              form={mcScript}
              onChangeField={updateMcField}
              onPlayTrack={(t) => handlePlay(t, 'bgm')}
              activeTrackId={audio.bgm.track?.id}
            />
          </div>

          <section
            className={`library-stage ${
              mobileTab === 'library' || mobileTab === 'favorites'
                ? 'is-visible'
                : 'is-hidden-mobile'
            }`}
            aria-labelledby="library-heading"
          >
            <div className="library-header">
              <div>
                <h2 id="library-heading" className="section-title">
                  {activeCategoryMeta.title}
                </h2>
                <p className="section-sub">{activeCategoryMeta.description}</p>
              </div>
              <span className="count-pill mono-num">{filteredTracks.length} track</span>
            </div>

            {mobileTab !== 'favorites' && (
              <div className="category-strip only-mobile-tablet" role="tablist" aria-label="Filter kategori audio">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedFilter === 'all'}
                  className={`cat-chip ${selectedFilter === 'all' ? 'is-active' : ''}`}
                  onClick={() => setSelectedFilter('all')}
                >
                  Semua ({categoryCounts.all})
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedFilter === cat.id}
                    className={`cat-chip ${selectedFilter === cat.id ? 'is-active' : ''}`}
                    onClick={() => setSelectedFilter(cat.id)}
                  >
                    {cat.shortName} ({categoryCounts[cat.id]})
                  </button>
                ))}
              </div>
            )}

            <div className="toolbar-row">
              <div className="search-field">
                <label htmlFor="track-search" className="sr-only">
                  Cari judul lagu, tim Proliga, atau efek suara
                </label>
                <SearchIcon size={17} className="search-field__icon" />
                <input
                  ref={searchInputRef}
                  id="track-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari audio, tim Proliga, atau shortcut..."
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    aria-label="Hapus kata pencarian"
                  >
                    <CloseIcon size={16} />
                  </button>
                )}
              </div>

              <div className="channel-segment" role="group" aria-label="Filter jenis channel audio">
                <button
                  type="button"
                  className={`seg-btn ${channelFilter === 'all' ? 'is-active' : ''}`}
                  onClick={() => setChannelFilter('all')}
                  aria-pressed={channelFilter === 'all'}
                >
                  Semua
                </button>
                <button
                  type="button"
                  className={`seg-btn ${channelFilter === 'sfx' ? 'is-active' : ''}`}
                  onClick={() => setChannelFilter('sfx')}
                  aria-pressed={channelFilter === 'sfx'}
                >
                  SFX
                </button>
                <button
                  type="button"
                  className={`seg-btn ${channelFilter === 'bgm' ? 'is-active' : ''}`}
                  onClick={() => setChannelFilter('bgm')}
                  aria-pressed={channelFilter === 'bgm'}
                >
                  BGM
                </button>
              </div>
            </div>

            {filteredTracks.length === 0 ? (
              <div className="empty-state" role="status">
                {effectiveFilter === 'favorites' && !searchQuery ? (
                  <>
                    <h3 className="empty-state__title">Belum ada track favorit</h3>
                    <p className="empty-state__desc">
                      Tekan ikon bintang pada track mana saja di Library untuk menandai audio yang paling sering Anda putar.
                    </p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => {
                        setSelectedFilter('all');
                        setMobileTab('library');
                      }}
                    >
                      Buka Semua Library
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="empty-state__title">Audio tidak ditemukan</h3>
                    <p className="empty-state__desc">
                      Tidak ada track yang cocok dengan filter atau kata kunci "{searchQuery}".
                    </p>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => {
                        setSearchQuery('');
                        setChannelFilter('all');
                        if (effectiveFilter !== 'favorites') setSelectedFilter('all');
                      }}
                    >
                      Reset Filter Pencarian
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="track-list">
                {filteredTracks.map((track) => (
                  <TrackRow
                    key={track.id}
                    track={track}
                    audio={audio}
                    isFavorite={favoriteSet.has(track.id)}
                    isOfflineCached={cachedUrls.has(track.src)}
                    onPlay={handlePlay}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </section>
        </main>

        <aside className="desktop-side" aria-label="Quick Pad SFX dan Script MC">
          <div className="side-tabs" role="tablist" aria-label="Panel kanan operator">
            <button
              type="button"
              role="tab"
              aria-selected={desktopRightTab === 'pad'}
              className={`side-tab ${desktopRightTab === 'pad' ? 'is-active' : ''}`}
              onClick={() => setDesktopRightTab('pad')}
            >
              <PadGridIcon size={16} />
              <span>Quick Pad SFX</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={desktopRightTab === 'mc'}
              className={`side-tab ${desktopRightTab === 'mc' ? 'is-active' : ''}`}
              onClick={() => setDesktopRightTab('mc')}
            >
              <MicScriptIcon size={16} />
              <span>Script MC</span>
            </button>
          </div>

          <div className="side-content">
            {desktopRightTab === 'pad' ? (
              <QuickPad
                compact
                audio={audio}
                onTrigger={(t) => handlePlay(t)}
                onStopSfx={() => audioEngine.stopSfx()}
                onToggleAutoDuck={(v) => audioEngine.setAutoDuck(v)}
              />
            ) : (
              <McScriptPanel
                form={mcScript}
                onChangeField={updateMcField}
                onPlayTrack={(t) => handlePlay(t, 'bgm')}
                activeTrackId={audio.bgm.track?.id}
              />
            )}
          </div>
        </aside>
      </div>

      <DeckBar
        audio={audio}
        mixerOpen={mixerOpen}
        onToggleMixer={() => setMixerOpen((v) => !v)}
        onTogglePlayPause={() => audioEngine.toggleBgmPlayPause()}
        onSeek={(sec) => audioEngine.seekBgm(sec)}
        onFadeOut={() => audioEngine.fadeOutBgm()}
        onStopAll={() => audioEngine.stopAll()}
        onStopSfx={() => audioEngine.stopSfx()}
        onBgmVolume={(v) => audioEngine.setBgmVolume(v)}
        onSfxVolume={(v) => audioEngine.setSfxVolume(v)}
        onToggleLoop={(v) => audioEngine.setBgmLoop(v)}
        onToggleAutoDuck={(v) => audioEngine.setAutoDuck(v)}
        cachedCount={cachedUrls.size}
        totalCount={TRACKS.length}
        cachingProgress={cachingProgress}
        onCacheAllOffline={handleCacheAllOffline}
      />

      <nav className="mobile-bottom-nav only-mobile" aria-label="Menu utama perangkat mobile">
        <button
          type="button"
          className={`bnav-item ${mobileTab === 'pad' ? 'is-active' : ''}`}
          onClick={() => setMobileTab('pad')}
          aria-current={mobileTab === 'pad' ? 'page' : undefined}
        >
          <PadGridIcon size={20} />
          <span>Quick Pad</span>
        </button>

        <button
          type="button"
          className={`bnav-item ${mobileTab === 'library' ? 'is-active' : ''}`}
          onClick={() => {
            if (selectedFilter === 'favorites') setSelectedFilter('all');
            setMobileTab('library');
          }}
          aria-current={mobileTab === 'library' ? 'page' : undefined}
        >
          <LibraryIcon size={20} />
          <span>Library</span>
        </button>

        <button
          type="button"
          className={`bnav-item ${mobileTab === 'favorites' ? 'is-active' : ''}`}
          onClick={() => setMobileTab('favorites')}
          aria-current={mobileTab === 'favorites' ? 'page' : undefined}
        >
          <StarIcon size={20} filled={mobileTab === 'favorites'} />
          <span>Favorit</span>
          {favorites.length > 0 && <span className="bnav-badge mono-num">{favorites.length}</span>}
        </button>

        <button
          type="button"
          className={`bnav-item ${mobileTab === 'mc' ? 'is-active' : ''}`}
          onClick={() => setMobileTab('mc')}
          aria-current={mobileTab === 'mc' ? 'page' : undefined}
        >
          <MicScriptIcon size={20} />
          <span>Script MC</span>
        </button>
      </nav>
    </div>
  );
}
