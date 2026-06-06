export type AppointmentStatus = "upcoming" | "completed" | "cancelled";

export type Appointment = {
  id: string;
  customerUid?: string;
  customerName?: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  createdAt: number;
  reminderNotificationIds?: string[];
  status?: AppointmentStatus;
};
