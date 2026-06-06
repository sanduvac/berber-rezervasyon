import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  orderBy,
  getDocs,
  type Unsubscribe
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { createBarberDocument } from "./barberService";
import { updateUserDocument } from "./firestoreService";
import { createAvailability } from "./adminService";
import type { Barber } from "../types/barber";
import type { BarberRequest } from "../types/barberRequest";

const COLLECTION = "barberRequests";

/**
 * Berber sahibi yeni berber başvurusu oluşturur.
 */
export async function submitBarberRequest(
  data: Omit<BarberRequest, "id" | "status" | "createdAt" | "reviewedAt" | "seen">
): Promise<string> {
  const requestsRef = collection(db, COLLECTION);
  const docRef = await addDoc(requestsRef, {
    ...data,
    status: "pending",
    seen: false,
    createdAt: Date.now()
  });
  return docRef.id;
}

/**
 * Admin — tüm talepleri gerçek zamanlı dinler.
 */
export function subscribeToAllBarberRequests(
  callback: (requests: BarberRequest[]) => void
): Unsubscribe {
  const requestsRef = collection(db, COLLECTION);
  const q = query(requestsRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as BarberRequest[];
    callback(requests);
  });
}

/**
 * Admin — talebi onaylar. Berber dokümanı oluşturulur, talep approved olur.
 */
export async function approveBarberRequest(request: BarberRequest): Promise<string> {
  // Berber dokümanı oluştur
  const barberData: Omit<Barber, "id"> = {
    ownerUid: request.ownerUid,
    ownerName: request.ownerName,
    ownerEmail: request.ownerEmail,
    name: request.barberName,
    coverImageUrl: request.coverImageUrl,
    locationLabel: request.locationLabel,
    coordinates: {
      latitude: request.latitude,
      longitude: request.longitude
    },
    distanceKm: 0,
    openingTime: request.openingTime,
    closingTime: request.closingTime,
    rating: 0,
    reviewCount: 0,
    description: request.description,
    services: request.services,
    availability: createAvailability(request.openingTime, request.closingTime),
    reviews: []
  };

  const barberId = await createBarberDocument(barberData);

  // Sahip user dokümanında ownedBarberIds güncelle
  await updateUserDocument(request.ownerUid, {
    ownedBarberIds: [barberId]
  });

  // Talebi approved olarak güncelle
  const requestRef = doc(db, COLLECTION, request.id);
  await updateDoc(requestRef, {
    status: "approved",
    seen: false,
    reviewedAt: Date.now()
  });

  return barberId;
}

/**
 * Admin — talebi reddeder. Sebep zorunludur.
 */
export async function rejectBarberRequest(
  requestId: string,
  reason: string
): Promise<void> {
  const requestRef = doc(db, COLLECTION, requestId);
  await updateDoc(requestRef, {
    status: "rejected",
    rejectionReason: reason,
    seen: false,
    reviewedAt: Date.now()
  });
}

/**
 * Berber sahibi — kendi taleplerini gerçek zamanlı dinler.
 */
export function subscribeToOwnerRequests(
  ownerUid: string,
  callback: (requests: BarberRequest[]) => void
): Unsubscribe {
  const requestsRef = collection(db, COLLECTION);
  const q = query(
    requestsRef,
    where("ownerUid", "==", ownerUid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const requests = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as BarberRequest[];
    callback(requests);
  });
}

/**
 * Berber sahibi sonucu gördükten sonra bir daha gösterme.
 */
export async function markRequestAsSeen(requestId: string): Promise<void> {
  const requestRef = doc(db, COLLECTION, requestId);
  await updateDoc(requestRef, { seen: true });
}
