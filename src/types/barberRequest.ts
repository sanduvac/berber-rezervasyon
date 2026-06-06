import type { BarberService } from "./barber";

export type BarberRequestStatus = "pending" | "approved" | "rejected";

export type BarberRequest = {
  id: string;
  ownerUid: string;
  ownerName: string;
  ownerEmail: string;
  barberName: string;
  locationLabel: string;
  description: string;
  coverImageUrl: string;
  openingTime: string;
  closingTime: string;
  latitude: number;
  longitude: number;
  services: BarberService[];
  status: BarberRequestStatus;
  rejectionReason?: string;
  /** Sahip sonucu görünce true olur, bir daha gösterilmez */
  seen?: boolean;
  createdAt: number;
  reviewedAt?: number;
};
