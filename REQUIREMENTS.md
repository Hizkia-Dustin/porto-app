# Requirements — Renaissance Portfolio

Tanggal audit: 25 Oktober 2026.
Status: desain dan inventaris aset sudah ditinjau; aplikasi masih template Next.js. Animasi belum diimplementasikan.

## 1. Acuan yang dipakai

- `DESIGN (2).md` menjadi spesifikasi awal.
- Arahan pengguna terbaru: gambar pertama menjadi acuan layout keseluruhan; gambar kedua menjadi inspirasi Hero/Intro.
- Brief teks terlampir menjelaskan target transisi WebGL: lukisan berwarna → outline bercahaya → partikel → rekonstruksi adegan berikutnya.
- Dokumen ini mencatat penyesuaian dan kebutuhan berdasarkan pemeriksaan repository. Pernyataan teknis tentang implementasi internal Shopify dalam dokumen lama belum diverifikasi ulang; bukan dasar klaim bahwa situs ini sudah meniru teknologi atau efeknya.

### Penyesuaian terhadap desain lama

1. Hero memakai karakter **melayang**, bukan langsung tokoh duduk membelakangi kamera. Tokoh duduk menjadi fokus About.
2. Hero mengambil rasa lukisan penuh layar, pose melayang, kedalaman antarlayer, navigasi kecil, dan ruang editorial dari gambar kedua. Logo, konten Shopify, serta properti belanja tidak disalin.
3. Gambar pertama adalah storyboard sepuluh frame, bukan sepuluh panel pendek yang ditampilkan sekaligus. Tiap adegan utama diberi ruang layar sendiri.
4. Hero → About memakai outline dan particle reconstruction sesuai brief terbaru. Contoh DOM opacity/scale dalam desain lama hanya cocok untuk fallback atau blocking awal, bukan hasil akhir efek ini.
5. About → Skills memakai layar laptop sebagai penghubung utama. Skills → Work mempertahankan panel hologram yang berubah menjadi preview proyek.
6. Route menyesuaikan Next.js App Router: rencana `/archive` dan `/project/[slug]`, bukan `/archive.html`.

### Arahan komposisi Hero

- Background lukisan mengisi viewport; karakter dan properti tetap layer terpisah.
- Satu karakter melayang menjadi fokus; karakter kedua tidak wajib hanya karena muncul pada referensi Shopify.
- Sisakan sekitar 35–45% ruang untuk teks; jangan menutup wajah atau tangan dengan judul.
- Copy awal mengikuti storyboard: `IDEAS IN MOTION`, dengan bio singkat. Tipografi editorial dapat memakai Cormorant Garamond untuk statement ini; Inter Tight untuk judul bab besar dan Inter untuk UI, mengikuti peran font pada brief.
- Putuskan posisi teks setelah mencoba crop aset di desktop dan ponsel. Jangan memaksakan panel tengah referensi Shopify jika menabrak karakter.
- Cahaya krem, langit biru redup, kain biru tua/emas, dan kontras gelap di bab interior. Background sunset yang ada bisa dipakai untuk percobaan, tetapi berbeda dari daylight lembut referensi.

## 2. Susunan halaman dari storyboard

| Frame | Isi | Bentuk implementasi yang direncanakan |
|---|---|---|
| 01 | Hero / Intro | Adegan pembuka penuh layar, inspirasi gambar kedua |
| 02 | Transition / Ideas become stories | Bagian timeline Hero → About, bukan route baru |
| 03 | About / A creative mind | Tokoh duduk di ruang kerja, bio pendek |
| 04 | Values / Same curiosity, different tools | Beat editorial sesudah About; tangan/pena sebagai penghubung jika aset tersedia |
| 05 | Skills & tools | Tokoh dan panel digital; disiplin tampil bergantian |
| 06 | Transition / From ideas to reality | Panel Skills menjadi preview proyek |
| 07 | Selected work | Tiga proyek unggulan dengan link case study |
| 08 | Project detail | Halaman `/project/[slug]`; bukan semua detail dimasukkan ke scroll homepage |
| 09 | Archive | Preview di homepage dan halaman `/archive` untuk filter/browse |
| 10 | Contact | Outro terang dengan email dan tautan sosial nyata |

Header: Home, Work, Archive, About, Contact. Skills dan Values tetap dapat dicapai melalui anchor/chapter navigation. Tidak ada redirect otomatis berdasarkan posisi scroll.

## 3. Kondisi repository yang terverifikasi

- Next.js `16.4.3`, React/React DOM `19.3.0`, Tailwind CSS `^4` tercatat di `package.json`.
- `src/app/page.js`, `src/app/layout.js`, dan `src/app/globals.css` masih starter.
- GSAP, Three.js, React Three Fiber, dan Theatre.js belum tercantum sebagai dependency langsung.
- Ada 19 PNG di `public/assets`: 17 RGBA dengan rentang alpha 0–255 dan 2 RGB (background serta storyboard).
- Alpha telah diperiksa secara numerik dan gambar dilihat dalam contact sheet. Kebersihan fringe pada ukuran penuh belum diuji.
- Tidak ditemukan GLB/GLTF atau depth map dalam inventaris `public`.
- Nama aset dalam tabel lama seperti `scholar-working.png` dan `desk.png` bukan file yang ditemukan di repo ini. Jangan mengimpor nama tersebut seolah asetnya sudah tersedia.

### Inventaris aset yang dapat dipakai

Semua path di tabel ini relatif terhadap repository. Nama folder `backgorund` adalah ejaan file yang benar-benar ada; belum diubah.

| File | Hasil inspeksi / penggunaan |
|---|---|
| `public/assets/karakter/backgorund/ChatGPT Image Oct 25, 2026, 10_45_28 AM.png` | Background kota/alam sunset, RGB 1672×941; dapat dipakai untuk blocking Hero |
| `public/assets/karakter/ChatGPT Image Oct 25, 2026, 10_37_33 AM.png` | Pria melayang, RGBA 1448×1086; kandidat utama Hero, perangkat/hologram masih menyatu |
| `public/assets/karakter/ChatGPT Image Oct 25, 2026, 10_37_59 AM.png` | Pria duduk memakai laptop, RGBA 1086×1448; kandidat About, laptop menyatu |
| `public/assets/karakter/ChatGPT Image Oct 25, 2026, 10_38_10 AM.png` | Perempuan melayang dengan panel, RGBA 1448×1086; alternatif, tidak wajib ditambahkan |
| `public/assets/karakter/ChatGPT Image Oct 25, 2026, 10_38_42 AM.png` | Pose pria duduk lain dengan laptop, RGBA 1161×1354; alternatif About/Skills |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_38_23 AM.png` | Panel hologram horizontal |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_47_27 AM.png` | Lembar parchment dengan sketsa potret |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_47_39 AM.png` | Lembar parchment dengan diagram astronomi |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_47_52 AM-1.png` | Panel hologram horizontal alternatif |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_47_53 AM-2.png` | Panel hologram vertikal bergambar bunga |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_47_55 AM-3.png` | Globe/orbit bercahaya; sprite datar, bukan armillary fisik atau model 3D |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_47_56 AM-4.png` | Susunan panel melengkung yang menyatu dalam satu sprite |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_47_57 AM-5.png` | Susunan panel dan orbit yang menyatu |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_47_58 AM-6.png` | Parchment sketsa patung; boleh sebagai isi kertas, bukan karakter utama |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_48_00 AM-7.png` | Parchment diagram orbit |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_48_02 AM-8.png` | Parchment sketsa kupu-kupu |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_48_03 AM-9.png` | Gambar tangan di atas parchment; bukan cutout tangan terpisah |
| `public/assets/karakter/etc/ChatGPT Image Oct 25, 2026, 10_48_05 AM-10.png` | Parchment sketsa kolom arsitektur |
| `public/assets/karakter/inspiration/Ideas in Motion_ Portfolio Storyboard.png` | Referensi layout RGB; tidak dijadikan satu background halaman |

## 4. Kebutuhan gambar baru

Nama dalam kolom output berikut adalah **usulan**, belum berupa file yang tersedia. Lokasi rencana: `public/assets/`. Utamakan aset yang kurang; tidak perlu membuat ulang seluruh koleksi.

| Prioritas | Output usulan | Brief gambar | Kapan diperlukan |
|---|---|---|---|
| P0 | `backgrounds/about-workroom.webp` | Interior studio Renaissance gelap, cahaya hangat dari kanan, ruang teks di kiri, ruang tokoh/meja di kanan. Tanpa orang, meja utama, kursi utama, laptop, atau teks tertanam | Agar About memiliki lingkungan sendiri |
| P0 | `props/desk.png` | Meja kayu Renaissance tunggal, perspektif 3/4 cocok dengan tokoh duduk. Permukaan kosong; tanpa globe, buku, laptop, kursi, lantai | Komposisi About berlayer |
| P0 | `props/chair.png` | Kursi Renaissance tunggal, sudut dan pencahayaan sama dengan meja serta karakter About. Tanpa orang | Komposisi About berlayer |
| P0 | `characters/maker-seated-clean.png` | Karakter pria yang konsisten dengan Hero, pose duduk bekerja di meja; tangan terlihat, tanpa laptop/kursi yang menyatu | Pemisahan karakter dari layar saat About → Skills |
| P0 | `props/laptop.png` | Laptop terbuka dengan layar kosong, sudut cocok dengan tangan dan meja About, alpha asli | Target pendekatan kamera ke layar; isi layar dibuat di aplikasi |
| P1 | `characters/maker-floating-clean.png` | Karakter Hero yang sama, pose melayang dan kain tetap konsisten, tanpa panel/perangkat yang menyatu, seluruh tubuh tidak terpotong | Bila perangkat Hero akan dianimasikan independen; aset lama cukup untuk blocking |
| P1 | `backgrounds/hero-daylight.webp` | Lanskap lukisan Renaissance dengan langit biru abu, awan krem, vegetasi/arsitektur di tepi, tengah cukup tenang untuk teks. Tanpa orang, tulisan, atau properti modern | Mendekatkan suasana Hero ke gambar kedua |
| P1 | `props/armillary.png` | Armillary sphere kuningan fisik, objek tunggal, pencahayaan studio hangat, perspektif sesuai meja | Menyamai properti Skills pada storyboard |
| P1 | `characters/hand-left.png`, `characters/hand-right.png`, `props/pen.png` | Dua tangan berlengan kain Renaissance menjangkau dari sisi berlawanan, pena terpisah; tanpa lembar parchment atau background | Frame Values dengan tangan yang benar-benar terpisah |
| P1 | `projects/<slug>-cover.webp` | Screenshot atau artwork proyek asli, minimal tiga cover dan media pendukung case study | Selected Work dan Archive; gambar storyboard bukan bukti proyek pengguna |
| P2 | `backgrounds/contact-sky.webp` | Langit terang krem/biru dengan ruang teks kiri dan ruang karakter kanan, tanpa tokoh atau teks | Outro Contact; background Hero dapat dipakai ulang sementara |

### Spesifikasi ekspor

- Background: master sekitar 2560×1440 atau lebih lebar, dengan area aman untuk crop ponsel. Sediakan crop mobile jika subjek penting tidak bisa dipertahankan.
- Karakter: master PNG alpha, tinggi objek sekitar 2048px atau lebih untuk close-up. Aset sekarang masih cukup untuk percobaan komposisi, belum untuk zoom besar yang tajam.
- Prop: PNG alpha 1024–2048px sesuai ukuran tampil. Tidak ada checkerboard yang tergambar, frame, lantai, atau bayangan lantai yang menempel.
- Wajah, warna kulit, rambut, kostum, arah cahaya, dan perspektif harus konsisten antarscene. Gunakan karakter yang sudah tersedia sebagai referensi identitas.
- Background bersih harus menutup area di belakang karakter saat layer bergeser; jangan hanya menghapus objek lalu meninggalkan lubang.
- Simpan master dan ekspor web terkompresi secara terpisah; ukur hasil visual dan ukuran unduhan sebelum menentukan kualitas akhir.
- Teks UI, nama skill, dan tombol dibuat sebagai DOM, bukan ditanam dalam gambar.

### Kebutuhan 3D terpisah dari kebutuhan gambar

PNG berlayer bisa memberi kedalaman 2.5D dan menjalankan shader outline/partikel. PNG tidak menyediakan sisi belakang objek atau deformasi tubuh.

- Laptop/globe/desk yang perlu rotasi besar atau dilewati kamera: perlukan GLB dengan tekstur dan pivot yang benar.
- Karakter yang perlu berubah pose atau dilihat dari sudut berbeda: perlukan model rigged dan referensi front/side/back yang konsisten. Pergantian dua sprite lewat partikel bukan animasi tubuh volumetrik.
- Depth map opsional untuk displacement background harus sesuai gambar sumber; jangan memakai gambar grayscale acak.
- Untuk percobaan pertama, gunakan kamera dengan pergeseran terbatas pada layered planes. Batas 2.5D harus tetap dinyatakan sampai model 3D tersedia.

## 5. Rencana pengerjaan berikutnya

### Tahap A — layout dan komposisi

1. Baca panduan Next lokal yang relevan di `node_modules/next/dist/docs/` sebelum menulis kode, sesuai `AGENTS.md`.
2. Pertahankan App Router, React, dan Tailwind. Susun header, section, anchor, copy, serta fallback statis yang dapat dibaca tanpa WebGL.
3. Komposisikan Hero memakai background, karakter melayang, dan maksimum 3–5 kertas yang sudah ada. Teks tetap DOM; jangan memasang storyboard utuh sebagai halaman.
4. Siapkan About dengan aset P0; bila belum tersedia, beri status blocking sementara yang jelas, bukan klaim adegan final.
5. Cek komposisi desktop dan ponsel sebelum menambah gerak kompleks.

### Tahap B — satu transisi Hero → About yang lengkap

Tambahkan hanya GSAP dan Three.js bila diperlukan implementasi. React Three Fiber dan Theatre.js belum dibutuhkan untuk percobaan ini. Mulai dengan satu komponen client untuk lifecycle canvas/timeline, shader terpisah, serta satu daftar aset nyata; jangan langsung membuat banyak manager generik.

Hierarki: environment → karakter → props → kertas/panel → partikel → postprocessing. Camera rig mengatur pandangan; teks/nav berada di luar canvas. Render target memisahkan scene artwork dari DOM sehingga tulisan tetap tajam.

| Progress | Target visual dan teknis |
|---|---|
| 0–20% | Hero full color, ruang untuk membaca heading |
| 20–38% | Kamera mendekat, kertas foreground melewati sisi pandangan, heading keluar |
| 38–55% | Sobel terhadap hasil render scene; `uEdgeProgress` mengurangi warna dan memunculkan garis tipis putih/perak |
| 55–72% | Partikel bersumber dari sampel edge/surface dan depth layer; `uDissolveProgress` menguraikan bentuk, bukan sekadar menurunkan opacity satu gambar |
| 72–90% | Mask dan partikel mengungkap About; tujuan partikel mengikuti sampel scene berikutnya bila memungkinkan |
| 90–100% | About kembali full color, kamera stabil, teks muncul |

Satu ScrollTrigger memakai pin dan `scrub: true`. Progress mengendalikan kamera, posisi layer, serta uniform shader. Seed/sampel partikel tetap, posisi dihitung dari progress; jangan menggunakan simulasi maju per frame yang tidak bisa dibalik. Saat berhenti scroll, gerak transisi berhenti. Satu render loop; bersihkan listener, timeline, render target, geometry, material, texture, serta renderer saat unmount.

### Tahap C — perluas setelah transisi pertama lolos

1. About → Values → Skills: beat editorial singkat, lalu pendekatan ke layar laptop.
2. Skills → Selected Work: panel yang sama berganti menjadi cover proyek.
3. Selected Work → Archive preview: preview bergeser dan tersusun menjadi grid; CTA menuju route archive.
4. Archive preview → Contact: kertas/kartu menyebar dan mengungkap outro.
5. Lengkapi route archive dan case study dengan data proyek nyata. Jangan mengarang pengalaman, hasil proyek, alamat email, atau akun sosial.

### Tahap D — validasi

- Scroll maju/mundur ke titik 14%, 37%, 60%, 85%; posisi harus konsisten setelah kembali ke progress yang sama.
- Ambil screenshot tiap fase outline, dissolve, dan reconstruction; verifikasi efek nyata di browser, bukan hanya keberadaan kode shader.
- Uji resize, navigasi pergi/kembali, cleanup, WebGL tidak tersedia/context loss, keyboard, dan klik link pada layer aktif.
- `prefers-reduced-motion`: alur konten statis lengkap tanpa pin panjang. Mobile lemah: kurangi layer/partikel atau tampilkan fallback statis.
- Uji `npm run lint` dan `npm run build` setelah implementasi; ukur performa di browser/perangkat sebelum mengklaim 60fps.

## 6. Catatan kelanjutan jika sesi atau token habis

Tidak ada penghentian karena limit token pada audit ini. Dokumen ini menjadi checkpoint yang dapat dibaca sesi berikutnya.

**Sudah selesai:** membaca desain dan brief, memeriksa template/dependency, memeriksa 19 gambar beserta alpha, menyelaraskan referensi terbaru, mencatat aset kurang dan urutan implementasi.

**Belum dikerjakan:** perubahan UI, instalasi dependency, generasi gambar, shader/timeline, route archive/case study, dan pengujian browser.

**Langkah pertama berikutnya:** baca panduan Next lokal, kemudian kerjakan Tahap A menggunakan aset yang benar-benar ada. Prioritas aset baru adalah interior About, meja, kursi, tokoh duduk bersih, dan laptop terpisah. Setelah komposisi siap, kerjakan satu Hero → About sampai lolos uji sebelum memperluas semua scene.

**Informasi konten yang belum ada di repo:** nama/bio final, daftar skill yang benar, tiga proyek beserta media/URL, email, dan tautan sosial. Ini tidak menghalangi percobaan visual Hero, tetapi diperlukan sebelum portofolio dipublikasikan.

Pada akhir sesi implementasi berikutnya, perbarui bagian ini dengan file yang berubah, hasil tes yang benar-benar dijalankan, masalah terbuka, dan langkah konkret berikutnya.

### Pembaruan — 26 Oktober 2026: konten 3

- Menambahkan `ProjectOverview.js` sesudah About, berisi Ideas in Motion, Golden Ratio Intro, dan Flying Duo 3D sesuai pilihan pengguna. Gambar memakai artwork dummy dari aset lokal sesuai permintaan pengguna.
- Menambahkan navigasi Work, CTA dari About, penomoran tiga bab, overview yang dapat dibuka lewat keyboard, serta layout tiga kolom desktop dan satu kolom ponsel. Memperbaiki posisi tautan `#work` setelah intro melepas scroll lock.
- Validasi: `npm run lint`, `npm run build`, empat tes progress animasi, serta pemeriksaan browser pada 1440px dan 375px; gambar termuat, tidak ada overflow horizontal, navigasi dan disclosure bekerja termasuk pada mode tanpa animasi.
- Screenshot desktop: `artifacts/project-overview-desktop.png`. Artwork proyek asli dan pengujian perangkat fisik belum dilakukan.
