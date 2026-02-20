export type Appointment = {
  id: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  createdAt: number;
  reminderNotificationIds?: string[];
};
