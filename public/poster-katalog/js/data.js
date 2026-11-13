/**
 * Database Galeri Paket El Massa Tour & Travel
 * Katalog Resmi Paket Umroh Musim 2026 / 2027
 * Keberangkatan: Start Jakarta (CGK) & Start Pangkal Pinang (PGK)
 * Format Judul: Title Case (Ramping, Estetik, Regular)
 */

const DEFAULT_ELMASSA_DATA = {
  settings: {
    WEBSITE_NAME: 'EL MASSA',
    WEBSITE_TAGLINE: 'Tour & Travel • Sahabat Ibadah Anda',
    WEBSITE_LOGO_URL: 'images/logo.png',
    COMPANY_NAME: 'PT. El Massa Berkah Wisata',
    SK_UMROH: 'No. 12042023901230001 (Kemenag RI)',
    SK_HAJI: 'No. 12042023901230002 (PIHK Resmi)',
    OFFICE_ADDRESS: 'Menara El Massa, Jl. TB Simatupang Kav. 88, Cilandak, Jakarta Selatan 12430',
    WHATSAPP_NUMBER: '6281171715125',
    WHATSAPP_CHANNEL: 'https://whatsapp.com/channel/0029VbElMassaOfficial',
    INSTAGRAM_URL: 'https://instagram.com/elmassatour',
    LAST_SEAT_UPDATE: new Date().toISOString()
  },

  categories: [
    'Semua',
    'Umroh Direct Flight',
    'Umroh Spesial Ustadz',
    'Umroh Akhir Tahun',
    'Umroh Sya\'ban',
    'Umroh Awal Ramadhan',
    'Umroh Syawal',
    'Umroh Awal Musim',
    'Umroh Liburan Sekolah'
  ],

  cities: [
    'Jakarta',
    'Pangkal Pinang',
    'Surabaya',
    'Solo',
    'Medan',
    'Makassar',
    'Bandung'
  ],

  airlines: [
    'Saudia Airlines',
    'Garuda Indonesia',
    'Qatar Airways',
    'Etihad Airways',
    'Oman Air'
  ],

  defaultInclude: [
    'Tiket PP (Start Pangkal Pinang / Jakarta sesuai program)',
    'Visa Umrah',
    'Hotel Mekkah dan Madinah',
    'Makan sehari 3 kali sesuai program',
    'City Tour Thaif',
    'Transportasi sesuai program',
    'Tour Leader',
    'Muthawwif (Pembimbing Ibadah)',
    'Bimbingan Manasik',
    'Bimbingan Kesehatan',
    'Sistem Pendampingan Jamaah Umrahme',
    'Perlengkapan Lengkap',
    'Air Zamzam 5 Ltr',
    'Bagasi 1x23 kg',
    'Dokumentasi Group'
  ],

  defaultExclude: [
    'Upgrade Kamar Triple: 3 Jt',
    'Upgrade Kamar Double: 5 Jt',
    'Biaya Pembuatan Paspor: 650 Rb',
    'Vaksin Meningitis dan Polio: 550 Rb',
    'Dokumentasi Pribadi',
    'Bagasi Tambahan',
    'Pengeluaran Pribadi'
  ],

  packages: [
    // -------------------------------------------------------------------------
    // 1. Umrah Special November 2026
    // -------------------------------------------------------------------------
    {
      id: 'pkg-01',
      title: 'Umrah Special November 2026 (10 Hari)',
      category: 'Umroh Direct Flight',
      tags: ['Free Thaif', 'Direct Saudia', 'Start Pangkal Pinang', '10 Hari', 'Quad Room'],
      programSummary: 'Program Umrah 10 Hari Spesial November 2026 (03 – 13 November 2026) keberangkatan khusus Start Pangkal Pinang bersama Saudia Airlines direct. Free City Tour Thaif & Pabrik Parfum. Menginap di Grand Al Massa Makkah & Daar El Naeem Madinah. DP Mulai 5 Juta Saja.',
      flyerUrl: 'images/poster-november-reguler-biasa.webp',
      thumbnailUrl: 'images/poster-november-reguler-biasa.webp',
      activeStatus: 'Aktif',
      createdAt: '2026-08-01T08:00:00.000Z',
      hotelMakkah: 'Grand Al Massa / Setaraf',
      hotelMadinah: 'Daar El Naeem / Setaraf',
      hotelExtra: 'Free City Tour Thaif & Pabrik Parfum',
      itinerary: [
        { day: 1, title: 'Hari 1 (03 Nov 2026): Keberangkatan Start Pangkal Pinang ➔ Jakarta ➔ Madinah Direct', route: 'Pangkal Pinang ➔ Jakarta ➔ Madinah (Saudia)', activities: ['Jamaah berkumpul di Bandara Depati Amir Pangkal Pinang persiapan take-off menuju Bandara Soekarno-Hatta (handling tim El Massa).', 'Berkumpul di Lounge Bandara Soekarno-Hatta Terminal 3 bersama tour leader.', 'Briefing, doa safar, dan pembagian boarding pass.', 'Penerbangan direct Saudia Airlines menuju Bandara Prince Mohammad bin Abdulaziz Madinah.', 'Tiba di Madinah, proses imigrasi, check-in Hotel Daar El Naeem dan istirahat.'] },
        { day: 2, title: 'Hari 2 (04 Nov 2026): Ziarah Raudhah & Masjid Nabawi', route: 'Madinah Al-Munawwarah', activities: ['Sholat fardhu berjamaah di Masjid Nabawi.', 'Ziarah Makam Rasulullah ﷺ, Abu Bakar Ash-Shiddiq, dan Umar bin Khattab.', 'Ziarah Raudhah Syarifah (Taman Surga) dengan tasreh resmi.', 'Tausiyah dan pemantapan rukun umroh di hotel.'] },
        { day: 3, title: 'Hari 3 (05 Nov 2026): Ziarah Kota Madinah', route: 'Madinah Al-Munawwarah', activities: ['Ziarah Masjid Quba (sholat sunnah bernilai pahala umroh).', 'Ziarah Jabal Uhud dan Makam Syuhada Uhud.', 'Mengunjungi Perkebunan & Pasar Kurma Madinah.', 'Ziarah Masjid Qiblatain & Masjid Khandaq.'] },
        { day: 4, title: 'Hari 4 (06 Nov 2026): Menuju Makkah & Pelaksanaan Ibadah Umrah 1', route: 'Madinah ➔ Makkah', activities: ['Persiapan ihram, mandi sunnah ihram di hotel Madinah.', 'Menuju Masjid Bir Ali untuk mengambil Miqat dan berniat Umroh.', 'Perjalanan menuju Makkah Al-Mukarramah dengan bus AC eksekutif.', 'Check-in Hotel Grand Al Massa Makkah.', 'Melaksanakan Ibadah Umroh Pertama (Thawaf, Sa\'i, dan Tahallul) bersama Muthawwif.'] },
        { day: 5, title: 'Hari 5 (07 Nov 2026): Memperbanyak Ibadah di Masjidil Haram', route: 'Makkah Al-Mukarramah', activities: ['Memperbanyak thawaf sunnah, tilawah Al-Qur\'an, dan sholat berjamaah di depan Ka\'bah.', 'Kajian rohani dan evaluasi pelaksanaan ibadah.'] },
        { day: 6, title: 'Hari 6 (08 Nov 2026): Ziarah Kota Makkah & Miqat Umrah 2 (Ji\'ranah)', route: 'Ziarah Makkah', activities: ['Ziarah napak tilas Jabal Tsur, Padang Arafah, Jabal Rahmah, Muzdalifah, dan Mina.', 'Mengambil Miqat di Masjid Ji\'ranah bagi jamaah yang ingin Umrah Kedua.', 'Kembali ke Masjidil Haram untuk pelaksanaan Thawaf, Sa\'i, dan Tahallul ke-2.'] },
        { day: 7, title: 'Hari 7 (09 Nov 2026): Free City Tour Kota Bersejarah Thaif', route: 'Makkah ➔ Thaif ➔ Makkah', activities: ['Perjalanan wisata alam dan sejarah ke Kota Sejuk Thaif.', 'Menikmati pemandangan pegunungan dan naik Teleferik / Cable Car.', 'Ziarah Masjid Abdullah bin Abbas dan Masjid Kuk.', 'Mengunjungi Pabrik Penyulingan Minyak Wangi Bunga Mawar Thaif.', 'Menikmati makan siang khas Nasi Mandhi Thaif.', 'Mengambil Miqat di Qarnul Manazil (As-Sail Al-Kabir) bagi yang berniat Umrah ke-3.'] },
        { day: 8, title: 'Hari 8 (10 Nov 2026): Ibadah Mandiri di Masjidil Haram', route: 'Makkah Al-Mukarramah', activities: ['Qiyamul lail dan sholat Subuh di Masjidil Haram.', 'Hari bebas untuk memperbanyak doa di Multazam, Hijir Ismail, dan berbelanja oleh-oleh di sekitar hotel.'] },
        { day: 9, title: 'Hari 9 (11 Nov 2026): Thawaf Wada\' & Menuju Bandara Jeddah', route: 'Makkah ➔ Bandara Jeddah', activities: ['Pelaksanaan Thawaf Wada\' (Thawaf Perpisahan) di Masjidil Haram.', 'Check-out hotel Grand Al Massa Makkah.', 'Perjalanan menuju Bandara Internasional King Abdulaziz Jeddah.', 'Proses check-in tiket dan bagasi Saudia Airlines, penerbangan menuju Jakarta.'] },
        { day: 10, title: 'Hari 10 (12-13 Nov 2026): Tiba di Jakarta & Lanjut ke Pangkal Pinang', route: 'Jeddah ➔ Jakarta ➔ Pangkal Pinang', activities: ['Insya Allah tiba dengan selamat di Bandara Soekarno-Hatta Jakarta.', 'Pengambilan air zamzam 5 liter dan bagasi koper.', 'Melanjutkan penerbangan domestik ke Bandara Depati Amir Pangkal Pinang.', 'Semoga meraih predikat Umroh yang Maqbul dan Mabrur.'] }
      ],
      schedules: [
        {
          id: 'sch-01',
          startCity: 'Pangkal Pinang',
          airline: 'Saudia Airlines',
          departureDate: '2026-11-03',
          returnDate: '2026-11-13',
          duration: 10,
          price: 34700000,
          dp: 5000000,
          availableSeats: 25,
          roomType: 'Quad Room (Grand Al Massa)',
          flightType: 'Connecting PGK ➔ Saudia Direct Landing Madinah'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 2. Umrah Special Bersama Ustadz Hanan Attaki
    // -------------------------------------------------------------------------
    {
      id: 'pkg-02',
      title: 'Umrah Special Bersama Ustadz Hanan Attaki (10 Hari)',
      category: 'Umroh Spesial Ustadz',
      tags: ['Bersama Ust. Hanan Attaki', 'Free Thaif', 'Landing Madinah', 'Start JKT & PGK', 'Bisa Upgrade ★5'],
      programSummary: 'Program Umrah 10 Hari dibimbing langsung oleh Ustadz Hanan Attaki. Penerbangan Saudia Airlines landing Madinah (SV821). Tersedia 2 pilihan keberangkatan: Start Jakarta (Rp 35 Jt) & Start Pangkal Pinang (Rp 37,6 Jt). Free City Tour Thaif & Pabrik Parfum. Pilihan upgrade Hotel Sofwah / Zamzam Tower ★5 (Rp 39,5 Jt). DP Mulai 5 Juta Saja.',
      flyerUrl: 'images/poster-november-hanan-attaki-pgk.webp',
      thumbnailUrl: 'images/poster-november-hanan-attaki-pgk.webp',
      flyerUrlJakarta: 'images/poster-november-hanan-attaki-jkt.webp',
      flyerUrlPangkalPinang: 'images/poster-november-hanan-attaki-pgk.webp',
      activeStatus: 'Aktif',
      createdAt: '2026-08-02T08:00:00.000Z',
      hotelMakkah: 'Grand Al Massa (Opsi Upgrade: Sofwah / Zamzam Tower ★5)',
      hotelMadinah: 'Daar El Naeem Hotel Madinah',
      hotelExtra: 'Free City Tour Thaif & Kajian Eksklusif Ust. Hanan Attaki',
      itinerary: [
        {
          day: 1,
          title: 'Hari 1 (16 Nov 2026): Pangkal Pinang ➔ Jakarta & Transit Dprima Hotel',
          route: 'Pangkal Pinang ➔ Jakarta',
          activities: [
            'Pukul 09.00 WIB: Jamaah asal Pangkal Pinang berkumpul di Bandara Internasional Depati Amir Pangkal Pinang untuk persiapan take-off ke Jakarta.',
            'Pukul 12.25 WIB: Take-off dari Pangkal Pinang dan tiba di Bandara Soekarno-Hatta Jakarta pukul 13.54 WIB.',
            'Menuju hotel transit di Jakarta (Dprima Hotel), istirahat dan menginap 1 malam.',
            'Pukul 19.30 WIB – Selesai: Pemantapan manasik umrah di mushalla/meeting room hotel transit bersama tim El Massa.'
          ]
        },
        {
          day: 2,
          title: 'Hari 2 (17 Nov 2026): Jakarta ➔ Madinah Direct (Saudia SV821)',
          route: 'Jakarta ➔ Madinah (Saudia Airlines)',
          activities: [
            'Pukul 05.30 WIB: Sarapan pagi dan berkumpul di lobby hotel untuk persiapan menuju Bandara Soekarno-Hatta Terminal 3 (jamaah asal Jakarta bergabung di bandara).',
            'Pukul 12.00 WIB: Penerbangan direct menuju Madinah menggunakan Saudia Airlines (SV821).',
            'Pukul 18.00 LT: Tiba di Bandara Prince Mohammad bin Abdulaziz Madinah.',
            'Perjalanan menggunakan bus eksekutif menuju Kota Madinah, check-in Hotel Daar El Naeem dan beristirahat.'
          ]
        },
        {
          day: 3,
          title: 'Hari 3 (18 Nov 2026): Ziarah Raudhah Syarifah, Masjid Nabawi & Sholat Jumat',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Memasuki Raudhah Syarifah (Insya Allah apabila Tasreh keluar sesuai jadwal resmi Nusuk):',
            '• Selesai Sholat Subuh – 11.00 Pagi: Jamaah Perempuan',
            '• 11.00 Pagi – Selesai Sholat Isya: Jamaah Laki-laki',
            '• Selesai Isya – 23.30 Malam: Jamaah Perempuan',
            '• 23.30 Malam – Sholat Subuh: Jamaah Laki-laki',
            'Ziarah dan pengenalan sekitar Masjid Nabawi: Saqifah Bani Sa\'idah (Bani Tsaqifah), Makam Rasulullah ﷺ dan Makam Sahabat (dari sisi luar masjid), Masjid Ali, Masjid Ghamamah, dan Pemakaman Baqi\'.',
            'Bersiap melaksanakan Sholat Jumat berjamaah di Masjid Nabawi. Selesai Sholat Jumat dilanjutkan acara bebas.'
          ]
        },
        {
          day: 4,
          title: 'Hari 4 (19 Nov 2026): Ziarah Jejak Sejarah Islam Kota Madinah',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Melaksanakan Tour & Ziarah jejak sejarah Islam di sekitar Kota Madinah:',
            '• Masjid Quba (Masjid pertama yang dibangun oleh Rasulullah ﷺ, sholat 2 rakaat bernilai pahala umrah).',
            '• Jabal Uhud & Makam Syuhada Uhud (napak tilas perjuangan para syuhada Perang Uhud).',
            '• Perkebunan & Pasar Kurma Madinah (kondisional).',
            '• Melewati Masjid Qiblatain dan Masjid Khandaq sepanjang rute perjalanan.',
            'Setelahnya acara bebas, jamaah memperbanyak ibadah di Masjid Nabawi (I\'tikaf, Tadarus Al-Qur\'an, Sholat Sunnah).'
          ]
        },
        {
          day: 5,
          title: 'Hari 5 (20 Nov 2026): Kajian Rohani Bersama Ustadz Hanan Attaki & Manasik',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Memperbanyak amal ibadah dan sholat fardhu berjamaah di Masjid Nabawi.',
            'Kajian eksklusif dan sesi muhasabah bersama Ustadz Hanan Attaki di hotel.',
            'Pemantapan manasik rukun umrah sebelum keberangkatan ke Makkah Al-Mukarramah.'
          ]
        },
        {
          day: 6,
          title: 'Hari 6 (21 Nov 2026): Madinah ➔ Miqat Bir Ali ➔ Makkah & Pelaksanaan Umrah 1',
          route: 'Madinah ➔ Bir Ali ➔ Makkah',
          activities: [
            'Koper diletakkan di depan pintu kamar masing-masing untuk proses check-out dari hotel Madinah dan bersiap menuju Makkah.',
            'Pukul 14.00 LT siang: Bus eksekutif berangkat menuju Masjid Bir Ali (Dzulhulaifah) untuk mengambil Miqat dan melafazkan niat Umrah dibimbing oleh Muthawwif.',
            'Jamaah laki-laki mengenakan pakaian ihram dan mematuhi seluruh larangan ihram.',
            'Selama perjalanan darat ke Kota Makkah, jamaah memperbanyak melantunkan Talbiyah.',
            'Setibanya di Makkah langsung menuju hotel untuk meletakkan barang/koper.',
            'Jika kamar belum ready, jamaah langsung melaksanakan prosesi Ibadah Umrah Pertama (Thawaf, Sa\'i, dan Tahallul) dibimbing oleh Muthawwif & Ustadz Hanan Attaki.'
          ]
        },
        {
          day: 7,
          title: 'Hari 7 (22 Nov 2026): Ibadah Khusyuk & Sholat Jumat di Masjidil Haram',
          route: 'Makkah Al-Mukarramah',
          activities: [
            'Acara bebas untuk memperbanyak ibadah di Masjidil Haram (I\'tikaf, Thawaf Sunnah, tilawah Qur\'an di depan Ka\'bah).',
            'Siang harinya seluruh jamaah melaksanakan ibadah Sholat Jumat berjamaah di Masjidil Haram.'
          ]
        },
        {
          day: 8,
          title: 'Hari 8 (23 Nov 2026): Ziarah Jejak Sejarah Kota Makkah & Miqat Umrah 2 (Ji\'ranah)',
          route: 'Ziarah Makkah ➔ Ji\'ranah',
          activities: [
            'Tour dan Ziarah jejak sejarah Islam di sekitar Kota Makkah: Jabal Tsur, Padang Arafah, Jabal Rahmah, Muzdalifah, Mina, dan melewati Jabal Nur (kondisional).',
            'Singgah di Masjid Ji\'ranah untuk mengambil Miqat bagi jamaah yang ingin melaksanakan Umrah Kedua (opsional / sunnah) dengan mengenakan pakaian ihram.',
            'Kembali ke Masjidil Haram untuk pelaksanaan Thawaf, Sa\'i, dan Tahallul Umrah ke-2.'
          ]
        },
        {
          day: 9,
          title: 'Hari 9 (24 Nov 2026): Free City Tour Kota Bersejarah Thaif',
          route: 'Makkah ➔ Thaif ➔ Makkah',
          activities: [
            'Setelah sarapan, jamaah bersiap menuju Kota Pegunungan Sejuk Thaif untuk menikmati Bonus City Tour Thaif Gratis dari El Massa (wahana berbayar masing-masing).',
            'Mengunjungi Masjid Abdullah bin Abbas, Pabrik Penyulingan Minyak Wangi Mawar Thaif, pemandangan alam Teleferik, dan santap siang khas Nasi Mandhi Thaif.',
            'Perjalanan pulang melewati tempat Miqat Qarnul Manazil bagi jamaah yang ingin mengambil niat Umrah Ketiga.'
          ]
        },
        {
          day: 10,
          title: 'Hari 10 (25-26 Nov 2026): Thawaf Wada\', City Tour Jeddah, Penerbangan Jeddah ➔ Jakarta (SV818)',
          route: 'Makkah ➔ Jeddah ➔ Jakarta (Saudia)',
          activities: [
            'Setelah sarapan: Pelaksanaan Thawaf Wada\' (Thawaf Perpisahan) di Masjidil Haram.',
            'Makan siang dan meletakkan koper di depan kamar masing-masing. Check-out hotel setelah Sholat Ashar.',
            'City tour Kota Jeddah dan santap malam bersama di Corniche Jeddah pukul 22.00 LT.',
            'Menuju Bandara Internasional King Abdulaziz Jeddah.',
            'Pukul 02.20 LT (26 Nov 2026): Pesawat Saudia Airlines (SV818) take-off menuju Jakarta.',
            'Pukul 16.00 WIB (26 Nov 2026): Tiba di Bandara Soekarno-Hatta Jakarta. Check-in dan beristirahat di hotel transit Jakarta (Dprima Hotel).'
          ]
        },
        {
          day: 11,
          title: 'Hari 11 (27 Nov 2026): Penerbangan Jakarta ➔ Pangkal Pinang (Garuda GA136)',
          route: 'Jakarta ➔ Pangkal Pinang (Garuda Indonesia)',
          activities: [
            'Pukul 05.30 WIB: Jamaah berkumpul di lobby hotel transit untuk bersiap menuju bandara.',
            'Pukul 10.20 WIB: Penerbangan menuju Pangkal Pinang menggunakan maskapai Garuda Indonesia (GA136).',
            'Pukul 11.40 WIB: Tiba dengan selamat di Bandar Udara Depati Amir Pangkal Pinang.',
            'Pembagian bagasi, air zamzam 5 liter, dan bingkisan kenang-kenangan eksklusif dari El Massa.',
            'Berakhirlah seluruh rangkaian perjalanan ibadah penuh berkah bersama El Massa Tour & Travel.'
          ]
        }
      ],
      schedules: [
        {
          id: 'sch-02a',
          startCity: 'Jakarta',
          airline: 'Saudia Airlines',
          departureDate: '2026-11-17',
          returnDate: '2026-11-26',
          duration: 10,
          price: 35000000,
          dp: 5000000,
          availableSeats: 25,
          roomType: 'Quad Room (Hotel Grand Al Massa / Upgrade Sofwah 39,5 Jt)',
          flightType: 'Direct SV821 Landing Madinah'
        },
        {
          id: 'sch-02b',
          startCity: 'Pangkal Pinang',
          airline: 'Saudia Airlines',
          departureDate: '2026-11-16',
          returnDate: '2026-11-27',
          duration: 11,
          price: 37600000,
          dp: 5000000,
          availableSeats: 25,
          roomType: 'Quad Room (Inc. Tiket Domestik GA136 & Dprima Transit)',
          flightType: 'Connecting PGK ➔ Saudia SV821 Landing Madinah'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 3. Umrah Akhir Tahun! Special Landing Madinah (11 Hari)
    // -------------------------------------------------------------------------
    {
      id: 'pkg-03',
      title: 'Umrah Akhir Tahun! Special Landing Madinah (11 Hari)',
      category: 'Umroh Akhir Tahun',
      tags: ['Akhir Tahun', 'Special Landing Madinah', 'Start Pangkal Pinang', 'Saudia Airlines', 'Free Thaif', '11 Hari', 'Quad Room'],
      programSummary: 'Menutup tahun 2026 dengan beribadah di Baitullah bersama program Umrah Akhir Tahun Special Landing Madinah (12 – 23 Desember 2026) Program 11 Hari. Keberangkatan Start Pangkal Pinang bersama Saudia Airlines (Landing Madinah). Hotel Sawaed Al Khaer Makkah (Upgrade Sofwah / Zamzam Tower 37,6 Jt) & Daar El Naeem Madinah. Free City Tour Thaif & Pabrik Parfum. Kuota Only 15 Seat. DP Mulai 5 Juta Saja.',
      flyerUrl: 'images/poster-desember-1.webp',
      thumbnailUrl: 'images/poster-desember-1.webp',
      activeStatus: 'Aktif',
      createdAt: '2026-08-03T08:00:00.000Z',
      hotelMakkah: 'Sawaed Al Khaer / Setaraf (Opsi Upgrade: Sofwah / Zamzam Tower ★5)',
      hotelMadinah: 'Daar El Naeem / Setaraf',
      hotelExtra: 'Free City Tour Thaif & Pabrik Parfum Mawar, Special Landing Madinah',
      itinerary: [
        {
          day: 1,
          title: 'Hari 1 (12 Des 2026): Pangkal Pinang ➔ Jakarta & Transit Dprima Hotel',
          route: 'Pangkal Pinang ➔ Jakarta',
          activities: [
            'Pukul 09.00 WIB: Jemaah berkumpul di Bandar Udara Internasional Depati Amir Pangkal Pinang untuk persiapan take-off ke Jakarta.',
            'Pukul 12.25 WIB: Jemaah take-off ke Jakarta (tiba pukul 13.54 WIB). Dilanjutkan menuju hotel transit di Jakarta (Dprima Hotel).',
            'Pukul 19.30 WIB – Selesai: Pemantapan manasik umrah di mushalla/meeting room hotel transit bersama tim El Massa.'
          ]
        },
        {
          day: 2,
          title: 'Hari 2 (13 Des 2026): Jakarta ➔ Madinah Direct (Saudia Airlines Landing Madinah)',
          route: 'Jakarta ➔ Madinah (Saudia Direct)',
          activities: [
            'Pukul 05.30 WIB: Sarapan dan berkumpul di lobby hotel untuk persiapan menuju Bandara Soekarno-Hatta Terminal 3.',
            'Pukul 12.00 WIB: Penerbangan direct menuju Madinah menggunakan pesawat Saudia Airlines (Landing Madinah).',
            'Pukul 18.00 LT: Tiba di Bandara Internasional Prince Mohammad bin Abdulaziz Madinah, dilanjutkan bus eksekutif menuju hotel Daar El Naeem.'
          ]
        },
        {
          day: 3,
          title: 'Hari 3 (14 Des 2026): Ziarah Raudhah Syarifah & Masjid Nabawi',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Jadwal memasuki Raudhah Syarifah dengan tasreh resmi (mengikuti jadwal resmi Nusuk).',
            'Ziarah Saqifah Bani Sa\'idah, Makam Rasulullah ﷺ dan Makam Sahabat, Masjid Ali, Masjid Ghamamah, dan Pemakaman Baqi\'.'
          ]
        },
        {
          day: 4,
          title: 'Hari 4 (15 Des 2026): Ziarah Jejak Sejarah Islam Kota Madinah',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Ziarah Masjid Quba (sholat 2 rakaat pahala umrah), Jabal Uhud & Makam Syuhada Uhud, dan Perkebunan Kurma Madinah.',
            'Melewati rute bersejarah Masjid Qiblatain dan Masjid Khandaq.'
          ]
        },
        {
          day: 5,
          title: 'Hari 5 (16 Des 2026): Ibadah Khusyuk di Masjid Nabawi & Pemantapan Manasik',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Memperbanyak amal ibadah, shalawat, dan sholat fardhu berjamaah di Masjid Nabawi.',
            'Pemantapan manasik rukun umrah bersama Muthawwif sebelum bertolak ke Makkah Al-Mukarramah.'
          ]
        },
        {
          day: 6,
          title: 'Hari 6 (17 Des 2026): Madinah ➔ Miqat Bir Ali ➔ Makkah & Pelaksanaan Umrah 1',
          route: 'Madinah ➔ Bir Ali ➔ Makkah',
          activities: [
            'Check-out hotel Madinah dan berangkat menuju Masjid Bir Ali (Dzulhulaifah) untuk mengambil Miqat dan berniat Umrah.',
            'Perjalanan bus eksekutif menuju Makkah, check-in Hotel Sawaed Al Khaer (atau Sofwah/Zamzam Tower).',
            'Pelaksanaan Ibadah Umrah Pertama (Thawaf, Sa\'i, dan Tahallul) dibimbing langsung oleh Muthawwif.'
          ]
        },
        {
          day: 7,
          title: 'Hari 7 (18 Des 2026): Ibadah Khusyuk & Sholat Jumat di Masjidil Haram',
          route: 'Makkah Al-Mukarramah',
          activities: [
            'Memperbanyak ibadah di Masjidil Haram (Thawaf Sunnah, tilawah Qur\'an, i\'tikaf).',
            'Siang harinya melaksanakan ibadah Sholat Jumat berjamaah di Masjidil Haram.'
          ]
        },
        {
          day: 8,
          title: 'Hari 8 (19 Des 2026): Ziarah Jejak Sejarah Makkah & Miqat Umrah 2 (Ji\'ranah)',
          route: 'Ziarah Makkah ➔ Ji\'ranah',
          activities: [
            'Ziarah Jabal Tsur, Padang Arafah, Jabal Rahmah, Muzdalifah, dan Mina.',
            'Mengambil Miqat di Masjid Ji\'ranah bagi jamaah yang ingin melaksanakan Umrah Kedua (sunnah).'
          ]
        },
        {
          day: 9,
          title: 'Hari 9 (20 Des 2026): Free Bonus City Tour Thaif & Pabrik Parfum',
          route: 'Makkah ➔ Thaif ➔ Makkah',
          activities: [
            'Bonus City Tour Thaif: Masjid Ibnu Abbas, Pabrik Penyulingan Minyak Wangi Mawar Thaif, Teleferik, dan santap Nasi Mandhi khas Thaif.',
            'Mengambil Miqat di Qarnul Manazil bagi jemaah yang ingin Umrah Ketiga.'
          ]
        },
        {
          day: 10,
          title: 'Hari 10 (21-22 Des 2026): Thawaf Wada\', Transfer Bandara Jeddah ➔ Jakarta',
          route: 'Makkah ➔ Jeddah ➔ Jakarta',
          activities: [
            'Pelaksanaan Thawaf Wada\' (Thawaf Perpisahan) di Masjidil Haram.',
            'Check-out hotel dan transfer menuju Bandara Internasional King Abdulaziz Jeddah.',
            'Penerbangan Saudia Airlines menuju Bandara Soekarno-Hatta Jakarta, check-in hotel transit Dprima Jakarta.'
          ]
        },
        {
          day: 11,
          title: 'Hari 11 (23 Des 2026): Penerbangan Jakarta ➔ Pangkal Pinang',
          route: 'Jakarta ➔ Pangkal Pinang',
          activities: [
            'Penerbangan domestik kembali ke Bandara Depati Amir Pangkal Pinang.',
            'Pembagian air zamzam 5 liter dan bingkisan kenang-kenangan eksklusif dari El Massa. Semoga meraih umrah mabrur.'
          ]
        }
      ],
      schedules: [
        {
          id: 'sch-03',
          startCity: 'Pangkal Pinang',
          airline: 'Saudia Airlines',
          departureDate: '2026-12-12',
          returnDate: '2026-12-23',
          duration: 11,
          price: 32900000,
          dp: 5000000,
          availableSeats: 15,
          roomType: 'Quad Room (Sawaed Al Khaer / Upgrade Sofwah 37,6 Jt)',
          flightType: 'Connecting PGK ➔ Saudia Direct Landing Madinah'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 4. Umrah Nisfu Sya'ban di Mekkah (11 Hari)
    // -------------------------------------------------------------------------
    {
      id: 'pkg-04',
      title: 'Umrah Nisfu Sya\'ban di Mekkah (11 Hari)',
      category: 'Umroh Sya\'ban',
      tags: ['Start Pangkal Pinang', 'Malam Nisfu Sya\'ban', 'Free Thaif', '11 Hari', 'Garuda Indonesia', 'Grand Al Massa'],
      programSummary: 'Meraih keutamaan malam Nisfu Sya\'ban langsung di depan Ka\'bah Masjidil Haram. Keberangkatan Start Pangkal Pinang 20 – 30 Januari 2027 Program 11 Hari. Maskapai Garuda Indonesia (Direct JED & PGK) & G983. Hotel Makkah Grand Al Massa & Hotel Madinah Daar El Naeem. Free City Tour Thaif & Pabrik Parfum. Kuota Only 25 Seat. DP Mulai 5 Juta Saja.',
      flyerUrl: 'images/poster-nisfu-syaban.webp',
      thumbnailUrl: 'images/poster-nisfu-syaban.webp',
      activeStatus: 'Aktif',
      createdAt: '2026-08-04T08:00:00.000Z',
      hotelMakkah: 'Grand Al Massa / Setaraf',
      hotelMadinah: 'Daar El Naeem / Setaraf',
      hotelExtra: 'Free City Tour Thaif & Pabrik Parfum Mawar, Qiyamul Lail Nisfu Sya\'ban',
      itinerary: [
        {
          day: 1,
          title: 'Hari 1 (20 Jan 2027): Pangkal Pinang ➔ Jakarta & Transit Hotel Jakarta',
          route: 'Pangkal Pinang ➔ Jakarta',
          activities: [
            'Pukul 09.00 WIB: Jemaah berkumpul di Bandar Udara Internasional Depati Amir Pangkal Pinang untuk persiapan take-off ke Jakarta.',
            'Pukul 12.25 WIB: Jemaah take-off dari Pangkal Pinang menggunakan pesawat Garuda Indonesia dan tiba di Bandara Soekarno-Hatta Jakarta pukul 13.54 WIB.',
            'Menuju hotel transit di Jakarta, istirahat dan menginap 1 malam di hotel transit (info hotel diinfokan kemudian).',
            'Pukul 19.30 WIB – Selesai: Pemantapan manasik umrah di mushalla/meeting room hotel transit bersama tim El Massa.'
          ]
        },
        {
          day: 2,
          title: 'Hari 2 (21 Jan 2027): Jakarta ➔ Jeddah Direct (Garuda Indonesia) ➔ Madinah',
          route: 'Jakarta ➔ Jeddah ➔ Madinah',
          activities: [
            'Pukul 05.30 WIB: Berkumpul di lobby hotel untuk persiapan menuju bandara.',
            'Pukul 11.25 WIB: Penerbangan menuju Jeddah menggunakan pesawat Garuda Indonesia.',
            'Pukul 17.30 LT: Tiba di Bandara Internasional King Abdulaziz Jeddah, dilanjutkan perjalanan menggunakan bus eksekutif menuju Kota Madinah.',
            'Check-in hotel Madinah (Daar El Naeem) dan beristirahat.'
          ]
        },
        {
          day: 3,
          title: 'Hari 3 (22 Jan 2027): Ziarah Raudhah Syarifah, Pengenalan Nabawi & Sholat Jumat',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Jadwal memasuki Raudhah Syarifah (Insya Allah apabila Tasreh keluar sesuai jadwal resmi):',
            '• Selesai Sholat Subuh – 11.00 Pagi: Jamaah Perempuan',
            '• 11.00 Pagi – Selesai Sholat Isya: Jamaah Laki-laki',
            '• Selesai Isya – 23.30 Malam: Jamaah Perempuan',
            '• 23.30 Malam – Sholat Subuh: Jamaah Laki-laki',
            'Ziarah dan pengenalan sekitar Masjid Nabawi: Saqifah Bani Sa\'idah (Bani Tsaqifah), Makam Rasulullah ﷺ dan Makam Sahabat (dari sisi luar masjid), Masjid Ali, Masjid Ghamamah, dan Pemakaman Baqi\'.',
            'Bersiap melaksanakan ibadah Sholat Jumat berjamaah di Masjid Nabawi, selesai sholat Jumat dilanjutkan acara bebas.'
          ]
        },
        {
          day: 4,
          title: 'Hari 4 (23 Jan 2027): Ziarah Jejak Sejarah Kota Madinah & Manasik Singkat',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Melaksanakan Tour dan Ziarah jejak sejarah Islam di sekitar Kota Madinah:',
            '• Masjid Quba (Masjid pertama yang dibangun oleh Rasulullah ﷺ).',
            '• Jabal Uhud & Makam Syuhada Uhud (napak tilas perjuangan Perang Uhud).',
            '• Perkebunan Kurma Madinah (kondisional).',
            '• Melewati Masjid Qiblatain dan Masjid Khandaq sepanjang rute perjalanan.',
            'Setelahnya acara bebas, jemaah memperbanyak ibadah di Masjid Nabawi (I\'tikaf, Tadarus Al-Qur\'an, dll).',
            'Sore / malam hari: Pemantapan manasik singkat sebelum keberangkatan dan pelaksanaan ibadah Umroh ke Makkah.'
          ]
        },
        {
          day: 5,
          title: 'Hari 5 (24 Jan 2027): Madinah ➔ Miqat Bir Ali ➔ Makkah & Pelaksanaan Umrah 1',
          route: 'Madinah ➔ Bir Ali ➔ Makkah',
          activities: [
            'Koper diletakkan di depan pintu kamar masing-masing untuk check-out dari hotel Madinah dan bersiap menuju Makkah.',
            'Pukul 14.00 LT siang: Bus berangkat menuju Masjid Bir Ali (Dzulhulaifah) untuk mengambil Miqat dan melafazkan niat Umrah dibimbing oleh Muthawwif.',
            'Jamaah laki-laki mengenakan pakaian ihram dan mematuhi seluruh larangan ihram.',
            'Selama perjalanan darat menuju Kota Makkah, jemaah memperbanyak melantunkan Talbiyah.',
            'Setibanya di Makkah langsung menuju hotel Grand Al Massa untuk meletakkan barang/koper.',
            'Jika kamar belum ready, jemaah langsung melaksanakan prosesi Ibadah Umrah Pertama (Thawaf, Sa\'i, dan Tahallul) dibimbing oleh Muthawwif.'
          ]
        },
        {
          day: 6,
          title: 'Hari 6 (25 Jan 2027): Ibadah Khusyuk & Sholat Jumat di Masjidil Haram',
          route: 'Makkah Al-Mukarramah',
          activities: [
            'Acara bebas, jemaah memperbanyak ibadah di Masjidil Haram (I\'tikaf, Thawaf sunnah, tilawah Al-Qur\'an).',
            'Siang harinya seluruh jemaah melaksanakan ibadah Sholat Jumat berjamaah di Masjidil Haram.'
          ]
        },
        {
          day: 7,
          title: 'Hari 7 (26 Jan 2027): Ziarah Jejak Sejarah Makkah & Miqat Umrah 2 (Ji\'ranah)',
          route: 'Ziarah Makkah ➔ Ji\'ranah',
          activities: [
            'Melaksanakan Tour dan Ziarah jejak sejarah Islam di sekitar Kota Makkah: Jabal Tsur, Padang Arafah, Jabal Rahmah, Muzdalifah, Mina, dan melewati Jabal Nur (kondisional).',
            'Singgah di Masjid Ji\'ranah untuk mengambil Miqat bagi jamaah yang ingin melaksanakan Umrah Kedua (opsional / sunnah) dengan mengenakan pakaian ihram.',
            'Kembali ke Masjidil Haram untuk pelaksanaan Thawaf, Sa\'i, dan Tahallul Umrah ke-2.'
          ]
        },
        {
          day: 8,
          title: 'Hari 8 (27 Jan 2027): Free Bonus City Tour Kota Bersejarah Thaif & Pabrik Parfum',
          route: 'Makkah ➔ Thaif ➔ Makkah',
          activities: [
            'Setelah sarapan, semua jamaah bersiap menuju Kota Pegunungan Sejuk Thaif untuk menikmati Bonus City Tour Thaif Gratis dari El Massa (wahana berbayar masing-masing).',
            'Mengunjungi Masjid Abdullah bin Abbas, Pabrik Penyulingan Minyak Wangi Mawar Thaif, pemandangan alam Teleferik, dan santap siang khas Nasi Mandhi Thaif.',
            'Perjalanan pulang melewati tempat Miqat Qarnul Manazil bagi jamaah yang ingin mengambil niat Umrah Ketiga.'
          ]
        },
        {
          day: 9,
          title: 'Hari 9 (28 Jan 2027): Thawaf Wada\', Check-out Hotel & Penerbangan Jeddah ➔ Jakarta (G983)',
          route: 'Makkah ➔ Jeddah ➔ Jakarta',
          activities: [
            'Setelah sarapan: Semua koper diletakkan di depan pintu kamar masing-masing.',
            'Berangkat menuju Masjidil Haram untuk melaksanakan Thawaf Wada\' (pamitan dengan Ka\'bah).',
            'Pukul 14.00 LT: Check-out dari hotel setelah makan siang, dilanjutkan perjalanan menuju Bandara Internasional King Abdulaziz Jeddah.',
            'Pukul 21.55 LT: Pesawat penerbangan ke Jakarta (G983) take-off dari Bandara Jeddah (tiba esok hari pukul 11.50 WIB).'
          ]
        },
        {
          day: 10,
          title: 'Hari 10 (29 Jan 2027): Tiba di Jakarta & Istirahat di Hotel Transit',
          route: 'Jeddah ➔ Jakarta',
          activities: [
            'Pukul 11.50 WIB: Jamaah mendarat di Bandara Soekarno-Hatta Jakarta.',
            'Proses imigrasi, pengambilan bagasi, dan menuju hotel transit yang disediakan El Massa.',
            'Istirahat di hotel transit Jakarta sambil menunggu penerbangan menuju Pangkal Pinang keesokan harinya.'
          ]
        },
        {
          day: 11,
          title: 'Hari 11 (30 Jan 2027): Penerbangan Jakarta ➔ Pangkal Pinang (Garuda Indonesia)',
          route: 'Jakarta ➔ Pangkal Pinang',
          activities: [
            'Pukul 05.30 WIB: Jamaah berkumpul di lobby hotel transit untuk bersiap menuju bandara.',
            'Pukul 10.20 WIB: Penerbangan menuju Pangkal Pinang menggunakan maskapai Garuda Indonesia.',
            'Pukul 11.40 WIB: Tiba dengan selamat di Bandar Udara Depati Amir Pangkal Pinang.',
            'Pembagian bagasi, air zamzam 5 liter, dan bingkisan kenang-kenangan eksklusif dari El Massa.',
            'Berakhirlah seluruh rangkaian perjalanan ibadah penuh berkah ini bersama El Massa Tour & Travel.'
          ]
        }
      ],
      schedules: [
        {
          id: 'sch-04b',
          startCity: 'Pangkal Pinang',
          airline: 'Garuda Indonesia',
          departureDate: '2027-01-20',
          returnDate: '2027-01-30',
          duration: 11,
          price: 34700000,
          dp: 5000000,
          availableSeats: 25,
          roomType: 'Quad Room (Grand Al Massa)',
          flightType: 'Garuda Indonesia Direct JED & Connecting PGK'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 5. Umrah Istimewa Awal Ramadan di Mekkah (11 Hari)
    // -------------------------------------------------------------------------
    {
      id: 'pkg-05',
      title: 'Umrah Istimewa Awal Ramadan di Mekkah (11 Hari)',
      category: 'Umroh Awal Ramadhan',
      tags: ['Start Pangkal Pinang', 'Awal Ramadhan', 'Pahala Seperti Haji', 'Free Thaif', '11 Hari', 'Saudia Airlines'],
      programSummary: 'Merasakan nikmatnya awal Ramadhan, sholat tarawih dan berbuka puasa di depan Ka\'bah Masjidil Haram. Keberangkatan Start Pangkal Pinang 05 – 15 Februari 2027 Program 11 Hari. Maskapai Saudia Airlines (SV821/SV826). Hotel Makkah Grand Al Massa & Hotel Madinah Daar El Naeem. Free City Tour Thaif & Pabrik Parfum. Kuota Only 25 Seat. DP Mulai 5 Juta Saja.',
      flyerUrl: 'images/poster-ramadan.webp',
      thumbnailUrl: 'images/poster-ramadan.webp',
      activeStatus: 'Aktif',
      createdAt: '2026-08-05T08:00:00.000Z',
      hotelMakkah: 'Grand Al Massa / Setaraf',
      hotelMadinah: 'Daar El Naeem / Setaraf',
      hotelExtra: 'Free City Tour Thaif & Pabrik Parfum Mawar, Buka Puasa & Tarawih di Masjidil Haram',
      itinerary: [
        {
          day: 1,
          title: 'Hari 1 (05 Feb 2027): Pangkal Pinang ➔ Jakarta & Transit Dprima Hotel',
          route: 'Pangkal Pinang ➔ Jakarta',
          activities: [
            'Pukul 09.00 WIB: Jemaah berkumpul di Bandar Udara Internasional Depati Amir Pangkal Pinang untuk persiapan take-off ke Jakarta.',
            'Pukul 12.25 WIB: Jemaah take-off dari Pangkal Pinang dan tiba di Bandara Soekarno-Hatta Jakarta pukul 13.54 WIB.',
            'Menuju hotel transit di Jakarta (Dprima Hotel), istirahat dan menginap 1 malam di hotel transit.',
            'Pukul 19.30 WIB – Selesai: Pemantapan manasik umrah di mushalla/meeting room hotel transit bersama tim El Massa.'
          ]
        },
        {
          day: 2,
          title: 'Hari 2 (06 Feb 2027): Jakarta ➔ Jeddah Direct (Saudia SV821) ➔ Madinah',
          route: 'Jakarta ➔ Jeddah ➔ Madinah',
          activities: [
            'Pukul 05.00 WIB: Sarapan pagi dan berkumpul di lobby hotel untuk persiapan menuju bandara.',
            'Pukul 09.00 WIB: Penerbangan menuju Jeddah menggunakan pesawat Saudia Airlines (SV821).',
            'Pukul 14.40 LT: Tiba di Bandara Internasional King Abdulaziz Jeddah, dilanjutkan perjalanan menggunakan bus eksekutif menuju Kota Madinah.',
            'Tiba di Madinah, check-in hotel (Daar El Naeem) dan beristirahat.'
          ]
        },
        {
          day: 3,
          title: 'Hari 3 (07 Feb 2027): Ziarah Raudhah Syarifah, Pengenalan Nabawi & Sholat Jumat',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Jadwal memasuki Raudhah Syarifah (Insya Allah apabila Tasreh keluar sesuai jadwal resmi):',
            '• Selesai Sholat Subuh – 11.00 Pagi: Jamaah Perempuan',
            '• 11.00 Pagi – Selesai Sholat Isya: Jamaah Laki-laki',
            '• Selesai Isya – 23.30 Malam: Jamaah Perempuan',
            '• 23.30 Malam – Sholat Subuh: Jamaah Laki-laki',
            'Ziarah dan pengenalan sekitar Masjid Nabawi: Saqifah Bani Sa\'idah (Bani Tsaqifah), Makam Rasulullah ﷺ dan Makam Sahabat (dari sisi luar masjid), Masjid Ali, Masjid Ghamamah, dan Pemakaman Baqi\'.',
            'Bersiap melaksanakan ibadah Sholat Jumat berjamaah di Masjid Nabawi, selesai sholat Jumat dilanjutkan acara bebas.'
          ]
        },
        {
          day: 4,
          title: 'Hari 4 (08 Feb 2027): Ziarah Jejak Sejarah Islam Kota Madinah',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Melaksanakan Tour dan Ziarah jejak sejarah Islam di sekitar Kota Madinah:',
            '• Masjid Quba (Masjid pertama yang dibangun oleh Rasulullah ﷺ).',
            '• Jabal Uhud & Makam Syuhada Uhud (napak tilas para syuhada Perang Uhud).',
            '• Perkebunan Kurma Madinah (kondisional).',
            '• Melewati Masjid Qiblatain dan Masjid Khandaq sepanjang rute perjalanan.',
            'Setelahnya acara bebas, jemaah memperbanyak ibadah di Masjid Nabawi (I\'tikaf, Tadarus Al-Qur\'an, dll).'
          ]
        },
        {
          day: 5,
          title: 'Hari 5 (09 Feb 2027): Madinah ➔ Miqat Bir Ali ➔ Makkah & Pelaksanaan Umrah Ramadan 1',
          route: 'Madinah ➔ Bir Ali ➔ Makkah',
          activities: [
            'Koper diletakkan di depan pintu kamar masing-masing untuk check-out dari hotel Madinah dan bersiap menuju Makkah.',
            'Pukul 14.00 LT siang: Bus berangkat menuju Masjid Bir Ali (Dzulhulaifah) untuk mengambil Miqat dan melafazkan niat Umrah dibimbing oleh Muthawwif.',
            'Jamaah laki-laki mengenakan pakaian ihram dan mematuhi seluruh larangan ihram.',
            'Selama perjalanan darat menuju Kota Makkah, jemaah memperbanyak melantunkan Talbiyah.',
            'Setibanya di Makkah langsung menuju hotel Grand Al Massa untuk meletakkan barang/koper.',
            'Jika kamar belum ready, jemaah langsung melaksanakan prosesi Ibadah Umrah Pertama (Thawaf, Sa\'i, dan Tahallul) dibimbing oleh Muthawwif.'
          ]
        },
        {
          day: 6,
          title: 'Hari 6 (10 Feb 2027): Ibadah Khusyuk Ramadan & Sholat Jumat di Masjidil Haram',
          route: 'Makkah Al-Mukarramah',
          activities: [
            'Acara bebas, jemaah memperbanyak ibadah di Masjidil Haram (Iftor kurma & air zamzam bersama jamaah dunia, I\'tikaf, Thawaf sunnah, tilawah Al-Qur\'an, dan Sholat Tarawih berjamaah).',
            'Siang harinya seluruh jemaah melaksanakan ibadah Sholat Jumat berjamaah di Masjidil Haram.'
          ]
        },
        {
          day: 7,
          title: 'Hari 7 (11 Feb 2027): Ziarah Jejak Sejarah Makkah & Miqat Umrah 2 (Ji\'ranah)',
          route: 'Ziarah Makkah ➔ Ji\'ranah',
          activities: [
            'Melaksanakan Tour dan Ziarah jejak sejarah Islam di sekitar Kota Makkah: Jabal Tsur, Padang Arafah, Jabal Rahmah, Muzdalifah, Mina, dan melewati Jabal Nur (kondisional).',
            'Singgah di Masjid Ji\'ranah untuk mengambil Miqat bagi jamaah yang ingin melaksanakan Umrah Kedua (opsional / sunnah) dengan mengenakan pakaian ihram.',
            'Kembali ke Masjidil Haram untuk pelaksanaan Thawaf, Sa\'i, dan Tahallul Umrah ke-2.'
          ]
        },
        {
          day: 8,
          title: 'Hari 8 (12 Feb 2027): Free Bonus City Tour Kota Bersejarah Thaif & Pabrik Parfum',
          route: 'Makkah ➔ Thaif ➔ Makkah',
          activities: [
            'Setelah sarapan, semua jamaah bersiap menuju Kota Pegunungan Sejuk Thaif untuk menikmati Bonus City Tour Thaif Gratis dari El Massa (wahana berbayar masing-masing).',
            'Mengunjungi Masjid Abdullah bin Abbas, Pabrik Penyulingan Minyak Wangi Mawar Thaif, pemandangan alam Teleferik, dan santap siang khas Nasi Mandhi Thaif.',
            'Perjalanan pulang melewati tempat Miqat Qarnul Manazil bagi jamaah yang ingin mengambil niat Umrah Ketiga.'
          ]
        },
        {
          day: 9,
          title: 'Hari 9 (13-14 Feb 2027): Thawaf Wada\', Transfer Jeddah, Penerbangan ke Jakarta (SV826)',
          route: 'Makkah ➔ Jeddah ➔ Jakarta',
          activities: [
            'Memperbanyak ibadah di Masjidil Haram, melaksanakan Thawaf Wada\' (Thawaf Perpisahan) dan persiapan check-out ke Bandara Jeddah.',
            'Semua jemaah meletakkan koper di depan kamar masing-masing.',
            'Pukul 03.00 (dini hari): Check-out dari hotel Makkah dan melanjutkan perjalanan ke Bandara Internasional King Abdulaziz Jeddah.',
            'Pukul 08.45 LT: Pesawat Saudia Airlines (SV826) take-off menuju Jakarta.',
            'Pukul 22.30 WIB (14 Feb 2027): Tiba di Bandara Soekarno-Hatta Jakarta. Check-in dan beristirahat di hotel transit Jakarta (Dprima Hotel).'
          ]
        },
        {
          day: 10,
          title: 'Hari 10 (15 Feb 2027): Penerbangan Jakarta ➔ Pangkal Pinang',
          route: 'Jakarta ➔ Pangkal Pinang',
          activities: [
            'Pukul 05.30 WIB: Jamaah berkumpul di lobby hotel transit untuk bersiap menuju bandara.',
            'Pukul 10.20 WIB: Penerbangan menuju Pangkal Pinang.',
            'Pukul 11.40 WIB: Tiba dengan selamat di Bandar Udara Depati Amir Pangkal Pinang.',
            'Pembagian bagasi, air zamzam 5 liter, dan bingkisan kenang-kenangan eksklusif dari El Massa.',
            'Berakhirlah seluruh rangkaian perjalanan ibadah penuh berkah ini bersama El Massa Tour & Travel.'
          ]
        }
      ],
      schedules: [
        {
          id: 'sch-05b',
          startCity: 'Pangkal Pinang',
          airline: 'Saudia Airlines',
          departureDate: '2027-02-05',
          returnDate: '2027-02-15',
          duration: 11,
          price: 35700000,
          dp: 5000000,
          availableSeats: 25,
          roomType: 'Quad Room (Grand Al Massa)',
          flightType: 'Connecting PGK ➔ Saudia SV821/SV826'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 6. Umrah Sayang Orang Tua (Syawal 2027)
    // -------------------------------------------------------------------------
    {
      id: 'pkg-06',
      title: 'Umrah Sayang Orang Tua Bersama IMB (11 Hari)',
      category: 'Umroh Syawal',
      tags: ['Start Pangkal Pinang', 'Sayang Orang Tua', 'Ibu Muda Berkarya', 'Mekkah 0 KM', 'Free Thaif', '11 Hari', 'Garuda / Saudia'],
      programSummary: 'Lebih nyaman untuk orang tua tercinta bersama Komunitas Ibu Muda Berkarya (IMB). Keberangkatan Start Pangkal Pinang 16 – 27 Maret 2027 (Syawal) Program 11 Hari. Maskapai Saudia Airlines (SV821/SV818) & Garuda GA136. Hotel Makkah Olayan Ajyad (0 Meter ± 1 Menit Jalan Kaki ke Masjidil Haram) & Hotel Madinah Daar El Naeem. Free City Tour Thaif & Pabrik Parfum Mawar, City Tour Jeddah & Corniche. Kuota Only 30 Seat. DP Mulai 5 Juta Saja.',
      flyerUrl: 'images/poster-umrah-sayang-orang-tua.webp',
      thumbnailUrl: 'images/poster-umrah-sayang-orang-tua.webp',
      activeStatus: 'Aktif',
      createdAt: '2026-08-06T08:00:00.000Z',
      hotelMakkah: 'Olayan Ajyad / Setaraf (0 Meter ± 1 Menit ke Masjidil Haram)',
      hotelMadinah: 'Daar El Naeem / Setaraf',
      hotelExtra: 'Free City Tour Thaif & Pabrik Parfum Mawar, Pendampingan Khusus Ramah Orang Tua',
      itinerary: [
        {
          day: 1,
          title: 'Hari 1 (16 Mar 2027): Pangkal Pinang ➔ Jakarta & Transit Dprima Hotel',
          route: 'Pangkal Pinang ➔ Jakarta',
          activities: [
            'Pukul 09.00 WIB: Jemaah berkumpul di Bandar Udara Internasional Depati Amir Pangkal Pinang untuk persiapan take-off ke Jakarta.',
            'Pukul 12.25 WIB: Jemaah take-off dari Pangkal Pinang dan tiba di Bandara Soekarno-Hatta Jakarta pukul 13.54 WIB.',
            'Menuju hotel transit di Jakarta (Dprima Hotel), istirahat dan menginap 1 malam di hotel transit.',
            'Pukul 19.30 WIB – Selesai: Pemantapan manasik umrah di mushalla/meeting room hotel transit bersama tim El Massa.'
          ]
        },
        {
          day: 2,
          title: 'Hari 2 (17 Mar 2027): Jakarta ➔ Madinah Direct (Saudia SV821)',
          route: 'Jakarta ➔ Madinah (Saudia Airlines)',
          activities: [
            'Pukul 05.30 WIB: Sarapan pagi dan berkumpul di lobby hotel untuk persiapan menuju bandara.',
            'Pukul 12.00 WIB: Penerbangan menuju Madinah/Jeddah (SV821) menggunakan maskapai Saudia Airlines.',
            'Pukul 18.00 LT: Tiba di Bandara Madinah/Jeddah, dilanjutkan perjalanan menggunakan bus eksekutif menuju Kota Madinah.',
            'Check-in hotel Madinah (Daar El Naeem) dan beristirahat.'
          ]
        },
        {
          day: 3,
          title: 'Hari 3 (18 Mar 2027): Ziarah Raudhah Syarifah, Masjid Nabawi & Sholat Jumat',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Jadwal memasuki Raudhah Syarifah (Insya Allah apabila Tasreh keluar sesuai jadwal resmi):',
            '• Selesai Sholat Subuh – 11.00 Pagi: Jamaah Perempuan',
            '• 11.00 Pagi – Selesai Sholat Isya: Jamaah Laki-laki',
            '• Selesai Isya – 23.30 Malam: Jamaah Perempuan',
            '• 23.30 Malam – Sholat Subuh: Jamaah Laki-laki',
            'Ziarah dan pengenalan sekitar Masjid Nabawi: Saqifah Bani Sa\'idah (Bani Tsaqifah), Makam Rasulullah ﷺ dan Makam Sahabat (dari sisi luar masjid), Masjid Ali, Masjid Ghamamah, dan Pemakaman Baqi\'.',
            'Bersiap melaksanakan ibadah Sholat Jumat berjamaah di Masjid Nabawi, selesai sholat Jumat dilanjutkan acara bebas.'
          ]
        },
        {
          day: 4,
          title: 'Hari 4 (19 Mar 2027): Ziarah Jejak Sejarah Islam Kota Madinah',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Melaksanakan Tour dan Ziarah jejak sejarah Islam di sekitar Kota Madinah:',
            '• Masjid Quba (Masjid pertama yang dibangun oleh Rasulullah ﷺ).',
            '• Jabal Uhud & Makam Syuhada Uhud (napak tilas para syuhada Perang Uhud).',
            '• Perkebunan Kurma Madinah (kondisional).',
            '• Melewati Masjid Qiblatain dan Masjid Khandaq sepanjang rute perjalanan.',
            'Setelahnya acara bebas, jemaah memperbanyak ibadah di Masjid Nabawi (I\'tikaf, Tadarus Al-Qur\'an, dll).'
          ]
        },
        {
          day: 5,
          title: 'Hari 5 (20 Mar 2027): Ibadah Khusyuk Masjid Nabawi & Pemantapan Manasik',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Memperbanyak amal ibadah dan sholat fardhu berjamaah di Masjid Nabawi.',
            'Pemantapan manasik rukun umrah dan persiapan keberangkatan menuju Kota Suci Makkah.'
          ]
        },
        {
          day: 6,
          title: 'Hari 6 (21 Mar 2027): Madinah ➔ Miqat Bir Ali ➔ Makkah & Pelaksanaan Umrah 1',
          route: 'Madinah ➔ Bir Ali ➔ Makkah',
          activities: [
            'Koper diletakkan di depan kamar masing-masing untuk check-out dari hotel Madinah dan bersiap ke Makkah.',
            'Pukul 14.00 LT siang: Bus berangkat menuju Masjid Bir Ali (Dzulhulaifah) untuk mengambil Miqat dan melafazkan niat Umrah dibimbing oleh Muthawwif.',
            'Jamaah laki-laki mengenakan pakaian ihram dan mematuhi seluruh larangan ihram.',
            'Selama perjalanan darat ke Kota Makkah, jemaah memperbanyak melantunkan Talbiyah.',
            'Setibanya di Makkah langsung menuju hotel Olayan Ajyad (0 KM) untuk menyimpan barang/koper.',
            'Jika kamar belum ready, jemaah langsung melaksanakan prosesi Ibadah Umrah Pertama (Thawaf, Sa\'i, dan Tahallul) dibimbing oleh Muthawwif.'
          ]
        },
        {
          day: 7,
          title: 'Hari 7 (22 Mar 2027): Ibadah Khusyuk & Sholat Jumat di Masjidil Haram',
          route: 'Makkah Al-Mukarramah',
          activities: [
            'Acara bebas, jemaah memperbanyak ibadah di Masjidil Haram (I\'tikaf, Thawaf sunnah, tilawah Al-Qur\'an).',
            'Siang harinya seluruh jemaah melaksanakan ibadah Sholat Jumat berjamaah di Masjidil Haram.'
          ]
        },
        {
          day: 8,
          title: 'Hari 8 (23 Mar 2027): Ziarah Jejak Sejarah Makkah & Miqat Umrah 2 (Ji\'ranah)',
          route: 'Ziarah Makkah ➔ Ji\'ranah',
          activities: [
            'Melaksanakan Tour dan Ziarah jejak sejarah Islam di sekitar Kota Makkah: Jabal Tsur, Padang Arafah, Jabal Rahmah, Muzdalifah, Mina, dan melewati Jabal Nur (kondisional).',
            'Singgah di Masjid Ji\'ranah untuk mengambil Miqat bagi jamaah yang ingin melaksanakan Umrah Kedua (opsional / sunnah) dengan mengenakan pakaian ihram.',
            'Kembali ke Masjidil Haram untuk pelaksanaan Thawaf, Sa\'i, dan Tahallul Umrah ke-2.'
          ]
        },
        {
          day: 9,
          title: 'Hari 9 (24 Mar 2027): Free City Tour Kota Bersejarah Thaif & Pabrik Parfum',
          route: 'Makkah ➔ Thaif ➔ Makkah',
          activities: [
            'Setelah sarapan, semua jamaah bersiap menuju Kota Pegunungan Sejuk Thaif untuk menikmati Bonus City Tour Thaif Gratis dari El Massa (wahana berbayar masing-masing).',
            'Mengunjungi Masjid Abdullah bin Abbas, Pabrik Penyulingan Minyak Wangi Mawar Thaif, pemandangan alam Teleferik, dan santap siang khas Nasi Mandhi Thaif.',
            'Perjalanan pulang melewati tempat Miqat Qarnul Manazil bagi jamaah yang ingin mengambil niat Umrah Ketiga.'
          ]
        },
        {
          day: 10,
          title: 'Hari 10 (25-26 Mar 2027): Thawaf Wada\', City Tour Jeddah, Penerbangan Jeddah ➔ Jakarta (SV818)',
          route: 'Makkah ➔ Jeddah ➔ Jakarta (Saudia)',
          activities: [
            'Setelah sarapan: Melaksanakan Thawaf Wada\' (Thawaf Perpisahan) di Masjidil Haram.',
            'Makan siang dan meletakkan koper di depan kamar masing-masing. Check-out hotel setelah Sholat Ashar.',
            'City tour Kota Jeddah dan santap malam bersama di Corniche Jeddah pukul 22.00 LT.',
            'Menuju Bandara Internasional King Abdulaziz Jeddah.',
            'Pukul 02.20 LT (26 Mar 2027): Pesawat Saudia Airlines (SV818) take-off menuju Jakarta.',
            'Pukul 16.00 WIB (26 Mar 2027): Tiba di Bandara Soekarno-Hatta Jakarta. Check-in dan beristirahat di hotel transit Jakarta (Dprima Hotel).'
          ]
        },
        {
          day: 11,
          title: 'Hari 11 (27 Mar 2027): Penerbangan Jakarta ➔ Pangkal Pinang (Garuda GA136)',
          route: 'Jakarta ➔ Pangkal Pinang (Garuda Indonesia)',
          activities: [
            'Pukul 05.30 WIB: Jamaah berkumpul di lobby hotel transit untuk bersiap menuju bandara.',
            'Pukul 10.20 WIB: Penerbangan menuju Pangkal Pinang menggunakan maskapai Garuda Indonesia (GA136).',
            'Pukul 11.40 WIB: Tiba dengan selamat di Bandar Udara Depati Amir Pangkal Pinang.',
            'Pembagian bagasi, air zamzam 5 liter, dan bingkisan kenang-kenangan eksklusif dari El Massa.',
            'Berakhirlah seluruh rangkaian perjalanan ibadah penuh makna ini bersama El Massa Tour & Travel.'
          ]
        }
      ],
      schedules: [
        {
          id: 'sch-06b',
          startCity: 'Pangkal Pinang',
          airline: 'Saudia & Garuda Indonesia',
          departureDate: '2027-03-16',
          returnDate: '2027-03-27',
          duration: 11,
          price: 35700000,
          dp: 5000000,
          availableSeats: 30,
          roomType: 'Quad Room (Olayan Ajyad 0 KM)',
          flightType: 'Connecting PGK (GA136) ➔ Saudia SV821 Landing Madinah'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 7. Umrah Spesial Bersama Ust. Dr. H. Muhammad Kurnia, Lc., M.Ag. (11 Hari)
    // -------------------------------------------------------------------------
    {
      id: 'pkg-07',
      title: 'Umrah Bersama Ust. Dr. H. Muhammad Kurnia, Lc., M.Ag. (11 Hari)',
      category: 'Umroh Spesial Ustadz',
      tags: ['Start Pangkal Pinang', 'Ust. Muhammad Kurnia', 'Tokoh Agama', 'Syawal 2027', 'Hotel 0 KM', 'Free Thaif', '11 Hari', 'Garuda / Saudia'],
      programSummary: 'Umrah Hebat, Hotel Dekat, Badan Sehat, Ibadah Kuat bersama Tokoh Agama Ust. Dr. H. Muhammad Kurnia, Lc., M.Ag. Keberangkatan Start Pangkal Pinang 16 – 27 Maret 2027 (Syawal setelah Idul Fitri). Maskapai Garuda Indonesia (GA136) & Saudia Airlines (SV821/SV818). Hotel Makkah Olayan Ajyad (0 Meter ± 1 Menit Jalan Kaki ke Masjidil Haram) & Hotel Madinah Daar El Naeem. Free City Tour Thaif & Pabrik Parfum Mawar, City Tour Jeddah & Corniche. Kuota Only 35 Seat. DP Mulai 5 Juta Saja.',
      flyerUrl: 'images/poster-ust-muhammad-kurnia.webp',
      thumbnailUrl: 'images/poster-ust-muhammad-kurnia.webp',
      activeStatus: 'Aktif',
      createdAt: '2026-08-07T08:00:00.000Z',
      hotelMakkah: 'Olayan Ajyad / Setaraf (0 Meter ± 1 Menit ke Masjidil Haram)',
      hotelMadinah: 'Daar El Naeem / Setaraf',
      hotelExtra: 'Free City Tour Thaif & Pabrik Parfum Mawar, Bimbingan Ibadah Khusyuk & Tausiyah',
      itinerary: [
        {
          day: 1,
          title: 'Hari 1 (16 Mar 2027): Pangkal Pinang ➔ Jakarta & Transit Dprima Hotel',
          route: 'Pangkal Pinang ➔ Jakarta',
          activities: [
            'Pukul 09.00 WIB: Jemaah berkumpul di Bandar Udara Internasional Depati Amir Pangkal Pinang untuk persiapan take-off ke Jakarta.',
            'Pukul 12.25 WIB: Jemaah take-off dari Pangkal Pinang dan tiba di Bandara Soekarno-Hatta Jakarta pukul 13.54 WIB.',
            'Menuju hotel transit di Jakarta (Dprima Hotel), istirahat dan menginap 1 malam di hotel transit.',
            'Pukul 19.30 WIB – Selesai: Pemantapan manasik umrah di mushalla/meeting room hotel transit bersama Ust. Dr. H. Muhammad Kurnia & tim El Massa.'
          ]
        },
        {
          day: 2,
          title: 'Hari 2 (17 Mar 2027): Jakarta ➔ Madinah Direct (Saudia SV821)',
          route: 'Jakarta ➔ Madinah (Saudia Airlines)',
          activities: [
            'Pukul 05.30 WIB: Sarapan pagi dan berkumpul di lobby hotel untuk persiapan menuju bandara.',
            'Pukul 12.00 WIB: Penerbangan menuju Madinah/Jeddah (SV821) menggunakan maskapai Saudia Airlines.',
            'Pukul 18.00 LT: Tiba di Bandara Madinah/Jeddah, dilanjutkan perjalanan menggunakan bus eksekutif menuju Kota Madinah.',
            'Check-in hotel Madinah (Daar El Naeem) dan beristirahat.'
          ]
        },
        {
          day: 3,
          title: 'Hari 3 (18 Mar 2027): Ziarah Raudhah Syarifah, Masjid Nabawi & Sholat Jumat',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Jadwal memasuki Raudhah Syarifah (Insya Allah apabila Tasreh keluar sesuai jadwal resmi):',
            '• Selesai Sholat Subuh – 11.00 Pagi: Jamaah Perempuan',
            '• 11.00 Pagi – Selesai Sholat Isya: Jamaah Laki-laki',
            '• Selesai Isya – 23.30 Malam: Jamaah Perempuan',
            '• 23.30 Malam – Sholat Subuh: Jamaah Laki-laki',
            'Ziarah dan pengenalan sekitar Masjid Nabawi dibimbing Ust. Dr. H. Muhammad Kurnia: Saqifah Bani Sa\'idah (Bani Tsaqifah), Makam Rasulullah ﷺ dan Makam Sahabat (dari sisi luar masjid), Masjid Ali, Masjid Ghamamah, dan Pemakaman Baqi\'.',
            'Bersiap melaksanakan ibadah Sholat Jumat berjamaah di Masjid Nabawi, selesai sholat Jumat dilanjutkan acara bebas.'
          ]
        },
        {
          day: 4,
          title: 'Hari 4 (19 Mar 2027): Ziarah Jejak Sejarah Islam Kota Madinah',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Melaksanakan Tour dan Ziarah jejak sejarah Islam di sekitar Kota Madinah:',
            '• Masjid Quba (Masjid pertama yang dibangun oleh Rasulullah ﷺ).',
            '• Jabal Uhud & Makam Syuhada Uhud (napak tilas para syuhada Perang Uhud).',
            '• Perkebunan Kurma Madinah (kondisional).',
            '• Melewati Masjid Qiblatain dan Masjid Khandaq sepanjang rute perjalanan.',
            'Setelahnya acara bebas, jemaah memperbanyak ibadah di Masjid Nabawi (I\'tikaf, Tadarus Al-Qur\'an, dll).'
          ]
        },
        {
          day: 5,
          title: 'Hari 5 (20 Mar 2027): Ibadah Khusyuk Masjid Nabawi & Pemantapan Manasik',
          route: 'Madinah Al-Munawwarah',
          activities: [
            'Memperbanyak amal ibadah dan sholat fardhu berjamaah di Masjid Nabawi.',
            'Kajian rohani, tausiyah penguatan iman, dan pemantapan manasik rukun umrah bersama Ust. Dr. H. Muhammad Kurnia sebelum keberangkatan ke Makkah.'
          ]
        },
        {
          day: 6,
          title: 'Hari 6 (21 Mar 2027): Madinah ➔ Miqat Bir Ali ➔ Makkah & Pelaksanaan Umrah 1',
          route: 'Madinah ➔ Bir Ali ➔ Makkah',
          activities: [
            'Koper diletakkan di depan kamar masing-masing untuk check-out dari hotel Madinah dan bersiap ke Makkah.',
            'Pukul 14.00 LT siang: Bus berangkat menuju Masjid Bir Ali (Dzulhulaifah) untuk mengambil Miqat dan melafazkan niat Umrah dibimbing oleh Ust. Dr. H. Muhammad Kurnia & Muthawwif.',
            'Jamaah laki-laki mengenakan pakaian ihram dan mematuhi seluruh larangan ihram.',
            'Selama perjalanan darat ke Kota Makkah, jemaah memperbanyak melantunkan Talbiyah.',
            'Setibanya di Makkah langsung menuju hotel Olayan Ajyad (0 KM) untuk menyimpan barang/koper.',
            'Jika kamar belum ready, jemaah langsung melaksanakan prosesi Ibadah Umrah Pertama (Thawaf, Sa\'i, dan Tahallul) dibimbing oleh Ustadz & Muthawwif.'
          ]
        },
        {
          day: 7,
          title: 'Hari 7 (22 Mar 2027): Ibadah Khusyuk & Sholat Jumat di Masjidil Haram',
          route: 'Makkah Al-Mukarramah',
          activities: [
            'Acara bebas, jemaah memperbanyak ibadah di Masjidil Haram (I\'tikaf, Thawaf sunnah, tilawah Al-Qur\'an).',
            'Siang harinya seluruh jemaah melaksanakan ibadah Sholat Jumat berjamaah di Masjidil Haram.'
          ]
        },
        {
          day: 8,
          title: 'Hari 8 (23 Mar 2027): Ziarah Jejak Sejarah Makkah & Miqat Umrah 2 (Ji\'ranah)',
          route: 'Ziarah Makkah ➔ Ji\'ranah',
          activities: [
            'Melaksanakan Tour dan Ziarah jejak sejarah Islam di sekitar Kota Makkah: Jabal Tsur, Padang Arafah, Jabal Rahmah, Muzdalifah, Mina, dan melewati Jabal Nur (kondisional).',
            'Singgah di Masjid Ji\'ranah untuk mengambil Miqat bagi jamaah yang ingin melaksanakan Umrah Kedua (opsional / sunnah) dengan mengenakan pakaian ihram.',
            'Kembali ke Masjidil Haram untuk pelaksanaan Thawaf, Sa\'i, dan Tahallul Umrah ke-2 dibimbing Ustadz.'
          ]
        },
        {
          day: 9,
          title: 'Hari 9 (24 Mar 2027): Free City Tour Kota Bersejarah Thaif & Pabrik Parfum',
          route: 'Makkah ➔ Thaif ➔ Makkah',
          activities: [
            'Setelah sarapan, semua jamaah bersiap menuju Kota Pegunungan Sejuk Thaif untuk menikmati Bonus City Tour Thaif Gratis dari El Massa (wahana berbayar masing-masing).',
            'Mengunjungi Masjid Abdullah bin Abbas, Pabrik Penyulingan Minyak Wangi Mawar Thaif, pemandangan alam Teleferik, dan santap siang khas Nasi Mandhi Thaif.',
            'Perjalanan pulang melewati tempat Miqat Qarnul Manazil bagi jamaah yang ingin mengambil niat Umrah Ketiga.'
          ]
        },
        {
          day: 10,
          title: 'Hari 10 (25-26 Mar 2027): Thawaf Wada\', City Tour Jeddah, Penerbangan Jeddah ➔ Jakarta (SV818)',
          route: 'Makkah ➔ Jeddah ➔ Jakarta (Saudia)',
          activities: [
            'Setelah sarapan: Melaksanakan Thawaf Wada\' (Thawaf Perpisahan) di Masjidil Haram dibimbing Ustadz.',
            'Makan siang dan meletakkan koper di depan kamar masing-masing. Check-out hotel setelah Sholat Ashar.',
            'City tour Kota Jeddah dan santap malam bersama di Corniche Jeddah pukul 22.00 LT.',
            'Menuju Bandara Internasional King Abdulaziz Jeddah.',
            'Pukul 02.20 LT (26 Mar 2027): Pesawat Saudia Airlines (SV818) take-off menuju Jakarta.',
            'Pukul 16.00 WIB (26 Mar 2027): Tiba di Bandara Soekarno-Hatta Jakarta. Check-in dan beristirahat di hotel transit Jakarta (Dprima Hotel).'
          ]
        },
        {
          day: 11,
          title: 'Hari 11 (27 Mar 2027): Penerbangan Jakarta ➔ Pangkal Pinang (Garuda GA136)',
          route: 'Jakarta ➔ Pangkal Pinang (Garuda Indonesia)',
          activities: [
            'Pukul 05.30 WIB: Jamaah berkumpul di lobby hotel transit untuk bersiap menuju bandara.',
            'Pukul 10.20 WIB: Penerbangan menuju Pangkal Pinang menggunakan maskapai Garuda Indonesia (GA136).',
            'Pukul 11.40 WIB: Tiba dengan selamat di Bandar Udara Depati Amir Pangkal Pinang.',
            'Pembagian bagasi, air zamzam 5 liter, dan bingkisan kenang-kenangan eksklusif dari El Massa.',
            'Berakhirlah seluruh rangkaian perjalanan ibadah penuh berkah ini bersama Ust. Dr. H. Muhammad Kurnia & El Massa Tour & Travel.'
          ]
        }
      ],
      schedules: [
        {
          id: 'sch-07b',
          startCity: 'Pangkal Pinang',
          airline: 'Saudia & Garuda Indonesia',
          departureDate: '2027-03-16',
          returnDate: '2027-03-27',
          duration: 11,
          price: 35700000,
          dp: 5000000,
          availableSeats: 35,
          roomType: 'Quad Room (Olayan Ajyad 0 KM)',
          flightType: 'Connecting PGK (GA136) ➔ Saudia SV821 Landing Madinah'
        }
      ]
    },
    // -------------------------------------------------------------------------
    // 8. Umrah Muharram Awal Musim (9 Hari)
    // -------------------------------------------------------------------------
    {
      id: 'pkg-08',
      title: 'Umrah Muharram Awal Musim (9 Hari)',
      category: 'Umroh Awal Musim',
      tags: ['Start Pangkal Pinang', 'Tahun Baru Islam', 'Awal Musim', 'Free Thaif', '9 Hari', 'Garuda / Saudia'],
      programSummary: 'Membuka tahun baru hijriyah 1449 H dengan ibadah umroh awal musim di Tanah Suci. Keberangkatan Start Pangkal Pinang Awal Juni 2027 Program 9 Hari. Maskapai Garuda Indonesia / Saudia Airlines. Hotel Makkah Grand Al Massa & Hotel Madinah Daar El Naeem. Free City Tour Thaif & Pabrik Parfum. Kuota Only 35 Seat. DP Mulai 5 Juta Saja.',
      flyerUrl: 'images/poster-muharram-awal-musim.webp',
      thumbnailUrl: 'images/poster-muharram-awal-musim.webp',
      activeStatus: 'Aktif',
      createdAt: '2026-08-08T08:00:00.000Z',
      hotelMakkah: 'Grand Al Massa / Setaraf',
      hotelMadinah: 'Daar El Naeem / Setaraf',
      hotelExtra: 'Free City Tour Thaif & Pabrik Parfum Mawar',
      itinerary: [
        { day: 1, title: 'Hari 1: Keberangkatan Pangkal Pinang ➔ Jakarta ➔ Madinah', route: 'Pangkal Pinang ➔ Jakarta ➔ Madinah', activities: ['Penerbangan dari Bandara Depati Amir Pangkal Pinang menuju Jakarta, dilanjutkan Garuda / Saudia menuju Madinah. Check-in hotel Daar El Naeem.'] },
        { day: 2, title: 'Hari 2: Ziarah Raudhah & Masjid Nabawi', route: 'Madinah Al-Munawwarah', activities: ['Sholat di Masjid Nabawi & Ziarah Raudhah Syarifah dengan tasreh resmi.'] },
        { day: 3, title: 'Hari 3: Ziarah Sejarah Madinah', route: 'Madinah Al-Munawwarah', activities: ['Ziarah Masjid Quba, Jabal Uhud, dan Kebun Kurma Madinah.'] },
        { day: 4, title: 'Hari 4: Miqat Bir Ali ➔ Menuju Makkah & Pelaksanaan Umrah 1', route: 'Madinah ➔ Makkah', activities: ['Miqat di Bir Ali, menuju Makkah, check-in Grand Al Massa, pelaksanaan Umrah 1.'] },
        { day: 5, title: 'Hari 5: Ibadah Khusyuk di Masjidil Haram', route: 'Makkah Al-Mukarramah', activities: ['Thawaf sunnah dan memperbanyak amal ibadah di depan Ka\'bah.'] },
        { day: 6, title: 'Hari 6: Ziarah Makkah & Miqat Umrah 2', route: 'Ziarah Makkah', activities: ['Ziarah Arafah, Muzdalifah, Mina, Jabal Rahmah, dan Miqat di Ji\'ranah untuk Umrah ke-2.'] },
        { day: 7, title: 'Hari 7: Free City Tour Thaif & Pabrik Parfum', route: 'Makkah ➔ Thaif', activities: ['Wisata alam pegunungan Thaif, Teleferik, ziarah Masjid Ibnu Abbas, dan kunjungan pabrik parfum mawar.'] },
        { day: 8, title: 'Hari 8: Thawaf Wada\' & Transfer Menuju Bandara Jeddah', route: 'Makkah ➔ Jeddah', activities: ['Thawaf Wada\' di Masjidil Haram dan transfer ke Bandara Internasional Jeddah.'] },
        { day: 9, title: 'Hari 9: Tiba Kembali di Pangkal Pinang', route: 'Jeddah ➔ Jakarta ➔ Pangkal Pinang', activities: ['Tiba di Pangkal Pinang dengan keselamatan dan keberkahan tahun baru hijriyah.'] }
      ],
      schedules: [
        {
          id: 'sch-08b',
          startCity: 'Pangkal Pinang',
          airline: 'Garuda / Saudia',
          departureDate: '2027-06-05',
          returnDate: '2027-06-13',
          duration: 9,
          price: 31700000,
          dp: 5000000,
          availableSeats: 35,
          roomType: 'Quad Room (Grand Al Massa)',
          flightType: 'Start Pangkal Pinang ➔ Garuda / Saudia Direct'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 9. Umrah Liburan Sekolah (9 Hari)
    // -------------------------------------------------------------------------
    {
      id: 'pkg-09',
      title: 'Umrah Liburan Sekolah (9 Hari)',
      category: 'Umroh Liburan Sekolah',
      tags: ['Start Pangkal Pinang', 'Liburan Sekolah', 'Family Umroh', 'Free Thaif', '9 Hari', 'Garuda / Saudia'],
      programSummary: 'Mengisi momen liburan sekolah anak & keluarga dengan ibadah berkesan ke Tanah Suci. Keberangkatan Start Pangkal Pinang Akhir Juni 2027 Program 9 Hari. Maskapai Garuda Indonesia / Saudia Airlines. Hotel Makkah Grand Al Massa & Hotel Madinah Daar El Naeem. Free City Tour Thaif & Pabrik Parfum. Kuota Only 31 Seat. DP Mulai 5 Juta Saja.',
      flyerUrl: 'images/poster-liburan-sekolah.webp',
      thumbnailUrl: 'images/poster-liburan-sekolah.webp',
      activeStatus: 'Aktif',
      createdAt: '2026-08-09T08:00:00.000Z',
      hotelMakkah: 'Grand Al Massa / Setaraf',
      hotelMadinah: 'Daar El Naeem / Setaraf',
      hotelExtra: 'Free City Tour Thaif & Pabrik Parfum Mawar, Edukasi Sejarah Islam Anak',
      itinerary: [
        { day: 1, title: 'Hari 1: Keberangkatan Pangkal Pinang ➔ Jakarta ➔ Madinah', route: 'Pangkal Pinang ➔ Jakarta ➔ Madinah', activities: ['Penerbangan dari Bandara Depati Amir Pangkal Pinang menuju Jakarta, dilanjutkan Garuda / Saudia menuju Madinah. Check-in Daar El Naeem.'] },
        { day: 2, title: 'Hari 2: Ziarah Raudhah & Ibadah Masjid Nabawi', route: 'Madinah Al-Munawwarah', activities: ['Sholat di Masjid Nabawi & Ziarah Raudhah Syarifah dengan tasreh resmi.'] },
        { day: 3, title: 'Hari 3: Ziarah Sejarah Edukatif Madinah', route: 'Madinah Al-Munawwarah', activities: ['Ziarah edukatif Masjid Quba, Jabal Uhud, dan Museum Sejarah Madinah bersama anak-anak.'] },
        { day: 4, title: 'Hari 4: Miqat Bir Ali ➔ Makkah & Pelaksanaan Umrah 1', route: 'Madinah ➔ Makkah', activities: ['Miqat di Bir Ali, perjalanan menuju Makkah, check-in Grand Al Massa, pelaksanaan Umrah 1 sekeluarga.'] },
        { day: 5, title: 'Hari 5: Ibadah Khusyuk di Masjidil Haram', route: 'Makkah Al-Mukarramah', activities: ['Memperbanyak thawaf sunnah dan sholat berjamaah di depan Ka\'bah.'] },
        { day: 6, title: 'Hari 6: Ziarah Makkah & Miqat Umrah 2', route: 'Ziarah Makkah', activities: ['Ziarah Arafah, Muzdalifah, Mina, dan Miqat di Ji\'ranah untuk Umrah ke-2.'] },
        { day: 7, title: 'Hari 7: Free City Tour Thaif & Pabrik Parfum', route: 'Makkah ➔ Thaif', activities: ['Wisata alam pegunungan sejuk Thaif, naik Teleferik gantung, ziarah Masjid Ibnu Abbas, makan Mandhi.'] },
        { day: 8, title: 'Hari 8: Thawaf Wada\' & Transfer Menuju Jeddah', route: 'Makkah ➔ Jeddah', activities: ['Thawaf Wada\' di Masjidil Haram dan transfer menuju Bandara Internasional Jeddah.'] },
        { day: 9, title: 'Hari 9: Tiba Kembali di Pangkal Pinang', route: 'Jeddah ➔ Jakarta ➔ Pangkal Pinang', activities: ['Tiba di Pangkal Pinang dengan kenangan liburan keluarga penuh berkah dan tak terlupakan.'] }
      ],
      schedules: [
        {
          id: 'sch-09b',
          startCity: 'Pangkal Pinang',
          airline: 'Garuda / Saudia',
          departureDate: '2027-06-20',
          returnDate: '2027-06-28',
          duration: 9,
          price: 30900000,
          dp: 5000000,
          availableSeats: 31,
          roomType: 'Quad Room (Grand Al Massa)',
          flightType: 'Start Pangkal Pinang ➔ Garuda / Saudia Direct'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 10. Umrah Liburan Sekolah (12 Hari)
    // -------------------------------------------------------------------------
    {
      id: 'pkg-10',
      title: 'Umrah Liburan Sekolah (12 Hari)',
      category: 'Umroh Liburan Sekolah',
      tags: ['Start Pangkal Pinang', 'Liburan 12 Hari', 'Puas Beribadah', 'Free Thaif', 'Qatar / Etihad'],
      programSummary: 'Durasi lebih panjang 12 hari untuk kepuasan beribadah anak & keluarga di Makkah & Madinah selama liburan sekolah. Keberangkatan Start Pangkal Pinang Akhir Juni 2027 Program 12 Hari. Maskapai bintang 5 Qatar Airways / Etihad Airways. Hotel Makkah Grand Al Massa & Hotel Madinah Daar El Naeem. Free City Tour Thaif & Pabrik Parfum. Kuota Only 35 Seat. DP Mulai 5 Juta Saja.',
      flyerUrl: 'images/poster-liburan-sekolah-akhir-juni.webp',
      thumbnailUrl: 'images/poster-liburan-sekolah-akhir-juni.webp',
      activeStatus: 'Aktif',
      createdAt: '2026-08-10T08:00:00.000Z',
      hotelMakkah: 'Grand Al Massa / Setaraf',
      hotelMadinah: 'Daar El Naeem / Setaraf',
      hotelExtra: 'Free City Tour Thaif & Pabrik Parfum Mawar, Program Long Stay 12 Hari',
      itinerary: [
        { day: 1, title: 'Hari 1: Keberangkatan Pangkal Pinang ➔ Jakarta ➔ Madinah', route: 'Pangkal Pinang ➔ Jakarta ➔ Madinah', activities: ['Penerbangan dari Bandara Depati Amir Pangkal Pinang menuju Jakarta, dilanjutkan maskapai bintang 5 menuju Madinah. Check-in hotel Daar El Naeem.'] },
        { day: 2, title: 'Hari 2: Ziarah Raudhah & Masjid Nabawi', route: 'Madinah Al-Munawwarah', activities: ['Sholat di Masjid Nabawi & Ziarah Raudhah Syarifah dengan tasreh resmi.'] },
        { day: 3, title: 'Hari 3: Ziarah Sejarah Edukatif Madinah', route: 'Madinah Al-Munawwarah', activities: ['Ziarah Masjid Quba, Jabal Uhud, dan Perkebunan Kurma Madinah.'] },
        { day: 4, title: 'Hari 4: Ibadah Tenang & Tadarus di Madinah', route: 'Madinah Al-Munawwarah', activities: ['Memperbanyak shalawat, tadarus Al-Qur\'an, dan sholat di Masjid Nabawi.'] },
        { day: 5, title: 'Hari 5: Miqat Bir Ali ➔ Menuju Makkah & Umrah 1', route: 'Madinah ➔ Makkah', activities: ['Miqat di Bir Ali, perjalanan ke Makkah, check-in Grand Al Massa, pelaksanaan Umrah 1 sekeluarga.'] },
        { day: 6, title: 'Hari 6: Ibadah Khusyuk di Masjidil Haram', route: 'Makkah Al-Mukarramah', activities: ['Thawaf sunnah dan sholat berjamaah di depan Ka\'bah.'] },
        { day: 7, title: 'Hari 7: Ziarah Makkah & Miqat Umrah 2', route: 'Ziarah Makkah', activities: ['Ziarah Arafah, Muzdalifah, Mina, dan Miqat di Ji\'ranah untuk Umrah ke-2.'] },
        { day: 8, title: 'Hari 8: Free City Tour Thaif & Pabrik Parfum', route: 'Makkah ➔ Thaif', activities: ['Wisata pegunungan sejuk Thaif, Teleferik, ziarah Masjid Ibnu Abbas, pabrik parfum, makan Mandhi.'] },
        { day: 9, title: 'Hari 9: Ibadah Mandiri di Masjidil Haram', route: 'Makkah Al-Mukarramah', activities: ['Qiyamul lail dan memperbanyak doa di Multazam & Hijir Ismail.'] },
        { day: 10, title: 'Hari 10: Ziarah Hudaibiyah & Miqat Umrah 3', route: 'Ziarah Hudaibiyah', activities: ['Mengunjungi Museum Al-Haramain dan Miqat Hudaibiyah bagi yang ingin Umrah ke-3.'] },
        { day: 11, title: 'Hari 11: Thawaf Wada\' & Transfer Menuju Jeddah', route: 'Makkah ➔ Jeddah', activities: ['Thawaf Wada\' di Masjidil Haram dan transfer menuju Bandara Internasional Jeddah.'] },
        { day: 12, title: 'Hari 12: Tiba Kembali di Pangkal Pinang', route: 'Jeddah ➔ Jakarta ➔ Pangkal Pinang', activities: ['Tiba kembali di Pangkal Pinang dengan keselamatan dan predikat umrah mabrur.'] }
      ],
      schedules: [
        {
          id: 'sch-10b',
          startCity: 'Pangkal Pinang',
          airline: 'Qatar / Etihad',
          departureDate: '2027-06-20',
          returnDate: '2027-07-01',
          duration: 12,
          price: 33700000,
          dp: 5000000,
          availableSeats: 35,
          roomType: 'Quad Room (Grand Al Massa)',
          flightType: 'Start Pangkal Pinang ➔ Qatar / Etihad Airways'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 11. Umrah Lebih Nyaman Syawal (9 Hari)
    // -------------------------------------------------------------------------
    {
      id: 'pkg-11',
      title: 'Umrah Lebih Nyaman Syawal (9 Hari)',
      category: 'Umroh Syawal',
      tags: ['Start Pangkal Pinang', 'Syawal 1448 H', '9 Hari', 'Garuda / Saudia', 'Grand Al Massa', 'Free Thaif'],
      programSummary: 'Merayakan hari kemenangan dengan ibadah umroh lebih nyaman di Tanah Suci suasana Syawal 1448 H. Keberangkatan Start Pangkal Pinang Maret 2027 Program 9 Hari. Maskapai Garuda Indonesia / Saudia Airlines. Hotel Makkah Grand Al Massa & Hotel Madinah Daar El Naeem. Free City Tour Thaif & Pabrik Parfum Mawar. Kuota Only 35 Seat. DP Mulai 5 Juta Saja.',
      flyerUrl: 'images/poster-umrah-nyaman-syawal.webp',
      thumbnailUrl: 'images/poster-umrah-nyaman-syawal.webp',
      activeStatus: 'Aktif',
      createdAt: '2026-08-11T08:00:00.000Z',
      hotelMakkah: 'Grand Al Massa / Setaraf',
      hotelMadinah: 'Daar El Naeem / Setaraf',
      hotelExtra: 'Free City Tour Thaif & Pabrik Parfum Mawar',
      itinerary: [
        { day: 1, title: 'Hari 1: Keberangkatan Pangkal Pinang ➔ Jakarta ➔ Madinah', route: 'Pangkal Pinang ➔ Jakarta ➔ Madinah', activities: ['Penerbangan dari Bandara Depati Amir Pangkal Pinang menuju Jakarta, dilanjutkan Garuda / Saudia menuju Madinah. Check-in hotel Daar El Naeem.'] },
        { day: 2, title: 'Hari 2: Ziarah Raudhah & Masjid Nabawi', route: 'Madinah Al-Munawwarah', activities: ['Sholat di Masjid Nabawi & Ziarah Raudhah Syarifah dengan tasreh resmi.'] },
        { day: 3, title: 'Hari 3: Ziarah Sejarah Islam Madinah', route: 'Madinah Al-Munawwarah', activities: ['Ziarah Masjid Quba, Jabal Uhud & Makam Syuhada, dan Kebun Kurma Madinah.'] },
        { day: 4, title: 'Hari 4: Miqat Bir Ali ➔ Menuju Makkah & Pelaksanaan Umrah 1', route: 'Madinah ➔ Makkah', activities: ['Miqat di Bir Ali, menuju Makkah, check-in Grand Al Massa, pelaksanaan Umrah 1 suasana Syawal.'] },
        { day: 5, title: 'Hari 5: Ibadah Khusyuk di Masjidil Haram', route: 'Makkah Al-Mukarramah', activities: ['Thawaf sunnah dan memperbanyak amal ibadah di depan Ka\'bah.'] },
        { day: 6, title: 'Hari 6: Ziarah Makkah & Miqat Umrah 2', route: 'Ziarah Makkah', activities: ['Ziarah Arafah, Muzdalifah, Mina, Jabal Rahmah, dan Miqat di Ji\'ranah untuk Umrah ke-2.'] },
        { day: 7, title: 'Hari 7: Free City Tour Thaif & Pabrik Parfum', route: 'Makkah ➔ Thaif', activities: ['Wisata alam pegunungan Thaif, Teleferik, ziarah Masjid Ibnu Abbas, dan kunjungan pabrik parfum mawar.'] },
        { day: 8, title: 'Hari 8: Thawaf Wada\' & Transfer Menuju Bandara Jeddah', route: 'Makkah ➔ Jeddah', activities: ['Thawaf Wada\' di Masjidil Haram dan transfer menuju Bandara Internasional Jeddah.'] },
        { day: 9, title: 'Hari 9: Tiba Kembali di Pangkal Pinang', route: 'Jeddah ➔ Jakarta ➔ Pangkal Pinang', activities: ['Tiba di Pangkal Pinang dengan keselamatan dan keberkahan umrah Syawal.'] }
      ],
      schedules: [
        {
          id: 'sch-11b',
          startCity: 'Pangkal Pinang',
          airline: 'Garuda / Saudia',
          departureDate: '2027-03-20',
          returnDate: '2027-03-28',
          duration: 9,
          price: 31700000,
          dp: 5000000,
          availableSeats: 35,
          roomType: 'Quad Room (Grand Al Massa)',
          flightType: 'Start Pangkal Pinang ➔ Garuda / Saudia Direct'
        }
      ]
    },

    // -------------------------------------------------------------------------
    // 12. Umrah Lebih Nyaman Syawal (12 Hari)
    // -------------------------------------------------------------------------
    {
      id: 'pkg-12',
      title: 'Umrah Lebih Nyaman Syawal (12 Hari)',
      category: 'Umroh Syawal',
      tags: ['Start Pangkal Pinang', 'Syawal 1448 H', '12 Hari', 'Garuda / Saudia', 'Grand Al Massa', 'Free Thaif'],
      programSummary: 'Merayakan hari kemenangan dengan ibadah umroh lebih nyaman di Tanah Suci suasana Syawal 1448 H program long stay 12 hari. Keberangkatan Start Pangkal Pinang Maret 2027 Program 12 Hari. Maskapai Garuda Indonesia / Saudia Airlines. Hotel Makkah Grand Al Massa & Hotel Madinah Daar El Naeem. Free City Tour Thaif & Pabrik Parfum Mawar. Kuota Only 35 Seat. DP Mulai 5 Juta Saja.',
      flyerUrl: 'images/poster-umrah-nyaman-syawal.webp',
      thumbnailUrl: 'images/poster-umrah-nyaman-syawal.webp',
      activeStatus: 'Aktif',
      createdAt: '2026-08-11T08:00:00.000Z',
      hotelMakkah: 'Grand Al Massa / Setaraf',
      hotelMadinah: 'Daar El Naeem / Setaraf',
      hotelExtra: 'Free City Tour Thaif & Pabrik Parfum Mawar, Program Long Stay 12 Hari',
      itinerary: [
        { day: 1, title: 'Hari 1: Keberangkatan Pangkal Pinang ➔ Jakarta ➔ Madinah', route: 'Pangkal Pinang ➔ Jakarta ➔ Madinah', activities: ['Penerbangan dari Bandara Depati Amir Pangkal Pinang menuju Jakarta, dilanjutkan Garuda / Saudia menuju Madinah. Check-in hotel Daar El Naeem.'] },
        { day: 2, title: 'Hari 2: Ziarah Raudhah & Masjid Nabawi', route: 'Madinah Al-Munawwarah', activities: ['Sholat di Masjid Nabawi & Ziarah Raudhah Syarifah dengan tasreh resmi.'] },
        { day: 3, title: 'Hari 3: Ziarah Sejarah Islam Madinah', route: 'Madinah Al-Munawwarah', activities: ['Ziarah Masjid Quba, Jabal Uhud, dan Perkebunan Kurma Madinah.'] },
        { day: 4, title: 'Hari 4: Ibadah Tenang & Sholat Berjamaah di Masjid Nabawi', route: 'Madinah Al-Munawwarah', activities: ['Memperbanyak shalawat, tadarus Al-Qur\'an, dan sholat di Masjid Nabawi.'] },
        { day: 5, title: 'Hari 5: Miqat Bir Ali ➔ Menuju Makkah & Pelaksanaan Umrah 1', route: 'Madinah ➔ Makkah', activities: ['Miqat di Bir Ali, perjalanan ke Makkah, check-in Grand Al Massa, pelaksanaan Umrah 1.'] },
        { day: 6, title: 'Hari 6: Ibadah Khusyuk di Masjidil Haram', route: 'Makkah Al-Mukarramah', activities: ['Thawaf sunnah dan sholat berjamaah di depan Ka\'bah.'] },
        { day: 7, title: 'Hari 7: Ziarah Makkah & Miqat Umrah 2', route: 'Ziarah Makkah', activities: ['Ziarah Arafah, Muzdalifah, Mina, dan Miqat di Ji\'ranah untuk Umrah ke-2.'] },
        { day: 8, title: 'Hari 8: Free City Tour Thaif & Pabrik Parfum', route: 'Makkah ➔ Thaif', activities: ['Wisata alam pegunungan sejuk Thaif, Teleferik, ziarah Masjid Ibnu Abbas, pabrik parfum, makan Mandhi.'] },
        { day: 9, title: 'Hari 9: Ibadah Mandiri di Masjidil Haram', route: 'Makkah Al-Mukarramah', activities: ['Qiyamul lail dan memperbanyak doa di Multazam & Hijir Ismail.'] },
        { day: 10, title: 'Hari 10: Ziarah Hudaibiyah & Miqat Umrah 3', route: 'Ziarah Hudaibiyah', activities: ['Mengunjungi Museum Al-Haramain dan Miqat Hudaibiyah bagi yang ingin Umrah ke-3.'] },
        { day: 11, title: 'Hari 11: Thawaf Wada\' & Transfer Menuju Bandara Jeddah', route: 'Makkah ➔ Jeddah', activities: ['Thawaf Wada\' di Masjidil Haram dan transfer menuju Bandara Internasional Jeddah.'] },
        { day: 12, title: 'Hari 12: Tiba Kembali di Pangkal Pinang', route: 'Jeddah ➔ Jakarta ➔ Pangkal Pinang', activities: ['Tiba kembali di Pangkal Pinang dengan keselamatan dan predikat umrah mabrur.'] }
      ],
      schedules: [
        {
          id: 'sch-12b',
          startCity: 'Pangkal Pinang',
          airline: 'Garuda / Saudia',
          departureDate: '2027-03-16',
          returnDate: '2027-03-27',
          duration: 12,
          price: 34700000,
          dp: 5000000,
          availableSeats: 35,
          roomType: 'Quad Room (Grand Al Massa)',
          flightType: 'Start Pangkal Pinang ➔ Garuda / Saudia Direct'
        }
      ]
    }
  ]
};

// -----------------------------------------------------------------------------
// Sinkron sisa seat otomatis dari sistem El Massa (elmassa-administration).
// Setiap pengunjung membuka katalog, sisa seat jadwal yang dipetakan di bawah
// diambil dari booking asli di sistem — tidak perlu update seat manual lagi.
//
// Cara memetakan: buka sistem > Jadwal Keberangkatan > "Kelola Grup" pada grup
// yang sesuai. ID paketnya ada di alamat halaman: /paket/<ID PAKET>.
// Satu paket sistem boleh dipakai beberapa jadwal (mis. start JKT & PGK);
// keduanya lalu menampilkan sisa kuota yang sama.
//
// Ditaruh di luar DEFAULT_ELMASSA_DATA dengan sengaja: data paket di atas ikut
// tersimpan di localStorage pengunjung, sedangkan konstanta ini selalu terbaca
// versi terbaru setiap kali halaman dibuka.
// -----------------------------------------------------------------------------
const SEAT_SYNC = {
  // Satu domain dengan sistem, jadi cukup path relatif.
  url: '/api/public/seats',
  map: {
    // 'id-jadwal-katalog': 'id-paket-di-sistem',
    // 'sch-03': 'pkg-desember-2026',
  }
};
