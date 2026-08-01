export interface ActivityItem {
  time?: string;
  description: string;
}

export interface ItineraryDayItem {
  day: number;
  date?: string;
  title: string;
  location: string;
  highlight: "departure" | "worship" | "ziarah" | "umrah" | "travel";
  activities: ActivityItem[];
}

export function generateDefaultItinerary(
  durationDays: number = 12,
  departureDateStr: string = "2026-10-14",
  domesticAirline: string = "Garuda Indonesia",
  internationalAirline: string = "Saudia Airline",
  makkahHotel: string = "Grand Al Massa",
  madinahHotel: string = "Daar El Naeem"
): ItineraryDayItem[] {
  const startDate = new Date(departureDateStr);
  
  const formatDate = (dateObj: Date) => {
    try {
      const day = dateObj.getDate().toString().padStart(2, "0");
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const month = months[dateObj.getMonth()];
      const year = dateObj.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return "";
    }
  };

  const getOffsetDate = (offset: number) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + offset);
    return formatDate(d);
  };

  const itinerary: ItineraryDayItem[] = [];

  // Day 1: PGK -> CGK -> JED
  itinerary.push({
    day: 1,
    date: getOffsetDate(0),
    title: "Pangkal Pinang (PGK) – Jakarta (CGK) – Saudi",
    location: "PGK → CGK → JED/MED",
    highlight: "departure",
    activities: [
      { time: "09:00 WIB", description: `Jemaah berkumpul di Bandara Depati Amir, Pangkal Pinang (PGK) untuk persiapan check-in (${domesticAirline})` },
      { time: "12:25 WIB", description: `Take-off penerbangan feeder dari PGK menuju Jakarta (CGK)` },
      { time: "13:55 WIB", description: "Tiba di Bandara Soekarno-Hatta (CGK). Istirahat di Lounge Bandara khusus Jemaah El Massa" },
      { time: "19:30 WIB", description: `Berkumpul di Terminal 3 Internasional CGK untuk persiapan penerbangan utama (${internationalAirline})` },
    ],
  });

  // Day 2: Landing Saudi & Madinah Check-in
  itinerary.push({
    day: 2,
    date: getOffsetDate(1),
    title: "Landing Jeddah / Madinah – Check-in Hotel",
    location: "Jeddah / Madinah",
    highlight: "departure",
    activities: [
      { time: "00:40 WIB", description: `Take-off menuju Saudi Arabia menggunakan pesawat ${internationalAirline}` },
      { time: "06:40 LT", description: "Landing di Bandara Saudi. Proses imigrasi & pengambilan bagasi dibantu handling El Massa" },
      { time: "09:00 LT", description: `Perjalanan bus AC menuju Hotel Madinah (${madinahHotel}). Check-in & istirahat` },
      { time: "16:00 LT", description: "Shalat berjamaah di Masjid Nabawi & pengenalan area sekitar masjid" },
    ],
  });

  // Day 3: Madinah - Rawdhah & Ziarah Dalam
  itinerary.push({
    day: 3,
    date: getOffsetDate(2),
    title: "Madinah – Ziarah Rawdhah & Raudhah Jemaah",
    location: "Madinah Al-Munawwarah",
    highlight: "worship",
    activities: [
      { time: "Subuh - 11:00", description: "Ziarah Rawdhah Jemaah Perempuan & Laki-laki sesuai jadwal Tasreh resmi KSA" },
      { time: "11:00 - Isya", description: "Ziarah ke Makam Rasulullah SAW, Abu Bakar Ash-Shiddiq, Umar bin Khattab & Pemakaman Baqi" },
      { time: "19:30 LT", description: "Tausiyah pemantapan ibadah & pembekalan Ziarah Luar Madinah" },
    ],
  });

  // Day 4: Tour Sejarah Madinah (Masjid Quba & Uhud)
  itinerary.push({
    day: 4,
    date: getOffsetDate(3),
    title: "Tour Sejarah Kota Madinah",
    location: "Madinah & Sekitarnya",
    highlight: "ziarah",
    activities: [
      { time: "08:00 - 12:00", description: "Ziarah luar: Masjid Quba (Masjid pertama Islam), Jabal Uhud (Makam Syuhada Uhud), Kebun Kurma Madinah" },
      { time: "12:00 - 15:00", description: "Shalat Dhuhur & makan siang di hotel" },
      { time: "16:00 - 21:00", description: "Memperbanyak ibadah di Masjid Nabawi & iktikaf" },
    ],
  });

  // Day 5: City Tour Madinah 2 & Manasik Umrah
  itinerary.push({
    day: 5,
    date: getOffsetDate(4),
    title: "City Tour Madinah 2 & Pemantapan Manasik",
    location: "Madinah Al-Munawwarah",
    highlight: "ziarah",
    activities: [
      { time: "08:00 - 11:30", description: "Kunjungan ke Percetakan Al-Qur'an Malik Fahd & Jabal Magnet (opsional)" },
      { time: "16:00 - 18:00", description: "Pemantapan tata cara Niat, Ihram, Tawaf & Sa'i dibimbing Muthawwif" },
      { time: "20:00 LT", description: "Persiapan koper & barang bawaan untuk keberangkatan ke Makkah esok hari" },
    ],
  });

  // Day 6: Madinah ke Makkah (Miqat Bir Ali & Umrah Wajib 1)
  itinerary.push({
    day: 6,
    date: getOffsetDate(5),
    title: "Madinah – Miqat Bir Ali – Makkah (Umrah Wajib 1)",
    location: "Madinah → Bir Ali → Makkah",
    highlight: "umrah",
    activities: [
      { time: "09:00 LT", description: "Check-out hotel Madinah, mandi sunnah ihram & mengenakan pakaian ihram dari hotel" },
      { time: "13:00 LT", description: "Singgah di Masjid Bir Ali (Dzulhulaifah) untuk Miqat & Pengambilan Niat Umrah dipandu Muthawwif" },
      { time: "14:00 - 20:00", description: "Perjalanan Bus AC menuju Makkah sambil memperbanyak Talbiyah" },
      { time: "21:00 LT", description: `Check-in Hotel Makkah (${makkahHotel}) & makan malam` },
      { time: "22:30 LT", description: "Melaksanakan Rukun Umrah Wajib (Tawaf, Sa'i, Tahallul) di Masjidil Haram" },
    ],
  });

  // Day 7: Ibadah di Masjidil Haram & Istirahat
  itinerary.push({
    day: 7,
    date: getOffsetDate(6),
    title: "Memperbanyak Ibadah di Masjidil Haram",
    location: "Makkah Al-Mukarramah",
    highlight: "worship",
    activities: [
      { time: "Seharian", description: "Ibadah mandiri & iktikaf di Masjidil Haram: Shalat berjamaah, Tawaf Sunnah, membaca Al-Qur'an" },
      { time: "20:00 LT", description: "Kajian rohani malam & evaluasi ibadah jamaah bersama Tour Leader" },
    ],
  });

  // Day 8: Ziarah Sejarah Makkah & Umrah 2 (Ji'ranah)
  itinerary.push({
    day: 8,
    date: getOffsetDate(7),
    title: "Ziarah Kota Makkah & Umrah Ke-2 (Miqat Ji'ranah)",
    location: "Makkah & Sekitarnya",
    highlight: "ziarah",
    activities: [
      { time: "08:00 - 12:00", description: "Ziarah sejarah Makkah: Jabal Tsur, Padang Arafah, Jabal Rahmah, Muzdalifah, Mina, Jabal Nur" },
      { time: "12:00 LT", description: "Singgah di Masjid Ji'ranah untuk mengambil Niat Umrah Ke-2 (Opsional)" },
      { time: "15:00 LT", description: "Pelaksanaan Umrah Ke-2 di Masjidil Haram bagi yang mengambil Miqat" },
    ],
  });

  // Day 9: City Tour Kota Thaif (Bonus Gratis!)
  itinerary.push({
    day: 9,
    date: getOffsetDate(8),
    title: "City Tour Kota Thaif (Bonus Special El Massa)",
    location: "Makkah → Kota Thaif → Makkah",
    highlight: "travel",
    activities: [
      { time: "08:00 LT", description: "Berangkat ke Kota Sejuk Thaif menggunakan Bus AC Pariwisata" },
      { time: "10:00 - 16:00", description: "Ziarah Masjid Abdullah Ibn Abbas, Masjid Addas, Kebun Mawar & Pabrik Parfum Thaif, Kuliner Khas KSA" },
      { time: "17:00 LT", description: "Kembali ke Makkah & singgah Miqat di Qarnul Manazil (Umrah Ke-3 Opsional)" },
    ],
  });

  // Day 10: Agenda Bebas & Tawaf Sunnah
  itinerary.push({
    day: 10,
    date: getOffsetDate(9),
    title: "Agenda Bebas Makkah & Kuliner KSA",
    location: "Makkah Al-Mukarramah",
    highlight: "worship",
    activities: [
      { time: "Seharian", description: "Agenda bebas: Memperbanyak ibadah di Ka'bah, berbelanja oleh-oleh di Zamzam Tower & Pasar Kakiyah" },
      { time: "20:00 LT", description: "Persiapan koper utama dipacking rapi untuk penimbangan bagasi" },
    ],
  });

  // Day 11: Tawaf Wada' & Check-out menuju Jeddah
  itinerary.push({
    day: 11,
    date: getOffsetDate(10),
    title: "Tawaf Wada' (Pamitan Ka'bah) – City Tour Jeddah",
    location: "Makkah → Jeddah",
    highlight: "departure",
    activities: [
      { time: "05:00 LT", description: "Melaksanakan Tawaf Wada' (Tawaf Perpisahan) di Masjidil Haram bersama Muthawwif" },
      { time: "09:00 LT", description: "Check-out dari Hotel Makkah, perjalanan bus menuju Kota Jeddah" },
      { time: "11:00 - 15:00", description: "City tour Jeddah: Laut Merah, Masjid Terapung Al-Rahmah, Shopping Corniche Al-Balad & Makan Siang Albaik" },
      { time: "17:00 LT", description: "Tiba di Bandara Jeddah (JED), proses check-in & pembagian Air Zamzam 5L per jemaah" },
    ],
  });

  // Day 12: Flight Return to Jakarta & Pangkal Pinang (PGK)
  itinerary.push({
    day: 12,
    date: getOffsetDate(11),
    title: "Terbang Kembali ke Jakarta (CGK) & Pangkal Pinang (PGK)",
    location: "Jeddah → CGK → PGK",
    highlight: "departure",
    activities: [
      { time: "20:30 LT", description: `Take-off penerbangan internasional kembali ke Indonesia (${internationalAirline})` },
      { time: "10:30 WIB", description: "Landing di Bandara Soekarno-Hatta Jakarta (CGK)" },
      { time: "14:00 WIB", description: `Take-off penerbangan feeder menuju Bandara Depati Amir, Pangkal Pinang (${domesticAirline})` },
      { time: "15:20 WIB", description: "Tiba di Pangkal Pinang (PGK). Seluruh rangkaian ibadah Umrah Spesial El Massa selesai dengan selamat & mabrur" },
    ],
  });

  // If durationDays > 12, pad extra worship/free days seamlessly
  for (let i = 13; i <= durationDays; i++) {
    itinerary.splice(itinerary.length - 1, 0, {
      day: i,
      date: getOffsetDate(i - 1),
      title: `Program Tambahan Hari ke-${i}: Memperbanyak Ibadah`,
      location: "Makkah / Madinah",
      highlight: "worship",
      activities: [
        { time: "Seharian", description: "Acara bebas & memperbanyak ibadah sunnah, zikir, dan iktikaf" },
      ],
    });
    itinerary[itinerary.length - 1].day = durationDays;
    itinerary[itinerary.length - 1].date = getOffsetDate(durationDays - 1);
  }

  return itinerary;
}
