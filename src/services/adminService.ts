import { initializeApp, getApp, getApps } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, signOut, updateProfile } from "firebase/auth";
import { createBarberDocument } from "./barberService";
import { deleteBarberDocument } from "./barberService";
import { createUserDocument, deleteUserDocument } from "./firestoreService";
import { firebaseConfig } from "./firebaseConfig";
import type { Barber, BarberAvailabilityDay, BarberService } from "../types/barber";

const SECONDARY_APP_NAME = "ownerCreationApp";

export type CreateBarberWithOwnerParams = {
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  barberName: string;
  locationLabel: string;
  description: string;
  coverImageUrl: string;
  openingTime: string;
  closingTime: string;
  latitude: number;
  longitude: number;
  services: BarberService[];
};

function getOwnerCreationAuth() {
  const secondaryApp = getApps().some((app) => app.name === SECONDARY_APP_NAME)
    ? getApp(SECONDARY_APP_NAME)
    : initializeApp(firebaseConfig, SECONDARY_APP_NAME);

  return getAuth(secondaryApp);
}

export function createAvailability(openingTime: string, closingTime: string): BarberAvailabilityDay[] {
  const [openingHour, openingMinute] = openingTime.split(":").map(Number);
  const [closingHour, closingMinute] = closingTime.split(":").map(Number);
  const startMinutes = openingHour * 60 + openingMinute;
  const endMinutes = closingHour * 60 + closingMinute;
  const safeStartMinutes = Number.isFinite(startMinutes) ? startMinutes : 9 * 60;
  const safeEndMinutes = Number.isFinite(endMinutes) && endMinutes > safeStartMinutes ? endMinutes : 18 * 60;

  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    const dateKey = date.toISOString().split("T")[0];
    const slots = [];

    for (let minute = safeStartMinutes; minute < safeEndMinutes; minute += 30) {
      const hourText = String(Math.floor(minute / 60)).padStart(2, "0");
      const minuteText = String(minute % 60).padStart(2, "0");
      slots.push({
        time: `${hourText}:${minuteText}`,
        isBooked: false
      });
    }

    return {
      date: dateKey,
      slots
    };
  });
}

export async function createBarberWithOwner(params: CreateBarberWithOwnerParams): Promise<{
  barberId: string;
  ownerUid: string;
}> {
  const ownerAuth = getOwnerCreationAuth();
  await signOut(ownerAuth).catch(() => undefined);

  const ownerCredential = await createUserWithEmailAndPassword(
    ownerAuth,
    params.ownerEmail,
    params.ownerPassword
  );

  await updateProfile(ownerCredential.user, { displayName: params.ownerName });

  const barberData: Omit<Barber, "id"> = {
    ownerUid: ownerCredential.user.uid,
    ownerName: params.ownerName,
    ownerEmail: params.ownerEmail,
    name: params.barberName,
    coverImageUrl: params.coverImageUrl,
    locationLabel: params.locationLabel,
    coordinates: {
      latitude: params.latitude,
      longitude: params.longitude
    },
    distanceKm: 0,
    openingTime: params.openingTime,
    closingTime: params.closingTime,
    rating: 0,
    reviewCount: 0,
    description: params.description,
    services: params.services,
    availability: createAvailability(params.openingTime, params.closingTime),
    reviews: []
  };

  const barberId = await createBarberDocument(barberData);

  await createUserDocument(ownerCredential.user.uid, params.ownerName, params.ownerEmail, {
    role: "barber",
    ownedBarberIds: [barberId]
  });

  await signOut(ownerAuth).catch(() => undefined);

  return {
    barberId,
    ownerUid: ownerCredential.user.uid
  };
}

export async function deleteBarberAndOwner(barberId: string, ownerUid: string): Promise<void> {
  await deleteBarberDocument(barberId);
  await deleteUserDocument(ownerUid);
}
