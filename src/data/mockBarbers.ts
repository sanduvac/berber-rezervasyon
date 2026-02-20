import { Barber, BarberAvailabilityDay } from "../types/barber";

const APPOINTMENT_TIMES = ["16:30", "17:00", "17:30", "18:00", "18:30", "19:00"];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createAvailability(bookedByDayOffset: Record<number, string[]>): BarberAvailabilityDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, dayOffset) => {
    const currentDay = new Date(today);
    currentDay.setDate(currentDay.getDate() + dayOffset);

    const bookedTimes = bookedByDayOffset[dayOffset] ?? [];

    return {
      date: toDateKey(currentDay),
      slots: APPOINTMENT_TIMES.map((time) => ({
        time,
        isBooked: bookedTimes.includes(time)
      }))
    };
  });
}

export const mockBarbers: Barber[] = [
  {
    id: "1",
    name: "Klasik Kesim Berber",
    coverImageUrl:
      "https://images.unsplash.com/photo-1519500528352-2d1460418d41?auto=format&fit=crop&w=1200&q=80",
    locationLabel: "Kadıköy / İstanbul",
    coordinates: { latitude: 40.9908, longitude: 29.0280 },
    distanceKm: 1.4,
    openingTime: "09:00",
    closingTime: "22:00",
    rating: 4.8,
    reviewCount: 132,
    description: "Sakin ortamda klasik ve modern saç kesimi hizmeti.",
    services: [
      { id: "s1", name: "Saç Kesimi", price: 350 },
      { id: "s2", name: "Sakal Düzenleme", price: 220 },
      { id: "s3", name: "Çocuk Kesimi", price: 260 }
    ],
    availability: createAvailability({
      0: ["16:30", "17:30"],
      1: ["17:00", "18:30"],
      2: ["18:00"],
      4: ["16:30", "17:00", "17:30"]
    }),
    reviews: [
      {
        id: "r1",
        userName: "Mert",
        rating: 5,
        comment: "Hızlı ve temiz iş çıkardılar.",
        date: "2026-01-25"
      },
      {
        id: "r2",
        userName: "Can",
        rating: 4,
        comment: "Randevu saati tam uydu.",
        date: "2026-02-02"
      }
    ]
  },
  {
    id: "2",
    name: "Usta Makas",
    coverImageUrl:
      "https://images.unsplash.com/photo-1508057198894-247b23fe5ade?auto=format&fit=crop&w=1200&q=80",
    locationLabel: "Beşiktaş / İstanbul",
    coordinates: { latitude: 41.0432, longitude: 29.0073 },
    distanceKm: 3.1,
    openingTime: "10:00",
    closingTime: "23:00",
    rating: 4.6,
    reviewCount: 88,
    description: "Fade, sakal tasarımı ve özel gün bakım paketleri.",
    services: [
      { id: "s4", name: "Skin Fade", price: 420 },
      { id: "s5", name: "Sakal Tasarımı", price: 250 },
      { id: "s6", name: "Saç ve Yıkama", price: 480 }
    ],
    availability: createAvailability({
      0: ["17:00", "17:30", "18:00"],
      1: ["16:30"],
      3: ["18:30", "19:00"],
      5: ["17:00", "18:00"]
    }),
    reviews: [
      {
        id: "r3",
        userName: "Emir",
        rating: 5,
        comment: "Ustalık seviyesi çok iyi.",
        date: "2026-01-30"
      }
    ]
  },
  {
    id: "3",
    name: "Mahalle Berberi",
    coverImageUrl:
      "https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=1200&q=80",
    locationLabel: "Şişli / İstanbul",
    coordinates: { latitude: 41.0604, longitude: 28.9874 },
    distanceKm: 0.9,
    openingTime: "08:30",
    closingTime: "21:00",
    rating: 4.3,
    reviewCount: 41,
    description: "Ekonomik fiyatlarla güvenilir mahalle berberi.",
    services: [
      { id: "s7", name: "Saç Kesimi", price: 280 },
      { id: "s8", name: "Sakal Tıraşı", price: 170 }
    ],
    availability: createAvailability({
      0: ["18:00", "18:30"],
      2: ["16:30", "17:00"],
      3: ["17:30", "18:00", "18:30"],
      6: ["17:00"]
    }),
    reviews: [
      {
        id: "r4",
        userName: "Yigit",
        rating: 4,
        comment: "Fiyat performans olarak başarılı.",
        date: "2026-02-03"
      }
    ]
  }
];
