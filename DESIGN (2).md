# DESIGN.md — RENAISSANCE PORTFOLIO / SCROLL-DIRECTED EXPERIENCE

> **Status:** Design and animation specification, not a completed implementation.  
> **Reference:** https://www.shopify.com/editions/winter2026  
> **Target:** Personal developer / UI designer / creative technologist portfolio.  
> **Design premise:** *A modern maker inside a Renaissance painting.*  
> **Language:** English on the portfolio, Indonesian in this implementation document.  
> **Stack preference:** Existing vanilla JavaScript + Tailwind if present; GSAP ScrollTrigger for scroll timelines; optional Three.js + Theatre.js for 3D. Do not introduce React unless the repository already uses it.

---

## 0. Yang benar-benar dipelajari dari referensi

### Fakta terkonfirmasi

Shopify Winter ’26 menggunakan adegan lukisan Renaissance yang ditampilkan sebagai scene WebGL memakai **Three.js dan React Three Fiber**. Untuk visual tertentu, lukisan 2D diberi depth map yang menggeser subdivided plane; untuk tokoh/adegan yang lebih volumetrik dipakai mesh 3D, texture painting, rigging, dan ekspor GLTF. **Theatre.js** memberi animator kontrol keyframe langsung dalam situs. Optimasi memakai texture compression dan tier kualitas. Sumber utama: catatan teknis engineer Shopify, https://threadreaderapp.com/scrolly/2001335712982147307 , dan studi proyek https://rgd.ca/hiring-designers/award-winners/2026-in-house-award-winners/the-renaissance-edition .

### Dari screenshot referensi yang diberikan pengguna

- Section `Online` tampil seperti **lukisan hidup**: tokoh berpakaian Renaissance terlihat dari belakang, duduk di meja menggambar dan berinteraksi dengan layar berisi kode.
- Ada kain merah besar di bagian atas, langit awan sebagai latar, permukaan meja dan properti di foreground.
- Judul `Online` memakai sans-serif putih **sangat besar dan tebal**, menumpuk di atas artwork. Kalimat penjelas menggunakan serif editorial yang lebih lembut.
- Navigasi utama kecil di atas; indeks bab tetap terbaca di tepi kiri. Artwork mendominasi layar, tetapi UI yang benar-benar terlihat tetap sedikit.
- Untuk portofolio, tiru **prinsip hirarki dan ritme**, jangan menyalin teks, logo, ilustrasi, dan susunan Shopify secara literal.

### Target interpretasi kita

**Tidak** menjadi website museum, susunan kartu dekoratif, poster satu gambar, atau menampilkan patung berulang-ulang. Setiap chapter berupa **satu frame editorial penuh**, dengan karakter manusia modern berkostum Renaissance: mengoding, menggunakan laptop, mencatat ide, memanipulasi hologram. Ada 3 jenis gerak: (1) scroll utama yang reversible, (2) gerak idle sangat halus untuk memberi hidup, dan (3) hover/tap pada elemen interaktif.

---

## 1. Prinsip visual: satu adegan, satu fokus

1. **One hero object / scene.** Satu karakter atau satu alat besar sebagai fokus, bukan puluhan ornamen sekaligus.
2. **Giant modern typography.** Headline sans-serif editorial paling dominan; serif dipakai untuk cerita/aksen. Jangan pakai serif mewah pada semua judul.
3. **Negative space is deliberate.** Sisakan sekitar 35–45% frame sebagai ruang teks atau komposisi kosong.
4. **Real spatial change.** Layar baru muncul karena kamera melewati meja, melintasi hologram, memasuki lembar kertas, atau menjauh dari karakter. Jangan transisi fade to black secara rutin.
5. **Layer ownership.** Background, manusia, meja, kursi, globe, lembar kertas, tangan, laptop, dan hologram masing-masing objek terpisah.
6. **Scroll stays native.** Jangan memaksa roda mouse berpindah satu slide; pengguna tetap dapat scroll normal dan membalik arah.
7. **Quiet UI.** Navigasi 5 link kecil, chapter index, 1 CTA; tidak ada deretan kartu besar pada Hero.

### Redesign navigasi

`HOME → ABOUT → SKILLS → SELECTED WORK → ARCHIVE → CONTACT`

- Homepage `index` adalah 5–6 chapter scroll berkelanjutan.
- Halaman `archive` adalah grid yang dapat difilter, bukan kelanjutan animasi panjang yang mempersulit browse.
- Halaman `project/:slug` adalah case study editorial, 1 hero visual, visual proses, peran/teknologi, hasil, next project.
- Contact adalah outro pendek dengan CTA email dan tautan sosial.
- Label navigasi boleh tetap `Home, About, Work, Archive, Contact`; `Skills` muncul lewat chapter index agar header tetap pendek.

---

## 2. Design tokens dan font

### Typography — 3 peran yang jelas

| Role | Font | Weight | Scale (desktop) | Fungsi |
|---|---|---|---|---|
| **Main oversized word** | **Inter Tight** atau **Geist** | 700–900 | `clamp(88px, 13vw, 236px)` | `DEVELOPER`, `SKILLS`, `WORK`, `ARCHIVE` |
| Editorial statement | **Cormorant Garamond** | 500 / italic 500 | `clamp(36px, 5.3vw, 88px)` | Subjudul puitis, kalimat cerita satu-dua baris |
| Navigation / UI / descriptive | **Inter** | 400–600 | 13–17px | Nav, tools, bio, indeks chapter, CTA |
| Optional caption numeric | **IBM Plex Mono** | 400 | 11–12px | Chapter angka, `01/06`, progress |

**Larangan:** jangan memadukan Bodoni + Cormorant + display serif lain bersamaan; cukup 1 sans utama, 1 serif cerita, 1 mono opsional. `font-display: swap`; font lokal / Google Fonts sesuai lisensi, **jangan bundel file font ke user**. Referensi font ada di https://fonts.google.com/ .

### Font treatment

```css
:root {
  --font-display: 'Inter Tight', 'Arial Narrow', sans-serif;
  --font-editorial: 'Cormorant Garamond', Georgia, serif;
  --font-body: Inter, Arial, sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;

  --ink: #0b0d12;
  --night: #101823;
  --cream: #f5f1e8;
  --paper: #e6d9c5;
  --burgundy: #6d2d32;
  --blue-grey: #718396;
  --gold: #caa675;
}
.chapter-title {
  font-family: var(--font-display);
  font-size: clamp(5.5rem, 13vw, 14.75rem);
  font-weight: 800;
  line-height: .76;
  letter-spacing: -.075em;
  text-transform: none;
}
.editorial-copy {
  font-family: var(--font-editorial);
  font-weight: 500;
  font-size: clamp(2.2rem, 5.3vw, 5.5rem);
  line-height: .98;
}
```

### Komposisi desktop (basis 1440 × 900)

- Grid posisi relatif pada viewport: `x=0...100vw`, `y=0...100vh`.
- Header fix: tinggi 58–68px; padding 4.5vw kiri-kanan.
- Chapter mini logo / indeks x=5–12vw, y=6–14vh.
- Giant title: x=20–24vw (tergantung scene), y=7–14vh, lebar 65–76vw.
- Karakter tokoh dari belakang: pusat x≈53–62vw, y≈60–67vh, besar≈45–58vh.
- Background: `cover` penuh satu viewport, tanpa teks, kursi, manusia, meja, hologram tertanam.
- Navigasi chapter: x=5.5vw, y=66–88vh; pakai angka Romawi kecil opsional.
- Text overlay memiliki gradient/contrast overlay lokal, **bukan** backdrop blur di seluruh layar.

### Aturan density

- Maksimum 1 giant title + 1 editorial paragraph + 1 CTA pada hero.
- Maksimum 1 karakter dominan pada setiap frame (boleh siluet kedua sementara di transisi).
- Maksimum 3–5 kertas yang terlihat sekaligus; aset kertas lain dipakai bergantian.
- Hologram hanya aktif pada Skills / Work, bukan sepanjang website.
- Objek dekorasi yang tidak mendukung transisi **dihilangkan**.

---

## 3. Layer sistem / hierarki scene

Komposisikan secara berlapis **tanpa menggabungkan semua aset menjadi satu JPG**:

| Layer | Objek | Efek | CSS z-index indikatif |
|---|---|---|---:|
| `L0` | BG kota, awan, langit, gedung, curtain jika merupakan bagian pemandangan | Lambat, sedikit pan / scale; depth parallax opsional | 0 |
| `L1` | Set dressing belakang: pilar, globe jauh, bayangan | Parallax 0.2× | 10 |
| `L2` | Karakter manusia penuh / back view | Translasi, zoom, rotasi ringan; kelak rig 3D | 20 |
| `L3` | Kursi, meja, alat besar di foreground | Gerak kamera membuat perspective, bukan terbang acak | 25 |
| `L4` | Tangan spesifik, kuas, pena, lembar kertas depan | Individual scrub / rig | 30 |
| `L5` | Hologram/laptop display/portal | 3D tilt, scale, opacity; jadi jembatan ke scene berikutnya | 35 |
| `L6` | Grain/graticule/light overlays | Halus, hanya di beberapa beat | 40 |
| `L7` | Editorial headline dan cerita | DOM text, selalu selectable dan accessible | 60 |
| `L8` | Nav, controls, CTA, chapter index | Fixed; tidak berubah oleh camera zoom | 100 |

**Catatan:** Jika masuk ke Three.js, urutan kedalaman diatur oleh posisi `z`, bukan hanya CSS z-index. DOM title tetap di layer UI terpisah. Hindari merender judul sebagai tekstur di WebGL.

### Folder output yang disarankan

```text
public/assets/
  backgrounds/
    hero-landscape.webp
    about-workroom.webp
    skills-workroom.webp
    projects-gallery.webp
    contact-sky.webp
  characters/
    maker-back-front.png
    maker-side.png
    maker-sitting.png
    scholar-working.png
    creative-female.png
    hand-reach-left.png
    hand-reach-right.png
  props/
    desk.png
    chair.png
    globe-armillary.png
    book-01.png
    book-02.png
    quill.png
    candle.png
    parchment-01.png
    parchment-02.png
    parchment-03.png
  ui-world/
    hologram-coding.png
    hologram-orbit.png
    hologram-project.png
  3d/
    maker-rigged.glb
    desk.glb
    chair.glb
    globe.glb
  depth/
    hero-depth.png
    about-depth.png
src/
  animations/
    hero.js
    about.js
    skills.js
    work.js
    archive-portal.js
    contact.js
    shared.js
  data/projects.js
  styles/tokens.css
  pages/...
```

**Eksisting yang tersedia di percakapan/file kerja:**

| Calon fungsi | Sumber PNG yang sudah dibuat | Status |
|---|---|---|
| BG kota matahari terbenam | `golden_hour_over_the_classical_lake_city.png` | RGB solid; cocok sebagai environment, bukan alpha |
| Manusia back-view | `contemplative_renaissance_prince_in_velvet.png` | RGBA, perlu cek halo dan crop untuk compositing |
| Meja kayu | `ornate_renaissance_architect_s_writing_desk.png` | RGBA; **masih berisi buku/globe/papan di atasnya**, artinya bukan model meja polos |
| Kursi klasik | `ornate_gilded_baroque_armchair.png` | RGBA; objek terpisah |
| Globe/armillary | `ornate_golden_brass_armillary_sphere.png` | RGBA; objek terpisah |
| Hologram coding | `futuristic_astral_coding_hud.png` | RGBA; masih satu komposisi multi-panel, perlu versi satu-per-objek untuk 3D |
| Kertas besar | `ornate_renaissance_parchment_manuscript.png` dan `gilded_renaissance_astronomy_manuscript.png` | RGBA per lembar |
| Referensi scene gabungan | `renaissance_developer_portfolio_at_sunset.png` | RGB; jangan dipakai sebagai latar animasi jika sudah mengandung orang/meja/teks |

**Penting untuk WebGL/3D:** Hasil RGBA tidak otomatis menjadi aset model 3D. Karakter untuk rig harus dibuat front / side / back view konsisten, idealnya A-pose; versi duduk tidak cukup untuk rekonstruksi badan penuh. Untuk object yang saling tumpang-tindih (contoh globe menyatu di meja) perlu **regenerasi objek tunggal**, bukan crop gambar gabungan. Render eksplisit `transparent background, isolated object, no cast shadow / no floor / no frame`. Periksa fringe warna dan alpha asli, jangan percaya preview checkerboard.

---

## 4. Scroll choreography — master plan

Pakai vertical native scroll; setiap chapter berupa pinned 100vh canvas dengan progress `p ∈ [0,1]`. Rekomendasi panjang chapter di desktop:

| Scene | Panjang scroll saat pinned | Tujuan dramaturgi |
|---|---:|---|
| 01 Intro | ~340vh | Memperkenalkan karakter → masuk ke world |
| 02 About / Workroom | ~420vh | Meja kerja → kamera ke ilustrasi di kertas → identitas |
| 03 Skills / Hologram | ~460vh | Karakter membuka antarmuka → area keahlian |
| 04 Selected Work | ~420vh | Hologram menjadi gallery project yang horizontal |
| 05 Archive Portal | ~220vh | Kamera masuk satu kartu/proyek → menuju route archive |
| 06 Contact | ~180vh | Karakter meraih ke arah viewer → outro CTA |

`vh` di atas adalah **jarak scrolling untuk setiap pin setelah section mencapai top**, bukan tinggi fisik konten yang harus dibaca. Pilih jumlah scene final berdasar kenyamanan browse dan performa. Semua keyframe dalam tabel adalah target desain yang diajukan, **bukan ukuran atau pergerakan asli yang diklaim identik dengan Shopify**.

### Scene 01: HERO — “DEVELOPER” (scroll progress 0–100%)

**Layout awal:** Langit kota Renaissance terang, red curtain di kiri-atas, karakter back-view/3/4 duduk pada meja di tengah-kanan. Headline `DEVELOPER` besar di belakang kepala/foreground terpilih, paragraf editorial di bawah. Navbar fixed di atas.

| p | Kamera | Tokoh / aset bergerak | Tipografi / content |
|---:|---|---|---|
| 0.00 | Wide, eye level, scale 1.00 | Kursi & meja tenang, tokoh duduk | `DEVELOPER` visible, kecil `A PERSONAL EDITION` |
| 0.12 | Dolly-in 1.05×, naik 2vh | Kertas depan drift 12px, curtain pan sangat halus | Headline tetap agar terbaca |
| 0.28 | Dolly-in 1.12×, sedikit ke kanan | Kamera mendekat belakang bahu; globe tetap di sisi kiri | Paragraph masuk perlahan di atas meja |
| 0.42 | Kamera ke tangan yang menggambar/laptop | Tangan bergerak 4–8°, kertas miring; monitor code menajam | `DEVELOPER` terdorong keluar atas |
| 0.58 | Camera crosses shoulder | Layar laptop/hologram tumbuh sampai 35% lebar frame | Caption `I build worlds on the web` muncul singkat |
| 0.74 | Dolly-in ke lembar sketsa / monitor | Hologram membesar menutupi 65% viewport; kursi lenyap di edge | Copy fade saat mendekati portal |
| 0.88 | Projected paper/screens fill viewport | Grain/brush-edge mask masuk dari sisi kanan (subtle) | Tidak ada teks besar bertumpuk |
| 1.00 | Fully covered by paper tone / screen light | Scene 02 sudah terungkap | About headline siap masuk |

**Anchor positions:** back-view maker: origin≈`(54vw, 57vh)`; desk≈`(52vw, 79vh)`; chair≈`(52vw, 78vh)`; armillary≈`(19vw, 59vh)`; hologram≈`(67vw, 47vh)`. Ini layout **konseptual**, disesuaikan dengan proporsi sprite masing-masing.

**Motion utama:** gerakkan **camera rig**, bukan semua prop ke segala arah. Jika memakai DOM-only, simulasi dolly dengan menggeser/scale satu `.scene-world` dan jadikan kertas di layer terpisah untuk pergerakan lebih cepat.

### Scene 02: ABOUT — “THE MAKER” (0–100%)

Buka ke palette cream/ivory, lebih hening setelah Hero kompleks. Orang sama, kini 3/4 side profile di kursi kerja dan memegang laptop. Gambar ilustrasi Renaissance/kertas besar menampakkan isi cerita.

| p | Visual | Gerak | Copy |
|---:|---|---|---|
| 0.00 | Kertas full-frame | Serat/pergamena bergerak pergi ke kiri | `ABOUT` perlahan tampil |
| 0.18 | Frame 55% teks / 45% tokoh | Tokoh slide 3vw, meja/kursi tetap | `A CURIOUS MIND` serif editorial |
| 0.38 | Tokoh membaca laptop | 2–3 kertas terbang pelan dari belakang ke depan | Bio pendek maksimal 3 baris |
| 0.57 | Close-up kaca mata / tangan | Dolly 1.15×, kursi menyusut keluar | Skills teaser: `Art, code, systems.` |
| 0.78 | Kertas yang memuat sketsa interface lewat kamera | Parchment-01 scale 1.0→2.3 | Text keluar menuju kiri |
| 1.00 | Kertas menjadi transisi gelap ke hologram | Bright cream→deep blue | Section Skills dimulai |

**Penempatan:** teks kiri x=9vw, y=23vh; tokoh kanan x=65vw, y=56vh. Hindari potret terlalu ramai sampai menutupi kata.

### Scene 03: SKILLS — “WHAT I BUILD” (0–100%)

Tokoh tetap manusia dengan kostum Renaissance, **bukan patung**. Duduk/berdiri menghadapi beberapa interface digital. Globe astronomi nyata menjadi konektor: dari bola logam ia bertransformasi ke orbital hologram biru.

| p | Kamera / objek | Content |
|---:|---|---|
| 0.00 | Dark workshop; globe foreground kiri, monitor kecil | Giant `SKILLS` muncul |
| 0.18 | Globe rotate Y 15°; light dari laptop | `Design` muncul satu judul |
| 0.34 | Hologram panel 1 membesar dan bergeser kiri | `UI / UX` + 1 kalimat |
| 0.51 | Kamera orbit mini (maks 4°); panel 2 reveal | `Frontend Development` + selected tools |
| 0.68 | Hologram panel 3, bukan semua panel bersamaan | `Creative Coding / 3D` |
| 0.84 | Globe/hologram meluas lalu menjadi bidang rectangular | `Explore my work` CTA |
| 1.00 | Bidang rectangular mengisi seluruh frame | Cover project 01 terlihat |

**Aturan:** satu disiplin tampil dominan tiap beat. Pada p=0.68 boleh terlihat judul disiplin lain tetapi redup. Jangan menumpuk 10 ikon tool di depan wajah karakter.

### Scene 04: SELECTED WORK — “WORK” (0–100%)

Saat globe → layar persegi, **project 01 tumbuh dari hologram yang sama**. Pada desktop project track bergerak horizontal mengikuti scroll vertikal; kontennya tetap ringkas dan bisa diklik. Jangan membuat 12 kartu muncul bersamaan.

| p | Visual | Interaksi |
|---:|---|---|
| 0.00 | Full-frame project 01 cover | Giant `WORK` di kiri atas |
| 0.20 | Project 01 scale turun ke editorial tile | Info 1 proyek muncul |
| 0.38 | Track bergeser ±1 card | Project 02 center |
| 0.60 | Track bergerak ke next project | Project 03 center |
| 0.80 | Project 04 center | Link `VIEW CASE STUDY` usable |
| 1.00 | Last card hampir mengisi screen | CTA `FULL ARCHIVE` menuju portal |

Prefer 3–4 selected projects saja. Grid lengkap di route Archive. Akses link dengan mouse/keyboard harus tetap bisa dilakukan ketika layer terlihat. Jangan menaruh overlay transparan yang mencegat pointer.

### Scene 05: ARCHIVE TRANSITION — “ENTER THE ARCHIVE” (0–100%)

Selected card berubah menjadi lembar sketsa melayang / frame besar yang berfungsi sebagai pintu. Kamera benar-benar *bergerak melewati* bidang itu; jangan hanya fade-to-black.

| p | Visual |
|---:|---|
| 0.00 | Background gelap; satu paper/screen floating di center |
| 0.25 | Paper naik 5vh dan rotate Z 5°, aspect berubah perlahan |
| 0.50 | Camera zoom; bidang mengisi 50% viewport |
| 0.75 | Bidang mengisi 90%; gradient/brush edge menyembunyikan cut |
| 1.00 | Underlay archive page tampil; browser scroll berhenti normal di section berikutnya |

**Routing:** Jangan redirect otomatis hanya karena pengguna scroll melewati 100%; biarkan CTA `ENTER ARCHIVE` yang mengunjungi `/archive.html`. Untuk efek halaman: klik CTA → animasi paper menutup layar → router pindah → reveal dari paper ke grid. Navigasi biasa tetap bekerja sebagai fallback.

### Scene 06: CONTACT — “LET'S BUILD SOMETHING” (0–100%)

Ending sederhana: cream scene, sedikit lembar kertas, tangan yang meraih, tokoh samping dengan laptop tertutup. Hanya dua CTA: Email dan See archive.

| p | Visual | Copy |
|---:|---|---|
| 0.00 | Light paper gradient, kosong | `LET'S TALK` |
| 0.33 | Tangan kiri masuk 8vw, kertas kecil bergeser | `Have an idea?` |
| 0.67 | Tangan kanan muncul secara selaras; jarak antarjari makin dekat | `Let's make it real.` |
| 1.00 | Hold frame, tidak seluruhnya hilang | Email / GitHub / LinkedIn visible |

Jangan klaim tangan benar-benar dapat menyentuh jika aset tidak memiliki rig; dengan PNG baru translasi/rotasi/scale dapat menyimulasikan pendekatan saja.

---

## 5. Memindahkan benda dari satu section ke berikutnya (*object continuity*)

**Ini rahasia agar situs terasa seperti satu film, bukan slideshow.**

| Dari → Ke | Objek penghubung | Animasi kontinuitas |
|---|---|---|
| Hero → About | Kertas/monitor | Scale naik + pan kamera + paper mask reveal; warna latar mengikuti kertas |
| About → Skills | Gambar lingkaran pada kertas | Diagram lingkaran berubah menjadi globe/hologram 3D melalui cross-section match-cut |
| Skills → Work | Hologram rectangular | Panel yang sudah ada membesar menjadi kartu proyek (jangan spawn kartu dari nol) |
| Work → Archive | Kartu project terakhir | Bertukar menjadi lembar arsip besar, diklik untuk route baru |
| Archive → Contact | Kertas cover / tangan | Close-up halaman berubah menjadi balasan surat/CTA personal |

**Implementation detail:** Bila dua adegan menggunakan benda yang tampak sama, buat **shared transition layer** yang hidup di luar subtree chapter (`#transitionOverlay`). Salin koordinat awal layar objek dengan `getBoundingClientRect()` untuk FLIP-like movement, animasikan ke koordinat target, baru selesaikan scene swap. Jangan membuat 2 benda yang tidak sinkron lalu crossfade terlalu cepat.

### Camera direction constraints

- Default slow dolly: 1.0× → 1.15× per chapter.
- High-impact pass-through: maksimal 2.2–3× dan hanya pada transition beat.
- Rotation: Z ≤ 8°, Y ≤ 6° untuk non-rigged DOM sprites; untuk 3D camera gunakan easing hati-hati.
- Foreground parallax 1.25×, middle 1×, background 0.3×; ini relatif, bukan fixed pixel.
- Tidak ada camera shake random, heavy chromatic aberration atau excess lens flare.
- Untuk *depth camera* scene painting, gunakan depth map/displacement bila tersedia; jika tidak, fake parallax dengan layer 2D.

---

## 6. Teknik implementasi recommended

### Pilihan terbaik untuk source yang sudah vanilla JS

1. **Phase 1 (langsung dapat diuji):** GSAP + ScrollTrigger + HTML/CSS layered PNG; viewport pinned, reversible scroll scrub.
2. **Phase 2:** Integrasikan Three.js scene untuk globe, hologram, desk/parchment depth, camera movement. Jangan langsung buat semuanya 3D.
3. **Phase 3:** Model karakter `.glb` yang sudah rigged; bind karakter, tangan, dan camera ke keyframes via Theatre.js atau GSAP — **pilih satu master timeline per properti**, tidak dua engine saling berebut kontrol posisi.
4. **Phase 4:** GPU memory/perf optimization; fallback static visual untuk mobile lemah atau reduced-motion.

Jika proyek sudah React, React Three Fiber sah digunakan. Jika belum React, **pakai Three.js native** agar tidak mengganti framework cuma demi efek.

### 6A. GSAP ScrollTrigger minimal starter (desktop DOM layers)

```js
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
  // Animate CHILDREN of the pinned scene, not the pinned root itself.
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '.hero-chapter',
      pin: '.hero-viewport',
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 3.4)}`,
      scrub: true,   // exact scroll position, reversible, no smoothing lag
      anticipatePin: 1,
      invalidateOnRefresh: true,
      markers: false,
    },
  });

  // Total timeline = ~4 normalized design units.
  gsap.set('.hero-hologram', { autoAlpha: 0, scale: 0.5 });
  gsap.set('.hero-about-underlay', { autoAlpha: 0 });

  tl.to('.hero-world', { scale: 1.12, xPercent: -4, duration: 1.8 }, 0)
    .to('.hero-character', { xPercent: 8, yPercent: -4, scale: 1.16, duration: 1.8 }, 0)
    .to('.hero-title', { yPercent: -70, autoAlpha: 0, duration: 0.85 }, 1.0)
    .to('.hero-paper', { xPercent: -18, yPercent: -15, rotation: -5, duration: 1 }, 1.2)
    .to('.hero-hologram', { autoAlpha: 1, scale: 1, duration: 0.7 }, 1.45)
    .to('.hero-hologram', { scale: 2.7, xPercent: -20, duration: 1.25 }, 2.35)
    .to('.hero-about-underlay', { autoAlpha: 1, duration: 0.9 }, 3.0)
    .to('.hero-character', { autoAlpha: 0, duration: 0.5 }, 3.35);

  const onAssetsReady = () => ScrollTrigger.refresh();
  window.addEventListener('load', onAssetsReady, { once: true });
  return () => window.removeEventListener('load', onAssetsReady);
});

mm.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
  // Simpler flow: normal vertical sections, static key art, small opacity reveals.
});
```

**Caution:** Kalau versi lama memakai native interpolator (`data-motion` dan `requestAnimationFrame`), **hapus atau nonaktifkan driver lama pada scene yang sama** sebelum memasang GSAP. Dua animator yang mengatur `transform` target sama akan menghasilkan jitter. GSAP docs: https://gsap.com/docs/v3/Plugins/ScrollTrigger/ .

### 6B. Jika memakai Three.js untuk posisi 3D

```js
// Conceptual camera/property scrubbing from a ScrollTrigger timeline:
const state = { progress: 0 };
const cameraMotion = gsap.timeline({
  scrollTrigger: {
    trigger: '.skills-chapter',
    start: 'top top',
    end: () => `+=${Math.round(innerHeight * 4.6)}`,
    pin: '.skills-viewport',
    scrub: true,
    invalidateOnRefresh: true,
  },
});

cameraMotion.to(state, {
  progress: 1,
  ease: 'none',
  onUpdate: () => {
    const t = state.progress;
    // Replace the next lines with camera + rig keyframe sampling.
    camera.position.z = 8 - t * 2.6;
    globe.rotation.y = t * Math.PI * 0.35;
  },
});
```

Untuk art-directed track dengan banyak properti, **Theatre.js** cocok sebagai pengatur sequence camera, model dan light. Jika Theatre.js memegang properti, Scrub timeline menggerakkan `sequence.position` saja: jangan animasikan `camera.position` secara simultan dengan GSAP tween lain.

### 6C. Contoh kebutuhan render order pada 3D

```text
Render layer 0: far sky / matte background (optional depth mesh)
Render layer 1: architectural middle-ground
Render layer 2: rigged character + chair + desk + globe
Render layer 3: hand prop / parchment planes
Render layer 4: transparent hologram shader planes
Render DOM: typography + navigation + actual links (outside canvas)
```

**Do not:** merender semua text sebagai PNG, animasi scroll dengan `setTimeout`, memaksa wheel events untuk snapping keras, atau pakai 24 screenshot sebagai frame animation utama. Screenshot hanyalah storyboard; scene harus memakai layer yang sama agar continuity nyata.

---

## 7. Transition effects library

| Efek | Sebaiknya muncul di mana | Cara implementasi | Hindari |
|---|---|---|---|
| **Perspective dolly** | Hero → About | camera position / world scale bertahap | Zoom mendadak 3× tanpa depth |
| **Brushstroke reveal** | Pindah artwork keras | SVG mask / alpha edge kecil | Mask penuh yang menutupi teks terlalu lama |
| **Page-to-world** | About → Skills | Kertas scale + match-cut circle ke orbital globe | Menghilangkan semua benda sekaligus |
| **Hologram-to-project** | Skills → Work | shared DOM/3D panel + transform shape/scale | Dua objek yang tidak align |
| **Camera under desk** | Hero / About | Occlusion meja foreground saat dolly-down | Mesh meja tembus karena salah depth |
| **Parallax with restraint** | Seluruh pin chapters | Separate foreground/mid/background speeds | 15 layer bergerak cepat sekaligus |
| **Narrative typography wipe** | Setiap label chapter | Clip/transform per line, tetap teks DOM | Per-character split untuk semua paragraf |

### Timing dan easing

- Untuk timeline yang scrub langsung ke scroll: `ease: 'none'` pada transform utama agar perjalanan tidak tersentak; *art-directed* ease boleh dilakukan dengan nested keyframe atau Theatre.js curves bila continuous.
- Transisi antar-scene dialokasikan sekitar 15–25% akhir chapter; jangan menambah layar loading tiap pindah bab.
- Idle micro-animation: ±1–3px paper wobble, ±1–2° globe rotation, candle light flicker di luar scroll master; **tidak mengubah posisi utama character/camera**.
- Saat user berhenti scroll, perpindahan scene utama berhenti di posisi yang sama (dengan `scrub: true`; bukan `scrub: 1` yang masih catching-up singkat).

---

## 8. Responsive behavior dan accessibility

**Desktop ≥ 1024px:** Full 3D / pinned WebGL on capable GPUs, main experience.  
**Tablet 768–1023px:** Reduced perspective and fewer visible paper layers, big display font scaled down.  
**Mobile < 768px:** 2.5D or static background, pinned sections jauh lebih singkat (≤150vh tiap scene), headline tidak terpotong, top CTA accessible, optional WebGL based on capability.  
**`prefers-reduced-motion`:** No forced pin odyssey, no camera pass-through, direct content flow; maintain links, content and hierarchy.

- Pastikan teks layak dibaca 4.5:1 untuk body, hindari teks putih di atas awan terang tanpa gradient.
- Keyboard nav bisa mencapai setiap tombol; tidak tertutup canvas transparan.
- `aria-hidden="true"` untuk gambar dekorasi; alt deskriptif untuk media proyek esensial.
- Jangan scroll-jack; `overflow-x: hidden` dipakai selektif.
- Perbarui chapter progress untuk screen readers bila bermanfaat, tapi jangan mengumumkan tiap persentase.

---

## 9. Performance targets dan asset preparation

1. Export source PNG dalam alpha bersih (tidak ada checkerboard digambar di RGB). Hindari halo merah/kuning pada transparansi: itu biasanya artefak generasi.
2. Source 2D minimum: karakter 2048px tinggi untuk desktop close-up; prop utama 1024–2048px; compress ke WebP lossless/AVIF bila alpha tetap baik; tetap simpan master PNG untuk 3D workflow.
3. GLTF: export GLB with draco/meshopt where possible; textures KTX2/Basis; profile draw calls dan texture memory.
4. Lazy-load scenes 2+; preload scene pertama dan scene berikutnya. Jangan memuat 10 karakter high-res bersamaan saat landing.
5. Kualitas bertingkat: high (rigged + shader) → medium (simpler scene) → low (2.5D) → fallback (static artwork). Pantau FPS, long tasks, memory.
6. Angka perangkat target: aspirasi 60fps pada desktop layak, tidak menjamin setiap device 60fps. Akurasi gerak lebih penting daripada efek kompleks.
7. Pada loading awal, utamakan headline dan visual posterior rendah-res terlebih dahulu, lalu enhance.

### Quality gate untuk aset 2D → 3D

Karakter full body harus memiliki **front, profile, 3/4, back** dan pakaian/aksesoris konsisten. Tangan kanan/kiri memerlukan pose spesifik jika akan di-rig. Kursi/meja/globe disediakan dalam objek terpisah, idealnya juga 3/4 view dan side view. Simpan prompt/seed/style notes agar asset 3D tidak berganti kostum antarangle. Jangan gunakan satu PNG karakter sedang duduk sebagai satu-satunya sumber untuk rigging berjalan.

---

## 10. QA acceptance checklist — definisi "mirip rasa Shopify"

- [ ] 1 viewport pada 1440×900 terasa clean: satu giant heading + satu tokoh manusia, tanpa card clutter.
- [ ] Character benar-benar terpisah dari background. Meja, kursi, globe, hologram tidak baked ke langit.
- [ ] Berhenti scroll di 37%: scene freeze; scroll balik ke 14%: posisi kembali sama persis.
- [ ] Camera pass-through setidaknya dua kali terasa menyambungkan objek: Hero→About dan Skills→Work.
- [ ] Hero title besar sans, description serif; UI kecil dan punya hierarchy seperti screenshot acuan.
- [ ] Tidak ada patung sebagai pemeran utama (patung kecil pada artwork/kertas boleh sebagai detail sekunder).
- [ ] Project CTA bisa diklik tanpa menunggu sequence selesai; archive dapat diakses via nav.
- [ ] Pada mobile, orang tetap terlihat wajar dan judul tidak menutupi wajah.
- [ ] Tidak ada clipping/hard seam pada alpha karakter/kertas/glow.
- [ ] FPS dan memory diuji pada perangkat nyata; fallback bekerja.
- [ ] Reduced-motion menyediakan alur konten lengkap tanpa pin berat.
- [ ] Tidak ada dua engine yang menulis satu `transform` bersamaan.

### Review screenshots yang harus diekspor per scene

Frame penting untuk QA: p=`0%, 15%, 30%, 45%, 60%, 75%, 90%, 100%` pada Hero, About, Skills, Work dan p=`0,50,100` pada Portal/Contact. **Satu file screenshot per progress**, jangan dijadikan satu collage sebagai pengganti output per frame. Filename contoh `hero-p00.png`, `hero-p45.png`, `skills-p60.png`.

---

## 11. Rencana implementasi untuk Codex / OpenCode

**Phase A: layout architecture**  
Inspeksi repo; pertahankan framework; buat struktur chapter, stage 100vh, header fixed, typography dan data proyek nyata. Gunakan PNG background vs foreground terpisah. Pastikan bisa scroll normal tanpa animasi dulu.

**Phase B: GSAP story motion**  
Buat timeline `hero`, `about`, `skills`, `work`, `archive-portal`, `contact` dari tabel keyframe. `ScrollTrigger` native scroll, `scrub:true`, `pin:true`, `invalidateOnRefresh:true`. Periksa forward + reverse at arbitrary scroll point.

**Phase C: 3D polish**  
Ganti globe dan 1 hologram ke Three.js, lalu tambahkan depth mesh scene. Integrasi GLB karakter baru hanya setelah front/side/back rig tersedia. Opsional Theatre.js untuk camera animation authoring.

**Phase D: navigation + responsive + QA**  
Archive filter, project details, CTA, modal, skip animation/reduced motion, performance tiers; screenshot per checkpoint.

### Copy-paste instruction to coding agent

> Inspect the existing repository, preserve its framework and real content. Implement the attached DESIGN.md as a Shopify Editions Winter ’26-inspired *original personal portfolio*: clean full-screen Renaissance-human scenes with laptop, desk, chair, globe, paper and hologram as independently animated layers. The master transition timeline must be genuinely scroll-scrubbed, pinned, reversible and accessible. Use GSAP ScrollTrigger for DOM, Three.js only where needed; do not introduce React if absent. Implement object-continuity transitions Hero→About (paper/monitor pass-through) and Skills→Work (hologram morph to project cover); keep large sans chapter typography and serif editorial statements. Start with a working Hero→About proof-of-concept, verify scroll forward/backward and responsive before finishing remaining scenes. Never flatten all props into one image. Remove any previous scroll driver that conflicts with GSAP. Produce QA screenshots at scroll checkpoints and report what was tested.

---

## 12. Sources dan ruang lingkup klaim

- Live visual reference: https://www.shopify.com/editions/winter2026
- Shopify engineering thread (Three.js/R3F, depth maps, GLTF, Theatre.js, optimization): https://threadreaderapp.com/scrolly/2001335712982147307
- Shopify award project (parallax, animation, art direction): https://rgd.ca/hiring-designers/award-winners/2026-in-house-award-winners/the-renaissance-edition
- GSAP ScrollTrigger behavior (`pin`, `scrub`, refresh, matchMedia): https://gsap.com/docs/v3/Plugins/ScrollTrigger/

The actual Shopify source design, assets, rigs, and precise timing are proprietary / not reproduced here. Keyframe percentages, camera distances, title treatment, palette and motion choreography above are **original proposed directions inspired by inspected references**, not a literal reconstruction of Shopify's hidden timeline.
