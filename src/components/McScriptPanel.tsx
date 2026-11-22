import { useId, useState } from 'react';
import type { SoundTrack } from '../data/catalog';
import { TRACKS } from '../data/catalog';
import { CheckIcon, CopyIcon, PlayIcon } from './Icons';

export interface McScriptData {
  greeting: string;
  tournament: string;
  matchNumber: string;
  teamA: string;
  teamB: string;
  referee1: string;
  referee2: string;
  level: string;
}

interface McScriptPanelProps {
  form: McScriptData;
  onChangeField: <K extends keyof McScriptData>(key: K, value: string) => void;
  onPlayTrack: (track: SoundTrack) => void;
  activeTrackId?: string;
}

export function McScriptPanel({
  form,
  onChangeField,
  onPlayTrack,
  activeTrackId,
}: McScriptPanelProps) {
  const uid = useId();
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);

  const proligaOpening = TRACKS.find((t) => t.src.includes('openingceremonyproliga'));
  const classicOpening = TRACKS.find((t) => t.src.includes('opening-ceremony'));

  const formattedScript = [
    `Selamat ${form.greeting || 'pagi/siang/sore/malam'} hadirin penonton sekalian.`,
    `Selamat datang di "${form.tournament || 'TURNAMEN BOLA VOLI'}".`,
    `Pertandingan ke-${form.matchNumber || '01'} akan saling berhadapan antara ${form.teamA || 'PBV. Tim A'} dan ${form.teamB || 'PBV. Tim B'}.`,
    `Wasit yang bertugas:\nWasit 1: ${form.referee1 || '________'} (${form.level || 'Wasit Nasional'})\nWasit 2: ${form.referee2 || '________'} (${form.level || 'Wasit Nasional'}).`,
    'Selamat menyaksikan.',
  ].join('\n\n');

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(formattedScript);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="mc-panel" aria-labelledby={`${uid}-heading`}>
      <div className="section-head">
        <div>
          <h2 id={`${uid}-heading`} className="section-title">Teks Opening MC</h2>
          <p className="section-sub">Panduan pengumuman pembukaan pertandingan sesuai format PBVSI.</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setEditing((v) => !v)}
          aria-expanded={editing}
        >
          {editing ? 'Selesai Edit' : 'Isi Data Match'}
        </button>
      </div>

      {editing && (
        <form className="mc-form" onSubmit={(e) => e.preventDefault()}>
          <div className="mc-form__grid">
            <div className="field">
              <label htmlFor={`${uid}-greeting`}>Waktu Sapaan</label>
              <select
                id={`${uid}-greeting`}
                value={form.greeting}
                onChange={(e) => onChangeField('greeting', e.target.value)}
              >
                <option value="pagi">Pagi</option>
                <option value="siang">Siang</option>
                <option value="sore">Sore</option>
                <option value="malam">Malam</option>
                <option value="pagi/siang/sore/malam">Fleksibel</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor={`${uid}-match`}>Pertandingan ke-</label>
              <input
                id={`${uid}-match`}
                type="text"
                value={form.matchNumber}
                onChange={(e) => onChangeField('matchNumber', e.target.value)}
                placeholder="01"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor={`${uid}-tournament`}>Nama Turnamen</label>
            <input
              id={`${uid}-tournament`}
              type="text"
              value={form.tournament}
              onChange={(e) => onChangeField('tournament', e.target.value)}
              placeholder="Nama turnamen bola voli"
            />
          </div>

          <div className="mc-form__grid">
            <div className="field">
              <label htmlFor={`${uid}-team-a`}>Tim A</label>
              <input
                id={`${uid}-team-a`}
                type="text"
                value={form.teamA}
                onChange={(e) => onChangeField('teamA', e.target.value)}
                placeholder="PBV. Tim A"
              />
            </div>
            <div className="field">
              <label htmlFor={`${uid}-team-b`}>Tim B</label>
              <input
                id={`${uid}-team-b`}
                type="text"
                value={form.teamB}
                onChange={(e) => onChangeField('teamB', e.target.value)}
                placeholder="PBV. Tim B"
              />
            </div>
          </div>

          <div className="mc-form__grid">
            <div className="field">
              <label htmlFor={`${uid}-ref1`}>Wasit 1</label>
              <input
                id={`${uid}-ref1`}
                type="text"
                value={form.referee1}
                onChange={(e) => onChangeField('referee1', e.target.value)}
                placeholder="Nama Wasit 1"
              />
            </div>
            <div className="field">
              <label htmlFor={`${uid}-ref2`}>Wasit 2</label>
              <input
                id={`${uid}-ref2`}
                type="text"
                value={form.referee2}
                onChange={(e) => onChangeField('referee2', e.target.value)}
                placeholder="Nama Wasit 2"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor={`${uid}-level`}>Klasifikasi Wasit</label>
            <input
              id={`${uid}-level`}
              type="text"
              value={form.level}
              onChange={(e) => onChangeField('level', e.target.value)}
              placeholder="Wasit Nasional"
            />
          </div>
        </form>
      )}

      <div className="mc-teleprompter">
        <p className="mc-teleprompter__text">{formattedScript}</p>
      </div>

      <div className="mc-actions">
        {proligaOpening && (
          <button
            type="button"
            className={`btn-primary ${activeTrackId === proligaOpening.id ? 'is-live' : ''}`}
            onClick={() => onPlayTrack(proligaOpening)}
          >
            <PlayIcon size={15} />
            <span>Putar Opening Proliga</span>
          </button>
        )}
        {classicOpening && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => onPlayTrack(classicOpening)}
          >
            <PlayIcon size={15} />
            <span>Opening Classic</span>
          </button>
        )}
        <button type="button" className="btn-secondary" onClick={handleCopy}>
          {copied ? <CheckIcon size={15} /> : <CopyIcon size={15} />}
          <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
        </button>
      </div>
    </section>
  );
}
