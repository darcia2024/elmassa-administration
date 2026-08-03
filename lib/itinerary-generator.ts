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
  departureDateStr: string = "2026-11-03",
  domesticAirline: string = "Garuda Indonesia",
  internationalAirline: string = "Saudia Airline",
  makkahHotel: string = "Grand Al Massa",
  madinahHotel: string = "Daar El Naeem"
): ItineraryDayItem[] {
  const startDate = new Date(departureDateStr.includes("-") ? departureDateStr : "2026-11-03");

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

  // H1: 03 Nov Pangkal Pinang - Jakarta
  itinerary.push({
    day: 1,
    date: getOffsetDate(0),
    title: "H1 03 Nov: Pangkal Pinang (PGK) – Jakarta (CGK)",
    location: "Pangkal Pinang (PGK) → Jakarta (CGK)",
    highlight: "departure",
    activities: [
      { time: "09:00 WIB", description: `Jemaah berkumpul di Bandara Depati Amir Pangkal Pinang (PGK) untuk check-in penerbangan (${domesticAirline})` },
      { time: "12:25 WIB", description: "Take-off penerbangan feeder menuju Jakarta (CGK)" },
      { time: "13:55 WIB", description: "Tiba di Bandara Soekarno-Hatta Jakarta (CGK), istirahat di Lounge Bandara khusus Jemaah El Massa" },
      { time: "19:30 WIB", description: "Pembagian paspor & pengarahan penerbangan internasional ke Arab Saudi" },
    ],
  });

  // H2: 04 Nov Jakarta - Jeddah - Madinah
  itinerary.push({
    day: 2,
    date: getOffsetDate(1),
    title: "H2 04 Nov: Jakarta (CGK) – Jeddah (JED) – Madinah",
    location: "Jakarta (CGK) → Jeddah (JED) → Madinah",
    highlight: "departure",
    activities: [
      { time: "00:40 WIB", description: `Take-off menuju Jeddah menggunakan pesawat ${internationalAirline}` },
      { time: "06:40 LT", description: "Landing di Bandara King Abdulaziz Jeddah (JED). Imigrasi & pengambilan bagasi dipandu handling El Massa" },
      { time: "09:00 LT", description: `Perjalanan bus AC executive menuju Kota Madinah Al-Munawwarah & check-in Hotel (${madinahHotel})` },
      { time: "16:00 LT", description: "Shalat berjamaah di Masjid Nabawi & orientasi seputar area hotel" },
    ],
  });

  // H3: 05 Nov Madinah - Raudhoh
  itinerary.push({
    day: 3,
    date: getOffsetDate(2),
    title: "H3 05 Nov: Madinah – Ziarah Raudhoh & Makam Rasulullah SAW",
    location: "Madinah Al-Munawwarah",
    highlight: "worship",
    activities: [
      { time: "Pagi - Sore", description: "Masuk ke Raudhoh (Taman Surga) bagi jemaah Laki-laki & Perempuan sesuai jadwal Tasreh resmi KSA" },
      { time: "16:00 LT", description: "Ziarah ke Makam Rasulullah SAW, Abu Bakar Ash-Shiddiq, Umar bin Khattab & Pemakaman Baqi" },
      { time: "20:00 LT", description: "Tausiyah pemantapan ibadah Nabawi bersama Ustadz Pembimbing" },
    ],
  });

  // H4: 06 Nov Madinah - Perbanyak Ibadah Shalat Jumat
  itinerary.push({
    day: 4,
    date: getOffsetDate(3),
    title: "H4 06 Nov: Madinah – Perbanyak Ibadah & Shalat Jumat",
    location: "Madinah (Masjid Nabawi)",
    highlight: "worship",
    activities: [
      { time: "09:00 LT", description: "Menuju Masjid Nabawi lebih awal untuk persiapan Shalat Jumat berjamaah di shaf terdepan" },
      { time: "12:15 LT", description: "Pelaksanaan Shalat Jumat di Masjid Nabawi Madinah" },
      { time: "Sore - Malam", description: "Memperbanyak iktikaf, zikir, membaca Al-Qur'an, dan shalat sunnah" },
    ],
  });

  // H5: 07 Nov Madinah - City Tour
  itinerary.push({
    day: 5,
    date: getOffsetDate(4),
    title: "H5 07 Nov: Madinah – City Tour Kota Madinah",
    location: "Madinah & Sekitarnya",
    highlight: "ziarah",
    activities: [
      { time: "07:30 LT", description: "City tour luar kota Madinah: Ziarah Masjid Quba (Masjid Pertama Islam), Jabal Uhud (Makam Syuhada Uhud)" },
      { time: "10:30 LT", description: "Kunjungan ke Kebun Kurma Madinah & Pasar Kurma Khas" },
      { time: "16:00 LT", description: "Pemantapan tata cara Umrah Wajib, niat ihram & latihan tawaf/sa'i di hotel" },
    ],
  });

  // H6: 08 Nov Madinah - Mekkah (Umrah Wajib 1)
  itinerary.push({
    day: 6,
    date: getOffsetDate(5),
    title: "H6 08 Nov: Madinah – Miqat Bir Ali – Mekkah (Umrah Wajib 1)",
    location: "Madinah → Bir Ali → Mekkah",
    highlight: "umrah",
    activities: [
      { time: "09:00 LT", description: "Mandi sunnah ihram & mengenakan pakaian ihram dari Hotel Madinah" },
      { time: "13:00 LT", description: "Singgah di Masjid Bir Ali (Dzulhulaifah) untuk Miqat & Niat Umrah dipandu Muthawwif" },
      { time: "14:00 - 20:00", description: "Perjalanan bus executive ke Makkah Al-Mukarramah sambil melantunkan Talbiyah" },
      { time: "21:00 LT", description: `Check-in Hotel Makkah (${makkahHotel}) & makan malam` },
      { time: "22:30 LT", description: "Melaksanakan Rukun Umrah Wajib (Tawaf, Sa'i, Tahallul) di Masjidil Haram" },
    ],
  });

  // H7: 09 Nov Mekkah - Perbanyak Ibadah
  itinerary.push({
    day: 7,
    date: getOffsetDate(6),
    title: "H7 09 Nov: Mekkah – Perbanyak Ibadah di Masjidil Haram",
    location: "Mekkah Al-Mukarramah",
    highlight: "worship",
    activities: [
      { time: "Seharian", description: "Ibadah mandiri & iktikaf di depan Ka'bah Masjidil Haram: Tawaf Sunnah, membaca Al-Qur'an, shalat khusyuk" },
      { time: "20:00 LT", description: "Kajian rohani malam & evaluasi ibadah jamaah" },
    ],
  });

  // H8: 10 Nov Mekkah City Tour
  itinerary.push({
    day: 8,
    date: getOffsetDate(7),
    title: "H8 10 Nov: Mekkah – City Tour Kota Mekkah",
    location: "Mekkah & Sekitarnya",
    highlight: "ziarah",
    activities: [
      { time: "07:30 LT", description: "City tour kota Makkah: Jabal Tsur, Padang Arafah, Jabal Rahmah, Muzdalifah, Mina, & Jabal Nur" },
      { time: "11:30 LT", description: "Singgah di Masjid Ji'ranah untuk Pengambilan Niat Umrah Ke-2 (Opsional)" },
      { time: "15:00 LT", description: "Pelaksanaan Tawaf & Sa'i Umrah Ke-2 di Masjidil Haram" },
    ],
  });

  // H9: 11 Nov Mekkah Perbanyak Ibadah
  itinerary.push({
    day: 9,
    date: getOffsetDate(8),
    title: "H9 11 Nov: Mekkah – Perbanyak Ibadah di Masjidil Haram",
    location: "Mekkah Al-Mukarramah",
    highlight: "worship",
    activities: [
      { time: "Seharian", description: "Fokus memperbanyak ibadah sunnah, berzikir, berdoa di Multazam & Hijir Ismail (kondisional)" },
      { time: "19:30 LT", description: "Persiapan koper & briefing agenda perjalanan ke Kota Thaif esok hari" },
    ],
  });

  // H10: 12 Nov Mekkah - Tour Thaif
  itinerary.push({
    day: 10,
    date: getOffsetDate(9),
    title: "H10 12 Nov: Mekkah – Tour Kota Thaif (Bonus Spesial)",
    location: "Mekkah → Kota Thaif → Mekkah",
    highlight: "travel",
    activities: [
      { time: "07:30 LT", description: "Perjalanan bus ke Kota Sejuk Thaif melalui pegunungan Al-Hada" },
      { time: "09:30 - 15:30", description: "Ziarah Masjid Abdullah Ibn Abbas, Kebun Mawar & Pabrik Parfum Thaif, Nikmati Kuliner Khas KSA & Kereta Gantung" },
      { time: "17:00 LT", description: "Kembali ke Makkah, singgah di Miqat Qarnul Manazil (Umrah Ke-3 Opsional)" },
    ],
  });

  // H11: 13 Nov Mekkah JED CGK
  itinerary.push({
    day: 11,
    date: getOffsetDate(10),
    title: "H11 13 Nov: Mekkah – Tawaf Wada' – Jeddah (JED) – Jakarta (CGK)",
    location: "Mekkah → Jeddah → CGK",
    highlight: "departure",
    activities: [
      { time: "05:00 LT", description: "Pelaksanaan Tawaf Wada' (Tawaf Perpisahan Ka'bah) di Masjidil Haram bersama Muthawwif" },
      { time: "09:00 LT", description: "Check-out Hotel Makkah & perjalanan bus ke Kota Jeddah" },
      { time: "11:00 LT", description: "City tour Jeddah: Laut Merah, Masjid Terapung Al-Rahmah, Shopping Corniche Al-Balad & Makan Siang Albaik" },
      { time: "17:00 LT", description: `Tiba di Bandara Jeddah (JED), check-in pesawat (${internationalAirline}) & penerimaan Air Zamzam 5L` },
      { time: "20:30 LT", description: "Take-off penerbangan internasional menuju Jakarta (CGK)" },
    ],
  });

  // H12: 14 Nov CGK PGK
  itinerary.push({
    day: 12,
    date: getOffsetDate(11),
    title: "H12 14 Nov: Jakarta (CGK) – Pangkal Pinang (PGK)",
    location: "CGK → Pangkal Pinang (PGK)",
    highlight: "departure",
    activities: [
      { time: "10:30 WIB", description: "Landing di Bandara Soekarno-Hatta Jakarta (CGK)" },
      { time: "14:00 WIB", description: `Take-off penerbangan feeder menuju Pangkal Pinang (${domesticAirline})` },
      { time: "15:20 WIB", description: "Tiba di Bandara Depati Amir Pangkal Pinang (PGK). Seluruh rangkaian ibadah Umrah Spesial November El Massa selesai dengan mabrur" },
    ],
  });

  // If durationDays > 12, pad extra days
  for (let i = 13; i <= durationDays; i++) {
    itinerary.splice(itinerary.length - 1, 0, {
      day: i,
      date: getOffsetDate(i - 1),
      title: `H${i}: Program Tambahan Hari ke-${i}`,
      location: "Mekkah / Madinah",
      highlight: "worship",
      activities: [
        { time: "Seharian", description: "Acara bebas & memperbanyak ibadah sunnah di Tanah Suci" },
      ],
    });
    itinerary[itinerary.length - 1].day = durationDays;
    itinerary[itinerary.length - 1].date = getOffsetDate(durationDays - 1);
  }

  return itinerary;
}
