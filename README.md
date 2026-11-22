# VSOUND: Volleyball Match Sound Library

Mobile-first PWA sound library dan match soundboard untuk pertandingan bola voli dengan 75 aset audio lokal PBVSI dalam 6 kategori.

## Fitur Utama
- **75 file audio lokal** tersimpan di `public/audio/` (siap pakai tanpa ketergantungan server eksternal)
- **Dual-Channel Match Operator Engine**: pemutaran BGM deck (scrubber, loop, Fade Out 1,2 detik) terpisah dari SFX instan (Service Ace, Boom Spike, Monster Block, FireBall, Great Rally, Match Point, Check Position) dengan **Auto-Duck** otomatis dan tombol **STOP** instan
- **Mobile-First PWA**: navigasi bawah 4 tab (`Quick Pad`, `Library`, `Favorit`, `Script MC`), dukungan *Add to Home Screen*, dan tombol **Simpan Offline** via Service Worker Cache API
- **Teks Opening MC**: format pengumuman pembukaan PBVSI yang dapat diedit, tersimpan di perangkat, dan disertai tombol salin serta putar musik Opening
- **Tema Arena Light & Booth Dark**: kontras WCAG AA untuk arena terang maupun gelap
- **Pintasan Keyboard Desktop**: `Shift+A` (Service Ace), `Shift+S` (Boom Spike), `Shift+B` (Monster Block), `Shift+F` (FireBall), `Shift+G` (Great Rally), `Shift+1` (Match Point), `Shift+C` (Check Position), `Shift+T` (Time Out), `Shift+X` (Stop All)

## Menjalankan Lokal

```bash
npm install
npm run dev
```

Untuk build produksi dan preview:

```bash
npm run build
npm run preview
```

## Deploy ke Coolify

Repositori ini sudah dilengkapi `Dockerfile`, `nginx.conf`, dan `.dockerignore` siap pakai untuk Coolify:

1. Di dashboard Coolify, pilih **+ New Resource** -> **Public Repository** (atau **Private Repository** via GitHub App).
2. Masukkan URL repo: `https://github.com/halimc17/volleyball-sound.git` dan branch `main`.
3. Set **Build Pack** ke **Dockerfile**.
4. Set **Ports Exposes** ke `80`.
5. Isi **Domains** dengan domain HTTPS Anda (misalnya `https://vsound.domainanda.com`) agar fitur PWA install & offline Service Worker aktif di Android/iOS.
6. (Opsional) Pada tab **Healthcheck**, aktifkan path `/healthz` pada port `80`.
7. Klik **Deploy**.

