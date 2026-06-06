import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  type Unsubscribe
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { Appointment } from "../types/appointment";
import { NotificationSettings, PrivacySettings, UserRole } from "../types/settings";

// ---- Kullanıcı Dökümanı ----

export type UserDocument = {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  gender: string;
  role: UserRole;
  ownedBarberIds?: string[];
  profilePhotoUri: string | null;
  favoriteBarberIds: string[];
  notificationSettings: NotificationSettings;
  privacySettings: PrivacySettings;
  createdAt: number;
};

const DEFAULT_USER_DOC: Omit<UserDocument, "name" | "email" | "createdAt" | "role"> = {
  phone: "",
  birthday: "",
  gender: "",
  profilePhotoUri: null,
  ownedBarberIds: [],
  favoriteBarberIds: [],
  notificationSettings: {
    allNotifications: true,
    appointmentReminders: true,
    systemNotifications: true
  },
  privacySettings: {
    biometricLogin: false,
    twoFactorAuth: false,
    locationSharing: true,
    analyticsData: true
  }
};

export async function createUserDocument(
  uid: string,
  name: string,
  email: string,
  options?: {
    role?: UserRole;
    ownedBarberIds?: string[];
  }
): Promise<void> {
  const userRef = doc(db, "users", uid);
  const userData: UserDocument = {
    ...DEFAULT_USER_DOC,
    name,
    email,
    role: options?.role ?? "customer",
    ownedBarberIds: options?.ownedBarberIds ?? DEFAULT_USER_DOC.ownedBarberIds,
    createdAt: Date.now()
  };
  await setDoc(userRef, userData);
}

export async function getUserDocument(uid: string): Promise<UserDocument | null> {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return null;
  return snapshot.data() as UserDocument;
}

export async function updateUserDocument(
  uid: string,
  data: Partial<UserDocument>
): Promise<void> {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, data);
}

export async function deleteUserDocument(uid: string): Promise<void> {
  const userRef = doc(db, "users", uid);
  await deleteDoc(userRef);
}

// ---- Randevular ----

export type FirestoreAppointment = Omit<Appointment, "id"> & {
  reminderNotificationIds?: string[];
};

export async function addAppointment(
  uid: string,
  appointment: FirestoreAppointment
): Promise<string> {
  const appointmentsRef = collection(db, "users", uid, "appointments");
  const docRef = await addDoc(appointmentsRef, appointment);
  return docRef.id;
}

export async function deleteAppointment(
  uid: string,
  appointmentId: string
): Promise<void> {
  const appointmentRef = doc(db, "users", uid, "appointments", appointmentId);
  await deleteDoc(appointmentRef);
}

export async function updateAppointment(
  uid: string,
  appointmentId: string,
  data: Partial<Appointment>
): Promise<void> {
  const appointmentRef = doc(db, "users", uid, "appointments", appointmentId);
  await updateDoc(appointmentRef, data);
}

export async function getAppointments(uid: string): Promise<Appointment[]> {
  const appointmentsRef = collection(db, "users", uid, "appointments");
  const q = query(appointmentsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as Appointment[];
}

export function subscribeToAppointments(
  uid: string,
  callback: (appointments: Appointment[]) => void
): Unsubscribe {
  const appointmentsRef = collection(db, "users", uid, "appointments");
  const q = query(appointmentsRef, orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data()
    })) as Appointment[];
    callback(appointments);
  });
}

export async function addBarberAppointment(
  appointment: FirestoreAppointment
): Promise<string> {
  const appointmentsRef = collection(db, "appointments");
  const docRef = await addDoc(appointmentsRef, appointment);
  return docRef.id;
}

export function subscribeToBarberAppointments(
  barberId: string,
  callback: (appointments: Appointment[]) => void
): Unsubscribe {
  const appointmentsRef = collection(db, "appointments");
  const q = query(appointmentsRef, where("barberId", "==", barberId));

  return onSnapshot(q, (snapshot) => {
    const appointments = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }) as Appointment)
      .sort((first, second) => second.createdAt - first.createdAt);

    callback(appointments);
  });
}

// ---- Değerlendirmeler ----

export type FirestoreReview = {
  barberId: string;
  appointmentId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: number;
};

export async function addReview(
  uid: string,
  review: FirestoreReview
): Promise<string> {
  const reviewsRef = collection(db, "users", uid, "reviews");
  const docRef = await addDoc(reviewsRef, review);
  return docRef.id;
}

export async function getReviews(uid: string): Promise<(FirestoreReview & { id: string })[]> {
  const reviewsRef = collection(db, "users", uid, "reviews");
  const q = query(reviewsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as (FirestoreReview & { id: string })[];
}
