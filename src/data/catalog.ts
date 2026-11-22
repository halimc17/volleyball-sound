export type CategoryId =
  | 'before-after'
  | 'in-game-specta'
  | 'in-game-rally'
  | 'call-the-players'
  | 'playlist-indonesian'
  | 'playlist-international';

export type AudioChannel = 'bgm' | 'sfx';

export interface SoundCategory {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  defaultChannel: AudioChannel;
}

export interface SoundTrack {
  id: string;
  title: string;
  subtitle: string;
  categoryId: CategoryId;
  channel: AudioChannel;
  src: string;
  sizeBytes: number;
  shortcut?: string;
  quickPadLabel?: string;
  quickPadOrder?: number;
}

export const CATEGORIES: SoundCategory[] = [
  {
    "id": "before-after",
    "name": "Before & After Game",
    "shortName": "Pre / Post",
    "description": "Opening ceremony, time out, cek posisi, dan interval set.",
    "defaultChannel": "bgm"
  },
  {
    "id": "in-game-specta",
    "name": "In Game Specta",
    "shortName": "Specta SFX",
    "description": "Efek instan saat ace, spike, monster block, fireball, dan arena hype.",
    "defaultChannel": "sfx"
  },
  {
    "id": "in-game-rally",
    "name": "In Game Rally",
    "shortName": "Rally",
    "description": "Set & match point, clap fans, great rally, dan mega rally.",
    "defaultChannel": "sfx"
  },
  {
    "id": "call-the-players",
    "name": "Call The Players",
    "shortName": "Lineup",
    "description": "Musik perkenalan tim Proliga Putri (PI), Putra (PA), dan entrance.",
    "defaultChannel": "bgm"
  },
  {
    "id": "playlist-indonesian",
    "name": "Playlist Indonesian",
    "shortName": "Indonesia",
    "description": "Lagu kebangsaan, Asian Games 2018, dan lagu penyemangat Indonesia.",
    "defaultChannel": "bgm"
  },
  {
    "id": "playlist-international",
    "name": "Playlist International",
    "shortName": "Global / VNL",
    "description": "Anthem VNL, Queen, Coldplay, Maroon 5, dan arena remix.",
    "defaultChannel": "bgm"
  }
];

export const TRACKS: SoundTrack[] = [
  {
    "id": "before-after-1",
    "title": "Opening Ceremony (Proliga New)",
    "subtitle": "Official PBVSI",
    "categoryId": "before-after",
    "channel": "bgm",
    "src": "/audio/before-after/openingceremonyproliga.mp3",
    "sizeBytes": 2598379
  },
  {
    "id": "before-after-2",
    "title": "Opening Ceremony (Classic)",
    "subtitle": "Official PBVSI",
    "categoryId": "before-after",
    "channel": "bgm",
    "src": "/audio/before-after/opening-ceremony.mp3",
    "sizeBytes": 3530189
  },
  {
    "id": "before-after-3",
    "title": "Time Out Official PBVSI",
    "subtitle": "Time Out 30s",
    "categoryId": "before-after",
    "channel": "bgm",
    "src": "/audio/before-after/time-out.mp3",
    "sizeBytes": 1169934,
    "shortcut": "Shift+T",
    "quickPadLabel": "Time Out",
    "quickPadOrder": 8
  },
  {
    "id": "before-after-4",
    "title": "If You Are Happy (30s)",
    "subtitle": "Time Out",
    "categoryId": "before-after",
    "channel": "bgm",
    "src": "/audio/before-after/if-you-are-happy-30.mp3",
    "sizeBytes": 768402
  },
  {
    "id": "before-after-5",
    "title": "I Like to Move It (30s)",
    "subtitle": "Time Out",
    "categoryId": "before-after",
    "channel": "bgm",
    "src": "/audio/before-after/i-like-to-move-it-30.mp3",
    "sizeBytes": 1589535
  },
  {
    "id": "before-after-6",
    "title": "Rising Claps (Voice)",
    "subtitle": "Time Out",
    "categoryId": "before-after",
    "channel": "bgm",
    "src": "/audio/before-after/rising-claps-voice.mp3",
    "sizeBytes": 2740124
  },
  {
    "id": "before-after-7",
    "title": "Drop It Bronco Joe",
    "subtitle": "Time Out",
    "categoryId": "before-after",
    "channel": "bgm",
    "src": "/audio/before-after/fclb-24-28-drop-it-bronco-joe-1042649.mp3",
    "sizeBytes": 1591424
  },
  {
    "id": "before-after-8",
    "title": "Checking Position (Left Right)",
    "subtitle": "Animation Cue",
    "categoryId": "before-after",
    "channel": "sfx",
    "src": "/audio/before-after/animationleftright.mp3",
    "sizeBytes": 2718029,
    "shortcut": "Shift+C",
    "quickPadLabel": "Check Pos",
    "quickPadOrder": 7
  },
  {
    "id": "before-after-9",
    "title": "Interval Game (Hymne PBVSI)",
    "subtitle": "Antar Set",
    "categoryId": "before-after",
    "channel": "bgm",
    "src": "/audio/before-after/interval-pbvsi.mp3",
    "sizeBytes": 2454968
  },
  {
    "id": "before-after-10",
    "title": "Interval Set ke-5 (We're Going 5)",
    "subtitle": "Short Version",
    "categoryId": "before-after",
    "channel": "bgm",
    "src": "/audio/before-after/5th-set-we-re-going-5-short-version.mp3",
    "sizeBytes": 2295949
  },
  {
    "id": "in-game-specta-11",
    "title": "Service ACE: Ace Ace Rock",
    "subtitle": "Service Ace",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/aceacerock.mp3",
    "sizeBytes": 492272
  },
  {
    "id": "in-game-specta-12",
    "title": "Service ACE (Official Cue)",
    "subtitle": "Service Ace",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/service-ace.mp3",
    "sizeBytes": 282607,
    "shortcut": "Shift+A",
    "quickPadLabel": "Service Ace",
    "quickPadOrder": 1
  },
  {
    "id": "in-game-specta-13",
    "title": "Boom SPIKE: Here Comes The Boom (16s)",
    "subtitle": "Boom Spike",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/herecomestheboom16.mp3",
    "sizeBytes": 391972,
    "shortcut": "Shift+S",
    "quickPadLabel": "Boom Spike",
    "quickPadOrder": 2
  },
  {
    "id": "in-game-specta-14",
    "title": "Boom SPIKE: Here Comes The Boom (8s)",
    "subtitle": "Boom Spike",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/herecomestheboom08.mp3",
    "sizeBytes": 202010
  },
  {
    "id": "in-game-specta-15",
    "title": "Boom SPIKE (15s)",
    "subtitle": "Boom Spike",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/boom-spike-15.mp3",
    "sizeBytes": 543320
  },
  {
    "id": "in-game-specta-16",
    "title": "Monster BLOCK (19s)",
    "subtitle": "Monster Block",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/moster-block-19.mp3",
    "sizeBytes": 304940,
    "shortcut": "Shift+B",
    "quickPadLabel": "Monster Block",
    "quickPadOrder": 3
  },
  {
    "id": "in-game-specta-17",
    "title": "Monster BLOCK (8s)",
    "subtitle": "Monster Block",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/moster-block-08.mp3",
    "sizeBytes": 133676
  },
  {
    "id": "in-game-specta-18",
    "title": "FireBall (18s)",
    "subtitle": "FireBall",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/fireball-18.mp3",
    "sizeBytes": 288016,
    "shortcut": "Shift+F",
    "quickPadLabel": "FireBall",
    "quickPadOrder": 4
  },
  {
    "id": "in-game-specta-19",
    "title": "FireBall (9s)",
    "subtitle": "FireBall",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/fireball-09.mp3",
    "sizeBytes": 225432
  },
  {
    "id": "in-game-specta-20",
    "title": "ThaiReMix: Apateya (12s)",
    "subtitle": "ThaiReMix",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/apateya-remix12.mp3",
    "sizeBytes": 309843
  },
  {
    "id": "in-game-specta-21",
    "title": "ThaiReMix: ThaiMix DJ",
    "subtitle": "ThaiReMix",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/thaimixdj.mp3",
    "sizeBytes": 620287
  },
  {
    "id": "in-game-specta-22",
    "title": "ThaiReMix: Kicau Mania",
    "subtitle": "ThaiReMix",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/kicau-mania.mp3",
    "sizeBytes": 533778
  },
  {
    "id": "in-game-specta-23",
    "title": "One Life Madden",
    "subtitle": "Arena Sting",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/onelifemadden.mp3",
    "sizeBytes": 604194
  },
  {
    "id": "in-game-specta-24",
    "title": "VNL Vienna (20s)",
    "subtitle": "Arena Sting",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/vnl-vienna20.mp3",
    "sizeBytes": 322461
  },
  {
    "id": "in-game-specta-25",
    "title": "Be Part Of The Game (14s)",
    "subtitle": "Arena Sting",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/bepartofthegame14.mp3",
    "sizeBytes": 227647
  },
  {
    "id": "in-game-specta-26",
    "title": "Drop It",
    "subtitle": "Arena Sting",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/drop-it.mp3",
    "sizeBytes": 570604
  },
  {
    "id": "in-game-specta-27",
    "title": "Ooo Europe",
    "subtitle": "Arena Sting",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/oooeurope.mp3",
    "sizeBytes": 469924
  },
  {
    "id": "in-game-specta-28",
    "title": "We Will Rock You",
    "subtitle": "Arena Sting",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/wewillrocku.mp3",
    "sizeBytes": 492349
  },
  {
    "id": "in-game-specta-29",
    "title": "Mission Impossible",
    "subtitle": "Arena Sting",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/missionimposible.mp3",
    "sizeBytes": 810049
  },
  {
    "id": "in-game-specta-30",
    "title": "Need You Forever (Greene)",
    "subtitle": "Arena Sting",
    "categoryId": "in-game-specta",
    "channel": "sfx",
    "src": "/audio/in-game-specta/cm-114-64-need-you-forever-greene-916183.mp3",
    "sizeBytes": 626816
  },
  {
    "id": "in-game-rally-31",
    "title": "Set & Match Point: Stand Up Clap",
    "subtitle": "Crucial Point",
    "categoryId": "in-game-rally",
    "channel": "sfx",
    "src": "/audio/in-game-rally/setandmatchpointstandupclap.mp3",
    "sizeBytes": 1496551,
    "shortcut": "Shift+1",
    "quickPadLabel": "Match Point",
    "quickPadOrder": 6
  },
  {
    "id": "in-game-rally-32",
    "title": "Set & Match Point: Stand Up Clap (15s)",
    "subtitle": "Crucial Point",
    "categoryId": "in-game-rally",
    "channel": "sfx",
    "src": "/audio/in-game-rally/setandmatchpointstandupclap15.mp3",
    "sizeBytes": 1025303
  },
  {
    "id": "in-game-rally-33",
    "title": "Short Rally: Clap Your Hands (10s)",
    "subtitle": "Volley Fans",
    "categoryId": "in-game-rally",
    "channel": "sfx",
    "src": "/audio/in-game-rally/volley-fans-clap-your-hands-10.mp3",
    "sizeBytes": 639455
  },
  {
    "id": "in-game-rally-34",
    "title": "Short Rally: Clap Your Hands (Full)",
    "subtitle": "Volley Fans",
    "categoryId": "in-game-rally",
    "channel": "sfx",
    "src": "/audio/in-game-rally/volley-fans-clap-your-hands.mp3",
    "sizeBytes": 801414
  },
  {
    "id": "in-game-rally-35",
    "title": "Great Rally: This Is Volleyball",
    "subtitle": "Great Rally",
    "categoryId": "in-game-rally",
    "channel": "sfx",
    "src": "/audio/in-game-rally/greatrallythisisvolleyball.mp3",
    "sizeBytes": 783659,
    "shortcut": "Shift+G",
    "quickPadLabel": "Great Rally",
    "quickPadOrder": 5
  },
  {
    "id": "in-game-rally-36",
    "title": "Mega Rally: What a Rally (14s)",
    "subtitle": "Mega Rally",
    "categoryId": "in-game-rally",
    "channel": "sfx",
    "src": "/audio/in-game-rally/megarally14.mp3",
    "sizeBytes": 1003324
  },
  {
    "id": "in-game-rally-37",
    "title": "Mega Rally: What a Rally (Full)",
    "subtitle": "Mega Rally",
    "categoryId": "in-game-rally",
    "channel": "sfx",
    "src": "/audio/in-game-rally/megarally.mp3",
    "sizeBytes": 2343928
  },
  {
    "id": "call-the-players-38",
    "title": "[PI] PLN Electric",
    "subtitle": "Tim Putri (Proliga)",
    "categoryId": "call-the-players",
    "channel": "bgm",
    "src": "/audio/call-the-players/pi-pln.mp3",
    "sizeBytes": 1794243
  },
  {
    "id": "call-the-players-39",
    "title": "[PI] Pertamina Enduro",
    "subtitle": "Tim Putri (Proliga)",
    "categoryId": "call-the-players",
    "channel": "bgm",
    "src": "/audio/call-the-players/pi-pertamina-enduro.mp3",
    "sizeBytes": 1688402
  },
  {
    "id": "call-the-players-40",
    "title": "[PI] Gresik Petro Kimia",
    "subtitle": "Tim Putri (Proliga)",
    "categoryId": "call-the-players",
    "channel": "bgm",
    "src": "/audio/call-the-players/pi-petro.mp3",
    "sizeBytes": 1211646
  },
  {
    "id": "call-the-players-41",
    "title": "[PI] Popsivo Polwan",
    "subtitle": "Tim Putri (Proliga)",
    "categoryId": "call-the-players",
    "channel": "bgm",
    "src": "/audio/call-the-players/pi-popsivo.mp3",
    "sizeBytes": 1772958
  },
  {
    "id": "call-the-players-42",
    "title": "[PI] BJB Tandamata",
    "subtitle": "Tim Putri (Proliga)",
    "categoryId": "call-the-players",
    "channel": "bgm",
    "src": "/audio/call-the-players/pi-bjb.mp3",
    "sizeBytes": 1467434
  },
  {
    "id": "call-the-players-43",
    "title": "[PI] Livin Mandiri",
    "subtitle": "Tim Putri (Proliga)",
    "categoryId": "call-the-players",
    "channel": "bgm",
    "src": "/audio/call-the-players/pi-livin.mp3",
    "sizeBytes": 1338030
  },
  {
    "id": "call-the-players-44",
    "title": "Entrance",
    "subtitle": "Player Entrance",
    "categoryId": "call-the-players",
    "channel": "bgm",
    "src": "/audio/call-the-players/riseupentrance.mp3",
    "sizeBytes": 2022014
  },
  {
    "id": "call-the-players-45",
    "title": "[PA] Lavani",
    "subtitle": "Tim Putra (Proliga)",
    "categoryId": "call-the-players",
    "channel": "bgm",
    "src": "/audio/call-the-players/pa-lavani.mp3",
    "sizeBytes": 1088759
  },
  {
    "id": "call-the-players-46",
    "title": "[PA] Pertamina",
    "subtitle": "Tim Putra (Proliga)",
    "categoryId": "call-the-players",
    "channel": "bgm",
    "src": "/audio/call-the-players/pa-pertamina-pertamax.mp3",
    "sizeBytes": 1074152
  },
  {
    "id": "call-the-players-47",
    "title": "[PA] Bhayangkara",
    "subtitle": "Tim Putra (Proliga)",
    "categoryId": "call-the-players",
    "channel": "bgm",
    "src": "/audio/call-the-players/pa-bhayangkara.mp3",
    "sizeBytes": 1286363
  },
  {
    "id": "call-the-players-48",
    "title": "[PA] Garuda Jaya",
    "subtitle": "Tim Putra (Proliga)",
    "categoryId": "call-the-players",
    "channel": "bgm",
    "src": "/audio/call-the-players/pa-garudajaya.mp3",
    "sizeBytes": 2196467
  },
  {
    "id": "playlist-indonesian-49",
    "title": "Indonesia Raya (Official Vocal)",
    "subtitle": "Lagu Kebangsaan",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/indonesia-raya-vocal.mp3",
    "sizeBytes": 1735921
  },
  {
    "id": "playlist-indonesian-50",
    "title": "Indonesia Raya (Instrumental)",
    "subtitle": "Lagu Kebangsaan",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/indonesia-raya-instrumental.mp3",
    "sizeBytes": 1706655
  },
  {
    "id": "playlist-indonesian-51",
    "title": "Padamu Negeri (Instrumental)",
    "subtitle": "Lagu Nasional",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/padamu-negeri-instrumen.mp3",
    "sizeBytes": 1732368
  },
  {
    "id": "playlist-indonesian-52",
    "title": "All Songs 18th Asian Games 2018",
    "subtitle": "Asian Games 2018",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/allsongs18thasiangames2018.mp3",
    "sizeBytes": 9085105
  },
  {
    "id": "playlist-indonesian-53",
    "title": "Bright As The Sun",
    "subtitle": "Official Asian Games 2018",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/officialasiangames2018-energy18brightasthesun.mp3",
    "sizeBytes": 6721965
  },
  {
    "id": "playlist-indonesian-54",
    "title": "Meraih Bintang",
    "subtitle": "Official Asian Games 2018",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/officialasiangames2018-meraihbintang.mp3",
    "sizeBytes": 4517857
  },
  {
    "id": "playlist-indonesian-55",
    "title": "Menaklukkan Dunia",
    "subtitle": "Official Asian Games 2018",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/officialasiangames2018-menaklukkandunia.mp3",
    "sizeBytes": 5078061
  },
  {
    "id": "playlist-indonesian-56",
    "title": "Kamu Ngga Sendirian",
    "subtitle": "Tipe-X",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/tipex-kamunggasendirian.mp3",
    "sizeBytes": 6612460
  },
  {
    "id": "playlist-indonesian-57",
    "title": "Di Atas Awan",
    "subtitle": "Nidji",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/nidji-diatasawan.mp3",
    "sizeBytes": 5913423
  },
  {
    "id": "playlist-indonesian-58",
    "title": "Monitor Ketua (Orang Baru Lebe Gacor)",
    "subtitle": "DJ Tor Remix",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/dj-tor-monitor-ketua-orang-baru-lebe-gacor-remix-full-bass-viral-tiktok-terbaru-2025-m4a-128k.m4a",
    "sizeBytes": 5362924
  },
  {
    "id": "playlist-indonesian-59",
    "title": "Pica-Pica / Tabola Bale / Calon Mantu",
    "subtitle": "DJ Remix Lagu Timur",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/dj-pica-pica-tabola-bale-x-calon-mantu-idaman.mp3",
    "sizeBytes": 8493275
  },
  {
    "id": "playlist-indonesian-60",
    "title": "Semangat Voli Takkan Pernah Padam",
    "subtitle": "Edwy Yuna",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/semangat-volly-takkan-pernah-padam.mp3",
    "sizeBytes": 4885244
  },
  {
    "id": "playlist-indonesian-61",
    "title": "Sportivitas",
    "subtitle": "Marake Music",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/sportivitas.mp3",
    "sizeBytes": 4307206
  },
  {
    "id": "playlist-indonesian-62",
    "title": "Salam Olahraga",
    "subtitle": "Jelajah Senja",
    "categoryId": "playlist-indonesian",
    "channel": "bgm",
    "src": "/audio/playlist-indonesian/salam-olahraga.mp3",
    "sizeBytes": 6722174
  },
  {
    "id": "playlist-international-63",
    "title": "DJ Terompet (Apateya Remix)",
    "subtitle": "Arena DJ",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/apateya-remix.mp3",
    "sizeBytes": 4275859
  },
  {
    "id": "playlist-international-64",
    "title": "APT (DJ Remix)",
    "subtitle": "Arena DJ",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/dj-apt.mp3",
    "sizeBytes": 6262001
  },
  {
    "id": "playlist-international-65",
    "title": "Que Pasa",
    "subtitle": "Whisnu Santika ft. Liquid Silva",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/whisnu-santika-ft-liquid-silva-que-pasa-mp3-160k.mp3",
    "sizeBytes": 4658270
  },
  {
    "id": "playlist-international-66",
    "title": "Moves Like Jagger",
    "subtitle": "Maroon 5 ft. Christina Aguilera",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/moves-like-jagger-maroon-5-featuring-christina-aguilera-m4a-128k.m4a",
    "sizeBytes": 3282070
  },
  {
    "id": "playlist-international-67",
    "title": "Daylight",
    "subtitle": "Maroon 5",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/maroon-5-daylight-lyrics-mp3-160k.mp3",
    "sizeBytes": 4505754
  },
  {
    "id": "playlist-international-68",
    "title": "Volleyball Anthem",
    "subtitle": "Alec Whitworth",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/volleyball-anthem.mp3",
    "sizeBytes": 3865214
  },
  {
    "id": "playlist-international-69",
    "title": "We Are The Champions",
    "subtitle": "Queen",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/we-are-the-champions.mp3",
    "sizeBytes": 3068144
  },
  {
    "id": "playlist-international-70",
    "title": "A Sky Full of Stars",
    "subtitle": "Coldplay",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/a-sky-full-of-stars.mp3",
    "sizeBytes": 4394736
  },
  {
    "id": "playlist-international-71",
    "title": "More Than You Know",
    "subtitle": "Axwell /\\ Ingrosso",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/more-than-you-know.mp3",
    "sizeBytes": 3252605
  },
  {
    "id": "playlist-international-72",
    "title": "Worlds Collide (Official Music)",
    "subtitle": "NERVO",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/worlds-collide.mp3",
    "sizeBytes": 3153149
  },
  {
    "id": "playlist-international-73",
    "title": "VNL Soundtrack",
    "subtitle": "VNL Official",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/vnl-soundtrack.mp3",
    "sizeBytes": 709034
  },
  {
    "id": "playlist-international-74",
    "title": "Be Part Of The Game (VNL Theme)",
    "subtitle": "feat. DJ Stari & DJ Tobi Rudig",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/vnl-bepartofthegame.mp3",
    "sizeBytes": 1307044
  },
  {
    "id": "playlist-international-75",
    "title": "Vienna (Like a V V V V)",
    "subtitle": "DJ Stari & DJ Tobi Rudig Remix",
    "categoryId": "playlist-international",
    "channel": "bgm",
    "src": "/audio/playlist-international/vnl-vienna.mp3",
    "sizeBytes": 2246274
  }
];

export const QUICK_PAD_TRACKS: SoundTrack[] = TRACKS
  .filter((t) => typeof t.quickPadOrder === 'number')
  .sort((a, b) => (a.quickPadOrder ?? 99) - (b.quickPadOrder ?? 99));

export const DEFAULT_MC_SCRIPT = {
  greeting: 'pagi/siang/sore/malam',
  tournament: 'TURNAMEN BOLA VOLI',
  matchNumber: '01',
  teamA: 'PBV. TIM A',
  teamB: 'PBV. TIM B',
  referee1: 'Nama Wasit 1',
  referee2: 'Nama Wasit 2',
  level: 'Wasit Nasional',
};
