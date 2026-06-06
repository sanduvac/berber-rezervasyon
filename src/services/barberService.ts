import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  type Unsubscribe
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import type { Barber } from "../types/barber";

export function subscribeToBarbers(callback: (barbers: Barber[]) => void): Unsubscribe {
  const barbersRef = collection(db, "barbers");

  return onSnapshot(barbersRef, (snapshot) => {
    const barbers = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }) as Barber)
      .sort((first, second) => first.name.localeCompare(second.name, "tr"));

    callback(barbers);
  });
}

export async function createBarberDocument(
  barber: Omit<Barber, "id">
): Promise<string> {
  const barbersRef = collection(db, "barbers");
  const docRef = await addDoc(barbersRef, barber);
  return docRef.id;
}

export async function updateBarberDocument(
  barberId: string,
  data: Partial<Omit<Barber, "id">>
): Promise<void> {
  const barberRef = doc(db, "barbers", barberId);
  await updateDoc(barberRef, data);
}

export async function deleteBarberDocument(barberId: string): Promise<void> {
  const barberRef = doc(db, "barbers", barberId);
  await deleteDoc(barberRef);
}
