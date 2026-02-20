export type BarberService = {
  id: string;
  name: string;
  price: number;
};

export type BarberReview = {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
};

export type BarberAvailabilitySlot = {
  time: string;
  isBooked: boolean;
};

export type BarberAvailabilityDay = {
  date: string;
  slots: BarberAvailabilitySlot[];
};

export type BarberCoordinates = {
  latitude: number;
  longitude: number;
};

export type Barber = {
  id: string;
  name: string;
  coverImageUrl: string;
  locationLabel: string;
  coordinates: BarberCoordinates;
  distanceKm: number;
  openingTime: string;
  closingTime: string;
  rating: number;
  reviewCount: number;
  description: string;
  services: BarberService[];
  availability: BarberAvailabilityDay[];
  reviews: BarberReview[];
};
